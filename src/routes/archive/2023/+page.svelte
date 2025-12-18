<script>
  import CaveScene from "./CaveScene.svelte";
  import ProjectGallery from "./ProjectGallery.svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const projects = [
    {
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
    {
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let activeIndex = $state(-1);
</script>

<svelte:head>
  <title>{title}</title>
  <style>
    body > div[style="display: contents"] > footer {
      display: none !important;
    }
    body {
      background: #020306;
    }
  </style>
</svelte:head>

<div class="stage">
  <div class="scene">
    <CaveScene activeIndex={activeIndex} markerCount={projects.length} />
    <div class="vignette"></div>
    <div class="grain"></div>
  </div>

  <div class="overlay">
    <div class="top">
      <div class="sigil" aria-label="Lorem ipsum"></div>
      <div class="titles">
        <h1 class="h">{title}</h1>
        <div class="sub">
          <div class="chip">{duration}</div>
          <div class="chip">{theme}</div>
          <a class="chip link" href="https://itch.io/jam/camgamejam2023"
            >{submissions} {submissions == 1 ? "Submission" : "Submissions"}</a
          >
        </div>
      </div>
    </div>

    <div class="mid">
      <div class="veil">
        <p class="lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </div>

    <div class="bottom">
      <ProjectGallery
        {projects}
        activeIndex={activeIndex}
        onActivate={(i) => (activeIndex = i)}
        onDeactivate={() => (activeIndex = -1)}
      />
    </div>
  </div>
</div>

<style>
  .stage {
    position: relative;
    min-height: 120vh;
    background: radial-gradient(1200px 800px at 50% 10%, rgba(10, 22, 34, 0.55), rgba(0, 0, 0, 0)),
      radial-gradient(1200px 700px at 30% 80%, rgba(18, 10, 6, 0.4), rgba(0, 0, 0, 0)),
      linear-gradient(180deg, #020306, #010102 75%, #000 100%);
    overflow: clip;
  }

  .scene {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
  }

  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(1200px 760px at 50% 50%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75)),
      radial-gradient(900px 600px at 65% 35%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6));
    mix-blend-mode: multiply;
  }

  .grain {
    position: absolute;
    inset: -30%;
    pointer-events: none;
    opacity: 0.14;
    background-image: radial-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px);
    background-size: 3px 3px;
    filter: contrast(120%) brightness(60%);
    transform: rotate(8deg);
    animation: drift 12s linear infinite;
    mix-blend-mode: overlay;
  }

  @keyframes drift {
    from {
      transform: translate3d(-6%, -2%, 0) rotate(8deg);
    }
    to {
      transform: translate3d(6%, 2%, 0) rotate(8deg);
    }
  }

  .overlay {
    position: relative;
    z-index: 2;
    min-height: 120vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    pointer-events: none;
  }

  .top {
    pointer-events: auto;
    padding: 18px 16px 10px;
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 14px;
    align-items: center;
    width: min(1040px, calc(100vw - 16px));
    margin: 0 auto;
  }

  .sigil {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background:
      radial-gradient(30px 30px at 35% 30%, rgba(120, 255, 245, 0.9), rgba(0, 0, 0, 0)),
      radial-gradient(34px 34px at 70% 75%, rgba(255, 120, 70, 0.65), rgba(0, 0, 0, 0)),
      conic-gradient(from 210deg at 50% 50%, rgba(12, 16, 22, 0.92), rgba(4, 5, 8, 0.92), rgba(12, 16, 22, 0.92));
    border: 1px solid rgba(160, 245, 255, 0.22);
    box-shadow:
      0 22px 50px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 140, 90, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    filter: saturate(1.2) contrast(1.15);
    animation: sigil 2.8s ease-in-out infinite;
  }

  @keyframes sigil {
    0%,
    100% {
      transform: translateY(0) rotate(-0.5deg);
      box-shadow:
        0 22px 50px rgba(0, 0, 0, 0.55),
        0 0 36px rgba(120, 255, 245, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    50% {
      transform: translateY(-2px) rotate(0.5deg);
      box-shadow:
        0 28px 65px rgba(0, 0, 0, 0.6),
        0 0 60px rgba(120, 255, 245, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
  }

  .titles {
    min-width: 0;
  }

  .h {
    margin: 0;
    font-size: clamp(28px, 4vw, 54px);
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: rgba(240, 252, 255, 0.96);
    text-shadow:
      0 0 40px rgba(120, 255, 245, 0.16),
      0 20px 60px rgba(0, 0, 0, 0.7);
    animation: shimmer 3.2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      filter: drop-shadow(0 0 0 rgba(120, 255, 245, 0));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(120, 255, 245, 0.18));
    }
  }

  .sub {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  .chip {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(235, 252, 255, 0.9);
    background: rgba(5, 8, 12, 0.42);
    border: 1px solid rgba(150, 240, 255, 0.18);
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px) saturate(140%);
    -webkit-backdrop-filter: blur(10px) saturate(140%);
    transform: translateZ(0);
  }

  .chip.link {
    text-decoration: none;
    transition:
      transform 220ms ease,
      border-color 220ms ease,
      background 220ms ease;
  }

  .chip.link:hover,
  .chip.link:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(125, 250, 255, 0.36);
    background: rgba(7, 12, 16, 0.56);
    outline: none;
  }

  .mid {
    display: grid;
    align-content: center;
    width: min(1040px, calc(100vw - 16px));
    margin: 0 auto;
    padding: 12vh 16px 10vh;
  }

  .veil {
    pointer-events: auto;
    width: min(640px, 100%);
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(4, 6, 9, 0.38);
    border: 1px solid rgba(150, 240, 255, 0.12);
    box-shadow:
      0 22px 70px rgba(0, 0, 0, 0.62),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    animation: breathe 4.6s ease-in-out infinite;
  }

  @keyframes breathe {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  .lorem {
    margin: 0;
    color: rgba(235, 252, 255, 0.86);
    font-size: 14px;
    line-height: 1.55;
    letter-spacing: 0.02em;
    text-shadow: 0 18px 60px rgba(0, 0, 0, 0.7);
  }

  .bottom {
    pointer-events: auto;
    padding: 18px 16px 42px;
  }

  @media (prefers-reduced-motion: reduce) {
    .grain,
    .sigil,
    .h,
    .veil {
      animation: none !important;
    }
  }
</style>
