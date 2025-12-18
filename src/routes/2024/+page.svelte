<script>
  import { onDestroy, onMount } from "svelte";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const projects = [
    {
      src: "/2024/blight.png",
      alt: "Blight",
      href: "https://hex-26.itch.io/blight",
      title: "Blight",
      prize: "Most Popular and Best Gameplay",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      alt: "Reflect Upon Your Actions",
      href: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular and Most Original",
    },
    {
      src: "/2024/reflected.png",
      alt: "Reflected",
      href: "https://ekorrette.itch.io/reflected",
      title: "Reflected",
      prize: "Theme Winner",
    },
    {
      src: "/2024/asymmetry.png",
      alt: "Asymmetry",
      href: "https://alex-davies.itch.io/asymmetry",
      title: "Asymmetry",
      prize: "Best Gameplay",
    },
    {
      src: "/2024/coulda-woulda-buddha.png",
      alt: "Coulda Woulda Buddha",
      href: "https://greenwood672.itch.io/coulda-woulda-buddha",
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
    },
    {
      src: "/2024/all-submissions.png",
      alt: "All Submissions",
      href: "https://itch.io/jam/camgamejam2024",
      title: "All Submissions",
      prize: "",
    },
  ];

  let mount;
  let raf = 0;
  let cleanup = () => {};

  onMount(() => {
    let disposed = false;

    (async () => {
      if (!mount) return;

      const THREE = await import("three");
      const { Reflector } = await import(
        "three/examples/jsm/objects/Reflector.js"
      );
      const { RoomEnvironment } = await import(
        "three/examples/jsm/environments/RoomEnvironment.js"
      );
      const { EffectComposer } = await import(
        "three/examples/jsm/postprocessing/EffectComposer.js"
      );
      const { RenderPass } = await import(
        "three/examples/jsm/postprocessing/RenderPass.js"
      );
      const { UnrealBloomPass } = await import(
        "three/examples/jsm/postprocessing/UnrealBloomPass.js"
      );
      const { AfterimagePass } = await import(
        "three/examples/jsm/postprocessing/AfterimagePass.js"
      );
      const { FilmPass } = await import(
        "three/examples/jsm/postprocessing/FilmPass.js"
      );
      const { GlitchPass } = await import(
        "three/examples/jsm/postprocessing/GlitchPass.js"
      );

      if (disposed) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x060611, 0.05);

      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 180);
      camera.position.set(0, 2.2, 8.2);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;

      const hemi = new THREE.HemisphereLight(0xb9c7ff, 0x0b0018, 0.85);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xffffff, 1.35);
      key.position.set(4.5, 7.5, 2.5);
      scene.add(key);

      const rim = new THREE.PointLight(0xff4fd8, 12, 30);
      rim.position.set(-5.8, 1.2, -4.2);
      scene.add(rim);

      const rim2 = new THREE.PointLight(0x54d6ff, 9, 30);
      rim2.position.set(6.8, 2.5, 5.8);
      scene.add(rim2);

      const mirrorFloor = new Reflector(new THREE.PlaneGeometry(26, 26), {
        clipBias: 0.003,
        textureWidth: Math.floor(
          (mount.clientWidth || 1) * (window.devicePixelRatio || 1)
        ),
        textureHeight: Math.floor(
          (mount.clientHeight || 1) * (window.devicePixelRatio || 1)
        ),
        color: 0x0a0a13,
      });
      mirrorFloor.rotation.x = -Math.PI / 2 + 0.08;
      mirrorFloor.position.y = -1.25;
      scene.add(mirrorFloor);

      const mirrorWall = new Reflector(new THREE.PlaneGeometry(18, 12), {
        clipBias: 0.003,
        textureWidth: Math.floor(
          (mount.clientWidth || 1) * (window.devicePixelRatio || 1)
        ),
        textureHeight: Math.floor(
          (mount.clientHeight || 1) * (window.devicePixelRatio || 1)
        ),
        color: 0x0b0b16,
      });
      mirrorWall.position.set(0, 2.2, -7.8);
      mirrorWall.rotation.y = Math.PI;
      mirrorWall.rotation.x = -0.06;
      scene.add(mirrorWall);

      const shardGroup = new THREE.Group();
      scene.add(shardGroup);

      const palette = [
        [0.9, 0.25, 0.62],
        [0.58, 0.28, 0.78],
        [0.54, 0.24, 0.92],
        [0.56, 0.22, 0.12],
        [0.63, 0.22, 0.46],
        [0.52, 0.18, 0.58],
      ];

      const colorize = (geometry) => {
        const g = geometry.toNonIndexed();
        const count = g.attributes.position.count;
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i += 3) {
          const pick = palette[(Math.random() * palette.length) | 0];
          const c = new THREE.Color().setHSL(pick[0], pick[1], pick[2]);
          for (let j = 0; j < 3; j += 1) {
            const k = (i + j) * 3;
            colors[k + 0] = c.r;
            colors[k + 1] = c.g;
            colors[k + 2] = c.b;
          }
        }

        g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        return g;
      };

      const shardMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        metalness: 0.92,
        roughness: 0.18,
        envMapIntensity: 1.15,
      });

      const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0x111124,
        flatShading: true,
        metalness: 0.7,
        roughness: 0.22,
        envMapIntensity: 1.0,
        emissive: 0x0a0018,
        emissiveIntensity: 0.35,
      });

      const core = new THREE.Mesh(
        colorize(new THREE.IcosahedronGeometry(1.7, 0)),
        coreMaterial
      );
      core.position.set(0, 0.9, 0.2);
      shardGroup.add(core);

      const shards = [];
      const shardCount = prefersReducedMotion ? 60 : 180;

      for (let i = 0; i < shardCount; i += 1) {
        const scale = 0.12 + Math.random() * 0.85;
        const t = Math.random();
        const geo =
          t < 0.34
            ? new THREE.TetrahedronGeometry(1, 0)
            : t < 0.67
              ? new THREE.OctahedronGeometry(1, 0)
              : new THREE.IcosahedronGeometry(1, 0);

        const mesh = new THREE.Mesh(colorize(geo), shardMaterial);

        const ring = 3.1 + Math.random() * 7.8;
        const ang = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.1) * 4.2;

        mesh.position.set(
          Math.cos(ang) * ring,
          y,
          Math.sin(ang) * ring * 0.72
        );

        mesh.scale.setScalar(scale);
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        mesh.userData = {
          base: mesh.position.clone(),
          drift: new THREE.Vector3(
            (Math.random() - 0.5) * 0.7,
            (Math.random() - 0.5) * 0.55,
            (Math.random() - 0.5) * 0.7
          ),
          spin: new THREE.Vector3(
            (Math.random() - 0.5) * 1.8,
            (Math.random() - 0.5) * 2.4,
            (Math.random() - 0.5) * 1.6
          ),
          phase: Math.random() * Math.PI * 2,
          amp: 0.08 + Math.random() * 0.42,
        };

        shardGroup.add(mesh);
        shards.push(mesh);
      }

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        0.95,
        0.95,
        0.25
      );
      composer.addPass(bloom);

      const afterimage = new AfterimagePass();
      afterimage.uniforms["damp"].value = prefersReducedMotion ? 0.92 : 0.865;
      composer.addPass(afterimage);

      const film = new FilmPass(
        0.32,
        prefersReducedMotion ? 0.25 : 0.65,
        1800,
        false
      );
      composer.addPass(film);

      const glitch = new GlitchPass();
      glitch.goWild = false;
      composer.addPass(glitch);

      mount.appendChild(renderer.domElement);

      const pointer = { x: 0, y: 0, has: false };
      const onPointerMove = (e) => {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        pointer.has = true;
      };

      const onPointerLeave = () => {
        pointer.has = false;
      };

      const size = {
        w: 1,
        h: 1,
      };

      const setSize = () => {
        size.w = Math.max(1, mount.clientWidth | 0);
        size.h = Math.max(1, mount.clientHeight | 0);

        camera.aspect = size.w / size.h;
        camera.updateProjectionMatrix();

        renderer.setSize(size.w, size.h, false);
        composer.setSize(size.w, size.h);

        const px = Math.min(window.devicePixelRatio || 1, 2);
        const tw = Math.floor(size.w * px);
        const th = Math.floor(size.h * px);

        mirrorFloor.getRenderTarget().setSize(tw, th);
        mirrorWall.getRenderTarget().setSize(tw, th);
      };

      setSize();

      let t0 = performance.now();
      const tick = (t) => {
        if (disposed) return;

        const dt = Math.min(0.05, (t - t0) / 1000);
        t0 = t;

        const time = t * 0.001;
        const wobble = 0.12 + Math.sin(time * 0.7) * 0.09;

        const px = pointer.has ? pointer.x : Math.sin(time * 0.12) * 0.25;
        const py = pointer.has ? pointer.y : Math.cos(time * 0.1) * 0.2;

        const camRad = 8.2 + Math.sin(time * 0.35) * 0.45;
        const camAng = time * (prefersReducedMotion ? 0.12 : 0.22);

        camera.position.x =
          Math.cos(camAng) * camRad + px * (prefersReducedMotion ? 0.4 : 1.2);
        camera.position.z =
          Math.sin(camAng) * camRad + px * (prefersReducedMotion ? 0.2 : 0.9);
        camera.position.y =
          1.85 + Math.sin(time * 0.9) * 0.35 + py * 0.9;

        camera.lookAt(0, 0.9 + py * 0.65, 0);

        core.rotation.x += dt * 0.28;
        core.rotation.y += dt * 0.45;
        core.rotation.z += dt * 0.18;
        core.position.y = 0.9 + Math.sin(time * 1.7) * 0.12;

        mirrorFloor.rotation.z = Math.sin(time * 0.6) * 0.05;
        mirrorWall.rotation.y =
          Math.PI + Math.sin(time * 0.4 + 1.4) * 0.04;

        const pull = prefersReducedMotion ? 0.22 : 0.55;

        for (let i = 0; i < shards.length; i += 1) {
          const s = shards[i];
          const u = s.userData;

          s.rotation.x += dt * u.spin.x;
          s.rotation.y += dt * u.spin.y;
          s.rotation.z += dt * u.spin.z;

          const p = u.base;
          const k = u.phase;

          s.position.x =
            p.x + Math.sin(time * (0.7 + wobble) + k) * u.amp + u.drift.x * wobble;
          s.position.y =
            p.y + Math.cos(time * (0.85 + wobble) + k) * u.amp + u.drift.y;
          s.position.z =
            p.z + Math.sin(time * (0.6 + wobble) + k) * u.amp + u.drift.z * wobble;

          const toCenter = s.position.length();
          const press = Math.max(0, 1 - toCenter / 12);
          s.scale.setScalar(s.scale.x * (1 - dt * 0.08) + (0.12 + press) * dt * 0.08);

          s.position.x += px * pull * press * dt * 3.2;
          s.position.y += py * pull * press * dt * 2.4;
        }

        glitch.enabled = !prefersReducedMotion && Math.sin(time * 0.65) > 0.72;
        bloom.strength = 0.82 + Math.sin(time * 0.9) * 0.26;

        composer.render();
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);

      window.addEventListener("resize", setSize, { passive: true });
      mount.addEventListener("pointermove", onPointerMove, { passive: true });
      mount.addEventListener("pointerleave", onPointerLeave, { passive: true });

      cleanup = () => {
        window.removeEventListener("resize", setSize);
        mount?.removeEventListener("pointermove", onPointerMove);
        mount?.removeEventListener("pointerleave", onPointerLeave);

        cancelAnimationFrame(raf);

        composer?.dispose();
        pmrem?.dispose();
        envRT?.dispose();

        shardGroup.traverse((obj) => {
          if (!obj.isMesh) return;
          obj.geometry?.dispose?.();
          if (Array.isArray(obj.material)) {
            for (const m of obj.material) m?.dispose?.();
          } else {
            obj.material?.dispose?.();
          }
        });

        mirrorFloor.geometry.dispose();
        mirrorFloor.getRenderTarget().dispose();

        mirrorWall.geometry.dispose();
        mirrorWall.getRenderTarget().dispose();

        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  });

  onDestroy(() => {
    cleanup();
  });
