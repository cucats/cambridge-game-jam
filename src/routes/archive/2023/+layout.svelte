<script>
  import "../../../app.css";

  let { children } = $props();
</script>

<main class="cave-layout">
  {@render children()}
</main>

<style>
  .cave-layout {
    min-height: 100vh;
    background: #0a0a0f;
    overflow-x: hidden;
  }

  :global(body) {
    background: #0a0a0f;
    overflow-x: hidden;
  }
</style>
