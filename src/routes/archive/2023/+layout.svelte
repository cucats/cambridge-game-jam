<script>
  import "../../../app.css";
  let { children } = $props();
</script>

<main class="flex-1">
  {@render children()}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
</style>
