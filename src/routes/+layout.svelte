<script>
  import "../app.css";

  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/header/Header.svelte";

  let { children } = $props();
</script>

<header class="header">
  <Header />
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
    background-size: cover;
    background-position: 30% 0%;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }
  @media (max-width: 1024px) {
    :global(html),
    :global(body) {
      background-size: auto 100vh;
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
