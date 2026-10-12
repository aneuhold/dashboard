import type {
  AdminOutput,
  APIErrorCode,
  APIResponse,
  AuthDeleteAccountOutput,
  AuthValidateUserOutput,
  IAPIBackend,
  ProjectDashboardInput,
  ProjectDashboardOptions,
  ProjectDashboardOutput,
  ProjectWorkoutPrimaryOutput
} from '@aneuhold/core-ts-api-lib';

/**
 * An {@link IAPIBackend} that answers every call with a successful, empty
 * response and never touches the network. Dashboard responses can be queued
 * ahead of time, and every dashboard request is recorded.
 */
export default class MockAPIBackend implements IAPIBackend {
  /**
   * Empty, because no request leaves this backend.
   */
  readonly defaultUrl = '';

  #queuedDashboardApiResponses: (
    APIResponse<ProjectDashboardOutput> | Promise<APIResponse<ProjectDashboardOutput>> | Error
  )[] = [];
  #sentDashboardApiRequests: ProjectDashboardOptions[] = [];

  authValidateUser(): Promise<APIResponse<AuthValidateUserOutput>> {
    return this.#createResolvedSuccessResponse({});
  }

  authLogout(): Promise<APIResponse<undefined>> {
    return this.#createResolvedSuccessResponse(undefined);
  }

  authDeleteAccount(): Promise<APIResponse<AuthDeleteAccountOutput>> {
    return this.#createResolvedSuccessResponse({});
  }

  projectDashboard(input: ProjectDashboardInput): Promise<APIResponse<ProjectDashboardOutput>> {
    this.#sentDashboardApiRequests.push(input.options);
    const response =
      this.#queuedDashboardApiResponses.shift() ??
      MockAPIBackend.createDashboardApiSuccessResponse();
    if (response instanceof Error) return Promise.reject(response);
    return Promise.resolve(response);
  }

  admin(): Promise<APIResponse<AdminOutput>> {
    return this.#createResolvedSuccessResponse({});
  }

  projectWorkout(): Promise<APIResponse<ProjectWorkoutPrimaryOutput>> {
    return this.#createResolvedSuccessResponse({});
  }

  setAccessToken(): void {
    // No request carries a token
  }

  setRefreshTokenString(): void {
    // No request carries a token
  }

  setOnTokensRefreshed(): void {
    // Tokens are never refreshed
  }

  setOnAuthExpired(): void {
    // Auth never expires
  }

  getUrl(): string {
    return this.defaultUrl;
  }

  setUrl(): void {
    // No request is sent to any URL
  }

  /**
   * Creates a successful dashboard response.
   *
   * @param data The output of the request
   */
  static createDashboardApiSuccessResponse(
    data: ProjectDashboardOutput = {}
  ): APIResponse<ProjectDashboardOutput> {
    return MockAPIBackend.#createSuccessResponse(data);
  }

  /**
   * Creates a failed dashboard response.
   *
   * @param errorCode The failure the response names
   * @param statusCode The HTTP status the response is sent with
   */
  static createDashboardApiFailureResponse(
    errorCode: APIErrorCode,
    statusCode: number
  ): APIResponse<ProjectDashboardOutput> {
    return { success: false, errors: ['Request failed'], data: {}, statusCode, errorCode };
  }

  /**
   * Creates a successful response carrying `data`.
   *
   * @param data The payload of the response
   */
  static #createSuccessResponse<TData>(data: TData): APIResponse<TData> {
    return { success: true, errors: [], data, statusCode: 200 };
  }

  /**
   * The options of every dashboard request, in the order they were sent.
   */
  get sentDashboardApiRequests(): readonly ProjectDashboardOptions[] {
    return this.#sentDashboardApiRequests;
  }

  /**
   * Queues the responses for the next dashboard requests, in order. Once they
   * run out, every request succeeds with empty output.
   *
   * @param responses The responses, in the order the requests are sent. A
   *   promise resolves whenever the test resolves it, and an `Error` rejects
   *   the request the way a network failure does.
   */
  queueDashboardApiResponses(
    ...responses: (
      APIResponse<ProjectDashboardOutput> | Promise<APIResponse<ProjectDashboardOutput>> | Error
    )[]
  ): void {
    this.#queuedDashboardApiResponses.push(...responses);
  }

  /**
   * Resolves a successful response carrying `data`.
   *
   * @param data The payload of the response
   */
  #createResolvedSuccessResponse<TData>(data: TData): Promise<APIResponse<TData>> {
    return Promise.resolve(MockAPIBackend.#createSuccessResponse(data));
  }
}
