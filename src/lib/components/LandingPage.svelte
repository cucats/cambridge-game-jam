<script>
  import { onMount } from "svelte";
  import EventCountdown from "$lib/components/EventCountdown.svelte";

  let mounted = false;
  let scrollY = $state(0);
  let windowHeight = $state(0);
  let isSnapping = false;
  let lastScrollY = 0;

  // Event dates
  const registrationClose = new Date("2026-02-10T23:59:59");
  const jamStart = new Date("2026-02-27T18:00:00");
  const jamEnd = new Date("2026-03-01T16:00:00");

  // Easing function - easeOutQuart for smooth deceleration (matches header feel)
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Get the about section position for clamping parallax
  function getAboutTop() {
    const aboutSection = document.getElementById("about");
    return aboutSection ? aboutSection.offsetTop : 800;
  }

  // Snap scroll thresholds
  const SNAP_DOWN_THRESHOLD = 20; // Scroll down past this to snap to about
  const SNAP_UP_THRESHOLD = 50; // When in about zone, scroll up past this from about to snap back

  function snapToAbout() {
    if (isSnapping) return;
    isSnapping = true;
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      const headerHeight = 48;
      window.scrollTo({
        top: aboutSection.offsetTop - headerHeight,
        behavior: "smooth",
      });
      setTimeout(() => {
        isSnapping = false;
      }, 500);
    } else {
      isSnapping = false;
    }
  }

  function snapToTop() {
    if (isSnapping) return;
    isSnapping = true;
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setTimeout(() => {
      isSnapping = false;
    }, 500);
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
    const opacity = Math.max(0, 1 - eased * 10);
    return {
      transform: `translate3d(-50%, ${translateY}px, 0)`,
      opacity: opacity.toFixed(2),
    };
  });

  function onScroll() {
    const currentScrollY = window.scrollY;
    const aboutTop = getAboutTop();
    const headerHeight = 48;
    const aboutScrollPosition = aboutTop - headerHeight;
    const scrollingDown = currentScrollY > lastScrollY;

    scrollY = currentScrollY;

    // Skip snap logic if navigation scroll is in progress
    const isNavScrolling =
      typeof window !== "undefined" && window.__navScrolling;

    // Snap logic
    if (!isSnapping && !isNavScrolling) {
      // Scrolling down from top - snap to about
      if (
        scrollingDown &&
        lastScrollY < SNAP_DOWN_THRESHOLD &&
        currentScrollY >= SNAP_DOWN_THRESHOLD &&
        currentScrollY < aboutScrollPosition - 100
      ) {
        snapToAbout();
      }
      // Scrolling up from about section - snap back to top
      else if (
        !scrollingDown &&
        lastScrollY >= aboutScrollPosition - SNAP_UP_THRESHOLD &&
        currentScrollY < aboutScrollPosition - SNAP_UP_THRESHOLD &&
        currentScrollY > SNAP_DOWN_THRESHOLD
      ) {
        snapToTop();
      }
    }

    lastScrollY = currentScrollY;
  }

  onMount(() => {
    mounted = true;
    windowHeight = window.innerHeight;
    scrollY = window.scrollY;
    lastScrollY = window.scrollY;

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  });
</script>

<div class="landing">
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
    height: 100vh;
    padding: 2rem 1rem 4rem;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
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
    font-size: clamp(3rem, 5vw, 5rem);
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
    font-size: clamp(2rem, 6vw, 5rem);
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
    position: absolute;
    bottom: 1.5rem;
    left: 50vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: "Peaberry Base", monospace;
    color: #1a1c1e;
    font-size: 0.9rem;
    letter-spacing: 2px;
  }

  .scroll-down {
    font-size: 2rem;
    margin-top: -8px;
    text-decoration: none;
    user-select: none;
    color: #1a1c1e;
  }
</style>
