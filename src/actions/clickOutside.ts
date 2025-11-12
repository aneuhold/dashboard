import type { Action } from 'svelte/action';

/**
 * Click outside action. This can be used to detect clicks outside of an
 * element.
 *
 * For example:
 *
 * ```svelte
 * <script>
 * import { clickOutside } from "src/actions/clickOutside";
 * let show = false;
 * </script>
 *
 * <button on:click={() => show = true}>Show</button>
 *
 * {#if show}
 * <div class="modal" use:clickOutside={() => {
 * show = false;
 * }}>
 * <button on:click={() => show = false}>Close</button>
 * </div>
 * {/if}
 * ```
 *
 * @param node
 * @param callbackFunction
 */
export const clickOutside: Action<HTMLElement, () => void> = (node, callbackFunction) => {
  const handleClick = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node)) {
      callbackFunction();
    }
  };

  document.addEventListener('click', handleClick);

  return {
    destroy() {
      document.removeEventListener('click', handleClick);
    }
  };
};
