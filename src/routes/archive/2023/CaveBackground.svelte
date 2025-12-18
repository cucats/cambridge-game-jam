<script lang="ts">
  import { onMount } from "svelte";
  import type { CaveSceneController } from "./caveScene";

  export let scrollProgress = 0;

  let container: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let controller: CaveSceneController | null = null;
  let ro: ResizeObserver | null = null;
  let reducedMotion = false;
  let cancelled = false;

  function clampDpr(value: number) {
    return Math.min(2, Math.max(1, value));
  }

  function measure() {
    if (!container) {
      return { width: 1, height: 1 };
    }

    const rect = container.getBoundingClientRect();
    return {
      width: Math.max(1, Math.floor(rect.width)),
      height: Math.max(1, Math.floor(rect.height)),
    };
  }

  function resize() {
    if (!controller) {
      return;
    }

    const { width, height } = measure();
    const dpr = clampDpr(window.devicePixelRatio || 1);
    controller.resize(width, height, dpr);
  }

  async function setup() {
    if (!canvas) {
      return;
    }

    reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let next: CaveSceneController | null = null;

    try {
      const mod = await import("./caveScene");
      if (cancelled) {
        return;
      }
      next = await mod.createCaveScene(canvas, { reducedMotion });
    } catch {
      return;
    }

    controller = next;
    if (cancelled) {
      controller.destroy();
      controller = null;
      return;
    }

    ro = new ResizeObserver(() => {
      resize();
    });

    if (container) {
      ro.observe(container);
    }

    resize();

    if (!reducedMotion) {
      controller.setScrollProgress(scrollProgress);
    }
  }

  $: if (controller && !reducedMotion) {
    controller.setScrollProgress(scrollProgress);
  }

  onMount(() => {
    cancelled = false;
    void setup();

    return () => {
      cancelled = true;
      ro?.disconnect();
      ro = null;
      controller?.destroy();
      controller = null;
    };
  });
</script>

<div bind:this={container} class="absolute inset-0 pointer-events-none">
  <canvas bind:this={canvas} class="h-full w-full"></canvas>
</div>

<style>
  canvas {
    display: block;
  }
</style>
