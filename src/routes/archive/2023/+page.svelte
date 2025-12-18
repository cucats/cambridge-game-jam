<script>
  import { onMount } from "svelte";
  import CaveScene from "./CaveScene.svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
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

  let activeIndex = $state(-1);
  let visible = $state(false);

  onMount(() => {
    const t = setTimeout(() => (visible = true), 60);
    return () => clearTimeout(t);
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cg23">
  <CaveScene {activeIndex} />

  <a class="nav" href="/archive" aria-label="Lorem ipsum">
    <svg viewBox="0 0 24 24" fill="none" class="navIcon" aria-hidden="true">
      <path
        d="M15.5 19.5 8 12l7.5-7.5"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </a>

  <div class="veil" class:visible>
    <div class="top">
      <div class="titleStack">
        <h1 class="title">{title}</h1>
        <div class="metaRow">
          <div class="metaChip">{duration}</div>
          <div class="metaChip">{theme}</div>
          <a class="metaChip metaLink" href="https://itch.io/jam/camgamejam2023"
            >{submissions} {submissions === 1 ? "Submission" : "Submissions"}</a
          >
        </div>
        <p class="lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </div>

    <div class="grid">
      {#each projects as p, i (p.title)}
        <a
          class="card"
          href={p.link}
          onmouseenter={() => (activeIndex = i)}
          onmouseleave={() => (activeIndex = -1)}
        >
          <div class="thumb">
            <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            <div class="shine"></div>
            <div class="edge"></div>
          </div>
          <div class="cardText">
            <div class="cardTitle">{p.title}</div>
            {#if p.prize}
              <div class="cardPrize">{p.prize}</div>
            {:else}
              <div class="cardPrize lorem">Lorem ipsum</div>
            {/if}
          </div>
        </a>
      {/each}
    </div>

    <div class="bottom">
      <div class="lorem2">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </div>
    </div>
  </div>
</div>

<style>
  :global(footer) {
    display: none !important;
  }

  :global(body) {
    background: #020409;
  }

  .cg23 {
    position: relative;
    width: 100%;
    min-height: 100svh;
    background:
      radial-gradient(
        1200px 800px at 50% 20%,
        rgba(65, 191, 165, 0.12),
        transparent 60%
      ),
      radial-gradient(
        900px 600px at 70% 60%,
        rgba(217, 132, 42, 0.12),
        transparent 60%
      ),
      radial-gradient(
        900px 700px at 30% 70%,
        rgba(132, 78, 201, 0.1),
        transparent 60%
      ),
      linear-gradient(180deg, #01030a 0%, #020914 40%, #010308 100%);
    overflow: hidden;
    isolation: isolate;
  }

  .nav {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 30;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: rgba(232, 252, 255, 0.92);
    background:
      radial-gradient(
        140% 120% at 30% 30%,
        rgba(136, 255, 227, 0.18),
        rgba(4, 11, 17, 0.35) 55%,
        rgba(2, 4, 9, 0.1) 100%
      ),
      rgba(7, 10, 14, 0.25);
    border: 1px solid rgba(140, 255, 235, 0.16);
    box-shadow:
      0 18px 55px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(0, 0, 0, 0.25) inset;
    backdrop-filter: blur(14px) saturate(130%);
    -webkit-backdrop-filter: blur(14px) saturate(130%);
    transition:
      transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color 240ms ease,
      box-shadow 240ms ease,
      background 240ms ease;
  }

  .nav:hover {
    transform: translateY(-1px) scale(1.02);
    border-color: rgba(140, 255, 235, 0.28);
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.62),
      0 0 0 1px rgba(0, 0, 0, 0.25) inset,
      0 0 36px rgba(83, 255, 210, 0.2);
  }

  .navIcon {
    width: 22px;
    height: 22px;
  }

  .veil {
    position: relative;
    z-index: 10;
    padding: clamp(22px, 3.6vw, 44px);
    display: grid;
    gap: clamp(18px, 2.4vw, 28px);
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 900ms cubic-bezier(0.2, 0.9, 0.2, 1),
      transform 900ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  .veil.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .top {
    max-width: 1100px;
    margin: 0 auto;
    padding-top: clamp(10px, 2vw, 24px);
  }

  .titleStack {
    position: relative;
    border-radius: 26px;
    padding: clamp(18px, 2.4vw, 26px);
    background:
      radial-gradient(
        140% 120% at 20% 10%,
        rgba(122, 255, 222, 0.12),
        transparent 55%
      ),
      radial-gradient(
        140% 120% at 80% 30%,
        rgba(233, 142, 44, 0.12),
        transparent 60%
      ),
      linear-gradient(
        180deg,
        rgba(8, 12, 18, 0.78) 0%,
        rgba(3, 5, 10, 0.55) 100%
      );
    border: 1px solid rgba(170, 255, 239, 0.12);
    box-shadow:
      0 40px 120px rgba(0, 0, 0, 0.62),
      0 0 0 1px rgba(0, 0, 0, 0.15) inset;
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    overflow: hidden;
  }

  .titleStack::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: radial-gradient(
      700px 260px at 20% 0%,
      rgba(120, 255, 226, 0.26),
      transparent 60%
    );
    opacity: 0.7;
    filter: blur(22px);
    pointer-events: none;
    transform: translate3d(0, 0, 0);
    animation: drift 7.5s ease-in-out infinite;
  }

  @keyframes drift {
    0%,
    100% {
      transform: translate3d(-10px, -4px, 0);
      opacity: 0.56;
    }
    50% {
      transform: translate3d(14px, 10px, 0);
      opacity: 0.82;
    }
  }

  .title {
    margin: 0 0 10px 0;
    font-size: clamp(34px, 5.2vw, 64px);
    line-height: 1;
    letter-spacing: -0.02em;
    color: rgba(236, 252, 255, 0.96);
    text-shadow:
      0 18px 60px rgba(0, 0, 0, 0.65),
      0 0 34px rgba(74, 255, 213, 0.22);
  }

  .metaRow {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }

  .metaChip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 14px;
    letter-spacing: 0.02em;
    color: rgba(226, 251, 255, 0.92);
    background:
      radial-gradient(
        160% 120% at 30% 20%,
        rgba(112, 255, 221, 0.12),
        rgba(2, 4, 9, 0.35) 60%
      ),
      rgba(6, 9, 14, 0.22);
    border: 1px solid rgba(170, 255, 239, 0.12);
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .metaLink {
    text-decoration: none;
    transition:
      transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color 220ms ease,
      box-shadow 220ms ease;
  }

  .metaLink:hover {
    transform: translateY(-1px);
    border-color: rgba(170, 255, 239, 0.22);
    box-shadow:
      0 24px 80px rgba(0, 0, 0, 0.62),
      0 0 26px rgba(74, 255, 213, 0.16);
  }

  .lorem {
    margin: 0;
    max-width: 70ch;
    color: rgba(214, 244, 255, 0.84);
    font-size: 15px;
    line-height: 1.6;
    text-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  }

  .grid {
    width: min(1200px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(12px, 1.8vw, 18px);
  }

  .card {
    grid-column: span 6;
    display: grid;
    gap: 10px;
    text-decoration: none;
    border-radius: 22px;
    padding: 12px;
    background:
      radial-gradient(
        160% 120% at 20% 10%,
        rgba(120, 255, 226, 0.09),
        transparent 58%
      ),
      radial-gradient(
        160% 120% at 80% 20%,
        rgba(237, 150, 55, 0.09),
        transparent 58%
      ),
      linear-gradient(
        180deg,
        rgba(10, 12, 18, 0.64) 0%,
        rgba(3, 4, 8, 0.42) 100%
      );
    border: 1px solid rgba(190, 255, 244, 0.1);
    box-shadow:
      0 34px 120px rgba(0, 0, 0, 0.58),
      0 0 0 1px rgba(0, 0, 0, 0.12) inset;
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    transform: translateZ(0);
    transition:
      transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1),
      border-color 320ms ease,
      box-shadow 320ms ease,
      filter 320ms ease;
  }

  .card:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(190, 255, 244, 0.2);
    box-shadow:
      0 50px 160px rgba(0, 0, 0, 0.68),
      0 0 0 1px rgba(0, 0, 0, 0.18) inset,
      0 0 54px rgba(82, 255, 213, 0.14);
    filter: saturate(1.08);
  }

  .thumb {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background:
      radial-gradient(
        120% 100% at 40% 20%,
        rgba(120, 255, 226, 0.14),
        transparent 60%
      ),
      rgba(0, 0, 0, 0.25);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.03);
    filter: contrast(1.08) saturate(1.05);
    transition:
      transform 900ms cubic-bezier(0.2, 0.9, 0.2, 1),
      filter 900ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  .card:hover .thumb img {
    transform: scale(1.12);
    filter: contrast(1.12) saturate(1.18);
  }

  .shine {
    position: absolute;
    inset: -40%;
    background: conic-gradient(
      from 220deg,
      transparent 0deg,
      rgba(140, 255, 235, 0.22) 45deg,
      rgba(255, 206, 140, 0.16) 78deg,
      transparent 120deg,
      transparent 360deg
    );
    transform: translate3d(-14%, -10%, 0) rotate(8deg);
    filter: blur(18px);
    opacity: 0;
    transition: opacity 420ms ease;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .card:hover .shine {
    opacity: 1;
    animation: shimmer 1.35s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translate3d(-18%, -14%, 0) rotate(8deg);
    }
    50% {
      transform: translate3d(12%, 6%, 0) rotate(12deg);
    }
    100% {
      transform: translate3d(-18%, -14%, 0) rotate(8deg);
    }
  }

  .edge {
    position: absolute;
    inset: 0;
    border-radius: 16px;
    border: 1px solid rgba(200, 255, 246, 0.14);
    pointer-events: none;
  }

  .cardText {
    padding: 2px 6px 6px;
    display: grid;
    gap: 2px;
  }

  .cardTitle {
    font-size: 17px;
    letter-spacing: 0.01em;
    color: rgba(236, 252, 255, 0.94);
    text-shadow: 0 16px 70px rgba(0, 0, 0, 0.65);
  }

  .cardPrize {
    font-size: 13px;
    color: rgba(214, 244, 255, 0.76);
  }

  .bottom {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 0 2px;
  }

  .lorem2 {
    color: rgba(214, 244, 255, 0.68);
    font-size: 13px;
    line-height: 1.7;
    max-width: 100ch;
    text-shadow: 0 16px 70px rgba(0, 0, 0, 0.62);
  }

  @media (max-width: 980px) {
    .card {
      grid-column: span 12;
    }
  }
</style>
