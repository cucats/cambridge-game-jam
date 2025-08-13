<script>
  import Hero from "$lib/components/Hero.svelte";
  import Sponsors from "$lib/components/Sponsors.svelte";
  import About from "$lib/components/About.svelte";
  import Schedule from "$lib/components/Schedule.svelte";
  import Rules from "$lib/components/Rules.svelte";
  import FAQ from "$lib/components/FAQ.svelte";
  import Organisers from "$lib/components/Organisers.svelte";
</script>

<svelte:head>
  <title>Cambridge Game Jam</title>
</svelte:head>

<section class="p-8 bg-gradient-to-br from-rose-400 to-red-300">
  <Hero />
</section>

<section>
  <Sponsors />
</section>

<section id="about">
  <About />
</section>

<section id="schedule">
  <Schedule />
</section>

<section id="rules">
  <Rules />
</section>

<section id="faq">
  <FAQ />
</section>

<section id="organisers">
  <Organisers />
</section>

<style>
  section:nth-child(odd) {
    @apply bg-rose-50/80;
  }

  section:nth-child(even) {
    @apply bg-white;
  }
</style>
