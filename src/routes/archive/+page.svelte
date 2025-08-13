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
  <title>Archive &bull; Cambridge Game Jam</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
  <div class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each jams as jam (jam.title)}
      <Titlecard {...jam} />
    {/each}
  </div>
</div>
