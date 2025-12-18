<script>
  import "../app.css";

  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/stores";

  let { children } = $props();
  let hideFooter = $derived($page.url.pathname.startsWith("/archive/2024"));
</script>

<!-- <header class="glass-header">
  <Header />
</header> -->

<main class="flex-1">
  {@render children()}
</main>

{#if !hideFooter}
  <footer class="p-8 bg-linear-to-br from-rose-400 to-red-300">
    <Footer />
  </footer>
{/if}
<!-- <style>
  .glass-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 50;
    background: rgba(255, 255, 255, 0.55);
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.65),
      rgba(255, 255, 255, 0.45)
    );
    backdrop-filter: blur(12px) saturate(120%);
    -webkit-backdrop-filter: blur(12px) saturate(120%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }

  .glass-header::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.6) 20%,
      rgba(255, 255, 255, 0.6) 80%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
  }

  @supports not (
    (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
  ) {
    .glass-header {
      background: rgba(255, 255, 255, 0.9);
    }
  }
</style> -->
