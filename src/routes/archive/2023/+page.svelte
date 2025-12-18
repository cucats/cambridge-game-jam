<script lang="ts">
  import { onMount } from "svelte";
  import CaveBackground from "./CaveBackground.svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  type FeaturedProject = {
    src: string;
    alt: string;
    link: string;
    title: string;
    prize: string;
  };

  const featuredProjects: FeaturedProject[] = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  const faqs = [
    {
      q: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus in ipsum vel justo vestibulum tempor. Sed non ex in sem faucibus tincidunt.",
    },
    {
      q: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?",
      a: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      q: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum?",
      a: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.",
    },
    {
      q: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio?",
      a: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
    },
    {
      q: "Integer in mauris eu nibh euismod gravida?",
      a: "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor.",
    },
  ];

  let scrollProgress = 0;

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const updateScrollProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? clamp01(window.scrollY / max) : 0;
  };

  onMount(() => {
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<div class="page min-h-screen bg-[#05060a] text-[color:var(--c-primary)]">
  <header
    class="mx-auto flex max-w-6xl items-center justify-between px-4 pb-5 pt-6 sm:px-8"
  >
    <a
      href="/archive"
      class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-ubuntu text-xs uppercase tracking-[0.18em] text-[color:var(--c-dim)] outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-amber-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
    >
      Archive
    </a>
  </header>

  <div class="relative isolate overflow-hidden">
    <div class="absolute inset-0">
      <CaveBackground {scrollProgress} />
    </div>
    <div
      class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-[#05060a]"
    ></div>

    <div
      class="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24"
    >
      <p
        class="font-ubuntu text-xs uppercase tracking-[0.22em] text-[color:var(--c-dim)]"
      >
        Archive
      </p>
      <h1
        class="!mb-0 mt-3 text-balance !text-4xl !font-semibold tracking-tight sm:!text-6xl"
      >
        {title}
      </h1>
      <p
        class="!mb-0 mt-6 max-w-2xl text-pretty text-sm leading-relaxed text-[color:var(--c-dim)] sm:text-base"
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sed
        libero a massa viverra venenatis. Vestibulum ante ipsum primis in
        faucibus orci luctus et ultrices posuere cubilia curae.
      </p>

      <dl class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt
            class="font-ubuntu text-[10px] uppercase tracking-[0.2em] text-[color:var(--c-dim)]"
          >
            Dates
          </dt>
          <dd
            class="!mb-0 mt-2 text-lg font-medium text-[color:var(--c-primary)]"
          >
            {duration}
          </dd>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt
            class="font-ubuntu text-[10px] uppercase tracking-[0.2em] text-[color:var(--c-dim)]"
          >
            Theme
          </dt>
          <dd
            class="!mb-0 mt-2 text-lg font-medium text-[color:var(--c-primary)]"
          >
            {theme}
          </dd>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt
            class="font-ubuntu text-[10px] uppercase tracking-[0.2em] text-[color:var(--c-dim)]"
          >
            Submissions
          </dt>
          <dd
            class="!mb-0 mt-2 text-lg font-medium text-[color:var(--c-primary)]"
          >
            {submissions}
          </dd>
        </div>
      </dl>
    </div>
  </div>

  <main class="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
    <div aria-labelledby="featured-projects" class="pt-14">
      <h2
        id="featured-projects"
        class="!mb-0 !text-2xl !font-semibold tracking-tight sm:!text-3xl"
      >
        Featured projects
      </h2>
      <p
        class="!mb-0 mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--c-dim)] sm:text-base"
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nec purus
        id arcu varius feugiat. Cras at purus ut sapien congue sodales.
      </p>

      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each featuredProjects as project}
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            class="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
          >
            <div
              class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              <div class="aspect-[16/9] w-full overflow-hidden bg-black/20">
                <img
                  src={project.src}
                  alt={project.alt}
                  loading="lazy"
                  decoding="async"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div class="p-5">
                <div class="flex items-start justify-between gap-3">
                  <h3
                    class="!mb-0 !text-base !font-semibold leading-snug text-[color:var(--c-primary)]"
                  >
                    {project.title}
                  </h3>
                  {#if project.prize}
                    <span
                      class="shrink-0 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 font-ubuntu text-[10px] uppercase tracking-[0.18em] text-[color:var(--c-dim)]"
                      >{project.prize}</span
                    >
                  {/if}
                </div>
                {#if !project.prize}
                  <div class="mt-3 h-[22px]"></div>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>

    <div aria-labelledby="faq" class="pt-14">
      <h2
        id="faq"
        class="!mb-0 !text-2xl !font-semibold tracking-tight sm:!text-3xl"
      >
        FAQ
      </h2>

      <div
        class="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
      >
        {#each faqs as item}
          <details class="group p-5">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              <span
                class="text-sm font-medium leading-snug text-[color:var(--c-primary)] sm:text-base"
                >{item.q}</span
              >
              <span
                class="font-ubuntu text-base text-[color:var(--c-dim)] transition-transform duration-200 group-open:rotate-45"
                >+</span
              >
            </summary>
            <p
              class="!mb-0 mt-4 text-sm leading-relaxed text-[color:var(--c-dim)] sm:text-base"
            >
              {item.a}
            </p>
          </details>
        {/each}
      </div>
    </div>
  </main>
</div>

<style>
  .page {
    --c-primary: #f8fafc;
    --c-dim: rgba(248, 250, 252, 0.72);
  }

  summary::-webkit-details-marker {
    display: none;
  }
</style>
