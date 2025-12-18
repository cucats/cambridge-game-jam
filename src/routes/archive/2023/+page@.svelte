<script>
  import "../../../app.css";
  import { onMount } from "svelte";
  import CaveScene from "./CaveScene.svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const theme = "Beneath the Earth";

  const projects = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let root;

  onMount(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const setVars = (x, y) => {
      root?.style.setProperty("--px", String(x));
      root?.style.setProperty("--py", String(y));
    };

    if (reduceMotion) {
      setVars(0, 0);
      return;
    }

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;

    const onPointer = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      tx = (e.clientX / w) * 2 - 1;
      ty = -((e.clientY / h) * 2 - 1);
    };

    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      setVars(x, y);
      requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    tick();

    return () => {
      window.removeEventListener("pointermove", onPointer);
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cgj23" bind:this={root}>
  <CaveScene />
  <div class="vignette" aria-hidden="true"></div>

  <div class="ui">
    <div class="hero">
      <div class="hero-card">
        <img class="logo" src="/2023/logo.png" alt={title} />
        <h1 class="title">{title}</h1>
        <div class="meta">
          <div class="pill">{duration}</div>
          <div class="pill">{theme}</div>
        </div>
        <p class="lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </div>

    <div class="grid">
      {#each projects as p (p.title)}
        <a class="card" href={p.link} target="_blank" rel="noreferrer">
          <img class="thumb" src={p.src} alt={p.alt} loading="lazy" />
          <div class="scrim" aria-hidden="true"></div>
          <div class="card-ui">
            <div class="card-title">{p.title}</div>
            {#if p.prize}
              <div class="card-prize">{p.prize}</div>
            {/if}
          </div>
        </a>
      {/each}
    </div>

    <div class="lower">
      <p class="lorem">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <p class="lorem">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
  </div>
</div>

<style>
  .cgj23 {
    min-height: 100vh;
    color: rgba(255, 255, 255, 0.92);
    background: #05040a;
    overflow-x: hidden;
    --px: 0;
    --py: 0;
  }

  .vignette {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(
        900px 700px at calc(50% + var(--px) * 10%) calc(32% + var(--py) * 8%),
        rgba(55, 120, 255, 0.12) 0%,
        rgba(20, 10, 35, 0) 55%
      ),
      radial-gradient(
        1200px 900px at 50% 30%,
        rgba(255, 120, 40, 0.05) 0%,
        rgba(10, 7, 15, 0) 55%
      ),
      radial-gradient(
        1600px 1200px at 50% 55%,
        rgba(0, 0, 0, 0) 30%,
        rgba(0, 0, 0, 0.82) 100%
      );
    mix-blend-mode: screen;
  }

  .ui {
    position: relative;
    z-index: 2;
  }

  .hero {
    padding: clamp(20px, 4.5vw, 56px);
    padding-top: clamp(28px, 6vw, 84px);
    display: grid;
    place-items: center;
  }

  .hero-card {
    width: min(980px, 100%);
    border-radius: 28px;
    padding: clamp(20px, 4vw, 44px);
    background: linear-gradient(
        180deg,
        rgba(10, 8, 18, 0.74) 0%,
        rgba(10, 8, 18, 0.42) 55%,
        rgba(10, 8, 18, 0.18) 100%
      );
    box-shadow:
      0 28px 110px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(120, 160, 255, 0.12) inset,
      0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(14px) saturate(130%);
    transform: perspective(900px)
      rotateX(calc(var(--py) * 4deg))
      rotateY(calc(var(--px) * -6deg))
      translate3d(0, 0, 0);
    animation: heroFloat 8.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  }

  .logo {
    width: clamp(64px, 8.5vw, 96px);
    height: auto;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.55))
      drop-shadow(0 0 18px rgba(90, 150, 255, 0.22));
    animation: glowPulse 3.2s ease-in-out infinite;
  }

  .title {
    margin-top: 18px;
    margin-bottom: 14px;
    letter-spacing: -0.02em;
    line-height: 1.05;
    text-shadow:
      0 24px 70px rgba(0, 0, 0, 0.65),
      0 0 18px rgba(120, 160, 255, 0.18);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
  }

  .pill {
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(
      180deg,
      rgba(75, 120, 255, 0.15) 0%,
      rgba(255, 120, 40, 0.08) 100%
    );
    box-shadow:
      0 10px 34px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(120, 160, 255, 0.12) inset;
    font-weight: 650;
    letter-spacing: 0.01em;
  }

  .lorem {
    opacity: 0.88;
    max-width: 68ch;
    text-shadow: 0 18px 48px rgba(0, 0, 0, 0.65);
  }

  .grid {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: clamp(14px, 2.2vw, 26px);
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(12px, 1.6vw, 18px);
  }

  .card {
    grid-column: span 12;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    min-height: 210px;
    background: rgba(10, 8, 18, 0.5);
    box-shadow:
      0 26px 110px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(120, 160, 255, 0.1) inset,
      0 0 0 1px rgba(255, 255, 255, 0.05);
    transform: translate3d(0, 0, 0);
    will-change: transform;
    animation: cardDrift 7.4s ease-in-out infinite;
  }

  .card:nth-child(2n) {
    animation-duration: 8.2s;
    animation-delay: -1.4s;
  }

  .card:nth-child(3n) {
    animation-duration: 9.1s;
    animation-delay: -2.1s;
  }

  .card:hover {
    transform: translate3d(0, -6px, 0) scale(1.01);
  }

  .thumb {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(1.1) contrast(1.05) brightness(0.9);
    transform: scale(1.05);
  }

  .scrim {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        800px 420px at 30% 20%,
        rgba(70, 140, 255, 0.12) 0%,
        rgba(0, 0, 0, 0) 60%
      ),
      linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.12) 0%,
        rgba(0, 0, 0, 0.64) 65%,
        rgba(0, 0, 0, 0.8) 100%
      );
  }

  .card-ui {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 18px 18px 16px;
    gap: 6px;
  }

  .card-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.01em;
    text-shadow:
      0 18px 60px rgba(0, 0, 0, 0.85),
      0 0 14px rgba(120, 160, 255, 0.16);
  }

  .card-prize {
    font-size: 14px;
    font-weight: 700;
    opacity: 0.9;
    padding: 8px 10px;
    border-radius: 999px;
    width: fit-content;
    background: linear-gradient(
      180deg,
      rgba(255, 120, 40, 0.16) 0%,
      rgba(75, 120, 255, 0.13) 100%
    );
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  }

  .lower {
    width: min(980px, 100%);
    margin: 0 auto;
    padding: 10px clamp(20px, 4.5vw, 56px) 70px;
  }

  @media (min-width: 720px) {
    .card {
      grid-column: span 6;
      min-height: 260px;
    }

    .card:last-child {
      grid-column: span 12;
      min-height: 320px;
    }
  }

  @media (min-width: 1040px) {
    .card {
      grid-column: span 4;
      min-height: 260px;
    }

    .card:nth-child(1) {
      grid-column: span 6;
      min-height: 360px;
    }

    .card:nth-child(2) {
      grid-column: span 6;
      min-height: 360px;
    }

    .card:last-child {
      grid-column: span 12;
      min-height: 360px;
    }
  }

  @keyframes heroFloat {
    0% {
      transform: perspective(900px)
        rotateX(calc(var(--py) * 4deg))
        rotateY(calc(var(--px) * -6deg))
        translate3d(0, 0, 0);
    }
    50% {
      transform: perspective(900px)
        rotateX(calc(var(--py) * 4deg + 1.2deg))
        rotateY(calc(var(--px) * -6deg - 1.4deg))
        translate3d(0, -8px, 0);
    }
    100% {
      transform: perspective(900px)
        rotateX(calc(var(--py) * 4deg))
        rotateY(calc(var(--px) * -6deg))
        translate3d(0, 0, 0);
    }
  }

  @keyframes cardDrift {
    0% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -10px, 0);
    }
    100% {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes glowPulse {
    0% {
      filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.55))
        drop-shadow(0 0 18px rgba(90, 150, 255, 0.22));
    }
    50% {
      filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.55))
        drop-shadow(0 0 28px rgba(120, 170, 255, 0.32));
    }
    100% {
      filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.55))
        drop-shadow(0 0 18px rgba(90, 150, 255, 0.22));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-card,
    .logo,
    .card {
      animation: none;
    }

    .hero-card {
      transform: none;
    }
  }
</style>
