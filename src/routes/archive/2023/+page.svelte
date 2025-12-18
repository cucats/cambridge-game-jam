<script>
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const projects = [
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
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let canvasContainer = $state(null);
  let scene, camera, renderer, animationId;
  let stalactites = [];
  let crystals = [];
  let particles;
  let fogParticles = [];
  let mouseX = $state(0);
  let mouseY = $state(0);
  let scrollY = $state(0);
  let hoveredProject = $state(null);
  let visible = $state(false);
  let projectsVisible = $state([]);

  function createStalactite(x, y, z, scale) {
    const geometry = new THREE.ConeGeometry(0.3 * scale, 2 * scale, 6);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a3728,
      shininess: 10,
      flatShading: true,
    });
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

  function createCrystal(x, y, z, color, scale) {
    const geometry = new THREE.OctahedronGeometry(0.4 * scale, 0);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      emissive: color,
      emissiveIntensity: 0.3,
    });
    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.set(x, y, z);
    crystal.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );
    crystal.userData = {
      rotationSpeed: 0.01 + Math.random() * 0.02,
      pulseSpeed: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      baseIntensity: 0.3,
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
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.2;
      } else if (colorChoice < 0.6) {
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 0.8;
      } else {
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.2;
      }

      sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  function createFogParticle(x, y, z) {
    const geometry = new THREE.PlaneGeometry(8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fog = new THREE.Mesh(geometry, material);
    fog.position.set(x, y, z);
    fog.userData = {
      speed: 0.2 + Math.random() * 0.3,
      originalX: x,
      range: 5 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
    };
    return fog;
  }

  function initThreeJS() {
    if (!canvasContainer) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.03);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xff6b35, 2, 50);
    mainLight.position.set(0, 5, 10);
    scene.add(mainLight);

    const crystalLight1 = new THREE.PointLight(0x4ecdc4, 1.5, 30);
    crystalLight1.position.set(-10, -5, 5);
    scene.add(crystalLight1);

    const crystalLight2 = new THREE.PointLight(0xff6b9d, 1.5, 30);
    crystalLight2.position.set(10, -5, 5);
    scene.add(crystalLight2);

    const caveLight = new THREE.PointLight(0xffa500, 1, 40);
    caveLight.position.set(0, -10, 8);
    scene.add(caveLight);

    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = 8 + Math.random() * 5;
      const z = (Math.random() - 0.5) * 20 - 5;
      const scale = 0.5 + Math.random() * 1.5;
      const stalactite = createStalactite(x, y, z, scale);
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = -8 - Math.random() * 3;
      const z = (Math.random() - 0.5) * 15 - 3;
      const scale = 0.3 + Math.random() * 0.7;
      const stalactite = createStalactite(x, y + 2, z, scale);
      stalactite.rotation.x = 0;
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    const crystalColors = [0x4ecdc4, 0xff6b9d, 0x45b7d1, 0x96ceb4, 0xffeaa7];
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 15 - 5;
      const color =
        crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const scale = 0.5 + Math.random() * 1;
      const crystal = createCrystal(x, y, z, color, scale);
      crystals.push(crystal);
      scene.add(crystal);
    }

    particles = createParticleSystem();
    scene.add(particles);

    for (let i = 0; i < 10; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 15;
      const z = Math.random() * 5;
      const fog = createFogParticle(x, y, z);
      fogParticles.push(fog);
      scene.add(fog);
    }

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    stalactites.forEach((s) => {
      s.position.y =
        s.userData.originalY +
        Math.sin(time * s.userData.speed + s.userData.phase) * 0.1;
    });

    crystals.forEach((c) => {
      c.rotation.y += c.userData.rotationSpeed;
      c.rotation.x += c.userData.rotationSpeed * 0.5;
      const pulse =
        Math.sin(time * c.userData.pulseSpeed + c.userData.phase) * 0.2 + 0.8;
      c.material.emissiveIntensity = c.userData.baseIntensity * pulse;
      c.scale.setScalar(0.9 + pulse * 0.2);
    });

    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.01;
        if (positions[i + 1] > 15) {
          positions[i + 1] = -15;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.02;
    }

    fogParticles.forEach((f) => {
      f.position.x =
        f.userData.originalX +
        Math.sin(time * f.userData.speed + f.userData.phase) * f.userData.range;
      f.rotation.z = time * 0.1;
      f.material.opacity = 0.1 + Math.sin(time * 0.5 + f.userData.phase) * 0.05;
    });

    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMount(() => {
    initThreeJS();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      visible = true;
    }, 100);

    projects.forEach((_, i) => {
      setTimeout(
        () => {
          projectsVisible = [...projectsVisible, i];
        },
        800 + i * 150,
      );
    });
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
</svelte:head>

