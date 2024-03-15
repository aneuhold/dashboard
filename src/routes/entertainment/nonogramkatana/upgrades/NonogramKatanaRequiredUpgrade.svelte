<script lang="ts">
  import type { NonogramKatanaUpgradeName } from '@aneuhold/core-ts-db-lib';
  import { NonogramKatanaUpgradeMapService } from '../../../../services/NonogramKatana/NonogramKatanaUpgradeMapService';
  import { nonogramKatanaUpgradesDisplayInfo } from './+page.svelte';

  export let upgradeName: NonogramKatanaUpgradeName;
  $: upgrade = NonogramKatanaUpgradeMapService.getUpgradeStoreByName(upgradeName);
  $: upgradeDisplayName = nonogramKatanaUpgradesDisplayInfo[upgradeName].displayName;
</script>

<li>{$upgrade.completed ? '✅' : '❌'}{upgradeDisplayName}</li>
