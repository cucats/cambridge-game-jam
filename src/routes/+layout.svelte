<script>
  import "../app.css";

  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/state";

  let { children } = $props();
  const hideFooter = $derived(page.url.pathname.startsWith("/archive/2024"));
</script>

<main class="flex-1">
  {@render children()}
</main>

{#if !hideFooter}
  <footer class="p-8 bg-linear-to-br from-rose-400 to-red-300">
    <Footer />
  </footer>
{/if}
