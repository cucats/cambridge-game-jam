<script>
  import LandingPage from "../lib/components/LandingPage.svelte";
  import About from "$lib/components/About.svelte";
  import Schedule from "$lib/components/Schedule.svelte";
  import Sponsors from "$lib/components/Sponsors.svelte";
  import Faq from "$lib/components/Faq.svelte";
  import YearSelector from "$lib/components/YearSelector.svelte";
  import Organisers from "$lib/components/Organisers.svelte";
</script>

<svelte:head>
  <title>The Cambridge Game Jam 2026</title>
  <meta name="description" content="The Cambridge Game Jam 2026" />
</svelte:head>

<LandingPage />

<section id="about">
  <About />
</section>

<section id="schedule">
  <Schedule />
</section>

<section id="sponsors">
  <Sponsors />
</section>

<section id="faq">
  <Faq />
</section>

<section id="archive">
  <YearSelector />
</section>

<section id="organisers">
  <Organisers />
</section>

<style>
  :global(body) {
    scroll-behavior: smooth;
  }
</style>
