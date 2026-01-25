<script>
  import ComingSoon from "$lib/components/ComingSoon.svelte";
  import About from "$lib/components/About.svelte";
  import Organisers from "$lib/components/Organisers.svelte";
  import LandingPage from "../lib/components/LandingPage.svelte";
</script>

<svelte:head>
  <title>The Cambridge Game Jam 2026</title>
  <meta name="description" content="The Cambridge Game Jam 2026" />
</svelte:head>

<LandingPage />

<section id="about">
  <About />
</section>

<section id="organisers">
  <Organisers />
</section>

<style>
  :global(body) {
    scroll-behavior: smooth;
  }
</style>
