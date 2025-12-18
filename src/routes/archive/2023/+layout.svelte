<script>
  import "../../../app.css";
  let { children } = $props();
</script>

<main class="cave-page">
  {@render children()}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #0a0a0f;
  }

  .cave-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  }

  :global(footer) {
    display: none !important;
  }
</style>
