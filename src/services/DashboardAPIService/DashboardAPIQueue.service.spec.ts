import {
  APIErrorCode,
  type APIResponse,
  APIService,
  type ProjectDashboardOptions,
  type ProjectDashboardOutput
} from '@aneuhold/core-ts-api-lib';
import { DashboardTaskSchema, DocumentService } from '@aneuhold/core-ts-db-lib';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  type MockInstance,
  vi
} from 'vitest';
import apiActivityService, { ApiActivityState } from '$services/ApiActivity.service.svelte';
import MockAPIBackend from '$testUtils/MockAPIBackend';
import LocalData from '$util/LocalData/LocalData';
import dashboardAPIQueueService from './DashboardAPIQueue.service';

describe('Unit Tests', () => {
  describe('DashboardAPIQueueService', () => {
    const fullTaskGet: ProjectDashboardOptions = { get: { tasks: true } };
    const userConfigGet: ProjectDashboardOptions['get'] = { userConfig: true };
    let apiBackend: MockAPIBackend;
    let onGetOutput: Mock<(...args: unknown[]) => void>;
    let consoleErrorSpy: MockInstance<typeof console.error>;

    /**
     * Creates a write that deletes a random task.
     */
    const createDeleteTaskRequest = (): ProjectDashboardOptions => ({
      delete: { tasks: [DocumentService.generateID()] }
    });

    beforeEach(() => {
      apiBackend = new MockAPIBackend();
      APIService.setBackend(apiBackend);
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      // Takes the full backoff delay, so delays are exact
      vi.spyOn(Math, 'random').mockReturnValue(1);
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      LocalData.accessToken = 'access-token';
      onGetOutput = vi.fn();
      dashboardAPIQueueService.setGetOutputHandler(onGetOutput);
    });

    afterEach(() => {
      dashboardAPIQueueService.reset();
      apiActivityService.setIdle();
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    describe('skipWaitsAndProcessRequestsNow', () => {
      describe('when the request is rejected', () => {
        it('is Pending and sends the item on the next attempt', async () => {
          const first = createDeleteTaskRequest();
          const second = createDeleteTaskRequest();
          apiBackend.queueDashboardApiResponses(
            MockAPIBackend.createDashboardApiSuccessResponse(),
            new Error('Network error')
          );

          dashboardAPIQueueService.enqueueRequest(first);
          dashboardAPIQueueService.enqueueRequest(second);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiActivityService.state).toBe(ApiActivityState.Pending);

          await vi.advanceTimersByTimeAsync(1000);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([first, second, second]);
          expect(apiActivityService.state).toBe(ApiActivityState.Success);
        });

        it('keeps the item in storage', async () => {
          const write = createDeleteTaskRequest();
          apiBackend.queueDashboardApiResponses(new Error('Network error'));

          dashboardAPIQueueService.enqueueRequest(write);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(LocalData.apiRequestQueue).toEqual([write]);
        });
      });

      describe('when the device is offline', () => {
        it('is Offline and sends nothing until called again online', async () => {
          const onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
          const write = createDeleteTaskRequest();

          dashboardAPIQueueService.enqueueRequest(write);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          await vi.advanceTimersByTimeAsync(120_000);
          expect(apiActivityService.state).toBe(ApiActivityState.Offline);
          expect(apiBackend.sentDashboardApiRequests).toHaveLength(0);

          onLineSpy.mockReturnValue(true);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([write]);
        });

        it('stops retrying a rejected request', async () => {
          const onLineSpy = vi.spyOn(navigator, 'onLine', 'get');
          apiBackend.queueDashboardApiResponses(new Error('Network error'));

          dashboardAPIQueueService.enqueueRequest(createDeleteTaskRequest());
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          onLineSpy.mockReturnValue(false);
          await vi.advanceTimersByTimeAsync(120_000);

          expect(apiBackend.sentDashboardApiRequests).toHaveLength(1);
          expect(apiActivityService.state).toBe(ApiActivityState.Offline);
        });
      });

      describe('backoff', () => {
        it('grows, is capped, and resets after a success', async () => {
          const networkErrors = Array.from({ length: 7 }, () => new Error('Network error'));
          apiBackend.queueDashboardApiResponses(
            ...networkErrors,
            MockAPIBackend.createDashboardApiSuccessResponse(),
            new Error('Network error')
          );

          dashboardAPIQueueService.enqueueRequest(createDeleteTaskRequest());
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          for (const delay of [1000, 2000, 4000, 8000, 16_000, 32_000, 60_000]) {
            const sentCount = apiBackend.sentDashboardApiRequests.length;
            await vi.advanceTimersByTimeAsync(delay - 1);
            expect(apiBackend.sentDashboardApiRequests).toHaveLength(sentCount);
            await vi.advanceTimersByTimeAsync(1);
            expect(apiBackend.sentDashboardApiRequests).toHaveLength(sentCount + 1);
          }

          // The eighth attempt succeeded, so the next failure starts over
          dashboardAPIQueueService.enqueueRequest(createDeleteTaskRequest());
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          const sentCount = apiBackend.sentDashboardApiRequests.length;
          await vi.advanceTimersByTimeAsync(1000);
          expect(apiBackend.sentDashboardApiRequests).toHaveLength(sentCount + 1);
        });

        it('is skipped', async () => {
          apiBackend.queueDashboardApiResponses(new Error('Network error'));

          dashboardAPIQueueService.enqueueRequest(createDeleteTaskRequest());
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toHaveLength(2);
        });
      });

      describe('when the server errors', () => {
        it('is Pending, retries up to 10 attempts, then removes the item', async () => {
          const failing = createDeleteTaskRequest();
          const next = createDeleteTaskRequest();
          const serverErrors = Array.from({ length: 10 }, () =>
            MockAPIBackend.createDashboardApiFailureResponse(APIErrorCode.InternalError, 500)
          );
          apiBackend.queueDashboardApiResponses(...serverErrors);

          dashboardAPIQueueService.enqueueRequest(failing);
          dashboardAPIQueueService.enqueueRequest(next);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          expect(apiActivityService.state).toBe(ApiActivityState.Pending);

          for (let attempt = 2; attempt <= 10; attempt++) {
            await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          }

          expect(apiBackend.sentDashboardApiRequests).toEqual([
            ...Array.from({ length: 10 }, () => failing),
            next
          ]);
          expect(consoleErrorSpy).toHaveBeenCalledOnce();
          expect(apiActivityService.state).toBe(ApiActivityState.Error);
        });

        it('retries a temporary outage without a limit', async () => {
          const write = createDeleteTaskRequest();
          const outages = Array.from({ length: 20 }, () =>
            MockAPIBackend.createDashboardApiFailureResponse(
              APIErrorCode.InvalidAPIResponseShape,
              503
            )
          );
          apiBackend.queueDashboardApiResponses(...outages);

          dashboardAPIQueueService.enqueueRequest(write);
          for (let attempt = 1; attempt <= 21; attempt++) {
            await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          }

          expect(apiBackend.sentDashboardApiRequests).toHaveLength(21);
          expect(consoleErrorSpy).not.toHaveBeenCalled();
          expect(apiActivityService.state).toBe(ApiActivityState.Success);
        });

        it('retries a response that failed to parse', async () => {
          const write = createDeleteTaskRequest();
          apiBackend.queueDashboardApiResponses(
            MockAPIBackend.createDashboardApiFailureResponse(
              APIErrorCode.InvalidAPIResponseShape,
              200
            )
          );

          dashboardAPIQueueService.enqueueRequest(write);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          expect(apiActivityService.state).toBe(ApiActivityState.Pending);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([write, write]);
        });
      });

      describe('when the login expired', () => {
        it('pauses without removing anything, then resumes after login', async () => {
          const first = createDeleteTaskRequest();
          const second = createDeleteTaskRequest();
          apiBackend.queueDashboardApiResponses(
            MockAPIBackend.createDashboardApiFailureResponse(APIErrorCode.Unauthorized, 401)
          );

          dashboardAPIQueueService.enqueueRequest(first);
          dashboardAPIQueueService.enqueueRequest(second);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
          await vi.advanceTimersByTimeAsync(120_000);

          expect(apiBackend.sentDashboardApiRequests).toHaveLength(1);
          expect(apiActivityService.state).toBe(ApiActivityState.Pending);
          expect(consoleErrorSpy).not.toHaveBeenCalled();

          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([first, first, second]);
        });

        it('sends nothing while logged out', async () => {
          LocalData.accessToken = '';

          dashboardAPIQueueService.enqueueRequest(createDeleteTaskRequest());
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toHaveLength(0);
          expect(apiActivityService.state).toBe(ApiActivityState.Pending);
        });
      });

      describe('when the request is rejected by the server', () => {
        it('removes the item and continues with the rest of the queue', async () => {
          const bad = createDeleteTaskRequest();
          const next = createDeleteTaskRequest();
          apiBackend.queueDashboardApiResponses(
            MockAPIBackend.createDashboardApiFailureResponse(APIErrorCode.BadRequest, 400)
          );

          dashboardAPIQueueService.enqueueRequest(bad);
          dashboardAPIQueueService.enqueueRequest(next);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([bad, next]);
          expect(consoleErrorSpy).toHaveBeenCalledOnce();
          expect(apiActivityService.state).toBe(ApiActivityState.Error);
        });
      });

      describe('when a write is queued while a get is outstanding', () => {
        it('discards the snapshot and runs the get again after the write', async () => {
          const existing = DashboardTaskSchema.parse({ userId: DocumentService.generateID() });
          const added = DashboardTaskSchema.parse({ userId: existing.userId });
          const snapshot = Promise.withResolvers<APIResponse<ProjectDashboardOutput>>();
          const freshOutput: ProjectDashboardOutput = { tasks: [existing, added] };
          apiBackend.queueDashboardApiResponses(
            snapshot.promise,
            MockAPIBackend.createDashboardApiSuccessResponse(),
            MockAPIBackend.createDashboardApiSuccessResponse(freshOutput)
          );

          dashboardAPIQueueService.enqueueRequest(fullTaskGet);
          const insert: ProjectDashboardOptions = { insert: { tasks: [added] } };
          dashboardAPIQueueService.enqueueRequest(insert);
          snapshot.resolve(MockAPIBackend.createDashboardApiSuccessResponse({ tasks: [existing] }));
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([fullTaskGet, insert, fullTaskGet]);
          expect(onGetOutput).toHaveBeenCalledOnce();
          expect(onGetOutput).toHaveBeenCalledWith(freshOutput);
        });
      });

      describe('when several writes carry a get', () => {
        it('sends one merged get after the last write', async () => {
          const writes = [
            createDeleteTaskRequest(),
            createDeleteTaskRequest(),
            createDeleteTaskRequest()
          ];

          writes.forEach((write) => {
            dashboardAPIQueueService.enqueueRequest({ ...write, get: fullTaskGet.get });
          });
          dashboardAPIQueueService.enqueueRequest({ get: userConfigGet });
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([
            ...writes,
            { get: { ...fullTaskGet.get, ...userConfigGet } }
          ]);
          expect(onGetOutput).toHaveBeenCalledOnce();
        });
      });

      describe('when an item is queued just as the loop finishes', () => {
        it('still processes it', async () => {
          const first = createDeleteTaskRequest();
          const late = createDeleteTaskRequest();
          const setSuccess = apiActivityService.setSuccess.bind(apiActivityService);
          vi.spyOn(apiActivityService, 'setSuccess').mockImplementationOnce(() => {
            setSuccess();
            dashboardAPIQueueService.enqueueRequest(late);
          });

          dashboardAPIQueueService.enqueueRequest(first);
          await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

          expect(apiBackend.sentDashboardApiRequests).toEqual([first, late]);
        });
      });
    });

    describe('hydrate', () => {
      it('does not send the stored queue until a request is queued, then sends it first', async () => {
        const stored = createDeleteTaskRequest();
        LocalData.apiRequestQueue = [{ ...stored, get: userConfigGet }];

        dashboardAPIQueueService.hydrate();
        expect(apiBackend.sentDashboardApiRequests).toHaveLength(0);

        dashboardAPIQueueService.enqueueRequest(fullTaskGet);
        await dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();

        expect(apiBackend.sentDashboardApiRequests).toEqual([stored, fullTaskGet]);
      });
    });

    describe('reset', () => {
      it('ignores the outstanding result and keeps running normally', async () => {
        const outstanding = Promise.withResolvers<APIResponse<ProjectDashboardOutput>>();
        // Never resolves, so the write queued after the reset stays queued
        const neverResolves = Promise.withResolvers<APIResponse<ProjectDashboardOutput>>();
        apiBackend.queueDashboardApiResponses(outstanding.promise, neverResolves.promise);

        dashboardAPIQueueService.enqueueRequest({ ...createDeleteTaskRequest(), ...fullTaskGet });
        const oldLoop = dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
        dashboardAPIQueueService.reset();

        const nextWrite = createDeleteTaskRequest();
        dashboardAPIQueueService.enqueueRequest(nextWrite);

        outstanding.resolve(MockAPIBackend.createDashboardApiSuccessResponse());
        await oldLoop;

        expect(LocalData.apiRequestQueue).toEqual([nextWrite]);
        expect(apiBackend.sentDashboardApiRequests.at(-1)).toEqual(nextWrite);
        expect(onGetOutput).not.toHaveBeenCalled();
      });
    });
  });
});
