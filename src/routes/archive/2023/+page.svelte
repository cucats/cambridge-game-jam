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

  let canvasContainer = $state(null);
  let scene, camera, renderer, crystals, stalactites, stalagmites, particles;
  let animationId;
  let scrollY = $state(0);
  let heroVisible = $state(false);
  let projectsVisible = $state([]);
  let mouseX = $state(0);
  let mouseY = $state(0);

  function createCaveScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    camera.position.y = 0;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.3);
    scene.add(ambientLight);

    const crystalLight1 = new THREE.PointLight(0x00ffff, 2, 50);
    crystalLight1.position.set(-15, 5, 10);
    scene.add(crystalLight1);

    const crystalLight2 = new THREE.PointLight(0xff00ff, 2, 50);
    crystalLight2.position.set(15, -5, 10);
    scene.add(crystalLight2);

    const crystalLight3 = new THREE.PointLight(0x7b68ee, 2, 50);
    crystalLight3.position.set(0, 10, 15);
    scene.add(crystalLight3);

    crystals = [];
    const crystalGeometry = new THREE.ConeGeometry(0.3, 2, 6);

    for (let i = 0; i < 40; i++) {
      const hue = Math.random() * 0.3 + 0.5;
      const crystalMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.5),
        emissive: new THREE.Color().setHSL(hue, 0.8, 0.2),
        transparent: true,
        opacity: 0.8,
        shininess: 100,
      });

      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30 - 10
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.scale.setScalar(Math.random() * 1.5 + 0.5);
      crystal.userData = {
        originalY: crystal.position.y,
        speed: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      };
      crystals.push(crystal);
      scene.add(crystal);
    }

    stalactites = [];
    const stalactiteGeometry = new THREE.ConeGeometry(0.8, 4, 8);
    const stalactiteMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d2d3d,
      emissive: 0x0a0a1a,
    });

    for (let i = 0; i < 25; i++) {
      const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
      stalactite.position.set(
        (Math.random() - 0.5) * 80,
        20 + Math.random() * 10,
        (Math.random() - 0.5) * 40 - 20
      );
      stalactite.rotation.x = Math.PI;
      stalactite.scale.setScalar(Math.random() * 2 + 1);
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    stalagmites = [];
    const stalagmiteGeometry = new THREE.ConeGeometry(1, 5, 8);
    const stalagmiteMaterial = new THREE.MeshPhongMaterial({
      color: 0x3d3d4d,
      emissive: 0x1a1a2a,
    });

    for (let i = 0; i < 25; i++) {
      const stalagmite = new THREE.Mesh(stalagmiteGeometry, stalagmiteMaterial);
      stalagmite.position.set(
        (Math.random() - 0.5) * 80,
        -20 - Math.random() * 10,
        (Math.random() - 0.5) * 40 - 20
      );
      stalagmite.scale.setScalar(Math.random() * 2 + 1);
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 1;
      }
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    crystals.forEach((crystal) => {
      crystal.position.y =
        crystal.userData.originalY +
        Math.sin(time * crystal.userData.speed + crystal.userData.phase) * 0.5;
      crystal.rotation.y += crystal.userData.rotSpeed;
      crystal.material.emissiveIntensity =
        0.3 + Math.sin(time * 2 + crystal.userData.phase) * 0.2;
    });

    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + positions[i]) * 0.005;
      positions[i] += Math.cos(time * 0.5 + positions[i + 1]) * 0.003;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y = time * 0.02;

    const targetX = mouseX * 0.0003;
    const targetY = mouseY * 0.0003;
    camera.rotation.y += (targetX - camera.rotation.y) * 0.05;
    camera.rotation.x += (-targetY - camera.rotation.x) * 0.05;

    camera.position.y = -scrollY * 0.01;
    camera.position.z = 30 - scrollY * 0.005;

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  function handleMouseMove(e) {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
  }

  onMount(() => {
    createCaveScene();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    setTimeout(() => {
      heroVisible = true;
    }, 300);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setTimeout(() => {
              projectsVisible = [...projectsVisible, index];
            }, index * 150);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".project-card").forEach((card) => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
      if (canvasContainer && renderer.domElement) {
        canvasContainer.removeChild(renderer.domElement);
      }
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cave-wrapper">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <div class="content-overlay">
    <section class="hero" class:visible={heroVisible}>
      <div class="crystal-border"></div>
      <div class="hero-content">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="logo" />
        <h1 class="title">{title}</h1>
        <p class="date">{duration}</p>
        <div class="theme-badge">
          <span class="theme-icon">⛏</span>
          <span class="theme-text">{theme}</span>
        </div>
        <a
          href="https://itch.io/jam/camgamejam2023"
          class="submissions-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {submissions} Submissions
        </a>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <section class="projects-section">
      <h2 class="section-title">
        <span class="crystal-icon">💎</span>
        Featured Projects
        <span class="crystal-icon">💎</span>
      </h2>

      <div class="projects-grid">
        {#each featuredProjects as project, index}
          <a
            href={project.link}
            class="project-card"
            class:visible={projectsVisible.includes(index)}
            data-index={index}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="card-glow"></div>
            <div class="card-content">
              <img src={project.src} alt={project.alt} class="project-image" />
              <div class="project-info">
                <h3 class="project-title">{project.title}</h3>
                {#if project.prize}
                  <span class="prize-badge">{project.prize}</span>
                {/if}
              </div>
            </div>
            <div class="stalactite-decoration"></div>
          </a>
        {/each}
      </div>
    </section>

    <section class="back-section">
      <a href="/archive" class="back-button">
        <span class="back-arrow">←</span>
        Lorem Ipsum Archive
      </a>
    </section>
  </div>
</div>

<style>
  .cave-wrapper {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 30%, #0f0f1a 100%);
    overflow-x: hidden;
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
    z-index: 10;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .hero.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .crystal-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      transparent,
      #00ffff,
      #ff00ff,
      #7b68ee,
      transparent
    );
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  .hero-content {
    text-align: center;
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .logo {
    width: 200px;
    height: 200px;
    margin-bottom: 2rem;
    filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.5))
      drop-shadow(0 0 60px rgba(255, 0, 255, 0.3));
    animation: pulse-glow 4s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.5))
        drop-shadow(0 0 60px rgba(255, 0, 255, 0.3));
    }
    50% {
      filter: drop-shadow(0 0 50px rgba(0, 255, 255, 0.8))
        drop-shadow(0 0 80px rgba(255, 0, 255, 0.5));
    }
  }

  .title {
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 800;
    background: linear-gradient(135deg, #00ffff, #ff00ff, #7b68ee);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    margin-bottom: 1rem;
    letter-spacing: 2px;
  }

  .date {
    font-size: 1.5rem;
    color: #8888aa;
    margin-bottom: 2rem;
    font-weight: 300;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 255, 0.1),
      rgba(255, 0, 255, 0.1)
    );
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 50px;
    padding: 1rem 2rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    animation: border-glow 3s ease-in-out infinite;
  }

  @keyframes border-glow {
    0%,
    100% {
      border-color: rgba(0, 255, 255, 0.3);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
    }
    50% {
      border-color: rgba(255, 0, 255, 0.5);
      box-shadow: 0 0 40px rgba(255, 0, 255, 0.2);
    }
  }

  .theme-icon {
    font-size: 1.5rem;
    animation: swing 2s ease-in-out infinite;
  }

  @keyframes swing {
    0%,
    100% {
      transform: rotate(-10deg);
    }
    50% {
      transform: rotate(10deg);
    }
  }

  .theme-text {
    font-size: 1.3rem;
    color: #ffffff;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 3px;
  }

  .submissions-link {
    display: inline-block;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #00ffff, #7b68ee);
    color: #0a0a0f;
    font-weight: 700;
    font-size: 1.1rem;
    border-radius: 50px;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
    overflow: hidden;
  }

  .submissions-link::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left 0.5s;
  }

  .submissions-link:hover::before {
    left: 100%;
  }

  .submissions-link:hover {
    transform: scale(1.1) translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 255, 255, 0.4);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    animation: bounce 2s infinite;
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

  .scroll-arrow {
    width: 30px;
    height: 30px;
    border-right: 3px solid #00ffff;
    border-bottom: 3px solid #ff00ff;
    transform: rotate(45deg);
    opacity: 0.7;
  }

  .projects-section {
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(26, 26, 46, 0.9),
      rgba(15, 15, 26, 0.95)
    );
  }

  .section-title {
    text-align: center;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    color: #ffffff;
    margin-bottom: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .crystal-icon {
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 0.7;
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
    background: linear-gradient(
      145deg,
      rgba(30, 30, 50, 0.9),
      rgba(20, 20, 35, 0.95)
    );
    border-radius: 20px;
    overflow: hidden;
    text-decoration: none;
    opacity: 0;
    transform: translateY(80px) scale(0.9);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid rgba(123, 104, 238, 0.2);
  }

  .project-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .project-card:hover {
    transform: translateY(-15px) scale(1.03);
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 30px 60px rgba(0, 255, 255, 0.2),
      0 0 100px rgba(255, 0, 255, 0.1);
  }

  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(0, 255, 255, 0.1) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }

  .project-card:hover .card-glow {
    opacity: 1;
    animation: rotate-glow 10s linear infinite;
  }

  @keyframes rotate-glow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .project-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: all 0.5s;
    filter: saturate(0.8);
  }

  .project-card:hover .project-image {
    filter: saturate(1.2);
    transform: scale(1.05);
  }

  .project-info {
    padding: 1.5rem;
    text-align: center;
  }

  .project-title {
    font-size: 1.3rem;
    color: #ffffff;
    margin-bottom: 0.5rem;
    transition: color 0.3s;
  }

  .project-card:hover .project-title {
    color: #00ffff;
  }

  .prize-badge {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: linear-gradient(135deg, #ff00ff, #7b68ee);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .stalactite-decoration {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 30px solid rgba(0, 255, 255, 0.3);
    opacity: 0;
    transition: all 0.5s;
  }

  .project-card:hover .stalactite-decoration {
    opacity: 1;
    border-top-color: rgba(0, 255, 255, 0.6);
  }

  .back-section {
    padding: 4rem 2rem 6rem;
    text-align: center;
    background: linear-gradient(180deg, transparent, rgba(10, 10, 15, 0.95));
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 2rem;
    background: transparent;
    border: 2px solid rgba(123, 104, 238, 0.5);
    color: #7b68ee;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    text-decoration: none;
    transition: all 0.4s;
  }

  .back-button:hover {
    background: rgba(123, 104, 238, 0.1);
    border-color: #00ffff;
    color: #00ffff;
    transform: translateX(-10px);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
  }

  .back-arrow {
    font-size: 1.5rem;
    transition: transform 0.3s;
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
      padding: 0.8rem 1.5rem;
    }

    .projects-grid {
      grid-template-columns: 1fr;
      padding: 0 1rem;
    }
  }
</style>
