<script>
    import PriorJamPage from "$lib/components/archive/PriorJamPage.svelte";
    const title = "Cambridge Game Jam 2024";
    const duration = "9th - 11th February";
    const submissions = 23;
    const theme = "Reflection";

    const images = [
        {
            src: "/2024/blight.png",
            alt: "Blight",
            link: "https://hex-26.itch.io/blight",
            title: "Blight",
            prize: "Most Popular and Best Gameplay",
        },
        {
            src: "/2024/reflect-upon-your-actions.png",
            alt: "Reflect Upon Your Actions",
            link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
            title: "Reflect Upon Your Actions",
            prize: "Most Popular and Most Original",
        },
        {
            src: "/2024/reflected.png",
            alt: "Reflected",
            link: "https://ekorrette.itch.io/reflected",
            title: "Reflected",
            prize: "Theme Winner",
        },
        {
            src: "/2024/asymmetry.png",
            alt: "Asymmetry",
            link: "https://alex-davies.itch.io/asymmetry",
            title: "Asymmetry",
            prize: "Best Gameplay",
        },
        {
            src: "/2024/coulda-woulda-buddha.png",
            alt: "Coulda Woulda Buddha",
            link: "https://greenwood672.itch.io/coulda-woulda-buddha",
            title: "Coulda Woulda Buddha",
            prize: "Best Presentation",
        },
        {
            src: "/2024/all-submissions.png",
            alt: "All Submissions",
            link: "https://itch.io/jam/camgamejam2024",
            title: "All Submissions",
            prize: "",
        },
    ];
</script>

<PriorJamPage {images} {title} {duration} {submissions} {theme} />
