import {
  type APIResponse,
  APIService,
  type ProjectDashboardOptions,
  type ProjectDashboardOutput
} from '@aneuhold/core-ts-api-lib';
import type { DashboardUserConfig, UserCTO } from '@aneuhold/core-ts-db-lib';
import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
import LocalData from '$util/LocalData/LocalData';
import { createLogger } from '$util/logging/logger';
import dashboardAPIQueueService from './DashboardAPIQueue.service';
import type { DashboardAPIOutputHandler } from './types';

export default class DashboardAPIService {
  static readonly #log = createLogger('DashboardAPI.service.ts');

  static readonly #secondsToWaitBeforeFetchingInitialData = 10;

  static lastInitialDataFetchTime: number | null = null;
  /**
   * Whether the next applied get output is the first sync since login. Used
   * to tell the user whether that sync worked.
   */
  static #processingFirstInitData = false;
  /**
   * The handlers that apply API output, in the order in which they are
   * executed.
   */
  static #apiOutputHandlers: DashboardAPIOutputHandler[] = [];

  static {
    dashboardAPIQueueService.setGetOutputHandler((output) => {
      this.handleApiOutput(output);
      if (this.#processingFirstInitData) {
        this.#processingFirstInitData = false;
        this.#notifyFirstSyncResult(output);
      }
    });
  }

  /**
   * Loads any persisted queue from `LocalData` without sending it. The
   * initial data fetch sends it. Call once at app boot.
   */
  static hydrate(): void {
    dashboardAPIQueueService.hydrate();
  }

  /**
   * Sets the handlers that apply the output of each get request to app
   * state. Call once at app startup, before any request is queued.
   *
   * @param apiOutputHandlers The handlers that apply API output, in the order
   *   in which they are executed
   */
  static setApiOutputHandlers(apiOutputHandlers: DashboardAPIOutputHandler[]): void {
    this.#apiOutputHandlers = apiOutputHandlers;
  }

  /**
   * Inserts, deletes, updates or gets items in the backend.
   *
   * Returns synchronously: writes join the queue immediately and are
   * persisted to `LocalData`. Gets are merged and sent once no writes are
   * waiting, and only get output is applied to the API output handlers.
   *
   * @param apiOptions The API options that describe the desired operation(s).
   */
  static queryApi(apiOptions: ProjectDashboardOptions): void {
    dashboardAPIQueueService.enqueueRequest(apiOptions);
  }

  /**
   * Sends queued requests now, skipping any backoff wait. Queued requests are
   * sent automatically, so this is only needed when there is a reason to retry
   * early, such as the network coming back.
   */
  static skipWaitsAndProcessRequestsNow(): void {
    void dashboardAPIQueueService.skipWaitsAndProcessRequestsNow();
  }

  /**
   * Fetches the initial data if
   * - the app is visible and wasn't before
   * - the user is logged in
   * - the last initial data fetch was more than
   * {@link DashboardAPIService.#secondsToWaitBeforeFetchingInitialData} ago or it hasn't been
   * fetched yet.
   */
  static getInitialDataIfNeeded(): void {
    if (!LocalData.accessToken) return;

    if (!this.lastInitialDataFetchTime) {
      this.getInitialData();
    } else if (
      this.lastInitialDataFetchTime <
      Date.now() - DashboardAPIService.#secondsToWaitBeforeFetchingInitialData * 1000
    ) {
      this.#log.info(
        'Fetching initial data because it has been more than',
        DashboardAPIService.#secondsToWaitBeforeFetchingInitialData,
        'seconds since the last fetch and the user reopened the app.'
      );
      this.getInitialData();
    }
  }

  /**
   * Gets initial data as if the user is just logging in.
   */
  static getInitialDataForLogin(): void {
    this.lastInitialDataFetchTime = null;
    this.getInitialData();
  }

  /**
   * Gets the initial data from the backend and sets the stores accordingly.
   */
  static getInitialData(): void {
    this.#log.info('Getting initial data...');
    this.#processingFirstInitData = !this.lastInitialDataFetchTime;
    this.lastInitialDataFetchTime = Date.now();

    this.queryApi({
      get: {
        translations: true,
        userConfig: true,
        tasks: true,
        nonogramKatanaItems: true,
        nonogramKatanaUpgrades: true
      }
    });
  }

  /**
   * Saves the user's settings, then gets the user config and tasks again,
   * since the collaborators might have changed.
   *
   * @param updatedConfig The settings to save
   */
  static updateSettings(updatedConfig: DashboardUserConfig): void {
    this.#log.info('Saving user settings...');
    this.queryApi({
      get: { userConfig: true, tasks: true },
      update: {
        userConfig: updatedConfig
      }
    });
  }

  /**
   * Looks up a user by username. Sent directly instead of through the queue,
   * since the caller waits on the result.
   *
   * @param username The username to validate.
   */
  static async checkIfUsernameIsValid(username: string): Promise<UserCTO | null> {
    let result: APIResponse<ProjectDashboardOutput>;
    try {
      result = await APIService.callDashboardAPI({
        options: {
          get: {
            userNameIsValid: username
          }
        }
      });
    } catch (error) {
      this.#log.error('Username check did not reach the server', error);
      return null;
    }
    if (result.success && result.data.userFromUserName) {
      return result.data.userFromUserName;
    } else {
      this.#log.info('Invalid username', result);
      return null;
    }
  }

  /**
   * Passes API output to each API output handler, in order. Applies both get
   * output and WebSocket pushes.
   *
   * @param output The API output
   */
  static handleApiOutput(output: ProjectDashboardOutput): void {
    if (this.#apiOutputHandlers.length === 0) {
      this.#log.error('No API output handlers are set, so the API output was not applied.');
      return;
    }
    this.#apiOutputHandlers.forEach((handler) => {
      handler.handleApiOutput(output);
    });
  }

  /**
   * Clears in-memory state and the persisted queue. Call on logout so a
   * different user signing in on the same device doesn't inherit the
   * previous session's queue.
   */
  static reset(): void {
    this.lastInitialDataFetchTime = null;
    this.#processingFirstInitData = false;
    dashboardAPIQueueService.reset();
  }

  /**
   * Tells the user whether the first sync since login returned any data.
   *
   * @param output The output of the first sync
   */
  static #notifyFirstSyncResult(output: ProjectDashboardOutput): void {
    if (Object.keys(output).length > 0) {
      this.#log.info('Successfully got initial data');
      snackbar.success('Successfully synced 🎉');
    } else {
      this.#log.error('Error getting initial data', output);
      snackbar.error('Error syncing');
    }
  }
}
