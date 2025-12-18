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
      prize: "Most Popular and Best Gameplay",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      alt: "Reflect Upon Your Actions",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular and Most Original",
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
  let scene, camera, renderer, mirrorMesh, floatingShapes;

  function createLowPolyGeometry(radius, detail) {
    return new THREE.IcosahedronGeometry(radius, detail);
  }

  function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    camera = new THREE.PerspectiveCamera(
      60,
      canvasContainer.clientWidth / canvasContainer.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 8;
    camera.position.y = 2;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 20);
    pointLight1.position.set(-5, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 20);
    pointLight2.position.set(5, 3, 2);
    scene.add(pointLight2);

    const mirrorGeometry = new THREE.PlaneGeometry(30, 30, 20, 20);
    const positionAttribute = mirrorGeometry.getAttribute("position");
    for (let i = 0; i < positionAttribute.count; i++) {
      const z = (Math.random() - 0.5) * 0.3;
      positionAttribute.setZ(i, z);
    }
    mirrorGeometry.computeVertexNormals();

    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1e3f,
      metalness: 0.9,
      roughness: 0.1,
      flatShading: true,
    });

    mirrorMesh = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorMesh.rotation.x = -Math.PI / 2;
    mirrorMesh.position.y = -2;
    scene.add(mirrorMesh);

    floatingShapes = [];

    const shapeConfigs = [
      { type: "icosahedron", radius: 0.8, detail: 0, position: [-3, 1, 0] },
      { type: "octahedron", radius: 0.6, detail: 0, position: [3, 1.5, -1] },
      { type: "tetrahedron", radius: 0.5, detail: 0, position: [0, 2, 1] },
      { type: "icosahedron", radius: 0.4, detail: 0, position: [-2, 0.5, 2] },
      { type: "octahedron", radius: 0.5, detail: 0, position: [2, 0.8, 2] },
      { type: "dodecahedron", radius: 0.7, detail: 0, position: [0, 1, -2] },
    ];

    const colors = [0x6366f1, 0x8b5cf6, 0xa855f7, 0xc084fc, 0xe879f9, 0xf472b6];

    shapeConfigs.forEach((config, index) => {
      let geometry;
      switch (config.type) {
        case "icosahedron":
          geometry = new THREE.IcosahedronGeometry(config.radius, config.detail);
          break;
        case "octahedron":
          geometry = new THREE.OctahedronGeometry(config.radius, config.detail);
          break;
        case "tetrahedron":
          geometry = new THREE.TetrahedronGeometry(config.radius, config.detail);
          break;
        case "dodecahedron":
          geometry = new THREE.DodecahedronGeometry(config.radius, config.detail);
          break;
      }

      const material = new THREE.MeshStandardMaterial({
        color: colors[index % colors.length],
        metalness: 0.3,
        roughness: 0.4,
        flatShading: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...config.position);
      scene.add(mesh);

      const reflectionMaterial = new THREE.MeshStandardMaterial({
        color: colors[index % colors.length],
        metalness: 0.3,
        roughness: 0.4,
        flatShading: true,
        transparent: true,
        opacity: 0.4,
      });

      const reflectionMesh = new THREE.Mesh(geometry.clone(), reflectionMaterial);
      reflectionMesh.position.set(
        config.position[0],
        -4 - config.position[1],
        config.position[2],
      );
      reflectionMesh.scale.y = -1;
      scene.add(reflectionMesh);

      floatingShapes.push({
        mesh,
        reflection: reflectionMesh,
        originalY: config.position[1],
        speed: 0.5 + Math.random() * 0.5,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
      });
    });

    const gridHelper = new THREE.GridHelper(20, 20, 0x4338ca, 0x3730a3);
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);

    animate();
    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    if (!canvasContainer) return;
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    floatingShapes.forEach((shape, index) => {
      const floatOffset = Math.sin(time * shape.speed + index) * 0.3;
      shape.mesh.position.y = shape.originalY + floatOffset;
      shape.reflection.position.y = -4 - shape.originalY - floatOffset;

      shape.mesh.rotation.x += shape.rotationSpeed.x;
      shape.mesh.rotation.y += shape.rotationSpeed.y;
      shape.mesh.rotation.z += shape.rotationSpeed.z;

      shape.reflection.rotation.x = -shape.mesh.rotation.x;
      shape.reflection.rotation.y = shape.mesh.rotation.y;
      shape.reflection.rotation.z = shape.mesh.rotation.z;
    });

    camera.position.x = Math.sin(time * 0.1) * 0.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  onMount(() => {
    initThreeJS();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  });

  let currentSlide = $state(0);

  function nextSlide() {
    currentSlide = (currentSlide + 1) % games.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + games.length) % games.length;
  }
