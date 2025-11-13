<script lang="ts">
  import type { NonogramKatanaUpgradeName } from '@aneuhold/core-ts-db-lib';
  import { NonogramKatanaUpgradeMapService } from '$services/NonogramKatana/NonogramKatanaUpgradeMapService';
  import { nonogramKatanaUpgradesDisplayInfo } from './nonogramKatanaUpgradesDisplayInfo';

  let { upgradeName }: { upgradeName: NonogramKatanaUpgradeName } = $props();
  let upgrade = $derived(NonogramKatanaUpgradeMapService.getUpgradeStoreByName(upgradeName));
  let upgradeDisplayName = $derived(nonogramKatanaUpgradesDisplayInfo[upgradeName].displayName);
</script>

<li>{$upgrade.completed ? '✅ ' : '❌ '}{upgradeDisplayName}</li>
