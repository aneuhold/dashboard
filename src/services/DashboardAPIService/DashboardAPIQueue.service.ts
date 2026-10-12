import {
  APIErrorCode,
  type APIResponse,
  APIService,
  type ProjectDashboardOptions,
  type ProjectDashboardOutput
} from '@aneuhold/core-ts-api-lib';
import apiActivityService from '$services/ApiActivity.service.svelte';
import WebSocketService from '$services/WebSocket.service';
import LocalData from '$util/LocalData/LocalData';
import { createLogger } from '$util/logging/logger';

/**
 * Sends dashboard API requests one at a time. Writes (insert / update /
 * delete) are queued in order and persisted to {@link LocalData} until each
 * one succeeds or fails permanently. Gets are merged into a single pending get
 * that is sent once no writes are waiting, so a snapshot is never applied over
 * a write the server hasn't seen yet.
 *
 * Failed requests are retried with exponential backoff. Only get output is
 * handed to the output handler.
 */
class DashboardAPIQueueService {
  static readonly #log = createLogger('DashboardAPIQueue.service.ts');
  static readonly #maxServerErrorAttempts = 10;
  static readonly #baseRetryDelayMs = 1000;
  static readonly #maxRetryDelayMs = 60_000;

  #onGetOutput: ((output: ProjectDashboardOutput) => void) | null = null;

  /**
   * In-memory mirror of the persisted queue of writes. The copy in
   * {@link LocalData} is for recovery after a reload.
   */
  #writes: ProjectDashboardOptions[] = [];
  /**
   * Every get requested since the last successful get, merged together.
   */
  #pendingGet: ProjectDashboardOptions['get'];
  /**
   * The loop that is currently sending requests, if any.
   */
  #loop: Promise<boolean> | null = null;
  #retryTimer: ReturnType<typeof setTimeout> | null = null;
  /**
   * Consecutive failed attempts, across requests. Drives the backoff delay.
   */
  #retryAttempt = 0;
  /**
   * Server error attempts for the request at the head of the queue.
   */
  #serverErrorAttempts = 0;
  /**
   * Whether a failed request was removed since the queue was last empty.
   */
  #removedFailedRequest = false;
  /**
   * Counts calls to {@link reset}. `#runLoop` records it when it starts. If it
   * has changed when a response arrives, a reset happened in between, so the
   * response belongs to the previous session and the loop returns without
   * applying it, saving to storage, or scheduling a retry.
   */
  #generation = 0;

  /**
   * Sets the handler that applies the output of each successful get to app
   * state. Call once at startup, before any request is queued.
   *
   * @param onGetOutput Applies get output to app state
   */
  setGetOutputHandler(onGetOutput: (output: ProjectDashboardOutput) => void): void {
    this.#onGetOutput = onGetOutput;
  }

