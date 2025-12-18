<script>
  import { onDestroy, onMount } from "svelte";
  import * as THREE from "three";
  import { Reflector } from "three/examples/jsm/objects/Reflector.js";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
  import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
  import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const featured = [
    {
      title: "Blight",
      src: "/2024/blight.png",
      link: "https://hex-26.itch.io/blight",
    },
    {
      title: "Reflect Upon Your Actions",
      src: "/2024/reflect-upon-your-actions.png",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
    },
    {
      title: "Reflected",
      src: "/2024/reflected.png",
      link: "https://ekorrette.itch.io/reflected",
    },
    {
      title: "Asymmetry",
      src: "/2024/asymmetry.png",
      link: "https://alex-davies.itch.io/asymmetry",
    },
    {
      title: "Coulda Woulda Buddha",
      src: "/2024/coulda-woulda-buddha.png",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
    },
    {
      title: "All Submissions",
      src: "/2024/all-submissions.png",
      link: "https://itch.io/jam/camgamejam2024",
    },
  ];

  let canvas;
  let prefersReducedMotion = $state(false);
  let ready = $state(false);

  let renderer;
  let scene;
  let camera;
  let composer;
  let raf = 0;
  let clock;
  let resizeObserver;
  let disposers = [];

  const pointer = { x: 0, y: 0 };
  const easePointer = { x: 0, y: 0 };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const addDisposer = (fn) => {
    disposers.push(fn);
    return fn;
  };

  const disposeMaterial = (m) => {
    if (!m) return;
    const materials = Array.isArray(m) ? m : [m];
    for (const mat of materials) {
      for (const k in mat) {
        const v = mat[k];
        if (v && typeof v === "object" && typeof v.dispose === "function") v.dispose();
      }
      mat.dispose?.();
    }
  };

  const setPointerFromEvent = (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    pointer.x = (e.clientX / w) * 2 - 1;
    pointer.y = -((e.clientY / h) * 2 - 1);
  };

  onMount(async () => {
    prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060f, 0.055);

    camera = new THREE.PerspectiveCamera(55, 1, 0.08, 220);
    camera.position.set(0, 2.2, 9.5);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const hemi = new THREE.HemisphereLight(0xbfd7ff, 0x1a0b1f, 0.95);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(8, 10, 6);
    key.castShadow = false;
    scene.add(key);

    const rim = new THREE.PointLight(0x7c3aed, 22, 60, 2);
    rim.position.set(-8, 2.5, -8);
    scene.add(rim);

    const rim2 = new THREE.PointLight(0x22c55e, 14, 50, 2);
    rim2.position.set(8, 1.5, -2);
    scene.add(rim2);

    const mirrorGeo = new THREE.PlaneGeometry(28, 28);
    const floorMirror = new Reflector(mirrorGeo, {
      clipBias: 0.006,
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x0b1024,
    });
    floorMirror.rotation.x = -Math.PI / 2;
    floorMirror.position.y = -1.25;
    scene.add(floorMirror);

    const wallGeo = new THREE.PlaneGeometry(18, 10);
    const wallMirror = new Reflector(wallGeo, {
      clipBias: 0.003,
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x0b1024,
    });
    wallMirror.position.set(0, 1.25, -10.5);
    scene.add(wallMirror);

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0e1022,
      metalness: 0.6,
      roughness: 0.35,
      flatShading: true,
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(18.35, 10.35, 0.55, 1, 1, 1), frameMat);
    frame.position.set(0, 1.25, -10.75);
    scene.add(frame);

    const shardGeo = new THREE.IcosahedronGeometry(1, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.18,
      flatShading: true,
    });

    const shardCount = prefersReducedMotion ? 90 : 180;
    const shards = new THREE.InstancedMesh(shardGeo, shardMat, shardCount);
    shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(shards);

    const shardData = Array.from({ length: shardCount }, (_, i) => {
      const s = prefersReducedMotion ? 0.18 + Math.random() * 0.42 : 0.15 + Math.random() * 0.55;
      const ring = 2.2 + Math.random() * 10.8;
      const ang = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
      const y = -0.4 + Math.random() * 4.8;
      const wobble = 0.6 + Math.random() * 2.2;
      return {
        ring,
        ang,
        y,
        s,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        wobble,
        hue: Math.random(),
      };
    });

    const dummy = new THREE.Object3D();
    const tmpColor = new THREE.Color();

    if (typeof shards.setColorAt === "function") {
      for (let i = 0; i < shardCount; i++) {
        tmpColor.setHSL((0.58 + shardData[i].hue * 0.22) % 1, 0.65, 0.62);
        shards.setColorAt(i, tmpColor);
      }
      shards.instanceColor.needsUpdate = true;
    }

    const loader = new THREE.TextureLoader();
    const cardGeo = new THREE.PlaneGeometry(2.4, 1.35, 1, 1);
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    const cardMeshes = [];
    const textures = [];
    for (let i = 0; i < featured.length; i++) {
      const tex = loader.load(featured[i].src);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      textures.push(tex);

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.92,
      });

      const mesh = new THREE.Mesh(cardGeo, mat);
      const a = (i / featured.length) * Math.PI * 2;
      const r = 3.25;
      mesh.position.set(Math.cos(a) * r, 0.9 + Math.sin(i) * 0.25, Math.sin(a) * r - 1.8);
      mesh.rotation.y = -a + Math.PI / 2;
      mesh.scale.setScalar(1.05);
      cardGroup.add(mesh);
      cardMeshes.push(mesh);
    }

    const fxaaPass = new ShaderPass(FXAAShader);
    const rgbPass = new ShaderPass(RGBShiftShader);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.0, 0.6, 0.15);
    const afterPass = new AfterimagePass();

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(fxaaPass);
    composer.addPass(bloomPass);
    composer.addPass(rgbPass);
    if (!prefersReducedMotion) composer.addPass(afterPass);

    bloomPass.threshold = 0.03;
    bloomPass.strength = prefersReducedMotion ? 0.65 : 1.35;
    bloomPass.radius = 0.28;

    rgbPass.uniforms.amount.value = prefersReducedMotion ? 0.0006 : 0.0016;
    rgbPass.uniforms.angle.value = 0.0;

    if (!prefersReducedMotion) afterPass.uniforms.damp.value = 0.88;

    const setSize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      const dpr = clamp(window.devicePixelRatio || 1, 1, prefersReducedMotion ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fxaaPass.uniforms.resolution.value.set(1 / (w * dpr), 1 / (h * dpr));
      bloomPass.setSize(w, h);
    };

    resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    addDisposer(() => resizeObserver?.disconnect());
    window.addEventListener("pointermove", setPointerFromEvent, { passive: true });
    addDisposer(() => window.removeEventListener("pointermove", setPointerFromEvent));

    setSize();

    clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      const follow = prefersReducedMotion ? 0.08 : 0.055;
      easePointer.x += (pointer.x - easePointer.x) * follow;
      easePointer.y += (pointer.y - easePointer.y) * follow;

      const camLift = prefersReducedMotion ? 0.35 : 0.65;
      camera.position.x = Math.sin(t * 0.22) * 0.6 + easePointer.x * 1.1;
      camera.position.y = 2.1 + Math.sin(t * 0.33) * camLift + easePointer.y * 0.35;
      camera.position.z = 9.25 + Math.cos(t * 0.18) * 0.55;
      camera.lookAt(0, 0.8, -2.0);

      rim.position.x = -8 + Math.sin(t * 0.85) * 3.8;
      rim.position.z = -8 + Math.cos(t * 0.72) * 3.2;
      rim2.position.x = 8 + Math.cos(t * 0.64) * 3.3;
      rim2.position.z = -2 + Math.sin(t * 0.77) * 3.1;

      const drift = prefersReducedMotion ? 0.25 : 0.45;
      floorMirror.rotation.z = Math.sin(t * 0.23) * 0.02;
      wallMirror.rotation.y = Math.sin(t * 0.27) * 0.045;

      for (let i = 0; i < shardCount; i++) {
        const d = shardData[i];
        const spin = t * (0.22 + d.wobble * 0.18);
        const a = d.ang + spin * (0.22 + d.wobble * 0.1);
        const r = d.ring + Math.sin(t * (0.7 + d.wobble * 0.5) + d.ang) * drift;
        dummy.position.set(Math.cos(a) * r, d.y + Math.sin(t * (0.8 + d.wobble) + d.ang) * 0.32, Math.sin(a) * r - 3.5);
        dummy.rotation.set(d.rx + spin * 0.9, d.ry + spin * 0.7, d.rz + spin * 0.6);
        const pulse = 1 + Math.sin(t * (0.9 + d.wobble * 0.35) + d.ang) * (prefersReducedMotion ? 0.06 : 0.14);
        dummy.scale.setScalar(d.s * pulse);
        dummy.updateMatrix();
        shards.setMatrixAt(i, dummy.matrix);
      }
      shards.instanceMatrix.needsUpdate = true;

      cardGroup.rotation.y = Math.sin(t * 0.35) * 0.18 + easePointer.x * 0.12;
      cardGroup.position.y = Math.sin(t * 0.6) * 0.12;

      for (let i = 0; i < cardMeshes.length; i++) {
        const m = cardMeshes[i];
        m.rotation.z = Math.sin(t * 0.8 + i) * 0.05;
        m.position.y = 0.9 + Math.sin(t * 0.9 + i * 1.3) * (prefersReducedMotion ? 0.06 : 0.12);
        m.material.opacity = 0.88 + Math.sin(t * 1.3 + i * 0.9) * 0.06;
      }

      rgbPass.uniforms.angle.value = t * 0.7;
      rgbPass.uniforms.amount.value = (prefersReducedMotion ? 0.0006 : 0.00125) + (Math.sin(t * 0.9) * 0.5 + 0.5) * (prefersReducedMotion ? 0.0002 : 0.0011);

      composer.render();
    };

    tick();
    ready = true;

    addDisposer(() => cancelAnimationFrame(raf));
    addDisposer(() => {
      for (const tex of textures) tex.dispose();
    });
    addDisposer(() => {
      shardGeo.dispose();
      cardGeo.dispose();
      mirrorGeo.dispose();
      wallGeo.dispose();
      disposeMaterial(shardMat);
      disposeMaterial(frameMat);
      for (const m of cardMeshes) disposeMaterial(m.material);
    });
    addDisposer(() => composer?.dispose());
    addDisposer(() => renderer?.dispose());
    addDisposer(() => {
      scene?.traverse((o) => {
        o.geometry?.dispose?.();
        disposeMaterial(o.material);
      });
    });
  });

  onDestroy(() => {
    for (const d of disposers.splice(0)) d();
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="Lorem ipsum dolor sit amet." />
</svelte:head>

<div class="cg2024">
  <div class="stage">
    <canvas bind:this={canvas} class:ready></canvas>
    <div class="veil"></div>
  </div>

  <div class="hud" aria-hidden="false">
    <div class="brand">
      <div class="kicker">{theme}</div>
      <div class="title">{title}</div>
      <div class="meta">{duration} · {submissions}</div>
      <div class="lorem">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
    </div>

    <div class="rail">
      {#each featured as p (p.title)}
        <a class="chip" href={p.link} rel="noreferrer">
          <span class="chipTitle">{p.title}</span>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(html),
  :global(body) {
    height: 100%;
  }

  :global(body) {
    margin: 0;
    overflow: hidden;
    background: radial-gradient(1200px 800px at 50% 40%, #0b1024 0%, #05060f 55%, #02030a 100%);
    color: #e5e7eb;
  }

  :global(main.flex-1) {
    min-height: 100vh;
  }

  .cg2024 {
    position: relative;
    min-height: 100vh;
    width: 100%;
    isolation: isolate;
  }

  .stage {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
    opacity: 0;
    transition: opacity 0.65s ease;
  }

  canvas.ready {
    opacity: 1;
  }

  .veil {
    position: absolute;
    inset: -30%;
    background:
      radial-gradient(800px 520px at 20% 35%, rgba(124, 58, 237, 0.22), transparent 55%),
      radial-gradient(900px 640px at 75% 45%, rgba(34, 197, 94, 0.14), transparent 60%),
      conic-gradient(
        from 180deg at 50% 50%,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.06) 18%,
        rgba(255, 255, 255, 0) 34%,
        rgba(255, 255, 255, 0.09) 52%,
        rgba(255, 255, 255, 0) 68%,
        rgba(255, 255, 255, 0.05) 84%,
        rgba(255, 255, 255, 0) 100%
      );
    filter: blur(22px) saturate(125%);
    animation: drift 9.5s ease-in-out infinite;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.85;
  }

  .hud {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: grid;
    grid-template-rows: 1fr auto;
    padding: clamp(16px, 4vw, 40px);
  }

  .brand {
    align-self: center;
    max-width: 860px;
    text-shadow:
      0 0 60px rgba(124, 58, 237, 0.22),
      0 0 34px rgba(34, 197, 94, 0.12);
  }

  .kicker {
    font-variation-settings: "wght" 620;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    opacity: 0.92;
    font-size: clamp(12px, 1.1vw, 14px);
    padding: 10px 14px;
    display: inline-block;
    border: 1px solid rgba(226, 232, 240, 0.14);
    background: rgba(2, 3, 10, 0.35);
    backdrop-filter: blur(10px) saturate(115%);
    animation: pulseLine 2.6s ease-in-out infinite;
  }

  .title {
    margin-top: 14px;
    font-size: clamp(46px, 6.6vw, 104px);
    line-height: 0.92;
    letter-spacing: -0.04em;
    font-variation-settings: "wght" 820;
    color: rgba(226, 232, 240, 0.98);
    filter: drop-shadow(0 30px 55px rgba(0, 0, 0, 0.55));
    animation: warp 6.2s ease-in-out infinite;
  }

  .meta {
    margin-top: 18px;
    font-size: clamp(14px, 1.55vw, 20px);
    opacity: 0.9;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .lorem {
    margin-top: 14px;
    max-width: 52ch;
    font-size: clamp(14px, 1.3vw, 18px);
    line-height: 1.45;
    color: rgba(226, 232, 240, 0.82);
  }

  .rail {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-self: end;
  }

  .chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: rgba(226, 232, 240, 0.92);
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(226, 232, 240, 0.14);
    background: rgba(2, 3, 10, 0.35);
    backdrop-filter: blur(10px) saturate(115%);
    transition:
      transform 0.14s ease,
      border-color 0.14s ease,
      background 0.14s ease;
    overflow: hidden;
  }

  .chip::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: conic-gradient(
      from 180deg at 50% 50%,
      rgba(124, 58, 237, 0) 0%,
      rgba(124, 58, 237, 0.35) 20%,
      rgba(34, 197, 94, 0.25) 40%,
      rgba(255, 255, 255, 0.12) 55%,
      rgba(124, 58, 237, 0.28) 75%,
      rgba(34, 197, 94, 0) 100%
    );
    opacity: 0.0;
    filter: blur(10px);
    transition: opacity 0.14s ease;
    pointer-events: none;
  }

  .chip:hover {
    transform: translateY(-1px) scale(1.02);
    border-color: rgba(226, 232, 240, 0.34);
    background: rgba(2, 3, 10, 0.5);
  }

  .chip:hover::before {
    opacity: 0.7;
  }

  .chipTitle {
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 12px;
    font-variation-settings: "wght" 620;
  }

  @keyframes drift {
    0% {
      transform: translate3d(-1.5%, -1.2%, 0) rotate(0deg);
    }
    50% {
      transform: translate3d(1.8%, 1.4%, 0) rotate(10deg);
    }
    100% {
      transform: translate3d(-1.5%, -1.2%, 0) rotate(0deg);
    }
  }

  @keyframes pulseLine {
    0% {
      transform: translateZ(0) scale(1);
      border-color: rgba(226, 232, 240, 0.12);
    }
    50% {
      transform: translateZ(0) scale(1.04);
      border-color: rgba(226, 232, 240, 0.26);
    }
    100% {
      transform: translateZ(0) scale(1);
      border-color: rgba(226, 232, 240, 0.12);
    }
  }

  @keyframes warp {
    0% {
      transform: translate3d(0, 0, 0);
      letter-spacing: -0.04em;
    }
    40% {
      transform: translate3d(0.25%, -0.35%, 0);
      letter-spacing: -0.02em;
    }
    60% {
      transform: translate3d(-0.2%, 0.25%, 0);
      letter-spacing: -0.06em;
    }
    100% {
      transform: translate3d(0, 0, 0);
      letter-spacing: -0.04em;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .veil,
    .kicker,
    .title {
      animation: none;
    }

    .chip {
      transition: none;
    }

    canvas {
      transition: none;
    }
  }
</style>
