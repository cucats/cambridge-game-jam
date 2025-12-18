<script>
  import { onMount } from "svelte";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const images = [
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

  let canvas;
  let live = false;

  onMount(async () => {
    if (!canvas) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const THREE = await import("three");
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
    const { ShaderPass } = await import(
      "three/examples/jsm/postprocessing/ShaderPass.js"
    );
    const { RGBShiftShader } = await import(
      "three/examples/jsm/shaders/RGBShiftShader.js"
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040208, 0.08);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      220
    );
    camera.position.set(0, 0.4, 6);

    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 10 }, (_, i) => {
        const t = i / 9;
        const z = -t * 160;
        const x = Math.sin(t * Math.PI * 3.0) * 2.2;
        const y = Math.cos(t * Math.PI * 2.0) * 1.4;
        return new THREE.Vector3(x, y, z);
      })
    );

    const caveGeo = new THREE.TubeGeometry(curve, 900, 9.25, 56, false);

    const noiseGLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 =   v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

    const caveMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
      },
      vertexShader: `
uniform float uTime;
uniform float uPulse;
varying vec3 vPos;
varying vec3 vN;
${noiseGLSL}
void main(){
  vN = normalMatrix * normal;
  vec3 p = position;
  float n1 = snoise(p * 0.085 + vec3(0.0, 0.0, uTime * 0.12));
  float n2 = snoise(p * 0.22 + vec3(1.4, -0.7, uTime * 0.07));
  float wobble = (n1 * 0.75 + n2 * 0.25);
  float carve = smoothstep(-140.0, -10.0, p.z);
  p += normal * wobble * (1.25 + carve * 1.1) * (0.85 + uPulse * 0.25);
  vPos = p;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
      `,
      fragmentShader: `
precision highp float;
uniform float uTime;
uniform float uPulse;
varying vec3 vPos;
varying vec3 vN;
${noiseGLSL}
void main(){
  vec3 n = normalize(vN);
  float ndv = clamp(dot(n, normalize(vec3(0.2, 0.25, 1.0))), 0.0, 1.0);
  float rough = snoise(vPos * 0.18 + vec3(0.0, 0.0, uTime * 0.05));
  float veins = snoise(vPos * 0.55 + vec3(4.2, 0.0, -uTime * 0.08));
  veins = smoothstep(0.35, 0.75, veins) * 0.85;
  vec3 rockA = vec3(0.04, 0.03, 0.07);
  vec3 rockB = vec3(0.11, 0.06, 0.14);
  vec3 base = mix(rockA, rockB, ndv * 0.7 + rough * 0.18);
  vec3 glow = vec3(0.55, 0.28, 0.95) * veins * (0.35 + 0.65 * sin(uTime * 0.85 + vPos.z * 0.04) * 0.5 + 0.5);
  glow *= 0.65 + uPulse * 0.35;
  float mist = smoothstep(-160.0, -20.0, vPos.z);
  vec3 col = base + glow * mist;
  float vign = smoothstep(0.0, 1.0, 1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0))));
  col *= 0.55 + 0.45 * vign;
  gl_FragColor = vec4(col, 1.0);
}
      `,
    });

    const cave = new THREE.Mesh(caveGeo, caveMat);
    scene.add(cave);

    const dustCount = reduce ? 800 : 5200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustSeed = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      const t = i / (dustCount - 1);
      const p = curve.getPointAt(t);
      const r = 7.2 + Math.random() * 2.8;
      const a = Math.random() * Math.PI * 2;
      dustPos[i * 3 + 0] = p.x + Math.cos(a) * r;
      dustPos[i * 3 + 1] = p.y + Math.sin(a) * r;
      dustPos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 8.0;
      dustSeed[i] = Math.random();
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeed, 1));

    const dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: reduce ? 1.2 : 2.1 },
      },
      vertexShader: `
uniform float uTime;
uniform float uSize;
attribute float aSeed;
varying float vA;
void main(){
  vec3 p = position;
  float f = fract(aSeed + uTime * 0.06);
  p.z += (f - 0.5) * 10.0;
  float tw = 0.35 + 0.65 * sin(uTime * 1.2 + aSeed * 19.0);
  vA = tw * (0.35 + aSeed * 0.55);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (90.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
      `,
      fragmentShader: `
precision highp float;
varying float vA;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = dot(uv, uv);
  float a = smoothstep(0.25, 0.0, d) * vA;
  vec3 c = mix(vec3(0.34, 0.18, 0.55), vec3(0.10, 0.55, 0.95), vA);
  gl_FragColor = vec4(c, a);
}
      `,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const crystalCount = reduce ? 55 : 170;
    const crystalGeo = new THREE.IcosahedronGeometry(0.55, 0);
    crystalGeo.rotateZ(Math.PI / 9);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x1d0c2a,
      emissive: 0x6b2cff,
      emissiveIntensity: 2.2,
      roughness: 0.25,
      metalness: 0.85,
    });

    const crystals = new THREE.InstancedMesh(
      crystalGeo,
      crystalMat,
      crystalCount
    );
    crystals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(crystals);

    const tmpObj = new THREE.Object3D();
    const crystalData = Array.from({ length: crystalCount }, () => ({
      t: Math.random(),
      a: Math.random() * Math.PI * 2,
      r: 6.2 + Math.random() * 3.0,
      s: 0.65 + Math.random() * 1.25,
      spin: (Math.random() < 0.5 ? -1 : 1) * (0.2 + Math.random() * 1.3),
      hue: Math.random(),
    }));

    const lights = [
      new THREE.PointLight(0xb44dff, 18, 22, 2),
      new THREE.PointLight(0x2de0ff, 10, 18, 2),
      new THREE.PointLight(0xff7a2d, 6.5, 16, 2),
    ];
    lights[0].position.set(0.0, 0.2, 2.0);
    lights[1].position.set(-1.2, 1.2, -10.0);
    lights[2].position.set(1.4, -1.0, -24.0);
    for (const l of lights) scene.add(l);

    scene.add(new THREE.AmbientLight(0x1c0d22, 0.5));

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      reduce ? 0.85 : 1.35,
      0.75,
      0.12
    );
    composer.addPass(bloom);

    const rgb = new ShaderPass(RGBShiftShader);
    rgb.uniforms["amount"].value = reduce ? 0.0006 : 0.00125;
    composer.addPass(rgb);

    const film = new FilmPass(0.35, 0.16, 900, false);
    composer.addPass(film);

    if (!reduce) {
      const after = new AfterimagePass();
      after.uniforms["damp"].value = 0.88;
      composer.addPass(after);
    }

    const VignetteShader = {
      uniforms: {
        tDiffuse: { value: null },
        offset: { value: 1.15 },
        darkness: { value: 1.5 },
      },
      vertexShader: `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
      `,
      fragmentShader: `
uniform sampler2D tDiffuse;
uniform float offset;
uniform float darkness;
varying vec2 vUv;
void main(){
  vec4 c = texture2D(tDiffuse, vUv);
  vec2 uv = (vUv - 0.5) * offset;
  float v = smoothstep(0.9, 0.15, dot(uv, uv));
  c.rgb *= mix(1.0, v, darkness);
  gl_FragColor = c;
}
      `,
    };
    composer.addPass(new ShaderPass(VignetteShader));

    let raf = 0;
    let t0 = performance.now();
    let pointerX = 0;
    let pointerY = 0;
    let pointerTX = 0;
    let pointerTY = 0;
    let pulse = 0;
    let pulseT = 0;

    const onPointer = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      pointerTX = x;
      pointerTY = y;
      pulseT = Math.min(1, pulseT + 0.15);
    };

    const onScroll = () => {
      pulseT = Math.min(1, pulseT + 0.08);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const resize = () => {
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resize, { passive: true });

    const vCam = new THREE.Vector3();
    const vP = new THREE.Vector3();
    const vLook = new THREE.Vector3();
    const vCP = new THREE.Vector3();
    const vTan = new THREE.Vector3();
    const vBasis = new THREE.Vector3();
    const vUp = new THREE.Vector3();
    const vOff = new THREE.Vector3();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      const time = now / 1000;

      pointerX += (pointerTX - pointerX) * (1 - Math.pow(0.0001, dt));
      pointerY += (pointerTY - pointerY) * (1 - Math.pow(0.0001, dt));
      pulse += (pulseT - pulse) * (1 - Math.pow(0.0002, dt));
      pulseT *= 0.93;

      const scrollMax = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const s = Math.min(1, Math.max(0, window.scrollY / scrollMax));
      const ss = s * s * (3 - 2 * s);

      const travel = 0.05 + ss * 0.88;
      curve.getPointAt(travel, vP);
      curve.getPointAt(Math.min(0.99, travel + 0.01), vLook);

      vCam.set(
        vP.x + pointerX * 0.8,
        vP.y + 0.25 + -pointerY * 0.55,
        vP.z + 3.5
      );
      camera.position.lerp(vCam, 0.15);
      camera.lookAt(
        vLook.x + pointerX * 0.6,
        vLook.y + -pointerY * 0.35,
        vLook.z
      );

      lights[0].position.set(
        vP.x + Math.sin(time * 0.9) * 1.6,
        vP.y + Math.cos(time * 1.1) * 1.2,
        vP.z + 4.0
      );
      lights[1].position.set(
        vP.x - 2.2 + Math.sin(time * 0.6) * 1.0,
        vP.y + 1.6 + Math.cos(time * 0.7) * 1.0,
        vP.z - 6.0
      );
      lights[2].position.set(
        vP.x + 2.4 + Math.sin(time * 0.45) * 0.9,
        vP.y - 1.4 + Math.cos(time * 0.52) * 0.8,
        vP.z - 16.0
      );

      caveMat.uniforms.uTime.value = time;
      caveMat.uniforms.uPulse.value = pulse;
      dustMat.uniforms.uTime.value = time;
      rgb.uniforms["angle"].value = time * 0.2;
      rgb.uniforms["amount"].value =
        (reduce ? 0.00055 : 0.00115) * (0.7 + 0.6 * pulse);
      bloom.strength = (reduce ? 0.85 : 1.35) * (0.85 + 0.55 * pulse);

      for (let i = 0; i < crystalCount; i++) {
        const d = crystalData[i];
        const tt = (d.t * 0.9 + ss * 0.65 + time * 0.012) % 1;
        curve.getPointAt(tt, vCP);
        curve.getTangentAt(tt, vTan).normalize();
        vBasis.crossVectors(vTan, vUp.set(0, 1, 0));
        if (vBasis.lengthSq() < 0.0001) vBasis.set(1, 0, 0);
        vBasis.normalize();
        vUp.crossVectors(vBasis, vTan).normalize();
        vOff
          .copy(vBasis)
          .multiplyScalar(Math.cos(d.a) * d.r)
          .addScaledVector(vUp, Math.sin(d.a) * d.r);

        tmpObj.position.copy(vCP).add(vOff);
        tmpObj.scale.setScalar(d.s * (0.85 + 0.25 * Math.sin(time * 1.4 + d.a)));
        tmpObj.rotation.set(
          time * 0.18 + d.a,
          time * d.spin + d.t * Math.PI * 2,
          time * 0.22 - d.a * 0.6
        );
        tmpObj.updateMatrix();
        crystals.setMatrixAt(i, tmpObj.matrix);
      }
      crystals.instanceMatrix.needsUpdate = true;

      composer.render();
    };

    live = true;
    animate();

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      composer?.dispose?.();
      caveGeo.dispose();
      caveMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      renderer.dispose();
    };
  });
