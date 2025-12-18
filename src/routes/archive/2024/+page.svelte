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
  ];

  let container;
  let scene, camera, renderer;
  let crystals = [];
  let mirrorPlanes = [];
  let particles;
  let time = 0;
  let scrollY = 0;
  let currentSection = 0;

  onMount(() => {
    initThree();
    animate();

    const handleScroll = () => {
      scrollY = window.scrollY;
      const sections = document.querySelectorAll('.section');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          currentSection = index;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  });

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a1a, 1);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x4444ff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 1.5, 100);
    pointLight3.position.set(0, 20, -10);
    scene.add(pointLight3);

    createCrystals();
    createMirrorPlanes();
    createParticles();
    createFloatingShards();
  }

  function createCrystals() {
    const crystalGeometries = [
      new THREE.OctahedronGeometry(2, 0),
      new THREE.TetrahedronGeometry(2, 0),
      new THREE.IcosahedronGeometry(2, 0),
    ];

    for (let i = 0; i < 15; i++) {
      const geometry = crystalGeometries[Math.floor(Math.random() * crystalGeometries.length)];
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
        flatShading: true,
        shininess: 100,
        specular: 0xffffff,
      });

      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.x = (Math.random() - 0.5) * 50;
      crystal.position.y = (Math.random() - 0.5) * 50;
      crystal.position.z = (Math.random() - 0.5) * 50;
      crystal.rotation.x = Math.random() * Math.PI;
      crystal.rotation.y = Math.random() * Math.PI;
      
      crystal.userData = {
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        speedZ: (Math.random() - 0.5) * 0.02,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scale: 0.5 + Math.random() * 1.5,
      };
      
      crystal.scale.setScalar(crystal.userData.scale);
      
      scene.add(crystal);
      crystals.push(crystal);
    }
  }

  function createMirrorPlanes() {
    const planeGeometry = new THREE.PlaneGeometry(20, 20, 10, 10);
    
    for (let i = 0; i < 3; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x4488ff,
        flatShading: true,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        shininess: 100,
        specular: 0xffffff,
      });

      const plane = new THREE.Mesh(planeGeometry, material);
      plane.position.x = (i - 1) * 15;
      plane.position.y = Math.sin(i * 2) * 10;
      plane.position.z = -20;
      plane.rotation.y = Math.PI / 4 * i;
      
      plane.userData = {
        initialY: plane.position.y,
        offset: i * Math.PI / 3,
      };
      
      scene.add(plane);
      mirrorPlanes.push(plane);
    }
  }

  function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;

      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.7);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function createFloatingShards() {
    const shardGeometry = new THREE.TetrahedronGeometry(1, 0);
    
    for (let i = 0; i < 30; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.5 + Math.random() * 0.2, 0.9, 0.6),
        flatShading: true,
        transparent: true,
        opacity: 0.7,
        emissive: new THREE.Color().setHSL(0.5 + Math.random() * 0.2, 0.8, 0.3),
      });

      const shard = new THREE.Mesh(shardGeometry, material);
      shard.position.x = (Math.random() - 0.5) * 60;
      shard.position.y = (Math.random() - 0.5) * 60;
      shard.position.z = (Math.random() - 0.5) * 60;
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      shard.userData = {
        speedX: (Math.random() - 0.5) * 0.01,
        speedY: (Math.random() - 0.5) * 0.01,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      };
      
      scene.add(shard);
      crystals.push(shard);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    crystals.forEach((crystal, index) => {
      crystal.rotation.x += crystal.userData.rotationSpeed;
      crystal.rotation.y += crystal.userData.rotationSpeed * 0.5;
      crystal.rotation.z += crystal.userData.rotationSpeed * 0.3;

      crystal.position.x += Math.sin(time + index) * 0.05;
      crystal.position.y += Math.cos(time + index * 0.5) * 0.05;

      if (crystal.position.x > 30) crystal.position.x = -30;
      if (crystal.position.x < -30) crystal.position.x = 30;
      if (crystal.position.y > 30) crystal.position.y = -30;
      if (crystal.position.y < -30) crystal.position.y = 30;
    });

    mirrorPlanes.forEach((plane, index) => {
      plane.rotation.y += 0.005;
      plane.position.y = plane.userData.initialY + Math.sin(time + plane.userData.offset) * 5;
      plane.material.opacity = 0.2 + Math.sin(time * 2 + plane.userData.offset) * 0.1;
    });

    if (particles) {
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + i) * 0.02;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }

    camera.position.x = Math.sin(time * 0.2) * 5;
    camera.position.y = 5 + Math.cos(time * 0.15) * 3 + scrollY * 0.01;
    camera.lookAt(0, scrollY * 0.02, 0);

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
</script>

