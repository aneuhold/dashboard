import { homePageInfo } from '../routes/+page.svelte';
import { devPageInfo } from '../routes/dev/+page.svelte';

export type PageInfo = {
  /**
   * The page title which should be shown at the top of the page and
   * other places that require the title.
   */
  title: string;
  /**
   * The title but short and without any emojis
   */
  shortTitle: string;
  description?: string;
  /**
   * The relative path to the page. For example: `/dev/arch`
   */
  url: string;
  /**
   * An optional icon name for the page. This is used for the NavDrawer if needed.
   */
  iconName?: string;
};

/**
 * Navigation info. Each key is the end of the relative path to the page.
 */
const navInfo = {
  home: homePageInfo,
  dev: devPageInfo
} satisfies Record<string, PageInfo>;

export default navInfo;
