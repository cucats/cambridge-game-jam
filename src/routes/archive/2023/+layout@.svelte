<script>
  let { children } = $props();
</script>

{@render children()}

<style>
  :global(html) {
    scroll-behavior: smooth;
    overscroll-behavior: none;
  }

  :global(body) {
    margin: 0;
    min-height: 100svh;
    background: #020306;
  }
</style>