</script>

<svelte:head>
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-container">
  <div class="canvas-background" bind:this={canvasContainer}></div>

  <div class="content-overlay">
    <header class="hero-section">
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
      </div>
      <div class="title-content">
        <h1 class="main-title">{title}</h1>
        <p class="date">{duration}</p>
        <div class="theme-badge">
          <span class="theme-label">Theme:</span>
          <span class="theme-name">{theme}</span>
        </div>
        <p class="submissions-count">{submissions} Submissions</p>
      </div>
    </header>

    <section class="about-section">
      <h2 class="section-title">About the Jam</h2>
      <p class="section-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </p>
    </section>

    <section class="games-section">
      <h2 class="section-title">Featured Games</h2>

      <div class="games-carousel">
        <button class="nav-button prev" onclick={prevSlide}>&#9664;</button>

        <div class="carousel-container">
          {#each games as game, index}
            <a
              href={game.link}
              class="game-card"
              class:active={index === currentSlide}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="game-image-container">
                <img src={game.src} alt={game.alt} class="game-image" />
                <div class="game-reflection">
                  <img src={game.src} alt="" class="reflection-image" />
                </div>
              </div>
              <div class="game-info">
                <h3 class="game-title">{game.title}</h3>
                <p class="game-prize">{game.prize}</p>
              </div>
            </a>
          {/each}
        </div>

        <button class="nav-button next" onclick={nextSlide}>&#9654;</button>
      </div>

      <div class="carousel-dots">
        {#each games as _, index}
          <button
            class="dot"
            class:active={index === currentSlide}
            onclick={() => (currentSlide = index)}
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    </section>

    <section class="gallery-section">
      <h2 class="section-title">Gallery</h2>
      <div class="gallery-grid">
        <div class="gallery-item">
          <img src="/2024/group-photo.jpg" alt="Cambridge Game Jam 2024 participants" class="gallery-image" />
        </div>
      </div>
    </section>

    <section class="cta-section">
      <a href="https://itch.io/jam/camgamejam2024" class="cta-button" target="_blank" rel="noopener noreferrer">
        View All Submissions
      </a>
      <a href="/archive" class="back-link">← Back to Archive</a>
    </section>

    <footer class="page-footer">
      <p>Cambridge Game Jam 2024</p>
      <p class="footer-sub">Lorem ipsum dolor sit amet</p>
    </footer>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .page-container {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
    font-family: "Rajdhani", sans-serif;
    color: #e0e0ff;
  }

  .canvas-background {
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
    pointer-events: none;
  }

  .content-overlay > * {
    pointer-events: auto;
  }

  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(10, 10, 26, 0.8) 100%
    );
  }

  .logo-container {
    margin-bottom: 2rem;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5));
  }

  .title-content {
    max-width: 800px;
  }

  .main-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    letter-spacing: 0.1em;
  }

  .date {
    font-size: 1.5rem;
    color: #a5b4fc;
    margin: 0 0 1.5rem 0;
    font-weight: 500;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 50px;
    padding: 0.75rem 2rem;
    margin-bottom: 1.5rem;
  }

  .theme-label {
    color: #a5b4fc;
    font-size: 1rem;
  }

  .theme-name {
    font-family: "Orbitron", sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #c084fc;
  }

  .submissions-count {
    font-size: 1.25rem;
    color: #94a3b8;
    margin: 0;
  }

  .section-title {
    font-family: "Orbitron", sans-serif;
    font-size: 2rem;
    text-align: center;
    margin: 0 0 2rem 0;
    color: #c084fc;
  }

  .about-section {
    padding: 4rem 2rem;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    background: rgba(10, 10, 26, 0.9);
  }

  .section-text {
    font-size: 1.125rem;
    line-height: 1.8;
    color: #cbd5e1;
    margin: 0;
  }

  .games-section {
    padding: 4rem 2rem;
    background: linear-gradient(
      to bottom,
      rgba(10, 10, 26, 0.9) 0%,
      rgba(26, 26, 62, 0.9) 50%,
      rgba(10, 10, 26, 0.9) 100%
    );
  }

  .games-carousel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .carousel-container {
    display: flex;
    overflow: hidden;
    width: 100%;
    max-width: 600px;
  }

  .game-card {
    flex: 0 0 100%;
    display: none;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s ease;
  }

  .game-card.active {
    display: flex;
  }

  .game-card:hover {
    transform: scale(1.02);
  }

  .game-image-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    aspect-ratio: 16/9;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(139, 92, 246, 0.3);
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .game-reflection {
    position: absolute;
    bottom: -100%;
    left: 0;
    right: 0;
    height: 100%;
    overflow: hidden;
    opacity: 0.3;
  }

  .reflection-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleY(-1);
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 50%);
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      transparent 50%
    );
  }

  .game-info {
    text-align: center;
    margin-top: 1.5rem;
  }

  .game-title {
    font-family: "Orbitron", sans-serif;
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
    color: #e0e0ff;
  }

  .game-prize {
    font-size: 1rem;
    color: #f472b6;
    margin: 0;
    font-weight: 500;
  }

  .nav-button {
    background: rgba(139, 92, 246, 0.3);
    border: 1px solid rgba(139, 92, 246, 0.5);
    color: #e0e0ff;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .nav-button:hover {
    background: rgba(139, 92, 246, 0.5);
    transform: scale(1.1);
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.3);
    border: 1px solid rgba(139, 92, 246, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #8b5cf6;
    transform: scale(1.2);
  }

  .gallery-section {
    padding: 4rem 2rem;
    background: rgba(10, 10, 26, 0.9);
  }

  .gallery-grid {
    display: flex;
    justify-content: center;
    max-width: 1000px;
    margin: 0 auto;
  }

  .gallery-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.2);
  }

  .gallery-image {
    width: 100%;
    max-width: 800px;
    height: auto;
    display: block;
  }

  .cta-section {
    padding: 4rem 2rem;
    text-align: center;
    background: linear-gradient(
      to bottom,
      rgba(10, 10, 26, 0.9) 0%,
      rgba(26, 26, 62, 0.9) 100%
    );
  }

  .cta-button {
    display: inline-block;
    font-family: "Orbitron", sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    text-decoration: none;
    border-radius: 50px;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.5);
  }

  .back-link {
    display: block;
    margin-top: 2rem;
    color: #a5b4fc;
    text-decoration: none;
    font-size: 1.125rem;
    transition: color 0.3s ease;
  }

  .back-link:hover {
    color: #c084fc;
  }

  .page-footer {
    padding: 3rem 2rem;
    text-align: center;
    background: rgba(10, 10, 26, 0.95);
    border-top: 1px solid rgba(139, 92, 246, 0.2);
  }

  .page-footer p {
    margin: 0;
    font-family: "Orbitron", sans-serif;
    font-size: 1rem;
    color: #8b5cf6;
  }

  .footer-sub {
    margin-top: 0.5rem !important;
    font-family: "Rajdhani", sans-serif !important;
    font-size: 0.875rem !important;
    color: #64748b !important;
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 1rem;
    }

    .logo {
      width: 150px;
      height: 150px;
    }

    .nav-button {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .carousel-container {
      max-width: 100%;
    }
  }
</style>
