<script>
  let { children } = $props();
</script>

<div class="cj2024-root">
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .cj2024-root {
    min-height: 100vh;
    overflow-x: hidden;
  }

  .cj2024-root :global(footer) {
    display: none !important;
  }
</style>
