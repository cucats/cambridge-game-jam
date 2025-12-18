export type ThreeModule = typeof import("three");

export type CaveSceneController = {
  setScrollProgress(progress: number): void;
  resize(width: number, height: number, dpr: number): void;
  destroy(): void;
};

export type CreateCaveSceneOptions = {
  canvas: HTMLCanvasElement;
  three: ThreeModule;
  width: number;
  height: number;
  dpr: number;
  reducedMotion: boolean;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const createDustTexture = (THREE: ThreeModule) => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.22, "rgba(255,255,255,0.65)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
};

export const createCaveScene = (
  opts: CreateCaveSceneOptions,
): CaveSceneController => {
  const THREE = opts.three;
  const live = !opts.reducedMotion;

  const renderer = new THREE.WebGLRenderer({
    canvas: opts.canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x05060a, 1);
  renderer.setPixelRatio(opts.dpr);
  renderer.setSize(opts.width, opts.height, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.092);

  const camera = new THREE.PerspectiveCamera(
    52,
    opts.width / opts.height,
    0.12,
    95,
  );

  const tunnelLength = 56;
  const tunnelRadius = 5.4;

  const caveGeometry = new THREE.CylinderGeometry(
    tunnelRadius * 1.06,
    tunnelRadius * 0.94,
    tunnelLength,
    10,
    48,
    true,
  );

  caveGeometry.rotateX(Math.PI / 2);

  const cavePos = caveGeometry.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < cavePos.count; i++) {
    v.fromBufferAttribute(cavePos, i);
    const theta = Math.atan2(v.y, v.x);
    const z = v.z;
    const n =
      Math.sin(z * 0.35 + theta * 2.6) * 0.65 +
      Math.sin(z * 1.15 - theta * 5.8) * 0.28 +
      Math.sin(z * 0.18 + theta * 9.2) * 0.18;

    const scale = 1 + n * 0.05;
    cavePos.setXYZ(i, v.x * scale, v.y * scale, z);
  }

  cavePos.needsUpdate = true;
  caveGeometry.computeVertexNormals();

  const caveMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0707,
    roughness: 1,
    metalness: 0,
    flatShading: true,
    side: THREE.BackSide,
  });

  const caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
  caveMesh.frustumCulled = false;
  scene.add(caveMesh);

  const ambient = new THREE.AmbientLight(0xffead3, 0.22);
  scene.add(ambient);

  const key = new THREE.PointLight(0xff9b40, 1.35, 60, 2);
  const fill = new THREE.PointLight(0xffd39b, 0.8, 55, 2);
  const deep = new THREE.PointLight(0xff5b2c, 0.9, 85, 2);
  scene.add(key, fill, deep);

  const veinSegments = 16;
  const segmentsPerVein = 16;
  const veinPositions: number[] = [];
  const veinRadius = tunnelRadius * 0.93;

  for (let i = 0; i < veinSegments; i++) {
    let theta = Math.random() * Math.PI * 2;
    let z = (Math.random() * 0.9 - 0.55) * tunnelLength;
    let x = Math.cos(theta) * veinRadius;
    let y = Math.sin(theta) * veinRadius;

    for (let s = 0; s < segmentsPerVein; s++) {
      const z2 = z - (Math.random() * 1.8 + 0.6);
      const theta2 = theta + (Math.random() - 0.5) * 0.28;
      const r2 = veinRadius * (0.92 + Math.random() * 0.08);
      const x2 = Math.cos(theta2) * r2;
      const y2 = Math.sin(theta2) * r2;

      veinPositions.push(x, y, z, x2, y2, z2);

      x = x2;
      y = y2;
      z = z2;
      theta = theta2;
    }
  }

  const veinsGeometry = new THREE.BufferGeometry();
  veinsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(veinPositions, 3),
  );

  const veinsMaterial = new THREE.LineBasicMaterial({
    color: 0xff7a28,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const veins = new THREE.LineSegments(veinsGeometry, veinsMaterial);
  veins.frustumCulled = false;
  scene.add(veins);

  const dustCount = 950;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSpeeds = new Float32Array(dustCount);

  for (let i = 0; i < dustCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const u = Math.random();
    const r = Math.sqrt(u) * (tunnelRadius * 0.78);

    dustPositions[i * 3] = Math.cos(theta) * r;
    dustPositions[i * 3 + 1] = Math.sin(theta) * r;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * tunnelLength;

    dustSpeeds[i] = 0.08 + Math.random() * 0.18;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3),
  );

  const dustTexture = createDustTexture(THREE);

  const dustMaterial = new THREE.PointsMaterial({
    color: 0xffc69a,
    size: 0.046,
    map: dustTexture,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  scene.add(dust);

  let destroyed = false;
  let raf = 0;
  let lastT = 0;
  let scrollProgress = 0;

  const updateFromProgress = () => {
    const p = scrollProgress;
    const zStart = tunnelLength * 0.35;
    const zEnd = -tunnelLength * 0.55;
    const z = zStart + (zEnd - zStart) * p;

    const sway = Math.sin(p * Math.PI * 2);
    const drift = Math.cos(p * Math.PI * 2);

    camera.position.set(sway * 0.36, drift * 0.26, z);
    camera.lookAt(sway * 0.08, drift * 0.06, z - 7.6);

    const glow = 0.55 + 0.35 * Math.sin(p * Math.PI);

    veinsMaterial.opacity = 0.32 + glow * 0.55;
    dustMaterial.opacity = 0.14 + glow * 0.24;

    key.intensity = 0.92 + glow * 0.92;
    fill.intensity = 0.45 + glow * 0.6;
    deep.intensity = 0.55 + glow * 0.78;

    key.position.set(
      camera.position.x + 1.4,
      camera.position.y + 0.8,
      camera.position.z + 3.0,
    );
    fill.position.set(
      camera.position.x - 1.8,
      camera.position.y - 0.9,
      camera.position.z + 1.2,
    );
    deep.position.set(0, 0.55, camera.position.z - 12.0);

    veins.rotation.z = p * 0.62;
    veins.rotation.x = -0.16 + p * 0.14;

    dust.position.x = -camera.position.x * 0.45;
    dust.position.y = -camera.position.y * 0.45;
  };

  const updateDust = (t: number, dt: number) => {
    const attr = dustGeometry.getAttribute("position") as THREE.BufferAttribute;

    for (let i = 0; i < dustCount; i++) {
      const z = attr.getZ(i) + dustSpeeds[i] * dt * 2.2;
      const zWrapped = z > tunnelLength * 0.55 ? -tunnelLength * 0.55 : z;
      attr.setZ(i, zWrapped);
    }

    attr.needsUpdate = true;
    dust.rotation.z = t * 0.06;
    dust.rotation.y = t * 0.04;
  };

  const render = (time: number) => {
    if (destroyed) return;

    const t = time * 0.001;
    const dt = Math.min(0.05, t - lastT);
    lastT = t;

    if (!opts.reducedMotion) {
      updateDust(t, dt);
    }

    renderer.render(scene, camera);
  };

  const loop = (time: number) => {
    if (destroyed) return;
    raf = requestAnimationFrame(loop);
    render(time);
  };

  updateFromProgress();
  renderer.render(scene, camera);

  if (!opts.reducedMotion) {
    raf = requestAnimationFrame(loop);
  }

  return {
    setScrollProgress: (progress: number) => {
      scrollProgress = clamp01(progress);
      updateFromProgress();
      if (!live) renderer.render(scene, camera);
    },
    resize: (width: number, height: number, dpr: number) => {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (!live) renderer.render(scene, camera);
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);

      caveGeometry.dispose();
      caveMaterial.dispose();

      veinsGeometry.dispose();
      veinsMaterial.dispose();

      dustGeometry.dispose();
      dustMaterial.dispose();
      dustTexture.dispose();

      renderer.forceContextLoss();
      renderer.dispose();
    },
  };
};
