<script>
  import { onDestroy, onMount } from "svelte";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const theme = "Reflection";
  const submissions = 23;

  const projects = [
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

  let threeHost;
  let cleanup = () => {};

  onMount(async () => {
    const THREE = await import("three");
    const { Reflector } = await import("three/examples/jsm/objects/Reflector.js");
    const { RoomEnvironment } = await import(
      "three/examples/jsm/environments/RoomEnvironment.js"
    );

    if (!threeHost) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    threeHost.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    scene.fog = new THREE.Fog(0x070a12, 7, 24);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
    camera.position.set(0, 2.3, 8.8);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    const hemi = new THREE.HemisphereLight(0xbad7ff, 0x120a1b, 0.45);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(3.5, 6.2, 2.2);
    key.castShadow = false;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x9a6bff, 0.55);
    rim.position.set(-7, 4, -4);
    scene.add(rim);

    const mirror = new Reflector(new THREE.PlaneGeometry(32, 32), {
      textureWidth: Math.floor(1024 * (window.devicePixelRatio || 1)),
      textureHeight: Math.floor(1024 * (window.devicePixelRatio || 1)),
      color: 0x0b0f1f,
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = -1.35;
    scene.add(mirror);

    const group = new THREE.Group();
    scene.add(group);

    const shardMat = new THREE.MeshPhysicalMaterial({
      color: 0xdce6ff,
      metalness: 1,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
    });
    shardMat.flatShading = true;
    shardMat.needsUpdate = true;

    const matteMat = new THREE.MeshStandardMaterial({
      color: 0x3a2a6a,
      metalness: 0.05,
      roughness: 0.85,
    });
    matteMat.flatShading = true;
    matteMat.needsUpdate = true;

    const makeShard = (geo, mat, x, y, z, rx, ry, rz, s) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.scale.setScalar(s);
      return mesh;
    };

    const geoA = new THREE.IcosahedronGeometry(1, 0);
    const geoB = new THREE.DodecahedronGeometry(1, 0);
    const geoC = new THREE.OctahedronGeometry(1, 0);

    const rng = (min, max) => min + Math.random() * (max - min);
    for (let i = 0; i < 18; i += 1) {
      const geo = i % 3 === 0 ? geoA : i % 3 === 1 ? geoB : geoC;
      const mat = i % 4 === 0 ? matteMat : shardMat;
      const mesh = makeShard(
        geo,
        mat,
        rng(-4.2, 4.2),
        rng(-0.4, 3.2),
        rng(-2.6, 2.6),
        rng(-Math.PI, Math.PI),
        rng(-Math.PI, Math.PI),
        rng(-Math.PI, Math.PI),
        rng(0.35, 1.15)
      );
      group.add(mesh);
    }

    const focus = new THREE.Vector3(0, 0.7, 0);
    let targetYaw = 0;
    let targetPitch = 0;
    let pointerActive = false;

    const onPointerMove = (e) => {
      const rect = threeHost.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const ny = (e.clientY - rect.top) / Math.max(rect.height, 1);
      targetYaw = (nx - 0.5) * 0.9;
      targetPitch = (0.5 - ny) * 0.35;
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    threeHost.addEventListener("pointermove", onPointerMove, { passive: true });
    threeHost.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const setSize = () => {
      const { width, height } = threeHost.getBoundingClientRect();
      const w = Math.max(1, Math.floor(width));
      const h = Math.max(1, Math.floor(height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(threeHost);
    setSize();

    const clock = new THREE.Clock();
    let raf = 0;

    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      group.rotation.y = t * 0.18;
      group.rotation.x = Math.sin(t * 0.22) * 0.06;

      const yaw = pointerActive ? targetYaw : Math.sin(t * 0.12) * 0.25;
      const pitch = pointerActive ? targetPitch : Math.cos(t * 0.09) * 0.06;

      const r = 8.8;
      camera.position.x = Math.sin(yaw) * r;
      camera.position.z = Math.cos(yaw) * r;
      camera.position.y = 2.25 + pitch * 5.0;
      camera.lookAt(focus);

      renderer.render(scene, camera);
    };

    tick();

    cleanup = () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      threeHost?.removeEventListener("pointermove", onPointerMove);
      threeHost?.removeEventListener("pointerleave", onPointerLeave);
      renderer.dispose();
      geoA.dispose();
      geoB.dispose();
      geoC.dispose();
      shardMat.dispose();
      matteMat.dispose();
      pmrem.dispose();
      envRT.dispose();
      mirror.geometry.dispose();
      if (mirror.material?.dispose) mirror.material.dispose();
      if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  });

  onDestroy(() => cleanup());
</script>

<svelte:head>
  <title>{title} &bull; {theme}</title>
</svelte:head>

<div class="page">
  <div class="stage" bind:this={threeHost} aria-hidden="true"></div>

  <div class="chrome">
    <div class="hero">
      <div class="theme">{theme}</div>
      <h1 class="title">{title}</h1>
      <div class="meta">
        <div class="metaItem">{duration}</div>
        <div class="metaDot"></div>
        <div class="metaItem">{submissions}</div>
      </div>
      <p class="lorem">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </p>
    </div>

    <div class="grid" aria-label="Lorem ipsum">
      {#each projects as p (p.title)}
        <a class="card" href={p.link} target="_blank" rel="noreferrer">
          <div class="thumb">
            <img src={p.src} alt={p.alt} loading="lazy" />
          </div>
          <div class="cardText">
            <div class="cardTitle">{p.title}</div>
            {#if p.prize}
              <div class="cardPrize">{p.prize}</div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .page {
    position: relative;
    min-height: 100svh;
    background: radial-gradient(1200px 800px at 20% 10%, rgba(134, 92, 255, 0.24), rgba(7, 10, 18, 0) 55%),
      radial-gradient(900px 650px at 80% 30%, rgba(120, 220, 255, 0.16), rgba(7, 10, 18, 0) 60%),
      linear-gradient(180deg, #070a12 0%, #04050b 70%, #03040a 100%);
    overflow: clip;
    color: rgba(235, 242, 255, 0.92);
  }

  .stage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    opacity: 0.9;
    filter: saturate(1.1) contrast(1.05);
  }

  .chrome {
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin: 0 auto;
    padding: clamp(18px, 3.2vw, 44px);
    display: grid;
    grid-template-rows: auto 1fr;
    gap: clamp(18px, 2.4vw, 28px);
  }

  .hero {
    padding: clamp(18px, 2.6vw, 28px);
    border-radius: 22px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.06) 40%,
      rgba(255, 255, 255, 0.03) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.48);
    backdrop-filter: blur(14px) saturate(125%);
    -webkit-backdrop-filter: blur(14px) saturate(125%);
  }

  .theme {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(240, 248, 255, 0.9);
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(160, 120, 255, 0.28), rgba(120, 220, 255, 0.18));
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  .title {
    margin: 12px 0 0;
    font-size: clamp(30px, 4.2vw, 56px);
    line-height: 1.04;
    font-weight: 750;
    letter-spacing: -0.03em;
    text-shadow: 0 10px 44px rgba(0, 0, 0, 0.55);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    color: rgba(235, 242, 255, 0.74);
    font-size: 14px;
  }

  .metaDot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(235, 242, 255, 0.4);
  }

  .lorem {
    margin: 14px 0 0;
    max-width: 64ch;
    color: rgba(235, 242, 255, 0.78);
    font-size: 15px;
    line-height: 1.55;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(12px, 1.6vw, 18px);
  }

  .card {
    grid-column: span 12;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 14px;
    align-items: center;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    text-decoration: none;
    color: inherit;
    box-shadow: 0 14px 54px rgba(0, 0, 0, 0.42);
    backdrop-filter: blur(10px) saturate(120%);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease;
  }

  .card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.075);
    border-color: rgba(255, 255, 255, 0.18);
  }

  .thumb {
    width: 120px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cardTitle {
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .cardPrize {
    margin-top: 6px;
    color: rgba(235, 242, 255, 0.7);
    font-size: 13px;
    line-height: 1.35;
  }

  @media (min-width: 720px) {
    .card {
      grid-column: span 6;
    }
  }

  @media (min-width: 1024px) {
    .card {
      grid-column: span 4;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: start;
    }

    .thumb {
      width: 100%;
      height: 160px;
      border-radius: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card {
      transition: none;
    }
  }
</style>
