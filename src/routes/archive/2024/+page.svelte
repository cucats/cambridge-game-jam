<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas;
  let container;

  const projects = [
    { title: "Blight", link: "https://hex-26.itch.io/blight", prize: "Most Popular & Best Gameplay" },
    { title: "Reflect Upon Your Actions", link: "https://dylanmoss.itch.io/reflect-upon-you-actions", prize: "Most Popular & Most Original" },
    { title: "Reflected", link: "https://ekorrette.itch.io/reflected", prize: "Theme Winner" },
    { title: "Asymmetry", link: "https://alex-davies.itch.io/asymmetry", prize: "Best Gameplay" },
    { title: "Coulda Woulda Buddha", link: "https://greenwood672.itch.io/coulda-woulda-buddha", prize: "Best Presentation" },
    { title: "All Submissions", link: "https://itch.io/jam/camgamejam2024", prize: "View all entries" },
  ];

  onMount(() => {
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const reflectionGroup = new THREE.Group();
    reflectionGroup.scale.y = -1;
    scene.add(reflectionGroup);

    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff6b6b,
      flatShading: true,
      shininess: 0,
    });
    
    const material2 = new THREE.MeshPhongMaterial({
      color: 0x4ecdc4,
      flatShading: true,
      shininess: 0,
    });

    const objects = [];

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(geometry, Math.random() > 0.5 ? material : material2);
      mesh.position.x = (Math.random() - 0.5) * 20;
      mesh.position.y = Math.random() * 4 + 1; 
      mesh.position.z = (Math.random() - 0.5) * 20 - 5;
      
      const scale = Math.random() * 0.5 + 0.5;
      mesh.scale.set(scale, scale, scale);
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotationSpeed: (Math.random() * 0.02) + 0.005,
        floatSpeed: (Math.random() * 0.01) + 0.005,
        initialY: mesh.position.y,
        floatOffset: Math.random() * Math.PI * 2
      };

      mainGroup.add(mesh);
      
      const reflectMesh = mesh.clone();
      reflectionGroup.add(reflectMesh);
      
      objects.push({ main: mesh, reflect: reflectMesh });
    }

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.8
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    scene.add(plane);

    const gridHelper = new THREE.GridHelper(100, 50, 0x4ecdc4, 0x2a2a4e);
    scene.add(gridHelper);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff6b6b, 2, 20);
    pointLight.position.set(-5, 5, 0);
    scene.add(pointLight);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      objects.forEach(obj => {
        const { main, reflect } = obj;
        
        main.rotation.x += main.userData.rotationSpeed;
        main.rotation.y += main.userData.rotationSpeed;
        
        main.position.y = main.userData.initialY + Math.sin(time * 2 + main.userData.floatOffset) * 0.5;

        reflect.rotation.x = main.rotation.x;
        reflect.rotation.y = main.rotation.y;
        reflect.position.copy(main.position);
      });
      
      camera.position.x = Math.sin(time * 0.1) * 2;
      camera.lookAt(0, 0, -5);

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

<div class="page-container" bind:this={container}>
  <canvas bind:this={canvas}></canvas>
  
  <div class="overlay">
    <div class="header">
      <h1>Cambridge Game Jam 2024</h1>
      <p class="subtitle">9th - 11th February</p>
      <div class="theme-box">
        <p class="theme-label">THEME</p>
        <h2 class="theme-title">REFLECTION</h2>
      </div>
    </div>

    <div class="projects-grid">
      {#each projects as project}
        <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-card">
          <h3>{project.title}</h3>
          <p>{project.prize}</p>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    background: #1a1a2e;
  }

  .page-container {
    position: relative;
    width: 100vw;
    height: 100vh;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    padding: 2rem;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
    text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
    pointer-events: auto;
  }

  h1 {
    font-size: 3rem;
    margin: 0;
    font-weight: 700;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 1.5rem;
    color: #a0a0c0;
    margin-top: 0.5rem;
  }

  .theme-box {
    margin-top: 2rem;
    border: 2px solid #4ecdc4;
    padding: 1rem 2rem;
    background: rgba(26, 26, 46, 0.8);
    backdrop-filter: blur(5px);
    display: inline-block;
  }

  .theme-label {
    font-size: 0.9rem;
    letter-spacing: 4px;
    margin: 0;
    color: #4ecdc4;
  }

  .theme-title {
    font-size: 2.5rem;
    margin: 0;
    text-transform: uppercase;
    background: linear-gradient(180deg, #fff, #a0a0c0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1000px;
    pointer-events: auto;
  }

  .project-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    color: white;
    transition: transform 0.2s, background 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .project-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    border-color: #4ecdc4;
  }

  .project-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #4ecdc4;
  }

  .project-card p {
    margin: 0;
    font-size: 0.9rem;
    color: #ccc;
  }
</style>
