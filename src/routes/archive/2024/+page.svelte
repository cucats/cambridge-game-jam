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
    {
      src: "/2024/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2024",
      title: "All Submissions",
      prize: "",
    },
  ];

  let canvasContainer;
  let scene, camera, renderer, animationId;
  let mirrorMeshes = [];
  let floatingGems = [];
  let time = 0;

  let activeGame = $state(0);
  let isVisible = $state(false);
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
    scene.fog = new THREE.Fog(0x0a0a1a, 5, 25);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 8;
    camera.position.y = 2;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff6b9d, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 20);
    pointLight1.position.set(-5, 3, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 20);
    pointLight2.position.set(5, -3, 0);
    scene.add(pointLight2);

    const mirrorColors = [0xff6b9d, 0x00ffff, 0xffaa00, 0x00ff88, 0xff00ff];
    for (let i = 0; i < 15; i++) {
      const geometry = createLowPolyGeometry();
      const material = createMirrorMaterial(
        mirrorColors[i % mirrorColors.length],
      );
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (Math.random() - 0.5) * 20;
      mesh.position.y = (Math.random() - 0.5) * 15;
      mesh.position.z = (Math.random() - 0.5) * 10 - 5;

      const scale = Math.random() * 0.8 + 0.3;
      mesh.scale.set(scale, scale, scale);

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

      mirrorMeshes.push(mesh);
      scene.add(mesh);
    }

    const gemColors = [0xffffff, 0xff6b9d, 0x00ffff];
    for (let i = 0; i < 50; i++) {
      const geometry = new THREE.OctahedronGeometry(0.1, 0);
      const material = new THREE.MeshPhongMaterial({
        color: gemColors[i % gemColors.length],
        emissive: gemColors[i % gemColors.length],
        emissiveIntensity: 0.3,
        flatShading: true,
      });
      const gem = new THREE.Mesh(geometry, material);

      gem.position.x = (Math.random() - 0.5) * 30;
      gem.position.y = (Math.random() - 0.5) * 20;
      gem.position.z = (Math.random() - 0.5) * 15 - 5;

      gem.userData = {
        speed: Math.random() * 0.03 + 0.01,
        amplitude: Math.random() * 2 + 1,
        offset: Math.random() * Math.PI * 2,
      };

      floatingGems.push(gem);
      scene.add(gem);
    }

    const planeGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      flatShading: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });

    const positions = planeGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, Math.random() * 0.5);
    }

    const reflectionPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    reflectionPlane.rotation.x = -Math.PI / 2;
    reflectionPlane.position.y = -5;
    scene.add(reflectionPlane);

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;

    mirrorMeshes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotationSpeed.x;
      mesh.rotation.y += mesh.userData.rotationSpeed.y;
      mesh.rotation.z += mesh.userData.rotationSpeed.z;

      mesh.position.y =
        mesh.userData.originalY +
        Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) *
          0.5;
    });

    floatingGems.forEach((gem) => {
      gem.rotation.x += gem.userData.speed;
      gem.rotation.y += gem.userData.speed * 1.5;

      gem.position.y +=
        Math.sin(time * 2 + gem.userData.offset) * gem.userData.speed * 0.5;
    });

    camera.position.x = Math.sin(time * 0.1) * 0.5;
    camera.position.y = 2 + Math.cos(time * 0.15) * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  function nextGame() {
    activeGame = (activeGame + 1) % games.length;
  }

  function prevGame() {
    activeGame = (activeGame - 1 + games.length) % games.length;
  }

  onMount(() => {
    initThreeJS();
    window.addEventListener("resize", handleResize);

    setTimeout(() => (isVisible = true), 100);
    setTimeout(() => (heroVisible = true), 300);
    setTimeout(() => (statsVisible = true), 600);
    setTimeout(() => (gamesVisible = true), 900);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-wrapper">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <div class="content-layer">
    <nav class="navbar" class:visible={isVisible}>
      <a href="/archive" class="back-button">
        <span class="arrow">←</span>
        <span class="text">Archive</span>
      </a>
      <div class="nav-decoration"></div>
    </nav>

    <header class="hero-section" class:visible={heroVisible}>
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        <div class="logo-reflection"></div>
      </div>

      <div class="hero-text">
        <h1 class="title">
          <span class="title-line"
            >{title.split(" ").slice(0, 2).join(" ")}</span
          >
          <span class="title-line accent"
            >{title.split(" ").slice(2).join(" ")}</span
          >
        </h1>
        <p class="date">{duration}</p>
        <div class="theme-badge">
          <span class="theme-label">Theme</span>
          <span class="theme-name">{theme}</span>
        </div>
      </div>
    </header>

    <section class="stats-section" class:visible={statsVisible}>
      <div class="stat-card">
        <span class="stat-number">{submissions}</span>
        <span class="stat-label">Submissions</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">48</span>
        <span class="stat-label">Hours</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">∞</span>
        <span class="stat-label">Creativity</span>
      </div>
    </section>

    <section class="games-section" class:visible={gamesVisible}>
      <h2 class="section-title">
        <span class="title-decoration left"></span>
        Featured Games
        <span class="title-decoration right"></span>
      </h2>

      <div class="games-carousel">
        <button class="carousel-btn prev" onclick={prevGame}>
          <span>‹</span>
        </button>

        <div class="games-display">
          {#each games as game, index}
            <a
              href={game.link}
              class="game-card"
              class:active={index === activeGame}
              class:prev={index ===
                (activeGame - 1 + games.length) % games.length}
              class:next={index === (activeGame + 1) % games.length}
            >
              <div class="game-image-container">
                <img src={game.src} alt={game.alt} class="game-image" />
                <div class="image-overlay"></div>
                <div class="image-reflection"></div>
              </div>
              <div class="game-info">
                <h3 class="game-title">{game.title}</h3>
                {#if game.prize}
                  <span class="game-prize">{game.prize}</span>
                {/if}
              </div>
            </a>
          {/each}
        </div>

        <button class="carousel-btn next" onclick={nextGame}>
          <span>›</span>
        </button>
      </div>

      <div class="carousel-indicators">
        {#each games as _, index}
          <button
            class="indicator"
            class:active={index === activeGame}
            onclick={() => (activeGame = index)}
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    </section>

    <section class="about-section" class:visible={gamesVisible}>
      <div class="about-content">
        <h2 class="section-title">
          <span class="title-decoration left"></span>
          About The Jam
          <span class="title-decoration right"></span>
        </h2>
        <p class="about-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <div class="about-stats">
          <div class="about-stat">
            <span class="icon">🎮</span>
            <span class="label">Lorem Ipsum</span>
          </div>
          <div class="about-stat">
            <span class="icon">🏆</span>
            <span class="label">Dolor Sit</span>
          </div>
          <div class="about-stat">
            <span class="icon">👥</span>
            <span class="label">Amet Consectetur</span>
          </div>
        </div>
      </div>
    </section>

    <section class="gallery-section" class:visible={gamesVisible}>
      <h2 class="section-title">
        <span class="title-decoration left"></span>
        Memories
        <span class="title-decoration right"></span>
      </h2>
      <div class="gallery-grid">
        <div class="gallery-item large">
          <img src="/2024/group-photo.jpg" alt="Jam participants" />
          <div class="gallery-overlay">
            <span>Lorem ipsum dolor sit amet</span>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section" class:visible={gamesVisible}>
      <div class="cta-content">
        <h2>Lorem Ipsum Dolor</h2>
        <p>Consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
        <a
          href="https://itch.io/jam/camgamejam2024"
          class="cta-button"
          target="_blank"
        >
          <span class="button-text">View All Submissions</span>
          <span class="button-icon">→</span>
        </a>
      </div>
    </section>
  </div>

  <div class="floating-elements">
    {#each Array(20) as _, i}
      <div
        class="floating-particle"
        style="--delay: {i * 0.5}s; --x: {Math.random() *
          100}%; --duration: {5 + Math.random() * 10}s"
      ></div>
    {/each}
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
    background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
    position: relative;
    overflow-x: hidden;
    font-family: "Exo 2", sans-serif;
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

  .content-layer {
    position: relative;
    z-index: 10;
    padding-bottom: 4rem;
  }

  .navbar {
    display: flex;
    align-items: center;
    padding: 1.5rem 2rem;
    opacity: 0;
    transform: translateY(-30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .navbar.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 107, 157, 0.3);
    border-radius: 50px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .back-button:hover {
    background: rgba(255, 107, 157, 0.2);
    border-color: rgba(255, 107, 157, 0.6);
    color: #ff6b9d;
    transform: translateX(-5px);
  }

  .back-button .arrow {
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  .back-button:hover .arrow {
    transform: translateX(-3px);
  }

  .nav-decoration {
    flex: 1;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(255, 107, 157, 0.5),
      transparent 80%
    );
    margin-left: 2rem;
  }

  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    min-height: 60vh;
    text-align: center;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .logo-container {
    position: relative;
    margin-bottom: 2rem;
  }

  .logo {
    width: 280px;
    height: 280px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(255, 107, 157, 0.4));
    animation: logoFloat 6s ease-in-out infinite;
  }

  @keyframes logoFloat {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-15px) rotate(2deg);
    }
    50% {
      transform: translateY(-5px) rotate(0deg);
    }
    75% {
      transform: translateY(-20px) rotate(-2deg);
    }
  }

  .logo-reflection {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%) scaleY(-0.5);
    width: 280px;
    height: 140px;
    background: linear-gradient(
      to bottom,
      rgba(255, 107, 157, 0.15),
      transparent
    );
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3),
      transparent
    );
    border-radius: 50%;
    filter: blur(20px);
    animation: reflectionPulse 6s ease-in-out infinite;
  }

  @keyframes reflectionPulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    line-height: 1.1;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .title-line {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    text-shadow:
      0 0 40px rgba(255, 255, 255, 0.3),
      0 0 80px rgba(255, 107, 157, 0.2);
    animation: titleGlow 3s ease-in-out infinite alternate;
  }

  .title-line.accent {
    color: #ff6b9d;
    text-shadow:
      0 0 40px rgba(255, 107, 157, 0.6),
      0 0 80px rgba(255, 107, 157, 0.4);
  }

  @keyframes titleGlow {
    0% {
      filter: brightness(1);
    }
    100% {
      filter: brightness(1.2);
    }
  }

  .date {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-weight: 300;
    letter-spacing: 0.2em;
    animation: dateSlide 1s ease-out 0.5s both;
  }

  @keyframes dateSlide {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .theme-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1.5rem;
    padding: 1.5rem 3rem;
    background: linear-gradient(
      135deg,
      rgba(255, 107, 157, 0.15),
      rgba(0, 255, 255, 0.1)
    );
    border: 2px solid rgba(255, 107, 157, 0.4);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    animation: badgePulse 4s ease-in-out infinite;
  }

  @keyframes badgePulse {
    0%,
    100% {
      box-shadow:
        0 0 20px rgba(255, 107, 157, 0.3),
        inset 0 0 20px rgba(255, 107, 157, 0.1);
    }
    50% {
      box-shadow:
        0 0 40px rgba(255, 107, 157, 0.5),
        inset 0 0 30px rgba(255, 107, 157, 0.2);
    }
  }

  .theme-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.5rem;
  }

  .theme-name {
    font-family: "Orbitron", sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ff6b9d, #00ffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stats-section {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 3rem 2rem;
    flex-wrap: wrap;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .stats-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 3rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 107, 157, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    transition: all 0.4s ease;
    animation: statFloat 5s ease-in-out infinite;
  }

  .stat-card:nth-child(2) {
    animation-delay: 0.3s;
  }

  .stat-card:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes statFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .stat-card:hover {
    background: rgba(255, 107, 157, 0.1);
    border-color: rgba(255, 107, 157, 0.5);
    transform: translateY(-5px) scale(1.05);
  }

  .stat-number {
    font-family: "Orbitron", sans-serif;
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #ff6b9d, #00ffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    font-family: "Orbitron", sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: white;
    text-align: center;
    margin-bottom: 3rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .title-decoration {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ff6b9d, transparent);
    animation: decorationPulse 2s ease-in-out infinite;
  }

  .title-decoration.left {
    background: linear-gradient(90deg, transparent, #ff6b9d);
  }

  .title-decoration.right {
    background: linear-gradient(90deg, #ff6b9d, transparent);
  }

  @keyframes decorationPulse {
    0%,
    100% {
      opacity: 0.5;
      width: 60px;
    }
    50% {
      opacity: 1;
      width: 80px;
    }
  }

  .games-section {
    padding: 4rem 2rem;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .games-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .games-carousel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }

  .carousel-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid rgba(255, 107, 157, 0.4);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .carousel-btn:hover {
    background: rgba(255, 107, 157, 0.3);
    border-color: #ff6b9d;
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(255, 107, 157, 0.4);
  }

  .games-display {
    position: relative;
    width: 100%;
    max-width: 600px;
    height: 450px;
    perspective: 1000px;
  }

  .game-card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90%;
    max-width: 400px;
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    text-decoration: none;
    pointer-events: none;
  }

  .game-card.active {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    z-index: 10;
    pointer-events: all;
  }

  .game-card.prev {
    transform: translate(-120%, -50%) scale(0.8) rotateY(25deg);
    opacity: 0.5;
    z-index: 5;
  }

  .game-card.next {
    transform: translate(20%, -50%) scale(0.8) rotateY(-25deg);
    opacity: 0.5;
    z-index: 5;
  }

  .game-image-container {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.5),
      0 0 40px rgba(255, 107, 157, 0.2);
  }

  .game-image {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }

  .game-card.active:hover .game-image {
    transform: scale(1.05);
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0, 0, 0, 0.8) 100%
    );
    pointer-events: none;
  }

  .image-reflection {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(255, 107, 157, 0.1), transparent);
    pointer-events: none;
    animation: reflectionShimmer 3s ease-in-out infinite;
  }

  @keyframes reflectionShimmer {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }

  .game-info {
    padding: 1.5rem;
    background: rgba(10, 10, 26, 0.9);
    border-radius: 0 0 20px 20px;
    border: 1px solid rgba(255, 107, 157, 0.2);
    border-top: none;
    backdrop-filter: blur(10px);
  }

  .game-title {
    font-family: "Orbitron", sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.5rem;
    text-shadow: 0 0 20px rgba(255, 107, 157, 0.4);
  }

  .game-prize {
    display: inline-block;
    font-size: 0.85rem;
    color: #00ffff;
    padding: 0.35rem 1rem;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 50px;
    animation: prizePulse 2s ease-in-out infinite;
  }

  @keyframes prizePulse {
    0%,
    100% {
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
    }
    50% {
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
    }
  }

  .carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 107, 157, 0.4);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }

  .indicator.active {
    background: #ff6b9d;
    border-color: #ff6b9d;
    box-shadow: 0 0 15px rgba(255, 107, 157, 0.6);
    transform: scale(1.2);
  }

  .indicator:hover:not(.active) {
    border-color: #ff6b9d;
    background: rgba(255, 107, 157, 0.3);
  }

  .about-section {
    padding: 4rem 2rem;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
  }

  .about-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .about-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .about-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
  }

  .about-stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .about-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .about-stat .icon {
    font-size: 2.5rem;
    animation: iconBounce 2s ease-in-out infinite;
  }

  .about-stat:nth-child(2) .icon {
    animation-delay: 0.3s;
  }

  .about-stat:nth-child(3) .icon {
    animation-delay: 0.6s;
  }

  @keyframes iconBounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .about-stat .label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .gallery-section {
    padding: 4rem 2rem;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
  }

  .gallery-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .gallery-grid {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    gap: 1.5rem;
  }

  .gallery-item {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.4s ease;
  }

  .gallery-item.large {
    aspect-ratio: 16/9;
  }

  .gallery-item:hover {
    transform: scale(1.02);
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .gallery-item:hover img {
    transform: scale(1.1);
  }

  .gallery-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10, 10, 26, 0.9) 0%,
      transparent 50%
    );
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
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .cta-section {
    padding: 6rem 2rem;
    text-align: center;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
  }

  .cta-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-content h2 {
    font-family: "Orbitron", sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 0 0 30px rgba(255, 107, 157, 0.4);
  }

  .cta-content p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 2.5rem;
    background: linear-gradient(135deg, #ff6b9d, #ff8a80);
    color: white;
    text-decoration: none;
    font-family: "Orbitron", sans-serif;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 50px;
    transition: all 0.4s ease;
    box-shadow:
      0 10px 30px rgba(255, 107, 157, 0.4),
      0 0 60px rgba(255, 107, 157, 0.2);
    animation: ctaPulse 3s ease-in-out infinite;
  }

  @keyframes ctaPulse {
    0%,
    100% {
      box-shadow:
        0 10px 30px rgba(255, 107, 157, 0.4),
        0 0 60px rgba(255, 107, 157, 0.2);
    }
    50% {
      box-shadow:
        0 15px 40px rgba(255, 107, 157, 0.6),
        0 0 80px rgba(255, 107, 157, 0.4);
    }
  }

  .cta-button:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow:
      0 20px 50px rgba(255, 107, 157, 0.5),
      0 0 100px rgba(255, 107, 157, 0.3);
  }

  .button-icon {
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  .cta-button:hover .button-icon {
    transform: translateX(5px);
  }

  .floating-elements {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  }

  .floating-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 107, 157, 0.6);
    border-radius: 50%;
    left: var(--x);
    bottom: -10px;
    animation: floatUp var(--duration) linear infinite;
    animation-delay: var(--delay);
  }

  @keyframes floatUp {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(720deg);
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 1rem;
    }

    .hero-section {
      padding: 2rem 1rem;
      min-height: auto;
    }

    .logo {
      width: 180px;
      height: 180px;
    }

    .title {
      font-size: 1.75rem;
    }

    .date {
      font-size: 1rem;
    }

    .theme-name {
      font-size: 1.75rem;
    }

    .stats-section {
      gap: 1rem;
    }

    .stat-card {
      padding: 1.5rem 2rem;
    }

    .stat-number {
      font-size: 2rem;
    }

    .games-carousel {
      flex-direction: column;
      gap: 1rem;
    }

    .carousel-btn {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
    }

    .games-display {
      height: 380px;
    }

    .game-image {
      height: 200px;
    }

    .section-title {
      font-size: 1.25rem;
      gap: 0.75rem;
    }

    .title-decoration {
      width: 30px;
    }

    .about-stats {
      gap: 1.5rem;
    }

    .cta-content h2 {
      font-size: 1.75rem;
    }

    .cta-button {
      padding: 1rem 2rem;
      font-size: 0.9rem;
    }
  }
</style>
