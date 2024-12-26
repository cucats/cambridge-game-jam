<script>
    import Titlecard from "$lib/components/prior-jams/Titlecard.svelte";

    const jams = [
        {
            title: "Cam Game Jam 2024",
            url: "https://camgamejam.com/", // TODO: change this to the URL for the prior jam history page for this game jam
            startDate: "2nd November 2024",
            endDate: "3rd November 2024",
        },
        {
            title: "Cam Game Jam 2023",
            url: "/prior-jams/2023", // TODO: change this to the URL for the prior jam history page for this game jam
            startDate: "2nd November 2023",
            endDate: "3rd November 2023",
        },
    ];
</script>

<svelte:head>
    <title>Prior Jams &bull; Cambridge Game Jam</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
    <div class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each jams as jam (jam.title)}
            <Titlecard {...jam} />
        {/each}
    </div>
</div>
