<script>
  import { onMount } from "svelte";

  let scrollY = 0;
  let container;

  onMount(() => {
    const handleScroll = () => {
      scrollY = window.scrollY * 0.3;
      if (container) {
        container.style.transform = `translateY(${scrollY}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<div class="stars-container" bind:this={container}>
  {#each { length: 50 } as _, i}
    <div
      class="star"
      style="--x: {Math.random() * 100}%; --y: {Math.random() *
        40}%; --delay: {Math.random() * 3}s;"
    />
  {/each}
</div>

<style>
  .stars-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(
      180deg,
      #0a0e27 0%,
      #0f1638 8%,
      #1a2047 16%,
      #253a6f 28%,
      #1a5fa0 42%,
      #2080c8 56%,
      #4db8d9 72%,
      #6dd9e8 100%
    );
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
    will-change: transform;
  }

  .star {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #ffffff;
    border-radius: 0%;
    left: var(--x);
    top: var(--y);
    opacity: 0;
    box-shadow: none;
    animation: twinkle 4s infinite ease-in-out;
    animation-delay: var(--delay);
    image-rendering: pixelated;
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.2;
    }
    20% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
    80% {
      opacity: 0.4;
    }
  }
</style>
