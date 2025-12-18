<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

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
  let THREE;
  let scene, camera, renderer, clock;
  let crystals = [];
  let mirrorPlane;
  let floatingParticles;
  let animationId;
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  let heroVisible = $state(false);
  let titleVisible = $state(false);
  let themeVisible = $state(false);
  let cardsVisible = $state(Array(games.length).fill(false));
  let statsVisible = $state(false);

  function createLowPolyCrystal(size, color) {
    const geometry = new THREE.OctahedronGeometry(size, 0);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      flatShading: true,
      shininess: 100,
      transparent: true,
      opacity: 0.85,
    });
    return new THREE.Mesh(geometry, material);
  }

  function createMirrorSurface() {
    const geometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] = Math.sin(positions[i] * 0.3) * Math.cos(positions[i + 1] * 0.3) * 0.5;
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      flatShading: true,
      shininess: 150,
      specular: 0x4a90d9,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -5;
    return plane;
  }

  function createParticleSystem() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 1.0;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.3;
        colors[i * 3 + 2] = 0.9;
      } else {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.7;
      }
      
      sizes[i] = Math.random() * 0.3 + 0.1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);
    canvasContainer.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x6699ff, 1);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const accentLight1 = new THREE.PointLight(0xff6699, 1.5, 50);
    accentLight1.position.set(-15, 10, -10);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x66ffcc, 1.5, 50);
    accentLight2.position.set(15, 5, 10);
    scene.add(accentLight2);

    const accentLight3 = new THREE.PointLight(0x9966ff, 1, 40);
    accentLight3.position.set(0, 15, -5);
    scene.add(accentLight3);

    mirrorPlane = createMirrorSurface();
    scene.add(mirrorPlane);

    const crystalConfigs = [
      { pos: [0, 4, 0], size: 2.5, color: 0x6699ff },
      { pos: [-8, 2, -5], size: 1.5, color: 0xff6699 },
      { pos: [7, 3, -8], size: 1.8, color: 0x66ffcc },
      { pos: [-5, 1, 8], size: 1.2, color: 0x9966ff },
      { pos: [10, 2, 5], size: 1.4, color: 0xffcc66 },
      { pos: [-12, 3, 0], size: 1.6, color: 0x66ccff },
      { pos: [4, 5, -12], size: 2.0, color: 0xff99cc },
      { pos: [-3, 1.5, -10], size: 1.3, color: 0xcc99ff },
    ];

    crystalConfigs.forEach((config) => {
      const crystal = createLowPolyCrystal(config.size, config.color);
      crystal.position.set(...config.pos);
      crystal.userData = {
        originalY: config.pos[1],
        rotSpeed: Math.random() * 0.5 + 0.2,
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatAmount: Math.random() * 0.5 + 0.3,
      };
      scene.add(crystal);
      crystals.push(crystal);

      const reflection = createLowPolyCrystal(config.size, config.color);
      reflection.position.set(config.pos[0], -config.pos[1] - 10, config.pos[2]);
      reflection.scale.y = -1;
      reflection.material = crystal.material.clone();
      reflection.material.opacity = 0.4;
      reflection.userData = { ...crystal.userData, isReflection: true, parent: crystal };
      scene.add(reflection);
      crystals.push(reflection);
    });

    floatingParticles = createParticleSystem();
    scene.add(floatingParticles);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    crystals.forEach((crystal) => {
      if (!crystal.userData.isReflection) {
        crystal.rotation.y += crystal.userData.rotSpeed * 0.01;
        crystal.rotation.x = Math.sin(time * crystal.userData.floatSpeed) * 0.1;
        crystal.position.y = crystal.userData.originalY + Math.sin(time * crystal.userData.floatSpeed) * crystal.userData.floatAmount;
      } else {
        const parent = crystal.userData.parent;
        crystal.rotation.y = parent.rotation.y;
        crystal.rotation.x = -parent.rotation.x;
        crystal.position.y = -parent.position.y - 10;
      }
    });

    const positions = floatingParticles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + i) * 0.002;
      if (positions[i + 1] > 35) positions[i + 1] = -5;
    }
    floatingParticles.geometry.attributes.position.needsUpdate = true;
    floatingParticles.rotation.y = time * 0.02;

    const mirrorPositions = mirrorPlane.geometry.attributes.position.array;
    for (let i = 0; i < mirrorPositions.length; i += 3) {
      const x = mirrorPositions[i];
      const y = mirrorPositions[i + 1];
      mirrorPositions[i + 2] = Math.sin(x * 0.3 + time * 0.5) * Math.cos(y * 0.3 + time * 0.3) * 0.5;
    }
    mirrorPlane.geometry.attributes.position.needsUpdate = true;
    mirrorPlane.geometry.computeVertexNormals();

    camera.position.x = Math.sin(time * 0.1) * 2 + mouseX * 5;
    camera.position.y = 8 + Math.cos(time * 0.15) * 1 + mouseY * 2 - scrollY * 0.01;
    camera.position.z = 20 + Math.sin(time * 0.08) * 2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  onMount(async () => {
    if (!browser) return;
    THREE = await import("three");
    initThree();
    animate();

    setTimeout(() => { heroVisible = true; }, 100);
    setTimeout(() => { titleVisible = true; }, 400);
    setTimeout(() => { themeVisible = true; }, 800);
    setTimeout(() => { statsVisible = true; }, 1000);
    
    games.forEach((_, i) => {
      setTimeout(() => {
        cardsVisible[i] = true;
        cardsVisible = cardsVisible;
      }, 1200 + i * 150);
    });
  });

  onDestroy(() => {
    if (!browser) return;
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
    }
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("scroll", handleScroll);
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="page-wrapper">
  <div class="canvas-container" bind:this={canvasContainer}></div>
  
  <section class="hero-section" class:visible={heroVisible}>
    <div class="hero-content">
      <div class="logo-container" class:visible={titleVisible}>
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="main-logo" />
        <div class="logo-reflection"></div>
      </div>
      
      <h1 class="main-title" class:visible={titleVisible}>
        <span class="title-line">Cambridge</span>
        <span class="title-line accent">Game Jam</span>
        <span class="title-line year">2024</span>
      </h1>
      
      <div class="theme-badge" class:visible={themeVisible}>
        <div class="theme-icon">◇</div>
        <span class="theme-label">Theme</span>
        <span class="theme-text">{theme}</span>
        <div class="theme-icon">◇</div>
      </div>
      
      <div class="event-details" class:visible={statsVisible}>
        <div class="detail-item">
          <span class="detail-value">{duration}</span>
          <span class="detail-label">Event Duration</span>
        </div>
        <div class="detail-divider"></div>
        <div class="detail-item">
          <span class="detail-value">{submissions}</span>
          <span class="detail-label">Games Created</span>
        </div>
      </div>
      
      <div class="scroll-indicator">
        <span>Explore Winners</span>
        <div class="scroll-arrow"></div>
      </div>
    </div>
  </section>

  <section class="games-section">
    <h2 class="section-title">
      <span class="title-decoration">★</span>
      Featured Games
      <span class="title-decoration">★</span>
    </h2>
    
    <div class="games-grid">
      {#each games as game, i}
        <a href={game.link} class="game-card" class:visible={cardsVisible[i]} target="_blank" rel="noopener noreferrer" style="--delay: {i * 0.1}s">
          <div class="card-inner">
            <div class="card-image-wrapper">
              <img src={game.src} alt={game.alt} class="card-image" />
              <div class="card-image-reflection">
                <img src={game.src} alt="" />
              </div>
              <div class="card-overlay"></div>
              <div class="card-shine"></div>
            </div>
            <div class="card-content">
              <h3 class="game-title">{game.title}</h3>
              {#if game.prize}
                <div class="prize-badge">
                  <span class="prize-icon">🏆</span>
                  <span class="prize-text">{game.prize}</span>
                </div>
              {/if}
            </div>
            <div class="card-border"></div>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <section class="stats-section">
    <div class="stats-container">
      <div class="stat-item">
        <div class="stat-number">48</div>
        <div class="stat-label">Hours</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{submissions}</div>
        <div class="stat-label">Games</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">100+</div>
        <div class="stat-label">Participants</div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="cta-content">
      <h2>Lorem Ipsum Dolor</h2>
      <p>Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <a href="https://itch.io/jam/camgamejam2024" class="cta-button" target="_blank" rel="noopener noreferrer">
        <span>View All Submissions</span>
        <div class="button-shine"></div>
      </a>
    </div>
  </section>

  <section class="back-section">
    <a href="/archive" class="back-link">
      <span class="back-arrow">←</span>
      <span>Back to Archive</span>
    </a>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #0a0a1a;
    color: #fff;
    font-family: 'Rajdhani', sans-serif;
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
  }

  .canvas-container :global(canvas) {
    display: block;
  }

  .hero-section {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s ease, transform 1s ease;
  }

  .hero-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-content {
    text-align: center;
    max-width: 900px;
  }

  .logo-container {
    position: relative;
    margin-bottom: 2rem;
    opacity: 0;
    transform: scale(0.8) rotateX(20deg);
    transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
  }

  .logo-container.visible {
    opacity: 1;
    transform: scale(1) rotateX(0);
  }

  .main-logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(102, 153, 255, 0.5));
    animation: logoFloat 4s ease-in-out infinite, logoPulse 2s ease-in-out infinite;
  }

  .logo-reflection {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%) scaleY(-1);
    width: 200px;
    height: 100px;
    background: linear-gradient(to bottom, rgba(102, 153, 255, 0.3), transparent);
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
    -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
    filter: blur(2px);
  }

  @keyframes logoFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }

  @keyframes logoPulse {
    0%, 100% { filter: drop-shadow(0 0 30px rgba(102, 153, 255, 0.5)); }
    50% { filter: drop-shadow(0 0 50px rgba(102, 153, 255, 0.8)); }
  }

  .main-title {
    margin: 0 0 2rem 0;
    font-family: 'Orbitron', sans-serif;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }

  .main-title.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .title-line {
    display: block;
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.8);
    animation: titleGlow 3s ease-in-out infinite;
  }

  .title-line.accent {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 900;
    letter-spacing: 0.1em;
    background: linear-gradient(135deg, #6699ff, #ff6699, #66ffcc);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 4s ease-in-out infinite, titleGlow 3s ease-in-out infinite;
    text-shadow: none;
    filter: drop-shadow(0 0 30px rgba(102, 153, 255, 0.5));
  }

  .title-line.year {
    font-size: clamp(3rem, 10vw, 6rem);
    font-weight: 900;
    letter-spacing: 0.2em;
    color: #fff;
    text-shadow: 0 0 40px rgba(102, 153, 255, 0.8);
  }

  @keyframes titleGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(102, 153, 255, 0.3); }
    50% { text-shadow: 0 0 40px rgba(102, 153, 255, 0.6); }
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, rgba(102, 153, 255, 0.2), rgba(255, 102, 153, 0.2));
    border: 2px solid rgba(102, 153, 255, 0.4);
    border-radius: 50px;
    margin-bottom: 2rem;
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.6s ease, transform 0.6s ease;
    animation: badgePulse 3s ease-in-out infinite;
  }

  .theme-badge.visible {
    opacity: 1;
    transform: scale(1);
  }

  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 0 20px rgba(102, 153, 255, 0.2); }
    50% { box-shadow: 0 0 40px rgba(102, 153, 255, 0.4); }
  }

  .theme-icon {
    font-size: 1.5rem;
    color: #6699ff;
    animation: iconRotate 4s linear infinite;
  }

  @keyframes iconRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .theme-label {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.6);
  }

  .theme-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(90deg, #6699ff, #ff6699);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .event-details {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 3rem;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .event-details.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .detail-item {
    text-align: center;
  }

  .detail-value {
    display: block;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }

  .detail-label {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.5);
  }

  .detail-divider {
    width: 2px;
    height: 40px;
    background: linear-gradient(to bottom, transparent, rgba(102, 153, 255, 0.5), transparent);
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    animation: bounce 2s ease-in-out infinite;
  }

  .scroll-indicator span {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.5);
  }

  .scroll-arrow {
    width: 24px;
    height: 24px;
    border-right: 2px solid rgba(255, 255, 255, 0.5);
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
    transform: rotate(45deg);
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
  }

  .games-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(to bottom, transparent, rgba(10, 10, 26, 0.95) 20%);
  }

  .section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(1.8rem, 4vw, 3rem);
    text-align: center;
    margin-bottom: 4rem;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
  }

  .title-decoration {
    color: #6699ff;
    animation: starPulse 2s ease-in-out infinite;
  }

  @keyframes starPulse {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.3) rotate(180deg); opacity: 0.7; }
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
    opacity: 0;
    transform: translateY(50px) rotateX(10deg);
    transition: opacity 0.6s ease var(--delay), transform 0.6s ease var(--delay);
    text-decoration: none;
    perspective: 1000px;
  }

  .game-card.visible {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }

  .card-inner {
    position: relative;
    background: linear-gradient(145deg, rgba(30, 30, 50, 0.8), rgba(20, 20, 35, 0.9));
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.5s ease, box-shadow 0.5s ease;
  }

  .game-card:hover .card-inner {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 30px 60px rgba(102, 153, 255, 0.3);
  }

  .card-image-wrapper {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .game-card:hover .card-image {
    transform: scale(1.1);
  }

  .card-image-reflection {
    position: absolute;
    bottom: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scaleY(-1);
    opacity: 0.3;
    mask-image: linear-gradient(to bottom, transparent, rgba(0,0,0,0.5));
    -webkit-mask-image: linear-gradient(to bottom, transparent, rgba(0,0,0,0.5));
  }

  .card-image-reflection img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(10, 10, 26, 0.9));
  }

  .card-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  .game-card:hover .card-shine {
    transform: translateX(100%);
  }

  .card-content {
    padding: 1.5rem;
    position: relative;
  }

  .game-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    color: #fff;
    transition: color 0.3s ease;
  }

  .game-card:hover .game-title {
    color: #6699ff;
  }

  .prize-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: linear-gradient(135deg, rgba(255, 204, 102, 0.2), rgba(255, 153, 102, 0.2));
    border: 1px solid rgba(255, 204, 102, 0.4);
    border-radius: 20px;
    animation: prizeGlow 2s ease-in-out infinite;
  }

  @keyframes prizeGlow {
    0%, 100% { box-shadow: 0 0 10px rgba(255, 204, 102, 0.2); }
    50% { box-shadow: 0 0 20px rgba(255, 204, 102, 0.4); }
  }

  .prize-icon {
    font-size: 1rem;
  }

  .prize-text {
    font-size: 0.85rem;
    color: #ffcc66;
  }

  .card-border {
    position: absolute;
    inset: 0;
    border: 2px solid transparent;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(102, 153, 255, 0.3), rgba(255, 102, 153, 0.3)) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .game-card:hover .card-border {
    opacity: 1;
  }

  .stats-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: rgba(10, 10, 26, 0.95);
  }

  .stats-container {
    display: flex;
    justify-content: center;
    gap: 4rem;
    flex-wrap: wrap;
  }

  .stat-item {
    text-align: center;
    animation: statFloat 3s ease-in-out infinite;
  }

  .stat-item:nth-child(2) {
    animation-delay: 0.5s;
  }

  .stat-item:nth-child(3) {
    animation-delay: 1s;
  }

  @keyframes statFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .stat-number {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(3rem, 8vw, 5rem);
    font-weight: 900;
    background: linear-gradient(135deg, #6699ff, #66ffcc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    filter: drop-shadow(0 0 20px rgba(102, 153, 255, 0.5));
  }

  .stat-label {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.6);
  }

  .cta-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(to bottom, rgba(10, 10, 26, 0.95), rgba(20, 20, 40, 0.95));
    text-align: center;
  }

  .cta-content h2 {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #fff, #6699ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cta-content p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }

  .cta-button {
    position: relative;
    display: inline-block;
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #6699ff, #9966ff);
    border: none;
    border-radius: 50px;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    animation: buttonPulse 2s ease-in-out infinite;
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(102, 153, 255, 0.4);
  }

  @keyframes buttonPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(102, 153, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(102, 153, 255, 0.5); }
  }

  .button-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
    transform: translateX(-100%);
    animation: buttonShine 3s ease-in-out infinite;
  }

  @keyframes buttonShine {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  .back-section {
    position: relative;
    z-index: 1;
    padding: 3rem 2rem;
    background: rgba(10, 10, 26, 0.98);
    text-align: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    background: rgba(102, 153, 255, 0.1);
    border-color: #6699ff;
    color: #fff;
  }

  .back-arrow {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }

  .back-link:hover .back-arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 1rem;
      min-height: auto;
      padding-top: 4rem;
    }

    .main-logo {
      width: 150px;
      height: 150px;
    }

    .theme-badge {
      padding: 0.75rem 1.5rem;
      gap: 0.5rem;
    }

    .theme-text {
      font-size: 1.4rem;
    }

    .event-details {
      flex-direction: column;
      gap: 1rem;
    }

    .detail-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(102, 153, 255, 0.5), transparent);
    }

    .games-grid {
      grid-template-columns: 1fr;
    }

    .stats-container {
      gap: 2rem;
    }
  }
</style>
