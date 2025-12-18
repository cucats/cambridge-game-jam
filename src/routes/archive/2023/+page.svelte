<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

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

  let canvasContainer = $state(null);
  let THREE;
  let scene, camera, renderer, animationId;
  let stalactites = [];
  let stalagmites = [];
  let crystals = [];
  let particles;
  let torchLights = [];
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let currentProjectIndex = $state(0);
  let projectsVisible = $state(false);

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function handleScroll() {
    scrollY = window.scrollY;
    const projectsSection = document.getElementById("projects-section");
    if (projectsSection) {
      const rect = projectsSection.getBoundingClientRect();
      projectsVisible = rect.top < window.innerHeight * 0.8;
    }
  }

  function createCaveGeometry() {
    const caveGroup = new THREE.Group();

    const caveGeometry = new THREE.TorusGeometry(15, 8, 32, 100);
    const caveMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1a0a,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.BackSide,
    });
    const cave = new THREE.Mesh(caveGeometry, caveMaterial);
    cave.rotation.x = Math.PI / 2;
    cave.scale.set(1, 1, 3);
    caveGroup.add(cave);

    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 3 + 1;
      const radius = Math.random() * 0.15 + 0.05;
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.08, 0.3, 0.15 + Math.random() * 0.1),
        roughness: 0.8,
        metalness: 0.2,
      });
      const stalactite = new THREE.Mesh(geometry, material);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 6 + 2;
      stalactite.position.set(
        Math.cos(angle) * distance,
        5 + Math.random() * 2,
        Math.sin(angle) * distance * 3 - 10
      );
      stalactite.rotation.x = Math.PI;
      stalactite.userData = {
        originalY: stalactite.position.y,
        speed: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
      };
      stalactites.push(stalactite);
      caveGroup.add(stalactite);
    }

    for (let i = 0; i < 35; i++) {
      const height = Math.random() * 2 + 0.5;
      const radius = Math.random() * 0.2 + 0.08;
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.08, 0.25, 0.12 + Math.random() * 0.08),
        roughness: 0.85,
        metalness: 0.15,
      });
      const stalagmite = new THREE.Mesh(geometry, material);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 6 + 1;
      stalagmite.position.set(
        Math.cos(angle) * distance,
        -5 + height / 2,
        Math.sin(angle) * distance * 3 - 10
      );
      stalagmite.userData = {
        originalY: stalagmite.position.y,
        speed: Math.random() * 0.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
      };
      stalagmites.push(stalagmite);
      caveGroup.add(stalagmite);
    }

    const crystalColors = [0x9b59b6, 0x3498db, 0x1abc9c, 0xe74c3c, 0xf39c12];
    for (let i = 0; i < 25; i++) {
      const geometry = new THREE.OctahedronGeometry(Math.random() * 0.4 + 0.2);
      const color = crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const crystal = new THREE.Mesh(geometry, material);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 5 + 2;
      const yPos = (Math.random() - 0.5) * 8;
      crystal.position.set(
        Math.cos(angle) * distance,
        yPos,
        Math.sin(angle) * distance * 2.5 - 8
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulseSpeed: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2,
        baseEmissive: 0.3,
      };
      crystals.push(crystal);
      caveGroup.add(crystal);
    }

    return caveGroup;
  }

  function createParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 8;
      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = Math.sin(angle) * distance * 2 - 10;

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 0.2;
      } else if (colorChoice < 0.6) {
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 1;
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
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  function createLighting() {
    const ambientLight = new THREE.AmbientLight(0x1a0a00, 0.3);
    scene.add(ambientLight);

    const torchPositions = [
      { x: -4, y: 0, z: -5 },
      { x: 4, y: 0, z: -5 },
      { x: 0, y: 2, z: -15 },
      { x: -3, y: -2, z: -20 },
      { x: 3, y: -2, z: -20 },
    ];

    torchPositions.forEach((pos) => {
      const light = new THREE.PointLight(0xff6600, 2, 15);
      light.position.set(pos.x, pos.y, pos.z);
      light.userData = {
        baseIntensity: 2,
        flickerSpeed: Math.random() * 3 + 2,
        phase: Math.random() * Math.PI * 2,
      };
      torchLights.push(light);
      scene.add(light);

      const glowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.8,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(light.position);
      scene.add(glow);
    });

    const mainLight = new THREE.SpotLight(0xffa500, 3, 30, Math.PI / 4, 0.5);
    mainLight.position.set(0, 8, 5);
    mainLight.target.position.set(0, 0, -10);
    scene.add(mainLight);
    scene.add(mainLight.target);
  }

  function animate(time) {
    animationId = requestAnimationFrame(animate);

    const t = time * 0.001;

    stalactites.forEach((s) => {
      s.position.y = s.userData.originalY + Math.sin(t * s.userData.speed + s.userData.phase) * 0.05;
    });

    stalagmites.forEach((s) => {
      s.position.y = s.userData.originalY + Math.sin(t * s.userData.speed + s.userData.phase) * 0.03;
    });

    crystals.forEach((c) => {
      c.rotation.y += c.userData.rotationSpeed;
      const pulse = Math.sin(t * c.userData.pulseSpeed + c.userData.phase) * 0.5 + 0.5;
      c.material.emissiveIntensity = c.userData.baseEmissive + pulse * 0.4;
    });

    torchLights.forEach((light) => {
      const flicker = Math.sin(t * light.userData.flickerSpeed + light.userData.phase) * 0.3 +
        Math.sin(t * light.userData.flickerSpeed * 2.7 + light.userData.phase) * 0.2;
      light.intensity = light.userData.baseIntensity + flicker;
    });

    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(t + i) * 0.002;
        if (positions[i + 1] > 6) positions[i + 1] = -6;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.05;
    }

    camera.position.x = mouseX * 1.5;
    camera.position.y = mouseY * 1 + scrollY * 0.002;
    camera.lookAt(0, 0, -10);

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!camera || !renderer || !canvasContainer) return;
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  onMount(async () => {
    if (!browser) return;

    THREE = await import("three");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0505);
    scene.fog = new THREE.FogExp2(0x0a0505, 0.03);

    camera = new THREE.PerspectiveCamera(
      75,
      canvasContainer.clientWidth / canvasContainer.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasContainer.appendChild(renderer.domElement);

    const caveGroup = createCaveGeometry();
    scene.add(caveGroup);

    particles = createParticles();
    scene.add(particles);

    createLighting();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    animate(0);
  });

  onDestroy(() => {
    if (!browser) return;
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
    }
  });

  function nextProject() {
    currentProjectIndex = (currentProjectIndex + 1) % featuredProjects.length;
  }

  function prevProject() {
    currentProjectIndex = (currentProjectIndex - 1 + featuredProjects.length) % featuredProjects.length;
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cave-page">
  <div bind:this={canvasContainer} class="canvas-container"></div>

  <section class="hero-section">
    <div class="hero-content">
      <div class="logo-glow">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="hero-logo" />
      </div>
      <h1 class="hero-title">{title}</h1>
      <p class="hero-date">{duration}</p>
      <div class="theme-badge">
        <span class="theme-icon">⛏️</span>
        <span class="theme-text">{theme}</span>
      </div>
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-number">{submissions}</span>
          <span class="stat-label">Lorem Ipsum</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">48</span>
          <span class="stat-label">Dolor Sit</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">5</span>
          <span class="stat-label">Amet Consectetur</span>
        </div>
      </div>
      <a href="#projects-section" class="scroll-indicator">
        <span class="scroll-text">Lorem Ipsum</span>
        <div class="scroll-arrow">▼</div>
      </a>
    </div>
  </section>

  <section id="projects-section" class="projects-section">
    <div class="section-header">
      <div class="crystal-decoration left"></div>
      <h2 class="section-title">Lorem Ipsum Dolor</h2>
      <div class="crystal-decoration right"></div>
    </div>

    <div class="projects-carousel" class:visible={projectsVisible}>
      <button class="carousel-btn prev" onclick={prevProject}>
        <span>◀</span>
      </button>

      <div class="projects-stage">
        {#each featuredProjects as project, index}
          <a
            href={project.link}
            class="project-card"
            class:active={index === currentProjectIndex}
            class:prev={index === (currentProjectIndex - 1 + featuredProjects.length) % featuredProjects.length}
            class:next={index === (currentProjectIndex + 1) % featuredProjects.length}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="project-frame">
              <div class="crystal-corner tl"></div>
              <div class="crystal-corner tr"></div>
              <div class="crystal-corner bl"></div>
              <div class="crystal-corner br"></div>
              <img src={project.src} alt={project.alt} class="project-image" />
              <div class="project-overlay">
                <h3 class="project-title">{project.title}</h3>
                <div class="prize-badge">
                  <span class="prize-icon">🏆</span>
                  <span class="prize-text">{project.prize}</span>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>

      <button class="carousel-btn next" onclick={nextProject}>
        <span>▶</span>
      </button>
    </div>

    <div class="carousel-indicators">
      {#each featuredProjects as _, index}
        <button
          class="indicator"
          class:active={index === currentProjectIndex}
          onclick={() => (currentProjectIndex = index)}
          aria-label="Go to project {index + 1}"
        ></button>
      {/each}
    </div>
  </section>

  <section class="gallery-section">
    <div class="section-header">
      <div class="crystal-decoration left"></div>
      <h2 class="section-title">Lorem Ipsum</h2>
      <div class="crystal-decoration right"></div>
    </div>

    <div class="gallery-grid">
      {#each featuredProjects as project, index}
        <a
          href={project.link}
          class="gallery-item"
          style="animation-delay: {index * 0.1}s"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="gallery-image-wrapper">
            <img src={project.src} alt={project.alt} class="gallery-image" />
            <div class="gallery-glow"></div>
          </div>
          <div class="gallery-info">
            <h4 class="gallery-title">{project.title}</h4>
            <p class="gallery-prize">{project.prize}</p>
          </div>
        </a>
      {/each}

      <a
        href="https://itch.io/jam/camgamejam2023"
        class="gallery-item all-submissions"
        style="animation-delay: {featuredProjects.length * 0.1}s"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="gallery-image-wrapper">
          <img src="/2023/all-submissions.png" alt="All Submissions" class="gallery-image" />
          <div class="gallery-glow"></div>
        </div>
        <div class="gallery-info">
          <h4 class="gallery-title">Lorem Ipsum</h4>
          <p class="gallery-prize">{submissions} Dolor</p>
        </div>
      </a>
    </div>
  </section>

  <section class="cta-section">
    <div class="cave-border top"></div>
    <div class="cta-content">
      <h2 class="cta-title">Lorem Ipsum Dolor Sit</h2>
      <p class="cta-text">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      <a href="/archive" class="cta-button">
        <span class="button-text">Lorem Ipsum</span>
        <span class="button-glow"></span>
      </a>
    </div>
    <div class="cave-border bottom"></div>
  </section>
</div>

<style>
  .cave-page {
    position: relative;
    background: linear-gradient(180deg, #0a0505 0%, #1a0a0a 50%, #0a0505 100%);
    color: #e8d4b8;
    font-family: "Lexend", sans-serif;
    overflow-x: hidden;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
  }

  .hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .hero-content {
    text-align: center;
    padding: 2rem;
    animation: fadeInUp 1.5s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .logo-glow {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
  }

  .logo-glow::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(255, 102, 0, 0.4) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
    z-index: -1;
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.3;
    }
  }

  .hero-logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(255, 102, 0, 0.5));
    animation: float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    background: linear-gradient(135deg, #ff6600 0%, #ffaa00 50%, #ff6600 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
    text-shadow: 0 0 40px rgba(255, 102, 0, 0.3);
    margin-bottom: 0.5rem;
  }

  @keyframes shimmer {
    to {
      background-position: 200% center;
    }
  }

  .hero-date {
    font-size: 1.5rem;
    color: #c9a87c;
    margin-bottom: 1.5rem;
    letter-spacing: 0.1em;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, rgba(139, 69, 19, 0.6) 0%, rgba(101, 67, 33, 0.6) 100%);
    border: 2px solid #8b4513;
    border-radius: 50px;
    padding: 1rem 2rem;
    margin-bottom: 2rem;
    animation: glowBorder 2s ease-in-out infinite alternate;
  }

  @keyframes glowBorder {
    from {
      box-shadow: 0 0 10px rgba(255, 102, 0, 0.3), inset 0 0 10px rgba(255, 102, 0, 0.1);
    }
    to {
      box-shadow: 0 0 25px rgba(255, 102, 0, 0.5), inset 0 0 15px rgba(255, 102, 0, 0.2);
    }
  }

  .theme-icon {
    font-size: 1.5rem;
    animation: swing 2s ease-in-out infinite;
  }

  @keyframes swing {
    0%, 100% {
      transform: rotate(-10deg);
    }
    50% {
      transform: rotate(10deg);
    }
  }

  .theme-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ffcc80;
  }

  .stats-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 800;
    color: #ff8c00;
    text-shadow: 0 0 20px rgba(255, 140, 0, 0.5);
  }

  .stat-label {
    font-size: 0.9rem;
    color: #a08060;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .stat-divider {
    width: 2px;
    height: 50px;
    background: linear-gradient(180deg, transparent, #8b4513, transparent);
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #c9a87c;
    text-decoration: none;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(10px);
    }
  }

  .scroll-text {
    font-size: 0.9rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .scroll-arrow {
    font-size: 1.5rem;
    color: #ff6600;
  }

  .projects-section {
    position: relative;
    padding: 6rem 2rem;
    background: linear-gradient(180deg, transparent 0%, rgba(20, 10, 5, 0.9) 20%, rgba(20, 10, 5, 0.9) 80%, transparent 100%);
    z-index: 1;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: #ffcc80;
    text-align: center;
    text-shadow: 0 0 30px rgba(255, 140, 0, 0.4);
  }

  .crystal-decoration {
    width: 60px;
    height: 30px;
    background: linear-gradient(135deg, #9b59b6, #3498db);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    animation: crystalGlow 2s ease-in-out infinite alternate;
  }

  @keyframes crystalGlow {
    from {
      filter: drop-shadow(0 0 5px rgba(155, 89, 182, 0.5));
    }
    to {
      filter: drop-shadow(0 0 15px rgba(155, 89, 182, 0.8));
    }
  }

  .projects-carousel {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem 0;
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease-out;
  }

  .projects-carousel.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .carousel-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid #8b4513;
    background: linear-gradient(135deg, rgba(139, 69, 19, 0.8), rgba(101, 67, 33, 0.8));
    color: #ffcc80;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
  }

  .carousel-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 102, 0, 0.5);
    border-color: #ff6600;
  }

  .projects-stage {
    position: relative;
    width: 100%;
    max-width: 600px;
    height: 400px;
    perspective: 1000px;
  }

  .project-card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    max-width: 500px;
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    text-decoration: none;
  }

  .project-card.active {
    transform: translate(-50%, -50%) scale(1) rotateY(0deg);
    opacity: 1;
    pointer-events: auto;
    z-index: 5;
  }

  .project-card.prev {
    transform: translate(-120%, -50%) scale(0.8) rotateY(25deg);
    opacity: 0.5;
    z-index: 3;
  }

  .project-card.next {
    transform: translate(20%, -50%) scale(0.8) rotateY(-25deg);
    opacity: 0.5;
    z-index: 3;
  }

  .project-frame {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(135deg, #2a1a0a, #1a0a00);
    border: 3px solid #8b4513;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(255, 102, 0, 0.1);
  }

  .crystal-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    z-index: 10;
  }

  .crystal-corner.tl {
    top: -5px;
    left: -5px;
    background: linear-gradient(135deg, #9b59b6, transparent);
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }

  .crystal-corner.tr {
    top: -5px;
    right: -5px;
    background: linear-gradient(-135deg, #3498db, transparent);
    clip-path: polygon(0 0, 100% 0, 100% 100%);
  }

  .crystal-corner.bl {
    bottom: -5px;
    left: -5px;
    background: linear-gradient(45deg, #1abc9c, transparent);
    clip-path: polygon(0 0, 0 100%, 100% 100%);
  }

  .crystal-corner.br {
    bottom: -5px;
    right: -5px;
    background: linear-gradient(-45deg, #e74c3c, transparent);
    clip-path: polygon(100% 0, 0 100%, 100% 100%);
  }

  .project-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .project-card:hover .project-image {
    transform: scale(1.05);
  }

  .project-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(0deg, rgba(10, 5, 5, 0.95) 0%, transparent 100%);
  }

  .project-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #ffcc80;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  }

  .prize-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, rgba(255, 140, 0, 0.3), rgba(255, 102, 0, 0.3));
    border: 1px solid #ff8c00;
    border-radius: 20px;
    padding: 0.5rem 1rem;
  }

  .prize-icon {
    font-size: 1.2rem;
  }

  .prize-text {
    font-size: 1rem;
    color: #ffd700;
    font-weight: 600;
  }

  .carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #8b4513;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .indicator.active {
    background: #ff6600;
    border-color: #ff6600;
    box-shadow: 0 0 15px rgba(255, 102, 0, 0.6);
    transform: scale(1.2);
  }

  .indicator:hover {
    border-color: #ff6600;
  }

  .gallery-section {
    position: relative;
    padding: 6rem 2rem;
    background: linear-gradient(180deg, rgba(20, 10, 5, 0.9) 0%, rgba(15, 8, 4, 0.95) 100%);
    z-index: 1;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .gallery-item {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #2a1a0a, #1a0a00);
    border: 2px solid #5a3a1a;
    text-decoration: none;
    transition: all 0.4s ease;
    animation: fadeInStagger 0.6s ease-out backwards;
  }

  @keyframes fadeInStagger {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .gallery-item:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: #ff6600;
    box-shadow: 0 20px 40px rgba(255, 102, 0, 0.2), 0 0 30px rgba(255, 102, 0, 0.1);
  }

  .gallery-image-wrapper {
    position: relative;
    overflow: hidden;
  }

  .gallery-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .gallery-item:hover .gallery-image {
    transform: scale(1.1);
  }

  .gallery-glow {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(0deg, rgba(255, 102, 0, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .gallery-item:hover .gallery-glow {
    opacity: 1;
  }

  .gallery-info {
    padding: 1.5rem;
  }

  .gallery-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffcc80;
    margin-bottom: 0.5rem;
  }

  .gallery-prize {
    font-size: 0.9rem;
    color: #a08060;
    margin: 0;
  }

  .all-submissions {
    background: linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(52, 152, 219, 0.2));
    border-color: #9b59b6;
  }

  .all-submissions:hover {
    border-color: #9b59b6;
    box-shadow: 0 20px 40px rgba(155, 89, 182, 0.2), 0 0 30px rgba(155, 89, 182, 0.1);
  }

  .cta-section {
    position: relative;
    padding: 8rem 2rem;
    text-align: center;
    z-index: 1;
  }

  .cave-border {
    height: 100px;
    background-size: 100px 100%;
  }

  .cave-border.top {
    background: linear-gradient(0deg, rgba(20, 10, 5, 0.95), transparent);
  }

  .cave-border.bottom {
    background: linear-gradient(180deg, rgba(20, 10, 5, 0.95), transparent);
  }

  .cta-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: #ffcc80;
    margin-bottom: 1rem;
    text-shadow: 0 0 30px rgba(255, 140, 0, 0.4);
  }

  .cta-text {
    font-size: 1.2rem;
    color: #a08060;
    margin-bottom: 2rem;
  }

  .cta-button {
    position: relative;
    display: inline-block;
    padding: 1rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0a0505;
    background: linear-gradient(135deg, #ff8c00, #ff6600);
    border-radius: 50px;
    text-decoration: none;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .cta-button:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 40px rgba(255, 102, 0, 0.5);
  }

  .button-text {
    position: relative;
    z-index: 1;
  }

  .button-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: buttonShine 3s ease-in-out infinite;
  }

  @keyframes buttonShine {
    0% {
      left: -100%;
    }
    50%, 100% {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    .hero-logo {
      width: 150px;
      height: 150px;
    }

    .stats-row {
      gap: 1rem;
    }

    .stat-number {
      font-size: 2rem;
    }

    .stat-divider {
      display: none;
    }

    .projects-stage {
      height: 350px;
    }

    .project-image {
      height: 200px;
    }

    .carousel-btn {
      width: 45px;
      height: 45px;
      font-size: 1rem;
    }

    .section-header {
      flex-direction: column;
      gap: 1rem;
    }

    .crystal-decoration {
      display: none;
    }
  }
</style>
