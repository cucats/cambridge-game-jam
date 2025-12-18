<script>
  import { onMount } from "svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const featured = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let mount = $state(null);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let ready = $state(false);

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  onMount(() => {
    let cleanup = () => {};
    (async () => {
      const reducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      )?.matches;

      const THREE = await import("three");
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] =
        await Promise.all([
          import("three/addons/postprocessing/EffectComposer.js"),
          import("three/addons/postprocessing/RenderPass.js"),
          import("three/addons/postprocessing/UnrealBloomPass.js"),
        ]);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x05060a, 0.034);

      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 220);
      camera.position.set(0, 0.8, 6.5);

      const renderer = new THREE.WebGLRenderer({
        antialias: !reducedMotion,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        reducedMotion ? 0.55 : 1.25,
        0.65,
        0.08,
      );
      composer.addPass(bloom);

      const onResize = () => {
        if (!mount) return;
        const r = mount.getBoundingClientRect();
        const w = Math.max(1, Math.floor(r.width));
        const h = Math.max(1, Math.floor(r.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        bloom.setSize(w, h);
      };

      mount.appendChild(renderer.domElement);
      onResize();
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);

      const ambient = new THREE.AmbientLight(0x1f2430, 0.35);
      scene.add(ambient);

      const key = new THREE.PointLight(0x7aa9ff, 14, 38, 2);
      key.position.set(3.5, 3.8, 7);
      scene.add(key);

      const ember = new THREE.PointLight(0xff6a3d, 12, 28, 2);
      ember.position.set(-3.8, -1.2, -12);
      scene.add(ember);

      const pts = [];
      for (let i = 0; i < 18; i += 1) {
        const z = -i * 10.8;
        const x =
          (Math.sin(i * 0.73) * 3.1 + (Math.random() - 0.5) * 1.1) * 0.9;
        const y =
          (Math.cos(i * 0.51) * 1.6 + (Math.random() - 0.5) * 0.7) * 0.85;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);

      const tube = new THREE.TubeGeometry(curve, 1200, 6.4, 30, false);
      const caveMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          uTime: { value: 0 },
          uPulse: { value: 0 },
          uFogColor: { value: new THREE.Color(0x05060a) },
        },
        vertexShader: `
        varying vec3 vPos;
        varying vec3 vN;
        uniform float uTime;
        float hash(float n){return fract(sin(n)*43758.5453123);}
        float noise(vec3 x){
          vec3 p=floor(x);
          vec3 f=fract(x);
          f=f*f*(3.0-2.0*f);
          float n=p.x+p.y*57.0+p.z*113.0;
          float a=hash(n+0.0);
          float b=hash(n+1.0);
          float c=hash(n+57.0);
          float d=hash(n+58.0);
          float e=hash(n+113.0);
          float f1=hash(n+114.0);
          float g=hash(n+170.0);
          float h=hash(n+171.0);
          float k0=mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
          float k1=mix(mix(e,f1,f.x),mix(g,h,f.x),f.y);
          return mix(k0,k1,f.z);
        }
        float fbm(vec3 p){
          float v=0.0;
          float a=0.55;
          for(int i=0;i<5;i++){
            v+=a*noise(p);
            p*=2.02;
            a*=0.55;
          }
          return v;
        }
        void main(){
          vec3 pos=position;
          vec3 n=normal;
          float t=uTime*0.18;
          float ridges=pow(smoothstep(0.35,0.92,fbm(pos*0.22+vec3(0.0,t,0.0))),2.2);
          float crags=fbm(pos*0.55+vec3(t*0.6,0.0,t*0.2));
          float disp=(ridges*1.6+crags*0.6-0.55);
          pos+=n*disp*0.9;
          vPos=(modelMatrix*vec4(pos,1.0)).xyz;
          vN=normalize(normalMatrix*n);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);
        }
      `,
        fragmentShader: `
        varying vec3 vPos;
        varying vec3 vN;
        uniform float uTime;
        uniform float uPulse;
        uniform vec3 uFogColor;
        float hash(float n){return fract(sin(n)*43758.5453123);}
        float noise(vec3 x){
          vec3 p=floor(x);
          vec3 f=fract(x);
          f=f*f*(3.0-2.0*f);
          float n=p.x+p.y*57.0+p.z*113.0;
          float a=hash(n+0.0);
          float b=hash(n+1.0);
          float c=hash(n+57.0);
          float d=hash(n+58.0);
          float e=hash(n+113.0);
          float f1=hash(n+114.0);
          float g=hash(n+170.0);
          float h=hash(n+171.0);
          float k0=mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
          float k1=mix(mix(e,f1,f.x),mix(g,h,f.x),f.y);
          return mix(k0,k1,f.z);
        }
        float fbm(vec3 p){
          float v=0.0;
          float a=0.55;
          for(int i=0;i<5;i++){
            v+=a*noise(p);
            p*=2.02;
            a*=0.55;
          }
          return v;
        }
        void main(){
          vec3 n=normalize(vN);
          vec3 l=normalize(vec3(0.15,0.95,0.35));
          float ndl=clamp(dot(n,l)*0.6+0.4,0.0,1.0);
          float wet=fbm(vPos*0.12+vec3(0.0,uTime*0.05,0.0));
          float grit=fbm(vPos*0.7);
          vec3 base=mix(vec3(0.02,0.02,0.03),vec3(0.08,0.075,0.07),ndl);
          base*=mix(0.75,1.15,wet);
          base*=mix(0.75,1.25,grit);
          float veins=pow(smoothstep(0.62,0.98,fbm(vPos*0.18+vec3(uTime*0.15,0.0,0.0))),3.0);
          vec3 glow=mix(vec3(0.0),vec3(0.12,0.3,0.55),veins)*(0.3+0.7*uPulse);
          float depth=length(vPos);
          float fog=1.0-exp(-depth*0.03);
          vec3 col=mix(base+glow,uFogColor,fog);
          gl_FragColor=vec4(col,1.0);
        }
      `,
      });
      const cave = new THREE.Mesh(tube, caveMat);
      scene.add(cave);

      const crystalGeo = new THREE.OctahedronGeometry(0.45, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x86e6ff,
        emissive: 0x2aa5ff,
        emissiveIntensity: 2.8,
        roughness: 0.18,
        metalness: 0.15,
      });
      const crystals = new THREE.InstancedMesh(crystalGeo, crystalMat, 160);
      crystals.frustumCulled = false;
      const tmp = new THREE.Object3D();
      for (let i = 0; i < 160; i += 1) {
        const t = (i / 160) * 0.98 + 0.01;
        const p = curve.getPointAt(t);
        const r = 4.6 + Math.random() * 1.35;
        const a = Math.random() * Math.PI * 2;
        tmp.position.set(
          p.x + Math.cos(a) * r,
          p.y + Math.sin(a) * r * 0.75,
          p.z + (Math.random() - 0.5) * 3.4,
        );
        tmp.rotation.set(
          (Math.random() - 0.5) * 0.6,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.8,
        );
        const s = 0.3 + Math.random() * 1.25;
        tmp.scale.setScalar(s);
        tmp.updateMatrix();
        crystals.setMatrixAt(i, tmp.matrix);
      }
      scene.add(crystals);

      const moteCount = reducedMotion ? 1200 : 4200;
      const moteGeo = new THREE.BufferGeometry();
      const motePos = new Float32Array(moteCount * 3);
      const moteSeed = new Float32Array(moteCount);
      for (let i = 0; i < moteCount; i += 1) {
        const t = Math.random();
        const p = curve.getPointAt(t);
        const r = 5.2 + Math.random() * 2.1;
        const a = Math.random() * Math.PI * 2;
        motePos[i * 3 + 0] = p.x + Math.cos(a) * r;
        motePos[i * 3 + 1] = p.y + Math.sin(a) * r * 0.75;
        motePos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 7.2;
        moteSeed[i] = Math.random() * 1000;
      }
      moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
      moteGeo.setAttribute("aSeed", new THREE.BufferAttribute(moteSeed, 1));
      const moteMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
        uniform float uTime;
        attribute float aSeed;
        varying float vA;
        void main(){
          vec3 p=position;
          float t=uTime*0.15+aSeed;
          p.x+=sin(t*1.7)*0.55;
          p.y+=cos(t*1.3)*0.42;
          p.z+=sin(t*0.9)*0.35;
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          float s=clamp(48.0/(-mv.z),0.0,40.0);
          gl_PointSize=s;
          gl_Position=projectionMatrix*mv;
          vA=clamp(s/18.0,0.0,1.0);
        }
      `,
      fragmentShader: `
        varying float vA;
        void main(){
          vec2 uv=gl_PointCoord.xy-0.5;
          float d=dot(uv,uv);
          float a=smoothstep(0.25,0.0,d)*0.6*vA;
          gl_FragColor=vec4(0.25,0.5,0.9,a);
        }
      `,
      });
      const motes = new THREE.Points(moteGeo, moteMat);
      scene.add(motes);

      const shaftGeo = new THREE.PlaneGeometry(7.5, 10.5, 1, 1);
      const shaftMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uHue: { value: 0.0 } },
        vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv=uv;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        }
      `,
        fragmentShader: `
        uniform float uTime;
        uniform float uHue;
        varying vec2 vUv;
        float sat(float x){return clamp(x,0.0,1.0);}
        vec3 hue(float h){
          vec3 k=vec3(0.0,2.0,4.0);
          vec3 p=abs(fract(h+k/6.0)*6.0-3.0);
          return sat(p-1.0);
        }
        void main(){
          float y=smoothstep(1.0,0.0,vUv.y);
          float x=1.0-abs(vUv.x-0.5)*2.0;
          float n=sin((vUv.y*7.0+uTime*0.9)*6.2831)*0.12+0.88;
          float a=pow(x,2.2)*pow(y,1.7)*n*0.38;
          vec3 c=mix(vec3(0.06,0.12,0.22),hue(uHue)*0.6+vec3(0.08,0.18,0.35),0.65);
          gl_FragColor=vec4(c,a);
        }
      `,
      });
      const shafts = new THREE.Group();
      for (let i = 0; i < 7; i += 1) {
        const m = shaftMat.clone();
        m.uniforms = THREE.UniformsUtils.clone(shaftMat.uniforms);
        m.uniforms.uHue.value = 0.56 + i * 0.02;
        const mesh = new THREE.Mesh(shaftGeo, m);
        const t = 0.12 + (i / 7) * 0.76;
        const p = curve.getPointAt(t);
        mesh.position.set(p.x, p.y + 2.2 + Math.random() * 1.3, p.z - 2.8);
        mesh.rotation.y = (Math.random() - 0.5) * 0.9;
        mesh.rotation.x = -0.9 + (Math.random() - 0.5) * 0.25;
        mesh.scale.setScalar(0.7 + Math.random() * 0.65);
        shafts.add(mesh);
      }
      scene.add(shafts);

      let scrollT = 0;
      let easedT = 0;
      let last = performance.now();
      let raf = 0;

      const onScroll = () => {
        const max = Math.max(
          1,
          document.documentElement.scrollHeight - innerHeight,
        );
        scrollT = clamp01(window.scrollY / max);
      };

      const onMove = (e) => {
        const w = Math.max(1, window.innerWidth);
        const h = Math.max(1, window.innerHeight);
        mouseX = ((e.clientX / w) * 2 - 1) * 0.9;
        mouseY = ((e.clientY / h) * 2 - 1) * 0.75;
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("mousemove", onMove, { passive: true });
      onScroll();

      const animate = (now) => {
        raf = requestAnimationFrame(animate);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        const damp = 1 - Math.exp(-dt * 3.2);
        easedT += (scrollT - easedT) * damp;

        const t = reducedMotion ? 0.13 : easedT * 0.92 + 0.03;
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const side = new THREE.Vector3().crossVectors(tan, up).normalize();

        const wobble = reducedMotion ? 0 : Math.sin(now * 0.0012) * 0.12;
        const lift = reducedMotion ? 0 : Math.cos(now * 0.0011) * 0.08;

        camera.position.set(
          p.x + side.x * (0.7 + mouseX * 0.8) + wobble,
          p.y + 0.75 + mouseY * 0.55 + lift,
          p.z + 2.85,
        );
        const look = p
          .clone()
          .add(tan.clone().multiplyScalar(6.8))
          .add(side.clone().multiplyScalar(mouseX * 0.55));
        camera.lookAt(look);

        const time = now * 0.001;
        caveMat.uniforms.uTime.value = time;
        caveMat.uniforms.uPulse.value =
          0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.7));
        moteMat.uniforms.uTime.value = time;

        key.intensity =
          10 + Math.sin(time * 3.7) * 2.3 + Math.sin(time * 14.2) * 1.1;
        ember.intensity =
          9 +
          Math.sin(time * 2.9 + 1.4) * 1.9 +
          Math.sin(time * 10.6) * 1.0;
        ember.position.x = -3.8 + Math.sin(time * 0.7) * 0.8;
        key.position.y = 3.8 + Math.cos(time * 0.6) * 0.55;

        shafts.children.forEach((m, i) => {
          m.material.uniforms.uTime.value = time * (0.7 + i * 0.05);
          m.rotation.z = Math.sin(time * 0.55 + i) * 0.14;
        });

        composer.render();
        ready = true;
      };

      raf = requestAnimationFrame(animate);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("mousemove", onMove);
        ro.disconnect();
        composer.dispose();
        renderer.dispose();
        tube.dispose();
        caveMat.dispose();
        crystalGeo.dispose();
        crystalMat.dispose();
        moteGeo.dispose();
        moteMat.dispose();
        shaftGeo.dispose();
        shafts.children.forEach((m) => m.material.dispose());
        mount?.removeChild(renderer.domElement);
      };
    })();

    return () => cleanup();
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cg2023" class:ready style={`--mx:${mouseX};--my:${mouseY};`}>
  <div class="bg" bind:this={mount}></div>

  <div class="veil"></div>

  <div class="ui">
    <div class="hero">
      <div class="brand">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="logo" />
      </div>

      <div class="title">
        <h1>{title}</h1>
        <div class="meta">
          <div class="chip">{duration}</div>
          <div class="chip">{theme}</div>
          <a class="chip link" href="https://itch.io/jam/camgamejam2023"
            >{submissions} {submissions === 1 ? "Submission" : "Submissions"}</a
          >
        </div>
        <p class="lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <button
        class="down"
        onclick={() => {
          document.getElementById("cg2023-grid")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        aria-label="Lorem ipsum"
      >
        <span class="down-dot"></span>
        <span class="down-dot"></span>
        <span class="down-dot"></span>
      </button>
    </div>

    <div class="grid-wrap" id="cg2023-grid">
      <div class="grid">
        {#each featured as p (p.title)}
          <a class="card" href={p.link} style={`--mx:${mouseX};--my:${mouseY};`}>
            <div class="card-media">
              <img src={p.src} alt={p.alt} loading="lazy" />
              <div class="card-shine"></div>
            </div>
            <div class="card-body">
              <div class="card-title">{p.title}</div>
              {#if p.prize}
                <div class="card-prize">{p.prize}</div>
              {/if}
              <div class="card-lorem">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  :global(html),
  :global(body) {
    margin: 0;
    background: #030308;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .cg2023 {
    min-height: 220vh;
    background: radial-gradient(1200px 680px at 25% 10%, #0e1420 0%, #05060a 55%, #030308 100%);
    color: rgba(245, 246, 255, 0.92);
    overflow-x: hidden;
    position: relative;
  }

  .bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .veil {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      radial-gradient(800px 500px at 75% 20%, rgba(32, 178, 255, 0.18), rgba(0, 0, 0, 0) 60%),
      radial-gradient(900px 620px at 15% 85%, rgba(255, 110, 66, 0.14), rgba(0, 0, 0, 0) 62%),
      radial-gradient(1600px 900px at 50% 60%, rgba(8, 10, 18, 0.12), rgba(0, 0, 0, 0) 55%),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.68));
    mix-blend-mode: screen;
    opacity: 0.95;
  }

  .ui {
    position: relative;
    z-index: 2;
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 16px 120px;
  }

  .hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.1fr 1.9fr;
    gap: 18px;
    align-items: center;
    padding: 18px 0 54px;
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 10px;
      padding-top: 22px;
    }
  }

  .brand {
    display: grid;
    place-items: center;
  }

  .logo {
    width: min(320px, 72vw);
    height: auto;
    filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.55));
    transform: translate3d(calc(var(--mx, 0) * 12px), calc(var(--my, 0) * 10px), 0);
    transition: transform 140ms ease;
  }

  .title h1 {
    font-size: clamp(34px, 5.3vw, 64px);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 16px;
    text-shadow:
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 18px 70px rgba(0, 0, 0, 0.75);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0 0 16px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(210, 220, 255, 0.13), rgba(180, 200, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px) saturate(120%);
    font-size: 14px;
    letter-spacing: 0.01em;
    color: rgba(245, 246, 255, 0.92);
  }

  .chip.link {
    text-decoration: none;
    position: relative;
    overflow: hidden;
  }

  .chip.link::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: radial-gradient(420px 140px at 20% 40%, rgba(64, 193, 255, 0.22), rgba(0, 0, 0, 0) 60%);
    transform: translate3d(-25%, 0, 0);
    transition: transform 520ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  .chip.link:hover::before {
    transform: translate3d(25%, 0, 0);
  }

  .chip.link {
    cursor: pointer;
  }

  .lorem {
    max-width: 60ch;
    margin: 0;
    color: rgba(230, 233, 255, 0.8);
    text-shadow: 0 18px 60px rgba(0, 0, 0, 0.75);
    font-size: 15px;
    line-height: 1.6;
  }

  .down {
    justify-self: end;
    align-self: end;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
    border-radius: 999px;
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    gap: 4px;
    box-shadow:
      0 18px 50px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px) saturate(120%);
    transition:
      transform 220ms ease,
      border-color 220ms ease,
      background 220ms ease;
  }

  .down:hover {
    transform: translate3d(0, -2px, 0);
    border-color: rgba(120, 200, 255, 0.25);
    background: linear-gradient(180deg, rgba(64, 193, 255, 0.16), rgba(255, 255, 255, 0.03));
  }

  .down:active {
    transform: translate3d(0, 0, 0) scale(0.98);
  }

  .down-dot {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: rgba(210, 235, 255, 0.9);
    box-shadow: 0 0 22px rgba(60, 180, 255, 0.55);
    animation: cg2023-bob 1.1s ease-in-out infinite;
  }

  .down-dot:nth-child(2) {
    animation-delay: 0.12s;
    opacity: 0.8;
  }

  .down-dot:nth-child(3) {
    animation-delay: 0.24s;
    opacity: 0.65;
  }

  @keyframes cg2023-bob {
    0%,
    100% {
      transform: translate3d(0, -4px, 0);
    }
    50% {
      transform: translate3d(0, 4px, 0);
    }
  }

  .grid-wrap {
    padding-top: 18px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  @media (max-width: 1020px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .card {
    position: relative;
    border-radius: 22px;
    overflow: hidden;
    text-decoration: none;
    color: rgba(245, 246, 255, 0.92);
    background: linear-gradient(180deg, rgba(210, 220, 255, 0.10), rgba(190, 210, 255, 0.04));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 22px 70px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transform: translate3d(0, 18px, 0) scale(0.985);
    opacity: 0.01;
    filter: blur(2px);
    transition:
      transform 900ms cubic-bezier(0.18, 0.9, 0.2, 1),
      opacity 900ms cubic-bezier(0.18, 0.9, 0.2, 1),
      filter 900ms cubic-bezier(0.18, 0.9, 0.2, 1),
      border-color 250ms ease;
    will-change: transform, opacity, filter;
  }

  .ready .card {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }

  .card:hover {
    border-color: rgba(120, 200, 255, 0.22);
    transform: translate3d(0, -6px, 0) scale(1.01);
  }

  .card-media {
    position: relative;
    height: 220px;
    background: radial-gradient(520px 220px at 50% 45%, rgba(32, 178, 255, 0.16), rgba(0, 0, 0, 0) 65%);
  }

  .card-media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.05)
      translate3d(calc(var(--mx, 0) * -9px), calc(var(--my, 0) * -7px), 0);
    transition: transform 450ms cubic-bezier(0.2, 0.9, 0.2, 1);
    filter: saturate(1.05) contrast(1.05);
  }

  .card:hover .card-media img {
    transform: scale(1.09)
      translate3d(calc(var(--mx, 0) * -14px), calc(var(--my, 0) * -12px), 0);
  }

  .card-shine {
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(520px 240px at 20% 30%, rgba(120, 220, 255, 0.24), rgba(0, 0, 0, 0) 60%),
      radial-gradient(480px 220px at 75% 70%, rgba(255, 140, 95, 0.16), rgba(0, 0, 0, 0) 62%),
      linear-gradient(120deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0));
    mix-blend-mode: screen;
    opacity: 0.85;
    transform: translate3d(calc(var(--mx, 0) * 10px), calc(var(--my, 0) * 8px), 0);
    transition:
      transform 520ms cubic-bezier(0.2, 0.9, 0.2, 1),
      opacity 320ms ease;
    pointer-events: none;
  }

  .card:hover .card-shine {
    opacity: 1;
    transform: translate3d(calc(var(--mx, 0) * 18px), calc(var(--my, 0) * 14px), 0);
  }

  .card-body {
    padding: 14px 14px 16px;
    display: grid;
    gap: 6px;
  }

  .card-title {
    font-size: 18px;
    letter-spacing: -0.01em;
    text-shadow: 0 18px 44px rgba(0, 0, 0, 0.62);
  }

  .card-prize {
    font-size: 13px;
    color: rgba(190, 220, 255, 0.86);
    text-shadow: 0 18px 44px rgba(0, 0, 0, 0.62);
  }

  .card-lorem {
    font-size: 13px;
    line-height: 1.55;
    color: rgba(230, 233, 255, 0.7);
  }
</style>
