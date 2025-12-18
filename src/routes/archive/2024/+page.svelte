<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Reflector } from "three/examples/jsm/objects/Reflector.js";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const projects = [
    {
      title: "Blight",
      src: "/2024/blight.png",
      href: "https://hex-26.itch.io/blight"
    },
    {
      title: "Reflect Upon Your Actions",
      src: "/2024/reflect-upon-your-actions.png",
      href: "https://dylanmoss.itch.io/reflect-upon-you-actions"
    },
    {
      title: "Reflected",
      src: "/2024/reflected.png",
      href: "https://ekorrette.itch.io/reflected"
    },
    {
      title: "Asymmetry",
      src: "/2024/asymmetry.png",
      href: "https://alex-davies.itch.io/asymmetry"
    },
    {
      title: "Coulda Woulda Buddha",
      src: "/2024/coulda-woulda-buddha.png",
      href: "https://greenwood672.itch.io/coulda-woulda-buddha"
    },
    {
      title: "All Submissions",
      src: "/2024/all-submissions.png",
      href: "https://itch.io/jam/camgamejam2024"
    }
  ];

  let host;
  let reducedMotion = false;
  let activeIdx = 2;

  let raf = 0;
  let cleanup = () => {};

  function clamp01(x) {
    return Math.min(1, Math.max(0, x));
  }

  function smoothstep(a, b, x) {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  function hash3(x, y, z) {
    const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function fBm(x, y, z) {
    let f = 0;
    let a = 0.55;
    let fx = x;
    let fy = y;
    let fz = z;
    for (let i = 0; i < 4; i += 1) {
      f += a * (hash3(fx, fy, fz) * 2 - 1);
      fx *= 2.02;
      fy *= 2.02;
      fz *= 2.02;
      a *= 0.5;
    }
    return f;
  }

  onMount(() => {
    reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070c, 0.045);

    const camera = new THREE.PerspectiveCamera(
      55,
      host.clientWidth / host.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 2.6, 10.5);

    const rig = new THREE.Group();
    rig.add(camera);
    scene.add(rig);

    const hemi = new THREE.HemisphereLight(0xb7c7ff, 0x08040a, 0.9);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.45);
    key.position.set(7, 8, 4);
    key.castShadow = false;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xff7bdc, 0.65);
    rim.position.set(-10, 2, -10);
    scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);

    const bg = new THREE.Mesh(
      new THREE.IcosahedronGeometry(60, 1),
      new THREE.MeshStandardMaterial({
        color: 0x05050b,
        roughness: 1,
        metalness: 0,
        flatShading: true,
        side: THREE.BackSide
      })
    );
    bg.position.set(0, 0, -20);
    root.add(bg);

    const terrainGeo = new THREE.PlaneGeometry(60, 60, 96, 96);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x0a0b14,
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -2.25, -4);
    root.add(terrain);

    const terrainBase = Float32Array.from(terrainGeo.attributes.position.array);

    const shardGroup = new THREE.Group();
    root.add(shardGroup);

    const shardGeo = new THREE.IcosahedronGeometry(0.8, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xd0d6ff,
      roughness: 0.12,
      metalness: 0.65,
      flatShading: true
    });

    const shardCount = reducedMotion ? 40 : 140;
    const shards = [];
    for (let i = 0; i < shardCount; i += 1) {
      const m = new THREE.Mesh(shardGeo, shardMat.clone());
      const r = 6 + Math.random() * 18;
      const a = Math.random() * Math.PI * 2;
      const y = -0.4 + Math.random() * 6.2;
      m.position.set(Math.cos(a) * r, y, -2 + Math.sin(a) * r);
      m.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      const s = 0.25 + Math.random() * 1.25;
      m.scale.setScalar(s);
      m.userData = {
        seed: Math.random() * 1000,
        orbit: r,
        angle: a,
        spin: (Math.random() * 0.7 + 0.25) * (Math.random() > 0.5 ? 1 : -1),
        rise: (Math.random() * 0.35 + 0.15) * (Math.random() > 0.5 ? 1 : -1)
      };
      shardGroup.add(m);
      shards.push(m);
    }

    const mirrorGroup = new THREE.Group();
    root.add(mirrorGroup);

    const mirrors = [];
    const mirrorFrames = [];

    function addMirror(w, h, x, y, z, ry) {
      const reflector = new Reflector(new THREE.PlaneGeometry(w, h), {
        textureWidth: Math.max(512, Math.floor(host.clientWidth * renderer.getPixelRatio())),
        textureHeight: Math.max(512, Math.floor(host.clientHeight * renderer.getPixelRatio())),
        color: 0x101018,
        clipBias: 0.003
      });
      reflector.position.set(x, y, z);
      reflector.rotation.y = ry;
      reflector.rotation.x = 0;
      mirrorGroup.add(reflector);
      mirrors.push(reflector);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.08),
        new THREE.MeshStandardMaterial({
          color: 0x0c0c12,
          roughness: 0.6,
          metalness: 0.45,
          flatShading: true
        })
      );
      frame.position.copy(reflector.position);
      frame.rotation.copy(reflector.rotation);
      frame.position.z -= Math.cos(ry) * 0.04;
      frame.position.x -= Math.sin(ry) * 0.04;
      mirrorGroup.add(frame);
      mirrorFrames.push(frame);
    }

    addMirror(3.8, 5.2, -3.4, 0.55, -3.5, 0.62);
    addMirror(2.7, 3.2, 0.1, 0.15, -2.2, -0.22);
    addMirror(3.6, 4.1, 3.3, 0.45, -3.1, -0.75);

    const floorMirror = new Reflector(new THREE.PlaneGeometry(22, 22), {
      textureWidth: Math.max(512, Math.floor(host.clientWidth * renderer.getPixelRatio())),
      textureHeight: Math.max(512, Math.floor(host.clientHeight * renderer.getPixelRatio())),
      color: 0x090913,
      clipBias: 0.002
    });
    floorMirror.position.set(0, -1.45, -3);
    floorMirror.rotation.x = -Math.PI / 2;
    root.add(floorMirror);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xff4fd8,
        emissive: 0xff4fd8,
        emissiveIntensity: 1.75,
        roughness: 0.25,
        metalness: 0.2
      })
    );
    glow.position.set(0.6, 1.25, -1.2);
    root.add(glow);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(host.clientWidth, host.clientHeight),
      1.15,
      0.55,
      0.18
    );
    composer.addPass(bloom);

    const after = new AfterimagePass();
    after.uniforms.damp.value = reducedMotion ? 0.92 : 0.88;
    composer.addPass(after);

    let px = 0;
    let py = 0;
    let vx = 0;
    let vy = 0;
    let pulse = 0;

    function onPointerMove(e) {
      const r = host.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      px = nx;
      py = ny;
    }

    function onPointerDown() {
      pulse = 1;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    const clock = new THREE.Clock();

    function resize() {
      if (!host) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setSize(w, h);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.033);

      const targetX = px * 0.55;
      const targetY = py * 0.38;
      vx += (targetX - vx) * (reducedMotion ? 0.06 : 0.09);
      vy += (targetY - vy) * (reducedMotion ? 0.06 : 0.09);

      rig.rotation.y = vx * 0.55;
      rig.rotation.x = -vy * 0.35;
      camera.position.x = vx * 1.35;
      camera.position.y = 2.6 - vy * 0.65;

      root.rotation.y = Math.sin(t * 0.12) * 0.12;
      glow.position.x = 0.6 + Math.sin(t * 1.7) * 0.65;
      glow.position.y = 1.2 + Math.cos(t * 1.25) * 0.55;
      glow.position.z = -1.2 + Math.sin(t * 1.1) * 0.55;
      glow.material.emissiveIntensity = 1.65 + Math.sin(t * 3.0) * 0.25;

      const strengthBase = 0.9 + smoothstep(-0.8, 0.8, vx) * 0.3;
      bloom.strength = reducedMotion ? 0.55 : strengthBase + pulse * 0.55;
      pulse *= Math.exp(-dt * 2.8);

      const pos = terrainGeo.attributes.position;
      const arr = pos.array;
      for (let i = 0; i < arr.length; i += 3) {
        const ox = terrainBase[i];
        const oy = terrainBase[i + 1];
        const oz = terrainBase[i + 2];
        const wx = (ox + 30) * 0.045;
        const wz = (oz + 30) * 0.045;
        const n = fBm(wx + t * 0.15, wz - t * 0.12, t * 0.07);
        const swell = Math.sin((wx + wz) * 3.2 + t * 0.95) * 0.12;
        const depth = smoothstep(0, 1, (oz + 30) / 60);
        arr[i + 1] = oy + (n * 1.2 + swell) * (0.55 + depth * 1.8);
      }
      pos.needsUpdate = true;
      terrainGeo.computeVertexNormals();

      const active = projects[activeIdx]?.title || theme;
      for (let i = 0; i < shards.length; i += 1) {
        const s = shards[i];
        const u = s.userData;
        const drift = reducedMotion ? 0.6 : 1;
        const tilt = 0.35 + Math.sin(t * 0.35 + u.seed) * 0.22;
        u.angle += dt * (0.08 + (i % 7) * 0.006) * drift;
        s.position.x = Math.cos(u.angle + u.seed * 0.02) * u.orbit;
        s.position.z = -3 + Math.sin(u.angle + u.seed * 0.02) * u.orbit;
        s.position.y += u.rise * dt * 0.9 * drift;
        if (s.position.y > 6.2) s.position.y = -0.5;
        if (s.position.y < -0.7) s.position.y = 6.0;
        s.rotation.x += dt * u.spin * 1.2 * drift;
        s.rotation.y += dt * u.spin * 0.9 * drift;
        s.rotation.z += dt * u.spin * 0.6 * drift;

        const hue = ((u.seed * 0.19 + t * 0.03) % 1 + 1) % 1;
        const c = new THREE.Color().setHSL(hue, 0.65, 0.72);
        s.material.color.copy(c);
        s.material.emissive = new THREE.Color().setHSL(hue, 0.9, 0.22);
        s.material.emissiveIntensity = 0.12 + tilt * 0.25;
      }

      mirrorGroup.rotation.y = Math.sin(t * 0.17) * 0.08 - vx * 0.12;
      for (let i = 0; i < mirrorFrames.length; i += 1) {
        mirrorFrames[i].material.metalness = 0.38 + Math.sin(t * 1.25 + i) * 0.12;
      }

      const focus = active.length * 0.04 + 0.85;
      after.uniforms.damp.value = reducedMotion ? 0.92 : 0.86 + Math.sin(t * 0.45) * 0.02 + focus * 0.02;

      composer.render();
    }

    animate();

    const nodes = host.closest("section")?.querySelectorAll("[data-float]") || [];
    const anims = [];
    if (!reducedMotion) {
      nodes.forEach((el, i) => {
        anims.push(
          el.animate(
            [
              { transform: `translate3d(0, ${i % 2 ? "10px" : "-8px"}, 0) rotate(${i % 2 ? -0.4 : 0.35}deg)` },
              { transform: `translate3d(0, ${i % 2 ? "-12px" : "9px"}, 0) rotate(${i % 2 ? 0.35 : -0.3}deg)` }
            ],
            {
              duration: 4200 + (i % 5) * 650,
              direction: "alternate",
              easing: "ease-in-out",
              iterations: Infinity
            }
          )
        );
      });
    }

    cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      ro.disconnect();
      anims.forEach((a) => a.cancel());

      composer.passes.forEach((p) => {
        if (p.dispose) p.dispose();
      });
      composer.dispose();

      terrainGeo.dispose();
      terrainMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      bg.geometry.dispose();
      bg.material.dispose();
      glow.geometry.dispose();
      glow.material.dispose();

      mirrors.forEach((m) => {
        m.geometry.dispose();
        if (m.material && m.material.dispose) m.material.dispose();
        if (m.getRenderTarget) {
          const rt = m.getRenderTarget();
          if (rt) rt.dispose();
        }
      });
      mirrorFrames.forEach((f) => {
        f.geometry.dispose();
        f.material.dispose();
      });
      floorMirror.geometry.dispose();
      if (floorMirror.material && floorMirror.material.dispose) floorMirror.material.dispose();
      if (floorMirror.getRenderTarget) {
        const rt = floorMirror.getRenderTarget();
        if (rt) rt.dispose();
      }

      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };

    return () => cleanup();
  });

  function setActive(i) {
    activeIdx = i;
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<section class="page" aria-label={title}>
  <div class="stage" bind:this={host} aria-hidden="true"></div>

  <div class="vignette" aria-hidden="true"></div>

  <div class="hud">
    <div class="top" data-float>
      <div class="kicker">
        <span class="kicker__a">{title}</span>
        <span class="kicker__b">{duration}</span>
      </div>
      <div class="meta">
        <div class="meta__chip">{theme}</div>
        <div class="meta__chip">{submissions}</div>
      </div>
    </div>

    <div class="hero" data-float>
      <div class="hero__title">{theme}</div>
      <div class="hero__deck">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </div>
    </div>

    <div class="rail" aria-label={theme}>
      <div class="rail__grid">
        {#each projects as p, i (p.title)}
          <a
            class="tile {i === activeIdx ? 'is-active' : ''}"
            href={p.href}
            target="_blank"
            rel="noreferrer"
            on:mouseenter={() => setActive(i)}
            on:focus={() => setActive(i)}
            aria-label={p.title}
          >
            <img class="tile__img" src={p.src} alt={p.title} loading="lazy" />
            <div class="tile__title">{p.title}</div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .page {
    position: relative;
    width: 100%;
    min-height: 100svh;
    overflow: hidden;
    background: radial-gradient(1200px 900px at 20% 10%, rgba(255, 79, 216, 0.12), transparent 60%),
      radial-gradient(900px 750px at 80% 35%, rgba(112, 147, 255, 0.14), transparent 62%),
      radial-gradient(1200px 900px at 40% 90%, rgba(0, 255, 196, 0.08), transparent 60%),
      linear-gradient(180deg, #05050b 0%, #070510 35%, #05050b 100%);
  }

  .stage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .stage :global(canvas) {
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
    display: block;
  }

  .vignette {
    position: absolute;
    inset: -2px;
    background: radial-gradient(1100px 720px at 50% 45%, transparent 58%, rgba(0, 0, 0, 0.72) 100%);
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .hud {
    position: relative;
    z-index: 2;
    min-height: 100svh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: clamp(18px, 3.2vw, 44px);
    gap: clamp(18px, 2.6vw, 34px);
    color: rgba(255, 255, 255, 0.92);
  }

  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }

  .kicker {
    display: grid;
    gap: 8px;
  }

  .kicker__a {
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
  }

  .kicker__b {
    font-weight: 600;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.92);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }

  .meta__chip {
    padding: 10px 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
    backdrop-filter: blur(10px) saturate(120%);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    font-size: 12px;
    letter-spacing: 0.02em;
    text-transform: lowercase;
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
  }

  .hero {
    align-self: center;
    justify-self: center;
    width: min(980px, 100%);
    display: grid;
    gap: 18px;
    text-align: center;
    pointer-events: none;
  }

  .hero__title {
    font-weight: 900;
    letter-spacing: -0.04em;
    font-size: clamp(56px, 9.2vw, 116px);
    line-height: 0.92;
    color: rgba(255, 255, 255, 0.96);
    text-shadow: 0 25px 110px rgba(255, 79, 216, 0.23), 0 35px 140px rgba(112, 147, 255, 0.18);
  }

  .hero__deck {
    margin: 0 auto;
    max-width: 62ch;
    font-size: clamp(14px, 1.6vw, 18px);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.74);
  }

  .rail {
    width: 100%;
    justify-self: center;
  }

  .rail__grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: clamp(10px, 1.3vw, 14px);
  }

  .tile {
    position: relative;
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 10px;
    padding: 12px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.015));
    box-shadow: 0 30px 120px rgba(0, 0, 0, 0.42);
    text-decoration: none;
    color: rgba(255, 255, 255, 0.92);
    transform: translateZ(0);
    transition: transform 240ms ease, border-color 240ms ease, background 240ms ease, filter 240ms ease;
  }

  .tile::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 16px;
    background: radial-gradient(220px 120px at 30% 20%, rgba(255, 79, 216, 0.18), transparent 65%),
      radial-gradient(200px 120px at 80% 35%, rgba(112, 147, 255, 0.18), transparent 70%);
    opacity: 0;
    transition: opacity 240ms ease;
    pointer-events: none;
  }

  .tile:hover,
  .tile:focus-visible {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(255, 255, 255, 0.22);
    filter: saturate(1.08);
  }

  .tile:hover::before,
  .tile:focus-visible::before,
  .tile.is-active::before {
    opacity: 1;
  }

  .tile.is-active {
    border-color: rgba(255, 255, 255, 0.28);
    transform: translateY(-6px);
  }

  .tile__img {
    width: 100%;
    height: 110px;
    object-fit: cover;
    border-radius: 12px;
    display: block;
    filter: saturate(0.95) contrast(1.02);
  }

  .tile__title {
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 13px;
    line-height: 1.15;
    text-wrap: balance;
  }

  @media (max-width: 1024px) {
    .rail__grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .tile__img {
      height: 120px;
    }
  }

  @media (max-width: 640px) {
    .top {
      flex-direction: column;
      align-items: flex-start;
    }
    .meta {
      justify-content: flex-start;
    }
    .rail__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .tile__img {
      height: 110px;
    }
  }

  :global(html) {
    background: #05050b;
  }

  :global(body) {
    margin: 0;
    background: #05050b;
  }

  :global(main) {
    padding: 0;
  }
</style>
