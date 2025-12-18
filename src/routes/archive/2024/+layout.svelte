<script>
  import "../../../app.css";
  let { children } = $props();
</script>

<div class="page-2024">
  {@render children()}
</div>

<style>
  .page-2024 {
    min-height: 100vh;
    overflow-x: hidden;
  }

  :global(.page-2024 body) {
    margin: 0;
    padding: 0;
  }
</style>