  /**
   * Loads the writes in the persisted queue from {@link LocalData}, ahead of
   * anything already queued. A `get` on a stored item is ignored and an item
   * with nothing else is dropped, since every app start already gets all
   * data. Does not start sending: the next queued request or
   * {@link skipWaitsAndProcessRequestsNow} does. Call once at app boot.
   */
  hydrate(): void {
    const storedWrites = LocalData.apiRequestQueue.flatMap((item) => this.#getWrites(item) ?? []);
    this.#writes = [...storedWrites, ...this.#writes];
    this.#persistQueue();
  }

  /**
   * Queues a request and starts sending. Insert / update / delete go into the
   * queue as one item, and `get` is merged into the pending get.
   *
   * @param options The API options that describe the desired operation(s)
   */
  enqueueRequest(options: ProjectDashboardOptions): void {
    if (this.#queueWritesAndMergeGet(options)) {
      this.#persistQueue();
    }
    void this.skipWaitsAndProcessRequestsNow();
  }

  /**
   * Sends queued requests now, skipping any backoff wait. {@link enqueueRequest}
   * already calls this, so outside callers only need it to retry early.
   * Resolves when the loop stops, either because nothing is left to send or
   * because it is waiting on a retry or a login.
   *
   * If the loop stopped because nothing was left, but work was queued between
   * that check and `#loop` being cleared, another loop is started.
   */
  async skipWaitsAndProcessRequestsNow(): Promise<void> {
    this.#clearRetryTimer();
    if (!this.#loop) {
      const loop = this.#runLoop();
      this.#loop = loop;
      void loop.finally(() => {
        // reset() may have already replaced this loop
        if (this.#loop === loop) this.#loop = null;
      });
    }
    const stoppedWithEmptyQueue = await this.#loop;
    const hasWork = this.#writes.length > 0 || this.#pendingGet !== undefined;
    if (stoppedWithEmptyQueue && this.#loop === null && hasWork) {
      await this.skipWaitsAndProcessRequestsNow();
    }
  }

  /**
   * Clears every queued request and the persisted queue. A request that is
   * already outstanding finishes, but its result is ignored.
   */
  reset(): void {
    this.#generation++;
    this.#clearRetryTimer();
    this.#writes = [];
    this.#pendingGet = undefined;
    this.#loop = null;
    this.#retryAttempt = 0;
    this.#serverErrorAttempts = 0;
    this.#removedFailedRequest = false;
    this.#persistQueue();
  }

  /**
   * Sends requests until none are left, a retry is scheduled, the device is
   * offline, the user has to log in, or the queue is reset. While offline,
   * nothing is sent or retried until the next
   * {@link skipWaitsAndProcessRequestsNow}, such as on the `online` event.
   * Resolves to `true` when it stopped because nothing was left to send.
   */
  async #runLoop(): Promise<boolean> {
    const generation = this.#generation;
    let sentRequest = false;
    try {
      while (generation === this.#generation) {
        const write = this.#writes.at(0);
        const get = write ? undefined : this.#pendingGet;
        if (!write && !get) {
          if (sentRequest) this.#setActivityStateForEmptyQueue();
          return true;
        }
        if (!navigator.onLine) {
          apiActivityService.setOffline();
          return false;
        }
        if (!LocalData.accessToken) {
          apiActivityService.setPending();
          return false;
        }

        apiActivityService.setSyncing();
        sentRequest = true;
        const response = await this.#send(write ?? { get });
        if (generation !== this.#generation) return false;

        if (!response) {
          // A timeout or a failed fetch while the device reports online
          if (navigator.onLine) {
            apiActivityService.setPending();
          } else {
            apiActivityService.setOffline();
          }
          this.#scheduleRetry();
          return false;
        }
        if (response.success) {
          this.#retryAttempt = 0;
          this.#serverErrorAttempts = 0;
          if (write) {
            this.#removeWrite(write);
          } else {
            this.#completeGet(get, response.data);
          }
          continue;
        }

        const { errorCode, errors } = response;
        if (
          errorCode === APIErrorCode.Unauthorized ||
          errorCode === APIErrorCode.InvalidRefreshToken
        ) {
          // The initial fetch after login queues a get, which resumes the queue
          apiActivityService.setPending();
          return false;
        }
        if (this.#shouldRetry(response)) {
          apiActivityService.setPending();
          this.#scheduleRetry();
          return false;
        }
        this.#removeFailedRequest(write, get, errors);
      }
      return false;
    } catch (error) {
      DashboardAPIQueueService.#log.error(
        'Unexpected error while processing the API request queue',
        error
      );
      apiActivityService.setError();
      return false;
    }
  }

  /**
   * Sends a request. Resolves to `null` when the request never reached the
   * server or timed out.
   *
   * @param options The request to send
   */
  async #send(
    options: ProjectDashboardOptions
  ): Promise<APIResponse<ProjectDashboardOutput> | null> {
    DashboardAPIQueueService.#log.info('Processing API request', options);
    let response: APIResponse<ProjectDashboardOutput>;
    try {
      response = await APIService.callDashboardAPI({
        options,
        socketId: WebSocketService.getSocketId()
      });
    } catch (error) {
      DashboardAPIQueueService.#log.warn('API request did not reach the server', error);
      return null;
    }
    if (response.success) {
      DashboardAPIQueueService.#log.info('Successfully processed API request');
    } else {
      const { statusCode, errorCode, errors } = response;
      DashboardAPIQueueService.#log.warn('API request failed', statusCode, errorCode, errors);
    }
    return response;
  }

