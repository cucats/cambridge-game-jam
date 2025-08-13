<script>
  import { onMount } from "svelte";

  const blastOff = new Date("2025-02-07T17:00:00"); // Replace with your target date
  let dt = $state((blastOff.getTime() - Date.now()) / 1000);

  const updateCountdown = () => {
    dt = (blastOff.getTime() - Date.now()) / 1000;
  };

  onMount(() => {
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  });
</script>

<div
  class="max-w-96 mx-auto rounded-2xl bg-rose-100 border-2 border-red-400 shadow-md flex text-center font-ubuntu"
>
  <div class="w-24 py-2">
    <div class="text-3xl font-bold">
      {Math.floor(dt / 86400)
        .toString()
        .padStart(2, 0)}
    </div>
    <div>Days</div>
  </div>
  <div class="w-24 py-2">
    <div class="text-3xl font-bold">
      {Math.floor((dt / 3600) % 24)
        .toString()
        .padStart(2, 0)}
    </div>
    <div>Hours</div>
  </div>
  <div class="w-24 py-2">
    <div class="text-3xl font-bold">
      {Math.floor((dt / 60) % 60)
        .toString()
        .padStart(2, 0)}
    </div>
    <div>Minutes</div>
  </div>
  <div class="w-24 py-2">
    <div class="text-3xl font-bold">
      {Math.floor(dt % 60)
        .toString()
        .padStart(2, 0)}
    </div>
    <div>Seconds</div>
  </div>
</div>
