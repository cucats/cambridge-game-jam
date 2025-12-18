<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const projects = [
    {
      src: "/2023/inferno-rising.png",
      title: "Inferno Rising",
      prize: "Popular Vote",
      link: "https://firedemon111.itch.io/inferno-rising",
    },
    {
      src: "/2023/mayi-garden.png",
      title: "MAYI Garden",
      prize: "Best for Theme",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      link: "https://mxbi.itch.io/beaneth-the-earth",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      link: "https://joeoc.itch.io/deck-of-dwarves",
    },
  ];

  let canvas;
  let scene, camera, renderer, particles, crystals = [];

  onMount(() => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.position.z = 15;
    camera.position.y = 0;

    const ambientLight = new THREE.AmbientLight(0x4a3728, 0.3);
    scene.add(ambientLight);

    const createStalactite = (x, y, z, height) => {
      const geometry = new THREE.ConeGeometry(0.3 + Math.random() * 0.2, height, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x5a4a3a,
        shininess: 10,
        flatShading: true
      });
      const stalactite = new THREE.Mesh(geometry, material);
      stalactite.position.set(x, y, z);
      stalactite.rotation.x = Math.PI;
      scene.add(stalactite);
      return stalactite;
    };

    const createStalagmite = (x, y, z, height) => {
      const geometry = new THREE.ConeGeometry(0.3 + Math.random() * 0.2, height, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x4a3a2a,
        shininess: 10,
        flatShading: true
      });
      const stalagmite = new THREE.Mesh(geometry, material);
      stalagmite.position.set(x, y, z);
      scene.add(stalagmite);
      return stalagmite;
    };

    const createCrystal = (x, y, z, color) => {
      const geometry = new THREE.OctahedronGeometry(0.3 + Math.random() * 0.3, 0);
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 100,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.set(x, y, z);
      crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      const light = new THREE.PointLight(color, 1, 5);
      light.position.copy(crystal.position);
      scene.add(light);
      
      scene.add(crystal);
      return { mesh: crystal, light: light, speed: 0.5 + Math.random() * 1 };
    };

    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30 - 10;
      createStalactite(x, 8 + Math.random() * 2, z, 2 + Math.random() * 3);
      createStalagmite(x + 1, -8 - Math.random() * 2, z - 1, 2 + Math.random() * 3);
    }

    const crystalColors = [0x4dd0e1, 0x9c27b0, 0xff6b9d, 0x00e676, 0xffd54f];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 30 - 10;
      const color = crystalColors[Math.floor(Math.random() * crystalColors.length)];
      crystals.push(createCrystal(x, y, z, color));
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 40;
      positions[i + 2] = (Math.random() - 0.5) * 50;
      
      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = Math.random() * 0.02;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x88ddff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);

      const positions = particles.geometry.attributes.position.array;
      const velocities = particles.geometry.attributes.velocity.array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        if (positions[i + 1] > 20) {
          positions[i + 1] = -20;
        }
        if (Math.abs(positions[i]) > 25) {
          positions[i] = (Math.random() - 0.5) * 50;
        }
        if (Math.abs(positions[i + 2]) > 25) {
          positions[i + 2] = (Math.random() - 0.5) * 50;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;

      crystals.forEach((crystal, index) => {
        crystal.mesh.rotation.x += 0.01 * crystal.speed;
        crystal.mesh.rotation.y += 0.01 * crystal.speed;
        
        const pulse = Math.sin(Date.now() * 0.001 * crystal.speed + index) * 0.3 + 0.7;
        crystal.light.intensity = pulse;
      });

      camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
      camera.position.y = Math.cos(Date.now() * 0.00015) * 1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  });
</script>

