<script>
    import PriorJamPage from "$lib/components/prior-jams/PriorJamPage.svelte";
    const title = "Cambridge Game Jam 2023";
    const duration = "10th - 12th February";
    const submissions = 19;
    const theme = "Beneath the Earth";

    const images = [
        {
            src: "/prior-jams/2023/inferno_rising.png",
            alt: "Inferno Rising",
            link: "https://firedemon111.itch.io/inferno-rising",
            title: "Inferno Rising",
            prize: "Popular Vote",
        },
        {
            src: "/prior-jams/2023/mayi_garden.png",
            alt: "Mayi Garden",
            link: "https://qiaozhi-lei.itch.io/mayi-garden",
            title: "MAYI Garden",
            prize: "Best for Theme",
        },
        {
            src: "/prior-jams/2023/rhythm_mythril_fever.png",
            alt: "Rhythm Mythril Fever",
            link: "https://stolencheese.itch.io/rhythm-mythril-fever",
            title: "Rhythm Mythril Fever",
            prize: "Best Presentation",
        },
        {
            src: "/prior-jams/2023/beaneth_the_earth.png",
            alt: "Beaneth the Earth",
            link: "https://mxbi.itch.io/beaneth-the-earth",
            title: "Beaneth the Earth",
            prize: "Best Gameplay",
        },
        {
            src: "/prior-jams/2023/deck_of_dwarves.png",
            alt: "Deck of Dwarves",
            link: "https://joeoc.itch.io/deck-of-dwarves",
            title: "Deck of Dwarves",
            prize: "Most Original Idea",
        },
        {
            src: "/prior-jams/2023/all_submissions.png",
            alt: "All Submissions",
            link: "https://itch.io/jam/camgamejam",
            title: "All Submissions",
            prize: "",
        },
    ];
</script>

<PriorJamPage {images} {title} {duration} {submissions} {theme} />
