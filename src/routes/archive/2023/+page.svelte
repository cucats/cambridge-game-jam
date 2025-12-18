<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let container;
  let scene, camera, renderer;
  let particles = [];
  let crystals = [];
  let projectCards = [];
  let animationFrame;
  let time = 0;

  const projects = [
    {
      title: "Inferno Rising",
      prize: "Popular Vote",
      link: "https://firedemon111.itch.io/inferno-rising",
      img: "/2023/inferno-rising.png"
    },
    {
      title: "MAYI Garden",
      prize: "Best for Theme",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      img: "/2023/mayi-garden.png"
    },
    {
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      img: "/2023/rhythm-mythril-fever.png"
    },
    {
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      img: "/2023/beaneth-the-earth.png"
    },
    {
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      img: "/2023/deck-of-dwarves.png"
    }
  ];

  onMount(() => {
    initScene();
    createCaveEnvironment();
    createCrystals();
    createParticles();
    createLights();
    animate();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (renderer) renderer.dispose();
    };
  });

  function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
  }

  function createCaveEnvironment() {
    const caveGeometry = new THREE.SphereGeometry(50, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const caveMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.BackSide
    });
    const cave = new THREE.Mesh(caveGeometry, caveMaterial);
    cave.rotation.x = Math.PI;
    scene.add(cave);

    for (let i = 0; i < 15; i++) {
      const height = 3 + Math.random() * 8;
      const stalactiteGeometry = new THREE.ConeGeometry(0.3 + Math.random() * 0.4, height, 8);
      const stalactiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d44,
        roughness: 0.8,
        metalness: 0.2
      });
      const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
      
      const angle = (i / 15) * Math.PI * 2;
      const radius = 15 + Math.random() * 15;
      stalactite.position.set(
        Math.cos(angle) * radius,
        20 - height / 2,
        Math.sin(angle) * radius
      );
      stalactite.castShadow = true;
      scene.add(stalactite);
    }

    for (let i = 0; i < 20; i++) {
      const height = 2 + Math.random() * 6;
      const stalagmiteGeometry = new THREE.ConeGeometry(0.4 + Math.random() * 0.5, height, 8);
      const stalagmiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x252538,
        roughness: 0.9,
        metalness: 0.1
      });
      const stalagmite = new THREE.Mesh(stalagmiteGeometry, stalagmiteMaterial);
      
      const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 10 + Math.random() * 25;
      stalagmite.position.set(
        Math.cos(angle) * radius,
        height / 2,
        Math.sin(angle) * radius
      );
      stalagmite.rotation.x = Math.PI;
      stalagmite.castShadow = true;
      stalagmite.receiveShadow = true;
      scene.add(stalagmite);
    }

    const floorGeometry = new THREE.CircleGeometry(50, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x16161f,
      roughness: 0.95,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  function createCrystals() {
    const crystalGeometry = new THREE.OctahedronGeometry(1, 0);
    
    for (let i = 0; i < 30; i++) {
      const scale = 0.5 + Math.random() * 1.5;
      const hue = 0.5 + Math.random() * 0.2;
      
      const crystalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(hue, 0.8, 0.4),
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.8
      });
      
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 30;
      crystal.position.set(
        Math.cos(angle) * radius,
        0.5 + Math.random() * 3,
        Math.sin(angle) * radius
      );
      
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      crystal.scale.set(scale, scale * (1 + Math.random()), scale);
      
      const light = new THREE.PointLight(
        new THREE.Color().setHSL(hue, 0.8, 0.5),
        2,
        10
      );
      light.position.copy(crystal.position);
      scene.add(light);
      
      crystals.push({ mesh: crystal, light: light, baseY: crystal.position.y, offset: Math.random() * Math.PI * 2 });
      scene.add(crystal);
    }
  }

  function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8888cc,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particles = { system: particleSystem, velocities: velocities };
    scene.add(particleSystem);
  }

  function createLights() {
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x4444ff, 1);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xff6644, 0.5);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
  }

  function animate() {
    animationFrame = requestAnimationFrame(animate);
    time += 0.01;

    crystals.forEach((crystal, i) => {
      crystal.mesh.rotation.y += 0.01;
      crystal.mesh.position.y = crystal.baseY + Math.sin(time + crystal.offset) * 0.3;
      crystal.light.intensity = 1.5 + Math.sin(time * 2 + crystal.offset) * 0.5;
    });

    if (particles.system) {
      const positions = particles.system.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += particles.velocities[i].x;
        positions[i * 3 + 1] += particles.velocities[i].y;
        positions[i * 3 + 2] += particles.velocities[i].z;

        if (positions[i * 3 + 1] > 30) positions[i * 3 + 1] = 0;
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 30;
        if (Math.abs(positions[i * 3]) > 50) positions[i * 3] *= -0.9;
        if (Math.abs(positions[i * 3 + 2]) > 50) positions[i * 3 + 2] *= -0.9;
      }
      particles.system.geometry.attributes.position.needsUpdate = true;
    }

    camera.position.x = Math.sin(time * 0.1) * 2;
    camera.position.y = 5 + Math.sin(time * 0.15) * 1;
    camera.lookAt(0, 5, 0);

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(event) {
    if (!camera) return;
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    camera.position.x += mouseX * 0.05;
    camera.position.y += mouseY * 0.05;
  }

  function onScroll() {
    if (!camera) return;
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    camera.position.z = 15 - scrollPercent * 5;
  }
</script>

<svelte:head>
  <title>Cambridge Game Jam 2023 - Beneath the Earth</title>
</svelte:head>

