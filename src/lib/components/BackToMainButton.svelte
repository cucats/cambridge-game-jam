<a href="/" class="back-to-main" aria-label="Back to main page">
  <span class="back-icon" aria-hidden="true">←</span>
  <span class="back-label">Back to main page</span>
</a>

<style>
  .back-to-main {
    position: fixed;
    left: 1.25rem;
    bottom: 1.25rem;
    z-index: 40;
    padding: 0.65rem 1.1rem;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    background: rgba(15, 23, 42, 0.95);
    color: white;
    text-decoration: none;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.6);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease;
  }

  .back-to-main:hover {
    transform: translateY(-1px);
    background: rgba(15, 23, 42, 1);
    border-color: rgba(248, 250, 252, 0.9);
    box-shadow: 0 22px 55px rgba(15, 23, 42, 0.9);
  }

  .back-to-main:focus-visible {
    outline: 2px solid #facc15;
    outline-offset: 3px;
  }

  .back-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .back-label {
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .back-to-main {
      left: 0.75rem;
      bottom: 0.75rem;
      padding-inline: 0.9rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .back-to-main {
      transition: none;
    }
  }
</style>
