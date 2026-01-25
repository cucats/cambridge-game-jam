<script>
  import "../app.css";

  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/header/Header.svelte";
  import Background from "$lib/components/Background.svelte";

  let { children } = $props();
</script>

<Background />
<!-- 
<header class="header">
  <Header />
</header> -->

<main class="flex-1">
  {@render children()}
</main>

<footer class="p-8 bg-linear-to-br from-rose-400 to-red-300">
  <Footer />
</footer>

<style>
  :global(body) {
    background: transparent;
  }

  .header {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 50;
  }
</style>
