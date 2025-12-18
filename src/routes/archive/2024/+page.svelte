<script>
  import { onMount, onDestroy } from "svelte";

  let canvasContainer;
  let scene, camera, renderer, clock;
  let mirrorGroup, lowPolyShapes = [];
  let animationId;
  let scrollY = 0;
  let innerHeight = 0;
  let innerWidth = 0;
  let THREE;

  const games = [
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

  function createLowPolyGeometry(type) {
    if (!THREE) return null;
    switch (type) {
      case 0:
        return new THREE.IcosahedronGeometry(1, 0);
      case 1:
        return new THREE.OctahedronGeometry(1, 0);
      case 2:
        return new THREE.TetrahedronGeometry(1, 0);
      case 3:
        return new THREE.DodecahedronGeometry(1, 0);
      default:
        return new THREE.IcosahedronGeometry(1, 0);
    }
  }

  function createMirrorPlane() {
    if (!THREE) return null;
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      shininess: 100,
      specular: 0x6a5acd,
    });
    return new THREE.Mesh(geometry, material);
  }

  async function initThree() {
    THREE = await import("three");
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);

    camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 2;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);
    canvasContainer.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6a5acd, 2, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 2, 50);
    pointLight2.position.set(-10, -5, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x4ecdc4, 1.5, 50);
    pointLight3.position.set(0, 15, -10);
    scene.add(pointLight3);

    mirrorGroup = new THREE.Group();
    scene.add(mirrorGroup);

    const mirror1 = createMirrorPlane();
    mirror1.position.set(-8, 0, -5);
    mirror1.rotation.y = Math.PI / 6;
    mirrorGroup.add(mirror1);

    const mirror2 = createMirrorPlane();
    mirror2.position.set(8, 0, -5);
    mirror2.rotation.y = -Math.PI / 6;
    mirrorGroup.add(mirror2);

    const mirror3 = createMirrorPlane();
    mirror3.position.set(0, -8, -3);
    mirror3.rotation.x = -Math.PI / 4;
    mirrorGroup.add(mirror3);

    const colors = [0x6a5acd, 0xff6b9d, 0x4ecdc4, 0xffd93d, 0xa855f7];
    for (let i = 0; i < 40; i++) {
      const geometry = createLowPolyGeometry(i % 4);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        flatShading: true,
        transparent: true,
        opacity: 0.8,
        shininess: 80,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const scale = Math.random() * 0.8 + 0.3;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 5
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.userData = {
        originalY: mesh.position.y,
        rotSpeed: Math.random() * 0.02 + 0.005,
        floatSpeed: Math.random() * 0.5 + 0.3,
        floatAmplitude: Math.random() * 1 + 0.5,
        phase: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      lowPolyShapes.push(mesh);
    }

    for (let i = 0; i < 25; i++) {
      const geometry = createLowPolyGeometry(i % 4);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        flatShading: true,
        transparent: true,
        opacity: 0.4,
        shininess: 80,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const scale = Math.random() * 0.6 + 0.2;
      mesh.scale.set(scale, -scale, scale);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        -((Math.random() - 0.5) * 20) - 10,
        (Math.random() - 0.5) * 20 - 5
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.userData = {
        isReflection: true,
        originalY: mesh.position.y,
        rotSpeed: Math.random() * 0.02 + 0.005,
        floatSpeed: Math.random() * 0.5 + 0.3,
        floatAmplitude: Math.random() * 1 + 0.5,
        phase: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      lowPolyShapes.push(mesh);
    }
  }

  function animate() {
    if (!clock || !camera || !renderer || !scene) return;
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    camera.position.x = Math.sin(elapsed * 0.1) * 2;
    camera.position.y = 2 + Math.cos(elapsed * 0.15) * 1;
    camera.lookAt(0, 0, -5);

    const scrollFactor = scrollY / (innerHeight * 3);
    camera.position.z = 15 - scrollFactor * 5;

    lowPolyShapes.forEach((shape) => {
      const { rotSpeed, floatSpeed, floatAmplitude, phase, originalY, isReflection } = shape.userData;
      shape.rotation.x += rotSpeed;
      shape.rotation.y += rotSpeed * 1.3;
      const floatOffset = Math.sin(elapsed * floatSpeed + phase) * floatAmplitude;
      shape.position.y = originalY + (isReflection ? -floatOffset : floatOffset);
    });

    mirrorGroup.rotation.y = Math.sin(elapsed * 0.2) * 0.1;

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!renderer || !camera) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }

  onMount(async () => {
    innerHeight = window.innerHeight;
    innerWidth = window.innerWidth;
    await initThree();
    animate();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    });
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    window.removeEventListener("resize", handleResize);
  });
