<script>
  import Hamburger from "$lib/components/header/Hamburger.svelte";
  import MobileMenu from "$lib/components/header/MobileMenu.svelte";

  let expanded = $state(false);
</script>

<div class="header-container">
  <div class="header-grid">
    <div class="dates">
      <div class="dates-inner">2026&nbsp;&nbsp;1/1&nbsp;&ndash;&nbsp;1/2</div>
    </div>
    <nav class="nav-vertical">
      <a href="/#about" class="nav-link">About</a>
      <a href="/#schedule" class="nav-link">Schedule</a>
      <a href="/#sponsors" class="nav-link">Sponsors</a>
      <a href="/#faq" class="nav-link">FAQ</a>
      <a href="/archive" class="nav-link">Archive</a>
      <a href="/signup" class="nav-link">➤ REGISTER!</a>
    </nav>
  </div>
</div>

<style>
  .header-container {
    max-width: 1200px;
    margin: 1rem auto;
    padding: 0 1rem;
  }

  .header-grid {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: auto;
  }

  .dates-inner {
    font-family: "Peaberry Base", monospace;
    font-size: clamp(1rem, 3vw, 1.5rem);
    color: #000000;
  }

  .nav-vertical {
    display: flex;
    flex-direction: column;
    align-items: flex-end; /* right align */
    text-align: right;
    gap: 0.25rem;
  }

  .nav-link {
    font-family: "Peaberry Base", monospace;
    font-size: clamp(0.9rem, 2.4vw, 1.25rem);
    color: #000000;
    text-decoration: none;
    line-height: 0.8;
  }

  .nav-link:hover {
    color: #ffe7a8;
    text-shadow: 1px 1px 0 #3d2914;
  }
  @media (max-width: 768px) {
    .header-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    .nav-vertical {
      align-items: flex-end;
    }
  }
</style>
