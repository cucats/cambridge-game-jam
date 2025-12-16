<script>
  import ComingSoon from "$lib/components/ComingSoon.svelte";
  import About from "$lib/components/About.svelte";
  import Organisers from "$lib/components/Organisers.svelte";
</script>

<svelte:head>
  <title>The Cambridge Game Jam 2026</title>
  <meta name="description" content="The Cambridge Game Jam 2026" />
</svelte:head>

<ComingSoon />

<section id="about" class="bg-white">
  <About />
</section>

<section id="organisers" class="bg-gray-50">
  <Organisers />
</section>

<style>

  :global(body) {
    scroll-behavior: smooth;
  }
</style>
