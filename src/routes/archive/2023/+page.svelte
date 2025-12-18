<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let container;
  let scrollY = $state(0);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let loaded = $state(false);
  let activeProject = $state(null);

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
      color: "#ff6b35",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
      color: "#7cb342",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      color: "#9c27b0",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      color: "#00bcd4",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      color: "#ffc107",
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
      color: "#e91e63",
    },
  ];

  onMount(() => {
    loaded = true;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.015);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 30;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a12, 1);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const torchPositions = [
      { x: -15, y: 8, z: -10 },
      { x: 15, y: 6, z: -15 },
      { x: -20, y: 10, z: -25 },
      { x: 20, y: 7, z: -30 },
      { x: 0, y: 12, z: -40 },
    ];

    const torches = torchPositions.map((pos) => {
      const light = new THREE.PointLight(0xff6622, 2, 30);
      light.position.set(pos.x, pos.y, pos.z);
      scene.add(light);

      const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8844,
        transparent: true,
        opacity: 0.8,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(light.position);
      scene.add(glow);

      return { light, glow, baseIntensity: light.intensity };
    });

    const crystalColors = [0x4fc3f7, 0x7c4dff, 0x00e5ff, 0xe040fb, 0x18ffff];
    const crystals = [];

    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 4 + 1;
      const radius = Math.random() * 0.3 + 0.1;
      const geometry = new THREE.ConeGeometry(radius, height, 6);
      const color =
        crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85,
        shininess: 100,
      });
      const crystal = new THREE.Mesh(geometry, material);

      crystal.position.x = (Math.random() - 0.5) * 80;
      crystal.position.y = -15 + Math.random() * 5;
      crystal.position.z = Math.random() * -60 - 10;
      crystal.rotation.x = Math.PI;
      crystal.rotation.z = (Math.random() - 0.5) * 0.3;

      scene.add(crystal);
      crystals.push({ mesh: crystal, phase: Math.random() * Math.PI * 2 });
    }

    const stalactites = [];
    for (let i = 0; i < 50; i++) {
      const height = Math.random() * 6 + 2;
      const radius = Math.random() * 0.5 + 0.2;
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x3d3d4d,
        shininess: 20,
      });
      const stalactite = new THREE.Mesh(geometry, material);

      stalactite.position.x = (Math.random() - 0.5) * 100;
      stalactite.position.y = 20 + Math.random() * 10;
      stalactite.position.z = Math.random() * -80 - 5;
      stalactite.rotation.x = Math.PI;

      scene.add(stalactite);
      stalactites.push(stalactite);
    }

    const stalagmites = [];
    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 5 + 1;
      const radius = Math.random() * 0.6 + 0.3;
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x2d2d3d,
        shininess: 10,
      });
      const stalagmite = new THREE.Mesh(geometry, material);

      stalagmite.position.x = (Math.random() - 0.5) * 100;
      stalagmite.position.y = -18 + height / 2;
      stalagmite.position.z = Math.random() * -80 - 5;

      scene.add(stalagmite);
      stalagmites.push(stalagmite);
    }

    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = Math.random() * -80;
      particleSizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particleGeometry.setAttribute(
      "size",
      new THREE.BufferAttribute(particleSizes, 1),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const caveWallGeometry = new THREE.PlaneGeometry(150, 60, 50, 30);
    const caveWallMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      side: THREE.DoubleSide,
      shininess: 5,
    });

    const positionAttr = caveWallGeometry.attributes.position;
    for (let i = 0; i < positionAttr.count; i++) {
      const z = positionAttr.getZ(i);
      positionAttr.setZ(i, z + (Math.random() - 0.5) * 3);
    }
    positionAttr.needsUpdate = true;
    caveWallGeometry.computeVertexNormals();

    const backWall = new THREE.Mesh(caveWallGeometry, caveWallMaterial);
    backWall.position.z = -50;
    scene.add(backWall);

    const floorGeometry = new THREE.PlaneGeometry(150, 100, 50, 50);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x15151f,
      shininess: 10,
    });

    const floorPositionAttr = floorGeometry.attributes.position;
    for (let i = 0; i < floorPositionAttr.count; i++) {
      const z = floorPositionAttr.getZ(i);
      floorPositionAttr.setZ(i, z + (Math.random() - 0.5) * 1.5);
    }
    floorPositionAttr.needsUpdate = true;
    floorGeometry.computeVertexNormals();

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -18;
    scene.add(floor);

    const ceilingGeometry = new THREE.PlaneGeometry(150, 100, 50, 50);
    const ceilingMaterial = new THREE.MeshPhongMaterial({
      color: 0x12121a,
      side: THREE.DoubleSide,
      shininess: 5,
    });

    const ceilingPositionAttr = ceilingGeometry.attributes.position;
    for (let i = 0; i < ceilingPositionAttr.count; i++) {
      const z = ceilingPositionAttr.getZ(i);
      ceilingPositionAttr.setZ(i, z + (Math.random() - 0.5) * 2);
    }
    ceilingPositionAttr.needsUpdate = true;
    ceilingGeometry.computeVertexNormals();

    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 25;
    scene.add(ceiling);

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      camera.position.x = mouseX * 0.02;
      camera.position.y = 5 - mouseY * 0.01 - scrollY * 0.005;
      camera.position.z = 30 - scrollY * 0.02;
      camera.lookAt(0, 0, -20);

      torches.forEach((torch, i) => {
        const flicker = Math.sin(time * 10 + i) * 0.3 + Math.random() * 0.2;
        torch.light.intensity = torch.baseIntensity + flicker;
        torch.glow.scale.setScalar(1 + flicker * 0.3);
      });

      crystals.forEach((crystal) => {
        crystal.mesh.material.emissiveIntensity =
          0.3 + Math.sin(time * 2 + crystal.phase) * 0.2;
      });

      const particlePositions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3 + 1] += 0.01;
        if (particlePositions[i * 3 + 1] > 20) {
          particlePositions[i * 3 + 1] = -20;
        }
        particlePositions[i * 3] +=
          Math.sin(time + i * 0.1) * 0.005;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cave-page">
  <div bind:this={container} class="three-container"></div>

  <div class="content-wrapper" class:loaded>
    <section class="hero-section">
      <div class="hero-content">
        <div class="logo-container">
          <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="logo" />
          <div class="logo-glow"></div>
        </div>
        <h1 class="main-title">{title}</h1>
        <p class="event-date">{duration}</p>
        <div class="theme-badge">
          <span class="theme-label">{theme}</span>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="stat-number">{submissions}</span>
            <span class="stat-label">Lorem Ipsum</span>
          </div>
        </div>
        <div class="scroll-indicator">
          <div class="scroll-arrow"></div>
        </div>
      </div>
    </section>

    <section class="projects-section">
      <h2 class="section-title">Lorem Ipsum Dolor</h2>
      <div class="projects-grid">
        {#each projects as project, i}
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            class="project-card"
            style="--accent-color: {project.color}; --delay: {i * 0.1}s"
            onmouseenter={() => (activeProject = i)}
            onmouseleave={() => (activeProject = null)}
          >
            <div class="card-inner">
              <div class="card-glow"></div>
              <div class="card-image">
                <img src={project.src} alt={project.alt} />
                <div class="image-overlay"></div>
              </div>
              <div class="card-content">
                <h3 class="project-title">{project.title}</h3>
                {#if project.prize}
                  <span class="project-prize">{project.prize}</span>
                {/if}
              </div>
              <div class="crystal-decoration left"></div>
              <div class="crystal-decoration right"></div>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="back-section">
      <a href="/archive" class="back-button">
        <span class="back-icon">←</span>
        <span>Lorem Ipsum</span>
      </a>
    </section>
  </div>
</div>

<style>
  :global(body) {
    overflow-x: hidden;
    background: #0a0a12;
  }

  .cave-page {
    min-height: 100vh;
    position: relative;
    color: #e0e0e0;
  }

  .three-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .content-wrapper {
    position: relative;
    z-index: 10;
    opacity: 0;
    transition: opacity 1s ease-out;
  }

  .content-wrapper.loaded {
    opacity: 1;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }

  .hero-content {
    max-width: 800px;
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
    animation: float 6s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(100, 200, 255, 0.5));
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

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(
      circle,
      rgba(100, 200, 255, 0.3) 0%,
      transparent 70%
    );
    animation: pulse 4s ease-in-out infinite;
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

  .main-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    background: linear-gradient(135deg, #64b5f6, #e1bee7, #81d4fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    text-shadow: 0 0 60px rgba(100, 181, 246, 0.5);
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.2);
    }
  }

  .event-date {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: #b0bec5;
    margin-bottom: 2rem;
    letter-spacing: 0.1em;
  }

  .theme-badge {
    display: inline-block;
    padding: 1rem 2.5rem;
    background: linear-gradient(
      135deg,
      rgba(100, 181, 246, 0.2),
      rgba(225, 190, 231, 0.2)
    );
    border: 2px solid rgba(100, 181, 246, 0.4);
    border-radius: 50px;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from {
      box-shadow:
        0 0 20px rgba(100, 181, 246, 0.3),
        inset 0 0 20px rgba(100, 181, 246, 0.1);
    }
    to {
      box-shadow:
        0 0 40px rgba(100, 181, 246, 0.5),
        inset 0 0 30px rgba(100, 181, 246, 0.2);
    }
  }

  .theme-label {
    font-size: clamp(1rem, 2.5vw, 1.4rem);
    font-weight: 600;
    color: #81d4fa;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 800;
    color: #64b5f6;
    text-shadow: 0 0 20px rgba(100, 181, 246, 0.5);
  }

  .stat-label {
    font-size: 0.9rem;
    color: #78909c;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .scroll-indicator {
    margin-top: 2rem;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .scroll-arrow {
    width: 30px;
    height: 30px;
    border-right: 3px solid #64b5f6;
    border-bottom: 3px solid #64b5f6;
    transform: rotate(45deg);
    margin: 0 auto;
    opacity: 0.7;
  }

  .projects-section {
    padding: 6rem 2rem;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(10, 10, 18, 0.9) 10%,
      rgba(10, 10, 18, 0.95)
    );
  }

  .section-title {
    text-align: center;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: #b0bec5;
    margin-bottom: 4rem;
    position: relative;
  }

  .section-title::after {
    content: "";
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #64b5f6, transparent);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .project-card {
    text-decoration: none;
    color: inherit;
    display: block;
    animation: cardFadeIn 0.8s ease-out backwards;
    animation-delay: var(--delay);
  }

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .card-inner {
    position: relative;
    background: linear-gradient(
      145deg,
      rgba(30, 30, 50, 0.9),
      rgba(20, 20, 35, 0.95)
    );
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(100, 181, 246, 0.2);
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .project-card:hover .card-inner {
    transform: translateY(-10px) scale(1.02);
    border-color: var(--accent-color);
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.5),
      0 0 40px color-mix(in srgb, var(--accent-color) 30%, transparent);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    background: radial-gradient(
      circle at center,
      color-mix(in srgb, var(--accent-color) 20%, transparent),
      transparent 70%
    );
    transition: opacity 0.5s ease;
    pointer-events: none;
  }

  .project-card:hover .card-glow {
    opacity: 1;
  }

  .card-image {
    position: relative;
    height: 220px;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
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
      to bottom,
      transparent 40%,
      rgba(10, 10, 18, 0.95)
    );
  }

  .card-content {
    padding: 1.5rem;
    position: relative;
    z-index: 2;
  }

  .project-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #fff;
    transition: color 0.3s ease;
  }

  .project-card:hover .project-title {
    color: var(--accent-color);
  }

  .project-prize {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 30%, transparent),
      color-mix(in srgb, var(--accent-color) 15%, transparent)
    );
    border: 1px solid color-mix(in srgb, var(--accent-color) 50%, transparent);
    border-radius: 20px;
    font-size: 0.85rem;
    color: var(--accent-color);
    font-weight: 600;
  }

  .crystal-decoration {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    opacity: 0.3;
    transition: opacity 0.3s ease;
  }

  .crystal-decoration.left {
    left: 10px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 30px solid var(--accent-color);
    transform: rotate(-15deg);
  }

  .crystal-decoration.right {
    right: 15px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 25px solid var(--accent-color);
    transform: rotate(10deg);
  }

  .project-card:hover .crystal-decoration {
    opacity: 0.6;
  }

  .back-section {
    padding: 4rem 2rem 6rem;
    text-align: center;
    background: rgba(10, 10, 18, 0.95);
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(
      135deg,
      rgba(100, 181, 246, 0.2),
      rgba(100, 181, 246, 0.1)
    );
    border: 2px solid rgba(100, 181, 246, 0.4);
    border-radius: 50px;
    color: #81d4fa;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    backdrop-filter: blur(10px);
  }

  .back-button:hover {
    background: linear-gradient(
      135deg,
      rgba(100, 181, 246, 0.4),
      rgba(100, 181, 246, 0.2)
    );
    border-color: #64b5f6;
    transform: translateX(-5px);
    box-shadow:
      0 10px 30px rgba(100, 181, 246, 0.3),
      0 0 40px rgba(100, 181, 246, 0.2);
  }

  .back-icon {
    font-size: 1.4rem;
    transition: transform 0.3s ease;
  }

  .back-button:hover .back-icon {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .hero-content {
      padding: 0 1rem;
    }

    .logo {
      width: 150px;
      height: 150px;
    }

    .logo-glow {
      width: 180px;
      height: 180px;
    }

    .theme-badge {
      padding: 0.8rem 1.5rem;
    }

    .stats {
      gap: 2rem;
    }

    .stat-number {
      font-size: 2.5rem;
    }
  }
</style>
