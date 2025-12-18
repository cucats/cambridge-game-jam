<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

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

  let canvas;
  let scrollY = 0;
  let mouseX = 0;
  let mouseY = 0;

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 2);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const mirrorGroup = new THREE.Group();
    scene.add(mirrorGroup);

    const mirrorGeometry = new THREE.OctahedronGeometry(1, 0);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.9,
      roughness: 0.1,
      flatShading: true,
    });

    for (let i = 0; i < 20; i++) {
      const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial.clone());
      mirror.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      mirror.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mirror.scale.setScalar(Math.random() * 0.5 + 0.3);
      mirror.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      };
      mirrorGroup.add(mirror);
    }

    const crystalGroup = new THREE.Group();
    scene.add(crystalGroup);

    const crystalGeometry = new THREE.ConeGeometry(0.3, 1.5, 4);
    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      metalness: 0.8,
      roughness: 0.2,
      flatShading: true,
    });

    for (let i = 0; i < 15; i++) {
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial.clone());
      crystal.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20 - 5
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
      };
      crystalGroup.add(crystal);
    }

    camera.position.z = 8;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      mirrorGroup.children.forEach((mirror) => {
        mirror.rotation.x += mirror.userData.rotationSpeed.x;
        mirror.rotation.y += mirror.userData.rotationSpeed.y;
        mirror.rotation.z += mirror.userData.rotationSpeed.z;
      });

      crystalGroup.children.forEach((crystal) => {
        crystal.rotation.x += crystal.userData.rotationSpeed.x;
        crystal.rotation.y += crystal.userData.rotationSpeed.y;
      });

      mirrorGroup.rotation.y = scrollY * 0.001;
      crystalGroup.rotation.x = scrollY * 0.0005;

      camera.position.x = mouseX * 2;
      camera.position.y = mouseY * 2;
      camera.lookAt(0, 0, 0);

      pointLight1.position.x = Math.sin(Date.now() * 0.001) * 8;
      pointLight1.position.y = Math.cos(Date.now() * 0.001) * 8;
      pointLight2.position.x = Math.cos(Date.now() * 0.0015) * 8;
      pointLight2.position.y = Math.sin(Date.now() * 0.0015) * 8;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="{title} - {theme}" />
</svelte:head>

