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
  let scrollY = $state(0);

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 8;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 2, 20);
    pointLight1.position.set(-5, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 2, 20);
    pointLight2.position.set(5, 2, -2);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00ffaa, 1.5, 15);
    pointLight3.position.set(0, -2, 5);
    scene.add(pointLight3);

    function createLowPolyGem(radius, detail) {
      const geometry = new THREE.IcosahedronGeometry(radius, detail);
      return geometry;
    }

    function createLowPolyCrystal(height, radiusTop, radiusBottom, segments) {
      const geometry = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        segments,
        1,
      );
      return geometry;
    }

    const mirrorMaterial = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      specular: 0xffffff,
      shininess: 100,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    });

    const crystalMaterial = new THREE.MeshPhongMaterial({
      color: 0xcc88ff,
      specular: 0xffffff,
      shininess: 80,
      flatShading: true,
      transparent: true,
      opacity: 0.75,
    });

    const gemMaterial = new THREE.MeshPhongMaterial({
      color: 0xff88aa,
      specular: 0xffffff,
      shininess: 120,
      flatShading: true,
      transparent: true,
      opacity: 0.8,
    });

    const tealMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ddcc,
      specular: 0xffffff,
      shininess: 90,
      flatShading: true,
      transparent: true,
      opacity: 0.7,
    });

    const floatingObjects = [];

    const gem1 = new THREE.Mesh(createLowPolyGem(1.2, 0), mirrorMaterial);
    gem1.position.set(-4, 1, -2);
    scene.add(gem1);
    floatingObjects.push({ mesh: gem1, speed: 0.8, amplitude: 0.5, phase: 0 });

    const gem2 = new THREE.Mesh(createLowPolyGem(0.8, 1), crystalMaterial);
    gem2.position.set(3.5, 2.5, -1);
    scene.add(gem2);
    floatingObjects.push({
      mesh: gem2,
      speed: 1.2,
      amplitude: 0.3,
      phase: Math.PI / 3,
    });

    const gem3 = new THREE.Mesh(createLowPolyGem(1.5, 0), gemMaterial);
    gem3.position.set(0, 0, -4);
    scene.add(gem3);
    floatingObjects.push({
      mesh: gem3,
      speed: 0.6,
      amplitude: 0.7,
      phase: Math.PI / 2,
    });

    const crystal1 = new THREE.Mesh(
      createLowPolyCrystal(3, 0.1, 0.6, 6),
      mirrorMaterial,
    );
    crystal1.position.set(-2, -1, 1);
    crystal1.rotation.z = 0.3;
    scene.add(crystal1);
    floatingObjects.push({
      mesh: crystal1,
      speed: 0.5,
      amplitude: 0.4,
      phase: Math.PI,
    });

    const crystal2 = new THREE.Mesh(
      createLowPolyCrystal(2.5, 0.15, 0.5, 5),
      tealMaterial,
    );
    crystal2.position.set(2.5, -0.5, 2);
    crystal2.rotation.z = -0.2;
    scene.add(crystal2);
    floatingObjects.push({
      mesh: crystal2,
      speed: 0.7,
      amplitude: 0.35,
      phase: Math.PI / 4,
    });

    const mirrorPlaneGeometry = new THREE.PlaneGeometry(20, 20, 8, 8);
    const positionAttribute = mirrorPlaneGeometry.attributes.position;
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      positionAttribute.setZ(i, Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.3);
    }
    mirrorPlaneGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      specular: 0x4a9eff,
      shininess: 50,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const ground = new THREE.Mesh(mirrorPlaneGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    scene.add(ground);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 20;
      posArray[i + 1] = (Math.random() - 0.5) * 15;
      posArray[i + 2] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x88ccff,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;

    function onMouseMove(event) {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    window.addEventListener("mousemove", onMouseMove);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onResize);

    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      floatingObjects.forEach((obj) => {
        obj.mesh.position.y +=
          Math.sin(elapsed * obj.speed + obj.phase) * 0.002 * obj.amplitude;
        obj.mesh.rotation.y += 0.005;
        obj.mesh.rotation.x += 0.002;
      });

      particles.rotation.y = elapsed * 0.02;
      particles.rotation.x = Math.sin(elapsed * 0.1) * 0.1;

      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.5 + 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -2);

      pointLight1.position.x = Math.sin(elapsed * 0.5) * 5;
      pointLight1.position.z = Math.cos(elapsed * 0.5) * 5;

      pointLight2.position.x = Math.sin(elapsed * 0.3 + Math.PI) * 4;
      pointLight2.position.z = Math.cos(elapsed * 0.3 + Math.PI) * 4;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (canvasContainer && renderer.domElement) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  });

  function handleScroll() {
    scrollY = window.scrollY;
  }
