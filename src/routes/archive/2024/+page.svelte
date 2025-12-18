<script>
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const games = [
    {
      src: "/2024/blight.png",
      alt: "Blight",
      link: "https://hex-26.itch.io/blight",
      title: "Blight",
      prize: "Most Popular & Best Gameplay",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      alt: "Reflect Upon Your Actions",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular & Most Original",
    },
    {
      src: "/2024/reflected.png",
      alt: "Reflected",
      link: "https://ekorrette.itch.io/reflected",
      title: "Reflected",
      prize: "Theme Winner",
    },
    {
      src: "/2024/asymmetry.png",
      alt: "Asymmetry",
      link: "https://alex-davies.itch.io/asymmetry",
      title: "Asymmetry",
      prize: "Best Gameplay",
    },
    {
      src: "/2024/coulda-woulda-buddha.png",
      alt: "Coulda Woulda Buddha",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
    },
  ];

  let canvas;
  let scene, camera, renderer;
  let geometries = [];
  let mirrorPlane;
  let animationId;
  let scrollY = 0;
  let mouseX = 0;
  let mouseY = 0;

  let heroVisible = $state(false);
  let statsVisible = $state(false);
  let gamesVisible = $state([false, false, false, false, false]);
  let aboutVisible = $state(false);

  function createLowPolyGeometry() {
    const group = new THREE.Group();

    const colors = [0x6366f1, 0x8b5cf6, 0xa855f7, 0xd946ef, 0xec4899, 0x3b82f6];

    for (let i = 0; i < 40; i++) {
      const geometryType = Math.floor(Math.random() * 4);
      let geometry;

      switch (geometryType) {
        case 0:
          geometry = new THREE.IcosahedronGeometry(
            Math.random() * 1.5 + 0.5,
            0
          );
          break;
        case 1:
          geometry = new THREE.OctahedronGeometry(Math.random() * 1.5 + 0.5, 0);
          break;
        case 2:
          geometry = new THREE.TetrahedronGeometry(
            Math.random() * 1.5 + 0.5,
            0
          );
          break;
        default:
          geometry = new THREE.DodecahedronGeometry(
            Math.random() * 1.2 + 0.4,
            0
          );
      }

      const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        flatShading: true,
        transparent: true,
        opacity: 0.85,
        shininess: 100,
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
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
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: mesh.position.y,
      };

      geometries.push(mesh);
      group.add(mesh);
    }

    const mirrorGeometry = new THREE.PlaneGeometry(80, 50, 1, 1);
    const mirrorMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      shininess: 200,
      reflectivity: 1,
      side: THREE.DoubleSide,
    });
    mirrorPlane = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane.rotation.x = Math.PI / 2;
    mirrorPlane.position.y = -8;
    group.add(mirrorPlane);

    for (let i = 0; i < 40; i++) {
      const original = geometries[i];
      const reflectionMaterial = new THREE.MeshPhongMaterial({
        color: original.material.color,
        flatShading: true,
        transparent: true,
        opacity: 0.3,
        shininess: 50,
      });
      const reflection = new THREE.Mesh(original.geometry, reflectionMaterial);
      reflection.userData.isReflection = true;
      reflection.userData.original = original;
      group.add(reflection);
    }

    return group;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 15, 60);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    camera.position.y = 5;

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50);
    pointLight1.position.set(-15, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 2, 50);
    pointLight2.position.set(15, -5, 15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x8b5cf6, 1.5, 40);
    pointLight3.position.set(0, 15, -10);
    scene.add(pointLight3);

    const lowPolyGroup = createLowPolyGeometry();
    scene.add(lowPolyGroup);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    geometries.forEach((mesh, i) => {
      mesh.rotation.x += mesh.userData.rotationSpeed.x;
      mesh.rotation.y += mesh.userData.rotationSpeed.y;
      mesh.rotation.z += mesh.userData.rotationSpeed.z;

      mesh.position.y =
        mesh.userData.originalY +
        Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) *
          0.5;
    });

    scene.children.forEach((child) => {
      if (child.type === "Group") {
        child.children.forEach((obj) => {
          if (obj.userData.isReflection && obj.userData.original) {
            const original = obj.userData.original;
            obj.position.x = original.position.x;
            obj.position.y = -original.position.y - 16;
            obj.position.z = original.position.z;
            obj.rotation.x = -original.rotation.x;
            obj.rotation.y = original.rotation.y;
            obj.rotation.z = original.rotation.z;
            obj.scale.y = -1;
          }
        });
      }
    });

    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.position.y += (5 - mouseY * 0.03 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    const scrollOffset = scrollY * 0.01;
    scene.rotation.y = scrollOffset * 0.1;

    if (mirrorPlane) {
      mirrorPlane.material.opacity = 0.15 + Math.sin(time) * 0.05;
    }

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
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  function setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          if (target.dataset.animate === "hero") heroVisible = true;
          if (target.dataset.animate === "stats") statsVisible = true;
          if (target.dataset.animate === "about") aboutVisible = true;
          if (target.dataset.animate?.startsWith("game-")) {
            const index = parseInt(target.dataset.animate.split("-")[1]);
            gamesVisible[index] = true;
            gamesVisible = [...gamesVisible];
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });
  }

  onMount(() => {
    initThree();
    animate();
    setupIntersectionObserver();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    setTimeout(() => {
      heroVisible = true;
    }, 100);
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    }
    if (renderer) renderer.dispose();
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-container">
  <canvas bind:this={canvas} class="three-canvas"></canvas>

  <section class="hero" data-animate="hero">
    <div class="hero-content" class:visible={heroVisible}>
      <div class="logo-container">
        <img src="/2024/logo.png" alt={title} class="logo" />
        <div class="logo-reflection"></div>
      </div>
      <h1 class="title">{title}</h1>
      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-name">{theme}</span>
      </div>
      <p class="date">{duration}</p>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
        <div class="scroll-arrow delay"></div>
      </div>
    </div>
  </section>

  <section class="stats-section" data-animate="stats">
    <div class="stats-container" class:visible={statsVisible}>
      <div class="stat-card">
        <span class="stat-number">{submissions}</span>
        <span class="stat-label">Submissions</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">48</span>
        <span class="stat-label">Hours</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">5</span>
        <span class="stat-label">Winners</span>
      </div>
    </div>
  </section>

  <section class="games-section">
    <h2 class="section-title">Featured Games</h2>
    <div class="games-grid">
      {#each games as game, i}
        <a
          href={game.link}
          class="game-card"
          data-animate="game-{i}"
          class:visible={gamesVisible[i]}
          style="animation-delay: {i * 150}ms"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="game-image-container">
            <img src={game.src} alt={game.alt} class="game-image" />
            <div class="game-reflection">
              <img src={game.src} alt="" class="reflection-img" />
            </div>
          </div>
          <div class="game-info">
            <h3 class="game-title">{game.title}</h3>
            <span class="game-prize">{game.prize}</span>
          </div>
          <div class="game-glow"></div>
        </a>
      {/each}
    </div>
    <a
      href="https://itch.io/jam/camgamejam2024"
      class="all-submissions-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      View All {submissions} Submissions
    </a>
  </section>

  <section class="about-section" data-animate="about">
    <div class="about-content" class:visible={aboutVisible}>
      <h2 class="section-title">About The Jam</h2>
      <p class="about-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </p>
      <p class="about-text">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <div class="group-photo-container">
        <img src="/2024/group-photo.jpg" alt="Cambridge Game Jam 2024 participants" class="group-photo" />
        <div class="photo-frame"></div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="cta-content">
      <a href="/archive" class="back-link">
        <span class="back-arrow">←</span>
        Back to Archive
      </a>
    </div>
  </section>
</div>

<style>
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(2deg);
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
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(60px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
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
        0 0 20px rgba(99, 102, 241, 0.5),
        0 0 40px rgba(139, 92, 246, 0.3);
    }
    50% {
      box-shadow:
        0 0 40px rgba(99, 102, 241, 0.8),
        0 0 80px rgba(139, 92, 246, 0.5);
    }
  }

  @keyframes scrollBounce {
    0%,
    100% {
      transform: translateY(0);
      opacity: 1;
    }
    50% {
      transform: translateY(10px);
      opacity: 0.5;
    }
  }

  @keyframes borderGlow {
    0%,
    100% {
      border-color: rgba(99, 102, 241, 0.5);
    }
    50% {
      border-color: rgba(236, 72, 153, 0.8);
    }
  }

  @keyframes rotateGlow {
    0% {
      filter: hue-rotate(0deg);
    }
    100% {
      filter: hue-rotate(360deg);
    }
  }

  .page-container {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
    font-family: "Rajdhani", sans-serif;
    overflow-x: hidden;
  }

  .three-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .hero-content {
    text-align: center;
    color: white;
    opacity: 0;
    transform: translateY(40px);
    transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-content.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .logo-container {
    position: relative;
    margin-bottom: 2rem;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    animation: float 6s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(99, 102, 241, 0.5));
  }

  .logo-reflection {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%) scaleY(-0.3);
    width: 200px;
    height: 100px;
    background: linear-gradient(
      to bottom,
      rgba(99, 102, 241, 0.2),
      transparent
    );
    filter: blur(10px);
    opacity: 0.5;
  }

  .title {
    font-family: "Orbitron", monospace;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 900;
    margin-bottom: 1.5rem;
    background: linear-gradient(
      135deg,
      #6366f1 0%,
      #8b5cf6 25%,
      #ec4899 50%,
      #8b5cf6 75%,
      #6366f1 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
    text-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
  }

  .theme-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 2.5rem;
    background: rgba(99, 102, 241, 0.1);
    border: 2px solid rgba(99, 102, 241, 0.5);
    border-radius: 50px;
    margin-bottom: 1.5rem;
    animation: glowPulse 3s ease-in-out infinite;
  }

  .theme-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.25rem;
  }

  .theme-name {
    font-family: "Orbitron", monospace;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(90deg, #6366f1, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .date {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 2px;
    margin-bottom: 3rem;
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 3px solid rgba(99, 102, 241, 0.8);
    border-bottom: 3px solid rgba(99, 102, 241, 0.8);
    transform: rotate(45deg);
    animation: scrollBounce 1.5s ease-in-out infinite;
  }

  .scroll-arrow.delay {
    animation-delay: 0.2s;
    opacity: 0.5;
  }

  .stats-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
  }

  .stats-container {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
    max-width: 900px;
    margin: 0 auto;
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .stats-container.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 3rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    transition: all 0.4s ease;
  }

  .stat-card:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: rgba(236, 72, 153, 0.8);
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
  }

  .stat-number {
    font-family: "Orbitron", monospace;
    font-size: 3.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #6366f1, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
  }

  .stat-label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 0.5rem;
  }

  .games-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
  }

  .section-title {
    font-family: "Orbitron", monospace;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    text-align: center;
    margin-bottom: 4rem;
    color: white;
    text-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .game-card {
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 20px;
    overflow: hidden;
    text-decoration: none;
    color: white;
    opacity: 0;
    transform: translateY(40px) scale(0.9);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .game-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .game-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(236, 72, 153, 0.8);
  }

  .game-card:hover .game-glow {
    opacity: 1;
  }

  .game-card:hover .game-image {
    transform: scale(1.1);
  }

  .game-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #6366f1, #ec4899, #8b5cf6);
    border-radius: 22px;
    opacity: 0;
    z-index: -1;
    filter: blur(15px);
    transition: opacity 0.4s ease;
    animation: rotateGlow 3s linear infinite;
  }

  .game-image-container {
    position: relative;
    overflow: hidden;
    height: 200px;
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .game-reflection {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    overflow: hidden;
    opacity: 0.3;
  }

  .reflection-img {
    width: 100%;
    transform: scaleY(-1) translateY(-140px);
    filter: blur(3px);
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  }

  .game-info {
    padding: 1.5rem;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 26, 0.9) 0%,
      rgba(26, 26, 46, 0.95) 100%
    );
  }

  .game-title {
    font-family: "Orbitron", monospace;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #ffffff, #e0e0ff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .game-prize {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3));
    border-radius: 20px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(99, 102, 241, 0.4);
  }

  .all-submissions-btn {
    display: block;
    width: fit-content;
    margin: 4rem auto 0;
    padding: 1rem 3rem;
    font-family: "Orbitron", monospace;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    text-decoration: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.4s ease;
    animation: glowPulse 3s ease-in-out infinite;
  }

  .all-submissions-btn:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow:
      0 20px 40px rgba(99, 102, 241, 0.4),
      0 0 60px rgba(139, 92, 246, 0.3);
  }

  .about-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
  }

  .about-content {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .about-content.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .about-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.5rem;
  }

  .group-photo-container {
    position: relative;
    margin-top: 3rem;
    display: inline-block;
  }

  .group-photo {
    width: 100%;
    max-width: 700px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: borderGlow 4s ease-in-out infinite;
    border: 3px solid rgba(99, 102, 241, 0.5);
  }

  .photo-frame {
    position: absolute;
    inset: -10px;
    border: 2px solid rgba(236, 72, 153, 0.3);
    border-radius: 25px;
    pointer-events: none;
  }

  .cta-section {
    position: relative;
    z-index: 1;
    padding: 4rem 2rem;
  }

  .cta-content {
    text-align: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    font-family: "Rajdhani", sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(99, 102, 241, 0.4);
    border-radius: 50px;
    transition: all 0.4s ease;
  }

  .back-link:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(236, 72, 153, 0.8);
    transform: translateX(-10px);
  }

  .back-arrow {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  .back-link:hover .back-arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .logo {
      width: 150px;
      height: 150px;
    }

    .stats-container {
      gap: 1.5rem;
    }

    .stat-card {
      padding: 1.5rem 2rem;
    }

    .stat-number {
      font-size: 2.5rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
