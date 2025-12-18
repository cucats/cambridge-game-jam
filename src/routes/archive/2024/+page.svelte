<script>
  import { onDestroy, onMount } from "svelte";
  import * as THREE from "three";
  import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
  import { Reflector } from "three/examples/jsm/objects/Reflector.js";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
  import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const featured = [
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

  let canvas;
  let ui;

  let raf = 0;
  let renderer;
  let scene;
  let camera;
  let composer;
  let bloomPass;
  let afterimagePass;
  let filmPass;
  let pmrem;

  let pointerX = 0;
  let pointerY = 0;
  let pointerSpeed = 0;

  const clock = new THREE.Clock();

  const onPointerMove = (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const nx = (e.clientX / w) * 2 - 1;
    const ny = (e.clientY / h) * 2 - 1;
    const dx = nx - pointerX;
    const dy = ny - pointerY;
    pointerSpeed = Math.min(1, Math.hypot(dx, dy) * 6);
    pointerX = nx;
    pointerY = ny;
  };

  const onResize = () => {
    if (!renderer || !camera || !composer) return;
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
  };

  const disposeScene = () => {
    if (typeof window === "undefined") return;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);

    if (composer) composer.dispose();
    if (renderer) renderer.dispose();
    if (pmrem) pmrem.dispose();

    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    composer = undefined;
    renderer = undefined;
    scene = undefined;
    camera = undefined;
    bloomPass = undefined;
    afterimagePass = undefined;
    filmPass = undefined;
    pmrem = undefined;
  };

  const start = () => {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060d, 0.11);

    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 80);
    camera.position.set(0, 2.6, 8.8);

    pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

    const hemi = new THREE.HemisphereLight(0xb3c8ff, 0x1a0f2c, 0.7);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xf5f1ff, 1.9);
    key.position.set(6, 9, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6fdcff, 0.9);
    rim.position.set(-7, 3, -8);
    scene.add(rim);

    const mirror = new Reflector(new THREE.PlaneGeometry(18, 18), {
      clipBias: 0.003,
      textureWidth: Math.floor(w * Math.min(window.devicePixelRatio || 1, 2)),
      textureHeight: Math.floor(h * Math.min(window.devicePixelRatio || 1, 2)),
      color: 0x070711,
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = -1.22;
    scene.add(mirror);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 5.2, 0.55, 7, 1),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a12,
        metalness: 0.65,
        roughness: 0.32,
        flatShading: true,
      })
    );
    platform.position.y = -0.95;
    scene.add(platform);

    const hero = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.65, 0),
      new THREE.MeshStandardMaterial({
        color: 0xc9c7ff,
        metalness: 0.85,
        roughness: 0.12,
        flatShading: true,
      })
    );
    hero.position.set(0, 0.85, 0);
    scene.add(hero);

    const heroHalo = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.09, 4, 18),
      new THREE.MeshStandardMaterial({
        color: 0x7fe8ff,
        emissive: 0x164cff,
        emissiveIntensity: 0.65,
        metalness: 0.5,
        roughness: 0.28,
        flatShading: true,
      })
    );
    heroHalo.position.y = 0.85;
    heroHalo.rotation.x = Math.PI / 2;
    scene.add(heroHalo);

    const shardCount = 180;
    const shardGeo = new THREE.IcosahedronGeometry(0.23, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.06,
      flatShading: true,
    });
    const shards = new THREE.InstancedMesh(shardGeo, shardMat, shardCount);
    shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    shards.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(shardCount * 3), 3);
    scene.add(shards);

    const shard = new THREE.Object3D();
    const shardData = Array.from({ length: shardCount }, () => ({
      r: THREE.MathUtils.randFloat(2.2, 8.4),
      a: THREE.MathUtils.randFloat(0, Math.PI * 2),
      h: THREE.MathUtils.randFloat(-0.5, 3.8),
      s: THREE.MathUtils.randFloat(0.35, 1.65),
      spin: THREE.MathUtils.randFloat(0.35, 1.4) * (Math.random() < 0.5 ? -1 : 1),
      bob: THREE.MathUtils.randFloat(0.15, 0.65),
      phase: THREE.MathUtils.randFloat(0, Math.PI * 2),
      hue: THREE.MathUtils.randFloat(0.55, 0.74),
    }));

    const c = new THREE.Color();
    for (let i = 0; i < shardCount; i += 1) {
      c.setHSL(shardData[i].hue, 0.75, 0.68);
      shards.instanceColor.setXYZ(i, c.r, c.g, c.b);
    }
    shards.instanceColor.needsUpdate = true;

    const particleCount = 1400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pSeed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) {
      const rr = THREE.MathUtils.randFloat(3.2, 22);
      const aa = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const yy = THREE.MathUtils.randFloat(-1.2, 8.4);
      pPos[i * 3 + 0] = Math.cos(aa) * rr;
      pPos[i * 3 + 1] = yy;
      pPos[i * 3 + 2] = Math.sin(aa) * rr;
      pSeed[i] = Math.random();
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("seed", new THREE.BufferAttribute(pSeed, 1));
    const pMat = new THREE.PointsMaterial({
      color: 0xb3d9ff,
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.2, 0.8, 0.18);
    composer.addPass(bloomPass);

    afterimagePass = new AfterimagePass();
    afterimagePass.uniforms.damp.value = 0.86;
    composer.addPass(afterimagePass);

    filmPass = new FilmPass(0.22, 0.12, 740, false);
    composer.addPass(filmPass);

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const tick = () => {
      const t = clock.getElapsedTime();
      const dt = clock.getDelta();

      const motion = prefersReduced ? 0.25 : 1;
      const surge = prefersReduced ? 0 : Math.pow(pointerSpeed, 0.65);
      pointerSpeed = Math.max(0, pointerSpeed - dt * 1.6);

      const camTargetX = pointerX * 0.65;
      const camTargetY = 1.15 + pointerY * 0.28;
      camera.position.x += (camTargetX - camera.position.x) * (0.03 * motion);
      camera.position.y += (2.6 + camTargetY - camera.position.y) * (0.02 * motion);
      camera.position.z += (8.8 - camera.position.z) * (0.02 * motion);
      camera.lookAt(0, 0.9, 0);

      hero.rotation.y += dt * 0.6 * motion;
      hero.rotation.x = Math.sin(t * 0.6) * 0.12 * motion;
      hero.position.y = 0.85 + Math.sin(t * 1.1) * 0.12 * motion;

      heroHalo.rotation.z += dt * 0.75 * motion;
      heroHalo.rotation.y = Math.sin(t * 0.7) * 0.22 * motion;

      const wobble = 0.12 * motion + surge * 0.24;
      for (let i = 0; i < shardCount; i += 1) {
        const d = shardData[i];
        const a = d.a + t * 0.22 * d.s + surge * 0.55;
        const r = d.r + Math.sin(t * 0.55 + d.phase) * d.bob * (0.35 + surge);
        const y = d.h + Math.sin(t * 1.15 + d.phase) * d.bob * (0.7 + surge);
        shard.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        shard.rotation.set(
          t * d.spin * 0.35,
          t * d.spin * 0.45,
          t * d.spin * 0.25 + d.phase
        );
        const sc = 0.85 + Math.sin(t * 0.7 + d.phase) * wobble;
        shard.scale.setScalar(sc);
        shard.updateMatrix();
        shards.setMatrixAt(i, shard.matrix);
      }
      shards.instanceMatrix.needsUpdate = true;

      particles.rotation.y += dt * (0.03 + surge * 0.04) * motion;
      particles.position.y = Math.sin(t * 0.25) * 0.15 * motion;

      const pulse = 0.55 + Math.sin(t * 1.2) * 0.22 + surge * 0.6;
      bloomPass.strength = prefersReduced ? 0.55 : 0.95 + pulse;
      bloomPass.radius = prefersReduced ? 0.25 : 0.35 + surge * 0.25;
      bloomPass.threshold = prefersReduced ? 0.25 : 0.12 + Math.max(0, 0.2 - surge * 0.08);

      afterimagePass.uniforms.damp.value = prefersReduced ? 0.93 : 0.86 - surge * 0.08;
      filmPass.uniforms.nIntensity.value = prefersReduced ? 0.08 : 0.12 + surge * 0.22;
      filmPass.uniforms.sIntensity.value = prefersReduced ? 0.12 : 0.18 + surge * 0.22;

      if (ui) ui.style.setProperty("--surge", String(surge));

      composer.render();
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    raf = requestAnimationFrame(tick);
  };

  onMount(() => {
    start();
  });

  onDestroy(() => {
    disposeScene();
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page">
  <canvas class="webgl" bind:this={canvas}></canvas>

  <div class="ui" bind:this={ui}>
    <div class="hero">
      <div class="brand">
        <img src="/2024/logo.png" alt="Cambridge Game Jam Logo" class="logo" />
        <div class="title">
          <h1>{title}</h1>
          <div class="meta">
            <span class="pill">{duration}</span>
            <span class="pill">{theme}</span>
            <a class="pill link" href="https://itch.io/jam/camgamejam2024"
              >{submissions}</a
            >
          </div>
        </div>
      </div>

      <p class="lorem">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>
    </div>

    <div class="grid">
      {#each featured as item, index (item.title)}
        <a class="card" href={item.link} style={`--i:${index}`}>
          <div class="thumb">
            <img src={item.src} alt={item.alt} loading="lazy" />
          </div>
          <div class="cardText">
            <div class="cardTitle">{item.title}</div>
            {#if item.prize}
              <div class="cardPrize">{item.prize}</div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 100svh;
    background: radial-gradient(1200px 900px at 50% 15%, #1a1330 0%, #07060d 50%, #04040a 100%);
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .webgl {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 0;
  }

  .ui {
    position: relative;
    z-index: 1;
    width: min(1120px, calc(100% - 2.2rem));
    margin-inline: auto;
    padding: 2.2rem 0 3.5rem;
    color: rgba(248, 250, 252, 0.96);
    --surge: 0;
  }

  .ui::before {
    content: "";
    position: absolute;
    inset: -30vh -30vw;
    background: radial-gradient(
        40% 35% at 20% 20%,
        rgba(127, 232, 255, 0.18),
        rgba(127, 232, 255, 0) 60%
      ),
      radial-gradient(40% 45% at 80% 25%, rgba(201, 199, 255, 0.22), rgba(201, 199, 255, 0) 60%),
      radial-gradient(55% 70% at 50% 80%, rgba(255, 120, 240, 0.12), rgba(255, 120, 240, 0) 65%);
    filter: blur(calc(24px + 18px * var(--surge)));
    opacity: 0.85;
    transform: translate3d(calc(var(--surge) * 2px), calc(var(--surge) * -4px), 0);
    pointer-events: none;
  }

  .hero {
    position: relative;
    padding: 1.4rem 1.4rem 1.2rem;
    border-radius: 1.6rem;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.03)
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 24px 90px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(15, 23, 42, 0.25) inset;
    backdrop-filter: blur(14px) saturate(140%);
  }

  .brand {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 1rem;
    align-items: center;
  }

  .logo {
    width: 96px;
    height: 96px;
    object-fit: contain;
    filter: drop-shadow(0 18px 48px rgba(127, 232, 255, 0.25));
    transform: translateZ(0);
    animation: logoFloat 2.8s ease-in-out infinite;
  }

  .title h1 {
    font-size: clamp(1.7rem, 3.4vw, 2.8rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0;
    text-wrap: balance;
    filter: drop-shadow(0 26px 60px rgba(0, 0, 0, 0.55));
    transform: translateZ(0);
    animation: titleSheen 2.9s ease-in-out infinite;
  }

  .meta {
    margin-top: 0.8rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: 0.52rem 0.75rem;
    border-radius: 999px;
    font-size: 0.95rem;
    line-height: 1;
    background: rgba(2, 6, 23, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
    transform: translateZ(0);
  }

  .pill.link {
    text-decoration: none;
    color: rgba(248, 250, 252, 0.96);
    position: relative;
    overflow: hidden;
  }

  .pill.link::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(127, 232, 255, 0),
      rgba(127, 232, 255, 0.25),
      rgba(127, 232, 255, 0)
    );
    transform: translateX(calc(-120% + var(--surge) * 40%));
    transition: transform 220ms ease;
  }

  .lorem {
    margin: 1rem 0 0;
    color: rgba(226, 232, 240, 0.9);
    max-width: 70ch;
    font-size: 1rem;
    line-height: 1.55;
    transform: translateZ(0);
    animation: breathe 3.4s ease-in-out infinite;
  }

  .grid {
    margin-top: 1.25rem;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 0.95rem;
  }

  .card {
    grid-column: span 6;
    display: grid;
    grid-template-columns: 104px 1fr;
    gap: 0.9rem;
    align-items: center;
    padding: 0.95rem;
    border-radius: 1.2rem;
    text-decoration: none;
    color: rgba(248, 250, 252, 0.96);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.03)
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 18px 70px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(2, 6, 23, 0.2) inset;
    transform: translateZ(0);
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease;
    animation: cardDrift 2.6s ease-in-out infinite;
    animation-delay: calc(var(--i, 0) * 120ms);
  }

  .card:hover {
    transform: translateY(-2px) scale(1.01);
    border-color: rgba(127, 232, 255, 0.42);
    box-shadow:
      0 24px 90px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(127, 232, 255, 0.18) inset;
  }

  .thumb {
    width: 104px;
    height: 72px;
    border-radius: 0.95rem;
    overflow: hidden;
    background: rgba(2, 6, 23, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.02);
    filter: saturate(1.1) contrast(1.05);
  }

  .cardText {
    min-width: 0;
  }

  .cardTitle {
    font-size: 1.05rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cardPrize {
    margin-top: 0.35rem;
    color: rgba(226, 232, 240, 0.88);
    font-size: 0.95rem;
    line-height: 1.2;
    text-wrap: pretty;
  }

  @media (max-width: 860px) {
    .card {
      grid-column: span 12;
    }
  }

  @media (max-width: 520px) {
    .ui {
      width: calc(100% - 1.4rem);
      padding: 1.4rem 0 2.4rem;
    }

    .brand {
      grid-template-columns: 76px 1fr;
    }

    .logo {
      width: 76px;
      height: 76px;
    }

    .card {
      grid-template-columns: 92px 1fr;
    }

    .thumb {
      width: 92px;
      height: 68px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .logo,
    .title h1,
    .lorem,
    .card {
      animation: none;
    }

    .card,
    .pill.link::after {
      transition: none;
    }
  }

  @keyframes logoFloat {
    0%,
    100% {
      transform: translate3d(0, 0, 0) rotateZ(0.001deg);
    }
    50% {
      transform: translate3d(0, -6px, 0) rotateZ(0.001deg);
    }
  }

  @keyframes titleSheen {
    0%,
    100% {
      letter-spacing: -0.03em;
      filter: drop-shadow(0 26px 60px rgba(0, 0, 0, 0.55));
    }
    50% {
      letter-spacing: -0.02em;
      filter: drop-shadow(0 30px 78px rgba(127, 232, 255, 0.18))
        drop-shadow(0 28px 64px rgba(0, 0, 0, 0.65));
    }
  }

  @keyframes breathe {
    0%,
    100% {
      opacity: 0.92;
      transform: translate3d(0, 0, 0);
    }
    50% {
      opacity: 1;
      transform: translate3d(0, 2px, 0);
    }
  }

  @keyframes cardDrift {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, calc(-2px - 2px * var(--surge)), 0);
    }
  }
</style>
