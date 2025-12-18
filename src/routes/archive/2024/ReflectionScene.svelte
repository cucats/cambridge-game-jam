<script>
  import { onMount } from "svelte";

  let host;

  onMount(() => {
    let disposed = false;
    let cleanup = () => {};

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const pointer = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      const rect = host.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      pointer.x = (px - 0.5) * 2;
      pointer.y = (0.5 - py) * 2;
    };

    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    const onResize = () => {
      if (!host) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      resize(width, height);
    };

    let resize = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import(
        "three/addons/environments/RoomEnvironment.js"
      );
      const { Reflector } = await import("three/addons/objects/Reflector.js");
      const { EffectComposer } = await import(
        "three/addons/postprocessing/EffectComposer.js"
      );
      const { RenderPass } = await import(
        "three/addons/postprocessing/RenderPass.js"
      );
      const { UnrealBloomPass } = await import(
        "three/addons/postprocessing/UnrealBloomPass.js"
      );

      if (disposed) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#05050a");
      scene.fog = new THREE.Fog(scene.background, 10, 55);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      host.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(
        52,
        Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight),
        0.1,
        120
      );
      camera.position.set(0, 2.6, 11);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const hemi = new THREE.HemisphereLight(0xbbeeff, 0x0a0710, 0.75);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(8, 9, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.bias = -0.0001;
      scene.add(key);

      const rim = new THREE.DirectionalLight(0x9a66ff, 1.25);
      rim.position.set(-8, 4, -10);
      scene.add(rim);

      const stage = new THREE.Group();
      scene.add(stage);

      const mirror = new Reflector(new THREE.PlaneGeometry(42, 42), {
        clipBias: 0.003,
        textureWidth: 1024,
        textureHeight: 1024,
        color: 0x07070a,
      });
      mirror.rotation.x = -Math.PI / 2;
      mirror.position.y = -1.35;
      stage.add(mirror);

      const pedestalGeo = new THREE.CylinderGeometry(4.5, 5.4, 1.2, 8, 1);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: "#0b0b12",
        metalness: 0.25,
        roughness: 0.9,
        flatShading: true,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -1.0;
      pedestal.receiveShadow = true;
      stage.add(pedestal);

      const monolithGeo = new THREE.DodecahedronGeometry(1.55, 0);
      const monolithMat = new THREE.MeshPhysicalMaterial({
        color: "#d7f7ff",
        metalness: 1,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        flatShading: true,
      });
      const monolith = new THREE.Mesh(monolithGeo, monolithMat);
      monolith.castShadow = true;
      monolith.position.y = 0.5;
      stage.add(monolith);

      const shardsCount = 160;
      const shardGeo = new THREE.IcosahedronGeometry(0.62, 0);
      const shardMat = new THREE.MeshPhysicalMaterial({
        color: "#a4f0ff",
        metalness: 1,
        roughness: 0.14,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        flatShading: true,
      });
      const shards = new THREE.InstancedMesh(shardGeo, shardMat, shardsCount);
      shards.castShadow = true;
      stage.add(shards);

      const shardData = Array.from({ length: shardsCount }, (_, i) => {
        const radius = 2.6 + Math.random() * 8.5;
        const angle = (i / shardsCount) * Math.PI * 2 + Math.random() * 0.65;
        const speed = 0.12 + Math.random() * 0.42;
        const lift = 0.35 + Math.random() * 2.8;
        const wobble = 0.6 + Math.random() * 1.6;
        const phase = Math.random() * Math.PI * 2;
        const scale = 0.35 + Math.random() * 1.1;
        const hue = (0.52 + Math.random() * 0.22) % 1;
        const tilt = (Math.random() - 0.5) * 1.6;
        return { radius, angle, speed, lift, wobble, phase, scale, hue, tilt };
      });

      const tmpPos = new THREE.Vector3();
      const tmpQuat = new THREE.Quaternion();
      const tmpScale = new THREE.Vector3();
      const tmpEuler = new THREE.Euler();
      const tmpMat = new THREE.Matrix4();
      const tmpColor = new THREE.Color();

      for (let i = 0; i < shardsCount; i++) {
        const d = shardData[i];
        tmpPos.set(
          Math.cos(d.angle) * d.radius,
          (Math.random() - 0.2) * 1.6,
          Math.sin(d.angle) * d.radius
        );
        tmpEuler.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        tmpQuat.setFromEuler(tmpEuler);
        tmpScale.setScalar(d.scale);
        tmpMat.compose(tmpPos, tmpQuat, tmpScale);
        shards.setMatrixAt(i, tmpMat);
        tmpColor.setHSL(d.hue, 0.7, 0.62);
        shards.setColorAt(i, tmpColor);
      }
      shards.instanceMatrix.needsUpdate = true;
      if (shards.instanceColor) shards.instanceColor.needsUpdate = true;

      const dustCount = 1300;
      const dustGeo = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(dustCount * 3);
      const dustSeed = new Float32Array(dustCount);

      for (let i = 0; i < dustCount; i++) {
        const r = 6 + Math.pow(Math.random(), 0.55) * 22;
        const a = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.25) * 10.5;
        dustPositions[i * 3 + 0] = Math.cos(a) * r;
        dustPositions[i * 3 + 1] = y;
        dustPositions[i * 3 + 2] = Math.sin(a) * r;
        dustSeed[i] = Math.random() * Math.PI * 2;
      }

      dustGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(dustPositions, 3)
      );

      const dustMat = new THREE.PointsMaterial({
        size: 0.035,
        color: 0xbad9ff,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const dust = new THREE.Points(dustGeo, dustMat);
      stage.add(dust);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(host.clientWidth, host.clientHeight),
        1.05,
        0.7,
        0.08
      );
      composer.addPass(bloom);

      resize = (width, height) => {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        camera.aspect = Math.max(1e-6, width / height);
        camera.updateProjectionMatrix();
        composer.setSize(width, height);
        bloom.setSize(width, height);
      };

      const baseLook = new THREE.Vector3(0, 0.25, 0);
      const targetCam = new THREE.Vector3();
      const damp = (a, b, t) => a + (b - a) * (1 - Math.exp(-t));

      let last = performance.now();
      let time = 0;

      const tick = (now) => {
        if (disposed) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        time += dt;

        const intensity = prefersReducedMotion ? 0.28 : 1;

        monolith.rotation.x += dt * 0.55 * intensity;
        monolith.rotation.y += dt * 0.9 * intensity;
        monolith.position.y = 0.5 + Math.sin(time * 1.2) * 0.18 * intensity;

        mirror.position.y = -1.35 + Math.sin(time * 0.7) * 0.06 * intensity;
        mirror.rotation.z = Math.sin(time * 0.35) * 0.035 * intensity;

        dust.rotation.y += dt * 0.06 * intensity;
        const posAttr = dust.geometry.getAttribute("position");
        for (let i = 0; i < dustCount; i++) {
          const baseY = dustPositions[i * 3 + 1];
          posAttr.array[i * 3 + 1] =
            baseY + Math.sin(time * 1.4 + dustSeed[i]) * 0.22 * intensity;
        }
        posAttr.needsUpdate = true;

        for (let i = 0; i < shardsCount; i++) {
          const d = shardData[i];
          const a = d.angle + time * d.speed * intensity;
          const r = d.radius + Math.sin(time * d.wobble + d.phase) * 0.28;
          const y = Math.sin(time * 1.15 + d.phase) * d.lift * 0.22;
          tmpPos.set(Math.cos(a) * r, y + 0.2, Math.sin(a) * r);
          tmpEuler.set(
            time * (0.6 + d.speed) + d.tilt,
            time * (0.8 + d.speed * 0.7) + d.phase,
            time * (0.4 + d.speed * 0.45)
          );
          tmpQuat.setFromEuler(tmpEuler);
          tmpScale.setScalar(d.scale * (0.9 + Math.sin(time + d.phase) * 0.09));
          tmpMat.compose(tmpPos, tmpQuat, tmpScale);
          shards.setMatrixAt(i, tmpMat);
        }
        shards.instanceMatrix.needsUpdate = true;

        const camBob = 0.35 * intensity;
        targetCam.set(
          Math.sin(time * 0.35) * 2.25 +
            pointer.x * 1.8 +
            Math.sin(time * 1.1) * 0.25,
          2.55 + Math.sin(time * 0.55) * camBob + pointer.y * 0.8,
          11 + Math.cos(time * 0.35) * 1.25
        );
        camera.position.x = damp(camera.position.x, targetCam.x, 6 * dt);
        camera.position.y = damp(camera.position.y, targetCam.y, 6 * dt);
        camera.position.z = damp(camera.position.z, targetCam.z, 6 * dt);
        camera.lookAt(baseLook);

        if (prefersReducedMotion) renderer.render(scene, camera);
        else composer.render();

        requestAnimationFrame(tick);
      };

      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerleave", onPointerLeave, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      onResize();
      requestAnimationFrame(tick);

      cleanup = () => {
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("resize", onResize);
        composer.dispose();
        dustGeo.dispose();
        dustMat.dispose();
        shardGeo.dispose();
        shardMat.dispose();
        monolithGeo.dispose();
        monolithMat.dispose();
        pedestalGeo.dispose();
        pedestalMat.dispose();
        pmrem.dispose();
        renderer.dispose();
        try {
          renderer.forceContextLoss();
        } catch {
        }
        const canvas = renderer.domElement;
        if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
      };

      if (disposed) cleanup();
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  });
</script>

<div class="scene" bind:this={host} aria-hidden="true"></div>

<style>
  .scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: radial-gradient(1200px 900px at 50% 35%, #0c0d18 0%, #05050a 60%, #020207 100%);
  }

  .scene :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