<div class="cave-container">
  <div class="three-canvas" bind:this={container}></div>
  
  <div class="content-overlay">
    <header class="cave-header">
      <div class="glow-text title-container">
        <h1 class="main-title">Cambridge Game Jam 2023</h1>
        <div class="theme-text">Beneath the Earth</div>
        <div class="date-text">10th - 12th February</div>
      </div>
    </header>

    <section class="projects-section">
      <h2 class="section-title">Featured Creations</h2>
      <div class="projects-grid">
        {#each projects as project, i}
          <a 
            href={project.link} 
            class="project-card"
            style="animation-delay: {i * 0.1}s"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="project-image-container">
              <img src={project.img} alt={project.title} class="project-image" />
              <div class="crystal-overlay"></div>
            </div>
            <div class="project-info">
              <h3 class="project-title">{project.title}</h3>
              <div class="project-prize">{project.prize}</div>
            </div>
            <div class="card-glow"></div>
          </a>
        {/each}
      </div>
    </section>

    <section class="all-submissions">
      <a 
        href="https://itch.io/jam/camgamejam2023" 
        class="all-submissions-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="submissions-text">View All 19 Submissions</span>
        <div class="arrow-glow">→</div>
      </a>
    </section>

    <section class="info-section">
      <div class="info-grid">
        <div class="info-card">
          <div class="info-number">48</div>
          <div class="info-label">Hours</div>
        </div>
        <div class="info-card">
          <div class="info-number">19</div>
          <div class="info-label">Submissions</div>
        </div>
        <div class="info-card">
          <div class="info-number">∞</div>
          <div class="info-label">Creativity</div>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #0a0a0f;
  }

  .cave-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: #0a0a0f;
    overflow-x: hidden;
  }

  .three-canvas {
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
    min-height: 100vh;
  }

  .cave-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
  }

  .title-container {
    animation: float 4s ease-in-out infinite;
  }

  .main-title {
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 3s ease infinite;
    text-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
    letter-spacing: -0.02em;
  }

  .theme-text {
    font-size: clamp(1.5rem, 4vw, 3rem);
    color: #8888ff;
    margin: 1rem 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-shadow: 0 0 20px rgba(136, 136, 255, 0.8),
                 0 0 40px rgba(136, 136, 255, 0.4);
    animation: pulse 2s ease-in-out infinite;
  }

  .date-text {
    font-size: clamp(1rem, 2vw, 1.5rem);
    color: #aaaaff;
    margin-top: 0.5rem;
    font-weight: 500;
    opacity: 0.9;
  }

  .projects-section {
    padding: 4rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 4rem);
    text-align: center;
    color: #9999ff;
    margin-bottom: 3rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-shadow: 0 0 30px rgba(153, 153, 255, 0.6);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 1rem;
  }

  .project-card {
    position: relative;
    background: rgba(25, 25, 45, 0.8);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                box-shadow 0.4s ease;
    cursor: pointer;
    border: 2px solid rgba(136, 136, 255, 0.3);
    text-decoration: none;
    display: block;
    animation: cardFloat 3s ease-in-out infinite;
  }

  .project-card:hover {
    transform: translateY(-15px) scale(1.05);
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4),
                0 0 100px rgba(136, 136, 255, 0.3);
    border-color: rgba(136, 136, 255, 0.8);
  }

  .project-image-container {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    overflow: hidden;
    background: #1a1a2e;
  }

  .project-image {
    position: absolute;
    top: 0;
    left: 0;
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
    background: linear-gradient(135deg, 
      rgba(102, 126, 234, 0) 0%,
      rgba(118, 75, 162, 0.1) 50%,
      rgba(240, 147, 251, 0) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .project-card:hover .crystal-overlay {
    opacity: 1;
  }

  .project-info {
    padding: 1.5rem;
    background: rgba(15, 15, 25, 0.9);
  }

  .project-title {
    font-size: 1.5rem;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
  }

  .project-prize {
    font-size: 1rem;
    color: #8888ff;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(136, 136, 255, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .project-card:hover .card-glow {
    opacity: 1;
    animation: rotate 4s linear infinite;
  }

  .all-submissions {
    padding: 4rem 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .all-submissions-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem 4rem;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    border: 3px solid rgba(136, 136, 255, 0.5);
    border-radius: 50px;
    font-size: 1.5rem;
    color: #ffffff;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  }

  .all-submissions-link:hover {
    transform: scale(1.1) translateY(-5px);
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.5);
    border-color: rgba(136, 136, 255, 1);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4));
  }

  .arrow-glow {
    font-size: 2rem;
    animation: arrowFloat 1s ease-in-out infinite;
  }

  .info-section {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }

  .info-card {
    background: rgba(25, 25, 45, 0.6);
    padding: 3rem 2rem;
    border-radius: 20px;
    text-align: center;
    border: 2px solid rgba(136, 136, 255, 0.3);
    transition: all 0.4s ease;
    animation: cardFloat 3s ease-in-out infinite;
  }

  .info-card:nth-child(2) {
    animation-delay: 0.5s;
  }

  .info-card:nth-child(3) {
    animation-delay: 1s;
  }

  .info-card:hover {
    transform: translateY(-10px);
    border-color: rgba(136, 136, 255, 0.8);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
  }

  .info-number {
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .info-label {
    font-size: 1.2rem;
    color: #8888ff;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  @keyframes cardFloat {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes arrowFloat {
    0%, 100% {
      transform: translateX(0px);
    }
    50% {
      transform: translateX(10px);
    }
  }

  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .cave-header {
      padding: 1rem;
    }

    .all-submissions-link {
      padding: 1.5rem 2rem;
      font-size: 1.2rem;
    }
  }
</style>
