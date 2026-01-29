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

  let selectedYear = years[0].year;

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

    <div class="panels" role="tablist" aria-labelledby="timeline-heading">
      {#each years as yearData (yearData.year)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="panel"
          class:active={selectedYear === yearData.year}
          class:disabled={yearData.year === 2026}
          style="--accent: {yearData.accent}"
          role="none"
          on:click={() => yearData.year !== 2026 && setYear(yearData.year)}
          on:pointerenter={() =>
            yearData.year !== 2026 && setYear(yearData.year)}
        >
          <button
            type="button"
            class="panel-trigger"
            id={`tab-${yearData.year}`}
            role="tab"
            aria-selected={selectedYear === yearData.year}
            aria-controls={`panel-${yearData.year}`}
            aria-disabled={yearData.year === 2026}
            tabindex={yearData.year === 2026 ? -1 : 0}
            on:focus={() => yearData.year !== 2026 && setYear(yearData.year)}
          >
            <span class="sr-only">Select {yearData.year}</span>
          </button>

          <div class="panel-media" aria-hidden="true">
            {#if yearData.submissionImage}
              <img src={yearData.submissionImage} alt="" loading="lazy" />
            {/if}
            <div class="panel-overlay"></div>
          </div>

          <div
            class="panel-body"
            id={`panel-${yearData.year}`}
            role="tabpanel"
            aria-labelledby={`tab-${yearData.year}`}
          >
            <div class="panel-meta">
              <span class="panel-year">{yearData.year}</span>
              <div class="panel-theme">
                <span class="theme-label">Theme</span>
                <span class="theme-value">{yearData.theme}</span>
              </div>
            </div>

            {#if yearData.archiveLink}
              <a class="panel-link" href={yearData.archiveLink}>
                Open archive →
              </a>
            {:else}
              <span class="panel-link placeholder" aria-hidden="true"
                >{yearData.year === 2025
                  ? "Archive coming soon…"
                  : "\u00A0"}</span
              >
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .timeline {
    width: 100%;
    max-width: 100vw;
    height: 100vh;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    overflow-x: hidden;
  }

  .timeline-inner {
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  .timeline-header {
    text-align: center;
    padding: 1.25rem 0;
  }

  .eyebrow {
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7a6b5a;
    margin-bottom: 0.75rem;
  }

  .timeline-header h3 {
    font-size: clamp(2rem, 4vw, 2.75rem);
    margin-bottom: 0.75rem;
    color: #3d2914;
  }

  .panels {
    display: flex;
    gap: 0;
    min-height: 0;
    height: 100%;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .panel {
    position: relative;
    flex: 1;
    min-width: 0;
    border: none;
    padding: 0;
    border-radius: 0;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    background: #3d2914;
    box-shadow: none;
    transition:
      flex 0.5s ease,
      box-shadow 0.5s ease;
  }

  .panel-trigger {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    z-index: 2;
  }

  .panel-trigger:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: -3px;
  }

  .panel.active {
    flex: 2.2;
    box-shadow: none;
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
      rgba(61, 41, 20, 0.7) 0%,
      rgba(61, 41, 20, 0.35) 45%,
      rgba(61, 41, 20, 0.8) 100%
    );
  }

  .panel-body {
    position: relative;
    width: 100%;
    z-index: 3;
    pointer-events: none;
    margin-top: auto;
    padding: 2.25rem 2rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    color: #fffdf8;
    text-align: left;
    background: linear-gradient(
      180deg,
      rgba(61, 41, 20, 0.1) 0%,
      rgba(61, 41, 20, 0.7) 100%
    );
    align-items: flex-start;
  }

  .panel-body a,
  .panel-body button {
    pointer-events: auto;
  }

  .panel-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    min-height: 2.4rem;
  }

  .panel-year {
    display: inline-flex;
    padding: 0.4rem 0.85rem;
    border-radius: 0;
    background: #86e293;
    color: #3d2914;
    font-size: 0.9rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 600;
  }

  .panel-theme {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.45rem 0.85rem;
    border-radius: 0;
    background: rgba(255, 253, 248, 0.15);
    border: 1px solid rgba(255, 253, 248, 0.25);
    font-size: 0.95rem;
    letter-spacing: 0.05em;
    width: max-content;
  }

  .theme-label {
    text-transform: uppercase;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: #86e293;
  }

  .theme-value {
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: visible;
    text-overflow: unset;
  }

  .panel-link {
    display: inline-flex;
    align-items: center;
    width: max-content;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fffdf8;
    text-decoration: none;
    padding-bottom: 0.3rem;
    border-bottom: 2px solid #86e293;
    transition:
      color 0.15s ease,
      border-color 0.15s ease;
    white-space: nowrap;
    overflow: visible;
    text-overflow: unset;
  }

  .panel-link:hover {
    color: #86e293;
    border-color: #86e293;
  }

  .panel-link.placeholder {
    opacity: 0.5;
    border-color: rgba(255, 253, 248, 0.3);
    cursor: default;
    pointer-events: none;
  }

  .panel.disabled,
  .panel[aria-disabled="true"] {
    cursor: default;
  }

  .panel.active .panel-body {
    background: linear-gradient(
      180deg,
      rgba(61, 41, 20, 0.05) 0%,
      rgba(61, 41, 20, 0.75) 100%
    );
  }

  .panel.active .panel-link {
    color: #fffdf8;
    border-color: #f05663;
  }

  @media (max-width: 1024px) {
    .timeline {
      height: auto;
    }

    .timeline-inner {
      height: auto;
      grid-template-rows: auto auto;
    }

    .panels {
      flex-direction: column;
      gap: 0;
      min-height: unset;
      height: auto;
    }

    .panel {
      flex: none;
      height: auto;
    }

    .panel.active {
      flex: none;
      transform: none;
    }

    .panel-body {
      width: 100%;
      padding: 2rem;
      gap: 1.5rem;
    }
  }

  @media (max-width: 640px) {
    .timeline-inner {
      padding: 0.5rem 0.75rem;
    }

    .panel-body {
      padding: 1.25rem 1rem 1.25rem;
      gap: 1.35rem;
    }

    /* Allow text to overrun on mobile without clipping */
    .panel-theme {
      max-width: 100%;
      align-self: flex-start;
      text-align: left;
    }

    .theme-value {
      overflow: hidden;
      text-overflow: clip;
      white-space: nowrap;
    }

    .panel-link {
      width: fit-content;
      overflow: hidden;
      text-overflow: clip;
      white-space: nowrap;
    }

    .panel-meta {
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 0.75rem;
    }
  }
</style>
