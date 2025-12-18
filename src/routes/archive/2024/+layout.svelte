<script>
  import "../../../app.css";
  let { children } = $props();
</script>

<svelte:head>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
  </style>
</svelte:head>

{@render children()}
