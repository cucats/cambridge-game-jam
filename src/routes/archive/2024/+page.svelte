<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvasContainer;
  let scene, camera, renderer, animationId;
  let floatingShapes = [];
  let mirrorPlane;
  let time = 0;

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

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a1a, 1);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight1.position.set(10, 10, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xff00ff, 0.7);
    directionalLight2.position.set(-10, -10, 10);
    scene.add(directionalLight2);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight1.position.set(0, 10, 0);
    scene.add(pointLight1);

    const mirrorGeometry = new THREE.PlaneGeometry(30, 30, 10, 10);
    const mirrorMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a3a,
      shininess: 100,
      specular: 0x666699,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    mirrorPlane = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane.rotation.x = -Math.PI / 2;
    mirrorPlane.position.y = -5;
    scene.add(mirrorPlane);

    const shapes = [
      { geo: new THREE.TetrahedronGeometry(1, 0), count: 15 },
      { geo: new THREE.OctahedronGeometry(1, 0), count: 15 },
      { geo: new THREE.IcosahedronGeometry(1, 0), count: 10 },
      { geo: new THREE.DodecahedronGeometry(1, 0), count: 8 },
    ];

    shapes.forEach(({ geo, count }) => {
      for (let i = 0; i < count; i++) {
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
          shininess: 100,
          specular: 0xffffff,
          flatShading: true
        });
        const mesh = new THREE.Mesh(geo, material);
        
        mesh.position.x = (Math.random() - 0.5) * 40;
        mesh.position.y = Math.random() * 20 - 5;
        mesh.position.z = (Math.random() - 0.5) * 40;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        const scale = Math.random() * 1.5 + 0.5;
        mesh.scale.set(scale, scale, scale);
        
        mesh.userData = {
          rotSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
          },
          floatSpeed: Math.random() * 0.5 + 0.5,
          floatOffset: Math.random() * Math.PI * 2,
          initialY: mesh.position.y
        };
        
        scene.add(mesh);
        floatingShapes.push(mesh);

        const mirroredMaterial = material.clone();
        mirroredMaterial.opacity = 0.4;
        mirroredMaterial.transparent = true;
        const mirroredMesh = new THREE.Mesh(geo, mirroredMaterial);
        mirroredMesh.scale.copy(mesh.scale);
        mesh.userData.mirror = mirroredMesh;
        scene.add(mirroredMesh);
      }
    });

    const particles = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;

    floatingShapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotSpeed.x;
      shape.rotation.y += shape.userData.rotSpeed.y;
      shape.rotation.z += shape.userData.rotSpeed.z;
      
      shape.position.y = shape.userData.initialY + Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 2;
      
      if (shape.userData.mirror) {
        shape.userData.mirror.position.x = shape.position.x;
        shape.userData.mirror.position.y = -shape.position.y - 10;
        shape.userData.mirror.position.z = shape.position.z;
        shape.userData.mirror.rotation.copy(shape.rotation);
        shape.userData.mirror.rotation.x *= -1;
      }
    });

    camera.position.x = Math.sin(time * 0.1) * 5;
    camera.position.y = 5 + Math.sin(time * 0.15) * 2;
    camera.lookAt(0, 0, 0);

    mirrorPlane.material.opacity = 0.3 + Math.sin(time * 0.5) * 0.1;

    renderer.render(scene, camera);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMount(() => {
    initThree();
    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  });
</script>

