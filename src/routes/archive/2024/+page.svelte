<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvas;
  let scene, camera, renderer, mirror, particles, crystals = [];
  let animationFrame;
  let scrollY = 0;

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

  onMount(() => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 30;

    const ambientLight = new THREE.AmbientLight(0x4a90e2, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x7b68ee, 1);
    directionalLight1.position.set(5, 10, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xff1493, 0.8);
    directionalLight2.position.set(-5, -10, 5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);

    const mirrorGeometry = new THREE.IcosahedronGeometry(8, 0);
    const mirrorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4a90e2,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    scene.add(mirror);

    for (let i = 0; i < 12; i++) {
      const crystalGeometry = new THREE.OctahedronGeometry(Math.random() * 2 + 1, 0);
      const crystalMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85,
      });
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      );
      crystal.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2,
      };
      crystals.push(crystal);
      scene.add(crystal);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      mirror.rotation.x = time * 0.3;
      mirror.rotation.y = time * 0.5;
      mirror.position.y = Math.sin(time * 0.5) * 2;

      crystals.forEach((crystal) => {
        crystal.rotation.x += crystal.userData.rotationSpeed.x;
        crystal.rotation.y += crystal.userData.rotationSpeed.y;
        crystal.rotation.z += crystal.userData.rotationSpeed.z;
        crystal.position.y += Math.sin(time * crystal.userData.floatSpeed + crystal.userData.floatOffset) * 0.02;
      });

      particles.rotation.y = time * 0.05;
      particles.rotation.x = Math.sin(time * 0.2) * 0.1;

      camera.position.x = Math.sin(time * 0.1) * 2;
      camera.position.y = Math.cos(time * 0.15) * 2 - scrollY * 0.01;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrame);
      renderer.dispose();
    };
  });
</script>

