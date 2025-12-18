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
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "",
    },
  ];

  let canvas;
  let scrollY = 0;

  onMount(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    camera.position.y = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 2, 100);
    pointLight1.position.set(20, 30, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b35, 1.5, 80);
    pointLight2.position.set(-30, 20, -10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x9d4edd, 1.8, 90);
    pointLight3.position.set(0, -20, 30);
    scene.add(pointLight3);

    const stalactites = [];
    const stalagmites = [];
    
    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 15 + 5;
      const radius = Math.random() * 1.5 + 0.5;
      const geometry = new THREE.ConeGeometry(radius, height, 6);
      const material = new THREE.MeshStandardMaterial({
        color: 0x3a3a4a,
        roughness: 0.8,
        metalness: 0.2,
      });
      const stalactite = new THREE.Mesh(geometry, material);
      
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 150;
      stalactite.position.set(x, 40, z);
      stalactite.rotation.x = Math.PI;
      stalactite.userData = { initialY: 40, speed: Math.random() * 0.0002 + 0.0001 };
      
      scene.add(stalactite);
      stalactites.push(stalactite);
    }

    for (let i = 0; i < 35; i++) {
      const height = Math.random() * 12 + 4;
      const radius = Math.random() * 1.8 + 0.6;
      const geometry = new THREE.ConeGeometry(radius, height, 6);
      const material = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        roughness: 0.9,
        metalness: 0.1,
      });
      const stalagmite = new THREE.Mesh(geometry, material);
      
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 150;
      stalagmite.position.set(x, -30, z);
      stalagmite.userData = { initialY: -30, speed: Math.random() * 0.0003 + 0.0001 };
      
      scene.add(stalagmite);
      stalagmites.push(stalagmite);
    }

    const crystals = [];
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 1.5 + 0.3;
      const geometry = new THREE.OctahedronGeometry(size, 0);
      const colors = [0x4a9eff, 0xff6b35, 0x9d4edd, 0x06ffa5, 0xffbe0b];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.7,
      });
      
      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 120
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.userData = { 
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      };
      
      scene.add(crystal);
      crystals.push(crystal);

      const glowLight = new THREE.PointLight(color, 0.5, 15);
      glowLight.position.copy(crystal.position);
      scene.add(glowLight);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 150;
      positions[i + 2] = (Math.random() - 0.5) * 200;
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.03 + 0.01,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x8888aa,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const caveWalls = [];
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(
        Math.random() * 20 + 10,
        16,
        16
      );
      const material = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 1,
        metalness: 0,
        side: THREE.BackSide
      });
      const wall = new THREE.Mesh(geometry, material);
      wall.position.set(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 200 - 50
      );
      scene.add(wall);
      caveWalls.push(wall);
    }

    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      camera.position.x = Math.sin(time * 0.1) * 15;
      camera.position.y = 10 + Math.cos(time * 0.15) * 8 - scrollY * 0.05;
      camera.position.z = 50 + Math.sin(time * 0.05) * 10;
      camera.lookAt(0, 0, 0);

      pointLight1.position.x = Math.sin(time * 0.5) * 25;
      pointLight1.position.z = Math.cos(time * 0.5) * 25;
      
      pointLight2.position.y = 20 + Math.sin(time * 0.7) * 10;
      pointLight2.position.x = -30 + Math.cos(time * 0.4) * 15;

      pointLight3.position.x = Math.sin(time * 0.3) * 20;
      pointLight3.position.z = 30 + Math.cos(time * 0.6) * 20;

      crystals.forEach((crystal) => {
        crystal.rotation.y += crystal.userData.rotationSpeed;
        crystal.rotation.x += crystal.userData.rotationSpeed * 0.5;
        
        const pulse = Math.sin(time * crystal.userData.pulseSpeed + crystal.userData.pulseOffset);
        crystal.material.emissiveIntensity = 0.3 + pulse * 0.4;
      });

      stalactites.forEach((stalactite) => {
        stalactite.position.y = stalactite.userData.initialY + Math.sin(time * 2 + stalactite.position.x) * 0.5;
      });

      stalagmites.forEach((stalagmite) => {
        stalagmite.position.y = stalagmite.userData.initialY + Math.cos(time * 2 + stalagmite.position.x) * 0.3;
      });

      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        if (positions[i3 + 1] > 75) {
          positions[i3 + 1] = -75;
        }
        if (Math.abs(positions[i3]) > 100) {
          positions[i3] = (Math.random() - 0.5) * 200;
        }
        if (Math.abs(positions[i3 + 2]) > 100) {
          positions[i3 + 2] = (Math.random() - 0.5) * 200;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function handleScroll() {
      scrollY = window.scrollY;
    }

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
  <title>{title}</title>
</svelte:head>

<canvas bind:this={canvas} class="fixed inset-0 w-full h-full"></canvas>

<div class="relative z-10 min-h-screen">
  <div class="hero-section flex flex-col items-center justify-center min-h-screen px-4">
    <div class="cave-title-container animate-float">
      <h1 class="cave-title text-6xl md:text-8xl font-bold text-center mb-4">
        {title}
      </h1>
      <div class="cave-glow"></div>
    </div>
    
    <div class="theme-badge animate-pulse-slow">
      <div class="badge-glow"></div>
      <p class="text-2xl md:text-4xl font-semibold">{theme}</p>
    </div>
    
    <p class="text-xl md:text-2xl mt-6 cave-text">{duration}</p>
    <p class="text-lg md:text-xl mt-2 cave-text opacity-80">{submissions} Submissions</p>
    
    <div class="scroll-indicator mt-12 animate-bounce-slow">
      <div class="scroll-arrow"></div>
      <div class="scroll-arrow"></div>
      <div class="scroll-arrow"></div>
    </div>
  </div>

  <div class="projects-section py-20 px-4">
    <h2 class="text-5xl md:text-6xl font-bold text-center mb-16 cave-heading">
      Featured Projects
    </h2>
    
    <div class="projects-grid max-w-7xl mx-auto">
      {#each projects as project, i}
        <a 
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          class="project-card"
          style="animation-delay: {i * 0.1}s"
        >
          <div class="project-image-container">
            <img 
              src={project.src} 
              alt={project.alt}
              class="project-image"
            />
            <div class="project-overlay"></div>
            <div class="crystal-corner crystal-tl"></div>
            <div class="crystal-corner crystal-tr"></div>
            <div class="crystal-corner crystal-bl"></div>
            <div class="crystal-corner crystal-br"></div>
          </div>
          
          <div class="project-info">
            <h3 class="text-2xl font-bold mb-2">{project.title}</h3>
            {#if project.prize}
              <div class="prize-badge">
                <span class="prize-icon">◆</span>
                {project.prize}
              </div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  </div>

  <footer class="cave-footer py-12 px-4 text-center">
    <div class="footer-content max-w-4xl mx-auto">
      <p class="text-lg cave-text mb-4">Cambridge Game Jam 2023</p>
      <p class="cave-text opacity-70">A weekend of creativity beneath the earth</p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow-x: hidden;
    background: #0a0a0f;
  }

  canvas {
    pointer-events: none;
  }

  .hero-section {
    text-align: center;
    background: radial-gradient(ellipse at center, rgba(74, 158, 255, 0.1) 0%, transparent 70%);
  }

  .cave-title-container {
    position: relative;
    padding: 2rem;
  }

  .cave-title {
    background: linear-gradient(135deg, #4a9eff 0%, #9d4edd 50%, #ff6b35 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 20px rgba(74, 158, 255, 0.5));
    position: relative;
    z-index: 2;
  }

  .cave-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(74, 158, 255, 0.3) 0%, transparent 70%);
    filter: blur(40px);
    animation: pulse-glow 3s ease-in-out infinite;
    z-index: 1;
  }

  .theme-badge {
    position: relative;
    background: rgba(26, 26, 46, 0.8);
    border: 2px solid rgba(74, 158, 255, 0.5);
    border-radius: 50px;
    padding: 1rem 3rem;
    margin-top: 2rem;
    box-shadow: 0 0 30px rgba(74, 158, 255, 0.3), inset 0 0 20px rgba(74, 158, 255, 0.1);
  }

  .badge-glow {
    position: absolute;
    inset: -4px;
    background: linear-gradient(45deg, #4a9eff, #9d4edd, #ff6b35, #4a9eff);
    border-radius: 50px;
    opacity: 0.5;
    filter: blur(10px);
    animation: rotate-gradient 4s linear infinite;
    z-index: -1;
  }

  .cave-text {
    color: #b8c5d6;
    text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-left: 3px solid rgba(74, 158, 255, 0.8);
    border-bottom: 3px solid rgba(74, 158, 255, 0.8);
    transform: rotate(-45deg);
    filter: drop-shadow(0 0 5px rgba(74, 158, 255, 0.5));
  }

  .projects-section {
    background: linear-gradient(180deg, transparent 0%, rgba(26, 26, 46, 0.3) 50%, transparent 100%);
  }

  .cave-heading {
    background: linear-gradient(135deg, #ff6b35 0%, #9d4edd 50%, #4a9eff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 15px rgba(157, 78, 221, 0.4));
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    padding: 2rem;
  }

  .project-card {
    position: relative;
    display: block;
    background: rgba(26, 26, 46, 0.6);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(74, 158, 255, 0.2);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: fade-in-up 0.8s ease-out forwards;
    opacity: 0;
  }

  .project-card:hover {
    transform: translateY(-15px) scale(1.02);
    border-color: rgba(74, 158, 255, 0.6);
    box-shadow: 0 20px 60px rgba(74, 158, 255, 0.4), 0 0 40px rgba(157, 78, 221, 0.3);
  }

  .project-image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .project-card:hover .project-image {
    transform: scale(1.1);
  }

  .project-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(26, 26, 46, 0.8) 100%);
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .project-card:hover .project-overlay {
    opacity: 1;
  }

  .crystal-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    opacity: 0;
    transition: all 0.5s ease;
  }

  .crystal-tl {
    top: 10px;
    left: 10px;
    border-top: 3px solid #4a9eff;
    border-left: 3px solid #4a9eff;
    box-shadow: 0 0 10px #4a9eff;
  }

  .crystal-tr {
    top: 10px;
    right: 10px;
    border-top: 3px solid #9d4edd;
    border-right: 3px solid #9d4edd;
    box-shadow: 0 0 10px #9d4edd;
  }

  .crystal-bl {
    bottom: 10px;
    left: 10px;
    border-bottom: 3px solid #ff6b35;
    border-left: 3px solid #ff6b35;
    box-shadow: 0 0 10px #ff6b35;
  }

  .crystal-br {
    bottom: 10px;
    right: 10px;
    border-bottom: 3px solid #06ffa5;
    border-right: 3px solid #06ffa5;
    box-shadow: 0 0 10px #06ffa5;
  }

  .project-card:hover .crystal-corner {
    opacity: 1;
  }

  .project-info {
    padding: 1.5rem;
    color: #b8c5d6;
  }

  .project-info h3 {
    color: #e8f1ff;
    text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
  }

  .prize-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(74, 158, 255, 0.2);
    border: 1px solid rgba(74, 158, 255, 0.4);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    color: #4a9eff;
    box-shadow: 0 0 15px rgba(74, 158, 255, 0.2);
  }

  .prize-icon {
    color: #ffbe0b;
    filter: drop-shadow(0 0 5px #ffbe0b);
    animation: sparkle 2s ease-in-out infinite;
  }

  .cave-footer {
    background: linear-gradient(0deg, rgba(26, 26, 46, 0.5) 0%, transparent 100%);
    border-top: 1px solid rgba(74, 158, 255, 0.2);
  }

  .footer-content {
    position: relative;
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes rotate-gradient {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes sparkle {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 0.8;
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
  }

  @keyframes pulse-slow {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }

  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  @media (max-width: 768px) {
    .cave-title {
      font-size: 2.5rem;
    }
    
    .theme-badge p {
      font-size: 1.5rem;
    }
    
    .projects-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 1rem;
    }
  }
</style>
