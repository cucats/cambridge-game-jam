<div class="about">
  <h2 class="section-title">About</h2>

  <div class="qa">
    <!-- <img src="/2026/jam-1.jpg" alt="8-bit drawing of a jam" class="qa-img" /> -->
    <div class="qa-text">
      <h3>What is The Cambridge Game Jam?</h3>
      <p>
        Embark on an action-packed weekend challenge! You'll have <em
          >48 hours</em
        > to design and build any kind of game—from video games to board games—working
        in teams, based around a theme announced at the start.
      </p>
      <p>
        Look forward to exciting prizes awarded across a range of categories,
        including best music, art, and more!
      </p>
    </div>
  </div>

  <div class="qa flip">
    <!-- <img src="/2026/girl.jpg" alt="8-bit drawing of a girl" class="qa-img" /> -->
    <div class="qa-text">
      <h3>Who is invited?</h3>
      <p>
        <strong>Everyone!</strong> Game developers, artists, musicians, and anything
        in between. No programming experience needed.
      </p>
      <p>
        A great opportunity to learn new skills, meet like-minded people, and
        have fun making games together.
      </p>
    </div>
  </div>
</div>

<style>
  .about {
    max-width: 700px;
    margin: 0 auto;
    padding: 2rem 1rem;
    margin-bottom: -2rem;
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

  @media (max-width: 500px) {
    .qa,
    .qa.flip {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .qa-text h3 {
      display: block;
    }

    .qa-img {
      width: 80px;
      height: 80px;
    }
  }
</style>