<div class="page-container">
  <canvas bind:this={canvas} class="three-canvas"></canvas>
  
  <div class="content">
    <section class="hero">
      <div class="hero-content">
        <div class="logo-container">
          <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        </div>
        <h1 class="title">
          <span class="title-line">Cambridge</span>
          <span class="title-line">Game Jam</span>
          <span class="title-line year">2024</span>
        </h1>
        <div class="theme-badge">
          <div class="theme-icon">◆</div>
          <div class="theme-text">REFLECTION</div>
          <div class="theme-icon">◆</div>
        </div>
        <p class="date">9th - 11th February 2024</p>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-number">23</div>
            <div class="stat-label">Submissions</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">48</div>
            <div class="stat-label">Hours</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">∞</div>
            <div class="stat-label">Creativity</div>
          </div>
        </div>
      </div>
    </section>

    <section class="featured">
      <div class="section-header">
        <h2 class="section-title">Featured Projects</h2>
        <div class="section-subtitle">Award-winning games from the jam</div>
      </div>
      
      <div class="games-grid">
        {#each games as game, i}
          <a href={game.link} target="_blank" rel="noopener noreferrer" class="game-card" style="animation-delay: {i * 0.1}s">
            <div class="game-image-container">
              <img src={game.src} alt={game.alt} class="game-image" />
              <div class="game-overlay">
                <div class="play-icon">▶</div>
              </div>
            </div>
            <div class="game-info">
              <h3 class="game-title">{game.title}</h3>
              {#if game.prize}
                <div class="game-prize">
                  <span class="trophy">🏆</span>
                  <span>{game.prize}</span>
                </div>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="about">
      <div class="about-content">
        <div class="about-left">
          <h2 class="about-title">The Experience</h2>
          <p class="about-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p class="about-text">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
        <div class="about-right">
          <img src="/2024/group-photo.jpg" alt="Game Jam Participants" class="about-image" />
        </div>
      </div>
    </section>

    <section class="theme-section">
      <div class="theme-content">
        <div class="theme-title-large">Reflection</div>
        <p class="theme-description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
        </p>
        <div class="theme-highlights">
          <div class="highlight-item">
            <div class="highlight-icon">◆</div>
            <div class="highlight-text">Mirror Mechanics</div>
          </div>
          <div class="highlight-item">
            <div class="highlight-icon">◇</div>
            <div class="highlight-text">Dual Perspectives</div>
          </div>
          <div class="highlight-item">
            <div class="highlight-icon">◆</div>
            <div class="highlight-text">Symmetry & Balance</div>
          </div>
          <div class="highlight-item">
            <div class="highlight-icon">◇</div>
            <div class="highlight-text">Self Discovery</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer-2024">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-heading">Cambridge Game Jam 2024</h3>
          <p class="footer-text">A celebration of creativity and game development</p>
        </div>
        <div class="footer-section">
          <h4 class="footer-subheading">Event Details</h4>
          <p class="footer-text">9th - 11th February 2024</p>
          <p class="footer-text">23 Amazing Submissions</p>
        </div>
        <div class="footer-section">
          <h4 class="footer-subheading">Theme</h4>
          <p class="footer-text">Reflection</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 Cambridge Game Jam. All rights reserved.</p>
      </div>
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
    background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
    overflow-x: hidden;
  }

  .three-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .content {
    position: relative;
    z-index: 1;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .hero-content {
    text-align: center;
    max-width: 1200px;
  }

  .logo-container {
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  .logo {
    max-width: 200px;
    height: auto;
    filter: drop-shadow(0 0 30px rgba(74, 144, 226, 0.8));
  }

  .title {
    font-size: clamp(3rem, 10vw, 8rem);
    font-weight: 900;
    margin: 0;
    line-height: 0.9;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }

  .title-line {
    display: block;
    animation: slideInUp 0.8s ease-out backwards;
    background: linear-gradient(135deg, #4a90e2, #7b68ee, #ff1493);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 40px rgba(74, 144, 226, 0.5));
  }

  .title-line:nth-child(1) {
    animation-delay: 0.1s;
  }

  .title-line:nth-child(2) {
    animation-delay: 0.2s;
  }

  .title-line.year {
    animation-delay: 0.3s;
    font-size: 1.5em;
    margin-top: 0.2em;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    margin: 3rem 0 2rem;
    padding: 1rem 2.5rem;
    background: rgba(74, 144, 226, 0.1);
    border: 2px solid rgba(74, 144, 226, 0.5);
    border-radius: 50px;
    backdrop-filter: blur(10px);
    animation: pulse 2s ease-in-out infinite;
  }

  .theme-icon {
    font-size: 1.5rem;
    color: #4a90e2;
    animation: rotate 4s linear infinite;
  }

  .theme-text {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: #fff;
    text-transform: uppercase;
  }

  .date {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 2rem 0;
    font-weight: 300;
    letter-spacing: 0.05em;
    animation: fadeIn 1s ease-out 0.5s backwards;
  }

  .stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 4rem;
    animation: fadeIn 1s ease-out 0.7s backwards;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #4a90e2, #7b68ee);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: countUp 1.5s ease-out;
  }

  .stat-label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-top: 0.5rem;
  }

  .stat-divider {
    width: 2px;
    height: 60px;
    background: linear-gradient(to bottom, transparent, #4a90e2, transparent);
  }

  .featured {
    padding: 8rem 2rem;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    color: #fff;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    animation: slideInUp 0.8s ease-out;
  }

  .section-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .games-grid {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 0 2rem;
  }

  .game-card {
    position: relative;
    display: block;
    background: rgba(26, 26, 46, 0.6);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(74, 144, 226, 0.2);
    backdrop-filter: blur(10px);
    text-decoration: none;
    animation: fadeInUp 0.8s ease-out backwards;
  }

  .game-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 0 20px 60px rgba(74, 144, 226, 0.4);
  }

  .game-image-container {
    position: relative;
    aspect-ratio: 16 / 9;
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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(74, 144, 226, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .game-card:hover .game-overlay {
    opacity: 1;
  }

  .play-icon {
    font-size: 4rem;
    color: white;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .game-info {
    padding: 1.5rem;
  }

  .game-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.5rem 0;
  }

  .game-prize {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 0.5rem;
  }

  .trophy {
    font-size: 1.2rem;
  }

  .about {
    padding: 8rem 2rem;
  }

  .about-content {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  .about-left {
    animation: slideInLeft 1s ease-out;
  }

  .about-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 900;
    color: #fff;
    margin: 0 0 2rem 0;
    text-transform: uppercase;
    background: linear-gradient(135deg, #4a90e2, #7b68ee);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .about-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
  }

  .about-right {
    animation: slideInRight 1s ease-out;
  }

  .about-image {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(74, 144, 226, 0.3);
    border: 2px solid rgba(74, 144, 226, 0.3);
  }

  .theme-section {
    padding: 8rem 2rem;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%);
  }

  .theme-content {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }

  .theme-title-large {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    color: #fff;
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: linear-gradient(135deg, #4a90e2, #7b68ee, #ff1493, #4a90e2);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 3s linear infinite;
  }

  .theme-description {
    font-size: 1.2rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4rem;
  }

  .theme-highlights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }

  .highlight-item {
    padding: 2rem;
    background: rgba(74, 144, 226, 0.1);
    border: 2px solid rgba(74, 144, 226, 0.3);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    animation: fadeInUp 0.8s ease-out backwards;
  }

  .highlight-item:nth-child(1) { animation-delay: 0.1s; }
  .highlight-item:nth-child(2) { animation-delay: 0.2s; }
  .highlight-item:nth-child(3) { animation-delay: 0.3s; }
  .highlight-item:nth-child(4) { animation-delay: 0.4s; }

  .highlight-item:hover {
    transform: translateY(-5px);
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 0 10px 30px rgba(74, 144, 226, 0.3);
  }

  .highlight-icon {
    font-size: 3rem;
    color: #4a90e2;
    margin-bottom: 1rem;
    animation: pulse 2s ease-in-out infinite;
  }

  .highlight-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .footer-2024 {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    border-top: 2px solid rgba(74, 144, 226, 0.3);
    padding: 4rem 2rem 2rem;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .footer-heading {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .footer-subheading {
    font-size: 1.2rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .footer-text {
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.8;
    margin: 0.5rem 0;
  }

  .footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(74, 144, 226, 0.2);
    color: rgba(255, 255, 255, 0.5);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

  @keyframes gradientShift {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }

  @media (max-width: 768px) {
    .about-content {
      grid-template-columns: 1fr;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }

    .stats {
      flex-direction: column;
      gap: 2rem;
    }

    .stat-divider {
      width: 60px;
      height: 2px;
    }

    .theme-highlights {
      grid-template-columns: 1fr;
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }
</style>