</script>

<svelte:head>
  <title>{title} — {theme}</title>
  <meta name="description" content="Lorem ipsum dolor sit amet." />
</svelte:head>

<div class="stage">
  <div class="fx" bind:this={mount}></div>

  <div class="hud">
    <a class="ghost" href="/archive/2024" aria-label="Lorem ipsum">
      <img class="mark" src="/2024/logo.png" alt={title} />
    </a>

    <div class="hero">
      <div class="kicker">{duration}</div>
      <h1 class="title">{title}</h1>
      <div class="theme">{theme}</div>
      <div class="count">{submissions}</div>
      <div class="lorem">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </div>
    </div>

    <div class="rail">
      {#each projects as p (p.title)}
        <a class="card" href={p.href} target="_blank" rel="noreferrer">
          <img class="thumb" src={p.src} alt={p.alt} loading="lazy" />
          <div class="meta">
            <div class="name">{p.title}</div>
            {#if p.prize}
              <div class="prize">{p.prize}</div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  </div>

  <div class="grain" aria-hidden="true"></div>
  <div class="scan" aria-hidden="true"></div>
</div>

<style>
  :global(body) {
    margin: 0;
    background: radial-gradient(1200px 700px at 50% 10%, #1a1241 0%, #04040a 55%, #000 100%);
    color: #eef0ff;
    overflow-x: hidden;
  }

  :global(main.flex-1) {
    min-height: 100vh;
  }

  .stage {
    position: relative;
    width: 100vw;
    min-height: 100vh;
    isolation: isolate;
    overflow: hidden;
    background: radial-gradient(900px 500px at 50% 0%, rgba(167, 90, 255, 0.22) 0%, rgba(0, 0, 0, 0) 60%),
      radial-gradient(700px 460px at 0% 70%, rgba(72, 217, 255, 0.17) 0%, rgba(0, 0, 0, 0) 62%),
      radial-gradient(700px 460px at 100% 70%, rgba(255, 60, 204, 0.12) 0%, rgba(0, 0, 0, 0) 62%);
  }

  .fx {
    position: absolute;
    inset: -2vh -2vw;
    filter: saturate(1.08) contrast(1.1);
    transform: translate3d(0, 0, 0);
  }

  .hud {
    position: relative;
    z-index: 4;
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    padding: clamp(18px, 3vw, 36px);
  }

  .ghost {
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: transform 280ms cubic-bezier(0.2, 0.9, 0.2, 1),
      box-shadow 280ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  .ghost:hover {
    transform: translate3d(0, -2px, 0);
    box-shadow: 0 26px 80px rgba(0, 0, 0, 0.55);
  }

  .mark {
    width: 54px;
    height: 54px;
    object-fit: contain;
    filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.55));
  }

  .hero {
    margin-top: clamp(18px, 6vh, 70px);
    max-width: 980px;
  }

  .kicker {
    font-family: var(--font-ubuntu);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 12px;
    opacity: 0.85;
    display: inline-flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(84, 214, 255, 0.12), rgba(255, 79, 216, 0.12));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 70px rgba(0, 0, 0, 0.45);
    animation: pulse 3.2s ease-in-out infinite;
  }

  .title {
    margin: 18px 0 10px;
    font-size: clamp(40px, 6.5vw, 86px);
    line-height: 0.98;
    letter-spacing: -0.04em;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.06), 0 22px 80px rgba(0, 0, 0, 0.75);
    filter: drop-shadow(0 30px 120px rgba(92, 214, 255, 0.18));
    animation: titleJitter 6.5s steps(1, end) infinite;
  }

  .theme {
    font-family: var(--font-ubuntu);
    font-size: clamp(18px, 2vw, 26px);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.92;
    display: inline-block;
    padding: 10px 14px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 26px 90px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transform-origin: 0% 50%;
    animation: shear 4.8s ease-in-out infinite;
  }

  .count {
    margin-top: 18px;
    width: fit-content;
    font-family: var(--font-ubuntu);
    font-size: clamp(56px, 8vw, 120px);
    line-height: 0.9;
    letter-spacing: -0.03em;
    background: linear-gradient(90deg, rgba(84, 214, 255, 0.95), rgba(255, 79, 216, 0.85));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 30px 90px rgba(0, 0, 0, 0.65));
    animation: shimmer 2.8s linear infinite;
  }

  .lorem {
    margin-top: 14px;
    max-width: 58ch;
    font-size: 14px;
    line-height: 1.6;
    opacity: 0.8;
    padding: 14px 16px;
    border-radius: 18px;
    background: radial-gradient(800px 240px at 20% 0%, rgba(255, 79, 216, 0.12) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(0, 0, 0, 0) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 36px 140px rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .rail {
    margin-top: clamp(22px, 6vh, 70px);
    width: min(1180px, 100%);
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: clamp(10px, 1.2vw, 16px);
    align-content: start;
    padding-bottom: 40px;
  }

  .card {
    grid-column: span 12;
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.05));
    box-shadow: 0 34px 120px rgba(0, 0, 0, 0.65);
    transform: translate3d(0, 0, 0);
    transition: transform 260ms cubic-bezier(0.2, 0.9, 0.2, 1),
      box-shadow 260ms cubic-bezier(0.2, 0.9, 0.2, 1),
      filter 260ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  .card::before {
    content: "";
    position: absolute;
    inset: -40% -40%;
    background: conic-gradient(
      from 180deg,
      rgba(84, 214, 255, 0) 0deg,
      rgba(84, 214, 255, 0.35) 60deg,
      rgba(255, 79, 216, 0.35) 160deg,
      rgba(255, 79, 216, 0) 260deg,
      rgba(84, 214, 255, 0) 360deg
    );
    filter: blur(22px);
    opacity: 0.0;
    transition: opacity 240ms ease;
    pointer-events: none;
  }

  .card:hover {
    transform: translate3d(0, -3px, 0);
    box-shadow: 0 46px 160px rgba(0, 0, 0, 0.78);
    filter: saturate(1.08);
  }

  .card:hover::before {
    opacity: 0.55;
  }

  .thumb {
    width: 100%;
    height: clamp(170px, 28vw, 260px);
    object-fit: cover;
    display: block;
    filter: contrast(1.08) saturate(1.05);
  }

  .meta {
    position: absolute;
    inset: auto 0 0 0;
    padding: 14px 14px 16px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(2, 2, 6, 0.7) 45%, rgba(2, 2, 6, 0.85) 100%);
  }

  .name {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
    text-shadow: 0 16px 60px rgba(0, 0, 0, 0.85);
  }

  .prize {
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.85;
    text-shadow: 0 16px 60px rgba(0, 0, 0, 0.85);
  }

  @media (min-width: 860px) {
    .hud {
      grid-template-columns: minmax(0, 1fr);
      padding: clamp(24px, 4vw, 56px);
    }

    .card {
      grid-column: span 6;
    }

    .card:nth-child(1) {
      grid-column: span 7;
    }

    .card:nth-child(2) {
      grid-column: span 5;
    }

    .card:nth-child(3) {
      grid-column: span 4;
    }

    .card:nth-child(4) {
      grid-column: span 4;
    }

    .card:nth-child(5) {
      grid-column: span 4;
    }

    .card:nth-child(6) {
      grid-column: span 12;
    }
  }

  .grain {
    position: absolute;
    inset: -30%;
    z-index: 3;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.33'/%3E%3C/svg%3E");
    mix-blend-mode: overlay;
    opacity: 0.22;
    pointer-events: none;
    animation: drift 8.5s linear infinite;
  }

  .scan {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(84, 214, 255, 0.04) 0%,
      rgba(255, 79, 216, 0.02) 50%,
      rgba(84, 214, 255, 0.04) 100%
    );
    opacity: 0.75;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%);
    animation: scan 3.6s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
      filter: saturate(1);
    }
    50% {
      transform: translate3d(0, -1px, 0);
      filter: saturate(1.18);
    }
  }

  @keyframes shear {
    0%,
    100% {
      transform: perspective(900px) rotateY(0deg) rotateX(0deg) translate3d(0, 0, 0);
    }
    40% {
      transform: perspective(900px) rotateY(-9deg) rotateX(2deg) translate3d(0, -1px, 0);
    }
    70% {
      transform: perspective(900px) rotateY(7deg) rotateX(-1deg) translate3d(0, 1px, 0);
    }
  }

  @keyframes shimmer {
    0% {
      filter: hue-rotate(0deg) drop-shadow(0 30px 90px rgba(0, 0, 0, 0.65));
    }
    100% {
      filter: hue-rotate(360deg) drop-shadow(0 30px 90px rgba(0, 0, 0, 0.65));
    }
  }

  @keyframes drift {
    0% {
      transform: translate3d(-3%, -2%, 0);
    }
    100% {
      transform: translate3d(3%, 2%, 0);
    }
  }

  @keyframes scan {
    0%,
    100% {
      transform: translate3d(0, -2%, 0);
      opacity: 0.62;
    }
    50% {
      transform: translate3d(0, 2%, 0);
      opacity: 0.95;
    }
  }

  @keyframes titleJitter {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
      filter: none;
    }
    9% {
      transform: translate3d(1px, 0, 0);
      filter: drop-shadow(-12px 0 rgba(84, 214, 255, 0.22))
        drop-shadow(12px 0 rgba(255, 79, 216, 0.18));
    }
    10% {
      transform: translate3d(-1px, 0, 0);
    }
    11% {
      transform: translate3d(0, 0, 0);
      filter: none;
    }
    58% {
      transform: translate3d(0, 1px, 0);
      filter: drop-shadow(-14px 0 rgba(84, 214, 255, 0.18))
        drop-shadow(14px 0 rgba(255, 79, 216, 0.16));
    }
    59% {
      transform: translate3d(0, -1px, 0);
    }
    60% {
      transform: translate3d(0, 0, 0);
      filter: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .kicker,
    .title,
    .theme,
    .count,
    .grain,
    .scan {
      animation: none !important;
    }
  }
</style>