<div class="page-2024">
  <canvas bind:this={canvas} class="webgl-canvas"></canvas>

  <div class="content-wrapper">
    <section class="hero-section">
      <div class="hero-content">
        <div class="logo-container">
          <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="jam-logo" />
        </div>
        <h1 class="main-title">
          <span class="title-line">Cambridge Game Jam</span>
          <span class="title-year">2024</span>
        </h1>
        <div class="theme-badge">
          <span class="theme-label">Theme</span>
          <span class="theme-text">{theme}</span>
        </div>
        <div class="event-details">
          <div class="detail-item">
            <span class="detail-icon">📅</span>
            <span class="detail-text">{duration}</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🎮</span>
            <span class="detail-text">{submissions} Submissions</span>
          </div>
        </div>
      </div>
    </section>

    <section class="games-section">
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
              {#if game.prize}
                <div class="game-prize">
                  <span class="prize-icon">🏆</span>
                  <span class="prize-text">{game.prize}</span>
                </div>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="stats-section">
      <div class="stat-card">
        <div class="stat-number">48</div>
        <div class="stat-label">Hours of Creativity</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{submissions}</div>
        <div class="stat-label">Games Created</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">100+</div>
        <div class="stat-label">Participants</div>
      </div>
    </section>

    <section class="gallery-section">
      <h2 class="section-title">Event Highlights</h2>
      <div class="gallery-container">
        <div class="gallery-image-wrapper">
          <img src="/2024/group-photo.jpg" alt="Cambridge Game Jam 2024 Group" class="gallery-image" />
        </div>
      </div>
    </section>

    <section class="footer-section">
      <div class="footer-content">
        <div class="footer-text">Cambridge Game Jam 2024</div>
        <div class="footer-subtext">Lorem ipsum dolor sit amet consectetur adipisicing elit</div>
        <div class="footer-links">
          <a href="/" class="footer-link">Home</a>
          <a href="/archive" class="footer-link">Archive</a>
          <a href="https://itch.io/jam/camgamejam2024" target="_blank" rel="noopener noreferrer" class="footer-link">Itch.io</a>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  :global(body) {
    overflow-x: hidden;
  }

  .page-2024 {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    overflow-x: hidden;
  }

  .webgl-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .content-wrapper {
    position: relative;
    z-index: 1;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
  }

  .hero-content {
    text-align: center;
    max-width: 900px;
    animation: fadeInUp 1s ease-out;
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

  .logo-container {
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .jam-logo {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 0 30px rgba(99, 102, 241, 0.6));
  }

  .main-title {
    font-size: 5rem;
    font-weight: 900;
    margin: 0 0 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title-line {
    background: linear-gradient(90deg, #6366f1, #ec4899, #f59e0b);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s ease-in-out infinite;
    text-shadow: 0 0 40px rgba(99, 102, 241, 0.5);
  }

  @keyframes shimmer {
    0%, 100% {
      filter: brightness(1) hue-rotate(0deg);
    }
    50% {
      filter: brightness(1.3) hue-rotate(10deg);
    }
  }

  .title-year {
    font-size: 6rem;
    color: #ffffff;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5),
                 0 0 40px rgba(99, 102, 241, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }

  .theme-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 3rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    margin-bottom: 3rem;
    backdrop-filter: blur(10px);
    animation: borderGlow 2s ease-in-out infinite;
  }

  @keyframes borderGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
      border-color: rgba(99, 102, 241, 0.5);
    }
    50% {
      box-shadow: 0 0 40px rgba(236, 72, 153, 0.8);
      border-color: rgba(236, 72, 153, 0.8);
    }
  }

  .theme-label {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: rgba(255, 255, 255, 0.7);
  }

  .theme-text {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 0 20px rgba(236, 72, 153, 0.8);
  }

  .event-details {
    display: flex;
    gap: 3rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    animation: slideIn 1s ease-out;
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

  .detail-icon {
    font-size: 2rem;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .detail-text {
    font-size: 1.2rem;
    color: #ffffff;
    font-weight: 600;
  }

  .games-section {
    padding: 6rem 2rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
  }

  .section-title {
    text-align: center;
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 4rem;
    background: linear-gradient(90deg, #6366f1, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: titleSlide 1s ease-out;
  }

  @keyframes titleSlide {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .game-card {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: cardAppear 0.6s ease-out backwards;
    text-decoration: none;
    color: inherit;
  }

  @keyframes cardAppear {
    from {
      opacity: 0;
      transform: translateY(40px) rotateX(20deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }

  .game-card:hover {
    transform: translateY(-15px) scale(1.02);
    box-shadow: 0 20px 60px rgba(99, 102, 241, 0.4),
                0 0 40px rgba(236, 72, 153, 0.3);
    border-color: rgba(99, 102, 241, 0.5);
  }

  .game-image-wrapper {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .game-card:hover .game-image {
    transform: scale(1.15);
  }

  .game-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .game-card:hover .game-overlay {
    opacity: 1;
  }

  .game-info {
    padding: 1.5rem;
  }

  .game-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 1rem 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .game-prize {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3));
    border-radius: 10px;
    font-size: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .prize-icon {
    font-size: 1.2rem;
    animation: rotate 3s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .prize-text {
    color: #ffffff;
    font-weight: 600;
  }

  .stats-section {
    padding: 6rem 2rem;
    display: flex;
    gap: 3rem;
    justify-content: center;
    flex-wrap: wrap;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1));
  }

  .stat-card {
    text-align: center;
    padding: 3rem 4rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 25px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.4s ease;
    animation: statFloat 3s ease-in-out infinite;
  }

  @keyframes statFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  .stat-card:nth-child(2) {
    animation-delay: 0.2s;
  }

  .stat-card:nth-child(3) {
    animation-delay: 0.4s;
  }

  .stat-card:hover {
    transform: scale(1.1) translateY(-10px);
    box-shadow: 0 20px 50px rgba(99, 102, 241, 0.5);
    border-color: rgba(99, 102, 241, 0.6);
  }

  .stat-number {
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #6366f1, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  .stat-label {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .gallery-section {
    padding: 6rem 2rem;
    background: rgba(0, 0, 0, 0.4);
  }

  .gallery-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .gallery-image-wrapper {
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
    animation: imageReveal 1.2s ease-out;
    border: 3px solid rgba(99, 102, 241, 0.3);
    transition: all 0.5s ease;
  }

  @keyframes imageReveal {
    from {
      opacity: 0;
      transform: scale(0.8) rotateY(20deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotateY(0);
    }
  }

  .gallery-image-wrapper:hover {
    transform: scale(1.02);
    box-shadow: 0 40px 100px rgba(99, 102, 241, 0.5);
    border-color: rgba(236, 72, 153, 0.6);
  }

  .gallery-image {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.6s ease;
  }

  .gallery-image-wrapper:hover .gallery-image {
    transform: scale(1.05);
  }

  .footer-section {
    padding: 4rem 2rem;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
  }

  .footer-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .footer-text {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 1rem;
    animation: fadeIn 1s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .footer-subtext {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .footer-link {
    color: #ffffff;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.8rem 2rem;
    border-radius: 10px;
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.4);
    transition: all 0.3s ease;
  }

  .footer-link:hover {
    background: rgba(99, 102, 241, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
  }

  @media (max-width: 768px) {
    .main-title {
      font-size: 3rem;
    }

    .title-year {
      font-size: 4rem;
    }

    .theme-text {
      font-size: 2rem;
    }

    .section-title {
      font-size: 2.5rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .event-details {
      gap: 1.5rem;
    }

    .detail-item {
      padding: 0.8rem 1.5rem;
    }

    .stat-card {
      padding: 2rem 3rem;
    }

    .stat-number {
      font-size: 3rem;
    }

    .jam-logo {
      width: 150px;
    }
  }
</style>
