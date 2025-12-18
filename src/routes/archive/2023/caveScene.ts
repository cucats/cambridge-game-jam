export type CaveSceneController = {
  setScrollProgress: (progress: number) => void;
  resize: (width: number, height: number, dpr: number) => void;
  renderOnce: () => void;
  destroy: () => void;
};

type CreateOptions = {
  reducedMotion: boolean;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createDustTexture(THREE: typeof import("three")) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }

  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255, 252, 248, 1)");
  g.addColorStop(0.25, "rgba(255, 185, 122, 0.85)");
  g.addColorStop(0.55, "rgba(255, 110, 66, 0.35)");
  g.addColorStop(1, "rgba(255, 110, 66, 0)");

  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  if ("colorSpace" in texture && "SRGBColorSpace" in THREE) {
    (texture as unknown as { colorSpace: unknown }).colorSpace = (
      THREE as unknown as { SRGBColorSpace: unknown }
    ).SRGBColorSpace;
  }

  return texture;
}

export async function createCaveScene(
  canvas: HTMLCanvasElement,
  options: CreateOptions,
): Promise<CaveSceneController> {
  const THREE = await import("three");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);

  if ("outputColorSpace" in renderer && "SRGBColorSpace" in THREE) {
    (renderer as unknown as { outputColorSpace: unknown }).outputColorSpace = (
      THREE as unknown as { SRGBColorSpace: unknown }
    ).SRGBColorSpace;
  }

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04030a, 0.12);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 90);
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0x221622, 0.85);
  scene.add(ambient);

  const keyLight = new THREE.PointLight(0xffb36c, 3.1, 25, 2);
  keyLight.position.set(0.65, 0.25, 0.8);
  camera.add(keyLight);

  const fillLight = new THREE.PointLight(0xff4a9a, 1.6, 18, 2);
  fillLight.position.set(-0.65, -0.25, 0.55);
  camera.add(fillLight);

  const root = new THREE.Group();
  scene.add(root);

  const rng = mulberry32(20230210);

  const curvePoints: import("three").Vector3[] = [];
  const curveLength = 26;
  const pointCount = 7;

  for (let i = 0; i < pointCount; i += 1) {
    const t = i / (pointCount - 1);
    const z = t * curveLength;
    const x = (rng() - 0.5) * 4.2;
    const y = (rng() - 0.5) * 3.2;
    curvePoints.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(curvePoints);
  curve.curveType = "catmullrom";
  curve.tension = 0.48;

  const tubularSegments = 320;
  const caveRadius = 3.6;
  const radialSegments = 12;

  const frames = curve.computeFrenetFrames(tubularSegments, false);

  const caveGeometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    caveRadius,
    radialSegments,
    false,
  );

  const pos = caveGeometry.getAttribute("position");
  const nor = caveGeometry.getAttribute("normal");
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const wobble =
      Math.sin(z * 0.92 + x * 1.55) * 0.16 +
      Math.sin(z * 1.65 - y * 1.28) * 0.12;
    const jitter = (rng() - 0.5) * 0.14;
    const amount = wobble + jitter;

    v.set(nor.getX(i), nor.getY(i), nor.getZ(i)).multiplyScalar(amount);
    pos.setXYZ(i, x + v.x, y + v.y, z + v.z);
  }

  pos.needsUpdate = true;
  caveGeometry.computeVertexNormals();

  const caveMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0711,
    roughness: 0.96,
    metalness: 0.02,
    flatShading: true,
    side: THREE.BackSide,
  });

  const caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
  root.add(caveMesh);

  const veinPositions: number[] = [];
  const veinClusters = 80;

  for (let c = 0; c < veinClusters; c += 1) {
    let t = rng() * 0.88 + 0.04;
    let angle = rng() * Math.PI * 2;

    const segments = 8 + Math.floor(rng() * 10);

    let px = 0;
    let py = 0;
    let pz = 0;
    let hasPrev = false;

    for (let s = 0; s < segments; s += 1) {
      const tt = clamp01(t);
      const fi = Math.min(
        frames.normals.length - 1,
        Math.max(0, Math.floor(tt * tubularSegments)),
      );

      const center = curve.getPointAt(tt);
      const normal = frames.normals[fi];
      const binormal = frames.binormals[fi];

      const radial = new THREE.Vector3()
        .copy(normal)
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(binormal, Math.sin(angle));

      const r = caveRadius - 0.35 + rng() * 0.22;

      const p = new THREE.Vector3()
        .copy(center)
        .addScaledVector(radial, r)
        .add(new THREE.Vector3((rng() - 0.5) * 0.09, (rng() - 0.5) * 0.09, 0));

      if (hasPrev) {
        veinPositions.push(px, py, pz, p.x, p.y, p.z);
      }

      px = p.x;
      py = p.y;
      pz = p.z;
      hasPrev = true;

      t += 0.012 + rng() * 0.02;
      angle += (rng() - 0.5) * 0.45;

      if (t > 1) {
        break;
      }
    }
  }

  const veinsGeometry = new THREE.BufferGeometry();
  veinsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(veinPositions, 3),
  );

  const veinsMaterialWarm = new THREE.LineBasicMaterial({
    color: 0xff7a2a,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const veinsMaterialHot = new THREE.LineBasicMaterial({
    color: 0xff3e9a,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const veinsWarm = new THREE.LineSegments(veinsGeometry, veinsMaterialWarm);
  const veinsHot = new THREE.LineSegments(veinsGeometry, veinsMaterialHot);
  veinsHot.position.set(0.02, -0.01, 0);

  root.add(veinsWarm);
  root.add(veinsHot);

  const dustTexture = createDustTexture(THREE);

  const dustCount = 1800;
  const dustPositions = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i += 1) {
    const t = rng();
    const fi = Math.min(
      frames.normals.length - 1,
      Math.max(0, Math.floor(t * tubularSegments)),
    );

    const center = curve.getPointAt(t);
    const normal = frames.normals[fi];
    const binormal = frames.binormals[fi];

    const angle = rng() * Math.PI * 2;
    const radius = Math.pow(rng(), 1.6) * (caveRadius * 0.85);

    const radial = new THREE.Vector3()
      .copy(normal)
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(binormal, Math.sin(angle));

    const p = new THREE.Vector3().copy(center).addScaledVector(radial, radius);

    dustPositions[i * 3 + 0] = p.x;
    dustPositions[i * 3 + 1] = p.y;
    dustPositions[i * 3 + 2] = p.z;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3),
  );

  const dustMaterial = new THREE.PointsMaterial({
    map: dustTexture,
    color: 0xffd8bf,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  root.add(dust);

  let w = 1;
  let h = 1;
  let dpr = 1;

  let scrollTarget = 0;
  let scroll = 0;

  let raf = 0;
  let running = false;
  let destroyed = false;

  const render = () => {
    if (destroyed) {
      return;
    }

    const time = performance.now() * 0.001;
    scroll = lerp(scroll, scrollTarget, 0.08);

    const travelT = clamp01(0.07 + scroll * 0.78);
    const lookT = clamp01(travelT + 0.06);

    const travelIndex = Math.min(
      frames.normals.length - 1,
      Math.max(0, Math.floor(travelT * tubularSegments)),
    );

    const pos = curve.getPointAt(travelT);
    const look = curve.getPointAt(lookT);

    const swayN = Math.sin(time * 0.55) * 0.18;
    const swayB = Math.cos(time * 0.43) * 0.14;

    camera.position
      .copy(pos)
      .addScaledVector(frames.normals[travelIndex], swayN)
      .addScaledVector(frames.binormals[travelIndex], swayB);

    camera.lookAt(look);

    dust.rotation.z = time * 0.07;
    dust.rotation.y = time * 0.04;
    dust.position.z = -scroll * 1.2;

    const glowScroll = 0.75 + 0.25 * Math.sin(scroll * Math.PI);
    const glowPulse = 0.75 + 0.25 * Math.sin(time * 1.2 + scroll * 4.2);

    veinsMaterialWarm.opacity = 0.22 * glowScroll + 0.14 * glowPulse;
    veinsMaterialHot.opacity = 0.08 * glowScroll + 0.06 * glowPulse;

    renderer.render(scene, camera);

    if (!options.reducedMotion) {
      raf = requestAnimationFrame(render);
    }
  };

  const setScrollProgress = (progress: number) => {
    scrollTarget = clamp01(progress);
  };

  const resize = (width: number, height: number, nextDpr: number) => {
    w = Math.max(1, Math.floor(width));
    h = Math.max(1, Math.floor(height));
    dpr = Math.max(1, Math.min(2, nextDpr));

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const base = Math.min(w, h);
    dustMaterial.size = Math.max(10, Math.min(20, base * 0.03));

    if (!running && !options.reducedMotion) {
      running = true;
      raf = requestAnimationFrame(render);
    }

    if (options.reducedMotion) {
      render();
    }
  };

  const renderOnce = () => {
    if (destroyed) {
      return;
    }

    const prev = options.reducedMotion;
    if (prev) {
      render();
    }
  };

  const destroy = () => {
    destroyed = true;

    if (raf) {
      cancelAnimationFrame(raf);
    }

    caveGeometry.dispose();
    caveMaterial.dispose();

    veinsGeometry.dispose();
    veinsMaterialWarm.dispose();
    veinsMaterialHot.dispose();

    dustGeometry.dispose();
    dustMaterial.dispose();
    dustTexture.dispose();

    renderer.dispose();

    if ("forceContextLoss" in renderer) {
      (
        renderer as unknown as { forceContextLoss: () => void }
      ).forceContextLoss();
    }
  };

  return {
    setScrollProgress,
    resize,
    renderOnce,
    destroy,
  };
}
