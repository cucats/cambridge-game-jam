<script>
  import { onDestroy, onMount } from "svelte";
  import * as THREE from "three";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

  let { activeIndex = -1, markerCount = 0 } = $props();

  let canvas;
  let raf = 0;

  let renderer;
  let scene;
  let camera;
  let composer;

  let caveMesh;
  let crystals;
  let crystalData = [];

  let pointerX = 0;
  let pointerY = 0;
  let scrollY = 0;

  const canUseDom = typeof window !== "undefined";

  const prefersReduced =
    canUseDom &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, t) => {
    const x = clamp01((t - a) / (b - a));
    return x * x * (3 - 2 * x);
  };
  const hash = (n) => {
    const s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
  };
  const rand2 = (a, b) => hash(a * 173.71 + b * 91.17);

  const caveVertex = `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vN;
    uniform float uTime;
    float hash21(vec2 p){
      p = fract(p*vec2(123.34, 345.45));
      p += dot(p, p+34.345);
      return fract(p.x*p.y);
    }
    float noise(vec3 p){
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f*f*(3.0-2.0*f);
      float n000 = hash21(i.xy + vec2(0.0, 0.0) + i.z*37.0);
      float n100 = hash21(i.xy + vec2(1.0, 0.0) + i.z*37.0);
      float n010 = hash21(i.xy + vec2(0.0, 1.0) + i.z*37.0);
      float n110 = hash21(i.xy + vec2(1.0, 1.0) + i.z*37.0);
      float n001 = hash21(i.xy + vec2(0.0, 0.0) + (i.z+1.0)*37.0);
      float n101 = hash21(i.xy + vec2(1.0, 0.0) + (i.z+1.0)*37.0);
      float n011 = hash21(i.xy + vec2(0.0, 1.0) + (i.z+1.0)*37.0);
      float n111 = hash21(i.xy + vec2(1.0, 1.0) + (i.z+1.0)*37.0);
      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n111, f.x);
      float nxy0 = mix(nx00, nx10, f.y);
      float nxy1 = mix(nx01, nx11, f.y);
      return mix(nxy0, nxy1, f.z);
    }
    float fbm(vec3 p){
      float v = 0.0;
      float a = 0.5;
      for(int i=0;i<5;i++){
        v += a*noise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }
    void main(){
      vUv = uv;
      vec3 p = position;
      vec3 n = normal;
      float t = uTime * 0.15;
      float ridge = fbm(p*0.55 + vec3(0.0, 0.0, t));
      float crumble = fbm(p*1.35 - vec3(t*0.4, 0.0, 0.0));
      float disp = (ridge*0.9 + crumble*0.35);
      disp = pow(disp, 1.35);
      p += n * disp * 1.55;
      vPos = (modelMatrix * vec4(p,1.0)).xyz;
      vN = normalize(normalMatrix * n);
      gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
    }
  `;

  const caveFragment = `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vN;
    uniform float uTime;
    uniform vec3 uEye;
    float sat(float x){return clamp(x,0.0,1.0);}
    float hash21(vec2 p){
      p = fract(p*vec2(123.34, 345.45));
      p += dot(p, p+34.345);
      return fract(p.x*p.y);
    }
    float noise(vec3 p){
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f*f*(3.0-2.0*f);
      float n000 = hash21(i.xy + vec2(0.0, 0.0) + i.z*37.0);
      float n100 = hash21(i.xy + vec2(1.0, 0.0) + i.z*37.0);
      float n010 = hash21(i.xy + vec2(0.0, 1.0) + i.z*37.0);
      float n110 = hash21(i.xy + vec2(1.0, 1.0) + i.z*37.0);
      float n001 = hash21(i.xy + vec2(0.0, 0.0) + (i.z+1.0)*37.0);
      float n101 = hash21(i.xy + vec2(1.0, 0.0) + (i.z+1.0)*37.0);
      float n011 = hash21(i.xy + vec2(0.0, 1.0) + (i.z+1.0)*37.0);
      float n110b = hash21(i.xy + vec2(1.0, 1.0) + (i.z+1.0)*37.0);
      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n110b, f.x);
      float nxy0 = mix(nx00, nx10, f.y);
      float nxy1 = mix(nx01, nx11, f.y);
      return mix(nxy0, nxy1, f.z);
    }
    float fbm(vec3 p){
      float v = 0.0;
      float a = 0.5;
      for(int i=0;i<5;i++){
        v += a*noise(p);
        p *= 2.01;
        a *= 0.5;
      }
      return v;
    }
    void main(){
      vec3 n = normalize(vN);
      vec3 v = normalize(uEye - vPos);
      float fres = pow(1.0 - sat(dot(n, v)), 3.2);
      float wet = fbm(vPos*0.22 + vec3(uTime*0.06, 0.0, 0.0));
      wet = smoothstep(0.52, 0.88, wet);
      vec3 base = mix(vec3(0.03, 0.03, 0.045), vec3(0.07, 0.065, 0.08), fbm(vPos*0.07));
      vec3 cold = vec3(0.02, 0.08, 0.09);
      vec3 warm = vec3(0.09, 0.04, 0.02);
      float band = fbm(vPos*0.12 + vec3(0.0, 0.0, uTime*0.02));
      vec3 tint = mix(cold, warm, smoothstep(0.25, 0.85, band));
      float grime = fbm(vPos*0.34);
      base *= mix(0.65, 1.12, grime);
      vec3 color = base + tint*0.12;
      color += fres * vec3(0.08, 0.12, 0.15);
      color = mix(color, color + vec3(0.08, 0.12, 0.14)*wet, wet);
      float fog = sat((length(vPos) - 10.0) / 55.0);
      vec3 fogCol = vec3(0.01, 0.015, 0.02);
      color = mix(color, fogCol, fog*0.55);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const makeTube = () => {
    const points = [];
    for (let i = 0; i < 80; i++) {
      const t = i / 79;
      const z = -t * 120;
      const sway = Math.sin(t * Math.PI * 2.0) * 3.5;
      const sway2 = Math.cos(t * Math.PI * 3.0) * 2.5;
      points.push(new THREE.Vector3(sway, sway2, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 800, 10.5, 28, false);
    geo.scale(1.35, 1.15, 1.0);
    geo.rotateY(Math.PI);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uEye: { value: new THREE.Vector3() },
      },
      vertexShader: caveVertex,
      fragmentShader: caveFragment,
      side: THREE.BackSide,
    });
    return new THREE.Mesh(geo, mat);
  };

  const makeCrystals = () => {
    crystals = new THREE.Group();
    crystalData = [];
    const count = Math.max(1, markerCount);
    const geo = new THREE.OctahedronGeometry(1, 0);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0ff0ff"),
      roughness: 0.15,
      metalness: 0.0,
      transmission: 0.6,
      thickness: 0.8,
      ior: 1.45,
      emissive: new THREE.Color("#07f2ff"),
      emissiveIntensity: 0.35,
      clearcoat: 0.65,
      clearcoatRoughness: 0.08,
    });

    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geo, mat.clone());
      const u = i / Math.max(1, count - 1);
      const z = lerp(-15, -105, u);
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * lerp(3.5, 7.5, rand2(i + 2, 9));
      const y = lerp(-2.6, 3.4, rand2(i + 7, 3));
      m.position.set(x, y, z);
      const s = lerp(0.6, 1.35, rand2(i + 11, 2));
      m.scale.setScalar(s);
      m.rotation.set(
        rand2(i + 2, 17) * Math.PI,
        rand2(i + 5, 19) * Math.PI,
        rand2(i + 9, 23) * Math.PI
      );
      crystals.add(m);
      crystalData.push({
        mesh: m,
        baseScale: s,
        baseEmissive: 0.35,
        hue: rand2(i + 3, 31),
      });
    }
    return crystals;
  };

  const makeMist = () => {
    const count = prefersReduced ? 200 : 1200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const a = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(hash(i * 11.7), 0.35);
      const ang = hash(i * 4.1) * Math.PI * 2;
      pos[i * 3 + 0] = Math.cos(ang) * r * 9.5;
      pos[i * 3 + 1] = lerp(-6.5, 6.5, hash(i * 9.3));
      pos[i * 3 + 2] = lerp(-12, -118, hash(i * 2.2));
      a[i] = hash(i * 8.8);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(a, 1));
    const mat = new THREE.PointsMaterial({
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color("#6ffcff"),
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    return pts;
  };

  const setSizes = () => {
    if (!renderer || !camera || !composer || !canvas) return;
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.setSize(w, h);
  };

  const onPointer = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    pointerX = (x - 0.5) * 2;
    pointerY = (y - 0.5) * 2;
  };

  const onScroll = () => {
    scrollY = window.scrollY || 0;
  };

  const tick = (tMs) => {
    const t = tMs * 0.001;
    if (caveMesh?.material?.uniforms?.uTime) caveMesh.material.uniforms.uTime.value = t;
    if (caveMesh?.material?.uniforms?.uEye) caveMesh.material.uniforms.uEye.value.copy(camera.position);

    const prog = clamp01(scrollY / Math.max(1, window.innerHeight * 1.6));
    const z = lerp(6.0, -62.0, smoothstep(0.0, 1.0, prog));
    const bob = Math.sin(t * 0.55) * 0.35;

    const targetX = pointerX * 1.75;
    const targetY = -pointerY * 1.15 + bob;
    camera.position.x = lerp(camera.position.x, targetX, prefersReduced ? 0.06 : 0.045);
    camera.position.y = lerp(camera.position.y, targetY, prefersReduced ? 0.06 : 0.045);
    camera.position.z = lerp(camera.position.z, z, prefersReduced ? 0.05 : 0.03);

    camera.lookAt(0, 0, camera.position.z - 10);

    for (let i = 0; i < crystalData.length; i++) {
      const d = crystalData[i];
      const m = d.mesh;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.65 + d.hue * 6.283 + i * 0.35);
      const hot = i === activeIndex ? 1 : 0;
      const boost = lerp(1.0, 1.55, hot) * lerp(0.95, 1.18, pulse);
      m.scale.setScalar(d.baseScale * boost);
      m.rotation.x += prefersReduced ? 0.0015 : 0.0035;
      m.rotation.y += prefersReduced ? 0.0012 : 0.0028;
      m.rotation.z += prefersReduced ? 0.0011 : 0.0022;
      const mat = m.material;
      mat.emissiveIntensity = d.baseEmissive + pulse * 0.35 + hot * 1.15;
      mat.color.setHSL(0.52 + (d.hue - 0.5) * 0.18, 0.95, lerp(0.45, 0.6, pulse));
      mat.emissive.setHSL(0.52 + (d.hue - 0.5) * 0.18, 1.0, 0.55);
    }

    composer.render();
    raf = requestAnimationFrame(tick);
  };

  onMount(() => {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(new THREE.Color("#04060a"), 0.028);

    camera = new THREE.PerspectiveCamera(55, 1, 0.1, 220);
    camera.position.set(0, 0.3, 6);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prefersReduced ? 1.25 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      prefersReduced ? 0.7 : 1.35,
      0.45,
      0.2
    );
    composer.addPass(bloom);

    const amb = new THREE.AmbientLight(new THREE.Color("#0a1520"), 0.85);
    scene.add(amb);

    const key = new THREE.PointLight(new THREE.Color("#4fefff"), 2.8, 90, 2);
    key.position.set(0.5, 3.5, -12);
    scene.add(key);

    const rim = new THREE.PointLight(new THREE.Color("#ff5a2d"), 1.4, 120, 2);
    rim.position.set(-6.5, -1.5, -75);
    scene.add(rim);

    caveMesh = makeTube();
    scene.add(caveMesh);

    scene.add(makeCrystals());
    scene.add(makeMist());

    setSizes();
    window.addEventListener("resize", setSizes, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {};
  });

  onDestroy(() => {
    if (canUseDom && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(raf);
    if (canUseDom) {
      window.removeEventListener("resize", setSizes);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    }
    if (composer) composer.dispose();
    if (scene) {
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
          else o.material.dispose?.();
        }
      });
    }
    renderer?.dispose?.();
    renderer = undefined;
    composer = undefined;
    scene = undefined;
    camera = undefined;
  });
</script>

<canvas bind:this={canvas} class="cave-canvas"></canvas>

<style>
  .cave-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    filter: saturate(1.12) contrast(1.08);
  }
</style>
