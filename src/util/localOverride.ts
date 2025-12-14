import { APIService } from '@aneuhold/core-ts-api-lib';
import { createLogger } from '$util/logging/logger';

const log = createLogger('localOverride.ts');

/**
 * Overrides various things for local development if set to true.
 */
export default function localOverride() {
  const enableLocalOverride = true;
  if (enableLocalOverride) {
    log.debug('Local override active: Using local API URL');
    APIService.setAPIUrl('http://localhost:8080/');
  }
}
