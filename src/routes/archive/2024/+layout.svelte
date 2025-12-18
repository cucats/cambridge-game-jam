<script>
  let { children } = $props();
</script>

<svelte:head>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      background: #0a0a0f;
    }
  </style>
</svelte:head>

{@render children()}
