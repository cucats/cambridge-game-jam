<script>
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const featuredProjects = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
  ];

  let canvasContainer;
  let scene, camera, renderer;
  let crystals = [];
  let stalactites = [];
  let stalagmites = [];
  let particles;
  let animationId;
  let clock;
  let mouseX = 0;
  let mouseY = 0;

  let scrollY = $state(0);
  let loaded = $state(false);
  let activeProject = $state(-1);

  function createCaveMaterial(color, emissive = 0x000000) {
    return new THREE.MeshPhongMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 0.3,
      shininess: 30,
      flatShading: true,
    });
  }

  function createStalactite(x, y, z, scale = 1) {
    const geometry = new THREE.ConeGeometry(0.3 * scale, 2 * scale, 6);
    const material = createCaveMaterial(0x4a3728);
    const stalactite = new THREE.Mesh(geometry, material);
    stalactite.position.set(x, y, z);
    stalactite.rotation.x = Math.PI;
    stalactite.userData = {
      originalY: y,
      speed: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    };
    return stalactite;
  }

  function createStalagmite(x, y, z, scale = 1) {
    const geometry = new THREE.ConeGeometry(0.4 * scale, 1.5 * scale, 6);
    const material = createCaveMaterial(0x3d2b1f);
    const stalagmite = new THREE.Mesh(geometry, material);
    stalagmite.position.set(x, y, z);
    stalagmite.userData = {
      originalY: y,
      speed: 0.3 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    };
    return stalagmite;
  }

  function createCrystal(x, y, z, color, scale = 1) {
    const geometry = new THREE.OctahedronGeometry(0.5 * scale, 0);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
    });
    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.set(x, y, z);
    crystal.scale.y = 2;
    crystal.userData = {
      originalY: y,
      rotationSpeed: 0.5 + Math.random() * 0.5,
      floatSpeed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      baseEmissive: 0.8,
      color: color,
    };
    return crystal;
  }

  function createParticleSystem() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1.0;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.8;
      } else {
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.6;
      }

      sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  function createCaveWalls() {
    const group = new THREE.Group();

    const floorGeometry = new THREE.PlaneGeometry(60, 60, 20, 20);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a1a0a,
      flatShading: true,
    });

    const floorPositions = floorGeometry.attributes.position;
    for (let i = 0; i < floorPositions.count; i++) {
      floorPositions.setZ(i, Math.random() * 0.5);
    }
    floorGeometry.computeVertexNormals();

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    group.add(floor);

    const ceilingGeometry = new THREE.PlaneGeometry(60, 60, 20, 20);
    const ceilingMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a0f05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const ceilingPositions = ceilingGeometry.attributes.position;
    for (let i = 0; i < ceilingPositions.count; i++) {
      ceilingPositions.setZ(i, Math.random() * 0.8);
    }
    ceilingGeometry.computeVertexNormals();

    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 12;
    group.add(ceiling);

    return group;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0505);
    scene.fog = new THREE.FogExp2(0x0a0505, 0.04);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a0a05, 0.3);
    scene.add(ambientLight);

    const crystalColors = [0x00ffff, 0xff00ff, 0x00ff88, 0x8800ff, 0xff8800];

    for (let i = 0; i < 5; i++) {
      const color = crystalColors[i];
      const light = new THREE.PointLight(color, 2, 15);
      light.position.set(
        Math.sin((i / 5) * Math.PI * 2) * 8,
        Math.random() * 4 - 1,
        Math.cos((i / 5) * Math.PI * 2) * 8 - 5,
      );
      scene.add(light);
    }

    const caveWalls = createCaveWalls();
    scene.add(caveWalls);

    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30 - 5;
      const scale = 0.5 + Math.random() * 1.5;
      const stalactite = createStalactite(x, 10 + Math.random() * 2, z, scale);
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30 - 5;
      const scale = 0.5 + Math.random() * 1.2;
      const stalagmite = createStalagmite(
        x,
        -4.5 + Math.random() * 0.5,
        z,
        scale,
      );
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    for (let i = 0; i < 20; i++) {
      const color = crystalColors[i % crystalColors.length];
      const x = (Math.random() - 0.5) * 25;
      const y = Math.random() * 6 - 2;
      const z = (Math.random() - 0.5) * 25 - 5;
      const scale = 0.3 + Math.random() * 0.8;
      const crystal = createCrystal(x, y, z, color, scale);
      crystals.push(crystal);
      scene.add(crystal);
    }

    particles = createParticleSystem();
    scene.add(particles);

    clock = new THREE.Clock();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.03 + 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -5);

    crystals.forEach((crystal) => {
      crystal.rotation.y += crystal.userData.rotationSpeed * 0.01;
      crystal.position.y =
        crystal.userData.originalY +
        Math.sin(time * crystal.userData.floatSpeed + crystal.userData.phase) *
          0.3;

      const pulse = 0.5 + 0.5 * Math.sin(time * 2 + crystal.userData.phase);
      crystal.material.emissiveIntensity =
        crystal.userData.baseEmissive * (0.6 + pulse * 0.4);
    });

    stalactites.forEach((stalactite) => {
      stalactite.position.y =
        stalactite.userData.originalY +
        Math.sin(time * stalactite.userData.speed + stalactite.userData.phase) *
          0.05;
    });

    stalagmites.forEach((stalagmite) => {
      stalagmite.rotation.y =
        Math.sin(time * 0.2 + stalagmite.userData.phase) * 0.02;
    });

    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.01;
        if (positions[i + 1] > 15) {
          positions[i + 1] = -5;
        }
        positions[i] += Math.sin(time + i) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.02;
    }

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  onMount(() => {
    initThree();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    setTimeout(() => {
      loaded = true;
    }, 500);
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital@0;1&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="cave-page">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <div class="overlay" class:loaded></div>

  <section class="hero" class:loaded>
    <div class="crystal-border top-left"></div>
    <div class="crystal-border top-right"></div>
    <div class="crystal-border bottom-left"></div>
    <div class="crystal-border bottom-right"></div>

    <div class="hero-content">
      <div class="logo-container">
        <img src="/2023/logo.png" alt="Cambridge Game Jam Logo" class="logo" />
        <div class="logo-glow"></div>
      </div>

      <h1 class="title">
        <span class="title-line">{title}</span>
      </h1>

      <div class="event-details">
        <div class="detail-item date">
          <span class="detail-icon">◆</span>
          <span>{duration}</span>
        </div>
        <div class="detail-item theme">
          <span class="detail-icon">◆</span>
          <span>{theme}</span>
        </div>
        <div class="detail-item submissions">
          <span class="detail-icon">◆</span>
          <span>{submissions} Submissions</span>
        </div>
      </div>

      <a href="https://itch.io/jam/camgamejam2023" class="cta-button">
        <span class="cta-text">View All Submissions</span>
        <span class="cta-glow"></span>
      </a>
    </div>

    <div class="scroll-indicator">
      <div class="scroll-arrow"></div>
      <div class="scroll-arrow"></div>
      <div class="scroll-arrow"></div>
    </div>
  </section>

  <section class="featured-section">
    <div class="section-header">
      <div class="crystal-decoration left"></div>
      <h2 class="section-title">Featured Projects</h2>
      <div class="crystal-decoration right"></div>
    </div>

    <div class="projects-grid">
      {#each featuredProjects as project, index}
        <a
          href={project.link}
          class="project-card"
          class:active={activeProject === index}
          style="--delay: {index * 0.1}s; --hue: {index * 60}"
          onmouseenter={() => (activeProject = index)}
          onmouseleave={() => (activeProject = -1)}
        >
          <div class="card-crystal-frame">
            <div class="crystal-corner tl"></div>
            <div class="crystal-corner tr"></div>
            <div class="crystal-corner bl"></div>
            <div class="crystal-corner br"></div>
          </div>

          <div class="card-image-container">
            <img src={project.src} alt={project.alt} class="card-image" />
            <div class="card-image-overlay"></div>
          </div>

          <div class="card-content">
            <div class="prize-badge">
              <span class="prize-icon">★</span>
              <span>{project.prize}</span>
            </div>
            <h3 class="project-title">{project.title}</h3>
          </div>

          <div class="card-glow"></div>
        </a>
      {/each}
    </div>

    <a href="https://itch.io/jam/camgamejam2023" class="view-all-link">
      <span>View all {submissions} submissions</span>
      <span class="arrow">→</span>
    </a>
  </section>

  <section class="back-section">
    <a href="/" class="back-button">
      <span class="back-arrow">←</span>
      <span>Back to Main Site</span>
    </a>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #0a0505;
  }

  .cave-page {
    min-height: 100vh;
    position: relative;
    font-family: "Crimson Text", serif;
    color: #e8d5c4;
    overflow-x: hidden;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .canvas-container :global(canvas) {
    display: block;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(10, 5, 5, 0.3) 50%,
      rgba(10, 5, 5, 0.8) 100%
    );
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 1s ease;
  }

  .overlay.loaded {
    opacity: 1;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
    padding: 2rem;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero.loaded {
    opacity: 1;
    transform: translateY(0);
  }

  .crystal-border {
    position: absolute;
    width: 100px;
    height: 100px;
    opacity: 0.6;
  }

  .crystal-border::before,
  .crystal-border::after {
    content: "";
    position: absolute;
    background: linear-gradient(135deg, #00ffff, #ff00ff);
  }

  .crystal-border.top-left {
    top: 2rem;
    left: 2rem;
  }
  .crystal-border.top-left::before {
    width: 60px;
    height: 3px;
    top: 0;
    left: 0;
  }
  .crystal-border.top-left::after {
    width: 3px;
    height: 60px;
    top: 0;
    left: 0;
  }

  .crystal-border.top-right {
    top: 2rem;
    right: 2rem;
  }
  .crystal-border.top-right::before {
    width: 60px;
    height: 3px;
    top: 0;
    right: 0;
  }
  .crystal-border.top-right::after {
    width: 3px;
    height: 60px;
    top: 0;
    right: 0;
  }

  .crystal-border.bottom-left {
    bottom: 2rem;
    left: 2rem;
  }
  .crystal-border.bottom-left::before {
    width: 60px;
    height: 3px;
    bottom: 0;
    left: 0;
  }
  .crystal-border.bottom-left::after {
    width: 3px;
    height: 60px;
    bottom: 0;
    left: 0;
  }

  .crystal-border.bottom-right {
    bottom: 2rem;
    right: 2rem;
  }
  .crystal-border.bottom-right::before {
    width: 60px;
    height: 3px;
    bottom: 0;
    right: 0;
  }
  .crystal-border.bottom-right::after {
    width: 3px;
    height: 60px;
    bottom: 0;
    right: 0;
  }

  .hero-content {
    text-align: center;
    max-width: 800px;
  }

  .logo-container {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
  }

  .logo {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    animation:
      float 4s ease-in-out infinite,
      glow-pulse 3s ease-in-out infinite;
    position: relative;
    z-index: 2;
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 220px;
    height: 220px;
    background: radial-gradient(
      circle,
      rgba(0, 255, 255, 0.4) 0%,
      rgba(255, 0, 255, 0.2) 50%,
      transparent 70%
    );
    border-radius: 50%;
    animation: glow-rotate 8s linear infinite;
    z-index: 1;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  @keyframes glow-pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(255, 0, 255, 0.7));
    }
  }

  @keyframes glow-rotate {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  .title {
    font-family: "Cinzel", serif;
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    margin-bottom: 2rem;
    line-height: 1.2;
    text-shadow:
      0 0 30px rgba(0, 255, 255, 0.5),
      0 0 60px rgba(255, 0, 255, 0.3);
  }

  .title-line {
    display: block;
    background: linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ff88 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s ease-in-out infinite;
    background-size: 200% auto;
  }

  @keyframes shimmer {
    0% {
      background-position: 0% center;
    }
    50% {
      background-position: 100% center;
    }
    100% {
      background-position: 0% center;
    }
  }

  .event-details {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.3rem;
    opacity: 0;
    animation: fade-in 0.8s ease forwards;
  }

  .detail-item.date {
    animation-delay: 0.3s;
  }
  .detail-item.theme {
    animation-delay: 0.5s;
  }
  .detail-item.submissions {
    animation-delay: 0.7s;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .detail-icon {
    color: #00ffff;
    font-size: 0.8rem;
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%,
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.3);
    }
  }

  .cta-button {
    position: relative;
    display: inline-block;
    padding: 1rem 3rem;
    font-family: "Cinzel", serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #0a0505;
    background: linear-gradient(135deg, #00ffff, #00ff88);
    border: none;
    border-radius: 4px;
    text-decoration: none;
    overflow: hidden;
    transition: all 0.4s ease;
    animation: fade-in 0.8s ease 0.9s forwards;
    opacity: 0;
  }

  .cta-button:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 40px rgba(0, 255, 255, 0.5);
  }

  .cta-text {
    position: relative;
    z-index: 2;
  }

  .cta-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 40%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 60%
    );
    animation: shine 3s ease-in-out infinite;
  }

  @keyframes shine {
    from {
      transform: translateX(-100%) rotate(45deg);
    }
    to {
      transform: translateX(100%) rotate(45deg);
    }
  }

  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    animation: bounce 2s ease-in-out infinite;
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 3px solid #00ffff;
    border-bottom: 3px solid #00ffff;
    transform: rotate(45deg);
    opacity: 0.5;
  }

  .scroll-arrow:nth-child(1) {
    animation: arrow-fade 2s ease-in-out infinite;
    animation-delay: 0s;
  }
  .scroll-arrow:nth-child(2) {
    animation: arrow-fade 2s ease-in-out infinite;
    animation-delay: 0.2s;
  }
  .scroll-arrow:nth-child(3) {
    animation: arrow-fade 2s ease-in-out infinite;
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(10px);
    }
  }

  @keyframes arrow-fade {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }

  .featured-section {
    position: relative;
    z-index: 2;
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(10, 5, 5, 0.9) 10%,
      rgba(10, 5, 5, 0.95) 100%
    );
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .section-title {
    font-family: "Cinzel", serif;
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 700;
    text-align: center;
    background: linear-gradient(135deg, #00ffff, #ff00ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .crystal-decoration {
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #00ffff, transparent);
    position: relative;
  }

  .crystal-decoration::before {
    content: "◆";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #ff00ff;
    font-size: 1rem;
  }

  .crystal-decoration.left::before {
    right: -15px;
  }

  .crystal-decoration.right::before {
    left: -15px;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto 4rem;
  }

  .project-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(20, 15, 10, 0.8);
    border: 1px solid rgba(0, 255, 255, 0.2);
    text-decoration: none;
    color: inherit;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    animation: card-appear 0.8s ease forwards;
    animation-delay: var(--delay);
    opacity: 0;
    transform: translateY(40px);
  }

  @keyframes card-appear {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .project-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow:
      0 20px 60px rgba(0, 255, 255, 0.2),
      0 0 40px rgba(255, 0, 255, 0.1);
  }

  .card-crystal-frame {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .project-card:hover .card-crystal-frame {
    opacity: 1;
  }

  .crystal-corner {
    position: absolute;
    width: 30px;
    height: 30px;
    border-color: #00ffff;
    border-style: solid;
    border-width: 0;
  }

  .crystal-corner.tl {
    top: 8px;
    left: 8px;
    border-top-width: 2px;
    border-left-width: 2px;
  }

  .crystal-corner.tr {
    top: 8px;
    right: 8px;
    border-top-width: 2px;
    border-right-width: 2px;
  }

  .crystal-corner.bl {
    bottom: 8px;
    left: 8px;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }

  .crystal-corner.br {
    bottom: 8px;
    right: 8px;
    border-bottom-width: 2px;
    border-right-width: 2px;
  }

  .card-image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .project-card:hover .card-image {
    transform: scale(1.1);
  }

  .card-image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      transparent 50%,
      rgba(10, 5, 5, 0.9) 100%
    );
  }

  .card-content {
    padding: 1.5rem;
    position: relative;
    z-index: 2;
  }

  .prize-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: linear-gradient(
      135deg,
      rgba(255, 0, 255, 0.3),
      rgba(0, 255, 255, 0.3)
    );
    border: 1px solid rgba(255, 0, 255, 0.5);
    border-radius: 20px;
    font-size: 0.85rem;
    margin-bottom: 0.8rem;
  }

  .prize-icon {
    color: #ffcc00;
    animation: star-glow 2s ease-in-out infinite;
  }

  @keyframes star-glow {
    0%,
    100% {
      text-shadow: 0 0 5px #ffcc00;
    }
    50% {
      text-shadow:
        0 0 20px #ffcc00,
        0 0 30px #ff8800;
    }
  }

  .project-title {
    font-family: "Cinzel", serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
    transition: color 0.3s ease;
  }

  .project-card:hover .project-title {
    color: #00ffff;
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 255, 255, 0.1) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .project-card:hover .card-glow {
    opacity: 1;
  }

  .view-all-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    font-family: "Cinzel", serif;
    font-size: 1.2rem;
    color: #00ffff;
    text-decoration: none;
    padding: 1rem;
    transition: all 0.4s ease;
  }

  .view-all-link:hover {
    color: #ff00ff;
    transform: translateX(10px);
  }

  .view-all-link .arrow {
    transition: transform 0.4s ease;
  }

  .view-all-link:hover .arrow {
    transform: translateX(5px);
  }

  .back-section {
    position: relative;
    z-index: 2;
    padding: 4rem 2rem;
    text-align: center;
    background: rgba(10, 5, 5, 0.95);
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 2rem;
    font-family: "Cinzel", serif;
    font-size: 1.1rem;
    color: #e8d5c4;
    text-decoration: none;
    border: 2px solid rgba(0, 255, 255, 0.4);
    border-radius: 8px;
    background: transparent;
    transition: all 0.4s ease;
  }

  .back-button:hover {
    color: #00ffff;
    border-color: #00ffff;
    background: rgba(0, 255, 255, 0.1);
    transform: translateX(-10px);
  }

  .back-arrow {
    transition: transform 0.4s ease;
  }

  .back-button:hover .back-arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .crystal-border {
      display: none;
    }

    .logo {
      width: 140px;
      height: 140px;
    }

    .logo-glow {
      width: 180px;
      height: 180px;
    }

    .event-details {
      gap: 1rem;
    }

    .detail-item {
      font-size: 1rem;
    }

    .section-header {
      flex-direction: column;
      gap: 1rem;
    }

    .crystal-decoration {
      display: none;
    }

    .projects-grid {
      gap: 1.5rem;
    }
  }
</style>
