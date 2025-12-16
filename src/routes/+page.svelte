<script>
  import ComingSoon from "$lib/components/ComingSoon.svelte";
  import About from "$lib/components/About.svelte";
  import Organisers from "$lib/components/Organisers.svelte";
</script>

<svelte:head>
  <title>Cambridge Game Jam - Coming Soon</title>
  <meta name="description" content="Cambridge Game Jam 2026" />
</svelte:head>

<ComingSoon />

<section id="about">
  <About />
</section>

<section id="organisers">
  <Organisers />
</section>

<style>
  section#about {
    @apply bg-white;
  }

  section#organisers {
    @apply bg-gray-50;
  }

  :global(body) {
    scroll-behavior: smooth;
  }
</style>
