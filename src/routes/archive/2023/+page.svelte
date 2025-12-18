<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvas;
  let scene, camera, renderer, composer;
  let crystals = [];
  let particles = [];
  let stalactites = [];
  let stalagmites = [];
  let mouse = { x: 0, y: 0 };
  let scrollY = 0;
  let currentProject = 0;

  const projects = [
    {
      title: "Inferno Rising",
      prize: "Popular Vote",
      src: "/2023/inferno-rising.png",
      link: "https://firedemon111.itch.io/inferno-rising",
    },
    {
      title: "MAYI Garden",
      prize: "Best for Theme",
      src: "/2023/mayi-garden.png",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
    },
    {
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      src: "/2023/rhythm-mythril-fever.png",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
    },
    {
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      src: "/2023/beaneth-the-earth.png",
      link: "https://mxbi.itch.io/beaneth-the-earth",
    },
    {
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      src: "/2023/deck-of-dwarves.png",
      link: "https://joeoc.itch.io/deck-of-dwarves",
    },
  ];

  function createStalactite(x, z, length) {
    const geometry = new THREE.ConeGeometry(0.3, length, 8);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a3f35,
      shininess: 10,
      flatShading: true,
    });
    const stalactite = new THREE.Mesh(geometry, material);
    stalactite.position.set(x, 5 - length / 2, z);
    stalactite.castShadow = true;
    return stalactite;
  }

  function createStalagmite(x, z, height) {
    const geometry = new THREE.ConeGeometry(0.4, height, 8);
    const material = new THREE.MeshPhongMaterial({
      color: 0x3a2f25,
      shininess: 10,
      flatShading: true,
    });
    const stalagmite = new THREE.Mesh(geometry, material);
    stalagmite.position.set(x, height / 2 - 3, z);
    stalagmite.castShadow = true;
    return stalagmite;
  }

  function createCrystal(x, y, z, color) {
    const geometry = new THREE.OctahedronGeometry(0.3, 0);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.set(x, y, z);
    crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    const light = new THREE.PointLight(color, 2, 5);
    light.position.set(x, y, z);
    scene.add(light);
    crystal.userData.light = light;
    
    return crystal;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.15);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4a4e69, 0.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const length = Math.random() * 3 + 1;
      const stalactite = createStalactite(x, z, length);
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const height = Math.random() * 2.5 + 1;
      const stalagmite = createStalagmite(x, z, height);
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    const crystalColors = [0x00ffff, 0xff00ff, 0x00ff88, 0xff6600, 0xffff00];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = Math.random() * 8 - 4;
      const z = (Math.random() - 0.5) * 18;
      const color = crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const crystal = createCrystal(x, y, z, color);
      crystals.push(crystal);
      scene.add(crystal);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 20 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.02 + 0.01,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x4a90e2,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles = { system: particleSystem, velocities };

    const caveGeometry = new THREE.SphereGeometry(30, 32, 32);
    const caveMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1410,
      side: THREE.BackSide,
      shininess: 5,
    });
    const cave = new THREE.Mesh(caveGeometry, caveMaterial);
    scene.add(cave);
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    crystals.forEach((crystal, i) => {
      crystal.rotation.y += 0.01;
      crystal.position.y += Math.sin(time + i) * 0.005;
      const baseIntensity = 0.5 + Math.sin(time * 2 + i) * 0.3;
      crystal.material.emissiveIntensity = baseIntensity;
      if (crystal.userData.light) {
        crystal.userData.light.intensity = 2 + Math.sin(time * 3 + i) * 1;
      }
    });

    stalactites.forEach((stalactite, i) => {
      stalactite.rotation.y = Math.sin(time + i * 0.5) * 0.05;
    });

    stalagmites.forEach((stalagmite, i) => {
      stalagmite.rotation.y = Math.sin(time + i * 0.3) * 0.03;
    });

    const positions = particles.system.geometry.attributes.position.array;
    particles.velocities.forEach((vel, i) => {
      positions[i * 3] += vel.x;
      positions[i * 3 + 1] += vel.y;
      positions[i * 3 + 2] += vel.z;

      if (positions[i * 3 + 1] > 10) {
        positions[i * 3 + 1] = -10;
      }
      if (Math.abs(positions[i * 3]) > 15) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
      }
      if (Math.abs(positions[i * 3 + 2]) > 15) {
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
    });
    particles.system.geometry.attributes.position.needsUpdate = true;

    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 2 - camera.position.y + scrollY * 0.5) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  onMount(() => {
    initThree();
    animate();

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollY = window.scrollY * 0.01;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  });

  function nextProject() {
    currentProject = (currentProject + 1) % projects.length;
  }

  function prevProject() {
    currentProject = (currentProject - 1 + projects.length) % projects.length;
  }
</script>

