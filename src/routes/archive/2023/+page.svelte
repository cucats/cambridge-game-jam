<script>
  import { onMount } from "svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const featured = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let canvas;
  let prefersReducedMotion = $state(false);
  let hoverIndex = $state(-1);
  let focusIndex = $state(0);
  let ready = $state(false);

  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  const safeMod = (n, m) => ((n % m) + m) % m;

  const pick = (arr, idx) => arr[safeMod(idx, arr.length)];

  const hexToRgb = (hex) => {
    const h = hex.replace("#", "").trim();
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };

  const cssVar = (name, fallback) => {
    if (typeof window === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };

  const projectAccent = (index) => {
    const palette = ["#4ad7ff", "#7cffd1", "#ffd166", "#b28dff", "#ff4fd8", "#ff7a4a"];
    return pick(palette, index);
  };

  const focusProject = (index) => {
    focusIndex = safeMod(index, featured.length);
  };

  const focusNext = () => focusProject(focusIndex + 1);
  const focusPrev = () => focusProject(focusIndex - 1);

  const onKeyNav = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusNext();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusPrev();
    }
  };

  onMount(() => {
    prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onKeydown = (e) => {
      const t = e.target;
      const tag = t && t.tagName ? String(t.tagName).toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (t && t.isContentEditable) return;
      onKeyNav(e);
    };
    window.addEventListener("keydown", onKeydown);

    if (prefersReducedMotion) {
      ready = true;
      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    }

    let disposed = false;
    let raf = 0;
    let resizeObs;

    const start = async () => {
      const THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");

      if (disposed) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scene = new THREE.Scene();

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);

      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 220);
      camera.position.set(0, 0.15, 2.6);

      const fogColor = new THREE.Color(0x05070a);
      scene.fog = new THREE.FogExp2(fogColor, 0.065);

      const ambient = new THREE.AmbientLight(0x0b1a22, 0.8);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0x89d8ff, 0.6);
      key.position.set(2, 4, 2);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0xffd166, 0.25);
      rim.position.set(-3, -1, -4);
      scene.add(rim);

      const accent = new THREE.PointLight(0x4ad7ff, 2.2, 18, 1.6);
      accent.position.set(0.2, 0.1, 0.6);
      scene.add(accent);

      const accent2 = new THREE.PointLight(0xff4fd8, 1.2, 14, 1.8);
      accent2.position.set(-0.4, -0.2, -2.2);
      scene.add(accent2);

      const path = [];
      const segs = 80;
      for (let i = 0; i < segs; i += 1) {
        const t = i / (segs - 1);
        const z = -t * 90;
        const x = Math.sin(t * Math.PI * 3.2) * 1.25 + Math.sin(t * Math.PI * 8.0) * 0.28;
        const y = Math.cos(t * Math.PI * 2.3) * 0.55 + Math.sin(t * Math.PI * 6.4) * 0.18;
        path.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(path);

      const tubeGeom = new THREE.TubeGeometry(curve, 1400, 3.0, 40, false);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x070a0d,
        roughness: 0.98,
        metalness: 0.08,
        emissive: 0x000000,
      });
      const tube = new THREE.Mesh(tubeGeom, wallMat);
      tube.scale.set(1.12, 0.9, 1);
      tube.rotation.z = 0.08;
      tube.receiveShadow = false;
      scene.add(tube);

      const streakGeom = new THREE.TubeGeometry(curve, 700, 0.22, 10, false);
      const streakMat = new THREE.MeshBasicMaterial({
        color: 0x0d2b3a,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const streak = new THREE.Mesh(streakGeom, streakMat);
      streak.scale.set(1.2, 1.0, 1);
      streak.rotation.z = -0.12;
      scene.add(streak);

      const crystalsCount = 140;
      const crystalGeo = new THREE.IcosahedronGeometry(0.14, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x8ce7ff,
        roughness: 0.18,
        metalness: 0.22,
        emissive: 0x1b9aaa,
        emissiveIntensity: 1.35,
        transparent: true,
        opacity: 0.92,
      });
      const crystals = new THREE.InstancedMesh(crystalGeo, crystalMat, crystalsCount);
      crystals.frustumCulled = false;
      scene.add(crystals);

      const tmpObj = new THREE.Object3D();
      const tmpColor = new THREE.Color();
      const rng = (seed) => {
        let x = seed % 2147483647;
        if (x <= 0) x += 2147483646;
        return () => (x = (x * 16807) % 2147483647) / 2147483647;
      };
      const rand = rng(1337);

      for (let i = 0; i < crystalsCount; i += 1) {
        const t = rand();
        const p = curve.getPointAt(t);
        const a = rand() * Math.PI * 2;
        const r = 2.35 + rand() * 1.0;
        const offset = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.65, 0);
        const pos = p.clone().add(offset);

        tmpObj.position.copy(pos);
        tmpObj.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
        const s = 0.55 + rand() * 1.6;
        tmpObj.scale.setScalar(s);
        tmpObj.updateMatrix();
        crystals.setMatrixAt(i, tmpObj.matrix);

        const c = projectAccent(i);
        tmpColor.setRGB(hexToRgb(c).r / 255, hexToRgb(c).g / 255, hexToRgb(c).b / 255);
        crystals.setColorAt(i, tmpColor);
      }
      crystals.instanceColor.needsUpdate = true;

      const dustCount = 2600;
      const dustGeo = new THREE.BufferGeometry();
      const dustPos = new Float32Array(dustCount * 3);
      const dustVel = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i += 1) {
        const t = rand();
        const p = curve.getPointAt(t);
        const a = rand() * Math.PI * 2;
        const r = rand() * 2.4;
        dustPos[i * 3 + 0] = p.x + Math.cos(a) * r;
        dustPos[i * 3 + 1] = p.y + Math.sin(a) * r * 0.8;
        dustPos[i * 3 + 2] = p.z + (rand() - 0.5) * 0.7;
        dustVel[i * 3 + 0] = (rand() - 0.5) * 0.008;
        dustVel[i * 3 + 1] = (rand() - 0.5) * 0.006;
        dustVel[i * 3 + 2] = 0.006 + rand() * 0.012;
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0xbfefff,
        size: 0.022,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const dust = new THREE.Points(dustGeo, dustMat);
      dust.frustumCulled = false;
      scene.add(dust);

      const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const onMove = (e) => {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        pointer.targetX = (e.clientX / w - 0.5) * 2;
        pointer.targetY = (e.clientY / h - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let speed = 0.045;
      let speedTarget = 0.045;
      const onScroll = () => {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
        const s = clamp01(doc.scrollTop / max);
        speedTarget = 0.02 + s * 0.12;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      const resize = () => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(canvas);

      const startAt = performance.now();
      let u = 0;

      const tick = (now) => {
        if (disposed) return;
        const t = (now - startAt) * 0.001;

        pointer.x += (pointer.targetX - pointer.x) * 0.06;
        pointer.y += (pointer.targetY - pointer.y) * 0.06;
        speed += (speedTarget - speed) * 0.03;

        const ix = hoverIndex >= 0 ? hoverIndex : focusIndex;
        const accentHex = cssVar("--accent", projectAccent(ix));
        const { r, g, b } = hexToRgb(accentHex);
        const target = new THREE.Color(r / 255, g / 255, b / 255);
        accent.color.lerp(target, 0.08);

        u = (u + speed * (1 + Math.sin(t * 0.6) * 0.02)) % 1;
        const lookAhead = (u + 0.006 + Math.sin(t * 0.2) * 0.001) % 1;
        const p = curve.getPointAt(u);
        const q = curve.getPointAt(lookAhead);

        camera.position.set(p.x + pointer.x * 0.4, p.y + pointer.y * 0.28, p.z + 2.1);
        camera.lookAt(q.x + pointer.x * 0.18, q.y + pointer.y * 0.12, q.z - 2.2);

        accent.position.set(
          p.x + Math.cos(t * 0.9) * 0.55 + pointer.x * 0.4,
          p.y + Math.sin(t * 1.1) * 0.3 + pointer.y * 0.25,
          p.z + 0.6
        );
        accent.intensity = 1.9 + Math.sin(t * 1.7) * 0.55;

        accent2.position.set(p.x - 0.55 - pointer.x * 0.25, p.y - 0.25, p.z - 4.6);
        accent2.intensity = 0.85 + Math.cos(t * 1.25) * 0.35;

        streak.material.opacity = 0.16 + Math.sin(t * 0.8) * 0.06;
        streak.rotation.z = -0.12 + Math.sin(t * 0.22) * 0.09;

        const d = dust.geometry.attributes.position.array;
        for (let i = 0; i < dustCount; i += 1) {
          const o = i * 3;
          d[o + 0] += dustVel[o + 0] + Math.sin(t * 0.45 + i * 0.01) * 0.0002;
          d[o + 1] += dustVel[o + 1] + Math.cos(t * 0.42 + i * 0.01) * 0.0002;
          d[o + 2] += dustVel[o + 2] * (0.8 + Math.sin(t * 0.5) * 0.08);
          if (d[o + 2] > camera.position.z + 1.6) {
            const tt = (u + 0.07 + rand() * 0.08) % 1;
            const pp = curve.getPointAt(tt);
            const aa = rand() * Math.PI * 2;
            const rr = rand() * 2.2;
            d[o + 0] = pp.x + Math.cos(aa) * rr;
            d[o + 1] = pp.y + Math.sin(aa) * rr * 0.75;
            d[o + 2] = pp.z - 10 - rand() * 12;
          }
        }
        dust.geometry.attributes.position.needsUpdate = true;

        if (crystals.instanceColor) {
          const base = 1.15 + Math.sin(t * 1.2) * 0.12;
          crystalMat.emissiveIntensity = base + (hoverIndex >= 0 ? 0.32 : 0.12);
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
      ready = true;

      return () => {
        window.removeEventListener("keydown", onKeydown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        if (resizeObs) resizeObs.disconnect();
        cancelAnimationFrame(raf);
        tubeGeom.dispose();
        wallMat.dispose();
        streakGeom.dispose();
        streakMat.dispose();
        crystalGeo.dispose();
        crystalMat.dispose();
        dustGeo.dispose();
        dustMat.dispose();
        renderer.dispose();
      };
    };

    let stop;
    start().then((cleanup) => {
      stop = cleanup;
    });

    return () => {
      disposed = true;
      if (stop) stop();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page" style="--accent: {projectAccent(hoverIndex >= 0 ? hoverIndex : focusIndex)}">
  <div class="scene">
    <canvas bind:this={canvas} class="webgl" aria-hidden="true"></canvas>
    <div class="vignette" aria-hidden="true"></div>
    <div class="mist" aria-hidden="true"></div>
  </div>

  <div class="ui">
    <div class="top">
      <a class="pill" href="/archive" title="Lorem ipsum">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </a>
      <div class="spacer"></div>
      <a class="pill" href="https://itch.io/jam/camgamejam2023" title="Lorem ipsum">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 3h7v7" />
          <path d="M10 14L21 3" />
          <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
        </svg>
      </a>
    </div>

    <div class="hero">
      <div class="badge">
        <img src="/2023/logo.png" alt="Cambridge Game Jam Logo" class="logo" decoding="async" />
      </div>
      <div class="titles">
        <div class="title">{title}</div>
        <div class="meta">{duration}</div>
        <div class="chips">
          <div class="chip">{theme}</div>
          <a class="chip link" href="https://itch.io/jam/camgamejam2023">{submissions} {submissions === 1 ? "Submission" : "Submissions"}</a>
        </div>
      </div>
    </div>

    <ul class="grid">
      {#each featured as p, i}
        <li class="item">
          <a
            class="card"
            href={p.link}
            onmouseenter={() => (hoverIndex = i)}
            onmouseleave={() => (hoverIndex = -1)}
            onfocus={() => focusProject(i)}
            data-active={i === focusIndex}
            style="--card-accent: {projectAccent(i)}"
          >
            <div class="frame" aria-hidden="true"></div>
            <img src={p.src} alt={p.alt} class="thumb" loading="lazy" decoding="async" />
            <div class="shade" aria-hidden="true"></div>
            <div class="text">
              <div class="name">{p.title}</div>
              {#if p.prize}
                <div class="prize">{p.prize}</div>
              {/if}
            </div>
          </a>
        </li>
      {/each}
    </ul>

    {#if !ready}
      <div class="loading">
        <div class="ring" aria-hidden="true"></div>
        <div class="t">{pick(["Lorem ipsum", "Lorem ipsum dolor", "Lorem ipsum dolor sit"], focusIndex)}</div>
      </div>
    {/if}

    {#if prefersReducedMotion}
      <div class="reduced">
        <div class="t">{pick(["Lorem ipsum", "Lorem ipsum dolor", "Lorem ipsum dolor sit"], focusIndex)}</div>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(footer) {
    display: none !important;
  }

  .page {
    min-height: 100svh;
    position: relative;
    overflow: hidden;
    background: radial-gradient(1200px 700px at 55% 15%, rgba(80, 200, 255, 0.06), transparent 55%),
      radial-gradient(900px 520px at 25% 70%, rgba(255, 120, 74, 0.06), transparent 55%),
      linear-gradient(180deg, #030405 0%, #05070a 40%, #030405 100%);
    color: rgba(240, 252, 255, 0.92);
  }

  .scene {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .webgl {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    filter: saturate(1.15) contrast(1.07);
  }

  .vignette {
    position: absolute;
    inset: -10%;
    background: radial-gradient(closest-side at 50% 40%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.55) 100%);
    mix-blend-mode: multiply;
    opacity: 0.9;
  }

  .mist {
    position: absolute;
    inset: 0;
    background: radial-gradient(900px 420px at 45% 30%, rgba(74, 215, 255, 0.05), transparent 60%),
      radial-gradient(860px 480px at 70% 68%, rgba(255, 79, 216, 0.045), transparent 62%),
      radial-gradient(1200px 800px at 40% 85%, rgba(255, 209, 102, 0.04), transparent 62%);
    filter: blur(10px);
    opacity: 0.85;
    animation: mist 9s ease-in-out infinite alternate;
  }

  @keyframes mist {
    0% {
      transform: translate3d(-1%, -0.5%, 0) scale(1);
      opacity: 0.68;
    }
    100% {
      transform: translate3d(1%, 0.8%, 0) scale(1.04);
      opacity: 0.9;
    }
  }

  .ui {
    position: relative;
    min-height: 100svh;
    padding: clamp(16px, 3vw, 34px);
    display: grid;
    grid-template-rows: auto auto 1fr;
    gap: clamp(14px, 2.2vw, 24px);
  }

  .top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .spacer {
    flex: 1;
  }

  .pill {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(220, 250, 255, 0.1), rgba(0, 0, 0, 0.12));
    border: 1px solid rgba(180, 240, 255, 0.12);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
    color: rgba(235, 252, 255, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transform: translateZ(0);
    transition: transform 260ms cubic-bezier(0.2, 0.9, 0.2, 1), border-color 260ms ease, background 260ms ease;
    text-decoration: none;
  }

  .pill svg {
    width: 18px;
    height: 18px;
    opacity: 0.92;
  }

  .pill:hover {
    transform: translateY(-2px) scale(1.02);
    border-color: color-mix(in oklab, var(--accent) 55%, rgba(180, 240, 255, 0.2));
    background: linear-gradient(
      180deg,
      color-mix(in oklab, var(--accent) 22%, rgba(220, 250, 255, 0.12)),
      rgba(0, 0, 0, 0.14)
    );
  }

  .hero {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: clamp(14px, 2vw, 22px);
    align-items: center;
    max-width: 1120px;
    width: 100%;
  }

  .badge {
    width: clamp(80px, 9vw, 108px);
    height: clamp(80px, 9vw, 108px);
    border-radius: 18px;
    background: radial-gradient(90px 90px at 30% 22%, rgba(74, 215, 255, 0.25), transparent 60%),
      radial-gradient(110px 110px at 85% 75%, rgba(255, 79, 216, 0.18), transparent 60%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(0, 0, 0, 0.14));
    border: 1px solid rgba(200, 245, 255, 0.13);
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: grid;
    place-items: center;
    position: relative;
    overflow: hidden;
  }

  .badge::before {
    content: "";
    position: absolute;
    inset: -40%;
    background: conic-gradient(
      from 180deg,
      rgba(74, 215, 255, 0) 0%,
      rgba(74, 215, 255, 0.28) 12%,
      rgba(255, 79, 216, 0.28) 25%,
      rgba(255, 209, 102, 0.22) 45%,
      rgba(74, 215, 255, 0) 60%
    );
    filter: blur(10px);
    opacity: 0.75;
    animation: spin 7.5s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .logo {
    width: 72%;
    height: 72%;
    object-fit: contain;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 14px 30px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 16px rgba(74, 215, 255, 0.18));
    transform: translateZ(0);
  }

  .titles {
    display: grid;
    gap: 10px;
  }

  .title {
    font-size: clamp(28px, 4.2vw, 54px);
    letter-spacing: -0.02em;
    line-height: 1.05;
    text-shadow: 0 20px 60px rgba(0, 0, 0, 0.65);
    background: linear-gradient(
      180deg,
      rgba(245, 255, 255, 0.98) 0%,
      color-mix(in oklab, var(--accent) 22%, rgba(215, 245, 255, 0.92)) 65%,
      rgba(185, 235, 255, 0.82) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 18px color-mix(in oklab, var(--accent) 18%, transparent));
    animation: shimmer 3.8s ease-in-out infinite alternate;
  }

  @keyframes shimmer {
    0% {
      filter: drop-shadow(0 0 12px rgba(74, 215, 255, 0.06));
    }
    100% {
      filter: drop-shadow(0 0 26px color-mix(in oklab, var(--accent) 20%, transparent));
    }
  }

  .meta {
    font-size: clamp(14px, 2vw, 20px);
    color: rgba(210, 244, 255, 0.86);
    text-shadow: 0 18px 50px rgba(0, 0, 0, 0.6);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .chip {
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.14));
    border: 1px solid rgba(190, 240, 255, 0.12);
    color: rgba(235, 252, 255, 0.9);
    text-decoration: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
    transition: transform 260ms cubic-bezier(0.2, 0.9, 0.2, 1), border-color 260ms ease;
  }

  .chip.link:hover {
    transform: translateY(-2px);
    border-color: color-mix(in oklab, var(--accent) 55%, rgba(190, 240, 255, 0.2));
  }

  .grid {
    width: 100%;
    max-width: 1120px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(10px, 1.6vw, 16px);
    align-content: start;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .item {
    grid-column: span 6;
  }

  .card {
    min-height: 170px;
    border-radius: 18px;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    background: radial-gradient(240px 160px at 30% 20%, rgba(255, 255, 255, 0.12), transparent 55%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.18));
    border: 1px solid rgba(180, 240, 255, 0.12);
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.62);
    transform: perspective(900px) translateZ(0);
    transition: transform 340ms cubic-bezier(0.2, 0.9, 0.2, 1), border-color 260ms ease, filter 260ms ease;
    will-change: transform;
  }

  .card::after {
    content: "";
    position: absolute;
    inset: -30%;
    background: conic-gradient(
      from 180deg,
      rgba(0, 0, 0, 0) 0%,
      color-mix(in oklab, var(--card-accent) 45%, transparent) 14%,
      rgba(255, 255, 255, 0.08) 20%,
      rgba(0, 0, 0, 0) 38%
    );
    opacity: 0;
    filter: blur(14px);
    transition: opacity 260ms ease;
    pointer-events: none;
  }

  .card:hover {
    transform: perspective(900px) translateY(-6px) rotateX(4deg) rotateY(-6deg) scale(1.01);
    border-color: color-mix(in oklab, var(--card-accent) 60%, rgba(180, 240, 255, 0.2));
    filter: saturate(1.06);
  }

  .card:hover::after {
    opacity: 0.75;
    animation: sweep 1.4s ease-in-out infinite;
  }

  @keyframes sweep {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .frame {
    position: absolute;
    inset: 0;
    border-radius: 18px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 0 2px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }

  .thumb {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.04);
    filter: contrast(1.02) saturate(1.06);
    transition: transform 520ms cubic-bezier(0.2, 0.9, 0.2, 1), filter 520ms ease;
  }

  .card:hover .thumb {
    transform: scale(1.1);
    filter: contrast(1.06) saturate(1.12);
  }

  .shade {
    position: absolute;
    inset: 0;
    background: radial-gradient(280px 160px at 30% 30%, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.75) 78%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.86));
    opacity: 0.95;
  }

  .text {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 12px;
    display: grid;
    gap: 2px;
    z-index: 1;
    text-shadow: 0 18px 50px rgba(0, 0, 0, 0.75);
  }

  .name {
    font-size: 18px;
    letter-spacing: -0.01em;
    color: rgba(245, 255, 255, 0.95);
  }

  .prize {
    font-size: 13px;
    color: color-mix(in oklab, var(--card-accent) 55%, rgba(205, 245, 255, 0.85));
  }

  .loading,
  .reduced {
    position: fixed;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.18));
    border: 1px solid rgba(180, 240, 255, 0.12);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: rgba(235, 252, 255, 0.9);
    z-index: 3;
    pointer-events: none;
  }

  .ring {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 2px solid rgba(235, 252, 255, 0.12);
    border-top-color: color-mix(in oklab, var(--accent) 60%, rgba(235, 252, 255, 0.3));
    animation: ring 900ms linear infinite;
  }

  @keyframes ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .t {
    font-size: 13px;
    letter-spacing: 0.02em;
    opacity: 0.88;
  }

  @media (max-width: 860px) {
    .hero {
      grid-template-columns: 1fr;
    }
    .badge {
      width: 88px;
      height: 88px;
      border-radius: 18px;
    }
    .grid {
      grid-template-columns: repeat(6, 1fr);
    }
    .item {
      grid-column: span 6;
    }
    .card {
      min-height: 176px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mist,
    .badge::before,
    .title,
    .ring,
    .card:hover::after {
      animation: none !important;
    }
    .card,
    .thumb,
    .pill,
    .chip {
      transition: none !important;
    }
  }
</style>