<div class="cave-page">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <div class="content-overlay">
    <section class="hero" class:visible>
      <div class="hero-content">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="logo" />
        <h1 class="title">{title}</h1>
        <p class="date">{duration}</p>
        <div class="theme-badge">
          <span class="theme-icon">⛏️</span>
          <span class="theme-text">{theme}</span>
          <span class="theme-icon">💎</span>
        </div>
        <a href="https://itch.io/jam/camgamejam2023" class="submissions-link">
          {submissions} Submissions
        </a>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <section class="projects-section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        {#each projects as project, i}
          <a
            href={project.link}
            class="project-card"
            class:visible={projectsVisible.includes(i)}
            onmouseenter={() => (hoveredProject = i)}
            onmouseleave={() => (hoveredProject = null)}
            style="animation-delay: {i * 0.1}s"
          >
            <div class="project-image-container">
              <img src={project.src} alt={project.alt} class="project-image" />
              <div class="crystal-overlay"></div>
              <div class="project-glow"></div>
            </div>
            <div class="project-info">
              <h3 class="project-title">{project.title}</h3>
              {#if project.prize}
                <span class="project-prize">
                  <span class="prize-gem">💎</span>
                  {project.prize}
                </span>
              {/if}
            </div>
            <div class="hover-crystals" class:active={hoveredProject === i}>
              <span class="crystal c1">◆</span>
              <span class="crystal c2">◆</span>
              <span class="crystal c3">◆</span>
              <span class="crystal c4">◆</span>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="back-section">
      <a href="/archive" class="back-button">
        <span class="back-arrow">←</span>
        <span>Lorem Ipsum Archive</span>
      </a>
    </section>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .cave-page {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a12 0%, #1a1a2e 50%, #0a0a12 100%);
    color: #e0d5c7;
    font-family: "Lexend", sans-serif;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .content-overlay {
    position: relative;
    z-index: 1;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-content {
    max-width: 800px;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    margin-bottom: 2rem;
    filter: drop-shadow(0 0 30px rgba(255, 107, 53, 0.5));
    animation: float 4s ease-in-out infinite;
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

  .title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ff6b35 0%, #ffa500 50%, #4ecdc4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.3);
    }
  }

  .date {
    font-size: 1.5rem;
    color: #a89a8c;
    margin-bottom: 2rem;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(78, 205, 196, 0.2) 0%,
      rgba(255, 107, 53, 0.2) 100%
    );
    border: 2px solid rgba(255, 165, 0, 0.3);
    border-radius: 50px;
    margin-bottom: 2rem;
    animation: pulse-border 2s ease-in-out infinite;
  }

  @keyframes pulse-border {
    0%,
    100% {
      border-color: rgba(255, 165, 0, 0.3);
      box-shadow: 0 0 20px rgba(255, 165, 0, 0.1);
    }
    50% {
      border-color: rgba(78, 205, 196, 0.5);
      box-shadow: 0 0 40px rgba(78, 205, 196, 0.2);
    }
  }

  .theme-icon {
    font-size: 1.5rem;
    animation: spin-slow 10s linear infinite;
  }

  .theme-icon:last-child {
    animation-direction: reverse;
  }

  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .theme-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ffa500;
  }

  .submissions-link {
    display: inline-block;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
  }

  .submissions-link:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 20px 50px rgba(255, 107, 53, 0.4);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    animation: bounce 2s ease-in-out infinite;
  }

  .scroll-arrow {
    width: 30px;
    height: 30px;
    border-right: 3px solid rgba(255, 165, 0, 0.5);
    border-bottom: 3px solid rgba(255, 165, 0, 0.5);
    transform: rotate(45deg);
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(15px);
    }
  }

  .projects-section {
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(26, 26, 46, 0.8) 10%,
      rgba(26, 26, 46, 0.9) 90%,
      transparent 100%
    );
  }

  .section-title {
    text-align: center;
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 4rem;
    color: #4ecdc4;
    text-shadow: 0 0 30px rgba(78, 205, 196, 0.5);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .project-card {
    position: relative;
    background: linear-gradient(
      145deg,
      rgba(30, 30, 50, 0.9) 0%,
      rgba(20, 20, 35, 0.95) 100%
    );
    border-radius: 20px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(255, 165, 0, 0.2);
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }

  .project-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .project-card:hover {
    transform: translateY(-15px) scale(1.02);
    border-color: rgba(78, 205, 196, 0.5);
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.5),
      0 0 40px rgba(78, 205, 196, 0.2);
  }

  .project-image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .project-card:hover .project-image {
    transform: scale(1.1);
  }

  .crystal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(78, 205, 196, 0.1) 0%,
      rgba(255, 107, 157, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .project-card:hover .crystal-overlay {
    opacity: 1;
  }

  .project-glow {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(
      to top,
      rgba(20, 20, 35, 1) 0%,
      transparent 100%
    );
  }

  .project-info {
    padding: 1.5rem;
    text-align: center;
  }

  .project-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #fff;
    transition: color 0.3s ease;
  }

  .project-card:hover .project-title {
    color: #4ecdc4;
  }

  .project-prize {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(
      135deg,
      rgba(255, 165, 0, 0.2) 0%,
      rgba(255, 107, 53, 0.2) 100%
    );
    border-radius: 20px;
    font-size: 0.9rem;
    color: #ffa500;
  }

  .prize-gem {
    animation: sparkle 1.5s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }

  .hover-crystals {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .crystal {
    position: absolute;
    font-size: 1.5rem;
    opacity: 0;
    transform: scale(0);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .hover-crystals.active .crystal {
    opacity: 1;
    transform: scale(1);
  }

  .c1 {
    top: 10%;
    left: 5%;
    color: #4ecdc4;
    transition-delay: 0s;
  }
  .c2 {
    top: 15%;
    right: 8%;
    color: #ff6b9d;
    transition-delay: 0.1s;
  }
  .c3 {
    bottom: 20%;
    left: 8%;
    color: #ffa500;
    transition-delay: 0.2s;
  }
  .c4 {
    bottom: 25%;
    right: 5%;
    color: #45b7d1;
    transition-delay: 0.3s;
  }

  .hover-crystals.active .c1 {
    animation: crystal-float1 2s ease-in-out infinite;
  }
  .hover-crystals.active .c2 {
    animation: crystal-float2 2.2s ease-in-out infinite;
  }
  .hover-crystals.active .c3 {
    animation: crystal-float3 1.8s ease-in-out infinite;
  }
  .hover-crystals.active .c4 {
    animation: crystal-float4 2.4s ease-in-out infinite;
  }

  @keyframes crystal-float1 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(5px, -5px) rotate(15deg);
    }
  }
  @keyframes crystal-float2 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(-5px, -8px) rotate(-10deg);
    }
  }
  @keyframes crystal-float3 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(8px, 5px) rotate(20deg);
    }
  }
  @keyframes crystal-float4 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(-8px, 3px) rotate(-15deg);
    }
  }

  .back-section {
    padding: 4rem 2rem;
    text-align: center;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 165, 0, 0.3);
    border-radius: 30px;
    color: #a89a8c;
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.4s ease;
  }

  .back-button:hover {
    background: rgba(255, 165, 0, 0.1);
    border-color: rgba(255, 165, 0, 0.6);
    color: #ffa500;
    transform: translateX(-10px);
  }

  .back-arrow {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  .back-button:hover .back-arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .logo {
      width: 150px;
      height: 150px;
    }

    .theme-badge {
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
    }

    .projects-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .project-image-container {
      height: 180px;
    }
  }
</style>
