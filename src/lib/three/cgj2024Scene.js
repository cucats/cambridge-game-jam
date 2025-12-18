export async function createCGJ2024Scene({ container, getScrollY }) {
  const THREE = await import("three");
  const { Reflector } = await import("three/examples/jsm/objects/Reflector.js");
  const { EffectComposer } = await import(
    "three/examples/jsm/postprocessing/EffectComposer.js"
  );
  const { RenderPass } = await import(
    "three/examples/jsm/postprocessing/RenderPass.js"
  );
  const { UnrealBloomPass } = await import(
    "three/examples/jsm/postprocessing/UnrealBloomPass.js"
  );
  const { FilmPass } = await import(
    "three/examples/jsm/postprocessing/FilmPass.js"
  );
  const { AfterimagePass } = await import(
    "three/examples/jsm/postprocessing/AfterimagePass.js"
  );
  const { GlitchPass } = await import(
    "three/examples/jsm/postprocessing/GlitchPass.js"
  );

  const prefersReducedMotion =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, t) => {
    const x = clamp((t - a) / (b - a), 0, 1);
    return x * x * (3 - 2 * x);
  };

  let w = Math.max(1, container.clientWidth || 1);
  let h = Math.max(1, container.clientHeight || 1);
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07060a, 0.045);

  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 180);
  camera.position.set(0, 3.4, 12.5);

  const root = new THREE.Group();
  scene.add(root);

  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x0b0c10, 0.65);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(8, 9, 6);
  key.castShadow = false;
  scene.add(key);

  const fill = new THREE.PointLight(0x7bfff2, 1.1, 45, 2);
  fill.position.set(-6, 3, -3);
  scene.add(fill);

  const rim = new THREE.PointLight(0xff2bd6, 0.95, 35, 2);
  rim.position.set(6, 1.5, -8);
  scene.add(rim);

  const terrainSize = 28;
  const terrainSegs = 36;
  const terrainGeo = new THREE.PlaneGeometry(
    terrainSize,
    terrainSize,
    terrainSegs,
    terrainSegs
  );
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainColors = [];
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.sqrt(x * x + z * z);
    const basin = -0.55 * Math.exp(-r * r * 0.02);
    const ridges =
      0.22 * Math.sin(x * 0.55) * Math.cos(z * 0.5) +
      0.12 * Math.sin((x + z) * 0.9);
    const y = basin + ridges;
    pos.setY(i, y);

    const shade = clamp((y + 1.2) / 2.6, 0, 1);
    const c = new THREE.Color()
      .setHSL(0.62 + shade * 0.12, 0.64, 0.08 + shade * 0.26)
      .lerp(new THREE.Color(0x22071d), smoothstep(0.0, 1.0, shade * 0.55));
    terrainColors.push(c.r, c.g, c.b);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(terrainColors, 3)
  );

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.y = -1.35;
  root.add(terrain);

  const mirrorFloorGeo = new THREE.PlaneGeometry(16, 16);
  const mirrorFloor = new Reflector(mirrorFloorGeo, {
    textureWidth: Math.floor(1024 * dpr),
    textureHeight: Math.floor(1024 * dpr),
    color: 0x0b0a12,
    clipBias: 0.003,
  });
  mirrorFloor.rotateX(-Math.PI / 2);
  mirrorFloor.position.set(0, -0.58, 0.25);
  root.add(mirrorFloor);

  const mirrorWallGeo = new THREE.PlaneGeometry(16, 9);
  const mirrorWall = new Reflector(mirrorWallGeo, {
    textureWidth: Math.floor(1024 * dpr),
    textureHeight: Math.floor(1024 * dpr),
    color: 0x0a0b10,
    clipBias: 0.003,
  });
  mirrorWall.position.set(0, 2.15, -8.25);
  root.add(mirrorWall);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a10,
    roughness: 0.18,
    metalness: 0.0,
    transmission: 0.85,
    thickness: 0.65,
    ior: 1.45,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const ringGeo = new THREE.TorusKnotGeometry(1.25, 0.42, 110, 18);
  const ring = new THREE.Mesh(ringGeo, glassMat);
  ring.position.set(0, 1.35, 0);
  root.add(ring);

  const shards = new THREE.Group();
  root.add(shards);

  const shardGeoA = new THREE.IcosahedronGeometry(0.55, 0);
  const shardGeoB = new THREE.TetrahedronGeometry(0.52, 0);
  const shardMats = [
    new THREE.MeshStandardMaterial({
      color: 0x96fff4,
      emissive: 0x0a2d2a,
      emissiveIntensity: 0.95,
      roughness: 0.35,
      metalness: 0.55,
      flatShading: true,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xff6fe5,
      emissive: 0x2d0826,
      emissiveIntensity: 0.95,
      roughness: 0.3,
      metalness: 0.6,
      flatShading: true,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xe8f0ff,
      emissive: 0x0a1024,
      emissiveIntensity: 0.85,
      roughness: 0.28,
      metalness: 0.72,
      flatShading: true,
    }),
  ];

  const shardData = [];
  const shardCount = prefersReducedMotion ? 34 : 90;
  for (let i = 0; i < shardCount; i += 1) {
    const g = i % 3 === 0 ? shardGeoB : shardGeoA;
    const m = shardMats[i % shardMats.length];
    const mesh = new THREE.Mesh(g, m);
    const a = Math.random() * Math.PI * 2;
    const r = 3.2 + Math.random() * 7.2;
    mesh.position.set(Math.cos(a) * r, 0.6 + Math.random() * 4.6, Math.sin(a) * r);
    const s = 0.35 + Math.random() * 0.95;
    mesh.scale.setScalar(s);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    shards.add(mesh);
    shardData.push({
      mesh,
      a,
      r,
      y: mesh.position.y,
      v: 0.15 + Math.random() * 0.85,
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 0.75,
        (Math.random() - 0.5) * 0.95,
        (Math.random() - 0.5) * 0.75
      ),
      warp: 0.4 + Math.random() * 1.6,
    });
  }

  const sparkleCount = prefersReducedMotion ? 900 : 2400;
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePos = new Float32Array(sparkleCount * 3);
  const sparkleCol = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount; i += 1) {
    const t = Math.random() * Math.PI * 2;
    const rr = 2 + Math.random() * 16;
    const y = -0.5 + Math.random() * 7.5;
    sparklePos[i * 3 + 0] = Math.cos(t) * rr;
    sparklePos[i * 3 + 1] = y;
    sparklePos[i * 3 + 2] = Math.sin(t) * rr;
    const c = new THREE.Color().setHSL(0.74 + Math.random() * 0.22, 0.9, 0.68);
    sparkleCol[i * 3 + 0] = c.r;
    sparkleCol[i * 3 + 1] = c.g;
    sparkleCol[i * 3 + 2] = c.b;
  }
  sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
  sparkleGeo.setAttribute("color", new THREE.BufferAttribute(sparkleCol, 3));
  const sparkleMat = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
  root.add(sparkles);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    prefersReducedMotion ? 0.9 : 1.25,
    0.55,
    0.05
  );
  composer.addPass(bloom);

  const trails = new AfterimagePass();
  trails.uniforms.damp.value = prefersReducedMotion ? 0.88 : 0.92;
  composer.addPass(trails);

  const film = new FilmPass(
    prefersReducedMotion ? 0.18 : 0.35,
    prefersReducedMotion ? 0.18 : 0.45,
    1440,
    false
  );
  composer.addPass(film);

  const glitch = new GlitchPass();
  glitch.enabled = !prefersReducedMotion;
  composer.addPass(glitch);

  const pointer = {
    x: 0,
    y: 0,
    down: 0,
    burst: 0,
    burstAt: 0,
  };

  const setPointerFromEvent = (e) => {
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    pointer.x = clamp(nx, -1, 1);
    pointer.y = clamp(ny, -1, 1);
  };

  const onPointerMove = (e) => setPointerFromEvent(e);
  const onPointerDown = (e) => {
    setPointerFromEvent(e);
    pointer.down = 1;
    pointer.burst = 1;
    pointer.burstAt = performance.now();
  };
  const onPointerUp = () => {
    pointer.down = 0;
  };

  container.addEventListener("pointermove", onPointerMove, { passive: true });
  container.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });

  let raf = 0;
  let last = performance.now();
  let t = 0;

  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;

    const scrollY = typeof getScrollY === "function" ? getScrollY() : 0;
    const scrollPhase = clamp(scrollY / 900, 0, 2.5);
    const tempo = prefersReducedMotion ? 0.65 : 1.0;
    const drive = tempo * (0.55 + scrollPhase * 0.65);

    const camOrbit = 0.22 * Math.sin(t * 0.65 * drive) + 0.08 * Math.sin(t * 1.4);
    const camLift = 0.15 * Math.sin(t * 0.9 * drive) + 0.06 * Math.sin(t * 2.2);
    const aimX = pointer.x * 1.8;
    const aimY = 0.85 + pointer.y * 0.55;

    camera.position.x = lerp(camera.position.x, Math.sin(camOrbit) * 7.2, 0.035);
    camera.position.z = lerp(camera.position.z, 12.5 - Math.cos(camOrbit) * 3.4, 0.035);
    camera.position.y = lerp(camera.position.y, 3.3 + camLift, 0.04);
    camera.lookAt(aimX, aimY, 0.25);

    const pulse = 0.5 + 0.5 * Math.sin(t * 1.35 * drive);
    fill.intensity = lerp(fill.intensity, 0.85 + pulse * 0.95, 0.04);
    rim.intensity = lerp(rim.intensity, 0.75 + (1 - pulse) * 0.85, 0.04);

    const ringSpeed = drive * (0.55 + (pointer.down ? 0.65 : 0));
    ring.rotation.x += dt * 0.35 * ringSpeed;
    ring.rotation.y += dt * 0.75 * ringSpeed;
    ring.rotation.z += dt * 0.22 * ringSpeed;
    ring.position.y = 1.35 + 0.18 * Math.sin(t * 1.2 * drive);

    const burstAge = (now - pointer.burstAt) / 1000;
    const burst = pointer.burst ? Math.exp(-burstAge * 2.2) : 0;
    if (burst < 0.02) pointer.burst = 0;

    const wv = 0.12 * Math.sin(t * 0.9 * drive) + burst * 0.4;
    mirrorWall.rotation.y = wv;
    mirrorFloor.rotation.z = -wv * 0.6;

    const sPos = sparkleGeo.attributes.position;
    for (let i = 0; i < shardData.length; i += 1) {
      const d = shardData[i];
      const m = d.mesh;
      const aa = d.a + t * d.v * 0.28 * drive;
      const rr = d.r + Math.sin(t * d.warp + i) * 0.35;
      m.position.x = Math.cos(aa) * rr;
      m.position.z = Math.sin(aa) * rr;
      m.position.y =
        d.y +
        0.24 * Math.sin(t * (0.8 + d.v * 0.9) * drive + i) +
        0.12 * Math.sin(t * 2.1 * drive + d.r);
      m.rotation.x += dt * d.spin.x * drive;
      m.rotation.y += dt * d.spin.y * drive;
      m.rotation.z += dt * d.spin.z * drive;

      if (i % 2 === 0) {
        const idx = (i % sparkleCount) * 3;
        const ox = sPos.getX(idx / 3);
        const oy = sPos.getY(idx / 3);
        const oz = sPos.getZ(idx / 3);
        sPos.setXYZ(
          idx / 3,
          ox + 0.02 * Math.sin(t * 1.3 + i),
          oy + 0.02 * Math.cos(t * 1.1 + i),
          oz + 0.02 * Math.sin(t * 1.5 + i)
        );
      }
    }
    sPos.needsUpdate = true;

    const bloomTarget = prefersReducedMotion ? 0.9 : 1.15 + burst * 0.8;
    bloom.strength = lerp(bloom.strength, bloomTarget, 0.06);
    film.uniforms.intensity.value = lerp(
      film.uniforms.intensity.value,
      prefersReducedMotion ? 0.18 : 0.28 + burst * 0.25,
      0.08
    );
    trails.uniforms.damp.value = lerp(
      trails.uniforms.damp.value,
      prefersReducedMotion ? 0.88 : 0.92 - burst * 0.06,
      0.08
    );

    glitch.enabled = !prefersReducedMotion && (burst > 0.18 || scrollPhase > 1.1);

    composer.render();
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  const resize = () => {
    w = Math.max(1, container.clientWidth || 1);
    h = Math.max(1, container.clientHeight || 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(container);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    composer.dispose();
    renderer.dispose();
    terrainGeo.dispose();
    mirrorFloorGeo.dispose();
    mirrorWallGeo.dispose();
    ringGeo.dispose();
    shardGeoA.dispose();
    shardGeoB.dispose();
    sparkleGeo.dispose();
    sparkleMat.dispose();
    terrainMat.dispose();
    shardMats.forEach((m) => m.dispose());
    glassMat.dispose();
    container.removeChild(renderer.domElement);
  };
}
