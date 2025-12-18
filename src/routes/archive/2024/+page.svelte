<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Reflector } from "three/examples/jsm/objects/Reflector.js";

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
  let stage;

  onMount(() => {
    if (!canvas || !stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color("#07080b"), 8, 26);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
    camera.position.set(0, 3.2, 9.5);
    camera.lookAt(0, 1.2, 0);

    const hemi = new THREE.HemisphereLight(new THREE.Color("#cbd7ff"), new THREE.Color("#0b0b12"), 0.55);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 1.15);
    key.position.set(4.5, 7.5, 3.5);
    key.castShadow = false;
    scene.add(key);

    const rim = new THREE.PointLight(new THREE.Color("#6be6ff"), 1.4, 60);
    rim.position.set(-6, 3.5, -5);
    scene.add(rim);

    const floorGeo = new THREE.PlaneGeometry(32, 32);
    const floor = new Reflector(floorGeo, {
      textureWidth: 1024,
      textureHeight: 1024,
      color: new THREE.Color("#0b0c12"),
    });
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    const groundLowPoly = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 32, 18, 18),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#101323"),
        metalness: 0.15,
        roughness: 0.95,
        emissive: new THREE.Color("#050611"),
        emissiveIntensity: 0.8,
      }),
    );
    groundLowPoly.rotation.x = -Math.PI / 2;
    groundLowPoly.position.y = 0.02;
    scene.add(groundLowPoly);

    const pos = groundLowPoly.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = Math.hypot(x, z);
      const h = Math.sin(x * 0.32) * Math.cos(z * 0.27) * 0.16 + Math.cos(d * 0.55) * 0.09;
      pos.setY(i, h);
    }
    groundLowPoly.geometry.computeVertexNormals();

    const cluster = new THREE.Group();
    cluster.position.y = 0;
    scene.add(cluster);

    const shardGeo = new THREE.IcosahedronGeometry(1, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c6d0ff"),
      metalness: 1,
      roughness: 0.08,
      envMapIntensity: 1.25,
    });

    const matteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1b2a3f"),
      metalness: 0.05,
      roughness: 0.92,
    });

    const makeShard = (x, y, z, s, metallic) => {
      const m = metallic ? shardMat : matteMat;
      const mesh = new THREE.Mesh(shardGeo, m);
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(s);
      mesh.rotation.set((x + z) * 0.21, x * 0.33, z * 0.27);
      return mesh;
    };

    const pairs = [
      { x: 2.1, y: 1.1, z: 0.6, s: 1.2, metallic: true },
      { x: 1.35, y: 0.7, z: -2.2, s: 0.9, metallic: false },
      { x: 3.35, y: 0.55, z: -2.9, s: 0.65, metallic: true },
      { x: 0.75, y: 1.55, z: 1.9, s: 0.85, metallic: true },
    ];

    for (const p of pairs) {
      const a = makeShard(p.x, p.y, p.z, p.s, p.metallic);
      const b = makeShard(-p.x, p.y, p.z, p.s, p.metallic);
      cluster.add(a, b);
    }

    const ringGeo = new THREE.TorusGeometry(2.45, 0.22, 10, 18);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0e1222"),
        metalness: 0.65,
        roughness: 0.22,
      }),
    );
    ring.position.set(0, 1.2, 0);
    ring.rotation.set(Math.PI / 2.35, 0, 0);
    cluster.add(ring);

    const glow = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#6be6ff"),
        emissive: new THREE.Color("#6be6ff"),
        emissiveIntensity: 1.35,
        metalness: 0.2,
        roughness: 0.6,
      }),
    );
    glow.position.set(0, 1.35, 0);
    cluster.add(glow);

    const resize = () => {
      const r = stage.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(stage);

    const clock = new THREE.Clock();
    let raf = 0;

    const renderOnce = () => {
      renderer.render(scene, camera);
    };

    const tick = () => {
      const t = clock.getElapsedTime();
      cluster.rotation.y = t * 0.22;
      ring.rotation.z = t * 0.35;
      glow.position.y = 1.35 + Math.sin(t * 1.3) * 0.12;
      rim.intensity = 1.1 + Math.sin(t * 0.9) * 0.25;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      renderOnce();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      floorGeo.dispose();
      groundLowPoly.geometry.dispose();
      groundLowPoly.material.dispose();
      shardGeo.dispose();
      ringGeo.dispose();
      ring.material.dispose();
      glow.geometry.dispose();
      glow.material.dispose();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page">
  <div class="stage" bind:this={stage}>
    <canvas class="canvas" bind:this={canvas}></canvas>
    <div class="vignette" aria-hidden="true"></div>
    <div class="ui">
      <div class="panel">
        <div class="topline">
          <div class="kicker">{theme}</div>
          <div class="facts">
            <span>{duration}</span>
            <span>{submissions}</span>
          </div>
        </div>
        <h1 class="title">{title}</h1>
        <p class="copy">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua.
        </p>
        <div class="grid">
          {#each featured as item (item.title)}
            <a class="tile" href={item.link} target="_blank" rel="noreferrer" aria-label="Lorem ipsum">
              <img class="thumb" src={item.src} alt={item.alt} loading="lazy" />
              <div class="meta">
                <div class="name">{item.title}</div>
                {#if item.prize}
                  <div class="prize">{item.prize}</div>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    background: radial-gradient(1200px 700px at 20% 10%, #111842 0%, #07080b 55%, #050509 100%);
    color: #e9ecff;
  }

  .stage {
    position: relative;
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  .canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .vignette {
    position: absolute;
    inset: -10%;
    background: radial-gradient(closest-side at 50% 40%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 70%, rgba(0, 0, 0, 0.8) 100%);
    pointer-events: none;
  }

  .ui {
    position: absolute;
    inset: 0;
    display: grid;
    align-content: end;
    justify-items: center;
    padding: 24px 16px 22px;
    pointer-events: none;
  }

  .panel {
    width: min(1040px, 100%);
    pointer-events: auto;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(12, 14, 26, 0.72) 0%, rgba(6, 7, 12, 0.68) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(10px);
    padding: 18px 18px 14px;
  }

  .topline {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .kicker {
    font-size: 12px;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: rgba(233, 236, 255, 0.75);
  }

  .facts {
    display: flex;
    gap: 12px;
    font-size: 12px;
    letter-spacing: 0.08em;
    color: rgba(233, 236, 255, 0.65);
  }

  .title {
    margin: 0 0 10px;
    font-size: clamp(28px, 3.6vw, 44px);
    line-height: 1.06;
    letter-spacing: -0.02em;
  }

  .copy {
    margin: 0 0 14px;
    max-width: 74ch;
    color: rgba(233, 236, 255, 0.82);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  @media (min-width: 860px) {
    .panel {
      padding: 20px 20px 16px;
    }

    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
  }

  .tile {
    display: grid;
    grid-template-columns: 58px 1fr;
    gap: 10px;
    align-items: center;
    padding: 10px;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
    border: 1px solid rgba(255, 255, 255, 0.09);
    text-decoration: none;
    color: inherit;
    transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
  }

  .tile:hover {
    transform: translateY(-1px);
    border-color: rgba(107, 230, 255, 0.28);
    background: linear-gradient(180deg, rgba(107, 230, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  }

  .thumb {
    width: 58px;
    height: 58px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .meta {
    min-width: 0;
  }

  .name {
    font-weight: 650;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .prize {
    font-size: 12px;
    margin-top: 2px;
    color: rgba(233, 236, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(body) {
    background: #050509;
    color: #e9ecff;
  }
</style>
