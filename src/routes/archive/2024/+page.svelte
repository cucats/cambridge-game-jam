<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas;
  let scrollY = 0;
  let mouseX = 0;
  let mouseY = 0;

  const projects = [
    {
      title: 'Blight',
      prize: 'Most Popular & Best Gameplay',
      link: 'https://hex-26.itch.io/blight',
      image: '/2024/blight.png'
    },
    {
      title: 'Reflect Upon Your Actions',
      prize: 'Most Popular & Most Original',
      link: 'https://dylanmoss.itch.io/reflect-upon-you-actions',
      image: '/2024/reflect-upon-your-actions.png'
    },
    {
      title: 'Reflected',
      prize: 'Theme Winner',
      link: 'https://ekorrette.itch.io/reflected',
      image: '/2024/reflected.png'
    },
    {
      title: 'Asymmetry',
      prize: 'Best Gameplay',
      link: 'https://alex-davies.itch.io/asymmetry',
      image: '/2024/asymmetry.png'
    },
    {
      title: 'Coulda Woulda Buddha',
      prize: 'Best Presentation',
      link: 'https://greenwood672.itch.io/coulda-woulda-buddha',
      image: '/2024/coulda-woulda-buddha.png'
    }
  ];

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x4466ff, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xff6699, 1.5);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x66ffcc, 1.2);
    directionalLight2.position.set(-5, -5, 5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    const createLowPolyGeo = (radius, detail) => {
      return new THREE.IcosahedronGeometry(radius, detail);
    };

    const createMirrorMaterial = (color) => {
      return new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.5,
        flatShading: true
      });
    };

    const crystals = [];
    for (let i = 0; i < 15; i++) {
      const geo = createLowPolyGeo(Math.random() * 1.5 + 0.5, 0);
      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.6);
      const mat = createMirrorMaterial(color);
      const mesh = new THREE.Mesh(geo, mat);
      
      mesh.position.x = (Math.random() - 0.5) * 30;
      mesh.position.y = (Math.random() - 0.5) * 30;
      mesh.position.z = (Math.random() - 0.5) * 20;
      
      mesh.rotation.x = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;
      
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.02,
        floatSpeed: Math.random() * 0.001 + 0.001,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      crystals.push(mesh);
      scene.add(mesh);
    };

    const mirrorShards = [];
    for (let i = 0; i < 25; i++) {
      const size = Math.random() * 2 + 0.5;
      const geo = new THREE.PlaneGeometry(size, size);
      const vertices = geo.attributes.position.array;
      for (let j = 0; j < vertices.length; j += 3) {
        vertices[j + 2] = (Math.random() - 0.5) * 0.3;
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0xccddff,
        metalness: 1.0,
        roughness: 0.05,
        side: THREE.DoubleSide,
        flatShading: true
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = (Math.random() - 0.5) * 40;
      mesh.position.y = (Math.random() - 0.5) * 40;
      mesh.position.z = (Math.random() - 0.5) * 25;
      
      mesh.rotation.x = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;
      
      mesh.userData = {
        rotSpeed: (Math.random() - 0.5) * 0.015,
        floatSpeed: Math.random() * 0.002 + 0.001,
        floatOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.003 + 0.002
      };
      
      mirrorShards.push(mesh);
      scene.add(mesh);
    }

    const centerCrystal = new THREE.Mesh(
      createLowPolyGeo(2.5, 1),
      createMirrorMaterial(0x8844ff)
    );
    centerCrystal.position.y = 2;
    scene.add(centerCrystal);

    const torusGeo = new THREE.TorusGeometry(4, 0.15, 4, 8);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xff66aa,
      metalness: 0.9,
      roughness: 0.1,
      flatShading: true
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.y = 2;
    torus.rotation.x = Math.PI / 2;
    scene.add(torus);

    const particles = [];
    const particleGeo = new THREE.IcosahedronGeometry(0.1, 0);
    for (let i = 0; i < 100; i++) {
      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
      const mat = new THREE.MeshBasicMaterial({ color });
      const particle = new THREE.Mesh(particleGeo, mat);
      
      particle.position.x = (Math.random() - 0.5) * 50;
      particle.position.y = (Math.random() - 0.5) * 50;
      particle.position.z = (Math.random() - 0.5) * 30;
      
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      
      particles.push(particle);
      scene.add(particle);
    }

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      crystals.forEach((crystal, idx) => {
        crystal.rotation.x += crystal.userData.rotSpeedX;
        crystal.rotation.y += crystal.userData.rotSpeedY;
        crystal.rotation.z += crystal.userData.rotSpeedZ;
        
        crystal.position.y += Math.sin(time * crystal.userData.floatSpeed + crystal.userData.floatOffset) * 0.01;
      });

      mirrorShards.forEach((shard, idx) => {
        shard.rotation.z += shard.userData.rotSpeed;
        shard.position.y += Math.sin(time * shard.userData.floatSpeed + shard.userData.floatOffset) * 0.008;
        
        const wobble = Math.sin(time * shard.userData.wobbleSpeed) * 0.1;
        shard.rotation.x += wobble * 0.01;
        shard.rotation.y += wobble * 0.01;
      });

      centerCrystal.rotation.y = time * 0.3;
      centerCrystal.rotation.x = Math.sin(time * 0.5) * 0.2;
      centerCrystal.position.y = 2 + Math.sin(time * 0.8) * 0.5;

      torus.rotation.z = time * 0.2;
      torus.scale.setScalar(1 + Math.sin(time * 1.5) * 0.1);

      particles.forEach(particle => {
        particle.position.add(particle.userData.velocity);
        
        if (Math.abs(particle.position.x) > 25) particle.userData.velocity.x *= -1;
        if (Math.abs(particle.position.y) > 25) particle.userData.velocity.y *= -1;
        if (Math.abs(particle.position.z) > 15) particle.userData.velocity.z *= -1;
      });

      camera.position.x = Math.sin(mouseX * 0.5) * 2;
      camera.position.y = Math.sin(mouseY * 0.5) * 2 + (scrollY * 0.001);
      camera.lookAt(0, 2, 0);

      pointLight.position.x = Math.sin(time * 0.5) * 15;
      pointLight.position.z = Math.cos(time * 0.5) * 15;

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

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
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
  <title>Cambridge Game Jam 2024 - Reflection</title>
</svelte:head>

<div class="page-2024">
  <canvas bind:this={canvas} class="webgl"></canvas>
  
  <div class="content">
    <section class="hero">
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
      </div>
      <h1 class="title">
        <span class="title-line">Cambridge</span>
        <span class="title-line">Game Jam</span>
        <span class="title-year">2024</span>
      </h1>
      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-text">Reflection</span>
      </div>
      <div class="event-details">
        <div class="detail-item">
          <span class="detail-label">Duration</span>
          <span class="detail-value">9th - 11th February</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Submissions</span>
          <span class="detail-value">23 Games</span>
        </div>
      </div>
    </section>

    <section class="projects">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        {#each projects as project, i}
          <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-card" style="--delay: {i * 0.1}s">
            <div class="project-image-wrapper">
              <img src={project.image} alt={project.title} class="project-image" />
              <div class="project-overlay"></div>
            </div>
            <div class="project-info">
              <h3 class="project-title">{project.title}</h3>
              <p class="project-prize">{project.prize}</p>
            </div>
          </a>
        {/each}
      </div>
      <a href="https://itch.io/jam/camgamejam2024" target="_blank" rel="noopener noreferrer" class="all-submissions-btn">
        View All 23 Submissions
      </a>
    </section>

    <section class="info-section">
      <div class="info-grid">
        <div class="info-card">
          <h3 class="info-title">The Event</h3>
          <p class="info-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        </div>
        <div class="info-card">
          <h3 class="info-title">The Theme</h3>
          <p class="info-text">Reflection challenged developers to explore duality, mirrors, and introspection. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
        </div>
        <div class="info-card">
          <h3 class="info-title">The Results</h3>
          <p class="info-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Twenty-three incredible games were created over the weekend, showcasing creativity and technical prowess from Cambridge's finest developers.</p>
        </div>
      </div>
    </section>

    <footer class="footer-2024">
      <div class="footer-content">
        <div class="footer-branding">
          <img src="/2024/logo.png" alt="CGJ 2024" class="footer-logo" />
          <p class="footer-tagline">Reflecting on Innovation</p>
        </div>
        <div class="footer-links">
          <a href="/archive" class="footer-link">Archive</a>
          <a href="/" class="footer-link">Home</a>
          <a href="/code-of-conduct" class="footer-link">Code of Conduct</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 Cambridge Game Jam. All rights reserved.</p>
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

  .page-2024 {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%);
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .webgl {
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .logo-container {
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  .logo {
    width: 150px;
    height: 150px;
    filter: drop-shadow(0 0 30px rgba(136, 68, 255, 0.6));
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { filter: drop-shadow(0 0 30px rgba(136, 68, 255, 0.6)); }
    50% { filter: drop-shadow(0 0 50px rgba(136, 68, 255, 0.9)); }
  }

  .title {
    margin: 0;
    font-size: clamp(2rem, 8vw, 6rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.1;
  }

  .title-line {
    display: block;
    background: linear-gradient(135deg, #ff66aa 0%, #8844ff 50%, #66ffcc 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s ease-in-out infinite;
    background-size: 200% 200%;
  }

  @keyframes shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .title-year {
    display: block;
    font-size: 0.6em;
    margin-top: 0.5rem;
    color: #66ffcc;
    text-shadow: 0 0 30px rgba(102, 255, 204, 0.8);
    animation: glow 2s ease-in-out infinite;
  }

  @keyframes glow {
    0%, 100% { text-shadow: 0 0 30px rgba(102, 255, 204, 0.8); }
    50% { text-shadow: 0 0 50px rgba(102, 255, 204, 1); }
  }

  .theme-badge {
    margin: 3rem 0;
    padding: 1.5rem 3rem;
    background: rgba(136, 68, 255, 0.2);
    border: 2px solid rgba(136, 68, 255, 0.6);
    border-radius: 50px;
    backdrop-filter: blur(10px);
    animation: borderGlow 3s ease-in-out infinite;
  }

  @keyframes borderGlow {
    0%, 100% { 
      border-color: rgba(136, 68, 255, 0.6);
      box-shadow: 0 0 20px rgba(136, 68, 255, 0.3);
    }
    50% { 
      border-color: rgba(255, 102, 170, 0.8);
      box-shadow: 0 0 40px rgba(255, 102, 170, 0.5);
    }
  }

  .theme-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
  }

  .theme-text {
    display: block;
    font-size: 2.5rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, #ff66aa, #8844ff, #66ffcc);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .event-details {
    display: flex;
    gap: 3rem;
    margin-top: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .detail-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(136, 68, 255, 0.3);
  }

  .detail-label {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.6);
  }

  .detail-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #66ffcc;
  }

  .projects {
    padding: 6rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    text-align: center;
    margin-bottom: 4rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, #ff66aa, #8844ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .project-card {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.4s ease;
    text-decoration: none;
    color: inherit;
    animation: slideUp 0.6s ease-out backwards;
    animation-delay: var(--delay);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .project-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(136, 68, 255, 0.4);
    border-color: rgba(136, 68, 255, 0.6);
  }

  .project-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    overflow: hidden;
  }

  .project-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .project-card:hover .project-image {
    transform: scale(1.1);
  }

  .project-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(136, 68, 255, 0.3), rgba(255, 102, 170, 0.3));
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .project-card:hover .project-overlay {
    opacity: 1;
  }

  .project-info {
    padding: 1.5rem;
  }

  .project-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #ffffff;
  }

  .project-prize {
    font-size: 0.875rem;
    color: #66ffcc;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .all-submissions-btn {
    display: block;
    width: fit-content;
    margin: 3rem auto 0;
    padding: 1.5rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #ffffff;
    background: linear-gradient(135deg, #8844ff, #ff66aa);
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(136, 68, 255, 0.3);
  }

  .all-submissions-btn:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 50px rgba(136, 68, 255, 0.5);
  }

  .info-section {
    padding: 6rem 2rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .info-card {
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .info-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(136, 68, 255, 0.4);
    transform: translateY(-5px);
  }

  .info-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #ff66aa;
  }

  .info-text {
    font-size: 1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .footer-2024 {
    padding: 4rem 2rem 2rem;
    background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .footer-branding {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .footer-logo {
    width: 60px;
    height: 60px;
    filter: drop-shadow(0 0 20px rgba(136, 68, 255, 0.5));
  }

  .footer-tagline {
    font-size: 1.125rem;
    font-weight: 600;
    color: #8844ff;
    margin: 0;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .footer-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
  }

  .footer-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #ff66aa, #8844ff);
    transition: width 0.3s ease;
  }

  .footer-link:hover {
    color: #ffffff;
  }

  .footer-link:hover::after {
    width: 100%;
  }

  .footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .event-details {
      gap: 1rem;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .footer-content {
      flex-direction: column;
      text-align: center;
    }

    .footer-branding {
      flex-direction: column;
    }
  }
</style>
