<script>
  import ProjectCard from "./ProjectCard.svelte";

  let { projects = [], activeIndex, onActivate, onDeactivate } = $props();
</script>

<div class="wrap" aria-label="Lorem ipsum">
  <div class="grid">
    {#each projects as p, i (p.title)}
      <ProjectCard
        title={p.title}
        prize={p.prize}
        link={p.link}
        index={i}
        {activeIndex}
        {onActivate}
        {onDeactivate}
      />
    {/each}
  </div>
</div>

<style>
  .wrap {
    width: min(980px, calc(100vw - 32px));
    margin: 0 auto;
    padding: 18px 0 28px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
