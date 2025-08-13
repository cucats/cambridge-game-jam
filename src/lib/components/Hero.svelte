<script>
  import Countdown from "$lib/components/Countdown.svelte";
</script>

<div class="max-w-7xl mx-auto max-sm:text-center">
  <img
    src="/2025/logo.png"
    alt="Cambridge Game Jam Logo"
    class="mx-auto max-md:mb-4 sm:mr-8 size-60 sm:size-72 sm:float-left md:size-80"
  />
  <h1 class="sm:pt-12 sm:text-4xl">Cambridge Game Jam 2025</h1>
  <h3 class="sm:text-3xl">7th &ndash; 9th February</h3>
  <div class="mb-4 flex flex-wrap max-sm:justify-center gap-4">
    <a
      target="_blank"
      href="/discord"
      class="px-6 py-4 rounded-2xl select-none transition-all text-red-900 bg-red-100/80 hover:bg-red-100 hover:scale-105"
    >
      Join the Discord!
    </a>
    <a
      target="_blank"
      href="/signup"
      class="px-6 py-4 rounded-2xl select-none transition-all text-red-900 bg-red-100/80 hover:bg-red-100 hover:scale-105"
    >
      Sign up here!
    </a>
  </div>
  <p class="text-xl">Build a game in 48 hours!</p>
  <p class="clear-left"></p>
  <div class="m-auto">
    <Countdown />
  </div>
</div>
