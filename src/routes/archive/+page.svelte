<script>
  import Titlecard from "$lib/components/archive/Titlecard.svelte";

  const jams = [
    {
      title: "Cam Game Jam 2024",
      url: "/archive/2024",
      startDate: "9th February",
      endDate: "11th February",
    },
    {
      title: "Cam Game Jam 2023",
      url: "/archive/2023",
      startDate: "10th February",
      endDate: "12th February",
    },
  ];
</script>

<svelte:head>
  <title>Archive &bull; The Cambridge Game Jam</title>
</svelte:head>

<div class="archive-page">
  <h1 class="page-title">Archive</h1>
  <p class="page-subtitle">Previous Cambridge Game Jams</p>

  <div class="jam-grid">
    {#each jams as jam (jam.title)}
      <Titlecard {...jam} />
    {/each}
  </div>
</div>

<style>
  .archive-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 5rem 1.5rem 4rem;
  }

  .page-title {
    font-family: "Peaberry Base", monospace;
    font-size: clamp(2rem, 5vw, 3rem);
    color: #1a1c1e;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .page-subtitle {
    font-family: "Peaberry Base", monospace;
    font-size: 1rem;
    color: #3d2914;
    text-align: center;
    margin-bottom: 2.5rem;
    opacity: 0.8;
  }

  .jam-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    .archive-page {
      padding: 4rem 1rem 3rem;
    }
  }
</style>
