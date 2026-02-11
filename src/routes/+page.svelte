<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import LandingPage from "../lib/components/LandingPage.svelte";
  import About from "$lib/components/About.svelte";
  import Schedule from "$lib/components/Schedule.svelte";
  import Sponsors from "$lib/components/Sponsors.svelte";
  import FAQ from "$lib/components/FAQ.svelte";
  import YearSelector from "$lib/components/YearSelector.svelte";
  import Organisers from "$lib/components/Organisers.svelte";
  import DuckBorder from "../lib/components/duck-border.svelte";

  let scrollY = $state(0);
  let windowHeight = $state(0);
  let ticking = false;
  let aboutSnapLimit = 0;

  // Easing function - easeOutQuart (matches header & landing page)
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Section parallax configs - coordinated with header's 0.3s ease
  // Subtle reveal animations that feel connected to the scroll
  const sectionConfigs = [
    { id: "about", revealOffset: 60, fadeDistance: 400 },
    { id: "schedule", revealOffset: 80, fadeDistance: 350 },
    { id: "sponsors", revealOffset: 70, fadeDistance: 380 },
    { id: "faq", revealOffset: 60, fadeDistance: 350 },
    { id: "archive", revealOffset: 50, fadeDistance: 300 },
    { id: "organisers", revealOffset: 50, fadeDistance: 300 },
  ];

  function getSectionStyle(sectionId) {
    const config = sectionConfigs.find((s) => s.id === sectionId);
    if (!config || !browser) return "";

    const el = document.getElementById(sectionId);
    if (!el) return "";

    const elementTop = el.offsetTop;
    const distanceFromView = elementTop - scrollY - windowHeight;

    // Calculate reveal progress with easing
    const rawProgress = Math.min(
      1,
      Math.max(0, 1 - distanceFromView / config.fadeDistance),
    );
    const revealProgress = easeOutQuart(rawProgress);

    // Reveal animation - slides up and fades in
    const opacity = revealProgress.toFixed(2);
    const revealTranslateY = Math.round(
      (1 - revealProgress) * config.revealOffset,
    );

    return `transform: translate3d(0, ${revealTranslateY}px, 0); opacity: ${opacity};`;
  }

  // Reactive section styles
  let aboutStyle = $derived(getSectionStyle("about"));
  let scheduleStyle = $derived(getSectionStyle("schedule"));
  let sponsorsStyle = $derived(getSectionStyle("sponsors"));
  let faqStyle = $derived(getSectionStyle("faq"));
  let archiveStyle = $derived(getSectionStyle("archive"));
  let organisersStyle = $derived(getSectionStyle("organisers"));

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        scrollY = window.scrollY;
        if (browser) {
          const root = document.documentElement;
          if (scrollY > aboutSnapLimit + 4) {
            root.classList.add("no-snap");
          } else {
            root.classList.remove("no-snap");
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  onMount(() => {
    if (browser) {
      windowHeight = window.innerHeight;
      scrollY = window.scrollY;
      const headerHeight = 48;
      const aboutEl = document.getElementById("about");
      aboutSnapLimit = aboutEl ? aboutEl.offsetTop - headerHeight : 0;

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener(
        "resize",
        () => {
          windowHeight = window.innerHeight;
          const aboutSection = document.getElementById("about");
          aboutSnapLimit = aboutSection
            ? aboutSection.offsetTop - headerHeight
            : 0;
        },
        { passive: true },
      );

      return () => {
        window.removeEventListener("scroll", onScroll);
      };
    }
  });
</script>

<svelte:head>
  <title>The Cambridge Game Jam 2026</title>
  <meta name="description" content="The Cambridge Game Jam 2026" />
</svelte:head>

<div class="snap-scroll-section">
  <LandingPage />
</div>
<section
  id="about"
  class="parallax-section snap-scroll-section"
  style={aboutStyle}
>
  <About />
</section>

<section id="schedule" class="parallax-section" style={scheduleStyle}>
  <DuckBorder />
  <Schedule />
</section>

<section id="sponsors" class="parallax-section" style={sponsorsStyle}>
  <Sponsors />
</section>

<section id="faq" class="parallax-section" style={faqStyle}>
  <FAQ />
</section>

<section id="organisers" class="parallax-section" style={organisersStyle}>
  <Organisers />
</section>

<section id="archive" class="parallax-section" style={archiveStyle}>
  <YearSelector />
</section>

<style>
  :global(html) {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
  }

  :global(html.no-snap) {
    scroll-snap-type: none;
  }

  .snap-scroll-section {
    scroll-snap-align: start;
  }

  .parallax-section {
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
  }
</style>
