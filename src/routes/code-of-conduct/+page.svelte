<script>
</script>

<svelte:head>
  <title>Code of Conduct &bull; The Cambridge Game Jam</title>
</svelte:head>

<div class="page-container">
  <div class="content-card">
    <h1 class="page-title">Code of Conduct</h1>

    <div class="intro">
      <p>
        The Cambridge Game Jam is committed to providing a <em>safe</em>,
        <em>inclusive</em>, and <em>welcoming</em> experience for everyone. This code
        outlines our expectations for all participants and attendees.
      </p>
    </div>

    <div class="section">
      <h2>Our Commitment</h2>
      <p>
        We do not tolerate any form of harassment, discrimination, or exclusion.
        In particular, we do not tolerate discrimination based on:
      </p>
      <ul class="values-list">
        <li>
          <span class="bullet">◆</span>
          Race, ethnicity, or nationality
        </li>
        <li>
          <span class="bullet">◆</span>
          Gender identity, expression, or sexual orientation
        </li>
        <li>
          <span class="bullet">◆</span>
          Age
        </li>
        <li>
          <span class="bullet">◆</span>
          Disability or medical condition
        </li>
        <li>
          <span class="bullet">◆</span>
          Physical appearance or body size
        </li>
        <li>
          <span class="bullet">◆</span>
          Religion or belief system
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>Reporting</h2>
      <p>
        If you feel you are being harassed by someone else at the event, please
        come talk to a <strong>member of the committee</strong> and we will handle
        the situation accordingly.
      </p>
      <p class="note">
        Participants who break these rules may be disqualified at the discretion
        of the committee.
      </p>
    </div>
  </div>
  <a href="/" class="back-link">← Back to main page</a>
</div>

<style>
  .page-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    margin-top: 2rem;
  }

  .content-card {
    max-width: 640px;
    width: 100%;
    background: rgba(255, 253, 248, 0.95);
    border: 4px solid #3d2914;
    padding: 2.5rem 2rem;
    box-shadow: 8px 8px 0 #3d2914;
  }

  .page-title {
    font-family: "Peaberry Base", monospace;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    color: #1a1c1e;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 3px solid #f05663;
  }

  .intro p {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #3d2914;
    margin-bottom: 0;
  }

  .intro em {
    color: #f05663;
    font-style: normal;
    font-weight: 600;
  }

  .section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px dashed #d4c9a8;
  }

  .section h2 {
    font-family: "Peaberry Base", monospace;
    font-size: 1.25rem;
    color: #3d2914;
    margin-bottom: 1rem;
  }

  .section p {
    color: #3d2914;
    line-height: 1.65;
    margin-bottom: 1rem;
  }

  .section p:last-child {
    margin-bottom: 0;
  }

  .section strong {
    color: #f05663;
  }

  .values-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .values-list li {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    color: #3d2914;
    line-height: 1.5;
  }

  .bullet {
    color: #86e293;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .note {
    font-size: 0.95rem;
    padding: 1rem;
    background: rgba(240, 86, 99, 0.1);
    border-left: 3px solid #f05663;
  }

  .back-link {
    display: inline-block;
    margin-top: 2rem;
    padding: 1rem;
    width: 100%;
    color: #3d2914;
    text-decoration: none;
    font-family: "Peaberry Base", monospace;
    font-size: 0.95rem;
  }

  .back-link:hover {
    color: #f05663;
  }

  @media (max-width: 640px) {
    .page-container {
      padding: 3rem 1rem 5rem;
    }

    .content-card {
      padding: 1.5rem 1.25rem;
      box-shadow: 4px 4px 0 #3d2914;
    }
  }
</style>
