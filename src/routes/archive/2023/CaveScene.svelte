<script>
  import { onMount } from "svelte";

  let { activeIndex = -1 } = $props();
  let canvas;

  onMount(() => {
    let dispose = () => {};
    let cancelled = false;

    (async () => {
      const [
        THREE,
        { EffectComposer },
        { RenderPass },
        { UnrealBloomPass },
        { AfterimagePass },
        { ShaderPass },
      ] = await Promise.all([
        import("three"),
        import("three/examples/jsm/postprocessing/EffectComposer.js"),
        import("three/examples/jsm/postprocessing/RenderPass.js"),
        import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
        import("three/examples/jsm/postprocessing/AfterimagePass.js"),
        import("three/examples/jsm/postprocessing/ShaderPass.js"),
      ]);

      if (cancelled) return;

      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(DPR);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x02040a, 0.055);

      const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180);
      camera.position.set(0, 0.3, 7.2);

      const clock = new THREE.Clock();
      const root = new THREE.Group();
      scene.add(root);

      const hemi = new THREE.HemisphereLight(0x53ffe6, 0x12070a, 0.6);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xffb56a, 1.4);
      key.position.set(3.4, 4.2, 2.4);
      key.castShadow = false;
      scene.add(key);

      const fill = new THREE.PointLight(0x7a5cff, 1.05, 60, 2.1);
      fill.position.set(-2.8, 0.9, 6);
      scene.add(fill);

      const rim = new THREE.SpotLight(
        0x7affde,
        2.1,
        80,
        Math.PI / 7,
        0.75,
        1.8,
      );
      rim.position.set(0, 6.5, -8);
      rim.target.position.set(0, 0, -18);
      scene.add(rim);
      scene.add(rim.target);

      const noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = 256;
      noiseCanvas.height = 256;
      const nctx = noiseCanvas.getContext("2d");
      const img = nctx.createImageData(256, 256);
      let seed = 1337;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.pow(rnd(), 1.8);
        img.data[i] = 22 + v * 70;
        img.data[i + 1] = 28 + v * 85;
        img.data[i + 2] = 38 + v * 100;
        img.data[i + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
      const rockTex = new THREE.CanvasTexture(noiseCanvas);
      rockTex.wrapS = THREE.RepeatWrapping;
      rockTex.wrapT = THREE.RepeatWrapping;
      rockTex.repeat.set(4.2, 3.4);
      rockTex.anisotropy = 8;

      const curvePoints = [];
      for (let i = 0; i < 44; i++) {
        const t = i / 43;
        const x = Math.sin(t * Math.PI * 3.4) * (0.9 + 0.5 * Math.sin(t * 7.4));
        const y =
          Math.cos(t * Math.PI * 2.6) * 0.45 + Math.sin(t * 11.2) * 0.12;
        const z = -t * 76;
        curvePoints.push(new THREE.Vector3(x, y, z));
      }
      const path = new THREE.CatmullRomCurve3(curvePoints);

      const tube = new THREE.TubeGeometry(path, 980, 6.2, 30, false);
      const pos = tube.attributes.position;
      const normal = tube.attributes.normal;

      const hash = (x, y, z) => {
        const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
        return s - Math.floor(s);
      };
      const smooth = (t) => t * t * (3 - 2 * t);
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

        const x00 = n000 * (1 - u) + n100 * u;
        const x10 = n010 * (1 - u) + n110 * u;
        const x01 = n001 * (1 - u) + n101 * u;
        const x11 = n011 * (1 - u) + n111 * u;
        const y0 = x00 * (1 - v) + x10 * v;
        const y1 = x01 * (1 - v) + x11 * v;
        return y0 * (1 - w) + y1 * w;
      };

      const v3 = new THREE.Vector3();
      const n3 = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        n3.fromBufferAttribute(normal, i);
        const t = (v3.z + 76) / -76;
        const wobble = 0.55 + 0.75 * Math.sin(t * Math.PI * 5.2);
        const n =
          (noise3(v3.x * 0.22, v3.y * 0.2, v3.z * 0.08) * 2 - 1) * 0.95 +
          (noise3(v3.x * 0.55, v3.y * 0.5, v3.z * 0.18) * 2 - 1) * 0.34;
        const pinch = 0.16 + 0.22 * Math.pow(Math.sin(t * Math.PI), 2);
        v3.addScaledVector(n3, (n * wobble - pinch) * 0.9);
        pos.setXYZ(i, v3.x, v3.y, v3.z);
      }
      tube.computeVertexNormals();

      const caveMat = new THREE.MeshStandardMaterial({
        map: rockTex,
        color: 0x0d141b,
        roughness: 0.93,
        metalness: 0.04,
        emissive: 0x041018,
        emissiveIntensity: 0.3,
      });
      const cave = new THREE.Mesh(tube, caveMat);
      cave.renderOrder = 0;
      root.add(cave);

      const stalGeo = new THREE.ConeGeometry(0.24, 2.2, 7, 1);
      const stalMat = new THREE.MeshStandardMaterial({
        map: rockTex,
        color: 0x0b1016,
        roughness: 0.96,
        metalness: 0.02,
        emissive: 0x031019,
        emissiveIntensity: 0.18,
      });
      const stal = new THREE.InstancedMesh(stalGeo, stalMat, 230);
      const tmp = new THREE.Object3D();
      for (let i = 0; i < 230; i++) {
        const t = i / 229;
        const p = path.getPointAt(t);
        const tangent = path.getTangentAt(t).normalize();
        const angle = (Math.sin(i * 2.7) * 0.5 + 0.5) * Math.PI * 2;
        const radius = 5.4 + (Math.sin(i * 1.8) * 0.5 + 0.5) * 1.2;
        tmp.position.set(
          p.x + Math.cos(angle) * radius,
          p.y + Math.sin(angle) * radius * 0.35 + (i % 2 ? 3.4 : -3.7),
          p.z,
        );
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          tangent,
        );
        tmp.quaternion.copy(q);
        tmp.rotateZ(angle + t * 9);
        tmp.rotateX(i % 2 ? Math.PI : 0);
        const s = 0.65 + noise3(i * 0.07, i * 0.02, 0) * 0.9;
        tmp.scale.setScalar(s);
        tmp.updateMatrix();
        stal.setMatrixAt(i, tmp.matrix);
      }
      stal.instanceMatrix.needsUpdate = true;
      root.add(stal);

      const cryGeo = new THREE.TetrahedronGeometry(0.38, 0);
      const cryMat = new THREE.MeshStandardMaterial({
        color: 0x6affdf,
        roughness: 0.28,
        metalness: 0.08,
        emissive: 0x1fffd0,
        emissiveIntensity: 1.0,
      });
      const crystals = new THREE.InstancedMesh(cryGeo, cryMat, 96);
      for (let i = 0; i < 96; i++) {
        const t = (i + 1) / 98;
        const p = path.getPointAt(t);
        const angle = i * 1.37;
        const r = 3.9 + noise3(i * 0.11, 0.4, 0.2) * 1.9;
        tmp.position.set(
          p.x + Math.cos(angle) * r,
          p.y + Math.sin(angle * 1.2) * 1.9,
          p.z,
        );
        tmp.rotation.set(i * 0.7, i * 1.25, i * 0.45);
        const s = 0.55 + Math.pow(noise3(i * 0.08, 1.2, 0.6), 2) * 1.35;
        tmp.scale.setScalar(s);
        tmp.updateMatrix();
        crystals.setMatrixAt(i, tmp.matrix);
      }
      crystals.instanceMatrix.needsUpdate = true;
      root.add(crystals);

      const sparkleCount = 3400;
      const sparkleGeo = new THREE.BufferGeometry();
      const sparklePos = new Float32Array(sparkleCount * 3);
      const sparkleSeed = new Float32Array(sparkleCount);
      for (let i = 0; i < sparkleCount; i++) {
        const t = rnd();
        const p = path.getPointAt(t);
        const a = rnd() * Math.PI * 2;
        const r = 5.4 * Math.pow(rnd(), 0.7);
        sparklePos[i * 3] = p.x + Math.cos(a) * r;
        sparklePos[i * 3 + 1] = p.y + Math.sin(a) * r * 0.5;
        sparklePos[i * 3 + 2] = p.z + (rnd() - 0.5) * 2.0;
        sparkleSeed[i] = rnd();
      }
      sparkleGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(sparklePos, 3),
      );
      sparkleGeo.setAttribute(
        "aSeed",
        new THREE.BufferAttribute(sparkleSeed, 1),
      );
      const sparkleMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAccent: { value: new THREE.Color(0x6affdf) },
          uAccent2: { value: new THREE.Color(0xffb86e) },
        },
        vertexShader: `
          uniform float uTime;
          attribute float aSeed;
          varying float vA;
          varying vec3 vC;
          void main() {
            vec3 p = position;
            float w = sin(uTime * 0.9 + aSeed * 8.0) * 0.35 + sin(uTime * 1.7 + aSeed * 4.0) * 0.2;
            p.x += w * 0.28;
            p.y += cos(uTime * 0.7 + aSeed * 10.0) * 0.22;
            vA = 0.25 + 0.75 * smoothstep(0.0, 1.0, sin(uTime * 1.6 + aSeed * 9.0) * 0.5 + 0.5);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (2.0 + 7.0 * vA) * (1.0 / max(0.4, -mv.z * 0.08));
            vC = p;
          }
        `,
        fragmentShader: `
          uniform vec3 uAccent;
          uniform vec3 uAccent2;
          varying float vA;
          varying vec3 vC;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = dot(uv, uv);
            float m = smoothstep(0.25, 0.0, d);
            float hue = fract(vC.z * 0.03 + vC.x * 0.07);
            vec3 c = mix(uAccent, uAccent2, smoothstep(0.1, 0.9, hue));
            gl_FragColor = vec4(c, m * vA);
          }
        `,
      });
      const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
      sparkles.frustumCulled = false;
      root.add(sparkles);

      const vhsShader = {
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0 },
          uStrength: { value: 0.12 },
          uShift: { value: 0.006 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float uTime;
          uniform float uStrength;
          uniform float uShift;
          varying vec2 vUv;
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          void main() {
            vec2 uv = vUv;
            float n = hash(vec2(uv.y * 380.0, floor(uTime * 60.0)));
            float j = (n - 0.5) * uStrength;
            uv.x += j;
            float s = sin((uv.y + uTime * 0.12) * 42.0) * 0.0015;
            uv.x += s;
            vec4 c0 = texture2D(tDiffuse, uv);
            vec4 r = texture2D(tDiffuse, uv + vec2(uShift, 0.0));
            vec4 b = texture2D(tDiffuse, uv - vec2(uShift, 0.0));
            vec3 rgb = vec3(r.r, c0.g, b.b);
            gl_FragColor = vec4(rgb, 1.0);
          }
        `,
      };

      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        0.9,
        0.8,
        0.18,
      );
      composer.addPass(bloom);

      const after = new AfterimagePass(0.86);
      composer.addPass(after);

      const vhs = new ShaderPass(vhsShader);
      composer.addPass(vhs);

      const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };

      const onResize = () => resize();
      window.addEventListener("resize", onResize, { passive: true });
      resize();

      let raf = 0;
      const base = {
        bloom: bloom.strength,
        after: after.uniforms.damp.value,
        vhs: vhs.uniforms.uStrength.value,
      };

      const animate = () => {
        const t = clock.getElapsedTime();
        sparkleMat.uniforms.uTime.value = t;
        vhs.uniforms.uTime.value = t;

        const hover = activeIndex >= 0 ? 1 : 0;
        const idx = Math.max(0, activeIndex);
        const targetHue = hover ? (idx * 0.13) % 1 : 0.54;
        const accent = new THREE.Color().setHSL(targetHue, 0.95, 0.64);
        sparkleMat.uniforms.uAccent.value.lerp(accent, 0.12);
        sparkleMat.uniforms.uAccent2.value.lerp(
          new THREE.Color(0xffb56a),
          0.08,
        );

        const fly = t * (0.55 + hover * 0.18);
        const tt = (fly * 0.032) % 1;
        const p = path.getPointAt(tt);
        const p2 = path.getPointAt((tt + 0.01) % 1);
        camera.position.lerp(
          new THREE.Vector3(p.x, p.y + 0.2, p.z + 2.7),
          0.13,
        );
        camera.lookAt(p2.x, p2.y, p2.z - 7);

        const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + idx * 0.6);
        cryMat.emissiveIntensity = 0.75 + pulse * (0.9 + hover * 0.6);
        caveMat.emissiveIntensity =
          0.22 + 0.22 * Math.sin(t * 0.7) + hover * 0.12;
        stalMat.emissiveIntensity = 0.14 + 0.08 * Math.sin(t * 0.9);

        fill.intensity = 0.85 + 0.35 * Math.sin(t * 0.8) + hover * 0.4;
        key.intensity = 1.2 + 0.35 * Math.sin(t * 1.1 + 1.2) + hover * 0.35;
        rim.intensity = 1.6 + 0.45 * Math.sin(t * 0.6 + 2.2) + hover * 0.5;

        const boost = 0.25 * hover;
        bloom.strength = base.bloom + boost * (0.8 + pulse * 0.55);
        after.uniforms.damp.value = base.after - boost * 0.09;
        vhs.uniforms.uStrength.value = base.vhs + boost * 0.12;
        vhs.uniforms.uShift.value = 0.006 + boost * 0.005;

        const roll =
          Math.sin(t * 0.7) * 0.015 + hover * (Math.sin(t * 1.1) * 0.022);
        camera.rotation.z = roll;

        composer.render();
        raf = requestAnimationFrame(animate);
      };

      raf = requestAnimationFrame(animate);

      dispose = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        composer?.dispose?.();
        renderer.dispose();
        tube.dispose();
        stalGeo.dispose();
        cryGeo.dispose();
        sparkleGeo.dispose();
        rockTex.dispose();
        caveMat.dispose();
        stalMat.dispose();
        cryMat.dispose();
        sparkleMat.dispose();
      };
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  });
</script>

<div class="wrap">
  <canvas bind:this={canvas}></canvas>
  <div class="mist"></div>
  <div class="mist mist2"></div>
  <div class="vignette"></div>
</div>

<style>
  .wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .mist {
    position: absolute;
    inset: -20%;
    background:
      radial-gradient(
        900px 520px at 30% 20%,
        rgba(122, 255, 222, 0.12),
        transparent 55%
      ),
      radial-gradient(
        900px 600px at 70% 55%,
        rgba(255, 186, 112, 0.1),
        transparent 60%
      ),
      radial-gradient(
        900px 680px at 50% 70%,
        rgba(122, 92, 255, 0.1),
        transparent 62%
      );
    filter: blur(34px);
    opacity: 0.85;
    mix-blend-mode: screen;
    transform: translate3d(0, 0, 0);
    animation: fog 9.5s ease-in-out infinite;
  }

  .mist2 {
    opacity: 0.6;
    filter: blur(48px);
    animation-duration: 13.5s;
    animation-direction: reverse;
  }

  @keyframes fog {
    0%,
    100% {
      transform: translate3d(-2%, -1.5%, 0) scale(1.02);
    }
    50% {
      transform: translate3d(2.5%, 2%, 0) scale(1.06);
    }
  }

  .vignette {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        120% 100% at 50% 30%,
        rgba(0, 0, 0, 0) 20%,
        rgba(0, 0, 0, 0.25) 55%,
        rgba(0, 0, 0, 0.72) 100%
      ),
      radial-gradient(
        900px 520px at 50% 15%,
        rgba(0, 0, 0, 0) 10%,
        rgba(0, 0, 0, 0.25) 70%
      );
    pointer-events: none;
  }
</style>
