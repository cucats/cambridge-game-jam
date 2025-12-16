<script>
  import YearSelector from "./YearSelector.svelte";
</script>

<div class="about-container">
  <div class="about-content">
    <h2 class="about-title">About Cambridge Game Jam</h2>

    <div class="about-text">
      <p>
        <strong>Now in its fourth year</strong>, Cambridge Game Jam is a 48 hour
        game jam hosted by the Cambridge University Computing and Technology
        Society. Over an action-packed weekend, you will have 48 hours to build
        a game in teams or individually based around a theme (announced at the
        beginning of the jam)!
      </p>

      <p>
        This jam is our excuse to champion projects that exist purely for the
        joy of making them. We welcome <strong>curious beginners</strong> and
        <strong>seasoned devs</strong> alike—tinker with a tool you have never touched,
        chase an odd idea, and ship something that makes you grin simply because
        you brought it to life.
      </p>
    </div>
  </div>

  <YearSelector />
</div>

<style>
  .about-container {
    position: relative;
    width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
    background: white;
  }

  .about-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 4rem 2rem 3rem;
    text-align: center;
  }

  .about-title {
    font-size: clamp(2.5rem, 6vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 2rem;
    color: #1a1a1a;
  }

  .about-text {
    max-width: 700px;
    margin: 0 auto;
  }

  .about-text p {
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
    line-height: 1.7;
    margin-bottom: 1.5rem;
    color: #444;
  }

  .about-text strong {
    color: #000;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    .about-content {
      padding: 3rem 1.5rem 2rem;
    }
  }
</style>
