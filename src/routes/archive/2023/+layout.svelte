<script>
  import "../../../app.css";
  let { children } = $props();
</script>

<div class="cave-2023-layout">
  {@render children()}
</div>

<style>
  .cave-2023-layout {
    min-height: 100vh;
    overflow-x: hidden;
  }
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
