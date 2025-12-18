<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { Reflector } from 'three/addons/objects/Reflector.js';

  let canvasContainer;
  let renderer, scene, camera, controls, mirrorGround;
  let animationId;
  let objects = [];
  let lights = [];
  
  const projects = [
    { title: "Blight", author: "Team Blight", link: "https://hex-26.itch.io/blight" },
    { title: "Reflect Upon Your Actions", author: "Dylan Moss", link: "https://dylanmoss.itch.io/reflect-upon-you-actions" },
    { title: "Reflected", author: "Ekorrette", link: "https://ekorrette.itch.io/reflected" },
    { title: "Asymmetry", author: "Alex Davies", link: "https://alex-davies.itch.io/asymmetry" },
    { title: "Coulda Woulda Buddha", author: "Greenwood672", link: "https://greenwood672.itch.io/coulda-woulda-buddha" }
  ];

  onMount(() => {
    document.body.classList.add('splash-2024');
    init();
    animate();

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      document.body.classList.remove('splash-2024');
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
      if (animationId) cancelAnimationFrame(animationId);
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
             if (Array.isArray(object.material)) {
               object.material.forEach(m => m.dispose());
             } else {
               object.material.dispose();
             }
          }
        });
      }
    };
  });

  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.Fog(0x050510, 10, 60);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; 
    controls.minDistance = 5;
    controls.maxDistance = 40;

    const ambientLight = new THREE.AmbientLight(0x222222); 
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 3, 50);
    pointLight1.position.set(5, 10, 5);
    scene.add(pointLight1);
    lights.push(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 3, 50);
    pointLight2.position.set(-5, 10, -5);
    scene.add(pointLight2);
    lights.push(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 2, 50);
    pointLight3.position.set(0, 15, 0);
    scene.add(pointLight3);
    lights.push(pointLight3);

    const geometry = new THREE.CircleGeometry(60, 64);
    mirrorGround = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x555555
    });
    mirrorGround.rotation.x = -Math.PI / 2;
    scene.add(mirrorGround);

    const shapes = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.DodecahedronGeometry(1, 0)
    ];

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.2,
      thickness: 1,
      flatShading: true
    });

    for (let i = 0; i < 80; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const mesh = new THREE.Mesh(shape, material.clone());
      
      mesh.material.color.setHSL(Math.random(), 0.8, 0.6);
      mesh.material.emissive = mesh.material.color.clone().multiplyScalar(0.2);
      
      mesh.position.x = (Math.random() - 0.5) * 40;
      mesh.position.y = Math.random() * 8 + 1; 
      mesh.position.z = (Math.random() - 0.5) * 40;
      
      mesh.scale.setScalar(Math.random() * 1.5 + 0.5);
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.04,
          y: (Math.random() - 0.5) * 0.04,
          z: (Math.random() - 0.5) * 0.04
        },
        floatSpeed: Math.random() * 0.03 + 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: mesh.position.y
      };

      scene.add(mesh);
      objects.push(mesh);
    }
    
    // Add some "shattered mirror" fragments floating higher
    const fragmentGeo = new THREE.ConeGeometry(0.3, 1.5, 3);
    const fragmentMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 1.0,
      roughness: 0.0,
      flatShading: true
    });
    
    for(let i=0; i<40; i++) {
        const frag = new THREE.Mesh(fragmentGeo, fragmentMat);
        frag.position.x = (Math.random() - 0.5) * 30;
        frag.position.y = Math.random() * 10 + 5;
        frag.position.z = (Math.random() - 0.5) * 30;
        frag.userData = {
            rotationSpeed: { x: Math.random()*0.1, y: Math.random()*0.1, z: Math.random()*0.1 },
            floatSpeed: Math.random() * 0.05,
            floatOffset: Math.random() * 100,
            baseY: frag.position.y
        };
        scene.add(frag);
        objects.push(frag);
    }
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;

    // Animate lights
    if(lights.length >= 2) {
        lights[0].position.x = Math.sin(time * 0.5) * 15;
        lights[0].position.z = Math.cos(time * 0.5) * 15;
        lights[1].position.x = Math.sin(time * 0.6 + 2) * 15;
        lights[1].position.z = Math.cos(time * 0.6 + 2) * 15;
    }

    objects.forEach((obj, idx) => {
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;
      
      // Crazy floating
      obj.position.y = obj.userData.baseY + Math.sin(time * (1 + idx%3) + obj.userData.floatOffset) * (0.5 + (idx%5)*0.1);
      
      // Pulse scale slightly
      const scalePulse = 1 + Math.sin(time * 2 + idx) * 0.1;
      obj.scale.x = obj.scale.y = obj.scale.z = scalePulse * (obj.geometry.type === 'ConeGeometry' ? 1 : (obj.userData.baseScale || 1));
      
      if(!obj.userData.baseScale) obj.userData.baseScale = 1; // Hacky init
    });

    controls.update();
    renderer.render(scene, camera);
  }
</script>

<div class="page-container">
  <div bind:this={canvasContainer} class="canvas-container"></div>
  
  <div class="content-overlay">
    <div class="hero">
      <h1 class="glitch-text">Cambridge Game Jam 2024</h1>
      <h2 class="theme-text">THEME: REFLECTION</h2>
      <p class="date">9th - 11th February</p>
    </div>

    <div class="projects-grid">
      {#each projects as project}
        <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-card">
          <h3>{project.title}</h3>
          <p>by {project.author}</p>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(body.splash-2024) {
    margin: 0;
    overflow: hidden;
    background: #050510;
  }

  .page-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
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
    color: white;
    font-family: 'Courier New', Courier, monospace;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }

  .hero {
    text-align: center;
    margin-top: 5vh;
  }

  h1 {
    font-size: 4rem;
    margin: 0;
    font-weight: 800;
    letter-spacing: -2px;
    text-transform: uppercase;
    background: linear-gradient(to right, #00ffff, #ff00ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from { text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff; }
    to { text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff; }
  }

  .theme-text {
    font-size: 2rem;
    margin: 1rem 0;
    opacity: 0.9;
    letter-spacing: 5px;
  }

  .date {
    font-size: 1.5rem;
    opacity: 0.8;
  }

  .projects-grid {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 5vh;
    pointer-events: auto;
  }

  .project-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    width: 200px;
    text-align: center;
    transition: all 0.3s;
    text-decoration: none;
    color: white;
  }

  .project-card:hover {
    transform: translateY(-5px) scale(1.05);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  }

  .project-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #00ffff;
  }

  .project-card p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.7;
    color: #eee;
  }

  @media (max-width: 768px) {
    h1 { font-size: 2.5rem; }
    .theme-text { font-size: 1.5rem; }
    .project-card { width: 140px; padding: 1rem; }
  }
</style>
