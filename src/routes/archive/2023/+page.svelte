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
      title: "Inferno Rising",
      prize: "Popular Vote",
      link: "https://firedemon111.itch.io/inferno-rising",
    },
    {
      src: "/2023/mayi-garden.png",
      title: "MAYI Garden",
      prize: "Best for Theme",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      link: "https://mxbi.itch.io/beaneth-the-earth",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      link: "https://joeoc.itch.io/deck-of-dwarves",
    },
  ];

  let canvasContainer;
  let scene, camera, renderer;
  let stalactites = [];
  let stalagmites = [];
  let crystals = [];
  let particles;
  let torchLights = [];
  let animationId;
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let projectCards = [];
  let heroVisible = $state(false);
  let projectsVisible = $state(false);
  let titleChars = $state([]);

  function createStalactite(x, y, z, height, radius) {
    const geometry = new THREE.ConeGeometry(radius, height, 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9,
      metalness: 0.1,
    });
    const stalactite = new THREE.Mesh(geometry, material);
    stalactite.position.set(x, y, z);
    stalactite.rotation.x = Math.PI;
    return stalactite;
  }

  function createStalagmite(x, y, z, height, radius) {
    const geometry = new THREE.ConeGeometry(radius, height, 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x5c4a3a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const stalagmite = new THREE.Mesh(geometry, material);
    stalagmite.position.set(x, y, z);
    return stalagmite;
  }

  function createCrystal(x, y, z, color, scale = 1) {
    const group = new THREE.Group();
    const crystalGeometry = new THREE.OctahedronGeometry(0.3 * scale, 0);
    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.scale.set(1, 2, 1);
    group.add(crystal);

    const light = new THREE.PointLight(color, 2, 5);
    light.position.set(0, 0, 0);
    group.add(light);

    group.position.set(x, y, z);
    group.userData = { baseY: y, phase: Math.random() * Math.PI * 2 };
    return group;
  }

  function createParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      sizes[i] = Math.random() * 0.05 + 0.02;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0xffd89b,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  function createTorch(x, y, z) {
    const group = new THREE.Group();

    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 1,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    group.add(handle);

    const light = new THREE.PointLight(0xff6600, 3, 8);
    light.position.set(0, 0.4, 0);
    group.add(light);

    group.position.set(x, y, z);
    return { group, light };
  }

  function createCaveWalls() {
    const group = new THREE.Group();

    const wallGeometry = new THREE.PlaneGeometry(50, 30);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 0, -15);
    group.add(backWall);

    const floorGeometry = new THREE.PlaneGeometry(50, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1512,
      roughness: 1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -8, 0);
    group.add(floor);

    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1815,
      roughness: 1,
    });
    const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 10, 0);
    group.add(ceiling);

    return group;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0806);
    scene.fog = new THREE.FogExp2(0x0a0806, 0.04);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a1510, 0.3);
    scene.add(ambientLight);

    const caveWalls = createCaveWalls();
    scene.add(caveWalls);

    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 30;
      const z = Math.random() * -15 - 5;
      const height = Math.random() * 3 + 1;
      const radius = Math.random() * 0.3 + 0.1;
      const stalactite = createStalactite(x, 10, z, height, radius);
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 30;
      const z = Math.random() * -15 - 5;
      const height = Math.random() * 2 + 0.5;
      const radius = Math.random() * 0.2 + 0.1;
      const stalagmite = createStalagmite(
        x,
        -8 + height / 2,
        z,
        height,
        radius,
      );
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    const crystalColors = [0x00ffff, 0xff00ff, 0x00ff88, 0xffaa00, 0x8844ff];
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 25;
      const y = Math.random() * 10 - 5;
      const z = Math.random() * -10 - 3;
      const color =
        crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const crystal = createCrystal(x, y, z, color, Math.random() * 0.5 + 0.5);
      crystals.push(crystal);
      scene.add(crystal);
    }

    particles = createParticles();
    scene.add(particles);

    const torchPositions = [
      [-8, 2, -5],
      [8, 2, -5],
      [-5, -2, -3],
      [5, -2, -3],
    ];
    torchPositions.forEach(([x, y, z]) => {
      const torch = createTorch(x, y, z);
      torchLights.push(torch);
      scene.add(torch.group);
    });

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    camera.position.x += (mouseX * 0.002 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.002 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, -5);

    crystals.forEach((crystal, i) => {
      crystal.position.y =
        crystal.userData.baseY +
        Math.sin(time * 0.5 + crystal.userData.phase) * 0.2;
      crystal.rotation.y += 0.01;
      const intensity = 0.3 + Math.sin(time * 2 + i) * 0.2;
      crystal.children[0].material.emissiveIntensity = intensity;
      crystal.children[1].intensity = 1 + Math.sin(time * 3 + i) * 0.5;
    });

    torchLights.forEach((torch, i) => {
      torch.light.intensity = 2 + Math.sin(time * 5 + i * 0.5) * 0.8;
      torch.light.position.x = Math.sin(time * 3 + i) * 0.05;
      torch.light.position.z = Math.cos(time * 4 + i) * 0.05;
    });

    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += 0.003;
      if (positions[i + 1] > 10) {
        positions[i + 1] = -10;
      }
      positions[i] += Math.sin(time + i) * 0.001;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
  }

  function handleScroll() {
    scrollY = window.scrollY;
    projectCards.forEach((card, i) => {
      if (card) {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        if (isVisible) {
          card.style.opacity = "1";
          card.style.transform = "translateY(0) rotateX(0)";
        }
      }
    });
  }

  function handleResize() {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  onMount(() => {
    initThree();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      heroVisible = true;
    }, 500);

    setTimeout(() => {
      titleChars = title.split("").map((char, i) => ({
        char,
        delay: i * 50,
      }));
    }, 800);

    setTimeout(() => {
      projectsVisible = true;
    }, 1500);
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital@0;1&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="cave-page">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <section class="hero" class:visible={heroVisible}>
    <div class="hero-content">
      <div class="logo-container">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="logo" />
        <div class="logo-glow"></div>
      </div>

      <h1 class="title">
        {#each titleChars as { char, delay }}
          <span class="char" style="animation-delay: {delay}ms">{char}</span>
        {/each}
      </h1>

      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-text">{theme}</span>
      </div>

      <div class="event-info">
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span class="info-text">{duration}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">🎮</span>
          <span class="info-text">{submissions} Submissions</span>
        </div>
      </div>

      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
        <div class="scroll-arrow"></div>
        <div class="scroll-arrow"></div>
      </div>
    </div>
  </section>

  <section class="projects-section" class:visible={projectsVisible}>
    <div class="section-header">
      <div class="crystal-divider">
        <div class="crystal left"></div>
        <h2>Featured Projects</h2>
        <div class="crystal right"></div>
      </div>
    </div>

    <div class="projects-grid">
      {#each featuredProjects as project, i}
        <a
          href={project.link}
          class="project-card"
          bind:this={projectCards[i]}
          style="animation-delay: {i * 150}ms"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="card-inner">
            <div class="card-glow"></div>
            <div class="card-image">
              <img src={project.src} alt={project.title} />
              <div class="image-overlay"></div>
            </div>
            <div class="card-content">
              <h3 class="project-title">{project.title}</h3>
              <div class="prize-badge">
                <span class="prize-icon">🏆</span>
                <span class="prize-text">{project.prize}</span>
              </div>
            </div>
            <div class="crystal-accent"></div>
          </div>
        </a>
      {/each}
    </div>

    <a
      href="https://itch.io/jam/camgamejam2023"
      class="all-submissions-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>View All {submissions} Submissions</span>
      <div class="link-arrow">→</div>
    </a>
  </section>

  <section class="bottom-section">
    <div class="cave-formation left"></div>
    <div class="cave-formation right"></div>
    <div class="bottom-content">
      <img src="/2023/logo.png" alt="Cambridge Game Jam" class="bottom-logo" />
      <p class="bottom-text">{title}</p>
      <p class="bottom-subtext">{theme}</p>
    </div>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #0a0806;
    overflow-x: hidden;
  }

  .cave-page {
    font-family: "Cinzel", serif;
    color: #e8dcc8;
    min-height: 100vh;
    position: relative;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    opacity: 0;
    transform: translateY(50px);
    transition:
      opacity 1.5s ease,
      transform 1.5s ease;
  }

  .hero.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-content {
    text-align: center;
    padding: 2rem;
    max-width: 900px;
  }

  .logo-container {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(255, 170, 100, 0.5));
    animation: logoFloat 4s ease-in-out infinite;
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(255, 150, 50, 0.3) 0%,
      transparent 70%
    );
    animation: glowPulse 3s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes logoFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .title {
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
    text-shadow:
      0 0 20px rgba(255, 150, 50, 0.8),
      0 0 40px rgba(255, 100, 50, 0.5),
      0 0 60px rgba(255, 50, 50, 0.3);
    background: linear-gradient(180deg, #ffd89b 0%, #ff9a56 50%, #ff6b35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .char {
    display: inline-block;
    opacity: 0;
    transform: translateY(20px) rotateX(90deg);
    animation: charReveal 0.6s ease forwards;
  }

  @keyframes charReveal {
    to {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }

  .theme-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(139, 90, 43, 0.4) 0%,
      rgba(80, 50, 20, 0.6) 100%
    );
    border: 2px solid rgba(255, 170, 100, 0.3);
    border-radius: 8px;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
  }

  .theme-badge::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 40%,
      rgba(255, 200, 150, 0.1) 50%,
      transparent 60%
    );
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) rotate(45deg);
    }
  }

  .theme-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #b89a6a;
  }

  .theme-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffd89b;
    font-family: "Crimson Text", serif;
    font-style: italic;
  }

  .event-info {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
    margin-bottom: 3rem;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
  }

  .info-icon {
    font-size: 1.5rem;
  }

  .info-text {
    color: #c8b090;
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    animation: bounce 2s infinite;
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 3px solid rgba(255, 170, 100, 0.6);
    border-bottom: 3px solid rgba(255, 170, 100, 0.6);
    transform: rotate(45deg);
    animation: fadeArrow 2s infinite;
  }

  .scroll-arrow:nth-child(2) {
    animation-delay: 0.2s;
  }

  .scroll-arrow:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(10px);
    }
  }

  @keyframes fadeArrow {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }

  .projects-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(10, 8, 6, 0.9) 10%,
      rgba(10, 8, 6, 0.95) 100%
    );
    opacity: 0;
    transform: translateY(50px);
    transition:
      opacity 1s ease,
      transform 1s ease;
  }

  .projects-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .crystal-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .crystal-divider h2 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #ffd89b;
    text-shadow: 0 0 20px rgba(255, 150, 50, 0.5);
    white-space: nowrap;
  }

  .crystal {
    width: 30px;
    height: 60px;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 255, 0.8) 0%,
      rgba(138, 43, 226, 0.8) 100%
    );
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    animation: crystalGlow 2s ease-in-out infinite alternate;
  }

  .crystal.left {
    animation-delay: 0s;
  }

  .crystal.right {
    animation-delay: 1s;
  }

  @keyframes crystalGlow {
    0% {
      filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
      transform: scale(1);
    }
    100% {
      filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.8));
      transform: scale(1.1);
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .project-card {
    opacity: 0;
    transform: translateY(50px) rotateX(10deg);
    animation: cardReveal 0.8s ease forwards;
    text-decoration: none;
    color: inherit;
  }

  @keyframes cardReveal {
    to {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }

  .card-inner {
    position: relative;
    background: linear-gradient(
      145deg,
      rgba(50, 35, 25, 0.9) 0%,
      rgba(30, 20, 15, 0.95) 100%
    );
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 170, 100, 0.2);
    transition: all 0.4s ease;
    transform-style: preserve-3d;
  }

  .project-card:hover .card-inner {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(255, 170, 100, 0.5);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(255, 150, 50, 0.2);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 0%,
      rgba(255, 150, 50, 0.2) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .project-card:hover .card-glow {
    opacity: 1;
  }

  .card-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .project-card:hover .card-image img {
    transform: scale(1.1);
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      transparent 50%,
      rgba(10, 8, 6, 0.9) 100%
    );
  }

  .card-content {
    padding: 1.5rem;
    position: relative;
  }

  .project-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #ffd89b;
    text-shadow: 0 0 10px rgba(255, 150, 50, 0.3);
  }

  .prize-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(
      135deg,
      rgba(255, 215, 0, 0.2) 0%,
      rgba(255, 150, 50, 0.2) 100%
    );
    border-radius: 20px;
    border: 1px solid rgba(255, 215, 0, 0.3);
  }

  .prize-icon {
    font-size: 1rem;
  }

  .prize-text {
    font-size: 0.9rem;
    color: #ffd700;
    font-weight: 600;
  }

  .crystal-accent {
    position: absolute;
    bottom: -20px;
    right: 20px;
    width: 40px;
    height: 80px;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 200, 0.4) 0%,
      rgba(100, 50, 200, 0.4) 100%
    );
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.4s ease;
  }

  .project-card:hover .crystal-accent {
    opacity: 1;
    transform: translateY(0);
  }

  .all-submissions-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 4rem auto 0;
    padding: 1.5rem 3rem;
    max-width: 400px;
    background: linear-gradient(
      135deg,
      rgba(255, 100, 50, 0.3) 0%,
      rgba(200, 50, 50, 0.3) 100%
    );
    border: 2px solid rgba(255, 150, 100, 0.4);
    border-radius: 50px;
    font-size: 1.2rem;
    font-weight: 700;
    color: #ffd89b;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  .all-submissions-link::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  .all-submissions-link:hover::before {
    left: 100%;
  }

  .all-submissions-link:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 150, 100, 0.8);
    box-shadow:
      0 10px 30px rgba(255, 100, 50, 0.3),
      0 0 20px rgba(255, 150, 100, 0.2);
  }

  .link-arrow {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  .all-submissions-link:hover .link-arrow {
    transform: translateX(5px);
  }

  .bottom-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(180deg, rgba(10, 8, 6, 0.95) 0%, #0a0806 100%);
    overflow: hidden;
  }

  .cave-formation {
    position: absolute;
    bottom: 0;
    width: 300px;
    height: 400px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(40, 30, 20, 0.8) 100%
    );
    clip-path: polygon(0% 100%, 20% 60%, 40% 80%, 60% 40%, 80% 70%, 100% 100%);
  }

  .cave-formation.left {
    left: 0;
    transform: scaleX(-1);
  }

  .cave-formation.right {
    right: 0;
  }

  .bottom-content {
    text-align: center;
    position: relative;
  }

  .bottom-logo {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(0 0 20px rgba(255, 150, 50, 0.5));
    margin-bottom: 1.5rem;
    animation: logoFloat 4s ease-in-out infinite;
  }

  .bottom-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #b89a6a;
    margin-bottom: 0.5rem;
  }

  .bottom-subtext {
    font-size: 1rem;
    color: #8a7a5a;
    font-family: "Crimson Text", serif;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .event-info {
      gap: 1.5rem;
    }

    .crystal-divider {
      gap: 1rem;
    }

    .crystal {
      width: 20px;
      height: 40px;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .all-submissions-link {
      padding: 1rem 2rem;
      font-size: 1rem;
    }
  }
</style>
