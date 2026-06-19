import {
  APIService,
  type ProjectDashboardOptions,
  type ProjectDashboardOutput
} from '@aneuhold/core-ts-api-lib';
import type { DashboardUserConfig, UserCTO } from '@aneuhold/core-ts-db-lib';
import apiActivityService, { ApiActivityState } from '$services/ApiActivity.service.svelte';
import WebSocketService from '$services/WebSocket.service';
import LocalData from '$util/LocalData/LocalData';
import { createLogger } from '$util/logging/logger';
import DashboardAPIResponseHandlingService from './DashboardAPIResponseHandling.service';

export default class DashboardAPIService {
  static readonly #log = createLogger('DashboardAPI.service.ts');

  static readonly #SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA = 10;

  /**
   * A variable to determine if the initial data is currently being fetched
   * for the first time.
   * This is used to show the user that the data was synced if it was fetched
   * successfully.
   */
  static #processingFirstInitData = false;
  static lastInitialDataFetchTime: number | null = null;
  static #processingRequestQueue = false;

  /**
   * Inserts, deletes, updates or gets items in the backend.
   *
   * If an API request is already being processed, this will be added
   * to the queue and executed after the previous request is done.
   *
   * @param apiOptions The API options that describe the desired operation(s).
   */
  static queryApi(apiOptions: ProjectDashboardOptions) {
    // Add the options to the queue
    this.#pushApiRequest(apiOptions);

    // Start processing the queue if not already doing so
    if (!this.#processingRequestQueue && LocalData.apiRequestQueue.length > 0) {
      this.#processApiRequests();
    }
  }

  /**
   * Fetches the initial data if
   * - the app is visible and wasn't before
   * - the user is logged in
   * - there is no task queue item
   * - the last initial data fetch was more than
   * {@link DashboardAPIService.#SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA} ago or it hasn't been
   * fetched yet.
   */
  static getInitialDataIfNeeded() {
    if (LocalData.accessToken && LocalData.apiRequestQueue.length === 0) {
      if (!this.lastInitialDataFetchTime) {
        this.getInitialData();
      } else if (
        this.lastInitialDataFetchTime <
        Date.now() - DashboardAPIService.#SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA * 1000
      ) {
        this.#log.info(
          'Fetching initial data because it has been more than',
          DashboardAPIService.#SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA,
          'seconds since the last fetch and the user reopened the app.'
        );
        this.getInitialData();
      }
    }
  }

  /**
   * Gets initial data as if the user is just logging in.
   */
  static getInitialDataForLogin() {
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

  static updateSettings(updatedConfig: DashboardUserConfig) {
    this.#log.info('Saving user settings...');
    this.queryApi({
      // Get tasks as well because the collaborators might have changed
      get: { userConfig: true, tasks: true },
      update: {
        userConfig: updatedConfig
      }
    });
  }

  /**
   * This processes separately from the queue because it is a special case.
   *
   * @param username The username to validate.
   */
  static async checkIfUsernameIsValid(username: string): Promise<UserCTO | null> {
    const result = await APIService.callDashboardAPI({
      options: {
        get: {
          userNameIsValid: username
        }
      }
    });
    if (result.success && result.data.userFromUserName) {
      return result.data.userFromUserName;
    } else {
      this.#log.info('Invalid username', result);
      return null;
    }
  }

  /**
   * Starts processing the currently queued API requests. Each result is
   * combined together and processed at the end.
   */
  static async #processApiRequests() {
    this.#processingRequestQueue = true;
    apiActivityService.setSyncing();
    let combinedOutput: ProjectDashboardOutput = {};
    while (LocalData.apiRequestQueue.length > 0) {
      const currentRequest = this.#shiftApiRequestQueue();
      LocalData.currentApiRequest = currentRequest;
      if (!currentRequest) {
        this.#log.error('No current API request to process, something went wrong!!');
        break;
      }
      const result = await this.#callDashboardAPI(currentRequest);
      if (result) {
        combinedOutput = { ...combinedOutput, ...result };
      }
      if (result && LocalData.apiRequestQueue.length === 0) {
        // Only set the stores if there are no more requests to process. This
        // should help prevent the stores from being set to an old value if
        // the user refreshes the page while the task queue is being processed.
        DashboardAPIResponseHandlingService.processDashboardApiOutput(
          combinedOutput,
          this.#processingFirstInitData
        );
        this.#processingFirstInitData = false;
      } else if (!result) {
        apiActivityService.setError();
      }
    }
    if (apiActivityService.state !== ApiActivityState.Error) {
      apiActivityService.setSuccess();
    }
    this.#processingRequestQueue = false;
  }

  static async #callDashboardAPI(
    input: ProjectDashboardOptions
  ): Promise<ProjectDashboardOutput | null> {
    this.#log.info('Processing API request', input);
    const result = await APIService.callDashboardAPI({
      options: input,
      socketId: WebSocketService.getSocketId()
    });
    if (result.success) {
      this.#log.info('Successfully processed API request', input);
      return result.data;
    } else {
      this.#log.error('Error processing API request', input, result);
      return null;
    }
  }

  static #pushApiRequest(apiInput: ProjectDashboardOptions) {
    const apiRequestQueue = LocalData.apiRequestQueue;
    apiRequestQueue.push(apiInput);
    LocalData.apiRequestQueue = apiRequestQueue;
  }

  static #shiftApiRequestQueue(): ProjectDashboardOptions | undefined {
    const apiRequestQueue = LocalData.apiRequestQueue;
    const result = apiRequestQueue.shift();
    LocalData.apiRequestQueue = apiRequestQueue;
    return result;
  }
}
