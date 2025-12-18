<script>
  import "../../../app.css";
  let { children } = $props();
</script>

<main>
  {@render children()}
</main>

<style>
  main {
    flex: 1;
  }
</style>