<div class="page-2024">
  <div class="three-container" bind:this={container}></div>

  <div class="content-overlay">
    <section class="section hero-section">
      <div class="hero-content">
        <div class="logo-container">
          <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        </div>
        <h1 class="glitch main-title">{title}</h1>
        <div class="theme-badge">
          <span class="theme-label">Theme</span>
          <span class="theme-text">{theme}</span>
        </div>
        <p class="date">{duration}</p>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-number">{submissions}</div>
            <div class="stat-label">Submissions</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">48</div>
            <div class="stat-label">Hours</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5</div>
            <div class="stat-label">Winners</div>
          </div>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <section class="section games-section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="games-grid">
        {#each games as game, i}
          <a href={game.link} target="_blank" rel="noopener noreferrer" class="game-card" style="animation-delay: {i * 0.1}s">
            <div class="game-image-wrapper">
              <img src={game.src} alt={game.alt} class="game-image" />
              <div class="game-overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <div class="game-info">
              <h3 class="game-title">{game.title}</h3>
              <p class="game-prize">{game.prize}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="section info-section">
      <div class="info-grid">
        <div class="info-card">
          <h3 class="info-title">Lorem Ipsum Dolor</h3>
          <p class="info-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </div>
        <div class="info-card">
          <h3 class="info-title">Consectetur Adipiscing</h3>
          <p class="info-text">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.
          </p>
        </div>
        <div class="info-card">
          <h3 class="info-title">Sed Do Eiusmod</h3>
          <p class="info-text">
            Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur.
          </p>
        </div>
      </div>
    </section>

    <section class="section final-section">
      <div class="final-content">
        <h2 class="final-title">Cambridge Game Jam 2024</h2>
        <p class="final-subtitle">A celebration of creativity, innovation, and reflection</p>
        <div class="links">
          <a href="https://itch.io/jam/camgamejam2024" target="_blank" rel="noopener noreferrer" class="cta-button">
            View All Submissions
          </a>
          <a href="/archive" class="cta-button secondary">
            Back to Archive
          </a>
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
    width: 100%;
    min-height: 100vh;
    position: relative;
    background: #0a0a1a;
    overflow-x: hidden;
  }

  .three-container {
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
    width: 100%;
  }

  .section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
  }

  .hero-section {
    flex-direction: column;
  }

  .hero-content {
    text-align: center;
    animation: fadeInUp 1s ease-out;
  }

  .logo-container {
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  .logo {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 0 20px rgba(68, 136, 255, 0.6));
  }

  .main-title {
    font-size: clamp(2rem, 8vw, 5rem);
    font-weight: 900;
    background: linear-gradient(135deg, #00ffff, #ff00ff, #ffff00, #00ffff);
    background-size: 300% 300%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 1rem 0;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    animation: gradientShift 4s ease infinite, textGlow 2s ease-in-out infinite;
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    margin: 2rem 0;
    background: rgba(68, 136, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(68, 136, 255, 0.3);
    border-radius: 50px;
    animation: pulse 2s ease-in-out infinite;
  }

  .theme-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .theme-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #00ffff;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }

  .date {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 1rem 0;
    letter-spacing: 0.1em;
  }

  .stats {
    display: flex;
    gap: 3rem;
    justify-content: center;
    margin-top: 3rem;
    flex-wrap: wrap;
  }

  .stat-item {
    text-align: center;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    min-width: 120px;
    transition: all 0.3s ease;
    animation: fadeInUp 1s ease-out backwards;
  }

  .stat-item:nth-child(1) { animation-delay: 0.2s; }
  .stat-item:nth-child(2) { animation-delay: 0.4s; }
  .stat-item:nth-child(3) { animation-delay: 0.6s; }

  .stat-item:hover {
    transform: translateY(-10px) scale(1.05);
    background: rgba(68, 136, 255, 0.2);
    border-color: rgba(68, 136, 255, 0.5);
    box-shadow: 0 10px 40px rgba(68, 136, 255, 0.3);
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00ffff, #ff00ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-top: 0.5rem;
  }

  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    animation: bounce 2s infinite;
  }

  .scroll-arrow {
    width: 30px;
    height: 30px;
    border-left: 3px solid #00ffff;
    border-bottom: 3px solid #00ffff;
    transform: rotate(-45deg);
    animation: arrowGlow 2s ease-in-out infinite;
  }

  .games-section {
    flex-direction: column;
    padding: 4rem 2rem;
  }

  .section-title {
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    background: linear-gradient(135deg, #ff00ff, #00ffff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 3rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    width: 100%;
  }

  .game-card {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s ease;
    cursor: pointer;
    animation: fadeInUp 0.8s ease-out backwards;
    text-decoration: none;
    color: inherit;
  }

  .game-card:hover {
    transform: translateY(-15px) scale(1.03);
    border-color: rgba(68, 136, 255, 0.6);
    box-shadow: 0 20px 60px rgba(68, 136, 255, 0.4);
  }

  .game-image-wrapper {
    position: relative;
    width: 100%;
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
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3));
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .game-card:hover .game-overlay {
    opacity: 1;
  }

  .play-icon {
    font-size: 4rem;
    color: white;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .game-info {
    padding: 1.5rem;
  }

  .game-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .game-prize {
    font-size: 0.9rem;
    color: #00ffff;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .info-section {
    padding: 4rem 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    width: 100%;
  }

  .info-card {
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 0, 255, 0.5);
    box-shadow: 0 15px 50px rgba(255, 0, 255, 0.3);
  }

  .info-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ff00ff;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-text {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  .final-section {
    flex-direction: column;
  }

  .final-content {
    text-align: center;
    max-width: 800px;
  }

  .final-title {
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    background: linear-gradient(135deg, #00ffff, #ff00ff, #ffff00);
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    animation: gradientShift 4s ease infinite;
  }

  .final-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 3rem;
    letter-spacing: 0.1em;
  }

  .links {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-button {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #000;
    background: linear-gradient(135deg, #00ffff, #ff00ff);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    position: relative;
    overflow: hidden;
  }

  .cta-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .cta-button:hover::before {
    width: 300px;
    height: 300px;
  }

  .cta-button:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 40px rgba(68, 136, 255, 0.5);
  }

  .cta-button.secondary {
    background: transparent;
    border: 2px solid #00ffff;
    color: #00ffff;
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

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(-15px);
    }
  }

  @keyframes arrowGlow {
    0%, 100% {
      filter: drop-shadow(0 0 5px #00ffff);
    }
    50% {
      filter: drop-shadow(0 0 15px #00ffff);
    }
  }

  @keyframes textGlow {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.5));
    }
  }

  @media (max-width: 768px) {
    .stats {
      gap: 1rem;
    }

    .stat-item {
      min-width: 100px;
      padding: 1rem;
    }

    .stat-number {
      font-size: 2rem;
    }

    .games-grid,
    .info-grid {
      grid-template-columns: 1fr;
    }

    .links {
      flex-direction: column;
      align-items: stretch;
    }

    .cta-button {
      width: 100%;
    }
  }
</style>
