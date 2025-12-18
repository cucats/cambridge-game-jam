<script>
  import ReflectionScene from "./ReflectionScene.svelte";
  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const images = [
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
    {
      src: "/2024/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2024",
      title: "All Submissions",
      prize: "",
    },
  ];
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<div class="page">
  <section class="hero" aria-label={title}>
    <ReflectionScene />

    <div class="hud">
      <div class="topline">
        <div class="pill">{title}</div>
        <div class="pill">{duration}</div>
        <div class="pill">{submissions} Submissions</div>
      </div>

      <h1 class="theme">{theme}</h1>

      <div class="copy">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <div class="actions">
        <a
          class="primary"
          href="https://itch.io/jam/camgamejam2024"
          target="_blank"
          rel="noreferrer"
        >
          All Submissions
        </a>
      </div>
    </div>

    <div class="gradient"></div>
    <div class="grain"></div>
  </section>

  <section class="grid" aria-label="Lorem ipsum">
    {#each images as item (item.title)}
      <a class="card" href={item.link} target="_blank" rel="noreferrer">
        <img class="thumb" src={item.src} alt={item.alt} loading="lazy" />
        <div class="meta">
          <div class="name">{item.title}</div>
          {#if item.prize}
            <div class="prize">{item.prize}</div>
          {/if}
        </div>
        <div class="sheen" aria-hidden="true"></div>
      </a>
    {/each}
  </section>

  <section class="below" aria-label="Lorem ipsum">
    <div class="panel">
      <h2 class="lorem">Lorem ipsum</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
    <div class="panel">
      <h2 class="lorem">Lorem ipsum</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #05050a;
    color: #eaf7ff;
  }

  .page {
    min-height: 100svh;
    background: radial-gradient(900px 700px at 50% 20%, rgba(172, 214, 255, 0.08), rgba(0, 0, 0, 0) 55%),
      radial-gradient(1100px 800px at 25% 70%, rgba(170, 90, 255, 0.1), rgba(0, 0, 0, 0) 60%),
      radial-gradient(1100px 800px at 85% 70%, rgba(70, 255, 224, 0.08), rgba(0, 0, 0, 0) 60%),
      #05050a;
  }

  .hero {
    position: relative;
    min-height: min(100svh, 980px);
    overflow: hidden;
  }

  .hud {
    position: relative;
    z-index: 5;
    max-width: 1040px;
    margin: 0 auto;
    padding: 56px 20px 40px;
  }

  .topline {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .pill {
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(7, 7, 12, 0.45);
    backdrop-filter: blur(14px);
  }

  .theme {
    margin: 22px 0 12px;
    font-size: clamp(44px, 7vw, 86px);
    line-height: 0.95;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    background: linear-gradient(90deg, #eaffff 0%, #b8d0ff 35%, #b08aff 65%, #9cffef 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 24px rgba(150, 215, 255, 0.12);
    animation: pulse 6.5s ease-in-out infinite;
  }

  .copy {
    max-width: 720px;
    display: grid;
    gap: 12px;
    color: rgba(234, 247, 255, 0.84);
    font-size: 15px;
    line-height: 1.6;
  }

  .actions {
    margin-top: 20px;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 13px 18px;
    border-radius: 14px;
    color: #051018;
    font-weight: 750;
    text-decoration: none;
    background: linear-gradient(135deg, #eaffff 0%, #bcd6ff 40%, #b58fff 70%, #96ffee 100%);
    box-shadow: 0 18px 60px rgba(130, 170, 255, 0.22);
    transform: translateZ(0);
    transition: transform 180ms ease, filter 180ms ease;
  }

  .primary:hover {
    transform: translateY(-1px);
    filter: saturate(112%) contrast(105%);
  }

  .primary:active {
    transform: translateY(0);
  }

  .gradient {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: radial-gradient(900px 500px at 50% 20%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 55%, rgba(0, 0, 0, 0.82) 100%);
  }

  .grain {
    position: absolute;
    inset: -60px;
    z-index: 4;
    pointer-events: none;
    opacity: 0.18;
    mix-blend-mode: overlay;
    background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, rgba(0, 0, 0, 0) 1px);
    background-size: 3px 3px;
    transform: rotate(2deg);
    animation: grain 6s steps(2, end) infinite;
  }

  .grid {
    max-width: 1100px;
    margin: -70px auto 0;
    padding: 0 20px 54px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
    position: relative;
    z-index: 10;
  }

  .card {
    grid-column: span 12;
    position: relative;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(10, 11, 18, 0.7);
    text-decoration: none;
    color: inherit;
    transform: translateZ(0);
    box-shadow: 0 18px 80px rgba(0, 0, 0, 0.38);
    transition: transform 200ms ease, border-color 200ms ease;
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: rgba(180, 220, 255, 0.28);
  }

  .thumb {
    width: 100%;
    height: 100%;
    display: block;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    filter: saturate(112%) contrast(108%);
    transform: scale(1.02);
    transition: transform 350ms ease;
  }

  .card:hover .thumb {
    transform: scale(1.06);
  }

  .meta {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    display: grid;
    gap: 4px;
    padding: 12px 12px;
    border-radius: 14px;
    background: rgba(4, 6, 10, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(16px);
  }

  .name {
    font-weight: 780;
    letter-spacing: -0.01em;
  }

  .prize {
    color: rgba(234, 247, 255, 0.78);
    font-size: 13px;
    letter-spacing: 0.02em;
  }

  .sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(700px 220px at 20% 0%, rgba(170, 230, 255, 0.16), rgba(0, 0, 0, 0) 60%),
      radial-gradient(640px 260px at 100% 30%, rgba(170, 120, 255, 0.16), rgba(0, 0, 0, 0) 62%);
    opacity: 0.7;
    transform: translateY(-8px);
    transition: opacity 220ms ease, transform 220ms ease;
  }

  .card:hover .sheen {
    opacity: 1;
    transform: translateY(0);
  }

  .below {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px 80px;
    display: grid;
    gap: 14px;
  }

  .panel {
    border-radius: 18px;
    padding: 18px 16px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(7, 8, 14, 0.65);
    backdrop-filter: blur(18px);
  }

  .lorem {
    margin: 0 0 8px;
    font-size: 16px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(234, 247, 255, 0.88);
  }

  .panel p {
    margin: 0;
    color: rgba(234, 247, 255, 0.78);
    line-height: 1.65;
    font-size: 14px;
  }

  @media (min-width: 760px) {
    .hud {
      padding-top: 72px;
      padding-bottom: 60px;
    }

    .grid {
      margin-top: -92px;
      gap: 16px;
    }

    .card {
      grid-column: span 6;
    }

    .below {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 1080px) {
    .card {
      grid-column: span 4;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 0 rgba(185, 220, 255, 0));
    }
    50% {
      filter: drop-shadow(0 12px 40px rgba(185, 220, 255, 0.16));
    }
  }

  @keyframes grain {
    0% {
      transform: translate3d(-2%, -2%, 0) rotate(2deg);
    }
    50% {
      transform: translate3d(2%, 1%, 0) rotate(2deg);
    }
    100% {
      transform: translate3d(-1%, 2%, 0) rotate(2deg);
    }
  }
</style>
