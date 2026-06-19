import { goto } from '$app/navigation';
import type { PageInfo } from '$util/navInfo';

export const homelabPageInfo: PageInfo = {
  shortTitle: 'Homelab',
  title: 'Homelab',
  description: 'Self-hosted services and network infrastructure',
  url: '/homelab',
  iconName: 'dns',
  clickAction: () => {
    goto(homelabPageInfo.url);
  },
  nestingLevel: 0,
  isInternalLink: true
};
