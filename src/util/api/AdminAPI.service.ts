import {
  type AdminInput,
  type AdminOutput,
  type APIResponse,
  APIService
} from '@aneuhold/core-ts-api-lib';
import { createLogger } from '$util/logging/logger';

/**
 * Service for making admin API calls. Simple request/response (not
 * queue-based like DashboardAPIService).
 */
export default class AdminAPIService {
  static readonly #log = createLogger('AdminAPI.service.ts');

  /**
   * Calls the admin API with the given input.
   *
   * @param input - The admin operations to perform.
   */
  static async query(input: AdminInput): Promise<AdminOutput | null> {
    let result: APIResponse<AdminOutput>;
    try {
      result = await APIService.callAdminAPI(input);
    } catch (error) {
      AdminAPIService.#log.error('Admin API request did not reach the server', error);
      return null;
    }
    if (result.success) {
      return result.data;
    }
    AdminAPIService.#log.error('Admin API error', result.errors);
    return null;
  }
}
