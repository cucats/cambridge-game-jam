<script>
  import { onMount } from "svelte";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

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

  let stage;

  onMount(() => {
    let alive = true;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { Reflector } = await import(
        "three/examples/jsm/objects/Reflector.js"
      );

      if (!alive || !stage) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x07070b, 0.06);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      const setSize = () => {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        return { width, height };
      };

      const { width, height } = setSize();
      stage.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
      camera.position.set(0, 3.2, 10.5);

      const key = new THREE.DirectionalLight(0xffffff, 1.1);
      key.position.set(6, 10, 4);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0x86b9ff, 0.55);
      fill.position.set(-8, 4, -5);
      scene.add(fill);

      const rim = new THREE.PointLight(0xff4fd8, 1.2, 30);
      rim.position.set(0, 2.5, -7);
      scene.add(rim);

      const ambient = new THREE.AmbientLight(0x2f3140, 0.65);
      scene.add(ambient);

      const mirrorGeometry = new THREE.PlaneGeometry(34, 34);
      const mirror = new Reflector(mirrorGeometry, {
        textureWidth: Math.max(
          256,
          Math.floor(width * renderer.getPixelRatio()),
        ),
        textureHeight: Math.max(
          256,
          Math.floor(height * renderer.getPixelRatio()),
        ),
        color: 0x0a0a10,
      });
      mirror.rotation.x = -Math.PI / 2;
      mirror.position.y = -0.35;
      scene.add(mirror);

      const platformGeo = new THREE.CircleGeometry(7.5, 10);
      const platformMat = new THREE.MeshStandardMaterial({
        color: 0x0b0d13,
        roughness: 0.35,
        metalness: 0.45,
        flatShading: true,
      });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.rotation.x = -Math.PI / 2;
      platform.position.y = -0.34;
      platform.receiveShadow = true;
      scene.add(platform);

      const group = new THREE.Group();
      scene.add(group);

      const palette = [0xb3f0ff, 0xff6bd6, 0xffffff, 0x7c8dff, 0x2ae8b8];

      const mkMat = (hex, r, m) =>
        new THREE.MeshStandardMaterial({
          color: hex,
          roughness: r,
          metalness: m,
          flatShading: true,
        });

      const shardGeo = new THREE.IcosahedronGeometry(1.15, 0);
      const coreGeo = new THREE.DodecahedronGeometry(1.5, 0);

      const core = new THREE.Mesh(coreGeo, mkMat(0xffffff, 0.2, 0.7));
      core.position.set(0, 1.35, 0);
      group.add(core);

      const shards = [];
      for (let i = 0; i < 14; i++) {
        const mat = mkMat(
          palette[i % palette.length],
          0.28 + (i % 3) * 0.12,
          0.45 + (i % 4) * 0.1,
        );
        const mesh = new THREE.Mesh(shardGeo, mat);
        const angle = (i / 14) * Math.PI * 2;
        const radius = 3.2 + (i % 3) * 0.45;
        mesh.position.set(
          Math.cos(angle) * radius,
          0.75 + (i % 4) * 0.35,
          Math.sin(angle) * radius,
        );
        mesh.rotation.set(
          (i * 0.37) % Math.PI,
          (i * 0.21) % Math.PI,
          (i * 0.13) % Math.PI,
        );
        mesh.scale.setScalar(0.65 + (i % 5) * 0.08);
        group.add(mesh);
        shards.push(mesh);
      }

      const backdropGeo = new THREE.OctahedronGeometry(8.5, 0);
      const backdropMat = new THREE.MeshStandardMaterial({
        color: 0x0c1022,
        roughness: 0.9,
        metalness: 0,
        flatShading: true,
        side: THREE.BackSide,
      });
      const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
      backdrop.position.set(0, 3.2, -3);
      scene.add(backdrop);

      let pointerX = 0;
      let pointerY = 0;

      const onPointerMove = (e) => {
        const rect = stage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        pointerX = (x - 0.5) * 2;
        pointerY = (y - 0.5) * 2;
      };

      const onResize = () => {
        const { width: w, height: h } = setSize();
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      stage.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });

      const clock = new THREE.Clock();
      let raf = 0;

      const renderOnce = () => {
        renderer.render(scene, camera);
      };

      const tick = () => {
        const t = clock.getElapsedTime();
        const sway = Math.sin(t * 0.7) * 0.12;
        const yaw = t * 0.15;

        group.rotation.y = yaw;
        group.rotation.x = sway * 0.4;

        core.rotation.y = -yaw * 1.4;
        core.rotation.x = Math.cos(t * 0.9) * 0.25;

        for (let i = 0; i < shards.length; i++) {
          const s = shards[i];
          s.rotation.x += 0.004 + (i % 3) * 0.001;
          s.rotation.y += 0.003 + (i % 4) * 0.001;
          s.position.y =
            0.75 +
            (i % 4) * 0.35 +
            Math.sin(t * 1.2 + i) * 0.06;
        }

        camera.position.x += ((pointerX * 1.4) - camera.position.x) * 0.035;
        camera.position.y +=
          ((3.2 + pointerY * -0.9) - camera.position.y) * 0.035;
        camera.lookAt(0, 1.0, 0);

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };

      if (prefersReducedMotion) renderOnce();
      else raf = requestAnimationFrame(tick);

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        stage.removeEventListener("pointermove", onPointerMove);
        mirrorGeometry.dispose();
        platformGeo.dispose();
        shardGeo.dispose();
        coreGeo.dispose();
        backdropGeo.dispose();
        platformMat.dispose();
        backdropMat.dispose();
        core.material.dispose();
        for (const s of shards) s.material.dispose();
        renderer.dispose();
        renderer.domElement?.remove();
      };
    })();

    return () => {
      alive = false;
      cleanup();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<section class="page">
  <div class="stage" bind:this={stage} aria-label={title}></div>

  <div class="chrome">
    <div class="top">
      <img src="/2024/logo.png" alt="Cambridge Game Jam Logo" class="logo" />
      <div class="titles">
        <div class="kicker">{theme}</div>
        <h1 class="h1">{title}</h1>
        <div class="meta">
          <span class="pill">{duration}</span>
          <a class="pill" href="https://itch.io/jam/camgamejam2024"
            >{submissions} Submissions</a
          >
        </div>
      </div>
    </div>

    <div class="grid">
      {#each projects as p (p.title)}
        <a class="card" href={p.link}>
          <img class="thumb" src={p.src} alt={p.alt} loading="lazy" />
          <div class="cardText">
            <div class="cardTitle">{p.title}</div>
            {#if p.prize}
              <div class="cardPrize">{p.prize}</div>
            {/if}
          </div>
        </a>
      {/each}
    </div>

    <div class="lorem">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
  </div>
</section>

<style>
  .page {
    min-height: 100svh;
    background: radial-gradient(1200px 800px at 20% 15%, rgba(255, 107, 214, 0.18), rgba(0, 0, 0, 0) 55%),
      radial-gradient(1200px 800px at 70% 30%, rgba(179, 240, 255, 0.16), rgba(0, 0, 0, 0) 60%),
      radial-gradient(900px 700px at 60% 90%, rgba(124, 141, 255, 0.16), rgba(0, 0, 0, 0) 55%),
      linear-gradient(180deg, #05060a 0%, #05060a 45%, #040409 100%);
    color: rgba(245, 247, 255, 0.92);
    overflow: hidden;
    position: relative;
  }

  .stage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .chrome {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(18px, 3.5vw, 44px);
  }

  .top {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: clamp(14px, 2.2vw, 24px);
    align-items: center;
    padding-top: clamp(6px, 1.8vw, 16px);
  }

  .logo {
    width: clamp(84px, 11vw, 132px);
    height: auto;
    filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.7));
  }

  .kicker {
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 650;
    font-size: 0.82rem;
    color: rgba(179, 240, 255, 0.92);
  }

  .h1 {
    font-size: clamp(2rem, 5vw, 3.4rem);
    line-height: 1.02;
    letter-spacing: -0.02em;
    margin: 0.35rem 0 0.65rem;
    text-shadow: 0 22px 60px rgba(0, 0, 0, 0.72);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    align-items: center;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 0.85rem;
    border-radius: 9999px;
    text-decoration: none;
    color: rgba(245, 247, 255, 0.92);
    background: rgba(12, 12, 20, 0.6);
    border: 1px solid rgba(179, 240, 255, 0.18);
    box-shadow: 0 22px 60px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(12px);
  }

  .pill:hover {
    border-color: rgba(179, 240, 255, 0.34);
    background: rgba(12, 12, 20, 0.74);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(12px, 2vw, 18px);
    margin-top: clamp(22px, 4vw, 44px);
  }

  .card {
    grid-column: span 6;
    position: relative;
    border-radius: 18px;
    overflow: hidden;
    text-decoration: none;
    border: 1px solid rgba(245, 247, 255, 0.12);
    background: rgba(10, 10, 16, 0.62);
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(14px);
    min-height: 170px;
  }

  .card:hover {
    border-color: rgba(179, 240, 255, 0.3);
  }

  .thumb {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.03);
    opacity: 0.72;
    filter: saturate(1.05) contrast(1.05);
  }

  .cardText {
    position: relative;
    padding: 16px 16px 18px;
    display: grid;
    gap: 8px;
    background: linear-gradient(180deg, rgba(10, 10, 16, 0) 0%, rgba(10, 10, 16, 0.62) 38%, rgba(10, 10, 16, 0.88) 100%);
    min-height: 170px;
    align-content: end;
  }

  .cardTitle {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: rgba(245, 247, 255, 0.95);
    text-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
  }

  .cardPrize {
    font-size: 0.95rem;
    color: rgba(179, 240, 255, 0.92);
    letter-spacing: 0.01em;
    text-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
  }

  .lorem {
    margin-top: clamp(18px, 3vw, 26px);
    max-width: 70ch;
    color: rgba(245, 247, 255, 0.72);
    font-size: 0.98rem;
    line-height: 1.6;
    text-shadow: 0 18px 50px rgba(0, 0, 0, 0.7);
  }

  @media (max-width: 900px) {
    .card {
      grid-column: span 12;
    }
  }

  @media (max-width: 560px) {
    .top {
      grid-template-columns: 1fr;
      text-align: left;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pill,
    .card {
      transition: none;
    }
  }
</style>
