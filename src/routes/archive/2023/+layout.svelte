<script>
  let { children } = $props();
</script>

<svelte:head>
  <style>
    footer {
      display: none !important;
    }
  </style>
</svelte:head>

{@render children()}
