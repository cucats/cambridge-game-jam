<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

  let canvasContainer;
  let renderer, scene, camera, controls;
  let frameId;
  const objects = [];

  const projects = [
    { title: "Blight", prize: "Most Popular & Best Gameplay", link: "https://hex-26.itch.io/blight" },
    { title: "Reflect Upon Your Actions", prize: "Most Popular & Most Original", link: "https://dylanmoss.itch.io/reflect-upon-you-actions" },
    { title: "Reflected", prize: "Theme Winner", link: "https://ekorrette.itch.io/reflected" },
    { title: "Asymmetry", prize: "Best Gameplay", link: "https://alex-davies.itch.io/asymmetry" },
    { title: "Coulda Woulda Buddha", prize: "Best Presentation", link: "https://greenwood672.itch.io/coulda-woulda-buddha" }
  ];

  onMount(() => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x110022);
    scene.fog = new THREE.Fog(0x110022, 10, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight2.position.set(-5, 10, -5);
    scene.add(pointLight2);

    const geometry = new THREE.CircleGeometry(40, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x777777
    });
    groundMirror.position.y = -0.1;
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    const lowPolyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      flatShading: true,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5,
      thickness: 1
    });

    for (let i = 0; i < 50; i++) {
      const radius = Math.random() * 1 + 0.2;
      const detail = 0; 
      const meshGeometry = new THREE.IcosahedronGeometry(radius, detail);
      const mesh = new THREE.Mesh(meshGeometry, lowPolyMaterial);
      
      mesh.position.x = (Math.random() - 0.5) * 30;
      mesh.position.y = Math.random() * 5 + 1;
      mesh.position.z = (Math.random() - 0.5) * 30;
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        initialY: mesh.position.y,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      scene.add(mesh);
      objects.push(mesh);
    }

    const largeCrystalGeo = new THREE.ConeGeometry(2, 6, 4);
    const largeCrystalMat = new THREE.MeshStandardMaterial({
      color: 0xaa00ff,
      flatShading: true,
      emissive: 0x220044,
      roughness: 0.2,
      metalness: 0.8
    });
    
    const centerCrystal = new THREE.Mesh(largeCrystalGeo, largeCrystalMat);
    centerCrystal.position.y = 3;
    scene.add(centerCrystal);
    objects.push(centerCrystal);
    centerCrystal.userData = { isCenter: true };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;

      pointLight.position.x = Math.sin(time * 0.5) * 10;
      pointLight.position.z = Math.cos(time * 0.5) * 10;
      pointLight.position.y = 10 + Math.sin(time * 0.3) * 5;

      pointLight2.position.x = Math.sin(time * 0.5 + Math.PI) * 10;
      pointLight2.position.z = Math.cos(time * 0.5 + Math.PI) * 10;
      pointLight2.position.y = 10 + Math.cos(time * 0.3) * 5;
      
      objects.forEach(obj => {
        if (obj.userData.isCenter) {
          obj.rotation.y += 0.01;
          obj.position.y = 3 + Math.sin(time) * 0.5;
          const scale = 1 + Math.sin(time * 2) * 0.1;
          obj.scale.set(scale, scale, scale);
        } else {
          obj.rotation.x += obj.userData.rotationSpeed.x;
          obj.rotation.y += obj.userData.rotationSpeed.y;
          obj.position.y = obj.userData.initialY + Math.sin(time * 2 + obj.userData.floatOffset) * 0.5;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      groundMirror.getRenderTarget().setSize(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (renderer) renderer.dispose();
      if (controls) controls.dispose();
    };
  });
</script>

<div class="page-container">
  <div bind:this={canvasContainer} class="canvas-container"></div>
  
  <div class="content-overlay">
    <div class="hero-section">
      <h1 class="glitch-text" data-text="CAMBRIDGE GAME JAM 2024">CAMBRIDGE GAME JAM 2024</h1>
      <h2 class="subtitle">REFLECTION</h2>
      <p class="date">9th - 11th February</p>
    </div>

    <div class="projects-grid">
      {#each projects as project}
        <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-card">
          <div class="card-content">
            <h3>{project.title}</h3>
            <p>{project.prize}</p>
          </div>
        </a>
      {/each}
    </div>

    <div class="stats">
      <div class="stat-item">
        <span class="number">23</span>
        <span class="label">Submissions</span>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    background: #110022;
  }

  .page-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    font-family: 'Courier New', Courier, monospace;
    color: white;
  }

  .canvas-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .content-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2rem;
    box-sizing: border-box;
    background: radial-gradient(circle at center, transparent 0%, rgba(17, 0, 34, 0.4) 100%);
  }

  .hero-section {
    text-align: center;
    margin-top: 5vh;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  h1 {
    font-size: 4rem;
    font-weight: 900;
    letter-spacing: 0.5rem;
    margin: 0;
    text-transform: uppercase;
    position: relative;
    display: inline-block;
  }

  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch-text::before {
    left: 2px;
    text-shadow: -1px 0 red;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim-1 5s infinite linear alternate-reverse;
  }

  .glitch-text::after {
    left: -2px;
    text-shadow: -1px 0 blue;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim-2 5s infinite linear alternate-reverse;
  }

  @keyframes glitch-anim-1 {
    0% { clip: rect(20px, 9999px, 80px, 0); }
    20% { clip: rect(60px, 9999px, 10px, 0); }
    40% { clip: rect(10px, 9999px, 90px, 0); }
    60% { clip: rect(80px, 9999px, 20px, 0); }
    80% { clip: rect(30px, 9999px, 70px, 0); }
    100% { clip: rect(90px, 9999px, 40px, 0); }
  }

  @keyframes glitch-anim-2 {
    0% { clip: rect(30px, 9999px, 10px, 0); }
    20% { clip: rect(80px, 9999px, 50px, 0); }
    40% { clip: rect(20px, 9999px, 90px, 0); }
    60% { clip: rect(70px, 9999px, 30px, 0); }
    80% { clip: rect(50px, 9999px, 60px, 0); }
    100% { clip: rect(10px, 9999px, 80px, 0); }
  }

  .subtitle {
    font-size: 2rem;
    letter-spacing: 1rem;
    margin: 1rem 0;
    opacity: 0.8;
  }

  .date {
    font-size: 1.2rem;
    opacity: 0.7;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    width: 80%;
    margin: 0 auto;
    pointer-events: auto;
  }

  .project-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    text-decoration: none;
    color: white;
    transition: all 0.3s ease;
    text-align: center;
  }

  .project-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 0, 255, 0.5);
  }

  .project-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #00ffff;
  }

  .project-card p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .stats {
    text-align: center;
    margin-bottom: 2rem;
  }

  .stat-item {
    display: inline-block;
    padding: 1rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    background: rgba(0, 0, 0, 0.3);
  }

  .number {
    font-size: 2rem;
    font-weight: bold;
    margin-right: 0.5rem;
    color: #ff00ff;
  }

  .label {
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
      letter-spacing: 0.2rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
      letter-spacing: 0.5rem;
    }

    .projects-grid {
      width: 95%;
      grid-template-columns: 1fr;
    }
  }
</style>