</script>

<svelte:window on:scroll={handleScroll} />

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="{title} - Theme: {theme}" />
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-wrapper">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <section class="hero">
    <div class="hero-content" style="transform: translateY({scrollY * 0.3}px)">
      <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
      <h1 class="title">{title}</h1>
      <p class="dates">{duration}</p>
      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-name">{theme}</span>
      </div>
      <p class="submissions">{submissions} Submissions</p>
      <a href="#games" class="scroll-cta">
        <span>Explore Winners</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </div>
  </section>

  <section id="games" class="games-section">
    <h2 class="section-title">Featured Games</h2>
    <div class="games-grid">
      {#each games as game, i}
        <a
          href={game.link}
          target="_blank"
          rel="noopener noreferrer"
          class="game-card"
          style="animation-delay: {i * 0.1}s"
        >
          <div class="game-image-wrapper">
            <img src={game.src} alt={game.alt} class="game-image" />
            <div class="game-overlay"></div>
          </div>
          <div class="game-info">
            <h3 class="game-title">{game.title}</h3>
            <p class="game-prize">{game.prize}</p>
          </div>
        </a>
      {/each}
    </div>
    <a
      href="https://itch.io/jam/camgamejam2024"
      target="_blank"
      rel="noopener noreferrer"
      class="all-submissions-btn"
    >
      View All Submissions
    </a>
  </section>

  <section class="about-section">
    <div class="about-content">
      <h2 class="section-title">About the Jam</h2>
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
      <div class="stats-row">
        <div class="stat">
          <span class="stat-number">{submissions}</span>
          <span class="stat-label">Games Created</span>
        </div>
        <div class="stat">
          <span class="stat-number">48</span>
          <span class="stat-label">Hours</span>
        </div>
        <div class="stat">
          <span class="stat-number">100+</span>
          <span class="stat-label">Participants</span>
        </div>
      </div>
    </div>
  </section>

  <section class="gallery-section">
    <h2 class="section-title">Gallery</h2>
    <div class="gallery-wrapper">
      <img
        src="/2024/group-photo.jpg"
        alt="Participants at the event"
        class="gallery-image"
      />
    </div>
  </section>

  <section class="back-section">
    <a href="/" class="back-link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back to Main Site
    </a>
  </section>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: "Rajdhani", sans-serif;
    background: #0a0a12;
    color: #e0e0ff;
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
    height: 100vh;
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
    padding: 2rem;
  }

  .hero-content {
    text-align: center;
    max-width: 800px;
  }

  .logo {
    width: 180px;
    height: 180px;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 0 30px rgba(74, 158, 255, 0.5));
    animation: float 4s ease-in-out infinite;
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

  .title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    background: linear-gradient(135deg, #4a9eff, #ff6b9d, #00ffaa);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-shift 5s ease infinite;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 40px rgba(74, 158, 255, 0.3);
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

  .dates {
    font-size: 1.5rem;
    color: #88ccff;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .theme-badge {
    display: inline-flex;
    flex-direction: column;
    background: linear-gradient(
      135deg,
      rgba(74, 158, 255, 0.2),
      rgba(255, 107, 157, 0.2)
    );
    border: 1px solid rgba(136, 204, 255, 0.3);
    border-radius: 12px;
    padding: 1rem 2rem;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(10px);
  }

  .theme-label {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #88ccff;
  }

  .theme-name {
    font-family: "Orbitron", sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
  }

  .submissions {
    font-size: 1.25rem;
    color: #cc88ff;
    margin-bottom: 2rem;
  }

  .scroll-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #00ffaa;
    text-decoration: none;
    font-size: 1.125rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border: 2px solid #00ffaa;
    border-radius: 30px;
    transition: all 0.3s ease;
  }

  .scroll-cta:hover {
    background: rgba(0, 255, 170, 0.1);
    transform: translateY(3px);
    box-shadow: 0 0 20px rgba(0, 255, 170, 0.3);
  }

  .scroll-cta svg {
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(5px);
    }
  }

  .games-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(10, 10, 18, 0.95) 10%,
      rgba(10, 10, 18, 0.98) 100%
    );
  }

  .section-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    text-align: center;
    margin-bottom: 3rem;
    color: #fff;
    text-shadow: 0 0 30px rgba(74, 158, 255, 0.5);
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto 3rem;
  }

  .game-card {
    position: relative;
    background: linear-gradient(
      135deg,
      rgba(26, 26, 46, 0.8),
      rgba(40, 40, 70, 0.6)
    );
    border: 1px solid rgba(136, 204, 255, 0.2);
    border-radius: 16px;
    overflow: hidden;
    text-decoration: none;
    transition: all 0.4s ease;
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .game-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(74, 158, 255, 0.5);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(74, 158, 255, 0.2);
  }

  .game-image-wrapper {
    position: relative;
    aspect-ratio: 16/9;
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

  .game-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 50%,
      rgba(10, 10, 18, 0.9) 100%
    );
  }

  .game-info {
    padding: 1.25rem;
  }

  .game-title {
    font-family: "Orbitron", sans-serif;
    font-size: 1.25rem;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .game-prize {
    font-size: 0.95rem;
    color: #00ffaa;
    font-weight: 500;
  }

  .all-submissions-btn {
    display: block;
    width: fit-content;
    margin: 0 auto;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #4a9eff, #cc88ff);
    color: #fff;
    text-decoration: none;
    font-family: "Orbitron", sans-serif;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 30px;
    transition: all 0.3s ease;
  }

  .all-submissions-btn:hover {
    transform: scale(1.05);
    box-shadow:
      0 10px 30px rgba(74, 158, 255, 0.4),
      0 0 20px rgba(204, 136, 255, 0.3);
  }

  .about-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: rgba(10, 10, 18, 0.98);
  }

  .about-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .about-text {
    font-size: 1.125rem;
    line-height: 1.8;
    color: #b0b0d0;
    margin-bottom: 1.5rem;
  }

  .stats-row {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-top: 3rem;
    flex-wrap: wrap;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-family: "Orbitron", sans-serif;
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #4a9eff, #00ffaa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 1rem;
    color: #88ccff;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .gallery-section {
    position: relative;
    z-index: 1;
    padding: 4rem 2rem 6rem;
    background: rgba(10, 10, 18, 0.98);
  }

  .gallery-wrapper {
    max-width: 1000px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(136, 204, 255, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .gallery-image {
    width: 100%;
    display: block;
  }

  .back-section {
    position: relative;
    z-index: 1;
    padding: 3rem 2rem;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 18, 0.98) 0%,
      #0a0a12 100%
    );
    text-align: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #88ccff;
    text-decoration: none;
    font-size: 1.125rem;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    border: 1px solid rgba(136, 204, 255, 0.3);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    background: rgba(136, 204, 255, 0.1);
    border-color: rgba(136, 204, 255, 0.5);
    color: #fff;
  }

  @media (max-width: 640px) {
    .logo {
      width: 120px;
      height: 120px;
    }

    .theme-badge {
      padding: 0.75rem 1.5rem;
    }

    .theme-name {
      font-size: 1.5rem;
    }

    .stats-row {
      gap: 2rem;
    }

    .stat-number {
      font-size: 2rem;
    }
  }
</style>
