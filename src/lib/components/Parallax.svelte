<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  /**
   * Parallax implementation following Dave Gamache's "Parallax Done Right" principles:
   * - Use only translate3d, scale, opacity (GPU accelerated)
   * - requestAnimationFrame for smooth 60fps
   * - Round values to avoid subpixel rendering
   * - Only animate elements in viewport
   * - Fixed/absolute positioned elements only
   */

  let { children } = $props();

  let scrollY = $state(0);
  let windowHeight = $state(0);
  let ticking = false;
  let animationInterval;

  // Parallax layers - each child section gets different parallax speeds
  const layers = [
    {
      selector: ".parallax-hero",
      speed: 0.3,
      opacity: true,
      fadeStart: 0,
      fadeEnd: 400,
    },
    { selector: ".parallax-section", speed: 0.05, opacity: false },
  ];

  function updateParallax() {
    if (!browser) return;

    const elements = document.querySelectorAll("[data-parallax]");

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallaxSpeed) || 0.1;
      const fadeOut = el.dataset.parallaxFade === "true";

      // Only animate if in viewport (with buffer)
      const inViewport = rect.bottom > 0 && rect.top < windowHeight;

      if (!inViewport) return;

      // Calculate parallax offset
      const offsetTop = el.offsetTop;
      const scrollOffset = scrollY - offsetTop;
      const translateY = Math.round(scrollOffset * speed);

      // Calculate opacity if fade is enabled
      let opacity = 1;
      if (fadeOut && scrollY > 0) {
        opacity = Math.max(0, 1 - scrollY / 500);
        opacity = +opacity.toFixed(2);
      }

      // Apply transforms using translate3d for GPU acceleration
      el.style.transform = `translate3d(0, ${translateY}px, 0)`;

      if (fadeOut) {
        el.style.opacity = opacity;
      }
    });

    ticking = false;
  }

  function onScroll() {
    scrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  function onResize() {
    windowHeight = window.innerHeight;
  }

  onMount(() => {
    if (browser) {
      windowHeight = window.innerHeight;
      scrollY = window.scrollY;

      // Use interval for consistent updates (per Dave's recommendation)
      animationInterval = setInterval(() => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, 10);

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });

      // Initial update
      updateParallax();
    }
  });

  onDestroy(() => {
    if (browser) {
      clearInterval(animationInterval);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    }
  });
</script>

<div class="parallax-container">
  {@render children()}
</div>

<style>
  .parallax-container {
    position: relative;
    overflow: visible;
  }

  /* Global parallax styles */
  :global([data-parallax]) {
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  :global(.parallax-layer) {
    position: relative;
    transform-style: preserve-3d;
  }

  :global(.parallax-fixed) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: none;
  }

  :global(.parallax-fixed > *) {
    pointer-events: auto;
  }
</style>
