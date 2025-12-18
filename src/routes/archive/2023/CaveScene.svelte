<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";

  let canvas;
  let host;

  onMount(() => {
    if (!canvas || !host) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040b, 0.085);

    const camera = new THREE.PerspectiveCamera(55, host.clientWidth / host.clientHeight, 0.01, 80);
    camera.position.set(0, 0.2, 0.6);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(new THREE.Vector2(host.clientWidth, host.clientHeight), 0.95, 0.55, 0.0);
    const trails = new AfterimagePass();
    trails.uniforms.damp.value = 0.9;
    composer.addPass(renderPass);
    composer.addPass(trails);
    composer.addPass(bloom);

    const clock = new THREE.Clock();

    const ambient = new THREE.AmbientLight(0x15223f, 0.25);
    scene.add(ambient);

    const key = new THREE.PointLight(0x6ad0ff, 1.2, 25, 2.0);
    key.position.set(0.5, 0.3, 0.2);
    scene.add(key);

    const ember = new THREE.PointLight(0xff7a2f, 1.0, 14, 2.2);
    ember.position.set(-0.25, -0.15, 0.15);
    scene.add(ember);

    const curve = (() => {
      const pts = [];
      let z = 0;
      for (let i = 0; i < 36; i++) {
        const a = i * 0.45;
        pts.push(
          new THREE.Vector3(
            Math.sin(a) * 0.7 + Math.sin(a * 1.7) * 0.2,
            Math.cos(a * 0.9) * 0.35 + Math.sin(a * 1.35) * 0.12,
            z
          )
        );
        z -= 0.55;
      }
      return new THREE.CatmullRomCurve3(pts);
    })();

    const caveGeo = new THREE.TubeGeometry(curve, 1200, 1.05, 38, false);
    const caveMat = new THREE.MeshStandardMaterial({
      color: 0x0a1022,
      roughness: 1.0,
      metalness: 0.0,
      emissive: 0x000000,
      side: THREE.BackSide
    });

    let caveShader;
    caveMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uPulse = { value: 0 };
      caveShader = shader;
      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uPulse;
        varying float vRock;
        float hash31(vec3 p) {
          p = fract(p * 0.1031);
          p += dot(p, p.yzx + 33.33);
          return fract((p.x + p.y) * p.z);
        }
        float noise(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
          float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
          float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
          float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
          float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
          float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
          float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
          float n111 = hash31(i + vec3(1.0, 1.0, 1.0));
          float n00 = mix(n000, n100, f.x);
          float n10 = mix(n010, n110, f.x);
          float n01 = mix(n001, n101, f.x);
          float n11 = mix(n011, n111, f.x);
          float n0 = mix(n00, n10, f.y);
          float n1 = mix(n01, n11, f.y);
          return mix(n0, n1, f.z);
        }
        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.55;
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p *= 2.03;
            a *= 0.55;
          }
          return v;
        }
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
          float n1 = fbm(wp * 1.25 + vec3(0.0, 0.0, uTime * 0.25));
          float n2 = fbm(wp * 2.85 + vec3(uTime * 0.07, 0.0, 0.0));
          float cr = smoothstep(0.15, 0.9, n1);
          float sp = 0.06 + 0.08 * uPulse;
          transformed += normal * (n2 * sp + cr * 0.05);
          vRock = n1;
        `
      );

      shader.fragmentShader =
        `
        uniform float uTime;
        uniform float uPulse;
        varying float vRock;
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `
          float veins = smoothstep(0.62, 0.98, vRock) * (0.2 + 0.8 * uPulse);
          vec3 glow = vec3(0.10, 0.55, 0.85) * veins * 0.35;
          gl_FragColor.rgb += glow;
          #include <dithering_fragment>
        `
      );
    };

    const cave = new THREE.Mesh(caveGeo, caveMat);
    cave.frustumCulled = false;
    scene.add(cave);

    const spikeGeo = new THREE.ConeGeometry(0.04, 0.22, 7, 1, true);
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0x060a16,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
    const spikes = new THREE.InstancedMesh(spikeGeo, spikeMat, 900);
    const tmpM = new THREE.Matrix4();
    const tmpQ = new THREE.Quaternion();
    const tmpP = new THREE.Vector3();
    const tmpS = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < spikes.count; i++) {
      const t = Math.random();
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const basisX = new THREE.Vector3().crossVectors(up, tangent).normalize();
      const basisY = new THREE.Vector3().crossVectors(tangent, basisX).normalize();
      const ang = Math.random() * Math.PI * 2;
      const r = 0.9 + Math.random() * 0.18;
      tmpP.copy(p)
        .addScaledVector(basisX, Math.cos(ang) * r)
        .addScaledVector(basisY, Math.sin(ang) * r);
      const n = new THREE.Vector3().subVectors(tmpP, p).normalize();
      tmpQ.setFromUnitVectors(up, n.multiplyScalar(-1));
      const sc = 0.65 + Math.random() * 1.55;
      tmpS.setScalar(sc);
      tmpM.compose(tmpP, tmpQ, tmpS);
      spikes.setMatrixAt(i, tmpM);
    }
    spikes.instanceMatrix.needsUpdate = true;
    scene.add(spikes);

    const crystalGeo = new THREE.OctahedronGeometry(0.06, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x0b1b3b,
      roughness: 0.25,
      metalness: 0.25,
      emissive: 0x0a4b7e,
      emissiveIntensity: 1.1
    });
    const crystals = new THREE.InstancedMesh(crystalGeo, crystalMat, 180);
    for (let i = 0; i < crystals.count; i++) {
      const t = Math.random();
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const basisX = new THREE.Vector3().crossVectors(up, tangent).normalize();
      const basisY = new THREE.Vector3().crossVectors(tangent, basisX).normalize();
      const ang = Math.random() * Math.PI * 2;
      const r = 0.58 + Math.random() * 0.36;
      tmpP.copy(p)
        .addScaledVector(basisX, Math.cos(ang) * r)
        .addScaledVector(basisY, Math.sin(ang) * r);
      tmpQ.setFromEuler(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI));
      const sc = 0.65 + Math.random() * 1.6;
      tmpS.setScalar(sc);
      tmpM.compose(tmpP, tmpQ, tmpS);
      crystals.setMatrixAt(i, tmpM);
    }
    crystals.instanceMatrix.needsUpdate = true;
    scene.add(crystals);

    const sparkCount = 1400;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkSeed = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i++) {
      const t = Math.random();
      const p = curve.getPointAt(t);
      const a = Math.random() * Math.PI * 2;
      const rr = Math.sqrt(Math.random()) * 0.78;
      sparkPos[i * 3 + 0] = p.x + Math.cos(a) * rr;
      sparkPos[i * 3 + 1] = p.y + Math.sin(a) * rr;
      sparkPos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.7;
      sparkSeed[i] = Math.random();
    }
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute("seed", new THREE.BufferAttribute(sparkSeed, 1));
    const sparkMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: dpr }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float seed;
        varying float vA;
        void main() {
          vec3 p = position;
          float t = uTime * 0.8 + seed * 12.0;
          p.x += sin(t + p.z * 2.2) * 0.05;
          p.y += cos(t + p.z * 1.8) * 0.05;
          vA = 0.25 + 0.75 * smoothstep(0.0, 1.0, sin(t) * 0.5 + 0.5);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (2.0 + 4.0 * vA) * uPixelRatio * (1.0 / max(0.35, -mv.z));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vA;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = dot(uv, uv);
          float a = smoothstep(0.25, 0.0, d) * vA;
          vec3 c = mix(vec3(1.0, 0.55, 0.2), vec3(0.35, 0.9, 1.0), vA);
          gl_FragColor = vec4(c, a);
        }
      `
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    let target = 0.18;
    let travel = target;
    let parX = 0;
    let parY = 0;
    let parXT = 0;
    let parYT = 0;

    const onScroll = () => {
      const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const s = Math.min(1, Math.max(0, window.scrollY / h));
      target = 0.08 + s * 0.9;
    };
    onScroll();

    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      parXT = nx;
      parYT = ny;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      bloom.setSize(w, h);
    });
    ro.observe(host);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.033, clock.getDelta());
      const t = clock.elapsedTime;

      parX = THREE.MathUtils.damp(parX, parXT, 5.5, dt);
      parY = THREE.MathUtils.damp(parY, parYT, 5.5, dt);
      travel = THREE.MathUtils.damp(travel, target, 1.8, dt);

      key.intensity = 1.1 + (Math.sin(t * 1.3) * 0.5 + 0.5) * 0.9;
      ember.intensity = 0.7 + (Math.sin(t * 2.1 + 1.2) * 0.5 + 0.5) * 0.9;
      ember.position.x = -0.25 + Math.sin(t * 0.8) * 0.12;
      ember.position.y = -0.17 + Math.cos(t * 1.2) * 0.06;

      const p = curve.getPointAt(travel);
      const look = curve.getPointAt(Math.min(1, travel + 0.01));
      camera.position.copy(p);
      camera.position.x += parX * 0.07;
      camera.position.y += parY * 0.05;
      camera.lookAt(look.x + parX * 0.09, look.y + parY * 0.06, look.z);

      const pulse = 0.35 + 0.65 * (Math.sin(t * 0.9) * 0.5 + 0.5);
      if (caveShader) {
        caveShader.uniforms.uTime.value = t;
        caveShader.uniforms.uPulse.value = pulse;
      }
      sparkMat.uniforms.uTime.value = t;

      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      caveGeo.dispose();
      caveMat.dispose();
      spikeGeo.dispose();
      spikeMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      composer.dispose();
      renderer.dispose();
    };
  });
</script>

<div class="host" bind:this={host} aria-hidden="true">
  <canvas class="c" bind:this={canvas}></canvas>
</div>

<style>
  .host {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .c {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
