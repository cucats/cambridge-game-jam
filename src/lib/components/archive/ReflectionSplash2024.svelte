<script>
  import { onMount } from "svelte";

  let host;
  let ready = false;

  onMount(() => {
    let destroy = () => {};

    const boot = async () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const THREE = await import("three");
      const { Reflector } = await import(
        "three/examples/jsm/objects/Reflector.js"
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
      const { ShaderPass } = await import(
        "three/examples/jsm/postprocessing/ShaderPass.js"
      );
      const { RGBShiftShader } = await import(
        "three/examples/jsm/shaders/RGBShiftShader.js"
      );

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = prefersReducedMotion ? 0.95 : 1.08;

      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x06060b, 0.08);

      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 140);
      camera.position.set(0, 2.6, 11.5);

      const clock = new THREE.Clock();

      const ambient = new THREE.AmbientLight(0xffffff, 0.22);
      scene.add(ambient);

      const key = new THREE.PointLight(0x8b5cf6, 2.0, 60, 2.0);
      key.position.set(7, 6, 10);
      scene.add(key);

      const rim = new THREE.PointLight(0x22d3ee, 1.6, 80, 2.0);
      rim.position.set(-9, 4, -12);
      scene.add(rim);

      const fill = new THREE.DirectionalLight(0xffffff, 0.35);
      fill.position.set(-2, 7, 3);
      scene.add(fill);

      const mirrorGeo = new THREE.PlaneGeometry(40, 40);
      const mirror = new Reflector(mirrorGeo, {
        clipBias: 0.003,
        textureWidth: Math.max(512, Math.floor(window.innerWidth * 0.75)),
        textureHeight: Math.max(512, Math.floor(window.innerHeight * 0.75)),
        color: 0x0a0a12,
      });

      mirror.rotation.x = -Math.PI / 2;
      mirror.position.y = -2.6;
      scene.add(mirror);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 80),
        new THREE.MeshStandardMaterial({
          color: 0x070712,
          roughness: 0.92,
          metalness: 0.05,
        })
      );

      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2.62;
      scene.add(floor);

      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0xe7f3ff,
        metalness: 0.55,
        roughness: 0.25,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transmission: 0.08,
        thickness: 0.35,
        ior: 1.25,
        flatShading: true,
      });

      const core = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2.1, 0),
        coreMat
      );

      core.position.set(0, 0.2, 0);
      scene.add(core);

      const shardCount = prefersReducedMotion ? 96 : 190;
      const shardGeo = new THREE.IcosahedronGeometry(1, 0);
      const shardMat = new THREE.MeshStandardMaterial({
        color: 0xbde3ff,
        metalness: 0.92,
        roughness: 0.18,
        emissive: 0x0b1022,
        emissiveIntensity: 0.65,
        flatShading: true,
      });

      const shards = new THREE.InstancedMesh(shardGeo, shardMat, shardCount);
      shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(shards);

      const shardBase = new Array(shardCount);
      const tmpObj = new THREE.Object3D();

      for (let i = 0; i < shardCount; i++) {
        const radius = THREE.MathUtils.lerp(3.2, 16.5, Math.pow(Math.random(), 0.78));
        const theta = Math.random() * Math.PI * 2;
        const y = THREE.MathUtils.lerp(-2.2, 5.5, Math.random());

        tmpObj.position.set(
          Math.cos(theta) * radius,
          y,
          Math.sin(theta) * radius
        );

        tmpObj.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        const s = THREE.MathUtils.lerp(0.16, 0.95, Math.random());
        tmpObj.scale.set(s, s, s);
        tmpObj.updateMatrix();

        shards.setMatrixAt(i, tmpObj.matrix);

        shardBase[i] = {
          radius,
          theta,
          y,
          spin: THREE.MathUtils.lerp(0.15, 0.95, Math.random()) * (Math.random() < 0.5 ? -1 : 1),
          drift: THREE.MathUtils.lerp(0.25, 1.2, Math.random()),
          lift: THREE.MathUtils.lerp(0.25, 1.1, Math.random()),
          wobble: THREE.MathUtils.lerp(0.3, 1.4, Math.random()),
          scale: s,
        };
      }

      const dustCount = prefersReducedMotion ? 1200 : 2600;
      const dustGeo = new THREE.BufferGeometry();
      const dustPos = new Float32Array(dustCount * 3);
      const dustSeed = new Float32Array(dustCount);

      for (let i = 0; i < dustCount; i++) {
        const r = THREE.MathUtils.lerp(2.8, 20.0, Math.pow(Math.random(), 0.72));
        const a = Math.random() * Math.PI * 2;
        const y = THREE.MathUtils.lerp(-2.4, 7.5, Math.random());
        dustPos[i * 3 + 0] = Math.cos(a) * r;
        dustPos[i * 3 + 1] = y;
        dustPos[i * 3 + 2] = Math.sin(a) * r;
        dustSeed[i] = Math.random() * 1000;
      }

      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));

      const dust = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({
          color: 0xc7d2fe,
          size: 0.02,
          sizeAttenuation: true,
          transparent: true,
          opacity: prefersReducedMotion ? 0.35 : 0.6,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );

      dust.position.y = 0.15;
      scene.add(dust);

      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        prefersReducedMotion ? 0.55 : 0.95,
        0.8,
        0.08
      );

      composer.addPass(bloom);

      const afterimage = new AfterimagePass();
      afterimage.uniforms.damp.value = prefersReducedMotion ? 0.985 : 0.92;
      composer.addPass(afterimage);

      const rgbShift = new ShaderPass(RGBShiftShader);
      rgbShift.uniforms.amount.value = prefersReducedMotion ? 0.00035 : 0.00135;
      composer.addPass(rgbShift);

      const pointer = { x: 0, y: 0 };
      const onPointerMove = (e) => {
        const x = e.clientX / Math.max(1, window.innerWidth) - 0.5;
        const y = e.clientY / Math.max(1, window.innerHeight) - 0.5;
        pointer.x = THREE.MathUtils.clamp(x, -0.5, 0.5);
        pointer.y = THREE.MathUtils.clamp(y, -0.5, 0.5);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });

      let w = 1;
      let h = 1;

      const resize = () => {
        const rect = host.getBoundingClientRect();
        w = Math.max(1, Math.floor(rect.width));
        h = Math.max(1, Math.floor(rect.height));

        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        composer.setSize(w, h);
        bloom.setSize(w, h);
        rgbShift.uniforms.amount.value = (prefersReducedMotion ? 0.00035 : 0.00135) * (w / 1200);
      };

      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      let raf = 0;
      let running = true;

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!running) return;

        const t = clock.getElapsedTime();

        const orbit = prefersReducedMotion ? 0.35 : 0.55;
        const camZ = prefersReducedMotion ? 12.4 : 11.4;
        camera.position.x = Math.sin(t * 0.32) * 1.6 + pointer.x * 4.0;
        camera.position.y = 2.6 + Math.sin(t * 0.28) * orbit - pointer.y * 2.4;
        camera.position.z = camZ + Math.cos(t * 0.26) * 0.65;
        camera.lookAt(0, 0.1, 0);

        core.rotation.x = t * 0.34;
        core.rotation.y = t * 0.48;
        core.rotation.z = t * 0.22;

        const keyHue = (t * 0.06 + 0.72) % 1;
        const rimHue = (t * 0.08 + 0.52) % 1;
        key.color.setHSL(keyHue, 0.85, 0.62);
        rim.color.setHSL(rimHue, 0.9, 0.62);

        key.position.x = Math.cos(t * 0.55) * 9.5;
        key.position.z = Math.sin(t * 0.55) * 9.5;
        key.position.y = 3.8 + Math.sin(t * 0.75) * 1.2;

        rim.position.x = Math.cos(t * 0.38 + 1.7) * -10.5;
        rim.position.z = Math.sin(t * 0.38 + 1.7) * 10.5;
        rim.position.y = 2.8 + Math.cos(t * 0.52) * 1.1;

        dust.rotation.y = t * 0.06;
        dust.rotation.x = Math.sin(t * 0.04) * 0.08;

        for (let i = 0; i < shardCount; i++) {
          const b = shardBase[i];
          const a = b.theta + t * b.drift * 0.35;
          const y = b.y + Math.sin(t * b.lift + b.theta) * b.wobble;

          tmpObj.position.set(
            Math.cos(a) * b.radius,
            y,
            Math.sin(a) * b.radius
          );

          tmpObj.rotation.set(
            t * b.spin + b.theta,
            t * b.spin * 0.85 + b.theta * 0.4,
            t * b.spin * 0.6
          );

          tmpObj.scale.set(b.scale, b.scale, b.scale);
          tmpObj.updateMatrix();
          shards.setMatrixAt(i, tmpObj.matrix);
        }

        shards.instanceMatrix.needsUpdate = true;

        const pulse = prefersReducedMotion ? 0.55 : 0.85;
        bloom.strength = 0.75 + Math.sin(t * 0.7) * 0.2 * pulse;
        rgbShift.uniforms.angle.value = t * 0.2;

        composer.render();
      };

      const onVis = () => {
        running = document.visibilityState === "visible";
      };

      document.addEventListener("visibilitychange", onVis);

      raf = requestAnimationFrame(tick);
      ready = true;

      destroy = () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pointermove", onPointerMove);
        ro.disconnect();

        composer?.dispose?.();
        shardGeo.dispose();
        shardMat.dispose();
        mirrorGeo.dispose();
        floor.geometry.dispose();
        floor.material.dispose();
        core.geometry.dispose();
        coreMat.dispose();
        dustGeo.dispose();
        dust.material.dispose();
        renderer.dispose();
        renderer.domElement?.remove?.();
      };
    };

    boot();

    return () => destroy();
  });
</script>

<div class="reflection-2024-stage" bind:this={host} aria-hidden="true"></div>

{#if !ready}
  <div class="reflection-2024-fade"></div>
{/if}

<style>
  .reflection-2024-stage {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background:
      radial-gradient(1200px 800px at 25% 20%, rgba(139, 92, 246, 0.18), transparent 60%),
      radial-gradient(900px 700px at 78% 30%, rgba(34, 211, 238, 0.18), transparent 62%),
      radial-gradient(900px 900px at 70% 90%, rgba(251, 113, 133, 0.12), transparent 62%),
      linear-gradient(180deg, #04040a, #04040a 50%, #020207);
  }

  .reflection-2024-stage :global(canvas) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .reflection-2024-fade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(900px 700px at 50% 40%, rgba(255, 255, 255, 0.08), transparent 55%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.65));
    animation: reflection-2024-fade 900ms ease both;
  }

  @keyframes reflection-2024-fade {
    from {
      opacity: 1;
      filter: blur(10px) saturate(115%);
    }

    to {
      opacity: 0;
      filter: blur(0px) saturate(100%);
    }
  }
</style>
