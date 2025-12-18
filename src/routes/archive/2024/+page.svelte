<script>
  import { onDestroy, onMount } from "svelte";

  const title = "Cambridge Game Jam 2024";
  const date = "9th - 11th February";
  const theme = "Reflection";

  const featured = [
    {
      title: "Blight",
      href: "https://hex-26.itch.io/blight",
      image: "/2024/blight.png",
      meta: "Most Popular and Best Gameplay",
    },
    {
      title: "Reflect Upon Your Actions",
      href: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      image: "/2024/reflect-upon-your-actions.png",
      meta: "Most Popular and Most Original",
    },
    {
      title: "Reflected",
      href: "https://ekorrette.itch.io/reflected",
      image: "/2024/reflected.png",
      meta: "Theme Winner",
    },
    {
      title: "Asymmetry",
      href: "https://alex-davies.itch.io/asymmetry",
      image: "/2024/asymmetry.png",
      meta: "Best Gameplay",
    },
    {
      title: "Coulda Woulda Buddha",
      href: "https://greenwood672.itch.io/coulda-woulda-buddha",
      image: "/2024/coulda-woulda-buddha.png",
      meta: "Best Presentation",
    },
    {
      title: "All Submissions",
      href: "https://itch.io/jam/camgamejam2024",
      image: "/2024/all-submissions.png",
      meta: "",
    },
  ];

  let sceneHost;
  let cleanup = () => {};

  onMount(async () => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const THREE = await import("three");
    const { Reflector } = await import("three/examples/jsm/objects/Reflector.js");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    scene.fog = new THREE.Fog(0x070a12, 6, 18);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    camera.position.set(0.2, 1.55, 7.2);

    const hemi = new THREE.HemisphereLight(0xbdd7ff, 0x0a1020, 0.8);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(5, 9, 3);
    key.castShadow = false;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xa2c4ff, 0.65);
    rim.position.set(-6, 2, -4);
    scene.add(rim);

    const floorGeo = new THREE.PlaneGeometry(26, 26, 1, 1);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b1328, roughness: 0.9, metalness: 0.0, flatShading: true });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.25;
    scene.add(floor);

    const mirrorGeo = new THREE.PlaneGeometry(7.2, 4.6);
    const mirror = new Reflector(mirrorGeo, {
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x0a0f1f,
    });
    mirror.position.set(0, 1.2, -2.9);
    mirror.rotation.y = -0.25;
    scene.add(mirror);

    const frameGeo = new THREE.BoxGeometry(7.4, 4.8, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a2342, roughness: 0.55, metalness: 0.08, flatShading: true });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.copy(mirror.position);
    frame.rotation.copy(mirror.rotation);
    frame.position.z -= 0.08;
    scene.add(frame);

    const palette = [0x79a7ff, 0xff7aa8, 0x6bf2d3, 0xffd17a, 0xc6a4ff];

    const shards = [];
    const shardGeo = new THREE.IcosahedronGeometry(0.6, 0);
    for (let i = 0; i < 26; i += 1) {
      const mat = new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        roughness: 0.35,
        metalness: 0.12,
        flatShading: true,
      });
      const m = new THREE.Mesh(shardGeo, mat);
      m.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.2) * 4, (Math.random() - 0.5) * 10);
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.35 + Math.random() * 0.95;
      m.scale.setScalar(s);
      shards.push(m);
      scene.add(m);
    }

    const coreGeo = new THREE.IcosahedronGeometry(1.05, 0);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xbdd7ff, roughness: 0.25, metalness: 0.2, flatShading: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0.1, 0.6, 0.2);
    scene.add(core);

    const glowGeo = new THREE.SphereGeometry(2.1, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x1b2b5e, transparent: true, opacity: 0.18 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(core.position);
    scene.add(glow);

    let raf = 0;
    let w = 1;
    let h = 1;

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const resize = () => {
      if (!sceneHost) return;
      const r = sceneHost.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      target.x = nx;
      target.y = ny;
    };

    const render = (t) => {
      const time = t * 0.001;

      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;

      camera.position.x = 0.2 + pointer.x * 0.55;
      camera.position.y = 1.55 - pointer.y * 0.25;
      camera.lookAt(0, 0.75, -0.6);

      core.rotation.y = time * 0.55;
      core.rotation.x = Math.sin(time * 0.4) * 0.15;
      glow.scale.setScalar(1.0 + Math.sin(time * 0.6) * 0.04);

      for (let i = 0; i < shards.length; i += 1) {
        const m = shards[i];
        const f = 0.08 + (i % 7) * 0.02;
        m.rotation.x += f * 0.06;
        m.rotation.y += f * 0.08;
        m.position.y += Math.sin(time * 0.7 + i) * 0.0009;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    const host = sceneHost;
    host.appendChild(renderer.domElement);

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    resize();

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(render);
    }

    cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);

      for (const m of shards) {
        scene.remove(m);
        m.geometry?.dispose?.();
        m.material?.dispose?.();
      }

      floorGeo.dispose();
      floorMat.dispose();
      mirrorGeo.dispose();
      frameGeo.dispose();
      frameMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();

      scene.remove(floor);
      scene.remove(mirror);
      scene.remove(frame);
      scene.remove(core);
      scene.remove(glow);

      renderer.dispose();
      renderer.domElement?.remove?.();
    };

    return cleanup;
  });

  onDestroy(() => cleanup());
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page" role="document">
  <div class="scene" bind:this={sceneHost} aria-hidden="true"></div>

  <div class="vignette" aria-hidden="true"></div>

  <div class="shell">
    <header class="hero">
      <div class="brand">
        <img class="logo" src="/2024/logo.png" alt="Cambridge Game Jam 2024" />
        <div class="titles">
          <div class="kicker">{theme}</div>
          <h1 class="h1">{title}</h1>
          <div class="sub">{date}</div>
        </div>
      </div>

      <div class="lede">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <div class="cta">
        <a class="primary" href="https://itch.io/jam/camgamejam2024">All Submissions</a>
        <a class="ghost" href="/">Cambridge Game Jam</a>
      </div>
    </header>

    <section class="grid" aria-label={title}>
      {#each featured as item}
        <a class="card" href={item.href} aria-label={item.title}>
          <div class="thumb">
            <img src={item.image} alt={item.title} loading="lazy" />
          </div>
          <div class="cardText">
            <div class="cardTitle">{item.title}</div>
            {#if item.meta}
              <div class="cardMeta">{item.meta}</div>
            {/if}
          </div>
        </a>
      {/each}
    </section>

    <section class="lower" aria-label="Reflection">
      <div class="pill">Reflection</div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        aliquip ex ea commodo consequat.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </section>
  </div>
</div>

<style>
  .page {
    position: relative;
    min-height: 100vh;
    background: radial-gradient(1200px 800px at 50% 15%, rgba(128, 173, 255, 0.16), rgba(7, 10, 18, 0)),
      radial-gradient(900px 700px at 20% 60%, rgba(255, 122, 168, 0.12), rgba(7, 10, 18, 0)),
      radial-gradient(900px 700px at 80% 70%, rgba(107, 242, 211, 0.12), rgba(7, 10, 18, 0)), #070a12;
    color: rgba(255, 255, 255, 0.92);
    overflow: hidden;
  }

  .scene {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .scene :global(canvas) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .vignette {
    position: absolute;
    inset: -2px;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(60% 60% at 50% 25%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.55) 72%, rgba(0, 0, 0, 0.8) 100%);
  }

  .shell {
    position: relative;
    z-index: 2;
    max-width: 1100px;
    margin: 0 auto;
    padding: 44px 20px 64px;
  }

  .hero {
    display: grid;
    gap: 18px;
    align-items: start;
  }

  .brand {
    display: flex;
    gap: 18px;
    align-items: center;
  }

  .logo {
    width: 92px;
    height: 92px;
    object-fit: contain;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.4);
  }

  .titles {
    min-width: 0;
  }

  .kicker {
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 12px;
    opacity: 0.82;
  }

  .h1 {
    margin: 6px 0 0;
    font-size: clamp(34px, 4.2vw, 56px);
    line-height: 1.03;
    letter-spacing: -0.02em;
  }

  .sub {
    margin-top: 8px;
    font-size: 15px;
    opacity: 0.84;
  }

  .lede {
    max-width: 62ch;
    font-size: 16px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.85);
  }

  .lede p {
    margin: 0 0 10px;
  }

  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
  }

  .primary,
  .ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 999px;
    font-size: 14px;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.92);
  }

  .primary {
    border-color: rgba(121, 167, 255, 0.5);
    background: linear-gradient(180deg, rgba(121, 167, 255, 0.26), rgba(121, 167, 255, 0.08));
  }

  .primary:hover,
  .ghost:hover {
    border-color: rgba(255, 255, 255, 0.34);
    background: rgba(255, 255, 255, 0.09);
  }

  .grid {
    margin-top: 30px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
  }

  .card {
    grid-column: span 6;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 14px;
    align-items: stretch;
    text-decoration: none;
    color: inherit;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }

  .card:hover {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.07);
  }

  .thumb {
    position: relative;
    min-height: 92px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0));
  }

  .thumb img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cardText {
    padding: 14px 14px 14px 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
  }

  .cardTitle {
    font-size: 16px;
    letter-spacing: -0.01em;
  }

  .cardMeta {
    font-size: 12px;
    opacity: 0.8;
  }

  .lower {
    margin-top: 28px;
    max-width: 72ch;
    padding: 18px 18px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.22);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.9;
  }

  .lower p {
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.84);
    line-height: 1.6;
  }

  @media (max-width: 820px) {
    .card {
      grid-column: span 12;
    }

    .card {
      grid-template-columns: 1fr;
    }

    .cardText {
      padding: 14px;
    }

    .thumb {
      min-height: 160px;
    }
  }
</style>
