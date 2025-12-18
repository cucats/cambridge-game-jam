<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Reflector } from "three/examples/jsm/objects/Reflector.js";

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

  let stage;
  let reduceMotion = false;

  onMount(() => {
    reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

    if (!stage) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070b, 0.08);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    stage.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0.0, 1.25, 4.5);

    const hemi = new THREE.HemisphereLight(0xaad7ff, 0x120013, 0.65);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3.5, 5.5, 2.0);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xff66cc, 0.7);
    rim.position.set(-4.0, 2.0, -3.0);
    scene.add(rim);

    const mirror = new Reflector(new THREE.PlaneGeometry(18, 18), {
      clipBias: 0.003,
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x0b0b12,
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = -0.9;
    scene.add(mirror);

    const group = new THREE.Group();
    scene.add(group);

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x93e6ff,
      metalness: 0.85,
      roughness: 0.22,
      flatShading: true,
    });

    const shadowMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d14,
      metalness: 0.2,
      roughness: 0.85,
      flatShading: true,
    });

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05, 0),
      baseMat
    );
    core.position.y = 0.2;
    group.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.06, 6, 28),
      shadowMat
    );
    ring.rotation.x = Math.PI / 2.6;
    ring.rotation.z = -0.4;
    ring.position.y = 0.2;
    group.add(ring);

    const shards = [];
    const shardGeo = new THREE.DodecahedronGeometry(0.18, 0);
    for (let i = 0; i < 30; i++) {
      const s = new THREE.Mesh(
        shardGeo,
        i % 3 === 0 ? shadowMat : baseMat
      );
      const a = (i / 30) * Math.PI * 2;
      const r = 2.35 + (i % 5) * 0.08;
      s.position.set(Math.cos(a) * r, (i % 7) * 0.08 - 0.05, Math.sin(a) * r);
      s.rotation.set(a, a * 0.6, a * 0.4);
      s.scale.setScalar(0.9 + (i % 4) * 0.08);
      shards.push(s);
      group.add(s);
    }

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x1b8cff, transparent: true, opacity: 0.08 })
    );
    glow.position.y = 0.28;
    group.add(glow);

    let raf = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      mirror.getRenderTarget().setSize(Math.floor(w * dpr), Math.floor(h * dpr));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    const animate = () => {
      const t = clock.getElapsedTime();
      if (!reduceMotion) {
        core.rotation.y = t * 0.55;
        core.rotation.x = Math.sin(t * 0.35) * 0.12;
        ring.rotation.y = t * 0.25;
        group.position.y = Math.sin(t * 0.9) * 0.06;
        for (let i = 0; i < shards.length; i++) {
          const s = shards[i];
          s.rotation.y += 0.002 + (i % 7) * 0.00025;
          s.rotation.x += 0.0012;
        }
        camera.position.x = Math.sin(t * 0.18) * 0.28;
        camera.position.z = 4.5 + Math.cos(t * 0.14) * 0.12;
        camera.lookAt(0, 0.1, 0);
      } else {
        camera.lookAt(0, 0.1, 0);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      stage.innerHTML = "";
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page">
  <div class="stage" bind:this={stage} aria-hidden="true"></div>

  <div class="overlay">
    <div class="frame">
      <div class="hero">
        <div class="heroText">
          <img class="logo" src="/2024/logo.png" alt={title} />
          <h1 class="title">{title}</h1>
          <div class="meta">
            <div class="metaLine">{theme}</div>
            <div class="metaLine">{duration}</div>
            <div class="metaLine">{submissions}</div>
          </div>
          <p class="lorem">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>

      <div class="grid">
        {#each images as item (item.title)}
          <a class="card" href={item.link} target="_blank" rel="noreferrer">
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
</div>

<style>
  .page {
    position: relative;
    min-height: 100vh;
    background: radial-gradient(1200px 800px at 15% 10%, #1b1b2d 0%, #07070b 55%, #030306 100%);
    overflow: hidden;
    color: #eef0ff;
  }

  .stage {
    position: absolute;
    inset: 0;
  }

  .overlay {
    position: relative;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 28px 16px 48px;
  }

  .frame {
    width: min(1100px, 100%);
  }

  .hero {
    display: grid;
    grid-template-columns: 1fr;
    align-items: end;
    gap: 18px;
    padding: 18px 18px 22px;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(15, 15, 25, 0.82), rgba(5, 5, 10, 0.58));
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px) saturate(120%);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    box-shadow: 0 30px 120px rgba(0, 0, 0, 0.55);
  }

  .heroText {
    display: grid;
    gap: 10px;
    justify-items: start;
  }

  .logo {
    width: 92px;
    height: auto;
    filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.55));
  }

  .title {
    font-size: clamp(34px, 4.2vw, 56px);
    line-height: 1.04;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .meta {
    display: grid;
    gap: 4px;
    font-family: var(--font-ubuntu);
    font-size: 15px;
    letter-spacing: 0.02em;
    opacity: 0.92;
  }

  .metaLine {
    display: inline-flex;
    gap: 10px;
    align-items: baseline;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.10);
    width: fit-content;
  }

  .lorem {
    margin: 0;
    color: rgba(238, 240, 255, 0.82);
    max-width: 62ch;
  }

  .grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 14px;
  }

  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 14px;
    align-items: center;
    padding: 12px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(20, 20, 34, 0.72), rgba(8, 8, 14, 0.56));
    border: 1px solid rgba(255, 255, 255, 0.10);
    text-decoration: none;
    color: inherit;
    box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45);
    transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: rgba(147, 230, 255, 0.35);
    background: linear-gradient(180deg, rgba(30, 30, 54, 0.76), rgba(10, 10, 18, 0.62));
  }

  .thumb {
    width: 120px;
    aspect-ratio: 1 / 1;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.10);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cardText {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .cardTitle {
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 18px;
    line-height: 1.1;
  }

  .cardPrize {
    font-family: var(--font-ubuntu);
    font-size: 13px;
    color: rgba(238, 240, 255, 0.78);
  }

  @media (min-width: 740px) {
    .overlay {
      padding: 44px 22px 70px;
    }

    .hero {
      padding: 22px 22px 26px;
    }

    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1040px) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .card {
      grid-template-columns: 1fr;
      align-items: start;
      gap: 10px;
    }

    .thumb {
      width: 100%;
      aspect-ratio: 16 / 9;
    }
  }
</style>
