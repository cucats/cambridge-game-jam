<script>
  import { onMount } from "svelte";
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

  let canvasContainer;
  let scene, camera, renderer, mirrorGroup, particles;
  let mouseX = $state(0);
  let mouseY = $state(0);
  let scrollY = $state(0);
  let mounted = $state(false);
  let activeGame = $state(0);
  let heroVisible = $state(false);
  let gamesVisible = $state(false);
  let statsVisible = $state(false);

  function createLowPolyGeometry() {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    return geometry;
  }

  function createMirrorMaterial(color) {
    return new THREE.MeshPhongMaterial({
      color: color,
      specular: 0xffffff,
      shininess: 100,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
    });
  }

  function initThreeJS() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a1a, 5, 50);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6b9d, 2, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x9d4edd, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00d4ff, 1.5, 50);
    pointLight3.position.set(0, 10, -10);
    scene.add(pointLight3);

    mirrorGroup = new THREE.Group();
    scene.add(mirrorGroup);

    const colors = [0xff6b9d, 0x9d4edd, 0x00d4ff, 0xffd93d, 0x6bcb77];

    for (let i = 0; i < 30; i++) {
      const geometry = createLowPolyGeometry();
      const material = createMirrorMaterial(
        colors[Math.floor(Math.random() * colors.length)],
      );
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (Math.random() - 0.5) * 40;
      mesh.position.y = (Math.random() - 0.5) * 40;
      mesh.position.z = (Math.random() - 0.5) * 30 - 5;

      const scale = Math.random() * 1.5 + 0.5;
      mesh.scale.set(scale, scale, scale);

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: mesh.position.y,
      };

      mirrorGroup.add(mesh);
    }

    const centerGeo = new THREE.OctahedronGeometry(2, 0);
    const centerMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 150,
      flatShading: true,
      transparent: true,
      opacity: 0.8,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerMesh.userData = { isCenter: true };
    mirrorGroup.add(centerMesh);

    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color(
        colors[Math.floor(Math.random() * colors.length)],
      );
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    animate();
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    mirrorGroup.children.forEach((mesh) => {
      if (mesh.userData.isCenter) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.007;
        mesh.position.y = Math.sin(time * 0.5) * 0.5;
      } else if (mesh.userData.rotationSpeed) {
        mesh.rotation.x += mesh.userData.rotationSpeed.x;
        mesh.rotation.y += mesh.userData.rotationSpeed.y;
        mesh.rotation.z += mesh.userData.rotationSpeed.z;

        mesh.position.y =
          mesh.userData.originalY +
          Math.sin(
            time * mesh.userData.floatSpeed + mesh.userData.floatOffset,
          ) *
            0.5;
      }
    });

    particles.rotation.y += 0.0002;
    particles.rotation.x += 0.0001;

    const targetX = mouseX * 0.002;
    const targetY = -mouseY * 0.002;
    mirrorGroup.rotation.y += (targetX - mirrorGroup.rotation.y) * 0.05;
    mirrorGroup.rotation.x += (targetY - mirrorGroup.rotation.x) * 0.05;

    camera.position.y = -scrollY * 0.002;
    camera.lookAt(0, -scrollY * 0.002, 0);

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function handleMouseMove(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  onMount(() => {
    mounted = true;
    initThreeJS();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    setTimeout(() => (heroVisible = true), 100);
    setTimeout(() => (statsVisible = true), 600);
    setTimeout(() => (gamesVisible = true), 1000);

    const gameInterval = setInterval(() => {
      activeGame = (activeGame + 1) % games.length;
    }, 4000);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(gameInterval);
      if (renderer) {
        renderer.dispose();
        canvasContainer?.removeChild(renderer.domElement);
      }
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="splash-container">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <section class="hero">
    <div class="hero-content" class:visible={heroVisible}>
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        <div class="logo-reflection"></div>
      </div>
      <h1 class="title">
        <span class="title-line">Cambridge</span>
        <span class="title-line delay-1">Game Jam</span>
        <span class="title-line delay-2 accent">2024</span>
      </h1>
      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-name">{theme}</span>
      </div>
      <p class="date">{duration}</p>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
        <span>Scroll to Explore</span>
      </div>
    </div>
  </section>

  <section class="stats-section">
    <div class="stats-container" class:visible={statsVisible}>
      <div class="stat-card">
        <span class="stat-number">{submissions}</span>
        <span class="stat-label">Games Created</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">48</span>
        <span class="stat-label">Hours of Creation</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">∞</span>
        <span class="stat-label">Reflections Made</span>
      </div>
    </div>
  </section>

  <section class="games-section">
    <h2 class="section-title" class:visible={gamesVisible}>
      <span class="title-decoration left"></span>
      Featured Games
      <span class="title-decoration right"></span>
    </h2>

    <div class="games-showcase" class:visible={gamesVisible}>
      <div class="games-carousel">
        {#each games as game, index}
          <a
            href={game.link}
            class="game-card"
            class:active={index === activeGame}
            class:prev={index ===
              (activeGame - 1 + games.length) % games.length}
            class:next={index === (activeGame + 1) % games.length}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="game-image-container">
              <img src={game.src} alt={game.alt} class="game-image" />
              <div class="game-image-overlay"></div>
            </div>
            <div class="game-info">
              <h3 class="game-title">{game.title}</h3>
              <span class="game-prize">{game.prize}</span>
            </div>
            <div class="game-reflection"></div>
          </a>
        {/each}
      </div>

      <div class="carousel-controls">
        <button
          class="carousel-btn prev"
          onclick={() =>
            (activeGame = (activeGame - 1 + games.length) % games.length)}
          aria-label="Previous game"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M15 18l-6-6 6-6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="carousel-dots">
          {#each games as _, index}
            <button
              class="dot"
              class:active={index === activeGame}
              onclick={() => (activeGame = index)}
              aria-label="Go to game {index + 1}"
            ></button>
          {/each}
        </div>
        <button
          class="carousel-btn next"
          onclick={() => (activeGame = (activeGame + 1) % games.length)}
          aria-label="Next game"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M9 18l6-6-6-6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <a
      href="https://itch.io/jam/camgamejam2024"
      class="view-all-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      View All {submissions} Submissions
      <span class="btn-arrow">→</span>
    </a>
  </section>

  <section class="about-section">
    <div class="about-content">
      <h2 class="section-title">
        <span class="title-decoration left"></span>
        About the Event
        <span class="title-decoration right"></span>
      </h2>
      <div class="about-grid">
        <div class="about-card">
          <div class="card-icon">🎮</div>
          <h3>Lorem Ipsum Dolor</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div class="about-card">
          <div class="card-icon">🪞</div>
          <h3>Reflection Theme</h3>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
        <div class="about-card">
          <div class="card-icon">🏆</div>
          <h3>Duis Aute Irure</h3>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="gallery-section">
    <h2 class="section-title">
      <span class="title-decoration left"></span>
      Memories
      <span class="title-decoration right"></span>
    </h2>
    <div class="gallery-container">
      <div class="gallery-item large">
        <img
          src="/2024/group-photo.jpg"
          alt="Cambridge Game Jam 2024 Participants"
        />
        <div class="gallery-overlay">
          <span>Lorem Ipsum Dolor Sit Amet</span>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="cta-content">
      <h2>Lorem Ipsum Dolor</h2>
      <p>Consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
      <a href="/archive" class="cta-btn">
        Explore More Jams
        <span class="btn-glow"></span>
      </a>
    </div>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #0a0a1a;
    overflow-x: hidden;
  }

  .splash-container {
    font-family: "Rajdhani", sans-serif;
    color: #ffffff;
    min-height: 100vh;
    position: relative;
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

  section {
    position: relative;
    z-index: 1;
    padding: 0;
    margin: 0;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .hero-content {
    text-align: center;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-content.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .logo-container {
    position: relative;
    margin-bottom: 2rem;
    display: inline-block;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(157, 78, 221, 0.5));
    animation:
      float 3s ease-in-out infinite,
      pulse-glow 2s ease-in-out infinite;
  }

  .logo-reflection {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%) scaleY(-1);
    width: 200px;
    height: 100px;
    background: linear-gradient(
      to bottom,
      rgba(157, 78, 221, 0.3),
      transparent
    );
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3),
      transparent
    );
    pointer-events: none;
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

  @keyframes pulse-glow {
    0%,
    100% {
      filter: drop-shadow(0 0 30px rgba(157, 78, 221, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 50px rgba(255, 107, 157, 0.7));
    }
  }

  .title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 8vw, 5rem);
    font-weight: 900;
    margin: 0;
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .title-line {
    display: block;
    opacity: 0;
    transform: translateX(-50px);
    animation: slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .title-line.delay-1 {
    animation-delay: 0.2s;
  }

  .title-line.delay-2 {
    animation-delay: 0.4s;
  }

  .title-line.accent {
    background: linear-gradient(135deg, #ff6b9d, #9d4edd, #00d4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation:
      slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards,
      gradient-shift 3s ease-in-out infinite;
    background-size: 200% 200%;
  }

  @keyframes slide-in {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes gradient-shift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .theme-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin: 2rem 0;
    padding: 1rem 3rem;
    background: linear-gradient(
      135deg,
      rgba(157, 78, 221, 0.2),
      rgba(0, 212, 255, 0.2)
    );
    border: 1px solid rgba(157, 78, 221, 0.5);
    border-radius: 50px;
    backdrop-filter: blur(10px);
    animation: badge-appear 1s ease-out 0.6s both;
  }

  @keyframes badge-appear {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .theme-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.6);
  }

  .theme-name {
    font-family: "Orbitron", sans-serif;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ff6b9d, #9d4edd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .date {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 1rem 0;
    animation: fade-in 1s ease-out 0.8s both;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    animation: bounce 2s ease-in-out infinite;
  }

  .scroll-arrow {
    width: 30px;
    height: 30px;
    border-right: 2px solid rgba(255, 255, 255, 0.5);
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
    transform: rotate(45deg);
  }

  .scroll-indicator span {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.5);
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(10px);
    }
  }

  .stats-section {
    padding: 100px 20px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(10, 10, 26, 0.9),
      transparent
    );
  }

  .stats-container {
    display: flex;
    justify-content: center;
    gap: 4rem;
    flex-wrap: wrap;
    max-width: 1200px;
    margin: 0 auto;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .stats-container.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    min-width: 200px;
    transition: all 0.4s ease;
  }

  .stat-card:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: rgba(157, 78, 221, 0.5);
    box-shadow: 0 20px 40px rgba(157, 78, 221, 0.2);
  }

  .stat-number {
    font-family: "Orbitron", sans-serif;
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #ff6b9d, #9d4edd, #00d4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .stat-label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.5rem;
  }

  .games-section {
    padding: 100px 20px;
    text-align: center;
  }

  .section-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    margin-bottom: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease;
  }

  .section-title.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .title-decoration {
    display: inline-block;
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #9d4edd, transparent);
  }

  .title-decoration.left {
    background: linear-gradient(90deg, transparent, #9d4edd);
  }

  .title-decoration.right {
    background: linear-gradient(90deg, #9d4edd, transparent);
  }

  .games-showcase {
    max-width: 1400px;
    margin: 0 auto;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
  }

  .games-showcase.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .games-carousel {
    position: relative;
    height: 500px;
    perspective: 1000px;
    margin-bottom: 2rem;
  }

  .game-card {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    height: 400px;
    transform: translate(-50%, -50%) scale(0.7) rotateY(45deg);
    opacity: 0;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    text-decoration: none;
    color: inherit;
    pointer-events: none;
  }

  .game-card.active {
    transform: translate(-50%, -50%) scale(1) rotateY(0);
    opacity: 1;
    z-index: 10;
    pointer-events: auto;
  }

  .game-card.prev {
    transform: translate(-150%, -50%) scale(0.8) rotateY(25deg);
    opacity: 0.5;
    z-index: 5;
    pointer-events: auto;
  }

  .game-card.next {
    transform: translate(50%, -50%) scale(0.8) rotateY(-25deg);
    opacity: 0.5;
    z-index: 5;
    pointer-events: auto;
  }

  .game-image-container {
    position: relative;
    width: 100%;
    height: 280px;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .game-card:hover .game-image {
    transform: scale(1.1);
  }

  .game-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(10, 10, 26, 0.8)
    );
  }

  .game-info {
    padding: 1.5rem;
    background: rgba(20, 20, 40, 0.9);
    border-radius: 0 0 20px 20px;
    border: 1px solid rgba(157, 78, 221, 0.3);
    border-top: none;
  }

  .game-title {
    font-family: "Orbitron", sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #fff;
  }

  .game-prize {
    font-size: 0.9rem;
    color: #ff6b9d;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .game-reflection {
    position: absolute;
    bottom: -80px;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(
      to bottom,
      rgba(157, 78, 221, 0.2),
      transparent
    );
    transform: scaleY(-1);
    opacity: 0.3;
    pointer-events: none;
    border-radius: 0 0 20px 20px;
  }

  .carousel-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .carousel-btn {
    width: 50px;
    height: 50px;
    border: 2px solid rgba(157, 78, 221, 0.5);
    border-radius: 50%;
    background: rgba(157, 78, 221, 0.1);
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-btn:hover {
    background: rgba(157, 78, 221, 0.3);
    border-color: #9d4edd;
    transform: scale(1.1);
  }

  .carousel-btn svg {
    width: 24px;
    height: 24px;
  }

  .carousel-dots {
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #9d4edd;
    border-color: #9d4edd;
    transform: scale(1.2);
  }

  .dot:hover {
    border-color: #ff6b9d;
  }

  .view-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 3rem;
    padding: 1rem 2.5rem;
    font-family: "Orbitron", sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    background: linear-gradient(135deg, #9d4edd, #ff6b9d);
    border-radius: 50px;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  .view-all-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(157, 78, 221, 0.4);
  }

  .view-all-btn:hover .btn-arrow {
    transform: translateX(5px);
  }

  .btn-arrow {
    transition: transform 0.3s ease;
  }

  .about-section {
    padding: 100px 20px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(10, 10, 26, 0.95),
      transparent
    );
  }

  .about-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .about-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }

  .about-card {
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    text-align: center;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  .about-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(157, 78, 221, 0.1),
      transparent,
      rgba(0, 212, 255, 0.1)
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .about-card:hover {
    transform: translateY(-10px);
    border-color: rgba(157, 78, 221, 0.3);
  }

  .about-card:hover::before {
    opacity: 1;
  }

  .card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
  }

  .about-card h3 {
    font-family: "Orbitron", sans-serif;
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  .about-card p {
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
    margin: 0;
  }

  .gallery-section {
    padding: 100px 20px;
    text-align: center;
  }

  .gallery-container {
    max-width: 1000px;
    margin: 3rem auto 0;
  }

  .gallery-item {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
  }

  .gallery-item.large {
    aspect-ratio: 16 / 9;
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
    background: linear-gradient(to top, rgba(10, 10, 26, 0.9), transparent 50%);
    display: flex;
    align-items: flex-end;
    padding: 2rem;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .gallery-item:hover .gallery-overlay {
    opacity: 1;
  }

  .gallery-overlay span {
    font-family: "Orbitron", sans-serif;
    font-size: 1.2rem;
    color: #fff;
  }

  .cta-section {
    padding: 150px 20px;
    text-align: center;
    background: radial-gradient(
      ellipse at center,
      rgba(157, 78, 221, 0.15),
      transparent 70%
    );
  }

  .cta-content h2 {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #fff, #9d4edd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cta-content p {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
  }

  .cta-btn {
    display: inline-block;
    padding: 1.2rem 3rem;
    font-family: "Orbitron", sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    background: transparent;
    border: 2px solid #9d4edd;
    border-radius: 50px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
  }

  .cta-btn:hover {
    background: rgba(157, 78, 221, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(157, 78, 221, 0.3);
  }

  .btn-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(157, 78, 221, 0.5),
      transparent
    );
    border-radius: 50px;
    z-index: -1;
    animation: glow-rotate 3s linear infinite;
  }

  @keyframes glow-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .stats-container {
      gap: 2rem;
    }

    .stat-card {
      min-width: 150px;
      padding: 1.5rem;
    }

    .stat-number {
      font-size: 2.5rem;
    }

    .games-carousel {
      height: 400px;
    }

    .game-card {
      width: 280px;
      height: 350px;
    }

    .game-card.prev,
    .game-card.next {
      display: none;
    }

    .game-image-container {
      height: 220px;
    }

    .about-grid {
      grid-template-columns: 1fr;
    }

    .logo {
      width: 150px;
      height: 150px;
    }
  }
</style>
