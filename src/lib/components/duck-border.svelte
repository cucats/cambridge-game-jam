<div class="duck-border">
  <div class="duck-track">
    {#each Array(24) as _, i}
      <!-- Decorative duck border image: intentionally hidden from assistive technologies -->
      <img
        src="/2026/duck-standing-{(i % 3) + 1}-transparent.png"
        alt=""
        aria-hidden="true"
        class="duck"
        style="animation-delay: {(i % 12) * 0.1}s;"
      />
    {/each}
  </div>
</div>

<style>
  .duck-border {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 1rem 0;
    overflow: hidden;
    background: #fffae6;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }

  .duck-track {
    display: flex;
    gap: 0.5rem;
    animation: scroll 8s linear infinite reverse;
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .duck {
    flex-shrink: 0;
    width: clamp(32px, 6vw, 64px);
    height: auto;
    image-rendering: pixelated;
    animation: hop 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
    transform: scaleX(-1);
  }

  @keyframes hop {
    0%,
    100% {
      transform: scaleX(-1) translateY(0) scaleY(1);
    }
    20% {
      transform: scaleX(-1) translateY(2px) scaleY(0.92);
    }
    50% {
      transform: scaleX(-1) translateY(-8px) scaleY(1.05);
    }
    80% {
      transform: scaleX(-1) translateY(0) scaleY(0.98);
    }
  }
</style>
