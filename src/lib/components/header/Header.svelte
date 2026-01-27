<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let expanded = $state(false);
  let scrolled = $state(false);
  let activeSection = $state("");
  let clickedSection = $state("");

  const sections = [
    { id: "about", href: "/#about", icon: "info-box", label: "About" },
    { id: "schedule", href: "/#schedule", icon: "calendar", label: "Schedule" },
    { id: "sponsors", href: "/#sponsors", icon: "heart", label: "Sponsors" },
    { id: "faq", href: "/#faq", icon: "message-text", label: "FAQ" },
    { id: "archive", href: "/#archive", icon: "archive", label: "Archive" },
  ];

  function handleScroll() {
    // Get about section position for threshold calculation
    const aboutSection = document.getElementById("about");
    const aboutTop = aboutSection ? aboutSection.offsetTop : 800;

    // Header collapses when scrolled past 15% of landing page
    // This matches the landing page snap zone threshold
    const threshold = aboutTop * 0.15;
    scrolled = window.scrollY > threshold;

    // Check which section is currently in view
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          activeSection = section.id;
          return;
        }
      }
    }

    // If at top of page, clear active section
    if (window.scrollY < threshold) {
      activeSection = "";
    }
  }

  function handleClick(sectionId) {
    clickedSection = sectionId;
    // Reset clicked state after animation
    activeSection = sectionId;
    setTimeout(() => {
      clickedSection = "";
    }, 300);
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  });
</script>

<div class="header-container" class:scrolled>
  <div class="header-grid">
    <div class="dates">
      <div class="dates-inner">2026&nbsp;&nbsp;1/1&nbsp;&ndash;&nbsp;1/2</div>
    </div>
    <nav class="nav-vertical" class:icons-only={scrolled}>
      {#each sections as section}
        <a
          href={section.href}
          class="nav-link"
          class:active={activeSection === section.id}
          class:clicked={clickedSection === section.id}
          onclick={() => handleClick(section.id)}
        >
          <span class="nav-text">{section.label}</span>
          <img
            src="https://unpkg.com/pixelarticons@1.8.1/svg/{section.icon}.svg"
            alt={section.icon}
            class="nav-icon rounded"
            class:icon-active={activeSection === section.id ||
              clickedSection === section.id}
          />
        </a>
      {/each}
    </nav>
  </div>
</div>

<style>
  .header-container {
    max-width: 1200px;
    margin: 1rem auto;
    padding: 0 1rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transition: all 0.3s ease;
  }

  .header-container.scrolled {
    max-width: none;
    margin: 0;
    padding: 0.5rem 1rem;
  }

  .header-grid {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: auto;
    transition: all 0.3s ease;
  }

  .scrolled .header-grid {
    justify-content: flex-end;
  }

  .dates {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .scrolled .dates {
    opacity: 0;
    transform: translateX(-20px);
    position: absolute;
    pointer-events: none;
  }

  .dates-inner {
    font-family: "Peaberry Base", monospace;
    font-size: clamp(1rem, 3vw, 1.5rem);
    color: #000000;
  }

  .nav-vertical {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    gap: 0.25rem;
    transition: all 0.3s ease;
  }

  .nav-vertical.icons-only {
    flex-direction: row;
    gap: 0.5rem;
  }

  .nav-link {
    font-family: "Peaberry Base", monospace;
    font-size: clamp(0.9rem, 2.4vw, 1.25rem);
    color: #000000;
    text-decoration: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: all 0.2s ease;
  }

  .nav-text {
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .icons-only .nav-text {
    width: 0;
    opacity: 0;
    margin: 0;
  }

  .nav-icon {
    width: 1.5em;
    height: 1.5em;
    margin-left: 0.25em;
    transition: all 0.2s ease;
    filter: brightness(0);
  }

  .icons-only .nav-icon {
    width: 2em;
    height: 2em;
    margin-left: 0;
  }

  .nav-link.active .nav-icon {
    filter: brightness(0) invert(1) !important;
  }

  .nav-link.active {
    color: #ffffff;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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
