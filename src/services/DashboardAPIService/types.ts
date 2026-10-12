import type { ProjectDashboardOutput } from '@aneuhold/core-ts-api-lib';

/**
 * Anything that applies its part of the dashboard API output to app state,
 * such as a document map service or a store.
 */
export type DashboardAPIOutputHandler = {
  /**
   * Applies this handler's part of the output of a get request or a
   * WebSocket push.
   *
   * @param output The API output
   */
  handleApiOutput: (output: ProjectDashboardOutput) => void;
};
