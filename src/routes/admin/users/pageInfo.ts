import { goto } from '$app/navigation';
import type { PageInfo } from '$util/navInfo';

export const adminUsersPageInfo: PageInfo = {
  shortTitle: 'Users',
  title: 'Users',
  description: 'View and manage users',
  url: '/admin/users',
  iconName: 'people',
  clickAction: () => {
    goto(adminUsersPageInfo.url);
  },
  nestingLevel: 2,
  isInternalLink: true
};
