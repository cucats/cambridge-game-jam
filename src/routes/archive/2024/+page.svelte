<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Reflector } from "three/examples/jsm/objects/Reflector.js";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const projects = [
    { title: "Blight", href: "https://hex-26.itch.io/blight" },
    {
      title: "Reflect Upon Your Actions",
      href: "https://dylanmoss.itch.io/reflect-upon-you-actions",
    },
    { title: "Reflected", href: "https://ekorrette.itch.io/reflected" },
    { title: "Asymmetry", href: "https://alex-davies.itch.io/asymmetry" },
    {
      title: "Coulda Woulda Buddha",
      href: "https://greenwood672.itch.io/coulda-woulda-buddha",
    },
    { title: "All Submissions", href: "https://itch.io/jam/camgamejam2024" },
  ];

  let stage;

  onMount(() => {
    if (!stage) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#070a14");
    scene.fog = new THREE.Fog("#070a14", 8, 42);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 160);
    camera.position.set(0, 5.2, 14.5);
    camera.lookAt(0, 1.2, 0);

    scene.add(new THREE.AmbientLight("#cfe2ff", 0.35));

    const key = new THREE.DirectionalLight("#ffffff", 1.2);
    key.position.set(6, 10, 3);
    scene.add(key);

    const rim = new THREE.DirectionalLight("#a1b7ff", 0.6);
    rim.position.set(-8, 4, -6);
    scene.add(rim);

    const mirrorGeo = new THREE.PlaneGeometry(32, 32);
    const mirror = new Reflector(mirrorGeo, {
      clipBias: 0.003,
      textureWidth: Math.floor((window.innerWidth || 1024) * 1.5),
      textureHeight: Math.floor((window.innerHeight || 768) * 1.5),
      color: 0x0a0d18,
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = 0;
    scene.add(mirror);

    const addLowPoly = ({
      geometry,
      color,
      roughness,
      metalness,
      position,
      rotation,
      scale,
      jitter = 0.18,
    }) => {
      const g = geometry.toNonIndexed();
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(
          i,
          pos.getX(i) + (Math.random() - 0.5) * jitter,
          pos.getY(i) + (Math.random() - 0.5) * jitter,
          pos.getZ(i) + (Math.random() - 0.5) * jitter,
        );
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();

      const m = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.copy(position);
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      return mesh;
    };

    const group = new THREE.Group();
    scene.add(group);

    const palette = ["#7c5cff", "#59d7ff", "#ff4ecb", "#ffe7a8", "#9affc8"];
    const shards = [];
    for (let i = 0; i < 18; i++) {
      const g =
        i % 3 === 0
          ? new THREE.IcosahedronGeometry(1.2, 0)
          : i % 3 === 1
            ? new THREE.TetrahedronGeometry(1.25, 0)
            : new THREE.OctahedronGeometry(1.2, 0);

      const base = addLowPoly({
        geometry: g,
        color: palette[i % palette.length],
        roughness: 0.28,
        metalness: 0.55,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          1.2 + Math.random() * 5.2,
          (Math.random() - 0.5) * 10,
        ),
        rotation: new THREE.Vector3(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ),
        scale: 0.65 + Math.random() * 1.05,
        jitter: 0.22,
      });
      group.add(base);
      shards.push(base);
    }

    const horizon = addLowPoly({
      geometry: new THREE.IcosahedronGeometry(9.5, 0),
      color: "#0c1330",
      roughness: 0.95,
      metalness: 0.05,
      position: new THREE.Vector3(0, -6.5, -8),
      rotation: new THREE.Vector3(0.2, 0.8, 0),
      scale: 1,
      jitter: 0.4,
    });
    group.add(horizon);

    const grid = new THREE.GridHelper(40, 40, "#1a2247", "#0e1430");
    grid.position.y = 0.002;
    scene.add(grid);

    const clock = new THREE.Clock();

    const resize = () => {
      const w = stage.clientWidth || window.innerWidth || 1;
      const h = stage.clientHeight || window.innerHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    let targetLookX = 0;
    let targetLookY = 0;
    let lookX = 0;
    let lookY = 0;

    const onPointerMove = (e) => {
      const rect = stage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetLookX = nx * 0.55;
      targetLookY = -ny * 0.35;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let raf = 0;

    const renderOnce = () => {
      renderer.render(scene, camera);
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      lookX += (targetLookX - lookX) * 0.05;
      lookY += (targetLookY - lookY) * 0.05;

      camera.position.x = lookX * 2.2;
      camera.position.y = 5.2 + lookY * 1.2;
      camera.lookAt(0, 1.2, 0);

      group.rotation.y = t * 0.06;
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        s.rotation.x += 0.002 + (i % 5) * 0.00015;
        s.rotation.y += 0.0015 + (i % 7) * 0.00012;
        s.position.y += Math.sin(t * 0.7 + i) * 0.0018;
      }

      grid.material.opacity = 0.35 + Math.sin(t * 0.5) * 0.05;
      grid.material.transparent = true;

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      renderOnce();
    } else {
      tick();
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
      stage.removeChild(renderer.domElement);
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<div class="page">
  <div class="stage" bind:this={stage} aria-hidden="true"></div>

  <div class="veil" aria-hidden="true"></div>

  <main class="ui">
    <div class="hero">
      <div class="kicker">{duration}</div>
      <h1 class="title">{title}</h1>
      <div class="meta">
        <span class="pill">{theme}</span>
        <span class="pill">{submissions}</span>
      </div>
      <p class="lede">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </div>

    <section class="panel">
      <h2 class="panelTitle">Lorem ipsum</h2>
      <ul class="list">
        {#each projects as p (p.title)}
          <li class="item">
            <a class="link" href={p.href} rel="noreferrer" target="_blank"
              >{p.title}</a
            >
          </li>
        {/each}
      </ul>
      <p class="fine">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor.
      </p>
    </section>
  </main>
</div>

<style>
  .page {
    position: relative;
    min-height: 100vh;
    background: #070a14;
    overflow: hidden;
  }

  .stage {
    position: absolute;
    inset: 0;
  }

  .stage :global(canvas) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .veil {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        1200px 800px at 50% 10%,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0) 65%
      ),
      radial-gradient(
        900px 700px at 18% 62%,
        rgba(255, 78, 203, 0.16),
        rgba(255, 78, 203, 0) 58%
      ),
      radial-gradient(
        900px 700px at 84% 64%,
        rgba(89, 215, 255, 0.18),
        rgba(89, 215, 255, 0) 58%
      ),
      linear-gradient(
        180deg,
        rgba(7, 10, 20, 0.35),
        rgba(7, 10, 20, 0.82)
      );
    pointer-events: none;
  }

  .ui {
    position: relative;
    z-index: 1;
    max-width: 1080px;
    margin: 0 auto;
    padding: 56px 20px 36px;
    color: rgba(245, 247, 255, 0.92);
    font-family: var(--font-lexend, system-ui, -apple-system, Segoe UI, Roboto, Arial);
  }

  .hero {
    padding: 18px 0 22px;
  }

  .kicker {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 12px;
    color: rgba(193, 206, 255, 0.72);
    margin-bottom: 14px;
  }

  .title {
    margin: 0 0 14px;
    font-size: clamp(42px, 6vw, 74px);
    line-height: 0.98;
    letter-spacing: -0.03em;
    font-weight: 760;
  }

  .meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .pill {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
  }

  .lede {
    margin: 0;
    max-width: 68ch;
    font-size: 16px;
    line-height: 1.6;
    color: rgba(233, 238, 255, 0.84);
  }

  .panel {
    margin-top: 28px;
    padding: 18px 16px 14px;
    border-radius: 18px;
    background: rgba(10, 12, 24, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(14px);
  }

  .panelTitle {
    margin: 0 0 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(193, 206, 255, 0.8);
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }

  .item {
    margin: 0;
  }

  .link {
    display: block;
    padding: 12px 12px;
    border-radius: 14px;
    text-decoration: none;
    color: rgba(245, 247, 255, 0.92);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    transition:
      transform 120ms ease,
      background 120ms ease,
      border-color 120ms ease;
  }

  .link:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.075);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .fine {
    margin: 0 0 12px;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(193, 206, 255, 0.7);
  }

  @media (max-width: 520px) {
    .ui {
      padding-top: 44px;
    }
  }

  :global(body) {
    margin: 0;
    background: #070a14;
  }
</style>
