<script>
  import ReflectionSplash2024 from "$lib/components/archive/ReflectionSplash2024.svelte";
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
  <meta
    name="description"
    content="Cambridge Game Jam 2024. Reflection. 9th - 11th February. Lorem ipsum."
  />
</svelte:head>

<div class="reflection-2024">
  <ReflectionSplash2024 />

  <main class="reflection-2024-ui">
    <header class="reflection-2024-hero">
      <div class="reflection-2024-kicker">{theme}</div>
      <h1 class="reflection-2024-title">{title}</h1>
      <div class="reflection-2024-facts">
        <div class="reflection-2024-pill">{duration}</div>
        <div class="reflection-2024-pill">{submissions}</div>
      </div>
    </header>

    <section class="reflection-2024-grid" aria-label={title}>
      {#each images as item (item.title)}
        <a
          class="reflection-2024-card"
          href={item.link}
          target="_blank"
          rel="noreferrer"
          style={`--bg: url('${item.src}')`}
          aria-label={item.title}
        >
          <div class="reflection-2024-card-sheen"></div>
          <div class="reflection-2024-card-body">
            <div class="reflection-2024-card-title">{item.title}</div>
            {#if item.prize}
              <div class="reflection-2024-card-prize">{item.prize}</div>
            {/if}
          </div>
        </a>
      {/each}
    </section>
  </main>
</div>

<style>
  .reflection-2024 {
    min-height: 100vh;
    position: relative;
    isolation: isolate;
    overflow: hidden;
  }

  .reflection-2024-ui {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: grid;
    align-content: start;
    padding: clamp(18px, 3.5vw, 44px);
    gap: clamp(18px, 2.4vw, 28px);
    color: rgba(255, 255, 255, 0.92);
  }

  .reflection-2024-hero {
    max-width: 980px;
    padding: clamp(18px, 2.4vw, 28px);
    border-radius: 22px;
    background:
      radial-gradient(900px 520px at 12% 20%, rgba(139, 92, 246, 0.22), transparent 55%),
      radial-gradient(680px 420px at 90% 45%, rgba(34, 211, 238, 0.18), transparent 60%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(14px) saturate(130%);
    -webkit-backdrop-filter: blur(14px) saturate(130%);
    box-shadow:
      0 32px 110px rgba(0, 0, 0, 0.52),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    animation: reflection-2024-rise 820ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
  }

  .reflection-2024-kicker {
    font-size: 12px;
    letter-spacing: 0.42em;
    text-transform: uppercase;
    opacity: 0.92;
    color: rgba(226, 232, 255, 0.9);
    text-shadow: 0 0 24px rgba(34, 211, 238, 0.25);
    animation: reflection-2024-flicker 9s linear infinite;
  }

  .reflection-2024-title {
    margin: 10px 0 0;
    font-size: clamp(34px, 5.6vw, 78px);
    line-height: 0.95;
    letter-spacing: -0.03em;
    font-weight: 800;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(199, 210, 254, 0.9)),
      radial-gradient(500px 150px at 30% 40%, rgba(139, 92, 246, 0.35), transparent 70%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.5));
  }

  .reflection-2024-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .reflection-2024-pill {
    padding: 10px 12px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.14);
    font-size: 13px;
    letter-spacing: 0.02em;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.32);
  }

  .reflection-2024-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(12px, 1.8vw, 18px);
    max-width: 1200px;
  }

  .reflection-2024-card {
    grid-column: span 12;
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.58)),
      var(--bg);
    background-size: cover;
    background-position: center;
    border: 1px solid rgba(255, 255, 255, 0.14);
    transform: translateZ(0);
    transition:
      transform 260ms cubic-bezier(0.2, 0.9, 0.2, 1),
      filter 260ms cubic-bezier(0.2, 0.9, 0.2, 1),
      border-color 260ms cubic-bezier(0.2, 0.9, 0.2, 1);
    box-shadow:
      0 32px 90px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }

  .reflection-2024-card::before {
    content: \"\";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(900px 420px at 10% 20%, rgba(139, 92, 246, 0.22), transparent 60%),
      radial-gradient(720px 420px at 85% 30%, rgba(34, 211, 238, 0.18), transparent 62%);
    opacity: 0.9;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .reflection-2024-card-sheen {
    position: absolute;
    inset: -30%;
    background: linear-gradient(
      110deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.18) 44%,
      rgba(255, 255, 255, 0) 58%
    );
    transform: translateX(-35%) rotate(8deg);
    opacity: 0.55;
    pointer-events: none;
    animation: reflection-2024-sheen 3.6s ease-in-out infinite;
  }

  .reflection-2024-card-body {
    position: relative;
    padding: clamp(14px, 2vw, 18px);
    min-height: 168px;
    display: grid;
    align-content: end;
    gap: 8px;
  }

  .reflection-2024-card-title {
    font-size: clamp(18px, 2.2vw, 26px);
    font-weight: 800;
    letter-spacing: -0.02em;
    text-shadow:
      0 24px 70px rgba(0, 0, 0, 0.8),
      0 2px 0 rgba(0, 0, 0, 0.32);
  }

  .reflection-2024-card-prize {
    font-size: 13px;
    letter-spacing: 0.02em;
    opacity: 0.9;
    color: rgba(226, 232, 255, 0.9);
    text-shadow: 0 18px 60px rgba(0, 0, 0, 0.82);
  }

  .reflection-2024-card:hover {
    transform: translateY(-6px) scale(1.01);
    filter: saturate(115%) contrast(110%);
    border-color: rgba(226, 232, 255, 0.32);
  }

  .reflection-2024-card:hover .reflection-2024-card-sheen {
    opacity: 0.9;
  }

  @media (min-width: 720px) {
    .reflection-2024-card {
      grid-column: span 6;
    }
  }

  @media (min-width: 1080px) {
    .reflection-2024-card {
      grid-column: span 4;
    }
  }

  @keyframes reflection-2024-rise {
    from {
      transform: translateY(18px);
      opacity: 0;
      filter: blur(10px) saturate(115%);
    }

    to {
      transform: translateY(0px);
      opacity: 1;
      filter: blur(0px) saturate(100%);
    }
  }

  @keyframes reflection-2024-flicker {
    0%,
    92%,
    100% {
      opacity: 0.92;
      filter: none;
    }

    93% {
      opacity: 0.62;
      filter: blur(0.6px);
    }

    94% {
      opacity: 0.98;
    }

    97% {
      opacity: 0.74;
    }
  }

  @keyframes reflection-2024-sheen {
    0% {
      transform: translateX(-38%) rotate(8deg);
    }

    50% {
      transform: translateX(38%) rotate(8deg);
    }

    100% {
      transform: translateX(-38%) rotate(8deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reflection-2024-hero {
      animation: none;
    }

    .reflection-2024-card,
    .reflection-2024-card-sheen,
    .reflection-2024-kicker {
      transition: none;
      animation: none;
    }
  }
</style>
