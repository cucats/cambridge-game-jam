<script>
  import { onMount } from "svelte";
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
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let canvasContainer;
  let scrollY = $state(0);
  let innerHeight = $state(0);
  let innerWidth = $state(0);
  let heroVisible = $state(true);
  let projectsVisible = $state(false);
  let crystalsLoaded = $state(false);

  onMount(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 30;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0f, 1);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const crystalColors = [0x00ffaa, 0xff6b35, 0x7b2cbf, 0x00b4d8, 0xffd60a];

    crystalColors.forEach((color, i) => {
      const light = new THREE.PointLight(color, 2, 50);
      light.position.set(
        Math.cos((i / crystalColors.length) * Math.PI * 2) * 20,
        Math.sin(i * 1.5) * 10 - 5,
        Math.sin((i / crystalColors.length) * Math.PI * 2) * 20,
      );
      scene.add(light);
    });

    const stalactites = [];
    const stalagmites = [];

    function createStalactite(x, y, z, height, radius) {
      const geometry = new THREE.ConeGeometry(radius, height, 6);
      const material = new THREE.MeshPhongMaterial({
        color: 0x2a2a3a,
        shininess: 30,
        flatShading: true,
      });
      const cone = new THREE.Mesh(geometry, material);
      cone.position.set(x, y, z);
      cone.rotation.x = Math.PI;
      return cone;
    }

    function createStalagmite(x, y, z, height, radius) {
      const geometry = new THREE.ConeGeometry(radius, height, 6);
      const material = new THREE.MeshPhongMaterial({
        color: 0x3a3a4a,
        shininess: 30,
        flatShading: true,
      });
      const cone = new THREE.Mesh(geometry, material);
      cone.position.set(x, y, z);
      return cone;
    }

    for (let i = 0; i < 80; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100 - 20;
      const height = Math.random() * 8 + 3;
      const radius = Math.random() * 1.5 + 0.5;
      const stalactite = createStalactite(x, 25, z, height, radius);
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100 - 20;
      const height = Math.random() * 6 + 2;
      const radius = Math.random() * 1.2 + 0.3;
      const stalagmite = createStalagmite(
        x,
        -25 + height / 2,
        z,
        height,
        radius,
      );
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    const crystals = [];
    function createCrystal(x, y, z, color, scale = 1) {
      const group = new THREE.Group();

      const geometry = new THREE.OctahedronGeometry(1.5 * scale, 0);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
        shininess: 100,
      });
      const crystal = new THREE.Mesh(geometry, material);
      crystal.scale.y = 2;
      group.add(crystal);

      const glowGeometry = new THREE.SphereGeometry(2.5 * scale, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);

      group.position.set(x, y, z);
      group.userData = { originalY: y, phase: Math.random() * Math.PI * 2 };
      return group;
    }

    const crystalPositions = [
      { x: -15, y: -10, z: -5, color: 0x00ffaa, scale: 1.5 },
      { x: 20, y: -8, z: -10, color: 0xff6b35, scale: 1.2 },
      { x: -25, y: -12, z: -15, color: 0x7b2cbf, scale: 1.8 },
      { x: 30, y: -15, z: -8, color: 0x00b4d8, scale: 1.3 },
      { x: 0, y: -20, z: -25, color: 0xffd60a, scale: 2 },
      { x: -35, y: -5, z: -30, color: 0xff006e, scale: 1.1 },
      { x: 35, y: -18, z: -20, color: 0x8338ec, scale: 1.4 },
      { x: 10, y: -22, z: -35, color: 0x06d6a0, scale: 1.6 },
    ];

    crystalPositions.forEach((pos) => {
      const crystal = createCrystal(pos.x, pos.y, pos.z, pos.color, pos.scale);
      crystals.push(crystal);
      scene.add(crystal);
    });

    const particles = [];
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 100;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20;
      particleSizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    particleGeometry.setAttribute(
      "size",
      new THREE.BufferAttribute(particleSizes, 1),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffdd88,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    const caveFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        side: THREE.DoubleSide,
      }),
    );
    caveFloor.rotation.x = -Math.PI / 2;
    caveFloor.position.y = -25;
    scene.add(caveFloor);

    const caveCeiling = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshPhongMaterial({
        color: 0x0f0f1a,
        side: THREE.DoubleSide,
      }),
    );
    caveCeiling.rotation.x = Math.PI / 2;
    caveCeiling.position.y = 25;
    scene.add(caveCeiling);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX * 5;
      camera.position.y = -mouseY * 3 + (scrollY / innerHeight) * -30;
      camera.lookAt(0, camera.position.y - 10, -30);

      crystals.forEach((crystal, i) => {
        crystal.rotation.y += 0.01;
        crystal.position.y =
          crystal.userData.originalY +
          Math.sin(time + crystal.userData.phase) * 0.5;
        crystal.children[0].material.emissiveIntensity =
          0.3 + Math.sin(time * 2 + crystal.userData.phase) * 0.2;
      });

      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 25) {
          positions[i * 3 + 1] = -25;
        }
        positions[i * 3] += Math.sin(time + i) * 0.01;
        positions[i * 3 + 2] += Math.cos(time + i) * 0.01;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      particleMaterial.opacity = 0.4 + Math.sin(time) * 0.2;

      renderer.render(scene, camera);
    };

    animate();
    crystalsLoaded = true;

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      canvasContainer.removeChild(renderer.domElement);
    };
  });

  function handleScroll() {
    scrollY = window.scrollY;
    heroVisible = scrollY < innerHeight * 0.5;
    projectsVisible = scrollY > innerHeight * 0.3;
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<svelte:window
  bind:scrollY
  bind:innerHeight
  bind:innerWidth
  onscroll={handleScroll}
/>

<div class="cave-container">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <section class="hero-section" class:visible={heroVisible}>
    <div class="hero-content">
      <div class="logo-container">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="logo" />
        <div class="logo-glow"></div>
      </div>
      <h1 class="title">{title}</h1>
      <div class="theme-badge">
        <span class="theme-text">{theme}</span>
      </div>
      <p class="duration">{duration}</p>
      <div class="stats">
        <div class="stat">
          <span class="stat-number">{submissions}</span>
          <span class="stat-label">Lorem Ipsum</span>
        </div>
        <div class="stat">
          <span class="stat-number">48</span>
          <span class="stat-label">Dolor Sit</span>
        </div>
        <div class="stat">
          <span class="stat-number">5</span>
          <span class="stat-label">Amet Consectetur</span>
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
      <h2 class="section-title">Featured Projects</h2>
      <div class="crystal-divider">
        <div class="crystal-shape"></div>
        <div class="crystal-shape"></div>
        <div class="crystal-shape"></div>
      </div>
    </div>

    <div class="projects-grid">
      {#each featuredProjects as project, index}
        <a
          href={project.link}
          class="project-card"
          style="--delay: {index * 0.1}s"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="card-glow"></div>
          <div class="card-inner">
            <div class="image-container">
              <img src={project.src} alt={project.alt} class="project-image" />
              <div class="image-overlay"></div>
            </div>
            <div class="project-info">
              <h3 class="project-title">{project.title}</h3>
              {#if project.prize}
                <div class="prize-badge">
                  <span class="prize-icon">◆</span>
                  <span>{project.prize}</span>
                </div>
              {/if}
            </div>
          </div>
          <div class="card-particles">
            {#each Array(6) as _, i}
              <div class="particle" style="--i: {i}"></div>
            {/each}
          </div>
        </a>
      {/each}
    </div>
  </section>

  <section class="cta-section">
    <div class="cta-content">
      <a
        href="https://itch.io/jam/camgamejam2023"
        class="cta-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="button-text">All Submissions</span>
        <div class="button-glow"></div>
      </a>
      <a href="/archive" class="back-link">
        <span class="arrow">←</span>
        <span>Archive</span>
      </a>
    </div>
  </section>
</div>

<style>
  .cave-container {
    position: relative;
    min-height: 300vh;
    background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .hero-section {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.8s ease,
      transform 0.8s ease;
  }

  .hero-section.visible {
    opacity: 1;
    transform: translateY(0);
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
    width: 200px;
    height: 200px;
    object-fit: contain;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 0 30px rgba(0, 255, 170, 0.5));
    animation: float 4s ease-in-out infinite;
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(
      circle,
      rgba(0, 255, 170, 0.3) 0%,
      transparent 70%
    );
    animation: pulse 3s ease-in-out infinite;
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

  @keyframes pulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.5;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.8;
    }
  }

  .title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    background: linear-gradient(135deg, #00ffaa 0%, #00b4d8 50%, #7b2cbf 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 60px rgba(0, 255, 170, 0.5);
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
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

  .theme-badge {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 170, 0.2) 0%,
      rgba(123, 44, 191, 0.2) 100%
    );
    border: 1px solid rgba(0, 255, 170, 0.4);
    border-radius: 50px;
    margin-bottom: 1.5rem;
    animation: glow 2s ease-in-out infinite;
  }

  @keyframes glow {
    0%,
    100% {
      box-shadow:
        0 0 20px rgba(0, 255, 170, 0.3),
        inset 0 0 20px rgba(0, 255, 170, 0.1);
    }
    50% {
      box-shadow:
        0 0 40px rgba(0, 255, 170, 0.5),
        inset 0 0 30px rgba(0, 255, 170, 0.2);
    }
  }

  .theme-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #00ffaa;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .duration {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
    font-weight: 300;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .stat {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 3rem;
    font-weight: 700;
    color: #00b4d8;
    text-shadow: 0 0 30px rgba(0, 180, 216, 0.5);
  }

  .stat-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    animation: bounce 2s ease-in-out infinite;
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 2px solid rgba(0, 255, 170, 0.6);
    border-bottom: 2px solid rgba(0, 255, 170, 0.6);
    transform: rotate(45deg);
    animation: fade-cascade 2s ease-in-out infinite;
  }

  .scroll-arrow:nth-child(1) {
    animation-delay: 0s;
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

  @keyframes fade-cascade {
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
    z-index: 10;
    padding: 4rem 2rem;
    min-height: 100vh;
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

  .section-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: white;
    margin-bottom: 1.5rem;
    text-shadow: 0 0 40px rgba(0, 255, 170, 0.3);
  }

  .crystal-divider {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .crystal-shape {
    width: 12px;
    height: 24px;
    background: linear-gradient(135deg, #00ffaa 0%, #7b2cbf 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    animation: crystal-float 2s ease-in-out infinite;
  }

  .crystal-shape:nth-child(2) {
    animation-delay: 0.3s;
    transform: scale(1.2);
  }

  .crystal-shape:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes crystal-float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-5px) rotate(180deg);
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .project-card {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    text-decoration: none;
    transform: translateY(0);
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: card-appear 0.8s ease-out backwards;
    animation-delay: var(--delay);
  }

  @keyframes card-appear {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .project-card:hover {
    transform: translateY(-10px) scale(1.02);
  }

  .card-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 170, 0.5) 0%,
      rgba(123, 44, 191, 0.5) 50%,
      rgba(0, 180, 216, 0.5) 100%
    );
    border-radius: 22px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.5s ease;
    filter: blur(10px);
  }

  .project-card:hover .card-glow {
    opacity: 1;
    animation: rotate-glow 3s linear infinite;
  }

  @keyframes rotate-glow {
    0% {
      filter: blur(10px) hue-rotate(0deg);
    }
    100% {
      filter: blur(10px) hue-rotate(360deg);
    }
  }

  .card-inner {
    position: relative;
    background: linear-gradient(
      180deg,
      rgba(26, 26, 46, 0.9) 0%,
      rgba(15, 15, 26, 0.95) 100%
    );
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(0, 255, 170, 0.2);
  }

  .image-container {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .project-card:hover .project-image {
    transform: scale(1.1);
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 50%,
      rgba(10, 10, 15, 0.9) 100%
    );
    pointer-events: none;
  }

  .project-info {
    padding: 1.5rem;
  }

  .project-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
  }

  .project-card:hover .project-title {
    color: #00ffaa;
  }

  .prize-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(
      135deg,
      rgba(255, 107, 53, 0.2) 0%,
      rgba(255, 214, 10, 0.2) 100%
    );
    border: 1px solid rgba(255, 214, 10, 0.3);
    border-radius: 20px;
    font-size: 0.875rem;
    color: #ffd60a;
    font-weight: 500;
  }

  .prize-icon {
    animation: sparkle 1.5s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%,
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .card-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .project-card:hover .card-particles {
    opacity: 1;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #00ffaa;
    border-radius: 50%;
    animation: particle-float 2s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.2s);
  }

  .particle:nth-child(1) {
    left: 10%;
    top: 20%;
  }
  .particle:nth-child(2) {
    left: 30%;
    top: 70%;
  }
  .particle:nth-child(3) {
    left: 70%;
    top: 30%;
  }
  .particle:nth-child(4) {
    left: 90%;
    top: 60%;
  }
  .particle:nth-child(5) {
    left: 50%;
    top: 10%;
  }
  .particle:nth-child(6) {
    left: 20%;
    top: 90%;
  }

  @keyframes particle-float {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
      opacity: 0;
    }
    50% {
      transform: translate(10px, -20px) scale(1.5);
      opacity: 1;
    }
  }

  .cta-section {
    position: relative;
    z-index: 10;
    padding: 4rem 2rem 8rem;
    display: flex;
    justify-content: center;
  }

  .cta-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .cta-button {
    position: relative;
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0a0a0f;
    background: linear-gradient(135deg, #00ffaa 0%, #00b4d8 100%);
    border: none;
    border-radius: 50px;
    text-decoration: none;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .cta-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 40px rgba(0, 255, 170, 0.5);
  }

  .button-text {
    position: relative;
    z-index: 2;
  }

  .button-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 50%
    );
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .cta-button:hover .button-glow {
    opacity: 1;
    animation: button-pulse 1.5s ease-in-out infinite;
  }

  @keyframes button-pulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    color: #00ffaa;
    transform: translateX(-5px);
  }

  .arrow {
    transition: transform 0.3s ease;
  }

  .back-link:hover .arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .stats {
      gap: 1.5rem;
    }

    .stat-number {
      font-size: 2rem;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .logo {
      width: 150px;
      height: 150px;
    }

    .logo-glow {
      width: 180px;
      height: 180px;
    }
  }
</style>
