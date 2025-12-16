<script>
  function scrollToAbout() {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  }
</script>

<!-- Clean, professional landing hero section -->
<section class="hero-container">
  <div class="background-image">
    <img
      src="/2024/group-photo.jpg"
      alt="The Cambridge Game Jam Group Photo"
      class="hero-photo"
      decoding="async"
    />
    <div class="overlay"></div>
  </div>

  <div class="hero-content">
    <div class="logo-container">
      <img
        src="/2026/logo.png"
        alt="The Cambridge Game Jam 2026 Logo"
        class="logo"
        decoding="async"
      />
    </div>

    <h1 class="main-title">Coming Soon</h1>

    <h2 class="subtitle">The Cambridge Game Jam 2026</h2>

    <div class="description">
      <p class="lead-text">
        The ultimate 48-hour game development challenge is returning.
      </p>
      <p class="detail-text">
        Join us for an incredible weekend of creativity, collaboration, and game
        creation.
      </p>
    </div>
  </div>

  <!-- Scroll indicator -->
  <button class="scroll-indicator" on:click={scrollToAbout}>
    <div class="scroll-text">Learn More</div>
    <div class="scroll-arrow">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
      </svg>
    </div>
  </button>
</section>

<style>
  .hero-container {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .background-image {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .hero-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.7) 50%,
      rgba(0, 0, 0, 0.85) 100%
    );
  }

  .hero-content {
    position: relative;
    z-index: 10;
    max-width: 900px;
    padding: 2rem;
    text-align: center;
    color: white;
  }

  .logo-container {
    margin-bottom: 2rem;
    animation: fade-in-down 1s ease-out;
    display: grid;
    place-items: center;
  }

  .logo {
    display: block;
    width: clamp(120px, 18vw, 220px);
    height: auto;
    margin-inline: auto;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
  }

  .main-title {
    font-size: clamp(3rem, 10vw, 6rem);
    font-weight: 300;
    margin-bottom: 1rem;
    line-height: 1;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    font-family: "Georgia", serif;
    letter-spacing: 0.02em;
    animation: fade-in-up 1s ease-out 0.2s both;
  }

  .subtitle {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 600;
    margin-bottom: 2rem;
    color: #ffd700;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
    animation: fade-in-up 1s ease-out 0.4s both;
  }

  .description {
    margin-bottom: 3rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    animation: fade-in-up 1s ease-out 0.6s both;
  }

  .lead-text {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    font-weight: 500;
    margin-bottom: 1rem;
    line-height: 1.4;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  }

  .detail-text {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    line-height: 1.5;
    opacity: 0.95;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  }

  .info-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 2rem;
    animation: fade-in-up 1s ease-out 0.8s both;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    min-width: 150px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .card-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .card-text {
    font-size: 1rem;
    font-weight: 600;
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: white;
    animation: bounce 2s ease-in-out infinite;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    transition: opacity 0.3s ease;
  }

  .scroll-indicator:hover {
    opacity: 0.8;
  }

  .scroll-text {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  }

  .scroll-arrow {
    display: flex;
    justify-content: center;
  }

  .scroll-arrow svg {
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.7));
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
    .hero-content {
      padding: 1rem;
    }

    .logo {
      width: 140px;
      height: 140px;
    }

    .info-cards {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .info-card {
      width: 100%;
      max-width: 250px;
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
    .subtitle,
    .description,
    .info-cards,
    .scroll-indicator {
      animation: none !important;
    }
  }
</style>
