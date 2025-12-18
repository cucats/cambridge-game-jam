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
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let container;
  let scene, camera, renderer;
  let crystals = [];
  let stalactites = [];
  let stalagmites = [];
  let particles;
  let fireflies = [];
  let glowingOrbs = [];
  let animationId;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let scrollY = 0;

  let heroVisible = $state(false);
  let projectsVisible = $state([false, false, false, false, false, false]);

  function createCrystal(size, color, position) {
    const geometry = new THREE.ConeGeometry(size * 0.3, size, 6);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      emissive: color,
      emissiveIntensity: 0.3,
    });
    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.set(position.x, position.y, position.z);
    crystal.rotation.x = Math.random() * 0.5 - 0.25;
    crystal.rotation.z = Math.random() * 0.5 - 0.25;
    return crystal;
  }

  function createStalactite(length, position) {
    const geometry = new THREE.ConeGeometry(0.15, length, 8);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a4a5a,
      shininess: 30,
    });
    const stalactite = new THREE.Mesh(geometry, material);
    stalactite.position.set(position.x, position.y, position.z);
    stalactite.rotation.x = Math.PI;
    return stalactite;
  }

  function createStalagmite(length, position) {
    const geometry = new THREE.ConeGeometry(0.2, length, 8);
    const material = new THREE.MeshPhongMaterial({
      color: 0x3a3a4a,
      shininess: 30,
    });
    const stalagmite = new THREE.Mesh(geometry, material);
    stalagmite.position.set(position.x, position.y, position.z);
    return stalagmite;
  }

  function createFirefly() {
    const geometry = new THREE.SphereGeometry(0.03, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff66,
      transparent: true,
      opacity: 0.8,
    });
    const firefly = new THREE.Mesh(geometry, material);
    firefly.userData = {
      baseX: (Math.random() - 0.5) * 20,
      baseY: (Math.random() - 0.5) * 10,
      baseZ: (Math.random() - 0.5) * 10 - 5,
      speedX: Math.random() * 0.5 + 0.2,
      speedY: Math.random() * 0.3 + 0.1,
      speedZ: Math.random() * 0.2 + 0.1,
      phase: Math.random() * Math.PI * 2,
    };
    firefly.position.set(
      firefly.userData.baseX,
      firefly.userData.baseY,
      firefly.userData.baseZ,
    );
    return firefly;
  }

  function createGlowingOrb(color, position, size) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
    });
    const orb = new THREE.Mesh(geometry, material);
    orb.position.set(position.x, position.y, position.z);

    const glowGeometry = new THREE.SphereGeometry(size * 1.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    orb.add(glow);

    orb.userData = { phase: Math.random() * Math.PI * 2, baseOpacity: 0.6 };
    return orb;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.05);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.5);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0x9933ff, 2, 20);
    purpleLight.position.set(-5, 3, 2);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3366ff, 2, 20);
    blueLight.position.set(5, -2, 3);
    scene.add(blueLight);

    const tealLight = new THREE.PointLight(0x00ffcc, 1.5, 15);
    tealLight.position.set(0, 5, -3);
    scene.add(tealLight);

    const crystalColors = [0x9933ff, 0x6633cc, 0x3366ff, 0x00ffcc, 0xff33cc];
    for (let i = 0; i < 30; i++) {
      const color = crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const size = Math.random() * 1.5 + 0.5;
      const position = {
        x: (Math.random() - 0.5) * 25,
        y: (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 10 - 5,
      };
      const crystal = createCrystal(size, color, position);
      crystal.userData = {
        rotationSpeed: Math.random() * 0.01 + 0.002,
        floatSpeed: Math.random() * 0.5 + 0.3,
        floatAmount: Math.random() * 0.3 + 0.1,
        baseY: position.y,
      };
      crystals.push(crystal);
      scene.add(crystal);
    }

    for (let i = 0; i < 40; i++) {
      const length = Math.random() * 2 + 0.5;
      const position = {
        x: (Math.random() - 0.5) * 30,
        y: 6 + Math.random() * 3,
        z: (Math.random() - 0.5) * 15 - 5,
      };
      const stalactite = createStalactite(length, position);
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 35; i++) {
      const length = Math.random() * 1.5 + 0.3;
      const position = {
        x: (Math.random() - 0.5) * 30,
        y: -6 - Math.random() * 2,
        z: (Math.random() - 0.5) * 15 - 5,
      };
      const stalagmite = createStalagmite(length, position);
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 20 - 5;

      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.3, 0.8, 0.6);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    for (let i = 0; i < 50; i++) {
      const firefly = createFirefly();
      fireflies.push(firefly);
      scene.add(firefly);
    }

    const orbColors = [0x9933ff, 0x3366ff, 0x00ffcc, 0xff6600];
    for (let i = 0; i < 8; i++) {
      const color = orbColors[Math.floor(Math.random() * orbColors.length)];
      const position = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 8 - 3,
      };
      const orb = createGlowingOrb(color, position, 0.2 + Math.random() * 0.3);
      glowingOrbs.push(orb);
      scene.add(orb);
    }

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    camera.position.x = mouseX * 0.5;
    camera.position.y = mouseY * 0.3;
    camera.lookAt(0, 0, 0);

    crystals.forEach((crystal) => {
      crystal.rotation.y += crystal.userData.rotationSpeed;
      crystal.position.y =
        crystal.userData.baseY +
        Math.sin(time * crystal.userData.floatSpeed) * crystal.userData.floatAmount;
      crystal.material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.1;
    });

    fireflies.forEach((firefly) => {
      const { baseX, baseY, baseZ, speedX, speedY, speedZ, phase } = firefly.userData;
      firefly.position.x = baseX + Math.sin(time * speedX + phase) * 1.5;
      firefly.position.y = baseY + Math.sin(time * speedY + phase) * 1;
      firefly.position.z = baseZ + Math.sin(time * speedZ + phase) * 0.5;
      firefly.material.opacity = 0.4 + Math.sin(time * 3 + phase) * 0.4;
    });

    glowingOrbs.forEach((orb) => {
      orb.material.opacity =
        orb.userData.baseOpacity + Math.sin(time * 2 + orb.userData.phase) * 0.2;
      orb.rotation.y += 0.01;
    });

    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0005;
    }

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    targetMouseX = (event.clientX / window.innerWidth - 0.5) * 4;
    targetMouseY = -(event.clientY / window.innerHeight - 0.5) * 4;
  }

  function handleScroll() {
    scrollY = window.scrollY;
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
    }, 300);

    featuredProjects.forEach((_, index) => {
      setTimeout(() => {
        projectsVisible[index] = true;
      }, 800 + index * 200);
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
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Philosopher:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="cave-page">
  <div class="three-container" bind:this={container}></div>

  <div class="content-wrapper">
    <section class="hero-section" class:visible={heroVisible}>
      <div class="crystal-frame">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023 Logo" class="logo" />
      </div>
      <h1 class="main-title">{title}</h1>
      <p class="subtitle">{duration}</p>
      <div class="theme-badge">
        <span class="theme-label">{theme}</span>
      </div>
      <a href="https://itch.io/jam/camgamejam2023" class="submissions-link">
        {submissions} Submissions
      </a>
    </section>

    <section class="projects-section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        {#each featuredProjects as project, index}
          <a
            href={project.link}
            class="project-card"
            class:visible={projectsVisible[index]}
            style="animation-delay: {index * 0.15}s"
          >
            <div class="crystal-border">
              <div class="image-wrapper">
                <img src={project.src} alt={project.alt} class="project-image" />
                <div class="image-glow"></div>
              </div>
              <div class="project-info">
                <h3 class="project-title">{project.title}</h3>
                {#if project.prize}
                  <span class="prize-badge">{project.prize}</span>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="about-section">
      <div class="cave-divider"></div>
      <p class="about-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <a href="/archive" class="back-link">
        <span class="arrow">←</span>
        Back to Archive
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
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a12 0%, #1a1a2e 50%, #0f0f1a 100%);
    position: relative;
    font-family: "Philosopher", sans-serif;
    color: #e0e0ff;
  }

  .three-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .content-wrapper {
    position: relative;
    z-index: 10;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .crystal-frame {
    position: relative;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .crystal-frame::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(153, 51, 255, 0.3) 0%,
      rgba(51, 102, 255, 0.2) 50%,
      rgba(0, 255, 204, 0.3) 100%
    );
    clip-path: polygon(
      50% 0%,
      100% 25%,
      100% 75%,
      50% 100%,
      0% 75%,
      0% 25%
    );
    animation: crystalPulse 4s ease-in-out infinite;
  }

  @keyframes crystalPulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  .logo {
    width: 250px;
    height: 250px;
    object-fit: contain;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 30px rgba(153, 51, 255, 0.5));
    animation: logoFloat 6s ease-in-out infinite;
  }

  @keyframes logoFloat {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-10px) rotate(1deg);
    }
    75% {
      transform: translateY(5px) rotate(-1deg);
    }
  }

  .main-title {
    font-family: "Cinzel", serif;
    font-size: clamp(2.5rem, 6vw, 5rem);
    font-weight: 700;
    margin: 1rem 0;
    background: linear-gradient(
      135deg,
      #9933ff 0%,
      #3366ff 40%,
      #00ffcc 70%,
      #ff33cc 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 60px rgba(153, 51, 255, 0.5);
    animation: titleGlow 3s ease-in-out infinite;
  }

  @keyframes titleGlow {
    0%, 100% {
      filter: brightness(1) drop-shadow(0 0 20px rgba(153, 51, 255, 0.3));
    }
    50% {
      filter: brightness(1.2) drop-shadow(0 0 40px rgba(153, 51, 255, 0.6));
    }
  }

  .subtitle {
    font-size: 1.5rem;
    color: #a0a0cc;
    margin: 0.5rem 0;
    letter-spacing: 0.2em;
    animation: fadeInUp 1s ease-out 0.5s both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .theme-badge {
    margin: 2rem 0;
    padding: 1rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(153, 51, 255, 0.2) 0%,
      rgba(51, 102, 255, 0.2) 100%
    );
    border: 2px solid rgba(153, 51, 255, 0.5);
    border-radius: 50px;
    position: relative;
    overflow: hidden;
    animation: fadeInUp 1s ease-out 0.7s both;
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
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    animation: shimmer 3s linear infinite;
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
    font-family: "Cinzel", serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #00ffcc;
    text-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
    position: relative;
    z-index: 1;
  }

  .submissions-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #9933ff 0%, #3366ff 100%);
    color: white;
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: 700;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: fadeInUp 1s ease-out 0.9s both;
  }

  .submissions-link:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 40px rgba(153, 51, 255, 0.4);
  }

  .submissions-link::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  .submissions-link:hover::after {
    left: 100%;
  }

  .projects-section {
    padding: 4rem 0;
  }

  .section-title {
    font-family: "Cinzel", serif;
    font-size: clamp(2rem, 4vw, 3rem);
    text-align: center;
    margin-bottom: 3rem;
    color: #00ffcc;
    text-shadow: 0 0 30px rgba(0, 255, 204, 0.4);
    position: relative;
  }

  .section-title::after {
    content: "";
    display: block;
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #00ffcc, transparent);
    margin: 1rem auto 0;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .project-card {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    color: inherit;
  }

  .project-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .crystal-border {
    background: linear-gradient(
      135deg,
      rgba(20, 20, 40, 0.9) 0%,
      rgba(30, 30, 60, 0.9) 100%
    );
    border: 2px solid rgba(153, 51, 255, 0.3);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    transition: all 0.4s ease;
  }

  .crystal-border::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(153, 51, 255, 0.1) 0%,
      transparent 50%,
      rgba(0, 255, 204, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .project-card:hover .crystal-border {
    border-color: rgba(153, 51, 255, 0.7);
    transform: translateY(-10px);
    box-shadow:
      0 20px 60px rgba(153, 51, 255, 0.3),
      0 0 80px rgba(0, 255, 204, 0.1);
  }

  .project-card:hover .crystal-border::before {
    opacity: 1;
  }

  .image-wrapper {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
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

  .image-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(10, 10, 20, 0.5) 100%
    );
    pointer-events: none;
  }

  .project-info {
    padding: 1.5rem;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .project-title {
    font-family: "Cinzel", serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    color: #e0e0ff;
    transition: color 0.3s ease;
  }

  .project-card:hover .project-title {
    color: #00ffcc;
    text-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
  }

  .prize-badge {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: linear-gradient(135deg, rgba(255, 102, 0, 0.3) 0%, rgba(255, 51, 204, 0.3) 100%);
    border: 1px solid rgba(255, 102, 0, 0.5);
    border-radius: 20px;
    font-size: 0.85rem;
    color: #ffcc99;
    letter-spacing: 0.05em;
  }

  .about-section {
    padding: 4rem 0;
    text-align: center;
  }

  .cave-divider {
    width: 100%;
    height: 100px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 100'%3E%3Cpath fill='%231a1a2e' d='M0,50 Q100,20 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50 V100 H0 Z'/%3E%3Cpath fill='%230f0f1a' d='M0,60 Q150,30 300,60 T600,60 T900,60 T1200,60 V100 H0 Z'/%3E%3C/svg%3E");
    background-size: cover;
    margin-bottom: 2rem;
    opacity: 0.5;
  }

  .about-text {
    max-width: 700px;
    margin: 0 auto 2rem;
    font-size: 1.1rem;
    line-height: 1.8;
    color: #a0a0cc;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: rgba(153, 51, 255, 0.1);
    border: 2px solid rgba(153, 51, 255, 0.3);
    border-radius: 50px;
    color: #9933ff;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    background: rgba(153, 51, 255, 0.2);
    border-color: rgba(153, 51, 255, 0.6);
    transform: translateX(-5px);
    box-shadow: 0 0 30px rgba(153, 51, 255, 0.3);
  }

  .arrow {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  .back-link:hover .arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .content-wrapper {
      padding: 1rem;
    }

    .logo {
      width: 180px;
      height: 180px;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .crystal-frame {
      padding: 1rem;
    }
  }
</style>
