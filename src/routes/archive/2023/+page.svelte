<script>
    import PriorJamPage from "$lib/components/archive/PriorJamPage.svelte";
    const title = "Cambridge Game Jam 2023";
    const duration = "10th - 12th February";
    const submissions = 19;
    const theme = "Beneath the Earth";

    const images = [
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
</script>

<PriorJamPage {images} {title} {duration} {submissions} {theme} />
