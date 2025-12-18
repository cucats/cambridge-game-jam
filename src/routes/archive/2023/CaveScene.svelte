<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";

  let container;

  onMount(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(new THREE.Color("#05040a"), 0.06);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 80);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.2, 0.65, 0.14);
    composer.addPass(bloom);

    const after = new AfterimagePass();
    after.uniforms.damp.value = reduceMotion ? 1 : 0.885;
    composer.addPass(after);

    const ambient = new THREE.AmbientLight(0x16112c, 0.55);
    scene.add(ambient);

    const head = new THREE.PointLight(0x86a6ff, 3.2, 22, 2);
    scene.add(head);

    const ember = new THREE.PointLight(0xff6b2a, 2.0, 16, 2);
    scene.add(ember);

    const points = [];
    let z = 0;
    for (let i = 0; i < 180; i += 1) {
      const x = Math.sin(i * 0.22) * 2.1 + Math.sin(i * 0.041) * 1.2;
      const y = Math.cos(i * 0.18) * 1.6 + Math.sin(i * 0.063) * 0.9;
      points.push(new THREE.Vector3(x, y, z));
      z -= 1.25;
    }

    const curve = new THREE.CatmullRomCurve3(points);

    const tubeGeo = new THREE.TubeGeometry(curve, 1600, 2.75, 44, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#07060b"),
      roughness: 0.98,
      metalness: 0.02,
      emissive: new THREE.Color("#020106"),
      emissiveIntensity: 0.65,
    });

    const cave = new THREE.Mesh(tubeGeo, tubeMat);
    cave.scale.set(1, 1, -1);
    scene.add(cave);

    const shardGeo = new THREE.ConeGeometry(0.12, 0.95, 7, 1);
    const shardMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#081024"),
      roughness: 0.25,
      metalness: 0.15,
      emissive: new THREE.Color("#2a6cff"),
      emissiveIntensity: 2.35,
    });

    const shardCount = 260;
    const shards = new THREE.InstancedMesh(shardGeo, shardMat, shardCount);
    shards.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const p = new THREE.Vector3();
    const t = new THREE.Vector3();
    const n = new THREE.Vector3();
    const b = new THREE.Vector3();

    for (let i = 0; i < shardCount; i += 1) {
      const u = (i / shardCount + Math.random() * 0.08) % 1;
      curve.getPointAt(u, p);
      curve.getTangentAt(u, t).normalize();
      n.set(0, 1, 0).cross(t).normalize();
      b.copy(t).cross(n).normalize();

      const ring = 2.2 + Math.random() * 0.85;
      const a = Math.random() * Math.PI * 2;
      const off = n.clone().multiplyScalar(Math.cos(a) * ring).add(b.clone().multiplyScalar(Math.sin(a) * ring));

      dummy.position.copy(p).add(off);
      dummy.rotation.set(0, 0, 0);
      dummy.lookAt(p);
      dummy.rotateZ(Math.random() * Math.PI * 2);
      dummy.scale.setScalar(0.55 + Math.random() * 1.2);
      dummy.updateMatrix();
      shards.setMatrixAt(i, dummy.matrix);
    }
    shards.instanceMatrix.needsUpdate = true;
    scene.add(shards);

    const dustCount = 2200;
    const dustPos = new Float32Array(dustCount * 3);
    const dustCol = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i += 1) {
      const u = Math.random();
      curve.getPointAt(u, p);
      curve.getTangentAt(u, t).normalize();
      n.set(0, 1, 0).cross(t).normalize();
      b.copy(t).cross(n).normalize();

      const ring = Math.random() * 2.25;
      const a = Math.random() * Math.PI * 2;
      const off = n.clone().multiplyScalar(Math.cos(a) * ring).add(b.clone().multiplyScalar(Math.sin(a) * ring));

      dustPos[i * 3 + 0] = p.x + off.x;
      dustPos[i * 3 + 1] = p.y + off.y;
      dustPos[i * 3 + 2] = p.z + off.z;

      const c = new THREE.Color().setHSL(0.63 + Math.random() * 0.08, 0.9, 0.6);
      dustCol[i * 3 + 0] = c.r;
      dustCol[i * 3 + 1] = c.g;
      dustCol[i * 3 + 2] = c.b;
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dustCol, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const onPointer = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pointer.tx = ((e.clientX / w) * 2 - 1) * 0.9;
      pointer.ty = -((e.clientY / h) * 2 - 1) * 0.6;
    };

    window.addEventListener("pointermove", onPointer, { passive: true });

    const resize = () => {
      const w = container.clientWidth || window.innerWidth || 1;
      const h = container.clientHeight || window.innerHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.setSize(w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const clock = new THREE.Clock();
    const p2 = new THREE.Vector3();

    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);

      const time = clock.getElapsedTime();

      const lerp = reduceMotion ? 0.05 : 0.085;
      pointer.x += (pointer.tx - pointer.x) * lerp;
      pointer.y += (pointer.ty - pointer.y) * lerp;

      const speed = reduceMotion ? 0.015 : 0.038;
      const u = (time * speed) % 1;
      const uNext = (u + 0.006) % 1;

      curve.getPointAt(u, p);
      curve.getPointAt(uNext, p2);

      camera.position.set(p.x + pointer.x * 0.85, p.y + pointer.y * 0.55, p.z);
      camera.lookAt(p2.x + pointer.x * 0.25, p2.y + pointer.y * 0.2, p2.z);

      head.position.copy(camera.position);
      ember.position.set(p.x - 0.7, p.y - 0.25, p.z - 1.4);

      const breathe = Math.sin(time * 0.85) * 0.12 + 1;
      shardMat.emissiveIntensity = 2.0 * breathe;
      bloom.strength = reduceMotion ? 0.8 : 1.18 + Math.sin(time * 0.35) * 0.12;

      dust.rotation.y = time * 0.05;
      dust.rotation.x = time * 0.03;

      cave.rotation.z = Math.sin(time * 0.18) * 0.02;

      composer.render();
    };

    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);

      composer.dispose();

      dustGeo.dispose();
      dustMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();

      renderer.dispose();

      if (renderer.domElement?.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  });
</script>

<div class="scene" bind:this={container} aria-hidden="true"></div>

<style>
  .scene {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: radial-gradient(1200px 900px at 50% 35%, #0c0a17 0%, #05040a 55%, #020106 100%);
  }

  :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
