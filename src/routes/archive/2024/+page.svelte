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
  let loaded = false;

  onMount(() => {
    setTimeout(() => {
      loaded = true;
    }, 100);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 100);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const crystals = [];
    const geometries = [
      new THREE.OctahedronGeometry(2, 0),
      new THREE.TetrahedronGeometry(2.5, 0),
      new THREE.IcosahedronGeometry(1.8, 0),
      new THREE.DodecahedronGeometry(2.2, 0)
    ];
    
    for (let i = 0; i < 25; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const hue = 0.55 + Math.random() * 0.25;
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(hue, 0.6, 0.3),
        shininess: 150,
        flatShading: true,
        transparent: true,
        opacity: 0.85,
        specular: 0xffffff
      });
      
      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.x = (Math.random() - 0.5) * 70;
      crystal.position.y = (Math.random() - 0.5) * 70;
      crystal.position.z = (Math.random() - 0.5) * 50;
      crystal.rotation.x = Math.random() * Math.PI * 2;
      crystal.rotation.y = Math.random() * Math.PI * 2;
      crystal.rotation.z = Math.random() * Math.PI * 2;
      crystal.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        floatSpeed: Math.random() * 0.8 + 0.3,
        floatOffset: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 5 + 2,
        orbitSpeed: (Math.random() - 0.5) * 0.01
      };
      crystals.push(crystal);
      scene.add(crystal);
    }

    const mirrorGeometry = new THREE.PlaneGeometry(80, 80, 20, 20);
    const mirrorMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a3a,
      emissive: 0x0a0a1a,
      shininess: 100,
      flatShading: true,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const mirror1 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror1.rotation.x = Math.PI / 2;
    mirror1.position.y = -15;
    scene.add(mirror1);

    const mirror2 = new THREE.Mesh(mirrorGeometry, mirrorMaterial.clone());
    mirror2.rotation.x = Math.PI / 2;
    mirror2.position.y = 15;
    scene.add(mirror2);

    const wireframeGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const wireGeo = new THREE.IcosahedronGeometry(3 + i, 0);
      const wireMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.05, 0.8, 0.5),
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.userData = {
        rotSpeed: (Math.random() - 0.5) * 0.01,
        scale: 1 + i * 0.3
      };
      wireframeGroup.add(wireMesh);
    }
    wireframeGroup.position.set(0, 0, 0);
    scene.add(wireframeGroup);

    const particleSystems = [];
    
    for (let layer = 0; layer < 3; layer++) {
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 800;
      const posArray = new Float32Array(particlesCount * 3);
      const velocities = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 120;
        velocities[i] = (Math.random() - 0.5) * 0.02;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const hue = 0.55 + layer * 0.15;
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15 + layer * 0.05,
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        transparent: true,
        opacity: 0.7 - layer * 0.1,
        blending: THREE.AdditiveBlending
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      particlesMesh.userData = { velocities, layer };
      particleSystems.push(particlesMesh);
      scene.add(particlesMesh);
    }

    const light1 = new THREE.DirectionalLight(0x6699ff, 1);
    light1.position.set(5, 10, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xff6699, 0.8);
    light2.position.set(-5, -10, -5);
    scene.add(light2);

    const light3 = new THREE.AmbientLight(0x333366, 0.5);
    scene.add(light3);

    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);

    const rings = [];
    for (let i = 0; i < 8; i++) {
      const ringGeometry = new THREE.TorusGeometry(8 + i * 3, 0.1, 8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55 + i * 0.05, 0.8, 0.5),
        transparent: true,
        opacity: 0.3,
        wireframe: false
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.userData = {
        rotSpeed: 0.001 + i * 0.0005,
        offset: i * Math.PI / 4
      };
      rings.push(ring);
      scene.add(ring);
    }

    const lightBeams = [];
    for (let i = 0; i < 6; i++) {
      const beamGeometry = new THREE.ConeGeometry(0.3, 30, 8);
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.8, 0.6),
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      const angle = (i / 6) * Math.PI * 2;
      beam.position.x = Math.cos(angle) * 20;
      beam.position.z = Math.sin(angle) * 20;
      beam.position.y = -15;
      beam.rotation.x = Math.PI;
      beam.userData = { angle, radius: 20 };
      lightBeams.push(beam);
      scene.add(beam);
    }

    let time = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      crystals.forEach((crystal, index) => {
        crystal.rotation.x += crystal.userData.rotationSpeed;
        crystal.rotation.y += crystal.userData.rotationSpeed * 1.5;
        crystal.rotation.z += crystal.userData.rotationSpeed * 0.5;
        
        const floatY = Math.sin(time * crystal.userData.floatSpeed + crystal.userData.floatOffset) * 0.03;
        const orbitX = Math.cos(time * crystal.userData.orbitSpeed + index) * crystal.userData.orbitRadius;
        const orbitZ = Math.sin(time * crystal.userData.orbitSpeed + index) * crystal.userData.orbitRadius;
        
        crystal.position.y += floatY;
        crystal.position.x += orbitX * 0.001;
        crystal.position.z += orbitZ * 0.001;
        
        const scale = 1 + Math.sin(time * 2 + index) * 0.1;
        crystal.scale.set(scale, scale, scale);
      });

      particleSystems.forEach((system, layerIndex) => {
        const positions = system.geometry.attributes.position.array;
        const velocities = system.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i];
          positions[i + 1] += Math.sin(time * 0.5 + positions[i]) * 0.02 + velocities[i + 1];
          positions[i + 2] += velocities[i + 2];
          
          if (Math.abs(positions[i]) > 60) velocities[i] *= -1;
          if (Math.abs(positions[i + 1]) > 60) velocities[i + 1] *= -1;
          if (Math.abs(positions[i + 2]) > 60) velocities[i + 2] *= -1;
        }
        system.geometry.attributes.position.needsUpdate = true;
        
        system.rotation.y = time * (0.05 + layerIndex * 0.03);
        system.rotation.x = Math.sin(time * 0.3) * 0.2;
      });

      camera.position.x = Math.sin(time * 0.08) * 4 + Math.cos(time * 0.15) * 2 + mouseX * 3;
      camera.position.y = Math.cos(time * 0.12) * 3 - scrollY * 0.01 + mouseY * 2;
      camera.position.z = 30 + Math.sin(time * 0.05) * 2;
      
      const lookAtTarget = new THREE.Vector3(mouseX * 5, mouseY * 3, 0);
      camera.lookAt(lookAtTarget);

      pointLight.position.x = Math.sin(time * 0.7) * 15;
      pointLight.position.y = Math.cos(time * 0.5) * 10;
      pointLight.position.z = Math.cos(time * 0.8) * 12 + 20;
      pointLight.intensity = 1 + Math.sin(time * 2) * 0.3;

      light1.position.x = Math.cos(time * 0.3) * 20;
      light1.position.z = Math.sin(time * 0.3) * 20;
      
      light2.position.x = -Math.cos(time * 0.4) * 15;
      light2.position.z = -Math.sin(time * 0.4) * 15;

      wireframeGroup.rotation.y = time * 0.1;
      wireframeGroup.rotation.x = time * 0.05;
      wireframeGroup.children.forEach((wire, index) => {
        wire.rotation.x += wire.userData.rotSpeed;
        wire.rotation.y += wire.userData.rotSpeed * 2;
        const scale = wire.userData.scale + Math.sin(time + index) * 0.1;
        wire.scale.set(scale, scale, scale);
      });

      rings.forEach((ring, index) => {
        ring.rotation.z = time * ring.userData.rotSpeed + ring.userData.offset;
        ring.position.y = Math.sin(time * 0.5 + ring.userData.offset) * 2;
        const opacity = 0.3 + Math.sin(time * 2 + index) * 0.15;
        ring.material.opacity = opacity;
      });

      lightBeams.forEach((beam, index) => {
        const newAngle = beam.userData.angle + time * 0.1;
        beam.position.x = Math.cos(newAngle) * beam.userData.radius;
        beam.position.z = Math.sin(newAngle) * beam.userData.radius;
        beam.rotation.y = -newAngle;
        const scale = 1 + Math.sin(time * 2 + index) * 0.2;
        beam.scale.set(scale, 1 + Math.sin(time + index) * 0.3, scale);
        beam.material.opacity = 0.15 + Math.sin(time * 3 + index) * 0.1;
      });

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page-container" class:loaded>
  <div class="vignette"></div>
  <div class="sparkles">
    {#each Array(30) as _, i}
      <div class="sparkle" style="--i: {i}"></div>
    {/each}
  </div>
  <canvas bind:this={canvas} class="three-canvas"></canvas>
  <div class="cursor-glow" style="left: {(mouseX + 1) * 50}%; top: {(-mouseY + 1) * 50}%"></div>
  <div class="cursor-dot" style="left: {(mouseX + 1) * 50}%; top: {(-mouseY + 1) * 50}%"></div>
  
  <div class="content">
    <a href="/archive" class="back-button">
      <span class="back-arrow">←</span>
      <span class="back-text">Archive</span>
    </a>
    
    <section class="hero-section">
      <div class="hero-bg-overlay"></div>
      <div class="hero-content" style="transform: translate({mouseX * 20}px, {mouseY * 20}px)">
        <div class="logo-container">
          <div class="logo-glow"></div>
          <img src="/2024/logo.png" alt="CGJ 2024" class="logo" />
        </div>
        <h1 class="main-title">
          <span class="title-word" style="--delay: 0s">Cambridge</span>
          <span class="title-word" style="--delay: 0.1s">Game</span>
          <span class="title-word" style="--delay: 0.2s">Jam</span>
          <span class="year">2024</span>
        </h1>
        <div class="theme-banner">
          <div class="banner-particles">
            {#each Array(20) as _, i}
              <div class="banner-particle" style="--i: {i}"></div>
            {/each}
          </div>
          <div class="theme-text">
            {#each theme.split('') as char, i}
              <span class="theme-char" style="--char-delay: {i * 0.05}s">{char}</span>
            {/each}
          </div>
        </div>
        <div class="event-details">
          <div class="detail-item">
            <div class="detail-icon">📅</div>
            <div class="detail-label">Duration</div>
            <div class="detail-value">{duration}</div>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-item">
            <div class="detail-icon">🎮</div>
            <div class="detail-label">Submissions</div>
            <div class="detail-value">{submissions}</div>
          </div>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <section class="games-section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="games-grid">
        {#each games as game, index}
          <a 
            href={game.link} 
            target="_blank" 
            rel="noopener noreferrer"
            class="game-card"
            style="animation-delay: {index * 0.1}s"
          >
            <div class="game-card-inner">
              <div class="game-card-front">
                <img src={game.src} alt={game.alt} class="game-image" />
                <div class="game-overlay">
                  <h3 class="game-title">{game.title}</h3>
                  {#if game.prize}
                    <div class="game-prize">{game.prize}</div>
                  {/if}
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="stats-section">
      <h2 class="section-title">Event Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-number">{submissions}</div>
          <div class="stat-label">Projects</div>
          <div class="stat-bar"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-number">48</div>
          <div class="stat-label">Hours</div>
          <div class="stat-bar"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-number">5</div>
          <div class="stat-label">Winners</div>
          <div class="stat-bar"></div>
        </div>
      </div>
    </section>

    <footer class="page-footer">
      <div class="footer-decoration"></div>
      <div class="footer-content">
        <div class="footer-logo">
          <img src="/2024/logo.png" alt="CGJ" class="footer-logo-img" />
        </div>
        <div class="footer-text">Cambridge Game Jam 2024</div>
        <div class="footer-theme">Theme: {theme}</div>
        <div class="footer-links">
          <a href="https://itch.io/jam/camgamejam2024" target="_blank" rel="noopener noreferrer" class="footer-link">
            <span class="link-icon">🎮</span>
            View All Submissions
          </a>
        </div>
        <div class="footer-credits">
          {duration} · {submissions} Submissions
        </div>
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

  :global(html) {
    scroll-behavior: smooth;
  }

  .page-container {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%);
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    cursor: none;
    opacity: 0;
    transition: opacity 1s ease-out;
  }

  .page-container.loaded {
    opacity: 1;
  }

  .page-container * {
    cursor: none;
  }

  .page-container a,
  .page-container button {
    cursor: pointer;
  }

  .vignette {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    background: radial-gradient(circle at center, transparent 0%, rgba(10, 10, 26, 0.5) 100%);
  }

  .sparkles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .sparkle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    left: calc(var(--i) * 3.33%);
    top: calc((var(--i) * 7) % 100%);
    animation: sparkleFloat 4s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.2s);
    opacity: 0;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  }

  @keyframes sparkleFloat {
    0%, 100% {
      opacity: 0;
      transform: translateY(0) scale(0);
    }
    10% {
      opacity: 1;
      transform: translateY(-20px) scale(1);
    }
    90% {
      opacity: 1;
      transform: translateY(-100px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-120px) scale(0);
    }
  }

  .three-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .cursor-glow {
    position: fixed;
    width: 300px;
    height: 300px;
    margin: -150px 0 0 -150px;
    background: radial-gradient(circle, rgba(102, 153, 255, 0.15) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transition: left 0.2s ease-out, top 0.2s ease-out;
    filter: blur(40px);
  }

  .cursor-dot {
    position: fixed;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    background: radial-gradient(circle, #6699ff 0%, #ff6699 100%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: left 0.05s ease-out, top 0.05s ease-out;
    box-shadow: 0 0 20px rgba(102, 153, 255, 0.8),
                0 0 40px rgba(255, 102, 153, 0.5);
    animation: cursorPulse 1.5s ease-in-out infinite;
  }

  @keyframes cursorPulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.8;
    }
  }

  .content {
    position: relative;
    z-index: 1;
  }

  .back-button {
    position: fixed;
    top: 2rem;
    left: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    background: rgba(26, 26, 58, 0.8);
    border: 2px solid rgba(102, 153, 255, 0.3);
    border-radius: 0.5rem;
    color: #6699ff;
    text-decoration: none;
    font-weight: 600;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    z-index: 1000;
    cursor: pointer;
  }

  .back-button:hover {
    background: rgba(102, 153, 255, 0.2);
    border-color: rgba(102, 153, 255, 0.6);
    transform: translateX(-5px);
    box-shadow: 0 0 20px rgba(102, 153, 255, 0.4);
  }

  .back-arrow {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }

  .back-button:hover .back-arrow {
    transform: translateX(-5px);
  }

  .back-text {
    font-size: 1rem;
  }

  .hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    overflow: hidden;
  }

  .hero-bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(102, 153, 255, 0.1) 0%, transparent 70%);
    animation: pulseOverlay 4s ease-in-out infinite;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    animation: fadeInUp 1s ease-out;
  }

  .logo-container {
    position: relative;
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(102, 153, 255, 0.4) 0%, transparent 70%);
    animation: glowPulse 3s ease-in-out infinite;
    filter: blur(30px);
  }

  .logo {
    position: relative;
    width: 200px;
    height: auto;
    filter: drop-shadow(0 0 20px rgba(102, 153, 255, 0.5));
    animation: pulse 2s ease-in-out infinite, rotate3d 10s linear infinite;
  }

  @keyframes rotate3d {
    0% {
      transform: perspective(1000px) rotateY(0deg);
    }
    100% {
      transform: perspective(1000px) rotateY(360deg);
    }
  }

  @keyframes pulseOverlay {
    0%, 100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  @keyframes glowPulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.5;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.8;
    }
  }

  .main-title {
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: 900;
    margin: 1rem 0;
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .title-word {
    display: inline-block;
    background: linear-gradient(135deg, #6699ff 0%, #ff6699 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0.2em;
    animation: shimmer 3s ease-in-out infinite;
    text-shadow: 0 0 30px rgba(102, 153, 255, 0.5);
  }

  .title-word:nth-child(1) { animation-delay: 0s; }
  .title-word:nth-child(2) { animation-delay: 0.2s; }
  .title-word:nth-child(3) { animation-delay: 0.4s; }

  .year {
    display: block;
    font-size: clamp(3rem, 10vw, 8rem);
    background: linear-gradient(135deg, #ff6699 0%, #6699ff 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top: 0.5rem;
    animation: glow 2s ease-in-out infinite;
  }

  .theme-banner {
    position: relative;
    margin: 3rem 0;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(102, 153, 255, 0.1) 0%, rgba(255, 102, 153, 0.1) 100%);
    border: 2px solid rgba(102, 153, 255, 0.3);
    border-radius: 1rem;
    backdrop-filter: blur(10px);
    animation: borderPulse 3s ease-in-out infinite;
    overflow: hidden;
  }

  .banner-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .banner-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(102, 153, 255, 0.6);
    border-radius: 50%;
    left: calc(var(--i) * 5%);
    animation: particleFloat 3s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.1s);
    box-shadow: 0 0 10px rgba(102, 153, 255, 0.8);
  }

  @keyframes particleFloat {
    0%, 100% {
      transform: translateY(100%) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 1;
      transform: translateY(50%) scale(1);
    }
    100% {
      transform: translateY(0%) scale(0);
      opacity: 0;
    }
  }

  .theme-text {
    position: relative;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .theme-char {
    display: inline-block;
    background: linear-gradient(135deg, #6699ff 0%, #ff6699 50%, #6699ff 100%);
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: charFloat 2s ease-in-out infinite, gradientMove 3s ease infinite;
    animation-delay: var(--char-delay);
  }

  @keyframes charFloat {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-10px) scale(1.1);
    }
  }

  .event-details {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 3rem;
    padding: 2rem;
    background: rgba(26, 26, 58, 0.5);
    border-radius: 1rem;
    backdrop-filter: blur(10px);
    animation: slideUp 1s ease-out 0.5s both;
  }

  .detail-item {
    text-align: center;
    animation: popIn 0.6s ease-out both;
  }

  .detail-item:nth-child(1) {
    animation-delay: 0.8s;
  }

  .detail-item:nth-child(3) {
    animation-delay: 1s;
  }

  .detail-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes popIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .detail-label {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.5rem;
  }

  .detail-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #6699ff;
    animation: valueGlow 2s ease-in-out infinite;
  }

  @keyframes valueGlow {
    0%, 100% {
      text-shadow: 0 0 10px rgba(102, 153, 255, 0.5);
    }
    50% {
      text-shadow: 0 0 20px rgba(102, 153, 255, 0.8);
    }
  }

  .detail-divider {
    width: 2px;
    height: 40px;
    background: linear-gradient(180deg, transparent, #6699ff, transparent);
    animation: dividerPulse 2s ease-in-out infinite;
  }

  @keyframes dividerPulse {
    0%, 100% {
      opacity: 0.5;
      box-shadow: 0 0 10px rgba(102, 153, 255, 0.3);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 20px rgba(102, 153, 255, 0.6);
    }
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    animation: scrollBounce 2s ease-in-out infinite;
  }

  .scroll-arrow {
    width: 30px;
    height: 30px;
    border-right: 3px solid #6699ff;
    border-bottom: 3px solid #6699ff;
    transform: rotate(45deg);
    box-shadow: 0 0 10px rgba(102, 153, 255, 0.5);
  }

  @keyframes scrollBounce {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    50% {
      transform: translateX(-50%) translateY(20px);
      opacity: 0.5;
    }
  }

  .games-section {
    padding: 4rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    text-align: center;
    margin-bottom: 3rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: linear-gradient(135deg, #6699ff 0%, #ff6699 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: fadeIn 1s ease-out;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    perspective: 1000px;
  }

  .game-card {
    position: relative;
    aspect-ratio: 16 / 9;
    cursor: pointer;
    text-decoration: none;
    animation: cardFloat 1s ease-out both;
    transform-style: preserve-3d;
  }

  .game-card::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #6699ff, #ff6699, #6699ff);
    background-size: 300% 300%;
    border-radius: 1rem;
    z-index: -1;
    opacity: 0;
    animation: gradientRotate 3s ease infinite;
    transition: opacity 0.6s ease;
  }

  .game-card:hover::before {
    opacity: 0.6;
  }

  @keyframes gradientRotate {
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

  .game-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-style: preserve-3d;
  }

  .game-card:hover .game-card-inner {
    transform: rotateY(10deg) rotateX(5deg) scale(1.05);
  }

  .game-card-front {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 1rem;
    overflow: hidden;
    background: rgba(26, 26, 58, 0.5);
    border: 2px solid rgba(102, 153, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
                0 0 20px rgba(102, 153, 255, 0.2);
    transition: box-shadow 0.6s ease;
  }

  .game-card:hover .game-card-front {
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7),
                0 0 40px rgba(102, 153, 255, 0.5);
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease, filter 0.6s ease;
  }

  .game-card:hover .game-image {
    transform: scale(1.1);
    filter: brightness(1.2) saturate(1.2);
  }

  .game-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem;
    background: linear-gradient(to top, rgba(10, 10, 26, 0.95) 0%, transparent 100%);
    transform: translateY(60%);
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .game-card:hover .game-overlay {
    transform: translateY(0);
  }

  .game-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #ffffff;
    text-shadow: 0 0 10px rgba(102, 153, 255, 0.5);
    animation: titleShimmer 2s ease-in-out infinite;
  }

  @keyframes titleShimmer {
    0%, 100% {
      text-shadow: 0 0 10px rgba(102, 153, 255, 0.5);
    }
    50% {
      text-shadow: 0 0 20px rgba(102, 153, 255, 0.8), 0 0 30px rgba(255, 102, 153, 0.5);
    }
  }

  .game-prize {
    font-size: 0.9rem;
    color: #6699ff;
    font-weight: 500;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .game-card:hover .game-prize {
    opacity: 1;
    transform: translateY(0);
  }

  .stats-section {
    padding: 4rem 2rem;
    background: linear-gradient(135deg, rgba(102, 153, 255, 0.05) 0%, rgba(255, 102, 153, 0.05) 100%);
    backdrop-filter: blur(20px);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .stat-card {
    position: relative;
    text-align: center;
    padding: 2.5rem 2rem;
    background: rgba(26, 26, 58, 0.5);
    border-radius: 1rem;
    border: 2px solid rgba(102, 153, 255, 0.3);
    backdrop-filter: blur(10px);
    animation: statPulse 2s ease-in-out infinite;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 153, 255, 0.2), transparent);
    animation: shimmerSlide 3s ease-in-out infinite;
  }

  @keyframes shimmerSlide {
    0% {
      left: -100%;
    }
    100% {
      left: 200%;
    }
  }

  .stat-card:nth-child(1) { animation-delay: 0s; }
  .stat-card:nth-child(2) { animation-delay: 0.2s; }
  .stat-card:nth-child(3) { animation-delay: 0.4s; }

  .stat-card:nth-child(1)::before { animation-delay: 0s; }
  .stat-card:nth-child(2)::before { animation-delay: 1s; }
  .stat-card:nth-child(3)::before { animation-delay: 2s; }

  .stat-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    animation: iconSpin 4s ease-in-out infinite;
  }

  @keyframes iconSpin {
    0%, 100% {
      transform: rotate(0deg) scale(1);
    }
    25% {
      transform: rotate(-10deg) scale(1.1);
    }
    75% {
      transform: rotate(10deg) scale(1.1);
    }
  }

  .stat-number {
    font-size: 3.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #6699ff 0%, #ff6699 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
    animation: numberPulse 2s ease-in-out infinite;
  }

  @keyframes numberPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .stat-label {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1rem;
  }

  .stat-bar {
    height: 4px;
    background: linear-gradient(90deg, #6699ff 0%, #ff6699 100%);
    border-radius: 2px;
    margin-top: 1rem;
    animation: barExpand 2s ease-out both;
  }

  .stat-card:nth-child(1) .stat-bar { animation-delay: 0.5s; }
  .stat-card:nth-child(2) .stat-bar { animation-delay: 0.7s; }
  .stat-card:nth-child(3) .stat-bar { animation-delay: 0.9s; }

  @keyframes barExpand {
    0% {
      width: 0;
      opacity: 0;
    }
    100% {
      width: 100%;
      opacity: 1;
    }
  }

  .page-footer {
    position: relative;
    padding: 4rem 2rem;
    text-align: center;
    background: linear-gradient(180deg, rgba(10, 10, 26, 0.5) 0%, rgba(10, 10, 26, 0.95) 100%);
    border-top: 2px solid rgba(102, 153, 255, 0.3);
    backdrop-filter: blur(20px);
    overflow: hidden;
  }

  .footer-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #6699ff 20%, #ff6699 50%, #6699ff 80%, transparent);
    background-size: 200% 100%;
    animation: decorationSlide 3s linear infinite;
  }

  @keyframes decorationSlide {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 0%;
    }
  }

  .footer-content {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-logo {
    margin-bottom: 1.5rem;
  }

  .footer-logo-img {
    width: 80px;
    height: auto;
    filter: drop-shadow(0 0 10px rgba(102, 153, 255, 0.5));
    animation: footerLogoFloat 3s ease-in-out infinite;
  }

  @keyframes footerLogoFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .footer-text {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #6699ff 0%, #ff6699 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .footer-theme {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .footer-links {
    margin-bottom: 2rem;
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    color: #6699ff;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    background: rgba(102, 153, 255, 0.1);
    border: 2px solid rgba(102, 153, 255, 0.3);
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .footer-link:hover {
    color: #ff6699;
    background: rgba(255, 102, 153, 0.1);
    border-color: rgba(255, 102, 153, 0.5);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102, 153, 255, 0.3);
  }

  .link-icon {
    font-size: 1.3rem;
    animation: iconBounce 2s ease-in-out infinite;
  }

  @keyframes iconBounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .footer-credits {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.1em;
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

  @keyframes pulse {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(102, 153, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(102, 153, 255, 0.8));
    }
  }

  @keyframes shimmer {
    0%, 100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.5);
    }
  }

  @keyframes glow {
    0%, 100% {
      text-shadow: 0 0 30px rgba(102, 153, 255, 0.5);
    }
    50% {
      text-shadow: 0 0 60px rgba(255, 102, 153, 0.8);
    }
  }

  @keyframes borderPulse {
    0%, 100% {
      border-color: rgba(102, 153, 255, 0.3);
      box-shadow: 0 0 20px rgba(102, 153, 255, 0.2);
    }
    50% {
      border-color: rgba(255, 102, 153, 0.5);
      box-shadow: 0 0 40px rgba(255, 102, 153, 0.4);
    }
  }

  @keyframes gradientMove {
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

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes cardFloat {
    from {
      opacity: 0;
      transform: translateY(40px) rotateX(-10deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }

  @keyframes statPulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 20px rgba(102, 153, 255, 0.2);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 40px rgba(102, 153, 255, 0.4);
    }
  }

  @media (max-width: 768px) {
    .page-container {
      cursor: auto;
    }

    .page-container * {
      cursor: auto;
    }

    .cursor-glow,
    .cursor-dot {
      display: none;
    }

    .back-button {
      top: 1rem;
      left: 1rem;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .event-details {
      flex-direction: column;
      gap: 1rem;
    }

    .detail-divider {
      width: 40px;
      height: 2px;
    }

    .main-title {
      font-size: clamp(2rem, 10vw, 4rem);
    }

    .year {
      font-size: clamp(2.5rem, 12vw, 6rem);
    }

    .hero-content {
      transform: none !important;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .page-container {
      cursor: auto;
    }

    .cursor-glow,
    .cursor-dot {
      display: none;
    }
  }
</style>
