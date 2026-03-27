import { goto } from '$app/navigation';
import type { PageInfo } from '$util/navInfo';

export const adminPageInfo: PageInfo = {
  shortTitle: 'Admin',
  title: 'Admin',
  description: 'Administration and entity management',
  url: '/admin',
  iconName: 'admin_panel_settings',
  clickAction: () => {
    goto(adminPageInfo.url);
  },
  nestingLevel: 0,
  isInternalLink: true
};
