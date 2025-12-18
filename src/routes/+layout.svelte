<script>
  import "../app.css";

  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/stores";

  let { children } = $props();
</script>

<main class="flex-1">
  {@render children()}
</main>

{#if !$page.url.pathname.startsWith("/archive/2023")}
  <footer class="p-8 bg-linear-to-br from-rose-400 to-red-300">
    <Footer />
  </footer>
{/if}