  /**
   * Whether a failed request should be retried. A temporary outage is retried
   * without a limit, and any other server error up to
   * {@link DashboardAPIQueueService.#maxServerErrorAttempts} attempts.
   *
   * @param response The failed response
   */
  #shouldRetry(response: APIResponse<ProjectDashboardOutput>): boolean {
    const { statusCode, errorCode } = response;
    // Temporary conditions that clear on their own, retried without a limit
    const transientStatusCodes: ReadonlySet<number> = new Set([
      // Request Timeout: the server closed a slow connection, not a bad request
      408,
      // Too Many Requests: rate limiting lifts once requests slow down
      429,
      // Bad Gateway: the load balancer couldn't reach an instance, such as mid-deploy
      502,
      // Service Unavailable: no instance can take the request yet, such as during a cold start or deploy
      503,
      // Gateway Timeout: the instance didn't answer the load balancer in time
      504
    ]);
    if (transientStatusCodes.has(statusCode)) return true;
    if (
      errorCode !== APIErrorCode.InternalError &&
      errorCode !== APIErrorCode.InvalidAPIResponseShape
    ) {
      return false;
    }
    this.#serverErrorAttempts++;
    return this.#serverErrorAttempts < DashboardAPIQueueService.#maxServerErrorAttempts;
  }

  /**
   * Applies a get's output, unless a write was queued while the get was
   * outstanding. In that case the snapshot may not include the write, so it
   * is discarded and the get stays pending to run again after the write.
   *
   * @param get The get that was sent
   * @param output The output of the get
   */
  #completeGet(get: ProjectDashboardOptions['get'], output: ProjectDashboardOutput): void {
    if (this.#writes.length > 0) return;
    if (this.#onGetOutput) {
      try {
        this.#onGetOutput(output);
      } catch (error) {
        DashboardAPIQueueService.#log.error('Failed to apply get output', error);
        this.#removedFailedRequest = true;
      }
    } else {
      DashboardAPIQueueService.#log.error(
        'No get output handler is set, so the output was not applied.'
      );
    }
    this.#removePendingGet(get);
  }

  /**
   * Removes a request that failed permanently and logs it.
   *
   * @param write The write that failed, if the request was a write
   * @param get The get that failed, if the request was a get
   * @param errors The errors the request failed with
   */
  #removeFailedRequest(
    write: ProjectDashboardOptions | undefined,
    get: ProjectDashboardOptions['get'],
    errors: string[]
  ): void {
    DashboardAPIQueueService.#log.error(
      'Removing API request that failed permanently',
      write ?? { get },
      errors
    );
    if (write) {
      this.#removeWrite(write);
    } else {
      this.#removePendingGet(get);
    }
    this.#retryAttempt = 0;
    this.#serverErrorAttempts = 0;
    this.#removedFailedRequest = true;
    apiActivityService.setError();
  }

  /**
   * Sets the API activity state once the queue is empty: Error if a failed
   * request was removed since the queue was last empty, otherwise Success.
   */
  #setActivityStateForEmptyQueue(): void {
    if (this.#removedFailedRequest) {
      apiActivityService.setError();
    } else {
      apiActivityService.setSuccess();
    }
    this.#removedFailedRequest = false;
  }

  /**
   * Splits a request into its writes, which join the queue as one item, and
   * its get, which is merged into the pending get. Returns whether a write was
   * queued.
   *
   * @param options The request to split
   */
  #queueWritesAndMergeGet(options: ProjectDashboardOptions): boolean {
    const { get } = options;
    if (get) {
      this.#pendingGet = { ...this.#pendingGet, ...get };
    }
    const writes = this.#getWrites(options);
    if (writes) {
      this.#writes.push(writes);
      return true;
    }
    return false;
  }

  /**
   * Returns a copy of a request without its `get`, or `undefined` when it has
   * no insert, update, or delete.
   *
   * @param options The request to take the writes from
   */
  #getWrites(options: ProjectDashboardOptions): ProjectDashboardOptions | undefined {
    const { get: _get, ...writes } = options;
    return writes.insert || writes.update || writes.delete ? writes : undefined;
  }

  /**
   * Removes a write by identity, since the queue may have changed while it was
   * outstanding.
   *
   * @param write The write to remove
   */
  #removeWrite(write: ProjectDashboardOptions): void {
    const index = this.#writes.indexOf(write);
    if (index !== -1) {
      this.#writes.splice(index, 1);
      this.#persistQueue();
    }
  }

  /**
   * Clears the pending get if it is still the get that was sent. A get merged
   * in while that one was outstanding replaced the pending get, so it stays
   * pending to run next.
   *
   * @param get The get that was sent
   */
  #removePendingGet(get: ProjectDashboardOptions['get']): void {
    if (this.#pendingGet === get) {
      this.#pendingGet = undefined;
    }
  }

  /**
   * Schedules the next attempt with exponential backoff and jitter, capped at
   * {@link DashboardAPIQueueService.#maxRetryDelayMs}.
   */
  #scheduleRetry(): void {
    const cappedDelay = Math.min(
      DashboardAPIQueueService.#maxRetryDelayMs,
      DashboardAPIQueueService.#baseRetryDelayMs * 2 ** this.#retryAttempt
    );
    const delay = cappedDelay * (0.5 + Math.random() * 0.5);
    this.#retryAttempt++;
    this.#clearRetryTimer();
    this.#retryTimer = setTimeout(() => {
      this.#retryTimer = null;
      void this.skipWaitsAndProcessRequestsNow();
    }, delay);
  }

  /**
   * Cancels the scheduled retry, if there is one.
   */
  #clearRetryTimer(): void {
    if (this.#retryTimer !== null) {
      clearTimeout(this.#retryTimer);
      this.#retryTimer = null;
    }
  }

  /**
   * Saves a copy of the writes to {@link LocalData}.
   */
  #persistQueue(): void {
    LocalData.apiRequestQueue = [...this.#writes];
  }
}

const dashboardAPIQueueService = new DashboardAPIQueueService();

export default dashboardAPIQueueService;
