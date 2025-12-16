<script>
  const years = [
    {
      year: 2023,
      theme: "Beneath the Earth",
      submissionImage: "/2023/beaneth-the-earth.png",
      accent: "#87431D",
      archiveLink: "/archive/2023",
    },
    {
      year: 2024,
      theme: "Reflection",
      submissionImage: "/2024/asymmetry.png",
      accent: "#1F4B99",
      archiveLink: "/archive/2024",
    },
    {
      year: 2025,
      theme: "Synaesthesia",
      submissionImage: "/2025/Synthesia.png",
      accent: "#3C6E71",
    },
    {
      year: 2026,
      theme: "???",
      submissionImage: null,
      accent: "#8C5A8E",
      archiveLink: null,
    },
  ];

  let selectedYear = years[years.length - 1].year;

  const setYear = (year) => {
    selectedYear = year;
  };
</script>

<section class="timeline" aria-labelledby="timeline-heading">
  <div class="timeline-inner">
    <header class="timeline-header">
      <p class="eyebrow">Previous Years</p>
      <h3 id="timeline-heading">View the archive</h3>
    </header>

    <div class="panels" role="tablist">
      {#each years as yearData (yearData.year)}
        <button
          type="button"
          class="panel"
          class:active={selectedYear === yearData.year}
          style="--accent: {yearData.accent}"
          role="tab"
          aria-selected={selectedYear === yearData.year}
          aria-controls={`panel-${yearData.year}`}
          on:pointerenter={() => setYear(yearData.year)}
          on:focus={() => setYear(yearData.year)}
          on:click={() => setYear(yearData.year)}
        >
          <div class="panel-media" aria-hidden="true">
            {#if yearData.submissionImage}
              <img src={yearData.submissionImage} alt="" loading="lazy" />
            {/if}
            <div class="panel-overlay"></div>
          </div>

          <div class="panel-body" id={`panel-${yearData.year}`} role="tabpanel">
            <div class="panel-meta">
              <span class="panel-year">{yearData.year}</span>
              <div class="panel-theme">
                <span class="theme-label">Theme</span>
                <span class="theme-value">{yearData.theme}</span>
              </div>
            </div>

            {#if yearData.archiveLink}
              <a class="panel-link" href={yearData.archiveLink}>Open archive</a>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .timeline {
    width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
    background: #f5f3f0;
    padding: 4rem 0 5rem;
  }

  .timeline-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .timeline-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .eyebrow {
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #6b6b6b;
    margin-bottom: 0.75rem;
  }

  .timeline-header h3 {
    font-size: clamp(2rem, 4vw, 2.75rem);
    margin-bottom: 0.75rem;
    color: #1a1a1a;
  }

  .intro {
    max-width: 620px;
    margin: 0 auto;
    font-size: 1rem;
    line-height: 1.6;
    color: #4d4d4d;
  }

  .panels {
    display: flex;
    gap: 1.25rem;
    min-height: 380px;
  }

  .panel {
    position: relative;
    flex: 1;
    min-width: clamp(140px, 22vw, 240px);
    border: none;
    padding: 0;
    border-radius: 24px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    background: #0f172a;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
    transition:
      flex 0.5s ease,
      box-shadow 0.5s ease,
      transform 0.5s ease;
  }

  .panel:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 4px;
  }

  .panel.active {
    flex: 1.65;
    transform: translateY(-6px);
    box-shadow: 0 28px 45px rgba(15, 23, 42, 0.28);
  }

  .panel-media {
    position: absolute;
    inset: 0;
  }

  .panel-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.05);
    transition: transform 0.6s ease;
  }

  .panel.active .panel-media img {
    transform: scale(1);
  }

  .panel-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgba(10, 15, 30, 0.75) 0%,
      rgba(10, 15, 30, 0.45) 45%,
      rgba(10, 15, 30, 0.85) 100%
    );
  }

  .panel-body {
    position: relative;
    width: 100vw;
    left: 50%;
    right: 0;
    transform: translateX(-50%);
    z-index: 1;
    margin-top: auto;
    padding: 2.75rem 2rem 2.25rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    color: #ffffff;
    text-align: left;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.15) 0%,
      rgba(15, 23, 42, 0.75) 100%
    );
    align-items: flex-start;
  }

  .panel-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .panel-year {
    display: inline-flex;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    font-size: 0.9rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .panel-theme {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 0.95rem;
    letter-spacing: 0.05em;
  }

  .theme-label {
    text-transform: uppercase;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.7);
  }

  .theme-value {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .panel-link {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    transition:
      color 0.3s ease,
      border-color 0.3s ease;
  }

  .panel-link:hover {
    color: rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .panel.active .panel-body {
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.05) 0%,
      rgba(15, 23, 42, 0.8) 100%
    );
  }

  .panel.active .panel-link {
    color: rgba(255, 255, 255, 0.95);
    border-color: rgba(255, 255, 255, 0.65);
  }

  @media (max-width: 1024px) {
    .panels {
      flex-direction: column;
      gap: 1rem;
      min-height: unset;
    }

    .panel {
      height: auto;
    }

    .panel.active {
      transform: none;
    }

    .panel-body {
      padding: 2rem;
      gap: 1.5rem;
    }
  }

  @media (max-width: 640px) {
    .timeline-inner {
      padding: 0 1.5rem;
    }

    .panel-body {
      padding: 1.75rem;
      gap: 1.35rem;
    }
  }
</style>
