<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvasContainer = $state(null);
  let scrollY = $state(0);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let isLoaded = $state(false);
  let currentSlide = $state(0);
  let hoveredCard = $state(-1);

  const projects = [
    {
      src: "/2024/blight.png",
      title: "Blight",
      prize: "Most Popular & Best Gameplay",
      link: "https://hex-26.itch.io/blight",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular & Most Original",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
    },
    {
      src: "/2024/reflected.png",
      title: "Reflected",
      prize: "Theme Winner",
      link: "https://ekorrette.itch.io/reflected",
    },
    {
      src: "/2024/asymmetry.png",
      title: "Asymmetry",
      prize: "Best Gameplay",
      link: "https://alex-davies.itch.io/asymmetry",
    },
    {
      src: "/2024/coulda-woulda-buddha.png",
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
    },
  ];

  const stats = [
    { value: "23", label: "Submissions" },
    { value: "48", label: "Hours" },
    { value: "100+", label: "Participants" },
    { value: "5", label: "Categories" },
  ];

  onMount(() => {
    isLoaded = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x6366f1, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 50);
    pointLight1.position.set(-10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight2.position.set(10, -10, 10);
    scene.add(pointLight2);

    const createLowPolyGeometry = (radius, detail) => {
      return new THREE.IcosahedronGeometry(radius, detail);
    };

    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1,
      flatShading: true,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
      flatShading: true,
    });

    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      metalness: 0.7,
      roughness: 0.3,
      flatShading: true,
    });

    const mainSphere = new THREE.Mesh(createLowPolyGeometry(2.5, 1), mirrorMaterial);
    mainSphere.position.set(4, 0, -5);
    scene.add(mainSphere);

    const floatingShapes = [];
    for (let i = 0; i < 20; i++) {
      const geometries = [
        new THREE.TetrahedronGeometry(0.3 + Math.random() * 0.5, 0),
        new THREE.OctahedronGeometry(0.3 + Math.random() * 0.4, 0),
        new THREE.IcosahedronGeometry(0.2 + Math.random() * 0.3, 0),
      ];
      const materials = [mirrorMaterial, glassMaterial, crystalMaterial];
      const mesh = new THREE.Mesh(
        geometries[Math.floor(Math.random() * geometries.length)],
        materials[Math.floor(Math.random() * materials.length)]
      );
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 10
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: 0.5 + Math.random() * 1.5,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: mesh.position.y,
      };
      floatingShapes.push(mesh);
      scene.add(mesh);
    }

    const mirrorGeometry = new THREE.PlaneGeometry(15, 15, 10, 10);
    const positions = mirrorGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += (Math.random() - 0.5) * 0.3;
    }
    mirrorGeometry.computeVertexNormals();
    const mirrorPlane = new THREE.Mesh(
      mirrorGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        metalness: 0.95,
        roughness: 0.05,
        flatShading: true,
        side: THREE.DoubleSide,
      })
    );
    mirrorPlane.rotation.x = -Math.PI / 2.5;
    mirrorPlane.position.set(0, -6, -8);
    scene.add(mirrorPlane);

    const ringGeometry = new THREE.TorusGeometry(4, 0.15, 6, 12);
    const ring1 = new THREE.Mesh(ringGeometry, glassMaterial);
    ring1.position.set(-5, 2, -8);
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, crystalMaterial);
    ring2.position.set(-5, 2, -8);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);

    const ring3 = new THREE.Mesh(ringGeometry, mirrorMaterial);
    ring3.position.set(-5, 2, -8);
    ring3.rotation.y = Math.PI / 2;
    scene.add(ring3);

    camera.position.z = 8;

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      mainSphere.rotation.x += 0.003;
      mainSphere.rotation.y += 0.005;
      mainSphere.position.y = Math.sin(time) * 0.5;

      floatingShapes.forEach((shape) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        shape.position.y =
          shape.userData.originalY +
          Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.5;
      });

      ring1.rotation.x += 0.01;
      ring1.rotation.z += 0.005;
      ring2.rotation.y += 0.01;
      ring2.rotation.z += 0.008;
      ring3.rotation.x += 0.008;
      ring3.rotation.y += 0.01;

      const targetX = mouseX * 0.002;
      const targetY = -mouseY * 0.002;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, -5);

      pointLight1.position.x = Math.sin(time * 0.5) * 15;
      pointLight1.position.z = Math.cos(time * 0.5) * 15;
      pointLight2.position.x = Math.cos(time * 0.3) * 15;
      pointLight2.position.z = Math.sin(time * 0.3) * 15;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    const slideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % projects.length;
    }, 4000);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(slideInterval);
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2024 - Reflection</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-wrapper">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <section class="hero" class:loaded={isLoaded}>
    <div class="hero-content">
      <div class="logo-wrapper">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
      </div>
      <div class="title-block">
        <span class="date-badge">9th - 11th February 2024</span>
        <h1 class="main-title">
          <span class="title-line">Cambridge</span>
          <span class="title-line accent">Game Jam</span>
          <span class="title-line">2024</span>
        </h1>
        <div class="theme-reveal">
          <span class="theme-label">Theme</span>
          <h2 class="theme-title">Reflection</h2>
        </div>
      </div>
    </div>
    <div class="scroll-indicator">
      <span>Scroll to Explore</span>
      <div class="scroll-arrow"></div>
    </div>
  </section>

  <section class="stats-section">
    <div class="stats-grid">
      {#each stats as stat, i}
        <div class="stat-card" style="--delay: {i * 0.1}s">
          <span class="stat-value">{stat.value}</span>
          <span class="stat-label">{stat.label}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="featured-section">
    <div class="section-header">
      <h2 class="section-title">Featured Projects</h2>
      <p class="section-subtitle">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel
        magna eu nisi faucibus efficitur.
      </p>
    </div>

    <div class="carousel-container">
      <div class="carousel-track" style="--current: {currentSlide}">
        {#each projects as project, i}
          <a
            href={project.link}
            class="carousel-slide"
            class:active={i === currentSlide}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="slide-image-wrapper">
              <img src={project.src} alt={project.title} class="slide-image" />
              <div class="slide-overlay"></div>
            </div>
            <div class="slide-content">
              <h3 class="slide-title">{project.title}</h3>
              <span class="slide-prize">{project.prize}</span>
            </div>
          </a>
        {/each}
      </div>
      <div class="carousel-nav">
        {#each projects as _, i}
          <button
            class="nav-dot"
            class:active={i === currentSlide}
            onclick={() => (currentSlide = i)}
            aria-label="Go to slide {i + 1}"
          ></button>
        {/each}
      </div>
    </div>
  </section>

  <section class="projects-grid-section">
    <div class="section-header">
      <h2 class="section-title">All Winners</h2>
    </div>
    <div class="projects-grid">
      {#each projects as project, i}
        <a
          href={project.link}
          class="project-card"
          style="--delay: {i * 0.1}s"
          target="_blank"
          rel="noopener noreferrer"
          onmouseenter={() => (hoveredCard = i)}
          onmouseleave={() => (hoveredCard = -1)}
        >
          <div class="card-image-wrapper">
            <img src={project.src} alt={project.title} class="card-image" />
            <div class="card-shine" class:active={hoveredCard === i}></div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{project.title}</h3>
            <span class="card-prize">{project.prize}</span>
          </div>
          <div class="card-reflection"></div>
        </a>
      {/each}
    </div>
    <a
      href="https://itch.io/jam/camgamejam2024"
      class="view-all-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      View All 23 Submissions
      <svg
        class="btn-arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  </section>

  <section class="gallery-section">
    <div class="section-header">
      <h2 class="section-title">Event Gallery</h2>
    </div>
    <div class="gallery-grid">
      <div class="gallery-item large">
        <img src="/2024/group-photo.jpg" alt="Cambridge Game Jam 2024 Participants" />
        <div class="gallery-overlay">
          <span>Lorem ipsum dolor sit amet</span>
        </div>
      </div>
      <div class="gallery-item">
        <img src="/2024/all-submissions.png" alt="All Submissions" />
        <div class="gallery-overlay">
          <span>Consectetur adipiscing elit</span>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="cta-content">
      <h2 class="cta-title">Lorem Ipsum Dolor</h2>
      <p class="cta-text">
        Praesent vel magna eu nisi faucibus efficitur sed non eros. Vestibulum
        ante ipsum primis in faucibus.
      </p>
      <a href="/archive" class="cta-button">
        <span>Back to Archive</span>
        <div class="btn-glow"></div>
      </a>
    </div>
  </section>
</div>

<style>
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
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

  @keyframes rotateGlow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes glowPulse {
    0%,
    100% {
      box-shadow:
        0 0 20px rgba(139, 92, 246, 0.3),
        0 0 40px rgba(139, 92, 246, 0.2),
        0 0 60px rgba(139, 92, 246, 0.1);
    }
    50% {
      box-shadow:
        0 0 30px rgba(139, 92, 246, 0.5),
        0 0 60px rgba(139, 92, 246, 0.3),
        0 0 90px rgba(139, 92, 246, 0.2);
    }
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: "Space Grotesk", sans-serif;
    background: #0a0a0f;
    color: #ffffff;
    overflow-x: hidden;
  }

  .page-wrapper {
    position: relative;
    min-height: 100vh;
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

  .canvas-container :global(canvas) {
    display: block;
  }

  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    z-index: 1;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    opacity: 0;
    transform: translateY(40px);
  }

  .hero.loaded .hero-content {
    animation: fadeInUp 1s ease-out 0.3s forwards;
  }

  .logo-wrapper {
    position: relative;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    animation: float 6s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5));
  }

  .title-block {
    text-align: center;
  }

  .date-badge {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2));
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 50px;
    font-size: 0.9rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    animation: pulse 3s ease-in-out infinite;
  }

  .main-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 2rem;
  }

  .title-line {
    display: block;
    opacity: 0;
    animation: slideIn 0.8s ease-out forwards;
  }

  .hero.loaded .title-line:nth-child(1) {
    animation-delay: 0.5s;
  }

  .hero.loaded .title-line:nth-child(2) {
    animation-delay: 0.7s;
  }

  .hero.loaded .title-line:nth-child(3) {
    animation-delay: 0.9s;
  }

  .title-line.accent {
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #ec4899 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: slideIn 0.8s ease-out forwards, shimmer 3s linear infinite;
  }

  .theme-reveal {
    opacity: 0;
  }

  .hero.loaded .theme-reveal {
    animation: scaleIn 0.8s ease-out 1.2s forwards;
  }

  .theme-label {
    display: block;
    font-size: 0.8rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.5rem;
  }

  .theme-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 600;
    background: linear-gradient(135deg, #06b6d4, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 60px rgba(139, 92, 246, 0.5);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    opacity: 0;
    animation: fadeIn 1s ease-out 1.5s forwards;
  }

  .scroll-indicator span {
    font-size: 0.8rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .scroll-arrow {
    width: 24px;
    height: 24px;
    border-right: 2px solid rgba(255, 255, 255, 0.6);
    border-bottom: 2px solid rgba(255, 255, 255, 0.6);
    transform: rotate(45deg);
    animation: bounce 2s ease-in-out infinite;
  }

  .stats-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.9) 50%, rgba(10, 10, 15, 0.95) 100%);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .stat-card {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 20px;
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
    animation-delay: var(--delay);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-10px);
    border-color: rgba(139, 92, 246, 0.5);
    animation: glowPulse 2s ease-in-out infinite;
  }

  .stat-value {
    display: block;
    font-family: "Orbitron", sans-serif;
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    display: block;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 0.5rem;
  }

  .featured-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: rgba(10, 10, 15, 0.95);
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
    max-width: 600px;
    margin: 0 auto;
  }

  .carousel-container {
    max-width: 1000px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
  }

  .carousel-track {
    display: flex;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(calc(var(--current) * -100%));
  }

  .carousel-slide {
    min-width: 100%;
    padding: 0 1rem;
    text-decoration: none;
    color: inherit;
  }

  .slide-image-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 16/9;
  }

  .slide-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .carousel-slide:hover .slide-image {
    transform: scale(1.05);
  }

  .slide-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.8) 100%);
  }

  .slide-content {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    right: 2rem;
  }

  .slide-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .slide-prize {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .carousel-nav {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .nav-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(139, 92, 246, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .nav-dot.active {
    background: #8b5cf6;
    border-color: #8b5cf6;
    transform: scale(1.2);
  }

  .nav-dot:hover {
    border-color: #8b5cf6;
  }

  .projects-grid-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 10, 30, 0.95) 100%);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto 3rem;
  }

  .project-card {
    position: relative;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05));
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 20px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
    animation-delay: var(--delay);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .project-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow:
      0 20px 40px rgba(139, 92, 246, 0.2),
      0 0 60px rgba(139, 92, 246, 0.1);
  }

  .card-image-wrapper {
    position: relative;
    aspect-ratio: 16/10;
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

  .card-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card-shine.active {
    opacity: 1;
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-title {
    font-family: "Orbitron", sans-serif;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .card-prize {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3));
    border-radius: 50px;
    font-size: 0.8rem;
  }

  .card-reflection {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.1) 100%);
    pointer-events: none;
  }

  .view-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    border: none;
    border-radius: 50px;
    font-family: "Space Grotesk", sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    max-width: fit-content;
  }

  .view-all-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
  }

  .btn-arrow {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  .view-all-btn:hover .btn-arrow {
    transform: translateX(5px);
  }

  .gallery-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: rgba(20, 10, 30, 0.95);
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .gallery-grid {
      grid-template-columns: 1fr;
    }
  }

  .gallery-item {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 16/9;
  }

  .gallery-item.large {
    aspect-ratio: 16/10;
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .gallery-item:hover img {
    transform: scale(1.05);
  }

  .gallery-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(10, 10, 15, 0.9) 100%);
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
  }

  .gallery-overlay span {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .cta-section {
    position: relative;
    z-index: 1;
    padding: 8rem 2rem;
    background: linear-gradient(180deg, rgba(20, 10, 30, 0.95) 0%, rgba(10, 10, 15, 1) 100%);
    text-align: center;
  }

  .cta-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cta-text {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2.5rem;
    line-height: 1.8;
  }

  .cta-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 1.2rem 3rem;
    background: transparent;
    border: 2px solid #8b5cf6;
    border-radius: 50px;
    font-family: "Orbitron", sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    text-decoration: none;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s ease;
  }

  .cta-button:hover {
    background: #8b5cf6;
    transform: translateY(-3px);
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
  }

  .btn-glow {
    position: absolute;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .cta-button:hover .btn-glow {
    opacity: 1;
    animation: rotateGlow 3s linear infinite;
  }

  @media (max-width: 640px) {
    .hero {
      padding: 1rem;
    }

    .logo {
      width: 150px;
      height: 150px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-card {
      padding: 1.5rem 1rem;
    }

    .stat-value {
      font-size: 2rem;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .slide-content {
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
    }
  }
</style>
