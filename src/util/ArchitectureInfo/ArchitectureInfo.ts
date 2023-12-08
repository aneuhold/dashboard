import type { ArchitectureContext, ArchitectureContextName } from './architectureContextInfo';
import architectureContextInfo from './architectureContextInfo';

/**
 * A class that provides information about different architectures for personal
 * projects.
 */
export default class ArchitectureInfo {
  static getContextFromSearchParams(searchParams: URLSearchParams): ArchitectureContext | null {
    if (searchParams.has('context')) {
      const contextString = searchParams.get('context');
      if (contextString && Object.hasOwn(architectureContextInfo, contextString)) {
        return architectureContextInfo[contextString as ArchitectureContextName];
      }
    }
    return null;
  }
}
