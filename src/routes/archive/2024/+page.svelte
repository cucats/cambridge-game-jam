<script>
  import { onDestroy, onMount } from "svelte";
  import { createCGJ2024Scene } from "$lib/three/cgj2024Scene.js";

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
    {
      src: "/2024/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2024",
      title: "All Submissions",
      prize: "",
    },
  ];

  let stage;
  let cleanup = null;
  let scrollY = 0;

  const onScroll = () => {
    scrollY = window.scrollY || 0;
  };

  onMount(async () => {
    scrollY = window.scrollY || 0;
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanup = await createCGJ2024Scene({
      container: stage,
      getScrollY: () => scrollY,
    });
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", onScroll);
    }
    cleanup?.();
    cleanup = null;
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cgj24">
  <div class="hero">
    <div class="stage" bind:this={stage} aria-hidden="true"></div>
    <div class="veil" aria-hidden="true"></div>

    <div class="ui">
      <div class="topline">
        <div class="badge">{theme}</div>
        <div class="meta">
          <div class="k">{duration}</div>
          <a class="k" href="https://itch.io/jam/camgamejam2024"
            >{submissions} {submissions === 1 ? "Submission" : "Submissions"}</a
          >
        </div>
      </div>

      <h1 class="title">
        <span class="titleMain">{title}</span>
        <span class="titleEcho" aria-hidden="true">{title}</span>
        <span class="titleEcho2" aria-hidden="true">{title}</span>
      </h1>

      <div class="copy">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <div class="cards">
        {#each featured as item}
          <a class="card" href={item.link}>
            <div class="thumb">
              <img src={item.src} alt={item.alt} loading="lazy" />
            </div>
            <div class="cardBody">
              <div class="cardTitle">{item.title}</div>
              {#if item.prize}
                <div class="cardPrize">{item.prize}</div>
              {:else}
                <div class="cardPrize">Lorem ipsum</div>
              {/if}
            </div>
            <div class="sheen" aria-hidden="true"></div>
          </a>
        {/each}
      </div>
    </div>
  </div>

  <section class="section">
    <div class="sectionInner">
      <h2 class="sectionTitle">{theme}</h2>
      <div class="sectionGrid">
        <div class="panel">
          <div class="panelTitle">{title}</div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div class="panel panelAlt">
          <div class="panelTitle">{duration}</div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .cgj24 {
    min-height: 100vh;
    background: radial-gradient(1200px 800px at 25% 10%, #1a0b3b 0%, transparent 60%),
      radial-gradient(1100px 750px at 80% 20%, #0b3a3a 0%, transparent 55%),
      radial-gradient(1000px 650px at 50% 90%, #2a0630 0%, transparent 60%),
      linear-gradient(180deg, #05050a 0%, #07060d 55%, #05050a 100%);
    color: #eef3ff;
  }

  .hero {
    position: relative;
    min-height: 100vh;
    overflow: clip;
  }

  .stage {
    position: absolute;
    inset: 0;
  }

  .stage :global(canvas) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .veil {
    position: absolute;
    inset: 0;
    background: radial-gradient(900px 520px at 50% 30%, rgba(255, 255, 255, 0.06), transparent 62%),
      radial-gradient(720px 520px at 20% 70%, rgba(123, 255, 242, 0.08), transparent 60%),
      radial-gradient(820px 560px at 80% 70%, rgba(255, 43, 214, 0.08), transparent 62%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.55));
    mix-blend-mode: screen;
    animation: veilShift 6.5s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes veilShift {
    0% {
      filter: saturate(1.1) contrast(1.05);
      opacity: 0.85;
    }
    50% {
      filter: saturate(1.35) contrast(1.15);
      opacity: 0.95;
    }
    100% {
      filter: saturate(1.1) contrast(1.05);
      opacity: 0.85;
    }
  }

  .ui {
    position: relative;
    z-index: 2;
    max-width: 1180px;
    margin: 0 auto;
    padding: clamp(18px, 3vw, 34px);
    padding-top: clamp(22px, 4vw, 56px);
  }

  .topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
  }

  .badge {
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(123, 255, 242, 0.24), rgba(255, 43, 214, 0.18));
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(10px);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 12px;
    color: rgba(238, 243, 255, 0.92);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px 18px;
  }

  .k {
    font-size: 14px;
    letter-spacing: 0.06em;
    color: rgba(238, 243, 255, 0.8);
    text-decoration: none;
  }

  a.k:hover {
    color: rgba(238, 243, 255, 1);
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .title {
    margin: 0;
    line-height: 0.92;
    letter-spacing: -0.02em;
    font-size: clamp(44px, 6.5vw, 92px);
    font-weight: 800;
    position: relative;
    display: inline-block;
    transform: translateZ(0);
  }

  .titleMain {
    position: relative;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(225, 236, 255, 0.65));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 22px 90px rgba(0, 0, 0, 0.65));
  }

  .titleEcho,
  .titleEcho2 {
    position: absolute;
    inset: 0;
    color: rgba(123, 255, 242, 0.22);
    transform: translate3d(-10px, 10px, 0);
    mix-blend-mode: screen;
    pointer-events: none;
    animation: echoA 2.6s ease-in-out infinite;
  }

  .titleEcho2 {
    color: rgba(255, 43, 214, 0.18);
    transform: translate3d(12px, -12px, 0);
    animation: echoB 3.1s ease-in-out infinite;
  }

  @keyframes echoA {
    0% {
      transform: translate3d(-12px, 12px, 0) skewX(-2deg);
      opacity: 0.55;
      filter: blur(0px);
    }
    50% {
      transform: translate3d(-6px, 6px, 0) skewX(2deg);
      opacity: 0.9;
      filter: blur(1.2px);
    }
    100% {
      transform: translate3d(-12px, 12px, 0) skewX(-2deg);
      opacity: 0.55;
      filter: blur(0px);
    }
  }

  @keyframes echoB {
    0% {
      transform: translate3d(14px, -14px, 0) skewY(2deg);
      opacity: 0.5;
      filter: blur(0px);
    }
    50% {
      transform: translate3d(7px, -7px, 0) skewY(-2deg);
      opacity: 0.85;
      filter: blur(1.4px);
    }
    100% {
      transform: translate3d(14px, -14px, 0) skewY(2deg);
      opacity: 0.5;
      filter: blur(0px);
    }
  }

  .copy {
    max-width: 62ch;
    margin-top: 18px;
    color: rgba(238, 243, 255, 0.82);
    font-size: 15px;
  }

  .copy p {
    margin: 0 0 10px 0;
  }

  .cards {
    margin-top: 26px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
  }

  .card {
    grid-column: span 6;
    position: relative;
    border-radius: 18px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
    backdrop-filter: blur(8px);
    transform: translateZ(0);
    box-shadow: 0 26px 90px rgba(0, 0, 0, 0.55);
    transition: transform 260ms ease, border-color 260ms ease, box-shadow 260ms ease;
  }

  .card:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(123, 255, 242, 0.32);
    box-shadow: 0 30px 120px rgba(0, 0, 0, 0.7);
  }

  .thumb {
    height: 148px;
    background: rgba(0, 0, 0, 0.25);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.12);
    filter: saturate(1.2) contrast(1.05);
    transition: transform 420ms cubic-bezier(0.2, 1, 0.2, 1), filter 420ms ease;
  }

  .card:hover .thumb img {
    transform: scale(1.18);
    filter: saturate(1.4) contrast(1.12);
  }

  .cardBody {
    padding: 12px 14px 14px 14px;
    display: grid;
    gap: 6px;
  }

  .cardTitle {
    font-weight: 800;
    letter-spacing: -0.01em;
    font-size: 16px;
    color: rgba(238, 243, 255, 0.95);
  }

  .cardPrize {
    font-size: 13px;
    letter-spacing: 0.02em;
    color: rgba(238, 243, 255, 0.72);
  }

  .sheen {
    position: absolute;
    inset: -40%;
    background: conic-gradient(
      from 210deg,
      transparent 0deg,
      rgba(123, 255, 242, 0.12) 70deg,
      rgba(255, 43, 214, 0.1) 120deg,
      transparent 200deg,
      transparent 360deg
    );
    opacity: 0;
    transition: opacity 260ms ease;
    mix-blend-mode: screen;
    animation: sheenSpin 3.4s linear infinite;
    pointer-events: none;
  }

  .card:hover .sheen {
    opacity: 1;
  }

  @keyframes sheenSpin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .section {
    padding: 80px clamp(18px, 3vw, 34px);
  }

  .sectionInner {
    max-width: 1180px;
    margin: 0 auto;
  }

  .sectionTitle {
    font-size: clamp(26px, 3vw, 40px);
    letter-spacing: -0.02em;
    margin: 0 0 18px 0;
    font-weight: 800;
    color: rgba(238, 243, 255, 0.95);
  }

  .sectionGrid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
  }

  .panel {
    grid-column: span 6;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: radial-gradient(800px 500px at 20% 30%, rgba(123, 255, 242, 0.08), transparent 62%),
      radial-gradient(700px 520px at 80% 70%, rgba(255, 43, 214, 0.08), transparent 60%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
    box-shadow: 0 40px 140px rgba(0, 0, 0, 0.6);
    padding: 18px 18px 16px 18px;
  }

  .panelAlt {
    background: radial-gradient(900px 520px at 30% 20%, rgba(255, 43, 214, 0.1), transparent 60%),
      radial-gradient(760px 520px at 70% 80%, rgba(123, 255, 242, 0.08), transparent 62%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  }

  .panelTitle {
    font-weight: 850;
    letter-spacing: -0.01em;
    font-size: 16px;
    margin-bottom: 10px;
    color: rgba(238, 243, 255, 0.92);
  }

  .panel p {
    margin: 0 0 10px 0;
    color: rgba(238, 243, 255, 0.8);
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 920px) {
    .card {
      grid-column: span 12;
    }
    .panel {
      grid-column: span 12;
    }
    .topline {
      align-items: flex-start;
      flex-direction: column;
    }
    .meta {
      justify-content: flex-start;
    }
  }
</style>
