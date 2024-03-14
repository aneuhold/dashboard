import { goto } from '$app/navigation';
import type { PageInfo } from '$util/navInfo';

export const nonogramKatanaBuildingsPageInfo: PageInfo = {
  shortTitle: 'Nonogram Katana Buildings',
  title: 'Nonogram Katana Buildings',
  description: 'Buildings and their priority.',
  url: '/entertainment/nonogramkatana/buildings',
  clickAction: () => {
    goto(nonogramKatanaBuildingsPageInfo.url);
  },
  nestingLevel: 2,
  isInternalLink: true,
  iconName: 'apartment'
};