<div class="cave-container">
  <canvas bind:this={canvas} class="cave-canvas"></canvas>
  
  <div class="content-overlay">
    <div class="hero-section">
      <div class="glow-text">
        <h1 class="title">{title}</h1>
        <div class="theme-badge">{theme}</div>
        <p class="duration">{duration}</p>
        <p class="submissions">{submissions} Submissions</p>
      </div>
    </div>

    <div class="featured-section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        {#each projects as project}
          <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-card">
            <div class="project-image-wrapper">
              <img src={project.src} alt={project.title} class="project-image" />
              <div class="project-overlay">
                <div class="project-info">
                  <h3 class="project-title">{project.title}</h3>
                  <div class="project-prize">{project.prize}</div>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>

    <div class="all-submissions">
      <a href="https://itch.io/jam/camgamejam2023" target="_blank" rel="noopener noreferrer" class="view-all-btn">
        View All Submissions
      </a>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow-x: hidden;
  }

  .cave-container {
    position: relative;
    width: 100vw;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0604 0%, #1a120e 50%, #2a1810 100%);
    overflow-x: hidden;
  }

  .cave-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .content-overlay {
    position: relative;
    z-index: 2;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .glow-text {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  .title {
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: 900;
    color: #fff;
    text-shadow: 
      0 0 10px rgba(77, 208, 225, 0.8),
      0 0 20px rgba(77, 208, 225, 0.6),
      0 0 30px rgba(77, 208, 225, 0.4),
      0 0 40px rgba(156, 39, 176, 0.3),
      0 5px 10px rgba(0, 0, 0, 0.8);
    margin: 0 0 2rem 0;
    animation: glow-pulse 3s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% {
      text-shadow: 
        0 0 10px rgba(77, 208, 225, 0.8),
        0 0 20px rgba(77, 208, 225, 0.6),
        0 0 30px rgba(77, 208, 225, 0.4),
        0 0 40px rgba(156, 39, 176, 0.3),
        0 5px 10px rgba(0, 0, 0, 0.8);
    }
    50% {
      text-shadow: 
        0 0 20px rgba(77, 208, 225, 1),
        0 0 30px rgba(77, 208, 225, 0.8),
        0 0 40px rgba(77, 208, 225, 0.6),
        0 0 50px rgba(156, 39, 176, 0.5),
        0 5px 10px rgba(0, 0, 0, 0.8);
    }
  }

  .theme-badge {
    display: inline-block;
    padding: 0.8rem 2rem;
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.3), rgba(77, 208, 225, 0.3));
    border: 2px solid rgba(77, 208, 225, 0.5);
    border-radius: 50px;
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    font-weight: 700;
    color: #4dd0e1;
    text-transform: uppercase;
    letter-spacing: 2px;
    box-shadow: 
      0 0 20px rgba(77, 208, 225, 0.4),
      inset 0 0 20px rgba(77, 208, 225, 0.1);
    animation: badge-glow 2s ease-in-out infinite;
    margin-bottom: 2rem;
  }

  @keyframes badge-glow {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(77, 208, 225, 0.4),
        inset 0 0 20px rgba(77, 208, 225, 0.1);
    }
    50% {
      box-shadow: 
        0 0 30px rgba(77, 208, 225, 0.6),
        inset 0 0 30px rgba(77, 208, 225, 0.2);
    }
  }

  .duration {
    font-size: clamp(1.2rem, 3vw, 2rem);
    color: #ffd54f;
    font-weight: 600;
    margin: 1rem 0;
    text-shadow: 0 2px 10px rgba(255, 213, 79, 0.5);
  }

  .submissions {
    font-size: clamp(1rem, 2vw, 1.5rem);
    color: #ff6b9d;
    font-weight: 600;
    text-shadow: 0 2px 10px rgba(255, 107, 157, 0.5);
  }

  .featured-section {
    padding: 4rem 0;
    margin-top: 2rem;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    color: #fff;
    text-align: center;
    margin-bottom: 3rem;
    text-shadow: 
      0 0 10px rgba(77, 208, 225, 0.6),
      0 0 20px rgba(156, 39, 176, 0.4),
      0 3px 10px rgba(0, 0, 0, 0.8);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 1rem;
  }

  .project-card {
    position: relative;
    display: block;
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    background: rgba(42, 24, 16, 0.6);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(77, 208, 225, 0.2);
    animation: card-float 4s ease-in-out infinite;
    animation-delay: calc(var(--index) * 0.2s);
  }

  .project-card:nth-child(1) { --index: 0; }
  .project-card:nth-child(2) { --index: 1; }
  .project-card:nth-child(3) { --index: 2; }
  .project-card:nth-child(4) { --index: 3; }
  .project-card:nth-child(5) { --index: 4; }

  @keyframes card-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .project-card:hover {
    transform: translateY(-15px) scale(1.02);
    box-shadow: 
      0 20px 40px rgba(77, 208, 225, 0.4),
      0 0 40px rgba(156, 39, 176, 0.3);
    border-color: rgba(77, 208, 225, 0.6);
  }

  .project-image-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
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
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(10, 6, 4, 0.95), transparent);
    padding: 1.5rem;
    transform: translateY(0);
    transition: transform 0.4s ease;
  }

  .project-info {
    color: #fff;
  }

  .project-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #4dd0e1;
    text-shadow: 0 2px 10px rgba(77, 208, 225, 0.5);
  }

  .project-prize {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: linear-gradient(135deg, rgba(255, 213, 79, 0.2), rgba(255, 107, 157, 0.2));
    border: 1px solid rgba(255, 213, 79, 0.5);
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #ffd54f;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .all-submissions {
    text-align: center;
    padding: 4rem 0;
    margin-bottom: 4rem;
  }

  .view-all-btn {
    display: inline-block;
    padding: 1.2rem 3rem;
    background: linear-gradient(135deg, rgba(77, 208, 225, 0.3), rgba(156, 39, 176, 0.3));
    border: 3px solid rgba(77, 208, 225, 0.6);
    border-radius: 50px;
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.4s ease;
    box-shadow: 
      0 10px 30px rgba(77, 208, 225, 0.3),
      inset 0 0 20px rgba(77, 208, 225, 0.1);
    animation: btn-pulse 2s ease-in-out infinite;
  }

  @keyframes btn-pulse {
    0%, 100% {
      box-shadow: 
        0 10px 30px rgba(77, 208, 225, 0.3),
        inset 0 0 20px rgba(77, 208, 225, 0.1);
    }
    50% {
      box-shadow: 
        0 15px 40px rgba(77, 208, 225, 0.5),
        inset 0 0 30px rgba(77, 208, 225, 0.2);
    }
  }

  .view-all-btn:hover {
    transform: translateY(-5px) scale(1.05);
    background: linear-gradient(135deg, rgba(77, 208, 225, 0.5), rgba(156, 39, 176, 0.5));
    box-shadow: 
      0 20px 50px rgba(77, 208, 225, 0.5),
      inset 0 0 30px rgba(77, 208, 225, 0.2);
  }

  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .content-overlay {
      padding: 1rem;
    }

    .hero-section {
      min-height: 80vh;
    }
  }
</style>
