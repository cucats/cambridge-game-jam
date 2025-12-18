<script>
  import ReflectionScene from "./ReflectionScene.svelte";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const featured = [
    {
      src: "/2024/blight.png",
      alt: "Blight",
      link: "https://hex-26.itch.io/blight",
      title: "Blight",
      prize: "Most Popular and Best Gameplay",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      alt: "Reflect Upon Your Actions",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular and Most Original",
    },
    {
      src: "/2024/reflected.png",
      alt: "Reflected",
      link: "https://ekorrette.itch.io/reflected",
      title: "Reflected",
      prize: "Theme Winner",
    },
    {
      src: "/2024/asymmetry.png",
      alt: "Asymmetry",
      link: "https://alex-davies.itch.io/asymmetry",
      title: "Asymmetry",
      prize: "Best Gameplay",
    },
    {
      src: "/2024/coulda-woulda-buddha.png",
      alt: "Coulda Woulda Buddha",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
    },
  ];

  const allSubmissions = {
    src: "/2024/all-submissions.png",
    alt: "All Submissions",
    link: "https://itch.io/jam/camgamejam2024",
    title: "All Submissions",
  };
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="Cambridge Game Jam 2024 — Reflection" />
</svelte:head>

<div class="page">
  <div class="stage" aria-hidden="true">
    <ReflectionScene />
    <div class="vignette"></div>
    <div class="scan"></div>
  </div>

  <div class="ui">
    <header class="topbar">
      <a class="chip" href="/archive">Lorem</a>
      <a class="chip" href="/">Ipsum</a>
      <div class="spacer"></div>
      <a class="chip chip-strong" href={allSubmissions.link}>All Submissions</a>
    </header>

    <section class="hero">
      <div class="hero-left">
        <div class="kicker">{duration}</div>
        <h1 class="title">{title}</h1>
        <div class="meta">
          <div class="pill">{theme}</div>
          <div class="pill">{submissions}</div>
        </div>
        <p class="lead">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div class="cta">
          <a class="btn btn-primary" href={allSubmissions.link}>All Submissions</a>
          <a class="btn" href="#featured">Reflection</a>
        </div>
        <p class="fine">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.
        </p>
      </div>

      <div class="hero-right" aria-hidden="true">
        <div class="sigil">
          <div class="sigil-inner"></div>
        </div>
        <div class="stack">
          <div class="stack-row">Reflection</div>
          <div class="stack-row">Reflection</div>
          <div class="stack-row">Reflection</div>
        </div>
      </div>
    </section>

    <section id="featured" class="featured">
      <div class="section-head">
        <h2 class="section-title">Reflection</h2>
        <p class="section-sub">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
        </p>
      </div>

      <div class="grid">
        {#each featured as item (item.title)}
          <a class="card" href={item.link}>
            <div class="thumb">
              <img src={item.src} alt={item.alt} loading="lazy" />
              <div class="sheen"></div>
            </div>
            <div class="card-body">
              <div class="card-title">{item.title}</div>
              <div class="card-prize">{item.prize}</div>
              <div class="card-lorem">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </div>
            </div>
            <div class="card-glow"></div>
          </a>
        {/each}

        <a class="card card-wide" href={allSubmissions.link}>
          <div class="thumb">
            <img src={allSubmissions.src} alt={allSubmissions.alt} loading="lazy" />
            <div class="sheen"></div>
          </div>
          <div class="card-body">
            <div class="card-title">{allSubmissions.title}</div>
            <div class="card-prize">Cambridge Game Jam 2024</div>
            <div class="card-lorem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
            </div>
          </div>
          <div class="card-glow"></div>
        </a>
      </div>
    </section>

    <section class="lower">
      <div class="lower-grid">
        <div class="panel">
          <h3 class="panel-title">Reflection</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
          </p>
        </div>
        <div class="panel">
          <h3 class="panel-title">Cambridge Game Jam 2024</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
          </p>
          <div class="mini">
            <div class="mini-row"><span>{duration}</span><span>{theme}</span></div>
            <div class="mini-row"><span>{submissions} Submissions</span><span>2024</span></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .page {
    position: relative;
    min-height: 100svh;
    background: radial-gradient(1200px 700px at 20% 10%, rgba(255, 77, 216, 0.18), transparent 70%),
      radial-gradient(1000px 650px at 85% 20%, rgba(102, 240, 255, 0.16), transparent 70%),
      radial-gradient(900px 700px at 55% 95%, rgba(165, 139, 255, 0.14), transparent 70%),
      linear-gradient(180deg, #05030a 0%, #04020a 40%, #05010a 100%);
    color: #f7f3ff;
    overflow-x: hidden;
  }

  .stage {
    position: fixed;
    inset: 0;
    z-index: 0;
  }

  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      60% 60% at 50% 20%,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.55) 72%,
      rgba(0, 0, 0, 0.88) 100%
    );
    mix-blend-mode: multiply;
  }

  .scan {
    position: absolute;
    inset: -20% 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    );
    animation: scan 5.5s linear infinite;
    opacity: 0.55;
  }

  @keyframes scan {
    0% {
      transform: translateY(-30%);
    }
    100% {
      transform: translateY(30%);
    }
  }

  .ui {
    position: relative;
    z-index: 1;
    padding: 18px;
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 18px;
    background: rgba(10, 6, 20, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px) saturate(120%);
  }

  .spacer {
    flex: 1;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 999px;
    font-size: 14px;
    letter-spacing: 0.02em;
    color: rgba(247, 243, 255, 0.92);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 180ms ease, background 180ms ease,
      border-color 180ms ease;
  }

  .chip:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.16);
  }

  .chip-strong {
    background: radial-gradient(
        120% 140% at 10% 10%,
        rgba(255, 77, 216, 0.42),
        rgba(102, 240, 255, 0.2)
      ),
      rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.16);
  }

  .hero {
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 20px;
    padding: 22px 10px 6px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .hero-left {
    padding: 26px 20px;
    border-radius: 26px;
    background: linear-gradient(
      180deg,
      rgba(10, 6, 20, 0.6),
      rgba(10, 6, 20, 0.24)
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px) saturate(140%);
    box-shadow: 0 40px 140px rgba(0, 0, 0, 0.52);
  }

  .kicker {
    font-size: 14px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(247, 243, 255, 0.72);
    margin-bottom: 10px;
  }

  .title {
    font-size: clamp(44px, 6.2vw, 82px);
    line-height: 0.92;
    letter-spacing: -0.03em;
    margin: 0 0 14px;
    text-wrap: balance;
    background: linear-gradient(
      100deg,
      #ffffff 0%,
      #d1f7ff 20%,
      #f6b0ff 55%,
      #ffffff 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 14px 40px rgba(255, 77, 216, 0.12))
      drop-shadow(0 20px 70px rgba(102, 240, 255, 0.1));
    animation: shimmer 4.5s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      filter: drop-shadow(0 14px 40px rgba(255, 77, 216, 0.12))
        drop-shadow(0 20px 70px rgba(102, 240, 255, 0.1));
    }
    50% {
      filter: drop-shadow(0 16px 50px rgba(255, 77, 216, 0.2))
        drop-shadow(0 22px 90px rgba(165, 139, 255, 0.16));
    }
    100% {
      filter: drop-shadow(0 14px 40px rgba(255, 77, 216, 0.12))
        drop-shadow(0 20px 70px rgba(102, 240, 255, 0.1));
    }
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0 0 16px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 999px;
    font-size: 14px;
    color: rgba(247, 243, 255, 0.9);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .lead {
    margin: 0 0 18px;
    max-width: 62ch;
    color: rgba(247, 243, 255, 0.82);
    font-size: 16px;
    line-height: 1.65;
  }

  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0 0 12px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    font-size: 14px;
    letter-spacing: 0.02em;
    color: rgba(247, 243, 255, 0.92);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 160ms ease, background 160ms ease,
      border-color 160ms ease;
  }

  .btn:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
  }

  .btn-primary {
    background: radial-gradient(
        140% 180% at 15% 10%,
        rgba(255, 77, 216, 0.55),
        rgba(102, 240, 255, 0.22)
      ),
      rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 18px 70px rgba(255, 77, 216, 0.12),
      0 28px 120px rgba(102, 240, 255, 0.08);
  }

  .fine {
    margin: 0;
    font-size: 13px;
    color: rgba(247, 243, 255, 0.62);
  }

  .hero-right {
    display: grid;
    place-items: center;
    padding: 18px;
    border-radius: 26px;
    background: linear-gradient(
      180deg,
      rgba(10, 6, 20, 0.55),
      rgba(10, 6, 20, 0.18)
    );
    border: 1px solid rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(14px) saturate(140%);
    overflow: hidden;
    box-shadow: 0 40px 140px rgba(0, 0, 0, 0.52);
  }

  .sigil {
    width: min(260px, 70vw);
    aspect-ratio: 1;
    border-radius: 999px;
    background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 77, 216, 0.3),
        transparent 45%
      ),
      radial-gradient(
        circle at 70% 60%,
        rgba(102, 240, 255, 0.26),
        transparent 55%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(165, 139, 255, 0.22),
        transparent 58%
      );
    border: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    animation: spin 9s linear infinite;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05),
      0 34px 120px rgba(255, 77, 216, 0.12);
  }

  .sigil-inner {
    position: absolute;
    inset: 14px;
    border-radius: 999px;
    background: conic-gradient(
      from 90deg,
      rgba(255, 77, 216, 0.2),
      rgba(102, 240, 255, 0.16),
      rgba(165, 139, 255, 0.2),
      rgba(255, 77, 216, 0.2)
    );
    filter: blur(0.2px);
    opacity: 0.7;
    animation: spin 6.5s linear infinite reverse;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .stack {
    margin-top: 18px;
    width: 100%;
  }

  .stack-row {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-align: center;
    color: rgba(247, 243, 255, 0.4);
    transform: translateZ(0);
    animation: drift 2.8s ease-in-out infinite;
  }

  .stack-row:nth-child(2) {
    color: rgba(247, 243, 255, 0.22);
    animation-duration: 3.6s;
  }

  .stack-row:nth-child(3) {
    color: rgba(247, 243, 255, 0.12);
    animation-duration: 4.4s;
  }

  @keyframes drift {
    0% {
      transform: translateY(0px);
      letter-spacing: -0.02em;
    }
    50% {
      transform: translateY(-8px);
      letter-spacing: 0.06em;
    }
    100% {
      transform: translateY(0px);
      letter-spacing: -0.02em;
    }
  }

  .featured {
    max-width: 1200px;
    margin: 0 auto;
    padding: 18px 10px 12px;
  }

  .section-head {
    padding: 18px 20px 6px;
  }

  .section-title {
    margin: 0;
    font-size: 30px;
    letter-spacing: -0.02em;
  }

  .section-sub {
    margin: 8px 0 0;
    color: rgba(247, 243, 255, 0.68);
    max-width: 80ch;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
    padding: 10px;
  }

  .card {
    grid-column: span 6;
    border-radius: 20px;
    background: linear-gradient(
      180deg,
      rgba(12, 8, 22, 0.6),
      rgba(12, 8, 22, 0.2)
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    position: relative;
    transform: translateZ(0);
    transition: transform 200ms ease, border-color 200ms ease;
    box-shadow: 0 30px 120px rgba(0, 0, 0, 0.48);
  }

  .card:hover {
    transform: translateY(-2px) scale(1.01);
    border-color: rgba(255, 255, 255, 0.14);
  }

  .card-wide {
    grid-column: span 12;
  }

  .thumb {
    position: relative;
    height: 220px;
    background: rgba(255, 255, 255, 0.02);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.03);
    filter: saturate(1.08) contrast(1.06);
  }

  .sheen {
    position: absolute;
    inset: -40% -40%;
    background: linear-gradient(
      120deg,
      transparent 40%,
      rgba(255, 255, 255, 0.12),
      transparent 60%
    );
    transform: translateX(-40%) rotate(10deg);
    animation: sheen 2.9s ease-in-out infinite;
    opacity: 0.7;
    pointer-events: none;
  }

  @keyframes sheen {
    0% {
      transform: translateX(-45%) rotate(12deg);
    }
    55% {
      transform: translateX(45%) rotate(12deg);
    }
    100% {
      transform: translateX(45%) rotate(12deg);
    }
  }

  .card-body {
    padding: 14px 16px 16px;
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }

  .card-prize {
    font-size: 13px;
    color: rgba(247, 243, 255, 0.72);
    margin-bottom: 10px;
  }

  .card-lorem {
    font-size: 13px;
    line-height: 1.6;
    color: rgba(247, 243, 255, 0.62);
  }

  .card-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        800px 240px at 30% 20%,
        rgba(255, 77, 216, 0.15),
        transparent 45%
      ),
      radial-gradient(
        700px 260px at 70% 30%,
        rgba(102, 240, 255, 0.12),
        transparent 45%
      ),
      radial-gradient(
        800px 280px at 50% 100%,
        rgba(165, 139, 255, 0.12),
        transparent 55%
      );
    opacity: 0.9;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .lower {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 10px 40px;
  }

  .lower-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .panel {
    border-radius: 22px;
    background: rgba(10, 6, 20, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 18px 18px 14px;
    backdrop-filter: blur(14px) saturate(140%);
    box-shadow: 0 30px 120px rgba(0, 0, 0, 0.44);
  }

  .panel-title {
    margin: 0 0 10px;
    font-size: 18px;
    letter-spacing: -0.01em;
  }

  .panel p {
    margin: 0 0 10px;
    color: rgba(247, 243, 255, 0.7);
    font-size: 14px;
    line-height: 1.7;
  }

  .mini {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }

  .mini-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(247, 243, 255, 0.72);
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 960px) {
    .hero {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .ui {
      padding: 14px;
    }

    .grid {
      grid-template-columns: repeat(6, 1fr);
    }

    .card {
      grid-column: span 6;
    }

    .lower-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scan,
    .sigil,
    .sigil-inner,
    .stack-row,
    .sheen,
    .title {
      animation: none;
    }

    .card,
    .chip,
    .btn {
      transition: none;
    }
  }
</style>
