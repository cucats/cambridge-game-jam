<script>
  import YearSelector from "./YearSelector.svelte";
</script>

<div class="about-container">
  <div class="about-content">
    <h2 class="about-title">About The Cambridge Game Jam</h2>

    <div class="about-text">
      <p>
        <strong>Now in its fourth year</strong>, The Cambridge Game Jam is a 48
        hour game jam hosted by the Cambridge University Computing and
        Technology Society. Over an action-packed weekend, you will have 48
        hours to build a game in teams or individually based around a theme
        (announced at the beginning of the jam)!
      </p>

      <p>
        This jam is our excuse to champion projects that exist purely for the
        joy of making them. We welcome <strong>curious beginners</strong> and
        <strong>seasoned devs</strong> alike—tinker with a tool you have never touched,
        chase an odd idea, and ship something that makes you grin simply because you
        brought it to life.
      </p>
    </div>
  </div>

  <YearSelector />
</div>

<style>
  .about-container {
    position: relative;
    width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
    background: white;
  }

  .about-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 4rem 2rem 3rem;
    text-align: center;
  }

  .about-title {
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 2rem;
    color: #1a1a1a;
    animation: fade-in-up 0.8s ease-out both;
  }

  .about-text {
    max-width: 700px;
    margin: 0 auto;
  }

  .about-text p {
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
    line-height: 1.7;
    margin-bottom: 1.5rem;
    color: #444;
    animation: fade-in-up 0.8s ease-out both;
  }

  .about-text p:nth-child(1) {
    animation-delay: 0.2s;
  }

  .about-text p:nth-child(2) {
    animation-delay: 0.4s;
  }

  .about-text strong {
    color: #000;
    font-weight: 700;
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

  @media (prefers-reduced-motion: reduce) {
    .about-title,
    .about-text p {
      animation: none !important;
    }
  }

  @media (max-width: 768px) {
    .about-content {
      padding: 3rem 1.5rem 2rem;
    }
  }
</style>
