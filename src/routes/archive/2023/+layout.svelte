<script>
  import "../../../app.css";

  let { children } = $props();
</script>

<main class="cg2023-root">
  {@render children()}
</main>

<style>
  :global(body > footer) {
    display: none;
  }

  .cg2023-root {
    min-height: 100vh;
    background: radial-gradient(1200px 700px at 50% 0%, #0b1021 0%, #03040a 45%, #000 100%);
    color: #e7ecff;
    overflow-x: hidden;
  }
</style>
