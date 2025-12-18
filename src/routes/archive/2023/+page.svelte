<script>
  import { onMount } from "svelte";
  import CaveScene from "./CaveScene.svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const theme = "Beneath the Earth";
  const submissions = 19;

  const projects = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote"
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme"
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation"
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay"
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea"
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: ""
    }
  ];

  let stage;

  onMount(() => {
    const el = stage;
    if (!el) return;

    const onMove = (ev) => {
      const r = el.getBoundingClientRect();
      const x = (ev.clientX - r.left) / Math.max(1, r.width);
      const y = (ev.clientY - r.top) / Math.max(1, r.height);
      el.style.setProperty("--mx", String(x));
      el.style.setProperty("--my", String(y));
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.style.setProperty("--mx", "0.5");
    el.style.setProperty("--my", "0.35");

    return () => {
      el.removeEventListener("pointermove", onMove);
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2023</title>
</svelte:head>

<CaveScene />

<div class="veil" aria-hidden="true"></div>

<div class="stage" bind:this={stage}>
  <header class="hero">
    <div class="hero-inner">
      <div class="hero-title">{title}</div>
      <div class="hero-meta">
        <div class="pill">{duration}</div>
        <div class="pill">{theme}</div>
        <div class="pill">{submissions}</div>
      </div>
      <div class="hero-copy">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </div>
    </div>
  </header>

  <section class="gallery">
    <div class="grid">
      {#each projects as p, i (p.title)}
        <a
          class="card"
          style={`--i:${i}`}
          href={p.link}
          target="_blank"
          rel="noreferrer"
          aria-label={p.title}
        >
          <div class="frame">
            <img src={p.src} alt={p.alt} loading="lazy" />
            <div class="grain" aria-hidden="true"></div>
            <div class="flare" aria-hidden="true"></div>
            <div class="cap">
              <div class="cap-title">{p.title}</div>
              {#if p.prize}
                <div class="cap-sub">{p.prize}</div>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <section class="depth">
    <div class="depth-block">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur.
    </div>
    <div class="depth-block">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </div>
  </section>
</div>

<style>
  :global(html) {
    background: #000;
  }

  .veil {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      radial-gradient(900px 520px at 50% 12%, rgba(120, 210, 255, 0.14), rgba(0, 0, 0, 0) 62%),
      radial-gradient(900px 820px at 18% 70%, rgba(255, 125, 46, 0.12), rgba(0, 0, 0, 0) 56%),
      radial-gradient(1200px 800px at 50% 55%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.92) 70%),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.78));
    mix-blend-mode: screen;
    filter: saturate(115%) contrast(108%);
  }

  .stage {
    position: relative;
    z-index: 2;
    min-height: 240vh;
    padding: clamp(18px, 3vw, 44px);
    --mx: 0.5;
    --my: 0.35;
  }

  .hero {
    min-height: 100vh;
    display: grid;
    align-items: center;
  }

  .hero-inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: clamp(18px, 4vw, 60px);
    border-radius: 28px;
    background:
      radial-gradient(900px 240px at 22% 8%, rgba(106, 208, 255, 0.11), rgba(0, 0, 0, 0) 70%),
      radial-gradient(800px 260px at 78% 14%, rgba(255, 122, 47, 0.09), rgba(0, 0, 0, 0) 64%),
      linear-gradient(to bottom right, rgba(10, 14, 24, 0.62), rgba(5, 7, 12, 0.25));
    border: 1px solid rgba(205, 225, 255, 0.14);
    box-shadow:
      0 30px 90px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
  }

  .hero-title {
    font-family: var(--font-lexend);
    font-weight: 800;
    letter-spacing: -0.04em;
    font-size: clamp(40px, 6vw, 86px);
    line-height: 0.98;
    background: linear-gradient(90deg, #e9f0ff 0%, #a9ddff 30%, #f4e3ff 55%, #e9f0ff 80%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 16px 34px rgba(0, 0, 0, 0.65));
    position: relative;
    animation: shimmer 3.2s ease-in-out infinite;
  }

  .hero-title::after {
    content: "";
    position: absolute;
    inset: -12px -6px -18px -6px;
    background:
      radial-gradient(520px 120px at 30% 60%, rgba(106, 208, 255, 0.14), rgba(0, 0, 0, 0) 60%),
      radial-gradient(560px 160px at 70% 70%, rgba(255, 122, 47, 0.11), rgba(0, 0, 0, 0) 62%);
    filter: blur(18px);
    opacity: 0.9;
    z-index: -1;
  }

  .hero-meta {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .pill {
    font-family: var(--font-ubuntu);
    font-size: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 12px;
    border-radius: 999px;
    background: linear-gradient(to bottom, rgba(14, 20, 35, 0.72), rgba(6, 9, 16, 0.4));
    border: 1px solid rgba(205, 225, 255, 0.14);
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.45);
  }

  .hero-copy {
    margin-top: 18px;
    max-width: 74ch;
    font-size: 16px;
    line-height: 1.7;
    color: rgba(233, 240, 255, 0.84);
    text-shadow: 0 14px 40px rgba(0, 0, 0, 0.75);
  }

  .gallery {
    padding: 10vh 0 8vh 0;
    max-width: 1200px;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(12px, 2vw, 18px);
  }

  .card {
    grid-column: span 12;
    border-radius: 20px;
    transform:
      perspective(1100px)
      rotateX(calc((0.5 - var(--my)) * 10deg))
      rotateY(calc((var(--mx) - 0.5) * 12deg));
    transform-origin: center;
    transition: transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
    text-decoration: none;
    outline: none;
    position: relative;
  }

  @media (min-width: 740px) {
    .card {
      grid-column: span 6;
    }
  }

  @media (min-width: 1080px) {
    .card {
      grid-column: span 4;
    }
  }

  .frame {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(to bottom right, rgba(8, 12, 20, 0.78), rgba(2, 3, 6, 0.56));
    border: 1px solid rgba(205, 225, 255, 0.16);
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.7),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    opacity: 0;
    transform: translateY(18px) scale(0.985);
    filter: blur(7px);
    animation: cardIn 1100ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    animation-delay: calc(var(--i, 0) * 120ms + 160ms);
    will-change: transform, filter, opacity;
  }

  .frame img {
    width: 100%;
    height: 100%;
    display: block;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    filter: saturate(105%) contrast(112%);
    transform: scale(1.02);
    transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .card:hover {
    transform:
      perspective(1100px)
      rotateX(calc((0.5 - var(--my)) * 13deg))
      rotateY(calc((var(--mx) - 0.5) * 16deg))
      translateY(-6px);
  }

  .card:hover img {
    transform: scale(1.08);
  }

  .grain {
    position: absolute;
    inset: -30%;
    background:
      radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0) 2px),
      radial-gradient(1px 1px at 50px 80px, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0) 2px),
      radial-gradient(1px 1px at 90px 120px, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0) 2px),
      radial-gradient(1px 1px at 140px 60px, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0) 2px);
    opacity: 0.5;
    filter: blur(0.6px);
    transform: translate3d(0, 0, 0);
    animation: drift 6.2s linear infinite;
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  .flare {
    position: absolute;
    inset: -40% -30%;
    background:
      radial-gradient(420px 200px at 12% 10%, rgba(106, 208, 255, 0.22), rgba(0, 0, 0, 0) 70%),
      radial-gradient(360px 240px at 80% 18%, rgba(255, 122, 47, 0.15), rgba(0, 0, 0, 0) 72%),
      radial-gradient(520px 340px at 40% 80%, rgba(169, 221, 255, 0.08), rgba(0, 0, 0, 0) 72%);
    opacity: 0.0;
    transform: rotate(-10deg);
    transition: opacity 500ms ease;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .card:hover .flare {
    opacity: 1;
  }

  .cap {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    padding: 12px 12px 10px 12px;
    border-radius: 14px;
    background: linear-gradient(to bottom, rgba(7, 10, 18, 0.72), rgba(7, 10, 18, 0.26));
    border: 1px solid rgba(205, 225, 255, 0.14);
    backdrop-filter: blur(12px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.65);
  }

  .cap-title {
    font-family: var(--font-lexend);
    font-weight: 750;
    font-size: 16px;
    letter-spacing: -0.02em;
    color: rgba(233, 240, 255, 0.94);
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  }

  .cap-sub {
    margin-top: 4px;
    font-family: var(--font-ubuntu);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(169, 221, 255, 0.92);
  }

  .depth {
    max-width: 1040px;
    margin: 0 auto;
    padding: 16vh 0 22vh 0;
    display: grid;
    gap: 18px;
  }

  .depth-block {
    border-radius: 22px;
    padding: clamp(16px, 3vw, 26px);
    background:
      radial-gradient(700px 160px at 18% 10%, rgba(106, 208, 255, 0.08), rgba(0, 0, 0, 0) 62%),
      radial-gradient(700px 160px at 82% 14%, rgba(255, 122, 47, 0.06), rgba(0, 0, 0, 0) 62%),
      linear-gradient(to bottom right, rgba(9, 12, 20, 0.68), rgba(3, 4, 8, 0.25));
    border: 1px solid rgba(205, 225, 255, 0.12);
    box-shadow:
      0 26px 80px rgba(0, 0, 0, 0.66),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    color: rgba(233, 240, 255, 0.84);
    line-height: 1.75;
    text-shadow: 0 14px 40px rgba(0, 0, 0, 0.8);
  }

  @keyframes shimmer {
    0% {
      filter: drop-shadow(0 16px 34px rgba(0, 0, 0, 0.65));
    }
    50% {
      filter: drop-shadow(0 22px 44px rgba(0, 0, 0, 0.75));
    }
    100% {
      filter: drop-shadow(0 16px 34px rgba(0, 0, 0, 0.65));
    }
  }

  @keyframes drift {
    0% {
      transform: translate3d(-2%, -4%, 0) rotate(0deg);
      opacity: 0.42;
    }
    50% {
      transform: translate3d(3%, 5%, 0) rotate(1deg);
      opacity: 0.58;
    }
    100% {
      transform: translate3d(-2%, -4%, 0) rotate(0deg);
      opacity: 0.42;
    }
  }

  @keyframes cardIn {
    0% {
      opacity: 0;
      transform: translateY(18px) scale(0.985);
      filter: blur(7px);
    }
    65% {
      opacity: 1;
      filter: blur(0px);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-title,
    .grain {
      animation: none;
    }
    .frame {
      animation: none;
      opacity: 1;
      transform: none;
      filter: none;
    }
    .card,
    .frame,
    .frame img {
      transition: none;
    }
  }
</style>
