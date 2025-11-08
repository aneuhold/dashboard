<script lang="ts">
  import type { NonogramKatanaUpgradeName } from '@aneuhold/core-ts-db-lib';
  import { NonogramKatanaUpgradeMapService } from '../../../../services/NonogramKatana/NonogramKatanaUpgradeMapService';
  import { nonogramKatanaUpgradesDisplayInfo } from './nonogramKatanaUpgradesDisplayInfo';

  interface Props {
    upgradeName: NonogramKatanaUpgradeName;
  }

  let { upgradeName }: Props = $props();
  let upgrade = $derived(NonogramKatanaUpgradeMapService.getUpgradeStoreByName(upgradeName));
  let upgradeDisplayName = $derived(nonogramKatanaUpgradesDisplayInfo[upgradeName].displayName);
</script>

<li>{$upgrade.completed ? '✅ ' : '❌ '}{upgradeDisplayName}</li>
