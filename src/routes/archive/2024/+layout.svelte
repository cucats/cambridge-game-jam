<script>
  import { onMount } from "svelte";
  let { children } = $props();

  onMount(() => {
    document.body.classList.add("splash-2024-page");
    return () => {
      document.body.classList.remove("splash-2024-page");
    };
  });
</script>

<div class="splash-2024-root">
  {@render children()}
</div>

<style>
  :global(body.splash-2024-page) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  :global(body.splash-2024-page footer) {
    display: none !important;
  }

  .splash-2024-root {
    min-height: 100vh;
    width: 100%;
  }
</style>
