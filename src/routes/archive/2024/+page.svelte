<script>
  import { onMount, onDestroy } from "svelte";

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
    {
      src: "/2024/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2024",
      title: "All Submissions",
      prize: "",
    },
  ];

  let currentIndex = $state(0);
  let canvasContainer = $state(null);
  let scene, camera, renderer, animationId;
  let crystals = [];
  let THREE;

  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % games.length;
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + games.length) % games.length;
  };

  function createLowPolyCrystal(color, size) {
    const geometry = new THREE.OctahedronGeometry(size, 0);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
    });
    return new THREE.Mesh(geometry, material);
  }

  function createMirrorPlane() {
    const geometry = new THREE.PlaneGeometry(100, 100, 20, 20);
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += Math.random() * 0.3;
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      flatShading: true,
      shininess: 150,
      specular: 0x6366f1,
      transparent: true,
      opacity: 0.9,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3;
    return plane;
  }

  function initThreeJS() {
    if (!canvasContainer || !THREE) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1a);
    scene.fog = new THREE.Fog(0x0f0f1a, 15, 40);

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 1, 20);
    purpleLight.position.set(-5, 3, 3);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 1, 20);
    blueLight.position.set(5, 3, -3);
    scene.add(blueLight);

    const pinkLight = new THREE.PointLight(0xec4899, 0.8, 20);
    pinkLight.position.set(0, 5, 5);
    scene.add(pinkLight);

    const mirrorPlane = createMirrorPlane();
    scene.add(mirrorPlane);

    const crystalColors = [
      0x8b5cf6, 0x6366f1, 0x3b82f6, 0xa855f7, 0x06b6d4, 0xec4899,
    ];

    for (let i = 0; i < 15; i++) {
      const color =
        crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const size = 0.3 + Math.random() * 0.7;
      const crystal = createLowPolyCrystal(color, size);

      crystal.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 6 - 1,
        (Math.random() - 0.5) * 15 - 3,
      );

      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );

      crystal.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.5 + Math.random() * 0.5,
        originalY: crystal.position.y,
      };

      crystals.push(crystal);
      scene.add(crystal);

      const reflectedCrystal = crystal.clone();
      reflectedCrystal.material = crystal.material.clone();
      reflectedCrystal.material.opacity = 0.3;
      reflectedCrystal.position.y = -6 - crystal.position.y;
      reflectedCrystal.scale.y = -1;
      reflectedCrystal.userData = {
        ...crystal.userData,
        isReflection: true,
        original: crystal,
      };
      crystals.push(reflectedCrystal);
      scene.add(reflectedCrystal);
    }

    const mainCrystal = createLowPolyCrystal(0xe879f9, 1.5);
    mainCrystal.position.set(0, 1, 0);
    mainCrystal.userData = {
      rotationSpeed: { x: 0.005, y: 0.01, z: 0.003 },
      floatOffset: 0,
      floatSpeed: 0.3,
      originalY: 1,
    };
    crystals.push(mainCrystal);
    scene.add(mainCrystal);

    const mainReflection = mainCrystal.clone();
    mainReflection.material = mainCrystal.material.clone();
    mainReflection.material.opacity = 0.25;
    mainReflection.position.y = -7;
    mainReflection.scale.y = -1;
    mainReflection.userData = {
      ...mainCrystal.userData,
      isReflection: true,
      original: mainCrystal,
    };
    crystals.push(mainReflection);
    scene.add(mainReflection);

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    crystals.forEach((crystal) => {
      if (crystal.userData.isReflection) {
        const orig = crystal.userData.original;
        crystal.position.y = -6 - orig.position.y;
        crystal.rotation.x = -orig.rotation.x;
        crystal.rotation.y = orig.rotation.y;
        crystal.rotation.z = orig.rotation.z;
      } else {
        crystal.rotation.x += crystal.userData.rotationSpeed.x;
        crystal.rotation.y += crystal.userData.rotationSpeed.y;
        crystal.rotation.z += crystal.userData.rotationSpeed.z;

        crystal.position.y =
          crystal.userData.originalY +
          Math.sin(
            time * crystal.userData.floatSpeed + crystal.userData.floatOffset,
          ) *
            0.3;
      }
    });

    camera.position.x = Math.sin(time * 0.1) * 0.5;
    camera.position.y = 2 + Math.sin(time * 0.15) * 0.2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMount(async () => {
    THREE = await import("three");
    initThreeJS();
    window.addEventListener("resize", handleResize);
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-wrapper">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <div class="content-overlay">
    <header class="hero-section">
      <div class="logo-wrapper">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
      </div>
      <div class="hero-text">
        <h1 class="main-title">{title}</h1>
        <p class="date-text">{duration}</p>
        <div class="theme-badge">
          <span class="theme-label">Theme:</span>
          <span class="theme-value">{theme}</span>
        </div>
        <p class="submissions-text">
          <a href="https://itch.io/jam/camgamejam2024" class="submissions-link">
            {submissions} Submissions
          </a>
        </p>
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
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" onclick={prevSlide}>&#9664;</button>
        <div class="carousel">
          <div
            class="carousel-track"
            style="transform: translateX(-{currentIndex * 100}%)"
          >
            {#each games as game}
              <a href={game.link} class="game-card">
                <div class="game-image-wrapper">
                  <img src={game.src} alt={game.alt} class="game-image" />
                </div>
                <div class="game-info">
                  <h3 class="game-title">{game.title}</h3>
                  {#if game.prize}
                    <p class="game-prize">{game.prize}</p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        </div>
        <button class="carousel-btn next" onclick={nextSlide}>&#9654;</button>
      </div>
      <div class="carousel-dots">
        {#each games as _, index}
          <button
            class="dot"
            class:active={index === currentIndex}
            onclick={() => (currentIndex = index)}
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    </section>

    <section class="gallery-section">
      <h2 class="section-title">Memories</h2>
      <div class="gallery-grid">
        <div class="gallery-item large">
          <img
            src="/2024/group-photo.jpg"
            alt="Participants at Cambridge Game Jam 2024"
          />
        </div>
      </div>
      <p class="section-text gallery-caption">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </section>

    <nav class="back-nav">
      <a href="/" class="back-link">
        <span class="back-arrow">←</span>
        <span>Back to Main</span>
      </a>
    </nav>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .page-wrapper {
    min-height: 100vh;
    position: relative;
    font-family: "Space Grotesk", sans-serif;
    background: #0f0f1a;
    color: #e2e8f0;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .content-overlay {
    position: relative;
    z-index: 10;
    padding-bottom: 4rem;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(15, 15, 26, 0.4) 50%,
      rgba(15, 15, 26, 0.8) 100%
    );
  }

  .logo-wrapper {
    margin-bottom: 2rem;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5));
    animation: float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .hero-text {
    max-width: 600px;
  }

  .main-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
  }

  .date-text {
    font-size: 1.5rem;
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    margin-bottom: 1.5rem;
  }

  .theme-label {
    color: #a78bfa;
    font-weight: 500;
  }

  .theme-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #e879f9;
  }

  .submissions-text {
    margin-top: 1rem;
  }

  .submissions-link {
    color: #8b5cf6;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .submissions-link:hover {
    color: #a78bfa;
    text-decoration: underline;
  }

  .about-section,
  .games-section,
  .gallery-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 4rem 2rem;
    background: rgba(15, 15, 26, 0.85);
    backdrop-filter: blur(10px);
  }

  .section-title {
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 2rem;
    color: #a78bfa;
  }

  .section-text {
    text-align: center;
    color: #94a3b8;
    line-height: 1.8;
    max-width: 700px;
    margin: 0 auto;
  }

  .carousel-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .carousel {
    flex: 1;
    overflow: hidden;
    border-radius: 1rem;
  }

  .carousel-track {
    display: flex;
    transition: transform 0.5s ease;
  }

  .game-card {
    flex: 0 0 100%;
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .game-image-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    aspect-ratio: 16 / 9;
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .game-card:hover .game-image {
    transform: scale(1.05);
  }

  .game-info {
    text-align: center;
    padding: 1.5rem;
  }

  .game-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
  }

  .game-prize {
    color: #e879f9;
    font-weight: 500;
  }

  .carousel-btn {
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #a78bfa;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .carousel-btn:hover {
    background: rgba(139, 92, 246, 0.4);
    border-color: #a78bfa;
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.3);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #a78bfa;
    transform: scale(1.2);
  }

  .gallery-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .gallery-item {
    border-radius: 1rem;
    overflow: hidden;
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .gallery-item:hover img {
    transform: scale(1.02);
  }

  .gallery-item.large {
    aspect-ratio: 16 / 9;
  }

  .gallery-caption {
    margin-top: 1rem;
  }

  .back-nav {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 100;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(15, 15, 26, 0.95);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 9999px;
    color: #a78bfa;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .back-link:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: #a78bfa;
    transform: translateY(-2px);
  }

  .back-arrow {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .main-title {
      font-size: 2rem;
    }

    .logo {
      width: 150px;
      height: 150px;
    }

    .hero-section {
      padding: 1rem;
    }

    .about-section,
    .games-section,
    .gallery-section {
      padding: 2rem 1rem;
    }

    .carousel-btn {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }
</style>
