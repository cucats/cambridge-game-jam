<script>
  import { onMount } from "svelte";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const images = [
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

  let stageEl;

  onMount(() => {
    let raf = 0;
    let cleanup = () => {};

    const start = async () => {
      const [{ default: THREE }, { Reflector }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/objects/Reflector.js"),
      ]);

      if (!stageEl) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(stageEl.clientWidth, stageEl.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      stageEl.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050712);
      scene.fog = new THREE.Fog(0x050712, 7, 26);

      const camera = new THREE.PerspectiveCamera(
        42,
        stageEl.clientWidth / stageEl.clientHeight,
        0.1,
        120,
      );
      camera.position.set(0, 2.1, 10.2);

      const ambient = new THREE.AmbientLight(0xb7c2ff, 0.32);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffffff, 1.25);
      key.position.set(4, 7, 2);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0x9dd3ff, 0.9);
      rim.position.set(-6, 3, -4);
      scene.add(rim);

      const accent = new THREE.PointLight(0x8a6cff, 18, 30, 2);
      accent.position.set(0, 2.5, 4);
      scene.add(accent);

      const root = new THREE.Group();
      scene.add(root);

      const mirror = new Reflector(new THREE.PlaneGeometry(18, 12), {
        textureWidth: 1024,
        textureHeight: 1024,
        color: 0x101424,
      });
      mirror.position.set(0, -1.15, -2.4);
      mirror.rotation.x = -Math.PI / 2.25;
      root.add(mirror);

      const shardGeo = new THREE.IcosahedronGeometry(1, 0);
      const shardMatA = new THREE.MeshStandardMaterial({
        color: 0xa7b7ff,
        roughness: 0.82,
        metalness: 0.28,
        flatShading: true,
      });
      const shardMatB = new THREE.MeshStandardMaterial({
        color: 0x9bf0ff,
        roughness: 0.72,
        metalness: 0.38,
        flatShading: true,
      });
      const shardMatC = new THREE.MeshStandardMaterial({
        color: 0xc69bff,
        roughness: 0.78,
        metalness: 0.32,
        flatShading: true,
      });

      const shards = new THREE.Group();
      shards.position.set(0, 0.35, -1.5);
      root.add(shards);

      const makeShard = (x, y, z, s, mat) => {
        const m = new THREE.Mesh(shardGeo, mat);
        m.position.set(x, y, z);
        m.scale.setScalar(s);
        m.rotation.set(
          (Math.random() - 0.5) * 2.4,
          (Math.random() - 0.5) * 2.4,
          (Math.random() - 0.5) * 2.4,
        );
        shards.add(m);
        return m;
      };

      const shardList = [
        makeShard(-2.5, 0.1, 0.2, 1.55, shardMatA),
        makeShard(-1.1, 0.65, -0.7, 1.15, shardMatB),
        makeShard(0.2, 0.2, 0.1, 1.75, shardMatC),
        makeShard(1.6, 0.75, -0.8, 1.25, shardMatA),
        makeShard(2.7, 0.2, 0.25, 1.45, shardMatB),
        makeShard(0.9, 1.35, 0.55, 0.85, shardMatC),
        makeShard(-0.8, 1.25, 0.55, 0.9, shardMatB),
      ];

      const floorGeo = new THREE.PlaneGeometry(34, 24, 2, 2);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x070a18,
        roughness: 0.96,
        metalness: 0.05,
        flatShading: true,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.set(0, -1.6, -3);
      floor.rotation.x = -Math.PI / 2;
      root.add(floor);

      const backdropGeo = new THREE.PlaneGeometry(60, 30, 1, 1);
      const backdropMat = new THREE.MeshStandardMaterial({
        color: 0x040614,
        roughness: 1,
        metalness: 0,
        flatShading: true,
      });
      const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
      backdrop.position.set(0, 6.5, -18);
      root.add(backdrop);

      let mx = 0;
      let my = 0;

      const onPointerMove = (e) => {
        const rect = stageEl.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mx = (x - 0.5) * 2;
        my = (y - 0.5) * 2;
      };

      stageEl.addEventListener("pointermove", onPointerMove, { passive: true });

      const onResize = () => {
        if (!stageEl) return;
        const w = stageEl.clientWidth;
        const h = stageEl.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      window.addEventListener("resize", onResize, { passive: true });

      const reduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const clock = new THREE.Clock();
      const baseCam = new THREE.Vector3(0, 2.1, 10.2);
      const lookAt = new THREE.Vector3(0, 0.55, -1.45);

      const tick = () => {
        const t = clock.getElapsedTime();

        const sway = reduced ? 0 : 0.65;
        camera.position.x = baseCam.x + mx * 0.55 * sway;
        camera.position.y = baseCam.y + -my * 0.32 * sway + Math.sin(t * 0.35) * 0.05;
        camera.position.z = baseCam.z + Math.cos(t * 0.25) * 0.06;
        camera.lookAt(lookAt);

        shards.rotation.y = t * 0.18;
        shards.rotation.x = Math.sin(t * 0.22) * 0.06;
        shards.position.y = 0.35 + Math.sin(t * 0.5) * 0.08;

        for (let i = 0; i < shardList.length; i += 1) {
          const s = shardList[i];
          s.rotation.y += 0.003 + i * 0.00035;
          s.rotation.x += 0.0015 + i * 0.00022;
        }

        accent.position.x = Math.sin(t * 0.7) * 2.2;
        accent.position.z = 4 + Math.cos(t * 0.6) * 0.9;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };

      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        stageEl?.removeEventListener("pointermove", onPointerMove);
        renderer.dispose();

        const disposeMaterial = (m) => {
          if (!m) return;
          if (Array.isArray(m)) {
            for (const mm of m) disposeMaterial(mm);
            return;
          }
          if (m.map) m.map.dispose();
          if (m.normalMap) m.normalMap.dispose();
          if (m.roughnessMap) m.roughnessMap.dispose();
          if (m.metalnessMap) m.metalnessMap.dispose();
          if (m.emissiveMap) m.emissiveMap.dispose();
          m.dispose();
        };

        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) disposeMaterial(o.material);
        });

        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    };

    start();
    return () => cleanup();
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page">
  <div class="stage" bind:this={stageEl}></div>

  <div class="chrome">
    <div class="panel">
      <div class="brand">
        <img class="logo" src="/2024/logo.png" alt="Cambridge Game Jam Logo" />
        <div class="titles">
          <h1 class="h1">{title}</h1>
          <div class="meta">
            <span class="pill">{duration}</span>
            <span class="pill">{theme}</span>
            <span class="pill">{submissions} Submissions</span>
          </div>
        </div>
      </div>

      <div class="copy">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <div class="grid">
        {#each images as item}
          <a class="card" href={item.link}>
            <div class="thumb">
              <img src={item.src} alt={item.alt} />
            </div>
            <div class="cardText">
              <div class="cardTitle">{item.title}</div>
              {#if item.prize}
                <div class="cardSub">{item.prize}</div>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .page {
    position: relative;
    min-height: 100svh;
    background: #050712;
    color: rgba(244, 247, 255, 0.92);
    overflow: hidden;
  }

  .stage {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .chrome {
    position: relative;
    min-height: 100svh;
    display: grid;
    place-items: center;
    padding: 24px;
  }

  .panel {
    width: min(1100px, 100%);
    border-radius: 28px;
    background: linear-gradient(
      135deg,
      rgba(8, 10, 28, 0.78),
      rgba(10, 18, 40, 0.46)
    );
    border: 1px solid rgba(166, 189, 255, 0.16);
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(120, 152, 255, 0.06) inset;
    backdrop-filter: blur(18px) saturate(135%);
    -webkit-backdrop-filter: blur(18px) saturate(135%);
    padding: clamp(18px, 3vw, 28px);
  }

  .brand {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 18px;
    align-items: center;
  }

  .logo {
    width: clamp(78px, 10vw, 108px);
    height: clamp(78px, 10vw, 108px);
    object-fit: contain;
    filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.35));
  }

  .titles {
    min-width: 0;
  }

  .h1 {
    font-size: clamp(26px, 3.2vw, 46px);
    line-height: 1.06;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(175, 195, 255, 0.16);
    background: rgba(6, 8, 20, 0.55);
    color: rgba(245, 248, 255, 0.9);
    font-size: 13px;
    letter-spacing: 0.02em;
  }

  .copy {
    margin-top: 18px;
    max-width: 72ch;
    color: rgba(232, 240, 255, 0.84);
  }

  .copy p {
    margin: 0;
    line-height: 1.55;
  }

  .grid {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
  }

  .card {
    grid-column: span 6;
    display: grid;
    grid-template-columns: 108px 1fr;
    gap: 12px;
    align-items: center;
    border-radius: 18px;
    border: 1px solid rgba(176, 195, 255, 0.14);
    background: rgba(5, 7, 18, 0.58);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition:
      transform 140ms ease,
      border-color 140ms ease,
      background 140ms ease;
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: rgba(176, 210, 255, 0.24);
    background: rgba(7, 10, 24, 0.68);
  }

  .thumb {
    width: 108px;
    height: 82px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(20, 34, 72, 0.55), rgba(10, 12, 26, 0.2));
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: saturate(1.05) contrast(1.02);
  }

  .cardText {
    padding-right: 14px;
    min-width: 0;
  }

  .cardTitle {
    font-size: 14px;
    font-weight: 650;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cardSub {
    margin-top: 4px;
    font-size: 12px;
    color: rgba(232, 240, 255, 0.76);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 860px) {
    .brand {
      grid-template-columns: 1fr;
      justify-items: start;
    }

    .card {
      grid-column: span 12;
      grid-template-columns: 96px 1fr;
    }

    .thumb {
      width: 96px;
    }
  }
</style>
