import { type AdminInput, type AdminOutput, APIService } from '@aneuhold/core-ts-api-lib';
import { createLogger } from '$util/logging/logger';

const log = createLogger('AdminAPIService.ts');

/**
 * Service for making admin API calls. Simple request/response (not
 * queue-based like DashboardAPIService).
 */
export default class AdminAPIService {
  /**
   * Calls the admin API with the given input.
   *
   * @param input - The admin operations to perform.
   */
  static async query(input: AdminInput): Promise<AdminOutput | null> {
    const result = await APIService.callAdminAPI(input);
    if (result.success) {
      return result.data;
    }
    log.error('Admin API error', result.errors);
    return null;
  }
}
