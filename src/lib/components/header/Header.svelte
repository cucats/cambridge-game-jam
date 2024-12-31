<script>
    import Hamburger from "$lib/components/header/Hamburger.svelte";
    import MobileMenu from "$lib/components/header/MobileMenu.svelte";

    let expanded = $state(false);
</script>

<div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center h-[60px]">
        <a href="/" class="select-none">
            <div class="flex items-center">
                <img class="h-[60px] ml-4" src="/gamejam25.png" alt="Cambridge Game Jam Logo" />
                <span class="ml-4 text-xl font-bold">Cambridge Game Jam 2025</span>
            </div>
        </a>
        <div class="px-4">
            <nav
                class="max-md:hidden flex items-center gap-6 text-xl font-semibold transition-colors"
            >
                <a class="hover:text-red-600" href="/prior-jams">Prior Jams</a>
                <a class="hover:text-red-600" href="/#about">About</a>
                <a class="hover:text-red-600" href="/#schedule">Schedule</a>
                <a class="hover:text-red-600" href="/#rules">Rules</a>
                <a class="hover:text-red-600" href="/#faq">FAQ</a>
                <a
                    class="px-4 py-2 bg-red-300 rounded-lg transition-transform hover:scale-105"
                    href="/signup">Sign up!</a
                >
            </nav>
            <Hamburger bind:expanded />
        </div>
    </div>
    {#if expanded}
        <MobileMenu bind:expanded />
    {/if}
</div>
