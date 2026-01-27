<div class="about-container">
  <div class="about-content">
    <h2 class="section-title">About</h2>

    <div class="card">
      <div class="card-header">
        <span class="pixel-icon">▶</span>
        <span class="about-subtitle">What is a game jam?</span>
      </div>
      <div class="card-body">
        <img
          src="/2026/jam-1.jpg"
          alt="8-bit drawing of a jam"
          class="card-img right"
        />
        <p>
          Over an action-packed weekend, you will have <strong>48 hours</strong>
          to build a game in teams, based around a theme (announced at the beginning
          of the jam)!
        </p>
        <p>
          There will also be prizes for a range of categories, including music,
          art, and more!
        </p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="pixel-icon">▶</span>
        <span class="about-subtitle">Who is invited?</span>
      </div>
      <div class="card-body reverse">
        <img
          src="/2026/girl.jpg"
          alt="8-bit drawing of a girl"
          class="card-img left"
        />
        <p>
          <strong>Everyone!</strong> We welcome game developers, artists, musicians,
          and anything in between.
        </p>
        <p>
          Whether you're a seasoned game developer or a complete beginner, this
          event is for you. The jam is a great opportunity to learn new skills,
          meet like-minded people, and have fun creating games together.
        </p>
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
    max-width: 800px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card {
    background: #fffdf8;
    border: 3px solid #3d2914;
    position: relative;
  }

  .card-header {
    background: #3d2914;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .pixel-icon {
    color: #86e293;
    font-size: 0.75rem;
  }

  .about-subtitle {
    color: #fffdf8;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .card-body {
    padding: 1.25rem;
  }

  .card-body p {
    color: #3d2914;
    line-height: 1.7;
    margin-bottom: 0.75rem;
  }

  .card-body p:last-of-type {
    margin-bottom: 0;
  }

  .card-img {
    width: 120px;
    height: 120px;
    object-fit: contain;
    image-rendering: pixelated;
    flex-shrink: 0;
  }

  .card-img.right {
    float: right;
    margin: 0 0 0.75rem 1rem;
  }

  .card-img.left {
    float: left;
    margin: 0 1rem 0.75rem 0;
  }

  .card-body strong {
    color: #f05663;
  }

  @media (max-width: 600px) {
    .about-content {
      padding: 2rem 1rem;
    }

    .card-img {
      width: 90px;
      height: 90px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
