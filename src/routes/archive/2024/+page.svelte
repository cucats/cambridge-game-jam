<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas;
  let scrollY = 0;
  let mounted = false;

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

  onMount(() => {
    mounted = true;
    
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0x00ffff, 3);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xff00ff, 2);
    directionalLight2.position.set(-5, -5, 5);
    scene.add(directionalLight2);

    const pointLight1 = new THREE.PointLight(0xffffff, 100, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00aa, 80, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const createLowPolyShape = (geometry, color, position, scale = 1) => {
      const material = new THREE.MeshPhongMaterial({
        color,
        flatShading: true,
        shininess: 100,
        specular: 0xffffff,
        reflectivity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(scale, scale, scale);
      return mesh;
    };

    const shapes = [];
    
    const tetrahedronGeo = new THREE.TetrahedronGeometry(2, 0);
    const octahedronGeo = new THREE.OctahedronGeometry(2, 0);
    const icosahedronGeo = new THREE.IcosahedronGeometry(2, 0);
    const dodecahedronGeo = new THREE.DodecahedronGeometry(2, 0);

    shapes.push(createLowPolyShape(icosahedronGeo, 0x00ffff, [-8, 5, -5], 1.5));
    shapes.push(createLowPolyShape(octahedronGeo, 0xff00ff, [8, -3, -8], 1.8));
    shapes.push(createLowPolyShape(tetrahedronGeo, 0xffff00, [-6, -5, -6], 2));
    shapes.push(createLowPolyShape(dodecahedronGeo, 0xff0088, [10, 6, -10], 1.3));
    shapes.push(createLowPolyShape(icosahedronGeo, 0x00ff88, [0, 8, -12], 2.2));
    shapes.push(createLowPolyShape(octahedronGeo, 0x8800ff, [-10, -8, -7], 1.6));

    shapes.forEach(shape => scene.add(shape));

    const mirrorGeo = new THREE.PlaneGeometry(30, 30, 10, 10);
    const vertices = mirrorGeo.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.sin(vertices[i] * 0.3) * Math.cos(vertices[i + 1] * 0.3) * 0.5;
    }
    mirrorGeo.attributes.position.needsUpdate = true;
    mirrorGeo.computeVertexNormals();

    const mirrorMaterial = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      flatShading: true,
      shininess: 100,
      specular: 0xffffff,
      reflectivity: 1,
      side: THREE.DoubleSide,
    });
    
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMaterial);
    mirror.rotation.x = -Math.PI / 4;
    mirror.position.set(0, -8, -5);
    scene.add(mirror);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const floatingShapes = [];
    for (let i = 0; i < 20; i++) {
      const geos = [tetrahedronGeo, octahedronGeo, icosahedronGeo];
      const geo = geos[Math.floor(Math.random() * geos.length)];
      const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff88, 0xff0088, 0x8800ff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = createLowPolyShape(geo, color, [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40 - 20
      ], Math.random() * 0.5 + 0.3);
      floatingShapes.push({
        mesh: shape,
        velocity: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        }
      });
      scene.add(shape);
    }

    let time = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.005 + index * 0.001;
        shape.rotation.y += 0.007 + index * 0.001;
        shape.position.y += Math.sin(time + index) * 0.02;
        shape.position.x += Math.cos(time * 0.5 + index) * 0.01;
      });

      floatingShapes.forEach((item) => {
        item.mesh.position.x += item.velocity.x;
        item.mesh.position.y += item.velocity.y;
        item.mesh.position.z += item.velocity.z;

        if (Math.abs(item.mesh.position.x) > 25) item.velocity.x *= -1;
        if (Math.abs(item.mesh.position.y) > 25) item.velocity.y *= -1;
        if (item.mesh.position.z > 10 || item.mesh.position.z < -50) item.velocity.z *= -1;

        item.mesh.rotation.x += item.rotationSpeed.x;
        item.mesh.rotation.y += item.rotationSpeed.y;
        item.mesh.rotation.z += item.rotationSpeed.z;
      });

      const mirrorVertices = mirror.geometry.attributes.position.array;
      for (let i = 0; i < mirrorVertices.length; i += 3) {
        const x = mirrorVertices[i];
        const y = mirrorVertices[i + 1];
        mirrorVertices[i + 2] = Math.sin(x * 0.3 + time) * Math.cos(y * 0.3 + time) * 0.8;
      }
      mirror.geometry.attributes.position.needsUpdate = true;
      mirror.geometry.computeVertexNormals();

      mirror.rotation.z = Math.sin(time * 0.5) * 0.1;

      const particlePositions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3] += velocities[i].x;
        particlePositions[i3 + 1] += velocities[i].y;
        particlePositions[i3 + 2] += velocities[i].z;

        if (Math.abs(particlePositions[i3]) > 25) velocities[i].x *= -1;
        if (Math.abs(particlePositions[i3 + 1]) > 25) velocities[i].y *= -1;
        if (Math.abs(particlePositions[i3 + 2]) > 25) velocities[i].z *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      pointLight1.position.x = Math.sin(time) * 15;
      pointLight1.position.z = Math.cos(time) * 15;
      
      pointLight2.position.x = Math.cos(time * 1.3) * 15;
      pointLight2.position.z = Math.sin(time * 1.3) * 15;

      camera.position.x = Math.sin(scrollY * 0.0001) * 2;
      camera.position.y = Math.cos(scrollY * 0.0001) * 2;
      camera.lookAt(0, 0, 0);

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
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2024 - Reflection</title>
</svelte:head>

