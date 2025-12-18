<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const theme = "Reflection";

  const projects = [
    {
      title: "Blight",
      src: "/2024/blight.png",
      alt: "Blight",
      link: "https://hex-26.itch.io/blight",
      prize: "Most Popular and Best Gameplay"
    },
    {
      title: "Reflect Upon Your Actions",
      src: "/2024/reflect-upon-your-actions.png",
      alt: "Reflect Upon Your Actions",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      prize: "Most Popular and Most Original"
    },
    {
      title: "Reflected",
      src: "/2024/reflected.png",
      alt: "Reflected",
      link: "https://ekorrette.itch.io/reflected",
      prize: "Theme Winner"
    },
    {
      title: "Asymmetry",
      src: "/2024/asymmetry.png",
      alt: "Asymmetry",
      link: "https://alex-davies.itch.io/asymmetry",
      prize: "Best Gameplay"
    },
    {
      title: "Coulda Woulda Buddha",
      src: "/2024/coulda-woulda-buddha.png",
      alt: "Coulda Woulda Buddha",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
      prize: "Best Presentation"
    },
    {
      title: "All Submissions",
      src: "/2024/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2024",
      prize: ""
    }
  ];

  let canvasContainer;
  let renderer, scene, camera, mirror;
  let animationId;
  let objects = [];

  onMount(() => {
    if (!canvasContainer) return;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xe94560, 2, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Mirror Floor
    const geometry = new THREE.PlaneGeometry(100, 100);
    mirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x777777
    });
    mirror.rotateX(-Math.PI / 2);
    scene.add(mirror);

    // Low Poly Objects (Floating Islands/Crystals)
    const material = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      roughness: 0.1,
      metalness: 0.1,
      flatShading: true
    });

    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f3460,
      roughness: 0.2,
      flatShading: true
    });

    for (let i = 0; i < 20; i++) {
      const geo = new THREE.IcosahedronGeometry(Math.random() * 2 + 0.5, 0);
      const mesh = new THREE.Mesh(geo, Math.random() > 0.5 ? material : highlightMaterial);
      
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 5 + 2;
      const z = (Math.random() - 0.5) * 40;
      
      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      scene.add(mesh);
      objects.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: y
      });
    }

    // Resize handler
    const handleResize = () => {
      if (!canvasContainer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mirror.getRenderTarget().setSize(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      );
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = (time) => {
      animationId = requestAnimationFrame(animate);

      // Rotate and float objects
      const t = time * 0.001;
      objects.forEach(obj => {
        obj.mesh.rotation.x += obj.rotSpeed.x;
        obj.mesh.rotation.y += obj.rotSpeed.y;
        obj.mesh.position.y = obj.initialY + Math.sin(t * obj.floatSpeed + obj.floatOffset) * 0.5;
      });

      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
    };
  });

  onDestroy(() => {
      if (typeof window !== 'undefined') {
          // Cleanup
      }
  })
</script>

<div class="splash-container">
  <div bind:this={canvasContainer} class="canvas-background"></div>
  
  <div class="content">
    <header class="hero">
      <h1>{title}</h1>
      <p class="date">{duration}</p>
      <div class="theme-container">
        <span>Theme:</span>
        <h2 class="theme glitch" data-text={theme}>{theme}</h2>
      </div>
    </header>

    <div class="projects-grid">
      {#each projects as project}
        <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-card">
          <div class="image-container">
            <img src={project.src} alt={project.alt} />
          </div>
          <div class="card-content">
            <h3>{project.title}</h3>
            {#if project.prize}
              <p class="prize">{project.prize}</p>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(footer) {
    display: none !important;
  }
  
  :global(body) {
    margin: 0;
    overflow-x: hidden;
    background-color: #1a1a2e;
  }

  .splash-container {
    position: relative;
    width: 100vw;
    min-height: 100vh;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    overflow: hidden;
  }

  .canvas-background {
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
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
  }

  .hero {
    text-align: center;
    margin-top: 5vh;
    margin-bottom: 5vh;
    text-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
    pointer-events: auto;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    letter-spacing: 2px;
  }

  .date {
    font-size: 1.2rem;
    opacity: 0.8;
  }

  .theme-container {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .theme {
    font-size: 4rem;
    text-transform: uppercase;
    color: #e94560;
    margin: 0;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
    padding-bottom: 4rem;
    pointer-events: auto;
  }

  .project-card {
    background: rgba(22, 33, 62, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    border-radius: 8px;
    text-decoration: none;
    color: white;
    transition: transform 0.3s ease, background 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .project-card:hover {
    transform: translateY(-5px);
    background: rgba(233, 69, 96, 0.2);
    border-color: #e94560;
  }

  .image-container {
    width: 100%;
    height: 160px;
    overflow: hidden;
    background: #0f3460;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .project-card:hover .image-container img {
    transform: scale(1.1);
  }

  .card-content {
    padding: 1.5rem;
    text-align: center;
  }

  .project-card h3 {
    margin: 0;
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  .prize {
    font-size: 0.9rem;
    color: #ffd700;
    font-style: italic;
    margin: 0;
  }

  .glitch {
    position: relative;
  }
  
  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch::before {
    left: 2px;
    text-shadow: -1px 0 #00ffff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }

  .glitch::after {
    left: -2px;
    text-shadow: -1px 0 #ff00ff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
  }

  @keyframes glitch-anim {
    0% { clip: rect(13px, 9999px, 81px, 0); }
    20% { clip: rect(66px, 9999px, 16px, 0); }
    40% { clip: rect(3px, 9999px, 54px, 0); }
    60% { clip: rect(51px, 9999px, 86px, 0); }
    80% { clip: rect(2px, 9999px, 96px, 0); }
    100% { clip: rect(27px, 9999px, 35px, 0); }
  }

  @keyframes glitch-anim2 {
    0% { clip: rect(65px, 9999px, 10px, 0); }
    20% { clip: rect(98px, 9999px, 4px, 0); }
    40% { clip: rect(20px, 9999px, 78px, 0); }
    60% { clip: rect(2px, 9999px, 20px, 0); }
    80% { clip: rect(56px, 9999px, 40px, 0); }
    100% { clip: rect(32px, 9999px, 63px, 0); }
  }

  @media (max-width: 768px) {
    h1 { font-size: 2rem; }
    .theme { font-size: 2.5rem; }
    .projects-grid { grid-template-columns: 1fr; }
  }
</style>