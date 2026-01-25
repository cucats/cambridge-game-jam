<script>
  import Hamburger from "$lib/components/header/Hamburger.svelte";
  import MobileMenu from "$lib/components/header/MobileMenu.svelte";

  let expanded = $state(false);
</script>

<div class="header-container">
  <div class="flex justify-between items-center h-[60px]">
    <a href="/" class="select-none logo-link">
      <div class="flex items-center gap-2">
        <img
          class="h-[50px] logo-image"
          src="/2026/jam.png"
          alt="Cambridge Game Jam Logo"
        />
        <span class="logo-text">Cambridge Game Jam 2026</span>
      </div>
    </a>
    <div class="px-4">
      <nav
        class="max-md:hidden flex items-center gap-6 text-xl font-semibold transition-colors"
      >
        <!-- Navigation items here -->
      </nav>
      <Hamburger bind:expanded />
    </div>
  </div>
  {#if expanded}
    <MobileMenu bind:expanded />
  {/if}
</div>

<style>
  .header-container {
    max-width: 7xl;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .logo-link {
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    position: relative;
  }

  .logo-link:hover {
    transform: scale(1.05);
  }

  .logo-link::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #6dd9e8, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .logo-link:hover::after {
    opacity: 1;
  }

  .logo-image {
    filter: drop-shadow(0 0 4px rgba(109, 241, 226, 0.4));
    image-rendering: pixelated;
  }

  .logo-text {
    font-family: "Peaberry Base", monospace;
    color: #6dd9e8;
    text-shadow:
      0 0 8px rgba(109, 241, 226, 0.6),
      0 0 16px rgba(32, 128, 200, 0.3);
    letter-spacing: 1px;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    .logo-text {
      display: none;
    }
  }
</style>
