<script>
    import Titlecard from "../../lib/components/prior-jams/Titlecard.svelte";

    let jams = [
        {
            title: "Cam Game Jam 2024",
            url: "https://camgamejam.com/", // TODO: change this to the URL for the prior jam history page for this game jam
            startDate: "2nd November 2024",
            endDate: "3rd November 2024",
        },
        {
            title: "Cam Game Jam 2023",
            url: "https://en.wikipedia.org/", // TODO: change this to the URL for the prior jam history page for this game jam
            startDate: "2nd November 2023",
            endDate: "3rd November 2023",
        },
    ];
</script>

<svelte:head>
    <title>Prior Jams &bull; Cam Hack 2025</title>
</svelte:head>

<div id="prior-jam-outer" class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each jams as jam (jam.title)}
        <Titlecard {...jam} />
    {/each}
</div>
