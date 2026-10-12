import nonogramKatanaItemMapService from '$services/NonogramKatana/NonogramKatanaItemMap.service';
import nonogramKatanaUpgradeMapService from '$services/NonogramKatana/NonogramKatanaUpgradeMap.service';
import taskMapService from '$services/Task/TaskMap/TaskMap.service';
import { translations } from '$stores/local/translations';
import { userConfig } from '$stores/local/userConfig/userConfig';
import type { DashboardAPIOutputHandler } from './types';

/**
 * The handlers that apply API output, in the order in which API output is
 * applied.
 *
 * `DashboardAPI.service.ts` must never import this file: the document map
 * services and stores import `DashboardAPIService`, so that import forms a
 * cycle.
 */
const apiResponseHandlingOrder: DashboardAPIOutputHandler[] = [
  translations,
  userConfig,
  taskMapService,
  nonogramKatanaItemMapService,
  nonogramKatanaUpgradeMapService
];

export default apiResponseHandlingOrder;
