<section class="hero-container">
  <div class="hero-content">
    <div class="title-container">
      <div class="title-inner">
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
        <h1 class="peaberry-title">The Cambridge Game Jam 2026</h1>
      </div>
    </div>
  </div>
</section>

<style>
  .hero-container {
    min-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 1;
    padding: 2rem;
    overflow: hidden;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 800px;
    width: 100%;
  }

  /* Stardew-inspired title container */
  .title-container {
    position: relative;
    width: 100%;
    max-width: 600px;
  }

  .title-inner {
    position: relative;
    background: linear-gradient(
      180deg,
      rgba(139, 90, 43, 0.95) 0%,
      rgba(101, 67, 33, 0.95) 100%
    );
    border: 4px solid #5c4023;
    border-radius: 4px;
    padding: 1.5rem 2rem;
    box-shadow:
      0 6px 0 #3d2914,
      inset 0 2px 0 rgba(255, 255, 255, 0.2),
      inset 0 -2px 0 rgba(0, 0, 0, 0.2);
  }

  .title-inner::before {
    content: "";
    position: absolute;
    inset: 4px;
    border: 2px solid rgba(255, 215, 140, 0.3);
    border-radius: 2px;
    pointer-events: none;
  }

  .corner {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #ffd78c;
    border: 2px solid #5c4023;
  }

  .corner-tl {
    top: -6px;
    left: -6px;
  }
  .corner-tr {
    top: -6px;
    right: -6px;
  }
  .corner-bl {
    bottom: -6px;
    left: -6px;
  }
  .corner-br {
    bottom: -6px;
    right: -6px;
  }

  .peaberry-title {
    font-family: "Peaberry Base", monospace;
    text-align: center;
    color: #fff8dc;
    font-size: clamp(1rem, 8vw, 2.5rem);
    text-shadow:
      2px 2px 0 #3d2914,
      -1px -1px 0 #3d2914,
      1px -1px 0 #3d2914,
      -1px 1px 0 #3d2914;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }
</style>