<svelte:head>
  <title>Cambridge Game Jam 2023 - Beneath the Earth</title>
</svelte:head>

<div class="cave-container">
  <canvas bind:this={canvas} class="cave-canvas"></canvas>
  
  <div class="content-overlay">
    <div class="hero-section">
      <div class="title-glow">
        <h1 class="main-title">Cambridge Game Jam 2023</h1>
        <div class="subtitle">Beneath the Earth</div>
        <div class="date">10th - 12th February</div>
      </div>
      
      <div class="logo-container">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="jam-logo" />
      </div>
    </div>

    <div class="scroll-indicator">
      <div class="scroll-arrow">↓</div>
      <div class="scroll-text">Explore the depths</div>
    </div>

    <div class="projects-section">
      <h2 class="section-title">Featured Projects</h2>
      
      <div class="project-carousel">
        <button class="nav-btn prev" on:click={prevProject}>
          <span>‹</span>
        </button>

        <div class="project-display">
          <a href={projects[currentProject].link} target="_blank" class="project-card">
            <div class="project-image-wrapper">
              <img 
                src={projects[currentProject].src} 
                alt={projects[currentProject].title}
                class="project-image"
              />
            </div>
            <div class="project-info">
              <h3 class="project-title">{projects[currentProject].title}</h3>
              <div class="project-prize">{projects[currentProject].prize}</div>
            </div>
          </a>
        </div>

        <button class="nav-btn next" on:click={nextProject}>
          <span>›</span>
        </button>
      </div>

      <div class="carousel-dots">
        {#each projects as project, index}
          <button 
            class="dot" 
            class:active={index === currentProject}
            on:click={() => currentProject = index}
            aria-label={`View ${project.title}`}
          ></button>
        {/each}
      </div>
    </div>

    <div class="projects-grid">
      <h2 class="section-title">All Award Winners</h2>
      <div class="grid">
        {#each projects as project}
          <a href={project.link} target="_blank" class="grid-item">
            <div class="grid-image-wrapper">
              <img src={project.src} alt={project.title} class="grid-image" />
            </div>
            <div class="grid-info">
              <div class="grid-title">{project.title}</div>
              <div class="grid-prize">{project.prize}</div>
            </div>
          </a>
        {/each}
      </div>
    </div>

    <div class="submissions-section">
      <a href="https://itch.io/jam/camgamejam2023" target="_blank" class="submissions-link">
        <div class="submissions-card">
          <img src="/2023/all-submissions.png" alt="All Submissions" class="submissions-image" />
          <div class="submissions-text">
            <h3>View All 19 Submissions</h3>
            <p>Explore every game created during the jam</p>
          </div>
        </div>
      </a>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3>The Theme</h3>
        <p>Beneath the Earth</p>
      </div>
      <div class="info-card">
        <h3>Duration</h3>
        <p>48 Hours</p>
      </div>
      <div class="info-card">
        <h3>Participants</h3>
        <p>19 Teams</p>
      </div>
    </div>

    <div class="back-section">
      <a href="/archive" class="back-link">
        ← Back to Archive
      </a>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #0a0a0a;
  }

  .cave-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: radial-gradient(ellipse at center, #1a1410 0%, #0a0a0a 100%);
  }

  .cave-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .content-overlay {
    position: relative;
    z-index: 1;
    padding: 2rem;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
  }

  .title-glow {
    text-align: center;
    animation: glow 3s ease-in-out infinite;
  }

  .main-title {
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: 900;
    color: #fff;
    text-shadow: 
      0 0 10px rgba(0, 255, 255, 0.5),
      0 0 20px rgba(0, 255, 255, 0.3),
      0 0 30px rgba(0, 255, 255, 0.2),
      0 0 40px rgba(0, 255, 255, 0.1);
    margin: 0;
    letter-spacing: 0.05em;
  }

  .subtitle {
    font-size: clamp(1.5rem, 4vw, 3rem);
    color: #ff6600;
    text-shadow: 
      0 0 10px rgba(255, 102, 0, 0.5),
      0 0 20px rgba(255, 102, 0, 0.3);
    margin-top: 1rem;
    font-weight: 700;
  }

  .date {
    font-size: clamp(1rem, 2vw, 1.5rem);
    color: #4a90e2;
    text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
    margin-top: 0.5rem;
    font-weight: 500;
  }

  .logo-container {
    animation: float 6s ease-in-out infinite;
  }

  .jam-logo {
    width: clamp(200px, 40vw, 400px);
    height: auto;
    filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.3));
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    animation: bounce 2s infinite;
  }

  .scroll-arrow {
    font-size: 2rem;
    color: #00ffff;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .scroll-text {
    color: #4a90e2;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .projects-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 4rem);
    color: #fff;
    text-align: center;
    margin-bottom: 3rem;
    text-shadow: 
      0 0 10px rgba(255, 0, 255, 0.5),
      0 0 20px rgba(255, 0, 255, 0.3);
    font-weight: 800;
  }

  .project-carousel {
    display: flex;
    align-items: center;
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
    justify-content: center;
  }

  .nav-btn {
    background: rgba(0, 255, 255, 0.1);
    border: 2px solid rgba(0, 255, 255, 0.5);
    color: #00ffff;
    font-size: 3rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .nav-btn:hover {
    background: rgba(0, 255, 255, 0.3);
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }

  .project-display {
    flex: 1;
    max-width: 800px;
  }

  .project-card {
    display: block;
    background: rgba(26, 20, 16, 0.8);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s ease;
    backdrop-filter: blur(10px);
    text-decoration: none;
  }

  .project-card:hover {
    transform: translateY(-10px);
    box-shadow: 
      0 20px 60px rgba(0, 255, 255, 0.3),
      0 0 40px rgba(255, 0, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.6);
  }

  .project-image-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    overflow: hidden;
    background: #000;
  }

  .project-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .project-card:hover .project-image {
    transform: scale(1.05);
  }

  .project-info {
    padding: 2rem;
    text-align: center;
  }

  .project-title {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    color: #fff;
    margin: 0 0 1rem 0;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    font-weight: 700;
  }

  .project-prize {
    font-size: clamp(1rem, 2vw, 1.5rem);
    color: #ff6600;
    text-shadow: 0 0 10px rgba(255, 102, 0, 0.5);
    font-weight: 600;
  }

  .carousel-dots {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }

  .dot {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(0, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
    transform: scale(1.3);
  }

  .dot:hover {
    background: rgba(0, 255, 255, 0.6);
  }

  .projects-grid {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
  }

  .grid-item {
    background: rgba(26, 20, 16, 0.7);
    border: 2px solid rgba(255, 0, 255, 0.3);
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
    display: block;
  }

  .grid-item:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 40px rgba(255, 0, 255, 0.3);
    border-color: rgba(255, 0, 255, 0.6);
  }

  .grid-image-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    overflow: hidden;
    background: #000;
  }

  .grid-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .grid-item:hover .grid-image {
    transform: scale(1.1);
  }

  .grid-info {
    padding: 1.5rem;
    text-align: center;
  }

  .grid-title {
    font-size: 1.3rem;
    color: #fff;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .grid-prize {
    font-size: 1rem;
    color: #ff6600;
    font-weight: 500;
  }

  .submissions-section {
    padding: 4rem 0;
    display: flex;
    justify-content: center;
  }

  .submissions-link {
    text-decoration: none;
    display: block;
    width: 100%;
    max-width: 800px;
  }

  .submissions-card {
    background: rgba(26, 20, 16, 0.8);
    border: 3px solid rgba(255, 255, 0, 0.4);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 2rem;
  }

  .submissions-card:hover {
    transform: scale(1.03);
    box-shadow: 0 20px 60px rgba(255, 255, 0, 0.3);
    border-color: rgba(255, 255, 0, 0.7);
  }

  .submissions-image {
    width: 100%;
    max-width: 600px;
    height: auto;
    border-radius: 10px;
  }

  .submissions-text {
    text-align: center;
  }

  .submissions-text h3 {
    font-size: 2rem;
    color: #fff;
    margin: 0 0 1rem 0;
    text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
  }

  .submissions-text p {
    font-size: 1.2rem;
    color: #4a90e2;
    margin: 0;
  }

  .info-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 4rem auto;
  }

  .info-card {
    background: rgba(26, 20, 16, 0.7);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 15px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
    border-color: rgba(0, 255, 136, 0.6);
  }

  .info-card h3 {
    font-size: 1.5rem;
    color: #00ff88;
    margin: 0 0 1rem 0;
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }

  .info-card p {
    font-size: 1.2rem;
    color: #fff;
    margin: 0;
  }

  .back-section {
    text-align: center;
    padding: 4rem 0;
  }

  .back-link {
    display: inline-block;
    padding: 1rem 2rem;
    background: rgba(0, 255, 255, 0.1);
    border: 2px solid rgba(0, 255, 255, 0.5);
    border-radius: 50px;
    color: #00ffff;
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    background: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    transform: scale(1.05);
  }

  @keyframes glow {
    0%, 100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.2);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(-10px);
    }
  }

  @media (max-width: 768px) {
    .content-overlay {
      padding: 1rem;
    }

    .project-carousel {
      flex-direction: column;
      gap: 1rem;
    }

    .nav-btn {
      width: 50px;
      height: 50px;
      font-size: 2rem;
    }

    .grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .info-section {
      grid-template-columns: 1fr;
    }

    .submissions-card {
      flex-direction: column;
    }
  }
</style>
