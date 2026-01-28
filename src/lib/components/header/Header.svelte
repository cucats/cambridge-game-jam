<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let { forceCollapsed = false } = $props();

  let scrolled = $state(false);
  let activeSection = $state("");

  // Use forceCollapsed or scroll-based state
  let isCollapsed = $derived(forceCollapsed || scrolled);

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

  function handleClick(event, sectionId) {
    event.preventDefault();
    activeSection = sectionId;

    const targetElement = document.getElementById(sectionId);
    if (!targetElement) return;

    // Header height when collapsed (scrolled state)
    const headerHeight = 0;
    // Extra padding for visual breathing room - only when header is expanded
    const extraPadding = scrolled
      ? 0.05 * window.innerHeight
      : 0.1 * window.innerHeight;

    // Disable landing page snap scroll during navigation
    if (browser) {
      window.__navScrolling = true;
    }

    // Simple scroll calculation - no dynamic margins to worry about
    const rect = targetElement.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - headerHeight - extraPadding;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth",
    });

    // Re-enable snap scroll after animation completes
    setTimeout(() => {
      if (browser) {
        window.__navScrolling = false;
      }
    }, 800);
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  });
</script>

<div class="header-container" class:scrolled={isCollapsed}>
  <div class="header-grid">
    <div class="dates">
      <div class="dates-inner">
        2026&nbsp;&nbsp;27/02&nbsp;&ndash;&nbsp;01/03
      </div>
    </div>
    <a href="/" class="register-btn" class:show={isCollapsed}>
      <span class="register-text">THE CAMBRIDGE GAME JAM 2026</span>
    </a>
    <nav class="nav-vertical" class:icons-only={isCollapsed}>
      {#each sections as section}
        <a
          href={section.href}
          class="nav-link"
          class:active={activeSection === section.id}
          onclick={(e) => handleClick(e, section.id)}
        >
          <span class="nav-text">{section.label}</span>
          <img
            src="https://unpkg.com/pixelarticons@1.8.1/svg/{section.icon}.svg"
            alt={section.icon}
            class="nav-icon rounded"
            class:icon-active={activeSection === section.id}
          />
        </a>
      {/each}
    </nav>
  </div>
</div>

<style>
  .header-container {
    margin: 0rem auto;
    padding: 1rem 1rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transition:
      max-width 0.3s ease,
      margin 0.3s ease,
      padding 0.3s ease;
  }

  .header-container.scrolled {
    max-width: none;
    margin: 0rem 0 0 0;
    padding: 0.5rem 1rem;
    background: #ffe7a8eb;
    border-bottom: 3px solid #3d2914;
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
    transition: none;
  }

  .scrolled .dates {
    display: none;
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
    transition: none;
    overflow: hidden;
  }

  .icons-only .nav-text {
    display: none;
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
  }

  .register-btn {
    position: relative;
    gap: 0.4em;
    font-family: "Peaberry Base", monospace;
    font-size: clamp(0.75rem, 2vw, 0.9rem);
    color: #000000;
    cursor: pointer;
    padding: 0.4em 0.8em;
    text-decoration: none;
    letter-spacing: 0.5px;
    transition: all 0.15s ease;
    display: none;
    margin-right: auto;
  }

  .register-btn.show {
    display: flex;
  }

  .register-btn:hover {
    transform: translate(1px, 1px);
  }

  .register-btn.show:hover {
    transform: translate(1px, 1px);
  }

  .register-text {
    display: flex;
    align-items: center;
    white-space: nowrap;
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

  @media (max-width: 380px) {
    .header-container {
      padding: 0 0;
    }
    .register-btn {
      margin: 0 auto;
    }
    .nav-vertical.icons-only {
      display: none;
    }
  }
  @media (max-width: 450px) {
    .header-container {
      padding: 0.5rem 0.5rem;
    }

    .register-text {
      font-size: 0.7rem;
    }

    .nav-icon {
      width: 1em;
      height: 1em;
    }
  }
</style>
