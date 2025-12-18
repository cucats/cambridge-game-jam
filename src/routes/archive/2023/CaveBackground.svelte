<script lang="ts">
  import { onMount } from "svelte";
  import { createCaveScene, type CaveSceneController } from "./caveScene";

  export let scrollProgress = 0;

  let container: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let controller: CaveSceneController | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);
  const handleWindowResize = () => resize();

  const resize = () => {
    if (!container || !controller) return;
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    controller.resize(width, height, getDpr());
  };

  $: controller?.setScrollProgress(scrollProgress);

  onMount(() => {
    let cancelled = false;

    const init = async () => {
      if (!container || !canvas) return;

      try {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const three = await import("three");

        if (cancelled || !container || !canvas) return;

        const rect = container.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));

        controller = createCaveScene({
          canvas,
          three,
          width,
          height,
          dpr: getDpr(),
          reducedMotion,
        });

        controller.setScrollProgress(scrollProgress);

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            resize();
          });
          resizeObserver.observe(container);
        } else {
          window.addEventListener("resize", handleWindowResize);
        }
      } catch {
        return;
      }
    };

    init();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      resizeObserver = null;
      window.removeEventListener("resize", handleWindowResize);
      controller?.destroy();
      controller = null;
    };
  });
</script>

<div
  bind:this={container}
  aria-hidden="true"
  role="presentation"
  class="relative h-full w-full bg-[#05060a]"
  style={`--scroll-progress: ${scrollProgress};`}
>
  <canvas
    bind:this={canvas}
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 h-full w-full"
  ></canvas>
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_700px_at_20%_20%,rgba(255,145,71,0.12),transparent_60%),radial-gradient(900px_600px_at_80%_30%,rgba(255,210,99,0.09),transparent_55%),radial-gradient(1000px_700px_at_50%_90%,rgba(124,58,237,0.05),transparent_60%)]"
  ></div>
</div>
