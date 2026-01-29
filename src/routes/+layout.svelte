<script>
  import "../app.css";

  import { page } from "$app/stores";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/header/Header.svelte";

  let { children } = $props();

  // Force collapsed header on archive and code-of-conduct pages
  let forceCollapsed = $derived(
    $page.url.pathname.startsWith("/archive") ||
      $page.url.pathname.startsWith("/code-of-conduct"),
  );
</script>

<svelte:head>
  <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="pragma" content="no-cache" />
  <meta http-equiv="expires" content="0" />
</svelte:head>

<!-- <header class="glass-header">
  <Header />
</header> -->
<header class="header">
  <Header {forceCollapsed} />
</header>

<main class="flex-1">
  {@render children()}
</main>

<footer>
  <Footer />
</footer>

<style>
  :global(html),
  :global(body) {
    background-image: url("/2026/background.jpg");
    background-size: auto calc(200vh + 3rem);
    background-position: 40% 0%;
    background-attachment: scroll;
    background-repeat: no-repeat;
  }

  @media (max-width: 768px) {
    :global(html),
    :global(body) {
      background-size: auto calc(200vh + 3rem);
      background-position: 40% 0%;
      background-attachment: scroll;
    }
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 50;
  }
</style>