</script>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />

<div class="page-2024">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <section class="hero">
    <div class="hero-content">
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        <div class="logo-reflection">
          <img src="/2024/logo.png" alt="" class="logo" />
        </div>
      </div>
      <h1 class="title">
        <span class="title-main">Cambridge Game Jam</span>
        <span class="title-year">2024</span>
      </h1>
      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-text">Reflection</span>
      </div>
      <div class="event-details">
        <div class="detail">
          <span class="detail-icon">📅</span>
          <span class="detail-text">9th - 11th February</span>
        </div>
        <div class="detail">
          <span class="detail-icon">🎮</span>
          <span class="detail-text">23 Submissions</span>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
        <span>Scroll to Explore</span>
      </div>
    </div>
  </section>

  <section class="about-section">
    <div class="section-container">
      <h2 class="section-title">
        <span class="title-decoration">✦</span>
        About the Jam
        <span class="title-decoration">✦</span>
      </h2>
      <div class="about-grid">
        <div class="about-card">
          <div class="card-icon">🎯</div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
        <div class="about-card">
          <div class="card-icon">💡</div>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
        <div class="about-card">
          <div class="card-icon">🏆</div>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="games-section">
    <div class="section-container">
      <h2 class="section-title">
        <span class="title-decoration">✦</span>
        Featured Games
        <span class="title-decoration">✦</span>
      </h2>
      <div class="games-grid">
        {#each games as game, i}
          <a
            href={game.link}
            target="_blank"
            rel="noopener noreferrer"
            class="game-card"
            style="--delay: {i * 0.1}s"
          >
            <div class="game-image-wrapper">
              <img src={game.src} alt={game.title} class="game-image" />
              <div class="game-image-reflection">
                <img src={game.src} alt="" class="game-image" />
              </div>
            </div>
            <div class="game-info">
              <h3 class="game-title">{game.title}</h3>
              <span class="game-prize">{game.prize}</span>
            </div>
            <div class="game-hover-effect"></div>
          </a>
        {/each}
      </div>
      <a
        href="https://itch.io/jam/camgamejam2024"
        target="_blank"
        rel="noopener noreferrer"
        class="all-submissions-btn"
      >
        <span>View All 23 Submissions</span>
        <span class="btn-arrow">→</span>
      </a>
    </div>
  </section>

  <section class="gallery-section">
    <div class="section-container">
      <h2 class="section-title">
        <span class="title-decoration">✦</span>
        Memories
        <span class="title-decoration">✦</span>
      </h2>
      <div class="gallery-wrapper">
        <div class="gallery-frame">
          <img src="/2024/group-photo.jpg" alt="Participants at Cambridge Game Jam 2024" class="gallery-image" />
          <div class="gallery-reflection">
            <img src="/2024/group-photo.jpg" alt="" class="gallery-image" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="stats-section">
    <div class="section-container">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">48</span>
          <span class="stat-label">Hours</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">23</span>
          <span class="stat-label">Games</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">100+</span>
          <span class="stat-label">Participants</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">∞</span>
          <span class="stat-label">Fun</span>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="section-container">
      <h2 class="cta-title">Lorem Ipsum Dolor</h2>
      <p class="cta-text">
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <a href="/archive" class="back-btn">
        <span class="btn-arrow">←</span>
        <span>Back to Archive</span>
      </a>
    </div>
  </section>
</div>

<style>
  .page-2024 {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
    color: #fff;
    font-family: "Lexend", sans-serif;
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
    animation: fadeInUp 1.2s ease-out;
  }

  .logo-container {
    position: relative;
    margin-bottom: 2rem;
    perspective: 1000px;
  }

  .logo {
    width: 180px;
    height: auto;
    filter: drop-shadow(0 0 30px rgba(106, 90, 205, 0.5));
    animation: float 4s ease-in-out infinite, glow 3s ease-in-out infinite alternate;
  }

  .logo-reflection {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    transform: scaleY(-1);
    opacity: 0.3;
    mask-image: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .title-main {
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, #a8a8ff 50%, #6a5acd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s ease-in-out infinite;
    text-shadow: none;
  }

  .title-year {
    font-size: clamp(3rem, 10vw, 7rem);
    font-weight: 900;
    background: linear-gradient(135deg, #ff6b9d 0%, #6a5acd 50%, #4ecdc4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: pulse 2s ease-in-out infinite;
  }

  .theme-badge {
    display: inline-flex;
    flex-direction: column;
    padding: 1rem 2.5rem;
    background: rgba(106, 90, 205, 0.2);
    border: 2px solid rgba(106, 90, 205, 0.5);
    border-radius: 50px;
    margin-bottom: 2rem;
    animation: borderGlow 2s ease-in-out infinite alternate;
    backdrop-filter: blur(10px);
  }

  .theme-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #a8a8ff;
  }

  .theme-text {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #4ecdc4 0%, #6a5acd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .event-details {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 3rem;
  }

  .detail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: slideIn 0.8s ease-out backwards;
  }

  .detail:nth-child(1) {
    animation-delay: 0.3s;
  }

  .detail:nth-child(2) {
    animation-delay: 0.5s;
  }

  .detail-icon {
    font-size: 1.25rem;
  }

  .detail-text {
    font-size: 1rem;
    color: #e0e0ff;
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    animation: bounce 2s ease-in-out infinite;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
  }

  .scroll-arrow {
    width: 24px;
    height: 24px;
    border-right: 2px solid rgba(255, 255, 255, 0.5);
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
    transform: rotate(45deg);
  }

  .section-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .section-title {
    text-align: center;
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #fff 0%, #6a5acd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .title-decoration {
    display: inline-block;
    animation: spin 4s linear infinite;
    margin: 0 1rem;
  }

  .about-section {
    position: relative;
    z-index: 1;
    padding: 6rem 0;
  }

  .about-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .about-card {
    padding: 2rem;
    background: rgba(106, 90, 205, 0.1);
    border: 1px solid rgba(106, 90, 205, 0.3);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: fadeInUp 0.8s ease-out backwards;
  }

  .about-card:nth-child(1) {
    animation-delay: 0.1s;
  }

  .about-card:nth-child(2) {
    animation-delay: 0.2s;
  }

  .about-card:nth-child(3) {
    animation-delay: 0.3s;
  }

  .about-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(106, 90, 205, 0.6);
    box-shadow: 0 20px 40px rgba(106, 90, 205, 0.2);
  }

  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    animation: wiggle 2s ease-in-out infinite;
  }

  .about-card p {
    color: #c0c0e0;
    line-height: 1.7;
    margin: 0;
  }

  .games-section {
    position: relative;
    z-index: 1;
    padding: 6rem 0;
    background: linear-gradient(180deg, transparent 0%, rgba(106, 90, 205, 0.1) 50%, transparent 100%);
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .game-card {
    position: relative;
    display: block;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(26, 26, 46, 0.8);
    border: 1px solid rgba(106, 90, 205, 0.3);
    text-decoration: none;
    color: inherit;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: fadeInUp 0.8s ease-out backwards;
    animation-delay: var(--delay);
  }

  .game-card:hover {
    transform: translateY(-15px) rotateX(5deg);
    border-color: #ff6b9d;
    box-shadow: 0 30px 60px rgba(255, 107, 157, 0.3);
  }

  .game-image-wrapper {
    position: relative;
    overflow: hidden;
  }

  .game-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .game-card:hover .game-image {
    transform: scale(1.1);
  }

  .game-image-reflection {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    transform: scaleY(-1);
    opacity: 0.3;
    mask-image: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%);
    overflow: hidden;
  }

  .game-image-reflection .game-image {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .game-info {
    padding: 1.5rem;
    position: relative;
    z-index: 2;
  }

  .game-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fff 0%, #e0e0ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .game-prize {
    display: inline-block;
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #ff6b9d 0%, #6a5acd 100%);
    border-radius: 20px;
    color: #fff;
  }

  .game-hover-effect {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(106, 90, 205, 0.2) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .game-card:hover .game-hover-effect {
    opacity: 1;
  }

  .all-submissions-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #6a5acd 0%, #ff6b9d 100%);
    border: none;
    border-radius: 50px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: pulse 2s ease-in-out infinite;
  }

  .all-submissions-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(106, 90, 205, 0.4);
  }

  .btn-arrow {
    transition: transform 0.3s ease;
  }

  .all-submissions-btn:hover .btn-arrow {
    transform: translateX(5px);
  }

  .gallery-section {
    position: relative;
    z-index: 1;
    padding: 6rem 0;
  }

  .gallery-wrapper {
    display: flex;
    justify-content: center;
    perspective: 1000px;
  }

  .gallery-frame {
    position: relative;
    max-width: 800px;
    border-radius: 20px;
    overflow: visible;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
    animation: float 5s ease-in-out infinite;
  }

  .gallery-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 20px;
  }

  .gallery-reflection {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 150px;
    transform: scaleY(-1);
    opacity: 0.25;
    mask-image: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%);
    overflow: hidden;
    border-radius: 20px;
  }

  .gallery-reflection .gallery-image {
    position: absolute;
    bottom: 0;
    width: 100%;
  }

  .stats-section {
    position: relative;
    z-index: 1;
    padding: 6rem 0;
    background: linear-gradient(180deg, transparent 0%, rgba(78, 205, 196, 0.1) 50%, transparent 100%);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    text-align: center;
  }

  .stat-card {
    padding: 2rem;
    background: rgba(78, 205, 196, 0.1);
    border: 1px solid rgba(78, 205, 196, 0.3);
    border-radius: 20px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: fadeInUp 0.8s ease-out backwards;
  }

  .stat-card:nth-child(1) {
    animation-delay: 0.1s;
  }

  .stat-card:nth-child(2) {
    animation-delay: 0.2s;
  }

  .stat-card:nth-child(3) {
    animation-delay: 0.3s;
  }

  .stat-card:nth-child(4) {
    animation-delay: 0.4s;
  }

  .stat-card:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: rgba(78, 205, 196, 0.6);
    box-shadow: 0 20px 40px rgba(78, 205, 196, 0.2);
  }

  .stat-number {
    display: block;
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #4ecdc4 0%, #6a5acd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: countUp 1s ease-out;
  }

  .stat-label {
    display: block;
    font-size: 1rem;
    color: #a0a0c0;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 0.5rem;
  }

  .cta-section {
    position: relative;
    z-index: 1;
    padding: 6rem 0;
    text-align: center;
  }

  .cta-title {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #ff6b9d 0%, #ffd93d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cta-text {
    max-width: 600px;
    margin: 0 auto 2rem;
    color: #c0c0e0;
    font-size: 1.1rem;
    line-height: 1.8;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  .back-btn:hover .btn-arrow {
    transform: translateX(-5px);
  }

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

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes glow {
    from {
      filter: drop-shadow(0 0 20px rgba(106, 90, 205, 0.4));
    }
    to {
      filter: drop-shadow(0 0 40px rgba(106, 90, 205, 0.8));
    }
  }

  @keyframes shimmer {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }

  @keyframes borderGlow {
    from {
      box-shadow: 0 0 20px rgba(106, 90, 205, 0.2);
    }
    to {
      box-shadow: 0 0 40px rgba(106, 90, 205, 0.5);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(10px);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes wiggle {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-5deg);
    }
    75% {
      transform: rotate(5deg);
    }
  }

  @keyframes countUp {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 768px) {
    .hero {
      padding: 1rem;
    }

    .logo {
      width: 120px;
    }

    .theme-badge {
      padding: 0.75rem 1.5rem;
    }

    .event-details {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-number {
      font-size: 2rem;
    }
  }
</style>
