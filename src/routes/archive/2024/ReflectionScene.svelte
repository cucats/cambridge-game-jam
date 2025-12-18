<script>
  import { onMount } from "svelte";

  let canvas;

  onMount(() => {
    let dispose = () => {};
    let raf = 0;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const start = async () => {
      const THREE = await import("three");
      const { EffectComposer } = await import(
        "three/examples/jsm/postprocessing/EffectComposer.js"
      );
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await import(
        "three/examples/jsm/postprocessing/UnrealBloomPass.js"
      );
      const { AfterimagePass } = await import(
        "three/examples/jsm/postprocessing/AfterimagePass.js"
      );

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x05030a);
      scene.fog = new THREE.FogExp2(0x05030a, 0.075);

      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 70);
      camera.position.set(0, 2.35, 8.8);

      const hemi = new THREE.HemisphereLight(0xbbe6ff, 0x120014, 0.65);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xffc8ff, 2.6);
      key.position.set(6, 10, 3);
      scene.add(key);

      const rim = new THREE.PointLight(0x66f0ff, 36, 38, 2);
      rim.position.set(-6, 2.4, -2.2);
      scene.add(rim);

      const pulse = new THREE.PointLight(0xff4dd8, 18, 25, 2);
      pulse.position.set(2.3, 3.5, 1.4);
      scene.add(pulse);

      const ambient = new THREE.AmbientLight(0x1a1024, 0.65);
      scene.add(ambient);

      const domeGeo = new THREE.IcosahedronGeometry(40, 1);
      domeGeo.scale(-1, 1, 1);
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0x070112,
        roughness: 1,
        metalness: 0,
        flatShading: true,
        emissive: 0x0b0620,
        emissiveIntensity: 0.6,
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 8;
      scene.add(dome);

      const cubeTarget = new THREE.WebGLCubeRenderTarget(256, {
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        colorSpace: THREE.SRGBColorSpace,
      });
      const cubeCamera = new THREE.CubeCamera(0.1, 60, cubeTarget);
      scene.add(cubeCamera);

      const mirrorGeo = new THREE.PlaneGeometry(28, 28, 1, 1);
      const mirrorMat = new THREE.MeshPhysicalMaterial({
        color: 0x0c0b12,
        metalness: 1,
        roughness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 2.2,
      });
      mirrorMat.envMap = cubeTarget.texture;
      const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
      mirror.rotation.x = -Math.PI / 2;
      mirror.position.y = -1.15;
      scene.add(mirror);

      const glowGeo = new THREE.RingGeometry(2.2, 4.9, 64, 1);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff4dd8,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = mirror.position.y + 0.004;
      scene.add(glow);

      const shardGroup = new THREE.Group();
      shardGroup.position.y = 0;
      scene.add(shardGroup);

      const rand = (a, b) => a + Math.random() * (b - a);
      const clamp01 = (v) => Math.min(1, Math.max(0, v));

      const palette = [0xff4dd8, 0x66f0ff, 0xa58bff, 0xff6b6b, 0x58ffb1, 0xffffff];

      const shardCount = reduced ? 42 : 140;
      const shards = [];

      const makeLowPoly = (baseGeo, amp = 0.12) => {
        const g = baseGeo.clone();
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i);
          const y = p.getY(i);
          const z = p.getZ(i);
          p.setXYZ(i, x + rand(-amp, amp), y + rand(-amp, amp), z + rand(-amp, amp));
        }
        p.needsUpdate = true;
        g.computeVertexNormals();
        return g;
      };

      const baseA = makeLowPoly(new THREE.IcosahedronGeometry(1, 0), 0.11);
      const baseB = makeLowPoly(new THREE.DodecahedronGeometry(1, 0), 0.14);
      const baseC = makeLowPoly(new THREE.TetrahedronGeometry(1, 0), 0.16);

      const projectFrames = [
        { src: "/2024/blight.png" },
        { src: "/2024/reflect-upon-your-actions.png" },
        { src: "/2024/reflected.png" },
        { src: "/2024/asymmetry.png" },
        { src: "/2024/coulda-woulda-buddha.png" },
      ];

      const textureLoader = new THREE.TextureLoader();
      const frameGroup = new THREE.Group();
      frameGroup.position.y = 0.2;
      scene.add(frameGroup);

      const frameW = 2.35;
      const frameH = 1.35;
      const frameDepth = 0.08;

      const frameInner = new THREE.MeshStandardMaterial({
        color: 0x0b0714,
        metalness: 1,
        roughness: 0.28,
        emissive: 0x030108,
        emissiveIntensity: 0.9,
      });

      const frameOuter = new THREE.MeshPhysicalMaterial({
        color: 0x11101b,
        metalness: 1,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.25,
        envMapIntensity: 2,
      });
      frameOuter.envMap = cubeTarget.texture;

      const frameGeo = new THREE.BoxGeometry(frameW, frameH, frameDepth, 1, 1, 1);

      const texPromises = projectFrames.map(
        (f) =>
          new Promise((resolve) => {
            textureLoader.load(
              f.src,
              (t) => {
                t.colorSpace = THREE.SRGBColorSpace;
                t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
                resolve(t);
              },
              undefined,
              () => resolve(null)
            );
          })
      );

      const textures = await Promise.all(texPromises);

      const frameMeshes = textures.map((t, i) => {
        const texMat =
          t == null
            ? new THREE.MeshStandardMaterial({
                color: palette[i % palette.length],
                emissive: palette[i % palette.length],
                emissiveIntensity: 0.35,
                roughness: 0.75,
                metalness: 0.15,
                flatShading: true,
              })
            : new THREE.MeshStandardMaterial({
                map: t,
                roughness: 0.55,
                metalness: 0.12,
                emissive: 0x070112,
                emissiveIntensity: 0.6,
              });

        const mesh = new THREE.Mesh(frameGeo, [frameOuter, frameOuter, frameOuter, frameOuter, texMat, frameInner]);
        const angle = (i / textures.length) * Math.PI * 2;
        const r = 6.2;
        mesh.position.set(Math.cos(angle) * r, rand(0.8, 2.25), Math.sin(angle) * r);
        mesh.rotation.y = -angle + Math.PI;
        mesh.rotation.z = rand(-0.15, 0.15);
        mesh.scale.setScalar(0.92 + Math.random() * 0.18);
        frameGroup.add(mesh);
        return mesh;
      });

      const shardMat = (c) =>
        new THREE.MeshPhysicalMaterial({
          color: c,
          metalness: 0.85,
          roughness: 0.22,
          clearcoat: 1,
          clearcoatRoughness: 0.28,
          reflectivity: 0.75,
          envMapIntensity: 2.4,
          flatShading: true,
        });

      for (let i = 0; i < shardCount; i++) {
        const g = i % 3 === 0 ? baseA : i % 3 === 1 ? baseB : baseC;
        const c = palette[Math.floor(Math.random() * palette.length)];
        const mesh = new THREE.Mesh(g, shardMat(c));
        mesh.material.envMap = cubeTarget.texture;

        const ring = 1.25 + Math.pow(Math.random(), 0.25) * 8.6;
        const theta = Math.random() * Math.PI * 2;
        const y = rand(-0.1, 3.8);
        mesh.position.set(Math.cos(theta) * ring, y, Math.sin(theta) * ring);

        const s = 0.14 + Math.pow(Math.random(), 2) * 0.95;
        mesh.scale.setScalar(s);

        mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));

        const v = new THREE.Vector3(rand(-0.35, 0.35), rand(-0.2, 0.55), rand(-0.35, 0.35));
        const w = new THREE.Vector3(rand(-0.8, 0.8), rand(-1.3, 1.3), rand(-0.8, 0.8));

        shards.push({
          mesh,
          v,
          w,
          anchor: mesh.position.clone(),
          seed: Math.random() * 1000,
          pop: 0,
        });
        shardGroup.add(mesh);
      }

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.3, 0.2, 0.92);
      bloom.strength = reduced ? 0.75 : 1.55;
      bloom.threshold = 0.12;
      bloom.radius = 0.55;
      composer.addPass(bloom);

      const trail = new AfterimagePass();
      trail.uniforms["damp"].value = reduced ? 0.88 : 0.93;
      if (!reduced) composer.addPass(trail);

      const pointer = { x: 0, y: 0 };
      const pointerTo = { x: 0, y: 0 };

      const onMove = (e) => {
        const r = canvas.getBoundingClientRect();
        const x = (e.clientX - r.left) / Math.max(1, r.width);
        const y = (e.clientY - r.top) / Math.max(1, r.height);
        pointerTo.x = (x - 0.5) * 2;
        pointerTo.y = (y - 0.5) * 2;
      };

      const onTap = () => {
        const kick = reduced ? 0.9 : 2.1;
        for (const s of shards) {
          s.pop = 1;
          s.v.x += rand(-kick, kick);
          s.v.y += rand(0.6, 1.9) * kick;
          s.v.z += rand(-kick, kick);
          s.w.x += rand(-2.8, 2.8);
          s.w.y += rand(-2.8, 2.8);
          s.w.z += rand(-2.8, 2.8);
        }
        if (!reduced) trail.uniforms["damp"].value = 0.86;
      };

      canvas.addEventListener("pointermove", onMove, { passive: true });
      canvas.addEventListener("pointerdown", onTap, { passive: true });

      let w = 1;
      let h = 1;
      const resize = () => {
        w = Math.max(1, canvas.clientWidth);
        h = Math.max(1, canvas.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        bloom.setSize(w, h);
      };

      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      resize();

      const clock = new THREE.Clock();

      const step = () => {
        raf = requestAnimationFrame(step);

        const t = clock.getElapsedTime();
        const dt = Math.min(0.033, clock.getDelta());

        pointer.x += (pointerTo.x - pointer.x) * 0.08;
        pointer.y += (pointerTo.y - pointer.y) * 0.08;

        const orbit = 0.55 + Math.sin(t * 0.25) * 0.06;
        const yaw = pointer.x * 0.65 + Math.sin(t * 0.19) * 0.22;
        const pitch = pointer.y * 0.35 + Math.sin(t * 0.31) * 0.06;

        const camR = 8.3 + Math.sin(t * 0.28) * 0.55;
        camera.position.x = Math.sin(yaw) * camR;
        camera.position.z = Math.cos(yaw) * camR;
        camera.position.y = 2.25 + pitch * 1.1 + Math.sin(t * 0.47) * 0.22;
        camera.lookAt(0, orbit, 0);

        rim.position.x = -6 + Math.sin(t * 0.95) * 1.5;
        rim.position.z = -2.2 + Math.cos(t * 0.8) * 1.9;
        pulse.position.x = 2.3 + Math.sin(t * 1.25) * 2.1;
        pulse.position.z = 1.4 + Math.cos(t * 1.05) * 2.2;
        pulse.intensity = 13 + (Math.sin(t * 3.4) * 0.5 + 0.5) * 18;

        glow.scale.setScalar(1 + Math.sin(t * 1.1) * 0.06);
        glow.material.opacity = 0.08 + (Math.sin(t * 2.0) * 0.5 + 0.5) * 0.08;

        frameGroup.rotation.y = t * 0.12;
        for (let i = 0; i < frameMeshes.length; i++) {
          const m = frameMeshes[i];
          const bob = Math.sin(t * 1.15 + i * 0.9) * 0.22;
          m.position.y = 1.45 + bob + Math.sin(t * 0.33 + i) * 0.28;
          m.rotation.z = Math.sin(t * 0.7 + i * 0.8) * 0.07;
        }

        for (const s of shards) {
          const m = s.mesh;

          const k = Math.sin(t * 0.8 + s.seed) * 0.5 + 0.5;
          const pull = 0.6 + k * 0.7;

          const ax = Math.sin(t * 0.6 + s.seed) * 0.8;
          const az = Math.cos(t * 0.55 + s.seed) * 0.8;

          const targetX = s.anchor.x + ax;
          const targetZ = s.anchor.z + az;

          const buoy = Math.sin(t * 1.2 + s.seed * 1.7) * (0.12 + s.mesh.scale.x * 0.35);
          const targetY = s.anchor.y + buoy;

          s.v.x += (targetX - m.position.x) * dt * pull;
          s.v.y += (targetY - m.position.y) * dt * pull;
          s.v.z += (targetZ - m.position.z) * dt * pull;

          const drag = 1 - 0.12 * clamp01(dt * 60);
          s.v.multiplyScalar(drag);
          s.w.multiplyScalar(1 - 0.08 * clamp01(dt * 60));

          m.position.x += s.v.x * dt;
          m.position.y += s.v.y * dt;
          m.position.z += s.v.z * dt;

          const floor = mirror.position.y + 0.22;
          if (m.position.y < floor) {
            m.position.y = floor;
            s.v.y = Math.abs(s.v.y) * (0.55 + Math.random() * 0.2);
            s.v.x *= 0.9;
            s.v.z *= 0.9;
          }

          m.rotation.x += (s.w.x + (pointer.y * 0.6 + 0.4) * 0.25) * dt;
          m.rotation.y += (s.w.y + (pointer.x * 0.8 + 0.2) * 0.25) * dt;
          m.rotation.z += s.w.z * dt;

          if (s.pop > 0) {
            s.pop = Math.max(0, s.pop - dt * 0.65);
          }
        }

        if (!reduced) {
          trail.uniforms["damp"].value += (0.93 - trail.uniforms["damp"].value) * 0.03;
        }

        mirror.visible = false;
        cubeCamera.position.set(0, 0.2, 0);
        cubeCamera.update(renderer, scene);
        mirror.visible = true;

        composer.render();
      };

      step();

      dispose = () => {
        cancelAnimationFrame(raf);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerdown", onTap);
        ro.disconnect();

        for (const s of shards) {
          s.mesh.geometry?.dispose?.();
          if (Array.isArray(s.mesh.material)) {
            for (const m of s.mesh.material) m?.dispose?.();
          } else {
            s.mesh.material?.dispose?.();
          }
        }

        for (const m of frameMeshes) {
          if (Array.isArray(m.material)) {
            for (const mm of m.material) mm?.dispose?.();
          } else {
            m.material?.dispose?.();
          }
          m.geometry?.dispose?.();
        }

        for (const t of textures) t?.dispose?.();

        domeGeo.dispose();
        domeMat.dispose();
        mirrorGeo.dispose();
        mirrorMat.dispose();
        glowGeo.dispose();
        glowMat.dispose();
        frameGeo.dispose();
        frameInner.dispose();
        frameOuter.dispose();
        cubeTarget.dispose();

        composer.dispose();
        renderer.dispose();
      };
    };

    start();

    return () => dispose();
  });
</script>

<canvas bind:this={canvas} class="scene" aria-hidden="true"></canvas>

<style>
  .scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    touch-action: none;
  }
</style>
