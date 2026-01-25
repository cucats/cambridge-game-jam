<script>
  import { onMount } from "svelte";
  import EventCountdown from "$lib/components/EventCountdown.svelte";

  let mounted = false;

  // Event dates
  const registrationClose = new Date("2026-01-29T23:59:59");
  const jamStart = new Date("2026-03-01T00:00:00");
  const jamEnd = new Date("2026-03-02T23:59:59");

  onMount(() => {
    mounted = true;
  });
</script>

<div class="landing">
  <div class="header-content">
    <h1 class="title">
      <span class="line line-1">THE</span>
      <span class="line line-2">CAMBRIDGE</span>
      <span class="line line-3">GAME JAM</span>
      <span class="line line-4">2026</span>
    </h1>
    <div class="countdown-wrap">
      <EventCountdown {registrationClose} {jamStart} {jamEnd} />
    </div>
  </div>
</div>

<style>
  .landing {
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  .header-content {
    position: relative;
    display: block;
    width: 100%;
  }

  .title {
    position: relative;
    align-self: flex-start;
    display: inline-block;
    font-family: "Peaberry Base", monospace;
    color: #000000;
    text-align: left;
    letter-spacing: 3px;
    padding-right: 10px;
    line-height: 1.1;
    font-size: clamp(3.5rem, 12vw, 8rem);
  }

  .title::after {
    content: "";
    position: absolute;
    inset: 0;
    border-right: 4px solid #3d2914;
    border-bottom: 4px solid #3d2914;
    pointer-events: none;
  }

  .line {
    display: block;
    white-space: nowrap;
    font-size: clamp(1.5rem, 10vw, 6.5rem);
  }

  .countdown-wrap {
    margin-top: 60px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>