<div class="page-container">
  <div bind:this={canvasContainer} class="three-canvas"></div>
  
  <div class="content">
    <section class="hero">
      <h1 class="title">
        <span class="title-main">Cambridge Game Jam</span>
        <span class="title-year">2024</span>
      </h1>
      <div class="theme-container">
        <div class="theme-text">REFLECTION</div>
      </div>
      <p class="date">9th - 11th February 2024</p>
      <p class="submissions">23 Submissions</p>
    </section>

    <section class="games-section">
      <h2 class="section-title">Featured Games</h2>
      <div class="games-grid">
        {#each games as game, i}
          <a 
            href={game.link} 
            class="game-card"
            style="animation-delay: {i * 0.1}s"
            target="_blank"
            rel="noopener noreferrer"
          >
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
    </section>

    <section class="about-section">
      <h2 class="section-title">About the Jam</h2>
      <div class="about-content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </section>

    <section class="stats-section">
      <div class="stat-box">
        <div class="stat-number">23</div>
        <div class="stat-label">Games Created</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">48</div>
        <div class="stat-label">Hours of Jamming</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">∞</div>
        <div class="stat-label">Creativity</div>
      </div>
    </section>

    <div class="footer-section">
      <div class="footer-content">
        <p class="footer-text">Cambridge Game Jam 2024</p>
        <p class="footer-subtext">A weekend of creativity and game development</p>
      </div>
    </div>
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
    width: 100%;
    overflow-x: hidden;
    background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%);
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
    padding: 2rem;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    animation: fadeInUp 1s ease-out;
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

  .title {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .title-main {
    font-size: clamp(2rem, 8vw, 6rem);
    font-weight: 900;
    background: linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ffff 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 3s ease infinite, textFloat 4s ease-in-out infinite;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-shadow: 0 0 40px rgba(0, 255, 255, 0.5);
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes textFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .title-year {
    font-size: clamp(3rem, 12vw, 10rem);
    font-weight: 900;
    background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: scaleUp 2s ease-out, pulse 2s ease-in-out infinite;
    letter-spacing: 0.2em;
  }

  @keyframes scaleUp {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .theme-container {
    margin: 3rem 0;
    padding: 2rem 4rem;
    background: rgba(0, 255, 255, 0.1);
    border: 3px solid rgba(0, 255, 255, 0.5);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    animation: borderGlow 2s ease-in-out infinite;
    position: relative;
    overflow: hidden;
  }

  @keyframes borderGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.2);
    }
    50% {
      box-shadow: 0 0 40px rgba(255, 0, 255, 0.8), inset 0 0 40px rgba(255, 0, 255, 0.3);
    }
  }

  .theme-text {
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.3em;
    text-shadow: 
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.6),
      0 0 30px rgba(0, 255, 255, 0.4);
    animation: textGlow 2s ease-in-out infinite;
  }

  @keyframes textGlow {
    0%, 100% {
      text-shadow: 
        0 0 10px rgba(0, 255, 255, 0.8),
        0 0 20px rgba(0, 255, 255, 0.6),
        0 0 30px rgba(0, 255, 255, 0.4);
    }
    50% {
      text-shadow: 
        0 0 20px rgba(255, 0, 255, 1),
        0 0 30px rgba(255, 0, 255, 0.8),
        0 0 40px rgba(255, 0, 255, 0.6);
    }
  }

  .date {
    font-size: clamp(1.2rem, 3vw, 2rem);
    color: #00ffff;
    margin: 1rem 0;
    font-weight: 600;
    animation: slideInLeft 1s ease-out 0.5s both;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
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

  .submissions {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    color: #ff00ff;
    font-weight: 600;
    animation: slideInRight 1s ease-out 0.7s both;
    text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
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

  .games-section {
    min-height: 100vh;
    padding: 4rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 900;
    background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 3rem;
    text-align: center;
    animation: fadeInUp 1s ease-out;
    letter-spacing: 0.1em;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    width: 100%;
  }

  .game-card {
    background: rgba(26, 26, 58, 0.6);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s ease;
    animation: cardFadeIn 0.8s ease-out both;
    backdrop-filter: blur(10px);
    text-decoration: none;
    display: block;
  }

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .game-card:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: rgba(255, 0, 255, 0.8);
    box-shadow: 
      0 10px 40px rgba(0, 255, 255, 0.3),
      0 0 60px rgba(255, 0, 255, 0.2);
  }

  .game-image-wrapper {
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;
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

  .game-info {
    padding: 1.5rem;
  }

  .game-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .game-prize {
    font-size: 1rem;
    color: #00ffff;
    margin: 0;
    font-weight: 500;
  }

  .about-section {
    min-height: 50vh;
    padding: 4rem 0;
    max-width: 1000px;
    margin: 0 auto;
  }

  .about-content {
    background: rgba(26, 26, 58, 0.4);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    padding: 3rem;
    backdrop-filter: blur(10px);
    animation: fadeInUp 1s ease-out;
  }

  .about-content p {
    font-size: 1.2rem;
    line-height: 1.8;
    color: #ccccff;
    margin: 1rem 0;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 4rem auto;
    padding: 4rem 0;
  }

  .stat-box {
    background: rgba(26, 26, 58, 0.6);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    backdrop-filter: blur(10px);
    animation: statBoxFloat 3s ease-in-out infinite;
    transition: all 0.3s ease;
  }

  .stat-box:nth-child(1) { animation-delay: 0s; }
  .stat-box:nth-child(2) { animation-delay: 0.2s; }
  .stat-box:nth-child(3) { animation-delay: 0.4s; }

  @keyframes statBoxFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .stat-box:hover {
    border-color: rgba(255, 0, 255, 0.8);
    box-shadow: 0 10px 40px rgba(0, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .stat-number {
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 1.2rem;
    color: #ccccff;
    font-weight: 600;
  }

  .footer-section {
    padding: 4rem 0;
    text-align: center;
  }

  .footer-content {
    background: rgba(26, 26, 58, 0.4);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    max-width: 600px;
    margin: 0 auto;
  }

  .footer-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .footer-subtext {
    font-size: 1rem;
    color: #ccccff;
    margin: 0;
  }

  @media (max-width: 768px) {
    .content {
      padding: 1rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .theme-container {
      padding: 1.5rem 2rem;
    }

    .about-content {
      padding: 2rem;
    }
  }
</style>
