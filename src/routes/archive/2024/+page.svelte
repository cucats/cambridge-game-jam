<script>
  import { onDestroy, onMount } from "svelte";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const theme = "Reflection";

  const projects = [
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

  let mountEl;
  let raf = 0;

  onMount(async () => {
    if (!mountEl) return;

    const THREE = await import("three");
    const { Reflector } = await import("three/examples/jsm/objects/Reflector.js");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040408, 0.055);

    const camera = new THREE.PerspectiveCamera(
      48,
      mountEl.clientWidth / mountEl.clientHeight,
      0.1,
      80,
    );
    camera.position.set(0, 2.2, 9);

    const hemi = new THREE.HemisphereLight(0x9aa7ff, 0x05040a, 0.85);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(7, 10, 6);
    key.castShadow = false;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x8b5cf6, 0.65);
    rim.position.set(-8, 4, -10);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const palette = [0x60a5fa, 0x8b5cf6, 0x22c55e, 0xf472b6, 0xf97316];
    const makeLowPoly = (color, scale, x, y, z, rotX, rotY) => {
      const geo = new THREE.IcosahedronGeometry(1, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.92,
        metalness: 0.12,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(scale);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rotX, rotY, 0);
      group.add(mesh);
      return mesh;
    };

    const meshes = [
      makeLowPoly(palette[0], 1.45, -2.3, 0.6, 0.0, 0.4, 0.2),
      makeLowPoly(palette[1], 1.05, 0.2, 0.2, -1.4, -0.1, 0.9),
      makeLowPoly(palette[2], 0.95, 2.1, 0.35, 0.2, 0.7, -0.3),
      makeLowPoly(palette[3], 0.7, -0.9, 0.15, 1.8, -0.6, 0.35),
      makeLowPoly(palette[4], 0.85, 1.1, 0.1, 2.2, 0.25, -0.8),
    ];

    const mirrorGeo = new THREE.PlaneGeometry(22, 22);
    const mirror = new Reflector(mirrorGeo, {
      clipBias: 0.003,
      textureWidth: Math.floor(mountEl.clientWidth * renderer.getPixelRatio()),
      textureHeight: Math.floor(mountEl.clientHeight * renderer.getPixelRatio()),
      color: 0x1a1623,
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = -1.15;
    scene.add(mirror);

    const underlay = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      new THREE.MeshStandardMaterial({
        color: 0x05040a,
        roughness: 1,
        metalness: 0,
      }),
    );
    underlay.rotation.x = -Math.PI / 2;
    underlay.position.y = -1.18;
    scene.add(underlay);

    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 20),
      new THREE.MeshStandardMaterial({
        color: 0x070614,
        roughness: 1,
        metalness: 0,
      }),
    );
    backdrop.position.set(0, 5, -14);
    scene.add(backdrop);

    let pointerX = 0;
    let pointerY = 0;
    const onPointer = (e) => {
      const rect = mountEl.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const ro = new ResizeObserver(() => {
      if (!mountEl) return;
      const w = mountEl.clientWidth;
      const h = mountEl.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mountEl);

    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();

      group.rotation.y = Math.sin(t * 0.18) * 0.12;
      for (let i = 0; i < meshes.length; i += 1) {
        const m = meshes[i];
        m.rotation.x += 0.004 + i * 0.00045;
        m.rotation.y += 0.0035 + i * 0.00035;
        m.position.y = 0.28 + Math.sin(t * (0.8 + i * 0.07) + i) * 0.14;
      }

      const targetX = pointerX * 0.9;
      const targetY = 2.2 + -pointerY * 0.55;
      camera.position.x += (targetX - camera.position.x) * 0.035;
      camera.position.y += (targetY - camera.position.y) * 0.035;
      camera.lookAt(0, 0.4, 0);

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    onDestroy(() => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      renderer.dispose();
      mirrorGeo.dispose();
      underlay.geometry.dispose();
      underlay.material.dispose();
      backdrop.geometry.dispose();
      backdrop.material.dispose();
      for (const m of meshes) {
        m.geometry.dispose();
        m.material.dispose();
      }
      mountEl?.removeChild(renderer.domElement);
    });
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page">
  <div class="stage" bind:this={mountEl}></div>

  <div class="overlay">
    <header class="hero">
      <h1 class="title">{title}</h1>
      <p class="meta">{duration}</p>
      <p class="meta">{theme}</p>
      <p class="lorem">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.
      </p>
    </header>

    <section class="grid" aria-label="Lorem ipsum">
      {#each projects as project}
        <a class="card" href={project.link}>
          <img class="thumb" src={project.src} alt={project.title} />
          <div class="label">{project.title}</div>
        </a>
      {/each}
    </section>
  </div>
</div>

<style>
  .page {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: radial-gradient(1200px 600px at 50% 25%, #20133a 0%, #05040a 55%, #020106 100%);
    overflow: hidden;
  }

  .stage {
    position: absolute;
    inset: 0;
  }

  .overlay {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: grid;
    align-content: start;
    gap: 22px;
    padding: clamp(18px, 4vw, 44px);
    color: rgba(255, 255, 255, 0.92);
  }

  .hero {
    max-width: 860px;
    padding: 18px 18px 16px;
    border-radius: 18px;
    background: rgba(8, 6, 18, 0.44);
    backdrop-filter: blur(12px) saturate(110%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 22px 70px rgba(0, 0, 0, 0.55);
  }

  .title {
    font-size: clamp(36px, 5vw, 60px);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
  }

  .meta {
    margin: 0;
    font-size: 16px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.72);
  }

  .lorem {
    margin: 14px 0 0;
    max-width: 64ch;
    color: rgba(255, 255, 255, 0.78);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 14px;
    align-items: stretch;
  }

  .card {
    grid-column: span 6;
    display: grid;
    grid-template-rows: 1fr auto;
    border-radius: 16px;
    overflow: hidden;
    text-decoration: none;
    background: rgba(7, 6, 20, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
    transform: translateZ(0);
    transition: transform 140ms ease, border-color 140ms ease;
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.22);
  }

  .thumb {
    width: 100%;
    height: 220px;
    object-fit: cover;
    display: block;
    filter: saturate(1.05) contrast(1.05);
  }

  .label {
    padding: 12px 14px;
    font-size: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.86);
  }

  @media (min-width: 900px) {
    .card {
      grid-column: span 4;
    }

    .thumb {
      height: 210px;
    }
  }
</style>
