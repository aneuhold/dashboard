import { APIService } from '@aneuhold/core-ts-api-lib';

/**
 * Overrides various things for local development if set to true.
 */
export default function localOverride() {
  const enableLocalOverride = false;
  if (enableLocalOverride) {
    console.log('Local override active: Using local API URL');
    APIService.setAPIUrl('http://localhost:8080/');
  }
}
