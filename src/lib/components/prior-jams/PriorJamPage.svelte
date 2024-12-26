<script>
    import { onMount } from "svelte";

    let currentIndex = $state(0);
    const { images, title, date, submissions, theme } = $props();

    const nextSlide = () => {
        console.log("next slide");
        console.log(currentIndex);
        currentIndex = (currentIndex + 1) % images.length;
        console.log(currentIndex);
    };

    const prevSlide = () => {
        console.log("previous slide");
        currentIndex = (currentIndex - 1 + images.length) % images.length;
    };

    let mouseX = $state(0);
    let mouseY = $state(0);
    const handleMouseMove = (event) => {
        const { clientX, clientY, view } = event;
        const width = view.innerWidth;
        const height = view.innerHeight;

        mouseX = (clientX / width - 0.5) * 20; // Parallax movement on X-axis
        mouseY = (clientY / height - 0.5) * 20; // Parallax movement on Y-axis
    };

    onMount(() => {
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    });
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<div class="w-full bg-gradient-to-br from-rose-400 to-red-300">
    <div class="max-w-7xl pt-6 pb-2 mx-auto max-sm:text-center">
        <img
            src="/prior-jams/2023/logo.png"
            alt="Cambridge Game Jam Logo"
            class="mx-auto max-md:mb-4 sm:mr-8 size-60 sm:size-72 sm:float-left md:size-80"
        />
        <h1 class="sm:pt-12 sm:text-5xl">{title}</h1>
        <h3 class="sm:text-3xl">{date}</h3>
        <div class="mb-4 flex flex-wrap max-sm:justify-center gap-4">
            <h1>{theme}</h1>
        </div>
        <a class="text-xl underline" href="https://itch.io/jam/camgamejam"
            >{submissions} {submissions == 1 ? "Submission" : "Submissions"}</a
        >
        <p class="clear-left"></p>
    </div>
</div>

<div class="relative w-fullmx-auto overflow-hidden">
    <!-- Images -->
    <div
        class="flex transition-transform duration-500"
        style="transform: translateX(-{currentIndex * 100}%)"
    >
        {#each images as { src, alt, link, title, prize }, index}
            <a href={link} class="w-full flex-shrink-0 relative">
                <img
                    {src}
                    {alt}
                    class="w-full h-96 object-cover blur"
                    style="transform: translate3d({-mouseX * 0.5}px, {-mouseY *
                        0.5}px, 0); transition: transform 0.1s ease-out;"
                />
                <img
                    {src}
                    {alt}
                    class="w-full h-96 object-contain absolute top-0 left-0 scale-125"
                    style="transform: translate3d({-mouseX}px, {-mouseY}px, 0) scale(1.25); transition: transform 0.2s 0.1s ease-out;{index ==
                    currentIndex
                        ? 'transform: scale(1);'
                        : 'transform: scale(0.5);'}"
                />
                <div
                    class="text-black blur-sm text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style="transform: translate3d(calc({-mouseX * 0.5}px - 50%), calc({-mouseY *
                        0.5}px - 50%), 0); transition: transform 0.1s ease-out;"
                >
                    <h1>{title}</h1>
                    <h2>{prize}</h2>
                </div>
                <div
                    class="text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                    <h1>{title}</h1>
                    <h2>{prize}</h2>
                </div>
            </a>
        {/each}
    </div>

    <!-- Navigation Buttons -->
    <button
        class="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600"
        on:click={prevSlide}
    >
        &#9664;
    </button>
    <button
        class="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600"
        on:click={nextSlide}
    >
        &#9654;
    </button>

    <!-- Indicators -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {#each images as _, index}
            <button
                class="w-3 h-3 rounded-full cursor-pointer shadow-lg"
                class:!bg-white={index === currentIndex}
                class:!bg-gray-400={index !== currentIndex}
                on:click={() => (currentIndex = index)}
                aria-label="carousel-pip"
            ></button>
        {/each}
    </div>
</div>
