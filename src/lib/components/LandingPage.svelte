<script>
  import { onMount } from "svelte";
  import EventCountdown from "$lib/components/EventCountdown.svelte";

  let mounted = false;
  let scrollY = $state(0);
  let windowHeight = $state(0);

  // Event dates
  const registrationClose = new Date("2026-01-29T23:59:59");
  const jamStart = new Date("2026-03-01T00:00:00");
  const jamEnd = new Date("2026-03-02T23:59:59");

  // Easing function - easeOutQuart for smooth deceleration (matches header feel)
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Get the about section position for clamping parallax
  function getAboutTop() {
    const aboutSection = document.getElementById("about");
    return aboutSection ? aboutSection.offsetTop : 800;
  }

  // Parallax calculations - only apply within landing page zone
  // When scrolled past about section, elements stay hidden
  // When scrolling back, they fade back in
  let titleTransform = $derived.by(() => {
    const aboutTop = typeof window !== "undefined" ? getAboutTop() : 800;
    // Clamp scroll to landing page area only
    const effectiveScroll = Math.min(scrollY, aboutTop);
    const progress = Math.min(1, effectiveScroll / (aboutTop * 0.8));
    const eased = easeOutQuart(progress);
    const translateY = Math.round(effectiveScroll * 0.35);
    const scale = 1 - eased * 0.15;
    const opacity = Math.max(0, 1 - eased * 1.2);
    return {
      transform: `translate3d(0, ${translateY}px, 0) scale(${scale.toFixed(3)})`,
      opacity: opacity.toFixed(2),
    };
  });

  // Countdown moves at medium speed, fades slightly later than title
  let countdownTransform = $derived.by(() => {
    const aboutTop = typeof window !== "undefined" ? getAboutTop() : 800;
    const effectiveScroll = Math.min(scrollY, aboutTop);
    const progress = Math.min(1, effectiveScroll / (aboutTop * 0.6));
    const eased = easeOutQuart(progress);
    const translateY = Math.round(effectiveScroll * 0.2);
    const opacity = Math.max(0, 1 - eased * 1.1);
    return {
      transform: `translate3d(0, ${translateY}px, 0)`,
      opacity: opacity.toFixed(2),
    };
  });

  // Scroll indicator fades fastest, creates depth
  let scrollIndicatorTransform = $derived.by(() => {
    const aboutTop = typeof window !== "undefined" ? getAboutTop() : 800;
    const effectiveScroll = Math.min(scrollY, aboutTop);
    const progress = Math.min(1, effectiveScroll / (aboutTop * 0.4));
    const eased = easeOutQuart(progress);
    const translateY = Math.round(effectiveScroll * 0.5);
    const opacity = Math.max(0, 1 - eased * 1.5);
    return {
      transform: `translate3d(0, ${translateY}px, 0)`,
      opacity: opacity.toFixed(2),
    };
  });

  // Landing container uses negative margin-bottom to pull the next section up
  let landingStyle = $derived.by(() => {
    // As you scroll, the landing section gains a negative bottom margin, pulling the content below it up.
    // This creates an overlap effect, effectively making the landing page "shrink" into the next section.
    const maxPullUpPx = 800; // The maximum amount (in pixels) the next section will be pulled up
    const pullUpScrollDistance = 350; // The scroll distance (in pixels) over which the pull-up effect occurs

    // Calculate scroll progress, clamped between 0 and 1
    const progress = Math.min(1, scrollY / pullUpScrollDistance);
    // Apply easing for a smoother deceleration effect
    const eased = easeOutQuart(progress);
    // Calculate the negative margin-bottom
    const marginBottom = -eased * maxPullUpPx;
    return `margin-bottom: ${marginBottom.toFixed(1)}px;`;
  });

  function onScroll() {
    scrollY = window.scrollY;
  }

  onMount(() => {
    mounted = true;
    windowHeight = window.innerHeight;
    scrollY = window.scrollY;

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  });
</script>

<div class="landing" style={landingStyle}>
  <div
    class="header-content parallax-element"
    style="transform: {titleTransform.transform}; opacity: {titleTransform.opacity};"
  >
    <h1 class="title">
      <span class="line">THE</span>
      <span class="line">CAMBRIDGE</span>
      <span class="line">GAME JAM</span>
      <span class="line line-year">2026</span>
    </h1>
  </div>

  <div
    class="countdown-wrap parallax-element"
    style="transform: {countdownTransform.transform}; opacity: {countdownTransform.opacity};"
  >
    <EventCountdown {registrationClose} {jamStart} {jamEnd} />
  </div>

  <div
    class="scroll-wrap parallax-element"
    style="transform: {scrollIndicatorTransform.transform}; opacity: {scrollIndicatorTransform.opacity};"
  >
    SCROLL DOWN
    <a
      href="#about"
      class="scroll-down"
      aria-label="Scroll down to about section"
    >
      &#x2304;
    </a>
  </div>
</div>

<style>
  .landing {
    min-height: 100vh;
    padding: 2rem 1rem 4rem;
    margin-top: 160px;
    position: relative;
  }

  @media (max-width: 1024px) {
    .landing {
      background-size: auto 100vh;
    }
  }

  .header-content {
    position: relative;
    display: block;
    width: 100%;
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .parallax-element {
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .title {
    position: relative;
    align-self: flex-start;
    display: inline-block;
    font-family: "Peaberry Base", monospace;
    color: #000000;
    text-align: left;
    letter-spacing: 3px;
    padding-right: 10px;
    line-height: 1.1;
    font-size: clamp(3.5rem, 12vw, 8rem);
    transform-origin: left top;
  }

  .title::after {
    content: "";
    position: absolute;
    inset: 0;
    border-right: 4px solid #1a1c1e;
    border-bottom: 4px solid #1a1c1e;
    pointer-events: none;
  }

  .line {
    display: block;
    white-space: nowrap;
    font-size: clamp(1.5rem, 10vw, 6.5rem);
  }

  .line-year {
    color: #f05663;
  }

  .countdown-wrap {
    margin-top: 40px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .scroll-wrap {
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: "Peaberry Base", monospace;
    color: #1a1c1e;
    font-size: 0.9rem;
    letter-spacing: 2px;
    padding-top: 120px;
  }

  .scroll-down {
    font-size: 2rem;
    margin-top: -8px;
    text-decoration: none;
    user-select: none;
    color: #1a1c1e;
  }
</style>
