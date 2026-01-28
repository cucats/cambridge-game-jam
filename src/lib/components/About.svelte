<div class="about">
  <h2 class="section-title">About</h2>

  <div class="qa">
    <!-- <img src="/2026/jam-1.jpg" alt="8-bit drawing of a jam" class="qa-img" /> -->
    <div class="qa-text">
      <h3>What is a Game Jam?</h3>
      <p>
        A game jam is a short event where people come together to build a game
        in teams! In this game jam you'll have roughly <em>48 hours</em> to
        build
        <strong>any game you can dream of</strong>: from video games to board
        games to ARGs.
      </p>
    </div>
  </div>

  <div class="qa flip">
    <!-- <img src="/2026/girl.jpg" alt="8-bit drawing of a girl" class="qa-img" /> -->
    <div class="qa-text">
      <h3>Who is invited?</h3>
      <p>
        <strong>All current University of Cambridge students</strong> are
        welcome, and we encourage you to invite your friends from
        <em>any discipline</em>! We expect the average team to have 2 game
        designers, 2 artists and 1 musician - but this is very game dependent
        and people are encouraged to do whatever they find fun. We hope to
        create an <strong>inclusive and welcoming environment</strong>, so that
        people from any background can enjoy the event.
      </p>
    </div>
  </div>
</div>

<style>
  .about {
    max-width: 700px;
    height: 100vh;
    margin: 0 0;
    padding: 2rem 1rem 4rem;
    place-self: center;
  }

  .qa {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    background: rgba(255, 253, 248, 0.9);
    padding: 1.25rem;
    border-left: 3px solid #86e293;
  }

  .qa.flip {
    flex-direction: row-reverse;
    text-align: right;
    border-left: none;
    border-right: 3px solid #f05663;
  }

  .qa-text h3 {
    font-size: 1.15rem;
    color: #3d2914;
    margin-bottom: 0.5rem;
    border-bottom: 2px solid #86e293;
    display: inline-block;
    padding-bottom: 0.2rem;
  }

  .qa-text p {
    color: #3d2914;
    line-height: 1.65;
    margin-bottom: 0.5rem;
  }

  .qa-text p:last-child {
    margin-bottom: 0;
  }

  .qa-text em {
    color: #f05663;
    font-style: normal;
    font-weight: 600;
  }

  .qa-text strong {
    color: #f05663;
  }

  @media (max-width: 520px) {
    .qa,
    .qa.flip {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .qa-text h3 {
      display: block;
    }
    .about {
      padding: 1.5rem 0.5rem;
    }

    .qa-text p {
      font-size: 1rem;
    }
  }

  @media (max-width: 420px) {
    .about {
      padding: 1.5rem 0.5rem;
    }

    .qa-text h3 {
      font-size: 1rem;
    }

    .qa-text p {
      font-size: 0.9rem;
    }
  }
</style>
