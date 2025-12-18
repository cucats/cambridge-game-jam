<script lang="ts">
  import { onMount } from "svelte";
  import CaveBackground from "./CaveBackground.svelte";

  const title = "Cambridge Game Jam 2023";
  const dates = "10th - 12th February";
  const theme = "Beneath the Earth";
  const submissions = 19;

  let scrollProgress = 0;

  onMount(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      scrollProgress = 0;
      return;
    }

    let raf = 0;

    const compute = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const schedule = () => {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  });

  const featuredProjects = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      href: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      href: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      href: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      href: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      href: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      href: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ] as const;

  const faqItems = [
    {
      q: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      q: "Duis aute irure dolor in reprehenderit in voluptate velit?",
      a: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      q: "Ut enim ad minim veniam, quis nostrud exercitation?",
      a: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      q: "Sed ut perspiciatis unde omnis iste natus error sit?",
      a: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    },
    {
      q: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur?",
      a: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
    },
  ] as const;
</script>

<div
  class="min-h-screen bg-slate-950 text-[var(--cg-primary)]"
  style="--cg-primary: #F8FAFC; --cg-dim: rgba(248, 250, 252, 0.72);"
>
  <section class="relative isolate min-h-[85vh] overflow-hidden">
    <CaveBackground {scrollProgress} />
    <div aria-hidden="true" class="absolute inset-0">
      <div
        class="absolute inset-0 bg-[radial-gradient(70%_55%_at_30%_35%,rgba(251,146,60,0.18),rgba(15,23,42,0)_70%)]"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(55%_45%_at_72%_58%,rgba(236,72,153,0.14),rgba(15,23,42,0)_68%)]"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(40%_35%_at_56%_22%,rgba(34,211,238,0.10),rgba(15,23,42,0)_72%)]"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-slate-950/55 to-slate-950"
      ></div>
    </div>

    <div class="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div class="max-w-2xl">
        <p
          class="font-mono text-xs uppercase tracking-[0.22em] text-[var(--cg-dim)]"
        >
          Lorem ipsum dolor sit amet
        </p>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p class="mt-6 text-base leading-relaxed text-[var(--cg-dim)]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <dl class="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
        <div
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur"
        >
          <dt
            class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cg-dim)]"
          >
            Dates
          </dt>
          <dd class="mt-2 text-sm tracking-tight sm:text-base">{dates}</dd>
        </div>
        <div
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur"
        >
          <dt
            class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cg-dim)]"
          >
            Theme
          </dt>
          <dd class="mt-2 text-sm tracking-tight sm:text-base">{theme}</dd>
        </div>
        <div
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur"
        >
          <dt
            class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cg-dim)]"
          >
            Submissions
          </dt>
          <dd class="mt-2 text-sm tracking-tight sm:text-base">
            {submissions}
          </dd>
        </div>
        <div
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur"
        >
          <dt
            class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cg-dim)]"
          >
            Lorem
          </dt>
          <dd class="mt-2 text-sm tracking-tight sm:text-base">Ipsum</dd>
        </div>
      </dl>

      <div
        class="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent"
      ></div>
    </div>
  </section>

  <main class="mx-auto max-w-6xl px-6 pb-24 pt-14">
    <section aria-labelledby="featured-projects" class="scroll-mt-24">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <h2
          id="featured-projects"
          class="text-2xl font-semibold tracking-tight"
        >
          Featured projects
        </h2>
        <div
          class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cg-dim)]"
        >
          Lorem ipsum
        </div>
      </div>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--cg-dim)]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each featuredProjects as project}
          <a
            class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/18 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
            href={project.href}
            target="_blank"
            rel="noreferrer"
          >
            <div
              class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            >
              <div
                class="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
              ></div>
              <div
                class="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-rose-400/10 blur-3xl"
              ></div>
            </div>

            <div class="relative">
              <div class="aspect-[16/10] overflow-hidden bg-slate-900/40">
                <img
                  alt={project.alt}
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none"
                  decoding="async"
                  loading="lazy"
                  src={project.src}
                />
              </div>

              <div class="space-y-3 p-5">
                <div class="flex items-start justify-between gap-4">
                  <h3 class="text-base font-semibold tracking-tight">
                    {project.title}
                  </h3>
                  {#if project.prize}
                    <span
                      class="shrink-0 rounded-full border border-amber-200/15 bg-amber-200/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-100"
                    >
                      {project.prize}
                    </span>
                  {/if}
                </div>
                <p class="text-sm leading-relaxed text-[var(--cg-dim)]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                  enim ad minim veniam.
                </p>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section aria-labelledby="faq" class="mt-16 scroll-mt-24">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <h2 id="faq" class="text-2xl font-semibold tracking-tight">FAQ</h2>
        <div
          class="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cg-dim)]"
        >
          Lorem ipsum
        </div>
      </div>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--cg-dim)]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <div
        class="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        {#each faqItems as item}
          <details
            class="group border-t border-white/10 px-6 py-5 first:border-t-0"
          >
            <summary
              class="flex cursor-pointer list-none items-start gap-4 rounded-xl py-1 font-mono text-sm leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span class="flex-1 text-balance">{item.q}</span>
              <span
                aria-hidden="true"
                class="mt-0.5 grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--cg-dim)] transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none motion-reduce:transform-none"
              >
                <svg
                  class="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.25 7.5L10 12.25L14.75 7.5"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </summary>
            <div class="mt-4 text-sm leading-relaxed text-[var(--cg-dim)]">
              {item.a}
            </div>
          </details>
        {/each}
      </div>
    </section>
  </main>
</div>

<style>
  summary::-webkit-details-marker {
    display: none;
  }
</style>
