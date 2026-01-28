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
