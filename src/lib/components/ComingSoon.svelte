<script>
  function scrollToAbout() {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  }
</script>

<!-- Compact, left-aligned hero section -->
<section class="hero-container">
  <div class="hero-inner">
    <div class="logo-column">
      <div class="logo-container">
        <img
          src="/2026/logo.png"
          alt="The Cambridge Game Jam 2026 Logo"
          class="logo"
          decoding="async"
        />
      </div>
    </div>

    <div class="content-column">
      <h1 class="main-title">The Cambridge Game Jam 2026</h1>
      <h2 class="subtitle">Coming Soon...</h2>
    </div>
  </div>
</section>

<style>
  .hero-container {
    position: relative;
    width: 100%;
    padding: 3rem 1.5rem;
    background-color: #05020d;
    background-image:
      linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.7) 40%,
        rgba(0, 0, 0, 0.9) 100%
      ),
      url("/2024/group-photo.jpg");
    background-size: cover;
    background-position: center 65%;
    background-repeat: no-repeat;
    color: white;
    display: flex;
    justify-content: center;
  }

  .hero-inner {
    width: 100%;
    max-width: 960px;
    display: flex;
    gap: 2.5rem;
    align-items: center;
  }

  .logo-column {
    flex: 0 0 auto;
  }

  .logo-container {
    animation: fade-in-down 1s ease-out;
  }

  .logo {
    display: block;
    width: clamp(96px, 14vw, 160px);
    height: auto;
    margin-inline: 0;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
  }
  .main-title {
    font-size: 2rem;
    font-weight: 600;
    margin-top: 1rem;
    line-height: 1;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    letter-spacing: 0.02em;
    animation: fade-in-up 1s ease-out 0.2s both;
  }

  .subtitle {
    font-size: 2rem;
    font-weight: 400;
    color: #ffd700;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
    animation: fade-in-up 1s ease-out 0.4s both;
  }

  /* Animations */
  @keyframes fade-in-down {
    0% {
      opacity: 0;
      transform: translateY(-30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-up {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .logo {
      width: 140px;
      height: 140px;
    }
  }

  @media (max-width: 480px) {
    .logo {
      width: 120px;
      height: 120px;
    }

    .main-title {
      margin-bottom: 0.75rem;
    }
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .logo-container,
    .main-title,
    .subtitle {
      animation: none !important;
    }
  }
</style>
