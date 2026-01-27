<script>
  import { onMount } from "svelte";
  import EventCountdown from "$lib/components/EventCountdown.svelte";

  let mounted = false;
  let scrollY = $state(0);
  let windowHeight = $state(0);
  let ticking = false;

  // Event dates
  const registrationClose = new Date("2026-01-29T23:59:59");
  const jamStart = new Date("2026-03-01T00:00:00");
  const jamEnd = new Date("2026-03-02T23:59:59");

  // Parallax calculations - using Dave Gamache's principles
  // Effects start after scrolling past 200px
  let titleTransform = $derived.by(() => {
    const effectiveScroll = Math.max(0, scrollY - 200);
    const translateY = Math.round(effectiveScroll * 0.4);
    const scale = Math.max(0.8, 1 - effectiveScroll * 0.0003);
    const opacity = Math.max(0, 1 - effectiveScroll / 200);
    return {
      transform: `translate3d(0, ${translateY}px, 0) scale(${scale.toFixed(3)})`,
      opacity: opacity.toFixed(2),
    };
  });

  let countdownTransform = $derived.by(() => {
    const effectiveScroll = Math.max(0, scrollY - 200);
    const translateY = Math.round(effectiveScroll * 0.25);
    const opacity = Math.max(0, 1 - effectiveScroll / 500);
    return {
      transform: `translate3d(0, ${translateY}px, 0)`,
      opacity: opacity.toFixed(2),
    };
  });

  let scrollIndicatorTransform = $derived.by(() => {
    const effectiveScroll = Math.max(0, scrollY - 200);
    const translateY = Math.round(effectiveScroll * 0.6);
    const opacity = Math.max(0, 1 - effectiveScroll / 300);
    return {
      transform: `translate3d(0, ${translateY}px, 0)`,
      opacity: opacity.toFixed(2),
    };
  });

  let isAutoScrolling = false;
  let lastScrollY = 0;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        scrollY = window.scrollY;

        // Auto-scroll to about section if scrolled past 200px (and scrolling down)
        if (
          !isAutoScrolling &&
          scrollY > 200 &&
          scrollY > lastScrollY &&
          scrollY < 600
        ) {
          isAutoScrolling = true;
          const aboutSection = document.getElementById("about");
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: "smooth" });
            // Reset auto-scroll lock after animation completes
            setTimeout(() => {
              isAutoScrolling = false;
            }, 800);
          } else {
            isAutoScrolling = false;
          }
        }

        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    }
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
    min-height: 100vh;
    padding: 2rem 1rem;
    margin-top: 160px;
    position: relative;
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
    border-right: 4px solid #3d2914;
    border-bottom: 4px solid #3d2914;
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
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    font-family: "Peaberry Base", monospace;
    color: #3d2914;
    font-size: 0.9rem;
    letter-spacing: 2px;
  }

  .scroll-down {
    font-size: 2rem;
    margin-top: -12px;
    text-decoration: none;
    user-select: none;
    color: #3d2914;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(8px);
    }
  }
</style>