</script>

<div class="cg23">
  <canvas class="cg23-canvas" bind:this={canvas} aria-hidden="true"></canvas>

  <div class="cg23-overlay">
    <section class="cg23-hero">
      <div class="cg23-hero-inner">
        <div class="cg23-kicker">{duration}</div>
        <h1 class="cg23-title">{title}</h1>
        <div class="cg23-meta">
          <div class="cg23-chip">{theme}</div>
          <div class="cg23-chip">{submissions}</div>
        </div>
        <p class="cg23-lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p class="cg23-lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div class="cg23-orbital" aria-hidden="true">
        <div class="cg23-ring cg23-ring-a"></div>
        <div class="cg23-ring cg23-ring-b"></div>
        <div class="cg23-ring cg23-ring-c"></div>
      </div>
    </section>

    <section class="cg23-grid">
      {#each images as item}
        <a class="cg23-card" href={item.link} target="_blank" rel="noreferrer">
          <div class="cg23-card-media">
            <img class="cg23-img" src={item.src} alt={item.alt} loading="lazy" />
            <div class="cg23-sheen" aria-hidden="true"></div>
          </div>
          <div class="cg23-card-body">
            <div class="cg23-card-title">{item.title}</div>
            {#if item.prize}
              <div class="cg23-card-prize">{item.prize}</div>
            {/if}
            <div class="cg23-card-lorem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
          </div>
        </a>
      {/each}
    </section>

    <section class="cg23-depth">
      <div class="cg23-depth-inner">
        <div class="cg23-depth-title">{theme}</div>
        <p class="cg23-lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p class="cg23-lorem">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </section>
  </div>
</div>

<style>
  .cg23 {
    position: relative;
    min-height: 240vh;
    background: radial-gradient(
        1200px 700px at 50% 15%,
        rgba(157, 63, 255, 0.14),
        rgba(8, 4, 12, 0) 60%
      ),
      radial-gradient(
        900px 650px at 70% 55%,
        rgba(45, 224, 255, 0.12),
        rgba(8, 4, 12, 0) 60%
      ),
      radial-gradient(
        1200px 900px at 30% 75%,
        rgba(255, 122, 45, 0.08),
        rgba(8, 4, 12, 0) 65%
      ),
      linear-gradient(180deg, #020106 0%, #05020c 45%, #03010a 100%);
    color: rgba(245, 242, 255, 0.92);
    overflow: clip;
  }

  .cg23-canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 0;
  }

  .cg23-overlay {
    position: relative;
    z-index: 1;
  }

  .cg23-hero {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: clamp(28px, 4vw, 56px);
  }

  .cg23-hero-inner {
    width: min(980px, 100%);
    border-radius: 28px;
    padding: clamp(18px, 3vw, 34px);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.03)
    );
    border: 1px solid rgba(220, 200, 255, 0.16);
    box-shadow:
      0 26px 90px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    backdrop-filter: blur(14px) saturate(130%);
    -webkit-backdrop-filter: blur(14px) saturate(130%);
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
  }

  .cg23-hero-inner::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: radial-gradient(
        900px 240px at 35% 0%,
        rgba(157, 63, 255, 0.28),
        rgba(8, 4, 12, 0) 70%
      ),
      radial-gradient(
        800px 280px at 80% 20%,
        rgba(45, 224, 255, 0.16),
        rgba(8, 4, 12, 0) 70%
      );
    opacity: 0.85;
    filter: blur(10px);
    pointer-events: none;
    mix-blend-mode: screen;
    animation: cg23Breath 6.5s ease-in-out infinite;
  }

  @keyframes cg23Breath {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 0.78;
    }
    50% {
      transform: translate3d(0, 10px, 0) scale(1.02);
      opacity: 1;
    }
  }

  .cg23-kicker {
    font-size: 14px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    opacity: 0.75;
    position: relative;
  }

  .cg23-title {
    font-size: clamp(40px, 6vw, 74px);
    line-height: 0.96;
    margin: 12px 0 16px;
    position: relative;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.96),
      rgba(186, 148, 255, 0.96),
      rgba(76, 233, 255, 0.92)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.55));
  }

  .cg23-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    position: relative;
  }

  .cg23-chip {
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(220, 200, 255, 0.18);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.09),
      rgba(255, 255, 255, 0.03)
    );
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .cg23-lorem {
    margin-top: 14px;
    max-width: 72ch;
    opacity: 0.8;
    position: relative;
  }

  .cg23-orbital {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.9;
  }

  .cg23-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    width: min(900px, 95vw);
    height: min(900px, 95vw);
    transform: translate(-50%, -50%);
    border-radius: 9999px;
    border: 1px solid rgba(180, 140, 255, 0.11);
    filter: blur(0.2px);
  }

  .cg23-ring-a {
    animation: cg23SpinA 22s linear infinite;
  }

  .cg23-ring-b {
    width: min(740px, 88vw);
    height: min(740px, 88vw);
    border-color: rgba(45, 224, 255, 0.09);
    animation: cg23SpinB 16s linear infinite;
  }

  .cg23-ring-c {
    width: min(560px, 80vw);
    height: min(560px, 80vw);
    border-color: rgba(255, 122, 45, 0.08);
    animation: cg23SpinC 12s linear infinite;
  }

  @keyframes cg23SpinA {
    0% {
      transform: translate(-50%, -50%) rotate(0deg) scale(1);
      box-shadow: 0 0 80px rgba(157, 63, 255, 0.1);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg) scale(1);
      box-shadow: 0 0 80px rgba(45, 224, 255, 0.1);
    }
  }

  @keyframes cg23SpinB {
    0% {
      transform: translate(-50%, -50%) rotate(0deg) scale(1.01);
    }
    100% {
      transform: translate(-50%, -50%) rotate(-360deg) scale(1.01);
    }
  }

  @keyframes cg23SpinC {
    0% {
      transform: translate(-50%, -50%) rotate(0deg) scale(0.99);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg) scale(0.99);
    }
  }

  .cg23-grid {
    width: min(1180px, 100%);
    margin: 0 auto;
    padding: clamp(18px, 3vw, 42px);
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;
  }

  .cg23-card {
    grid-column: span 12;
    border-radius: 22px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.02)
    );
    border: 1px solid rgba(220, 200, 255, 0.14);
    box-shadow:
      0 18px 70px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    transform-style: preserve-3d;
    transform: translateZ(0);
    transition:
      transform 350ms cubic-bezier(0.2, 1, 0.2, 1),
      border-color 350ms cubic-bezier(0.2, 1, 0.2, 1),
      box-shadow 350ms cubic-bezier(0.2, 1, 0.2, 1);
    position: relative;
  }

  .cg23-card:hover {
    transform: translate3d(0, -6px, 0) scale(1.01);
    border-color: rgba(186, 148, 255, 0.28);
    box-shadow:
      0 26px 110px rgba(0, 0, 0, 0.62),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  }

  .cg23-card-media {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }

  .cg23-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.02);
    filter: saturate(1.1) contrast(1.05);
    transition: transform 600ms cubic-bezier(0.2, 1, 0.2, 1);
  }

  .cg23-card:hover .cg23-img {
    transform: scale(1.08);
  }

  .cg23-sheen {
    position: absolute;
    inset: -40%;
    background: conic-gradient(
      from 90deg at 50% 50%,
      rgba(157, 63, 255, 0),
      rgba(157, 63, 255, 0.18),
      rgba(45, 224, 255, 0.14),
      rgba(255, 122, 45, 0.1),
      rgba(157, 63, 255, 0)
    );
    transform: translate3d(-28%, -10%, 0) rotate(12deg);
    filter: blur(16px);
    opacity: 0.55;
    transition:
      opacity 380ms ease,
      transform 900ms cubic-bezier(0.2, 1, 0.2, 1);
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .cg23-card:hover .cg23-sheen {
    opacity: 0.9;
    transform: translate3d(16%, 8%, 0) rotate(-10deg);
  }

  .cg23-card-body {
    padding: 16px 16px 18px;
    display: grid;
    gap: 8px;
  }

  .cg23-card-title {
    font-size: 20px;
    letter-spacing: 0.01em;
    font-weight: 650;
  }

  .cg23-card-prize {
    font-size: 13px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .cg23-card-lorem {
    opacity: 0.78;
    max-width: 70ch;
  }

  @media (min-width: 740px) {
    .cg23-card {
      grid-column: span 6;
    }
  }

  @media (min-width: 1060px) {
    .cg23-card {
      grid-column: span 4;
    }
    .cg23-card:last-child {
      grid-column: span 12;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
    }
    .cg23-card:last-child .cg23-card-media {
      aspect-ratio: auto;
      min-height: 280px;
    }
  }

  .cg23-depth {
    min-height: 80vh;
    display: grid;
    place-items: center;
    padding: clamp(18px, 3vw, 44px);
  }

  .cg23-depth-inner {
    width: min(980px, 100%);
    border-radius: 28px;
    padding: clamp(18px, 3vw, 34px);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.07),
      rgba(255, 255, 255, 0.02)
    );
    border: 1px solid rgba(220, 200, 255, 0.14);
    box-shadow:
      0 28px 110px rgba(0, 0, 0, 0.62),
      0 0 0 1px rgba(255, 255, 255, 0.03) inset;
    backdrop-filter: blur(12px) saturate(130%);
    -webkit-backdrop-filter: blur(12px) saturate(130%);
    position: relative;
    overflow: hidden;
  }

  .cg23-depth-title {
    font-size: clamp(26px, 3.2vw, 40px);
    margin-bottom: 12px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.92),
      rgba(186, 148, 255, 0.92)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.6));
  }

  @media (prefers-reduced-motion: reduce) {
    .cg23-hero-inner::before,
    .cg23-ring-a,
    .cg23-ring-b,
    .cg23-ring-c {
      animation: none;
    }
    .cg23-card,
    .cg23-img,
    .cg23-sheen {
      transition: none;
    }
  }
</style>
