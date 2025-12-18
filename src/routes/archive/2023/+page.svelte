<script>
  import { onDestroy, onMount } from "svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const featured = [
    {
      src: "/2023/inferno-rising.png",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote"
    },
    {
      src: "/2023/mayi-garden.png",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme"
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation"
    },
    {
      src: "/2023/beaneth-the-earth.png",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay"
    },
    {
      src: "/2023/deck-of-dwarves.png",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea"
    },
    {
      src: "/2023/all-submissions.png",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: ""
    }
  ];

  let container;
  let canvas;
  let cardsRoot;

  let webglOk = $state(true);
  let inView = $state(Array(featured.length).fill(false));

  let cleanup = () => {};

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a * (1 - t) + b * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const hash = (x, y, z) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const noise3 = (x, y, z) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const xf = x - xi;
    const yf = y - yi;
    const zf = z - zi;
    const u = smooth(xf);
    const v = smooth(yf);
    const w = smooth(zf);
    const n000 = hash(xi, yi, zi);
    const n100 = hash(xi + 1, yi, zi);
    const n010 = hash(xi, yi + 1, zi);
    const n110 = hash(xi + 1, yi + 1, zi);
    const n001 = hash(xi, yi, zi + 1);
    const n101 = hash(xi + 1, yi, zi + 1);
    const n011 = hash(xi, yi + 1, zi + 1);
    const n111 = hash(xi + 1, yi + 1, zi + 1);
    const x00 = mix(n000, n100, u);
    const x10 = mix(n010, n110, u);
    const x01 = mix(n001, n101, u);
    const x11 = mix(n011, n111, u);
    const y0 = mix(x00, x10, v);
    const y1 = mix(x01, x11, v);
    return mix(y0, y1, w);
  };

  onMount(() => {
    let mounted = true;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      webglOk = false;
      return;
    }

    void (async () => {
      const THREE = await import("three");
      if (!mounted) return;

      let renderer;
      let scene;
      let camera;
      let raf = 0;
      let disposed = false;

      let cave;
      let crystals;
      let motes;
      let portal;
      let portalMat;
      let time = 0;

      const pointer = { x: 0, y: 0 };
      const scroll = { y: 0 };

      const setPointer = (e) => {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        pointer.x = (e.clientX / w) * 2 - 1;
        pointer.y = (e.clientY / h) * 2 - 1;
      };

      const setScroll = () => {
        scroll.y = window.scrollY || 0;
      };

      const resize = () => {
        if (!container || !renderer || !camera) return;
        const r = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(r.width));
        const h = Math.max(1, Math.floor(r.height));
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (portalMat) portalMat.uniforms.uAspect.value = camera.aspect;
      };

      const init = () => {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x04060a, 0.075);

        camera = new THREE.PerspectiveCamera(58, 1, 0.05, 120);
        camera.position.set(0, 0.12, 6.2);

      const hemi = new THREE.HemisphereLight(0x0b2b3a, 0x020204, 0.7);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xcfefff, 0.55);
      key.position.set(2.5, 2.0, 2.0);
      scene.add(key);

      const ember = new THREE.PointLight(0xff7a2a, 1.15, 22, 2.1);
      ember.position.set(-1.5, -0.35, 2.8);
      scene.add(ember);

      const caveGeo = new THREE.CylinderGeometry(3.6, 3.9, 26, 128, 240, true);
      caveGeo.rotateX(Math.PI / 2);
      const pos = caveGeo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const r = Math.sqrt(v.x * v.x + v.y * v.y);
        const a = Math.atan2(v.y, v.x);
        const t0 = noise3(Math.cos(a) * 1.6 + 7.3, Math.sin(a) * 1.6 + 3.1, v.z * 0.16 + 1.2);
        const t1 = noise3(v.x * 0.35 + 9.1, v.y * 0.35 + 2.7, v.z * 0.09 + 4.2);
        const t2 = noise3(v.x * 0.9 + 1.7, v.y * 0.9 + 8.4, v.z * 0.22 + 5.6);
        const warp = (t0 * 0.55 + t1 * 0.35 + t2 * 0.1) - 0.52;
        const ridge = Math.pow(Math.abs(Math.sin(a * 6.0 + v.z * 0.28)), 1.6) * 0.08;
        const nr = r + warp * 0.95 + ridge;
        const k = nr / Math.max(0.001, r);
        v.x *= k;
        v.y *= k;
        const pinch = Math.sin(v.z * 0.33) * 0.12 + Math.sin(v.z * 0.92) * 0.06;
        v.x += v.x * pinch;
        v.y += v.y * pinch;
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      caveGeo.computeVertexNormals();

      const caveMat = new THREE.MeshStandardMaterial({
        color: 0x0a0c10,
        roughness: 1,
        metalness: 0,
        side: THREE.BackSide
      });
      cave = new THREE.Mesh(caveGeo, caveMat);
      cave.position.z = -9.5;
      scene.add(cave);

      const spireGeo = new THREE.ConeGeometry(0.15, 1.45, 9, 1);
      const spireMat = new THREE.MeshStandardMaterial({
        color: 0x07080b,
        roughness: 1,
        metalness: 0
      });
      const spires = new THREE.InstancedMesh(spireGeo, spireMat, 520);
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      const p = new THREE.Vector3();
      for (let i = 0; i < 520; i++) {
        const z = -24 + (i / 520) * 28;
        const a = (i * 0.61803398875) % (Math.PI * 2);
        const rr = 3.42 + (noise3(Math.cos(a) * 2.3, Math.sin(a) * 2.3, z * 0.2) - 0.5) * 0.75;
        const up = (hash(i * 2.7, 1.1, 0.7) > 0.52 ? 1 : -1) * (0.5 + hash(i * 8.2, 3.9, 2.6) * 0.5);
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        p.set(x, y, z);
        const n = new THREE.Vector3(x, y, 0).normalize();
        const dir = new THREE.Vector3(n.x, n.y, 0.35 * up).normalize();
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        const h = 0.25 + hash(i * 1.9, 5.1, 7.2) * 1.8;
        const w = 0.65 + hash(i * 7.7, 2.5, 6.3) * 0.55;
        s.set(0.85 * w, h, 0.85 * w);
        m.compose(p, q, s);
        spires.setMatrixAt(i, m);
      }
      spires.instanceMatrix.needsUpdate = true;
      spires.position.z = -9.5;
      scene.add(spires);

      const crystalGeo = new THREE.IcosahedronGeometry(0.16, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x133d4b,
        roughness: 0.3,
        metalness: 0.1,
        emissive: 0x1cffd8,
        emissiveIntensity: 0.9
      });
      crystals = new THREE.InstancedMesh(crystalGeo, crystalMat, 120);
      for (let i = 0; i < 120; i++) {
        const z = -23.5 + hash(i * 1.1, 2.2, 3.3) * 27.5;
        const a = hash(i * 4.2, 7.1, 1.9) * Math.PI * 2;
        const rr = 3.2 + hash(i * 9.2, 3.4, 6.7) * 0.55;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        p.set(x, y, z);
        const n = new THREE.Vector3(x, y, 0).normalize();
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(n.x, n.y, 0.15));
        const sc = 0.55 + hash(i * 3.8, 2.6, 9.9) * 1.4;
        s.setScalar(sc);
        m.compose(p, q, s);
        crystals.setMatrixAt(i, m);
      }
      crystals.instanceMatrix.needsUpdate = true;
      crystals.position.z = -9.5;
      scene.add(crystals);

      const motesCount = 2600;
      const motesGeo = new THREE.BufferGeometry();
      const motesPos = new Float32Array(motesCount * 3);
      const motesSeed = new Float32Array(motesCount);
      for (let i = 0; i < motesCount; i++) {
        const z = -24 + (i / motesCount) * 30;
        const a = hash(i * 1.7, 9.1, 0.3) * Math.PI * 2;
        const rr = Math.pow(hash(i * 8.9, 2.8, 6.1), 1.9) * 3.0;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr * 0.75;
        motesPos[i * 3 + 0] = x;
        motesPos[i * 3 + 1] = y;
        motesPos[i * 3 + 2] = z;
        motesSeed[i] = hash(i * 2.1, 4.4, 8.8);
      }
      motesGeo.setAttribute("position", new THREE.BufferAttribute(motesPos, 3));
      motesGeo.setAttribute("aSeed", new THREE.BufferAttribute(motesSeed, 1));
      const motesMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(2, window.devicePixelRatio || 1) }
        },
        vertexShader: `
          uniform float uTime;
          uniform float uPixelRatio;
          attribute float aSeed;
          varying float vSeed;
          void main() {
            vSeed = aSeed;
            vec3 p = position;
            float t = uTime * 0.7 + aSeed * 12.0;
            p.x += sin(t + p.z * 0.15) * 0.06;
            p.y += cos(t * 1.17 + p.z * 0.18) * 0.05;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float s = 9.0 + 11.0 * smoothstep(0.0, 1.0, fract(aSeed * 97.0));
            gl_PointSize = s * uPixelRatio * (1.0 / max(0.6, -mv.z));
          }
        `,
        fragmentShader: `
          precision highp float;
          varying float vSeed;
          void main() {
            vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
            float d = dot(uv, uv);
            float a = exp(-d * 2.6);
            vec3 c0 = vec3(0.10, 0.95, 0.85);
            vec3 c1 = vec3(1.00, 0.56, 0.18);
            float m = smoothstep(0.1, 0.95, fract(vSeed * 19.0));
            vec3 col = mix(c0, c1, m);
            gl_FragColor = vec4(col, a * 0.42);
          }
        `
      });
      motes = new THREE.Points(motesGeo, motesMat);
      motes.position.z = -9.5;
      scene.add(motes);

      portalMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uStrength: { value: 1 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          uniform float uTime;
          uniform float uAspect;
          uniform float uStrength;
          varying vec2 vUv;
          float h(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float n(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            float a = h(i);
            float b = h(i + vec2(1.0, 0.0));
            float c = h(i + vec2(0.0, 1.0));
            float d = h(i + vec2(1.0, 1.0));
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
          }
          float fbm(vec2 p) {
            float s = 0.0;
            float a = 0.55;
            mat2 m = mat2(1.6, -1.2, 1.2, 1.6);
            for (int i = 0; i < 5; i++) {
              s += a * n(p);
              p = m * p;
              a *= 0.55;
            }
            return s;
          }
          void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            uv.x *= uAspect;
            float r = length(uv);
            float rim = smoothstep(0.98, 0.45, r);
            float core = smoothstep(0.55, 0.0, r);
            float t = uTime * 0.22;
            vec2 p = uv * 1.4;
            p += vec2(cos(t * 2.3), sin(t * 1.9)) * 0.18;
            float f = fbm(p * 2.0 + t);
            float g = fbm(p * 3.6 - t * 1.7);
            float swirl = sin((f + g) * 7.0 + t * 9.0) * 0.5 + 0.5;
            vec3 c0 = vec3(0.10, 0.95, 0.85);
            vec3 c1 = vec3(0.95, 0.58, 0.20);
            vec3 col = mix(c0, c1, swirl);
            col *= 0.35 + 0.95 * core;
            col += vec3(0.2, 0.5, 0.9) * rim * 0.25;
            float alpha = (0.15 + 0.85 * core) * rim * uStrength;
            gl_FragColor = vec4(col, alpha);
          }
        `
      });
      portal = new THREE.Mesh(new THREE.CircleGeometry(1.45, 96), portalMat);
      portal.position.set(0.0, -0.05, -10.8);
      scene.add(portal);

        resize();
      };

      const tick = () => {
        if (disposed) return;
        time += 0.016;

        const t = performance.now() * 0.001;
        const driftX = Math.sin(t * 0.47) * 0.06;
        const driftY = Math.cos(t * 0.41) * 0.04;

        const targetZ = clamp(6.2 - scroll.y * 0.008, -5.2, 6.2);
        camera.position.z = mix(camera.position.z, targetZ, 0.07);
        camera.position.x = mix(camera.position.x, pointer.x * 0.28 + driftX, 0.05);
        camera.position.y = mix(camera.position.y, 0.12 + pointer.y * -0.22 + driftY, 0.05);
        camera.rotation.y = mix(camera.rotation.y, pointer.x * 0.14, 0.06);
        camera.rotation.x = mix(camera.rotation.x, pointer.y * 0.08, 0.06);

        if (portalMat) {
          portalMat.uniforms.uTime.value = t;
          const s = 0.6 + 0.4 * Math.sin(t * 1.7);
          portalMat.uniforms.uStrength.value = 0.9 + s * 0.35;
        }
        if (motes && motes.material && motes.material.uniforms) {
          motes.material.uniforms.uTime.value = t;
          motes.material.uniforms.uPixelRatio.value = Math.min(2, window.devicePixelRatio || 1);
        }
        if (crystals) crystals.rotation.z = t * 0.06;
        if (portal) portal.rotation.z = t * 0.13;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };

      try {
        init();
        setScroll();
        window.addEventListener("pointermove", setPointer, { passive: true });
        window.addEventListener("scroll", setScroll, { passive: true });
        window.addEventListener("resize", resize, { passive: true });
        raf = requestAnimationFrame(tick);

        cleanup = () => {
          disposed = true;
          cancelAnimationFrame(raf);
          window.removeEventListener("pointermove", setPointer);
          window.removeEventListener("scroll", setScroll);
          window.removeEventListener("resize", resize);
          if (scene) {
            scene.traverse((o) => {
              if (o.geometry) o.geometry.dispose();
              if (o.material) {
                if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
                else o.material.dispose();
              }
            });
          }
          if (renderer) renderer.dispose();
        };
      } catch (e) {
        webglOk = false;
      }

      if (cardsRoot && typeof IntersectionObserver !== "undefined") {
        const els = Array.from(cardsRoot.querySelectorAll("[data-card]"));
        const io = new IntersectionObserver(
          (entries) => {
            for (const ent of entries) {
              if (!ent.isIntersecting) continue;
              const idx = Number(ent.target.getAttribute("data-i"));
              if (!Number.isNaN(idx)) inView[idx] = true;
            }
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
        );
        for (const el of els) io.observe(el);
        const prevCleanup = cleanup;
        cleanup = () => {
          io.disconnect();
          prevCleanup();
        };
      }
    })();

    return () => {
      mounted = false;
      cleanup();
    };
  });

  onDestroy(() => cleanup());
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cave">
  <div class="cave-webgl" bind:this={container} aria-hidden="true">
    <canvas bind:this={canvas}></canvas>
    <div class="cave-vignette"></div>
    <div class="cave-grain"></div>
  </div>

  <div class="cave-content">
    <header class="hero">
      <div class="hero-top">
        <a class="hero-logo" href="/archive" aria-label="Lorem ipsum">
          <img src="/2023/logo.png" alt={title} />
        </a>
        <a class="hero-arrow" href="/archive" aria-label="Lorem ipsum">←</a>
      </div>

      <div class="hero-copy">
        <h1 class="hero-title">{title}</h1>
        <div class="hero-meta">
          <div class="hero-line">{duration}</div>
          <div class="hero-line">{theme}</div>
          <a class="hero-link" href="https://itch.io/jam/camgamejam2023">{submissions}</a>
        </div>
        <p class="hero-lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </p>
      </div>
    </header>

    <section class="showcase" bind:this={cardsRoot}>
      <div class="cards">
        {#each featured as item, i (item.title)}
          <a
            class="card"
            class:in={inView[i]}
            data-card
            data-i={i}
            href={item.link}
            style={`--i:${i};`}
          >
            <div class="card-media">
              <img src={item.src} alt={item.title} loading="lazy" />
              <div class="card-glow"></div>
            </div>
            <div class="card-body">
              <div class="card-title">{item.title}</div>
              {#if item.prize}
                <div class="card-prize">{item.prize}</div>
              {:else}
                <div class="card-prize">Lorem ipsum</div>
              {/if}
              <div class="card-lorem">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>

    {#if !webglOk}
      <div class="fallback">
        <img class="fallback-img" src="/2023/jam.png" alt={title} loading="lazy" />
      </div>
    {/if}
  </div>
</div>

<style>
  .cave {
    min-height: 100svh;
    background: radial-gradient(1200px 800px at 50% 0%, rgba(12, 28, 28, 0.65), rgba(2, 3, 6, 1)),
      radial-gradient(900px 700px at 25% 110%, rgba(28, 8, 4, 0.35), rgba(2, 3, 6, 0));
    color: rgba(248, 250, 252, 0.92);
  }

  .cave-webgl {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
    filter: saturate(1.05) contrast(1.05);
  }

  .cave-vignette {
    position: absolute;
    inset: -10%;
    background: radial-gradient(
      circle at 50% 40%,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 0, 0, 0.35) 48%,
      rgba(0, 0, 0, 0.78) 75%,
      rgba(0, 0, 0, 1) 100%
    );
    mix-blend-mode: multiply;
    opacity: 0.95;
  }

  .cave-grain {
    position: absolute;
    inset: -25%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.24'/%3E%3C/svg%3E");
    background-size: 240px 240px;
    opacity: 0.13;
    mix-blend-mode: overlay;
    animation: grain 6s steps(2) infinite;
    transform: translateZ(0);
  }

  @keyframes grain {
    0% {
      transform: translate3d(-2%, -2%, 0);
    }
    25% {
      transform: translate3d(2%, -3%, 0);
    }
    50% {
      transform: translate3d(3%, 2%, 0);
    }
    75% {
      transform: translate3d(-3%, 3%, 0);
    }
    100% {
      transform: translate3d(-2%, -2%, 0);
    }
  }

  .cave-content {
    position: relative;
    z-index: 1;
  }

  .hero {
    min-height: 100svh;
    display: grid;
    align-items: end;
    padding: clamp(18px, 4vw, 56px);
  }

  .hero-top {
    position: absolute;
    inset: 0;
    padding: clamp(14px, 3vw, 28px);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    pointer-events: auto;
  }

  .hero-logo {
    width: min(120px, 28vw);
    filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.65));
    opacity: 0.95;
    transform: translateZ(0);
    transition: transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 320ms ease;
  }

  .hero-logo:hover {
    transform: translate3d(0, -2px, 0) scale(1.02);
    opacity: 1;
  }

  .hero-logo img {
    width: 100%;
    height: auto;
    display: block;
  }

  .hero-arrow {
    width: 46px;
    height: 46px;
    border-radius: 9999px;
    display: grid;
    place-items: center;
    text-decoration: none;
    color: rgba(248, 250, 252, 0.92);
    background: rgba(2, 4, 7, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow: 0 24px 68px rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(10px);
    transition: transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1), border-color 220ms ease,
      background 220ms ease;
  }

  .hero-arrow:hover {
    transform: translate3d(0, -2px, 0);
    border-color: rgba(226, 232, 240, 0.42);
    background: rgba(2, 4, 7, 0.72);
  }

  .hero-copy {
    max-width: 860px;
    padding: clamp(18px, 3.6vw, 38px);
    border-radius: 26px;
    background: radial-gradient(1000px 600px at 50% -10%, rgba(28, 255, 216, 0.07), rgba(0, 0, 0, 0)),
      radial-gradient(900px 600px at 120% 0%, rgba(255, 122, 42, 0.09), rgba(0, 0, 0, 0)),
      linear-gradient(180deg, rgba(2, 4, 7, 0.55), rgba(2, 4, 7, 0.32));
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 40px 140px rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(14px) saturate(115%);
  }

  .hero-title {
    font-size: clamp(40px, 6.4vw, 74px);
    line-height: 0.95;
    letter-spacing: -0.04em;
    font-weight: 760;
    margin: 0;
    background: linear-gradient(90deg, rgba(248, 250, 252, 0.95), rgba(28, 255, 216, 0.85), rgba(255, 170, 92, 0.9));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
    animation: shimmer 3.8s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      filter: drop-shadow(0 24px 56px rgba(28, 255, 216, 0.05));
    }
    50% {
      filter: drop-shadow(0 24px 70px rgba(255, 122, 42, 0.09));
    }
    100% {
      filter: drop-shadow(0 24px 56px rgba(28, 255, 216, 0.05));
    }
  }

  .hero-meta {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 16px;
    font-size: clamp(16px, 2vw, 22px);
    color: rgba(226, 232, 240, 0.92);
  }

  .hero-line {
    opacity: 0.95;
    text-wrap: balance;
  }

  .hero-link {
    width: fit-content;
    text-decoration: none;
    color: rgba(28, 255, 216, 0.9);
    border-bottom: 1px solid rgba(28, 255, 216, 0.35);
    padding-bottom: 2px;
    transition: transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1), color 220ms ease,
      border-color 220ms ease;
  }

  .hero-link:hover {
    transform: translate3d(0, -1px, 0);
    color: rgba(255, 170, 92, 0.95);
    border-color: rgba(255, 170, 92, 0.45);
  }

  .hero-lorem {
    margin: 18px 0 0 0;
    color: rgba(203, 213, 225, 0.88);
    font-size: clamp(14px, 1.5vw, 18px);
    line-height: 1.55;
    max-width: 70ch;
  }

  .showcase {
    padding: 0 clamp(18px, 4vw, 56px) clamp(90px, 12vw, 160px);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: clamp(12px, 2vw, 22px);
    max-width: 1260px;
    margin: 0 auto;
    pointer-events: auto;
  }

  .card {
    grid-column: span 12;
    display: grid;
    border-radius: 22px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    background: linear-gradient(180deg, rgba(7, 10, 14, 0.58), rgba(7, 10, 14, 0.34));
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 44px 140px rgba(0, 0, 0, 0.76);
    transform: translate3d(0, 18px, 0) scale(0.985);
    opacity: 0;
    transition: transform 820ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 820ms ease,
      border-color 300ms ease, background 300ms ease, box-shadow 300ms ease;
    will-change: transform;
    position: relative;
  }

  .card.in {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }

  .card::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: radial-gradient(900px 420px at 20% 15%, rgba(28, 255, 216, 0.15), rgba(0, 0, 0, 0)),
      radial-gradient(900px 420px at 90% 80%, rgba(255, 122, 42, 0.14), rgba(0, 0, 0, 0));
    opacity: 0;
    transition: opacity 300ms ease;
    pointer-events: none;
    z-index: 0;
  }

  .card:hover::before {
    opacity: 1;
  }

  .card:hover {
    transform: translate3d(0, -6px, 0) scale(1.01);
    border-color: rgba(226, 232, 240, 0.24);
    background: linear-gradient(180deg, rgba(7, 10, 14, 0.72), rgba(7, 10, 14, 0.42));
    box-shadow: 0 54px 190px rgba(0, 0, 0, 0.82);
  }

  .card-media {
    position: relative;
    height: clamp(220px, 28vw, 360px);
    background: radial-gradient(800px 480px at 50% 30%, rgba(28, 255, 216, 0.1), rgba(0, 0, 0, 0));
    z-index: 1;
  }

  .card-media img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 26px 70px rgba(0, 0, 0, 0.65));
    transform: translateZ(0);
    transition: transform 760ms cubic-bezier(0.2, 0.9, 0.2, 1), filter 360ms ease;
  }

  .card:hover .card-media img {
    transform: translate3d(0, -3px, 0) scale(1.03);
    filter: drop-shadow(0 34px 86px rgba(0, 0, 0, 0.8));
  }

  .card-glow {
    position: absolute;
    inset: -20%;
    background: conic-gradient(
      from 180deg at 50% 50%,
      rgba(28, 255, 216, 0) 0%,
      rgba(28, 255, 216, 0.22) 18%,
      rgba(255, 122, 42, 0.2) 40%,
      rgba(28, 255, 216, 0.18) 58%,
      rgba(28, 255, 216, 0) 76%,
      rgba(28, 255, 216, 0) 100%
    );
    opacity: 0;
    mix-blend-mode: screen;
    filter: blur(18px);
    transform: translate3d(0, 0, 0) rotate(0deg);
    transition: opacity 380ms ease;
    animation: spin 10s linear infinite;
    pointer-events: none;
  }

  .card:hover .card-glow {
    opacity: 1;
  }

  @keyframes spin {
    0% {
      transform: translate3d(0, 0, 0) rotate(0deg);
    }
    100% {
      transform: translate3d(0, 0, 0) rotate(360deg);
    }
  }

  .card-body {
    padding: clamp(14px, 2vw, 18px) clamp(14px, 2vw, 20px) clamp(18px, 2.2vw, 24px);
    z-index: 1;
    display: grid;
    gap: 8px;
  }

  .card-title {
    font-size: clamp(18px, 2.2vw, 26px);
    font-weight: 720;
    letter-spacing: -0.02em;
    color: rgba(248, 250, 252, 0.95);
  }

  .card-prize {
    width: fit-content;
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 8px 10px;
    border-radius: 9999px;
    background: rgba(2, 4, 7, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.16);
    color: rgba(226, 232, 240, 0.9);
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.65);
  }

  .card-lorem {
    color: rgba(203, 213, 225, 0.84);
    font-size: 14.5px;
    line-height: 1.55;
    max-width: 75ch;
  }

  .fallback {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 clamp(18px, 4vw, 56px) 120px;
    pointer-events: auto;
  }

  .fallback-img {
    width: 100%;
    height: auto;
    display: block;
    filter: drop-shadow(0 38px 120px rgba(0, 0, 0, 0.8));
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(0, 0, 0, 0.25);
  }

  @media (min-width: 860px) {
    .card {
      grid-column: span 6;
    }
    .card[data-i="5"] {
      grid-column: span 12;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cave-grain,
    .hero-title,
    .card-glow {
      animation: none;
    }
    .card,
    .hero-logo,
    .hero-arrow,
    .hero-link,
    .card-media img {
      transition: none;
    }
  }
</style>
