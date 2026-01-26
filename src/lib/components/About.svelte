<div class="about-container">
  <div class="about-content">
    <h2 class="about-title">About</h2>
    <div>
      <div class="about-grid">
        <div>
          <div class="about-subtitle">What is a game jam?</div>
          <img
            src="/2026/jam-1.jpg"
            alt="8-bit drawing of a jam"
            class="float-right ml-4 mb-2 size-32 sm:size-40 md:size-48"
          />
          <p class="about-text">
            Over an action-packed weekend, you will have 48 hours to build a
            game in teams, based around a theme (announced at the beginning of
            the jam)!
            <br />
            There will also be prizes for a range of categories, including music,
            art, and more.
          </p>
        </div>
        <div>
          <div class="about-subtitle">Who is invited?</div>
          <img
            src="/2026/girl.jpg"
            alt="8-bit drawing of a girl"
            class="float-left mr-4 mb-2 size-32 sm:size-40 md:size-48"
          />
          <p class="about-text-right">
            <strong>Everyone!</strong>
            We welcome game developers, artists, musicians, and anything in between.
            Whether you're a seasoned game developer or a complete beginner, this
            event is for you. The jam is a great opportunity to learn new skills,
            meet like-minded people, and have fun creating games together.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .about-container {
    position: relative;
    width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
  }

  .about-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 4rem 2rem 3rem;
    text-align: center;
  }

  .about-grid {
    display: flex;
    gap: 3rem;
    margin-top: 2rem;
    align-items: flex-start;
  }

  @media (max-width: 600px) {
    .about-grid {
      flex-direction: column;
    }
  }

  .about-title {
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 2rem;
    color: #1a1a1a;
    align-self: flex-start;
  }

  .about-text {
    max-width: 700px;
    margin: 0 auto;
    text-align: justify;
  }

  .about-text-right {
    max-width: 700px;
    margin: 0 auto;
    text-align: justify;
  }

  .about-subtitle {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #000;
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