<div class="container">
  <canvas bind:this={canvas} class="webgl"></canvas>
  
  <div class="content">
    <section class="hero">
      <div class="hero-content" class:visible={mounted}>
        <div class="logo-container">
          <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        </div>
        <h1 class="title">
          <span class="glitch" data-text="REFLECTION">REFLECTION</span>
        </h1>
        <div class="date-info">
          <p class="date">9th - 11th February 2024</p>
          <p class="submissions">23 Submissions</p>
        </div>
      </div>
    </section>

    <section class="featured">
      <h2 class="section-title">
        <span class="highlight">Featured</span> Projects
      </h2>
      <div class="games-grid">
        {#each games as game, index}
          <a 
            href={game.link} 
            class="game-card"
            style="animation-delay: {index * 0.1}s"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="game-image-wrapper">
              <img src={game.src} alt={game.alt} class="game-image" />
              <div class="game-overlay"></div>
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

    <section class="stats">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-number">48</div>
          <div class="stat-label">Hours</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">23</div>
          <div class="stat-label">Games</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">100+</div>
          <div class="stat-label">Participants</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">1</div>
          <div class="stat-label">Theme</div>
        </div>
      </div>
    </section>

    <section class="about">
      <div class="about-content">
        <h2 class="about-title">About the Jam</h2>
        <div class="about-text">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
        <a href="https://itch.io/jam/camgamejam2024" class="cta-button" target="_blank" rel="noopener noreferrer">
          View All Submissions
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
</div>

<style>
  :global(body) {
    margin: 0;
    overflow-x: hidden;
  }

  .container {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%);
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .webgl {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
    opacity: 0.8;
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
    text-align: center;
    padding: 2rem;
  }

  .hero-content {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s ease-out;
  }

  .hero-content.visible {
    opacity: 1;
    transform: translateY(0);
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

  .logo {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.5));
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 60px rgba(255, 0, 255, 0.8));
    }
  }

  .title {
    font-size: clamp(3rem, 10vw, 8rem);
    font-weight: 900;
    margin: 2rem 0;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .glitch {
    position: relative;
    display: inline-block;
    color: #00ffff;
    text-shadow: 
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.6),
      0 0 30px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(255, 0, 255, 0.4);
    animation: glitch 1s infinite, colorShift 3s ease-in-out infinite;
  }

  @keyframes glitch {
    0%, 90%, 100% {
      transform: translate(0);
    }
    92% {
      transform: translate(-2px, 2px);
    }
    94% {
      transform: translate(2px, -2px);
    }
    96% {
      transform: translate(-2px, -2px);
    }
    98% {
      transform: translate(2px, 2px);
    }
  }

  @keyframes colorShift {
    0%, 100% {
      color: #00ffff;
    }
    33% {
      color: #ff00ff;
    }
    66% {
      color: #ffff00;
    }
  }

  .date-info {
    font-size: clamp(1rem, 2vw, 1.5rem);
    margin-top: 2rem;
    animation: fadeInUp 1s ease-out 0.5s both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .date {
    font-weight: 600;
    color: #ff00ff;
    margin: 0.5rem 0;
    text-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
  }

  .submissions {
    color: #00ffff;
    margin: 0.5rem 0;
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  }

  .featured {
    padding: 8rem 2rem;
    background: linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 10, 26, 0.95) 100%);
  }

  .section-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    text-align: center;
    margin-bottom: 4rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .highlight {
    color: #ff00ff;
    text-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .game-card {
    position: relative;
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid transparent;
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-decoration: none;
    color: inherit;
    animation: cardAppear 0.6s ease-out both;
  }

  @keyframes cardAppear {
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
    transform: translateY(-15px) scale(1.05);
    border-color: #00ffff;
    box-shadow: 
      0 0 40px rgba(0, 255, 255, 0.6),
      0 20px 60px rgba(0, 0, 0, 0.8);
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
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 255, 255, 0.2) 100%);
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
    margin: 0 0 0.5rem 0;
    color: #00ffff;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .game-prize {
    font-size: 0.9rem;
    color: #ff00ff;
    margin: 0;
    font-weight: 500;
    text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
  }

  .stats {
    padding: 6rem 2rem;
    background: rgba(0, 0, 0, 0.7);
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .stat-card {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    transition: all 0.4s ease;
    animation: statFloat 3s ease-in-out infinite;
  }

  .stat-card:nth-child(2) {
    animation-delay: 0.5s;
  }

  .stat-card:nth-child(3) {
    animation-delay: 1s;
  }

  .stat-card:nth-child(4) {
    animation-delay: 1.5s;
  }

  @keyframes statFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .stat-card:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: #ff00ff;
    box-shadow: 0 0 40px rgba(255, 0, 255, 0.5);
  }

  .stat-number {
    font-size: 4rem;
    font-weight: 900;
    color: #00ffff;
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 1.2rem;
    color: #ff00ff;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .about {
    padding: 8rem 2rem;
    background: linear-gradient(180deg, rgba(26, 10, 26, 0.95) 0%, rgba(10, 10, 26, 0.9) 100%);
  }

  .about-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .about-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    margin-bottom: 2rem;
    color: #00ffff;
    text-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
    text-transform: uppercase;
  }

  .about-text {
    font-size: 1.2rem;
    line-height: 1.8;
    margin-bottom: 3rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .about-text p {
    margin-bottom: 1.5rem;
  }

  .cta-button {
    display: inline-block;
    padding: 1.5rem 3rem;
    background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
    color: #000;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.2rem;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all 0.3s ease;
    box-shadow: 0 10px 40px rgba(0, 255, 255, 0.4);
    animation: buttonPulse 2s ease-in-out infinite;
  }

  @keyframes buttonPulse {
    0%, 100% {
      box-shadow: 0 10px 40px rgba(0, 255, 255, 0.4);
    }
    50% {
      box-shadow: 0 10px 60px rgba(255, 0, 255, 0.6);
    }
  }

  .cta-button:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 60px rgba(255, 0, 255, 0.6);
  }

  .back-section {
    padding: 4rem 2rem 6rem;
    text-align: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    color: #00ffff;
    text-decoration: none;
    font-size: 1.3rem;
    font-weight: 600;
    transition: all 0.3s ease;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .back-link:hover {
    transform: translateX(-10px);
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  }

  .back-arrow {
    font-size: 2rem;
    transition: transform 0.3s ease;
  }

  .back-link:hover .back-arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .hero {
      padding: 1rem;
    }

    .logo {
      width: 150px;
    }

    .games-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .featured,
    .stats,
    .about {
      padding: 4rem 1rem;
    }
  }
</style>
