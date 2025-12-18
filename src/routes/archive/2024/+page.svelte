<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { browser } from '$app/environment';

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const theme = "Reflection";
  const projects = [
    { title: "Blight", prize: "Most Popular and Best Gameplay", link: "https://hex-26.itch.io/blight" },
    { title: "Reflect Upon Your Actions", prize: "Most Popular and Most Original", link: "https://dylanmoss.itch.io/reflect-upon-you-actions" },
    { title: "Reflected", prize: "Theme Winner", link: "https://ekorrette.itch.io/reflected" },
    { title: "Asymmetry", prize: "Best Gameplay", link: "https://alex-davies.itch.io/asymmetry" },
    { title: "Coulda Woulda Buddha", prize: "Best Presentation", link: "https://greenwood672.itch.io/coulda-woulda-buddha" }
  ];

  let canvas;

  onMount(() => {
    if (!browser) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 5, 50);
    pointLight1.position.set(-5, 5, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 5, 50);
    pointLight2.position.set(5, 2, 5);
    scene.add(pointLight2);

    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      flatShading: true,
      roughness: 0.1,
      metalness: 0.5
    });

    const objects = [];
    const reflectionObjects = [];

    for (let i = 0; i < 50; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      const s = Math.random() * 0.5 + 0.2;
      mesh.scale.set(s, s, s);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 20
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(mesh);
      objects.push({ mesh, speed: Math.random() * 0.02 + 0.005, offset: Math.random() * 100 });

      const rMesh = mesh.clone();
      rMesh.position.y = -mesh.position.y;
      rMesh.scale.y = -mesh.scale.y;
      rMesh.rotation.x = -mesh.rotation.x;
      rMesh.material = material.clone();
      rMesh.material.color.setHex(0x8888aa);
      rMesh.material.transparent = true;
      rMesh.material.opacity = 0.3;
      scene.add(rMesh);
      reflectionObjects.push(rMesh);
    }

    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.MeshBasicMaterial({ 
      color: 0x050510, 
      transparent: true, 
      opacity: 0.8,
      side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(planeGeo, planeMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    const clock = new THREE.Clock();

    function animate() {
      const time = clock.getElapsedTime();

      objects.forEach((obj, i) => {
        obj.mesh.rotation.x += obj.speed;
        obj.mesh.rotation.y += obj.speed;
        obj.mesh.position.y = Math.sin(time + obj.offset) * 1 + 2;

        const rMesh = reflectionObjects[i];
        rMesh.position.x = obj.mesh.position.x;
        rMesh.position.z = obj.mesh.position.z;
        rMesh.position.y = -obj.mesh.position.y;
        rMesh.rotation.x = -obj.mesh.rotation.x;
        rMesh.rotation.y = obj.mesh.rotation.y; 
        rMesh.rotation.z = -obj.mesh.rotation.z; 
      });

      particles.rotation.y = time * 0.05;

      camera.position.x = Math.sin(time * 0.1) * 10;
      camera.position.z = Math.cos(time * 0.1) * 10 + 5;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

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

<svelte:head>
  <title>{title}</title>
</svelte:head>

<canvas bind:this={canvas} class="webgl"></canvas>

<main>
  <div class="container">
    <header>
      <h1>{title}</h1>
      <p class="subtitle">{duration}</p>
    </header>

    <div class="theme-display">
      <span class="label">Theme</span>
      <h2 class="theme-text">{theme}</h2>
    </div>

    <section class="winners">
      <h3>Featured Entries</h3>
      <div class="grid">
        {#each projects as project}
          <a href={project.link} class="card">
            <h4>{project.title}</h4>
            <span class="prize">{project.prize}</span>
          </a>
        {/each}
      </div>
    </section>

    <div class="actions">
      <a href="https://itch.io/jam/camgamejam2024" class="button">See All Submissions</a>
    </div>
  </div>
</main>

<style>
  :global(footer) {
    display: none !important;
  }
  
  :global(body) {
    margin: 0;
    overflow-x: hidden;
    background: #050510;
  }

  .webgl {
    position: fixed;
    top: 0;
    left: 0;
    outline: none;
    z-index: 0;
  }

  main {
    position: relative;
    z-index: 1;
    color: white;
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 4rem 2rem;
    pointer-events: none;
  }

  .container {
    max-width: 1200px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }

  .container > * {
    pointer-events: auto;
  }

  header {
    text-align: center;
    animation: fadeIn 1s ease-out;
  }

  h1 {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
    background: linear-gradient(135deg, #fff, #a0a0ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }

  .subtitle {
    font-size: 1.2rem;
    opacity: 0.8;
    margin-top: 1rem;
    letter-spacing: 0.1em;
  }

  .theme-display {
    text-align: center;
    padding: 2rem 4rem;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    transform: perspective(1000px) rotateX(10deg);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    animation: float 6s ease-in-out infinite;
  }

  .label {
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.2em;
    color: #a0a0ff;
  }

  .theme-text {
    font-size: 3rem;
    margin: 0.5rem 0 0;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-shadow: 0 0 20px rgba(160, 160, 255, 0.5);
  }

  .winners {
    width: 100%;
    max-width: 900px;
  }

  h3 {
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 2rem;
    font-size: 1.5rem;
    color: #fff;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2rem;
    text-decoration: none;
    color: white;
    transition: transform 0.3s ease, background 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    backdrop-filter: blur(5px);
  }

  .card:hover {
    transform: translateY(-5px) scale(1.02);
    background: rgba(255, 255, 255, 0.1);
    border-color: #a0a0ff;
  }

  .card h4 {
    margin: 0;
    font-size: 1.2rem;
    color: #a0a0ff;
  }

  .prize {
    font-size: 0.85rem;
    opacity: 0.7;
    font-style: italic;
  }

  .button {
    display: inline-block;
    padding: 1rem 3rem;
    background: white;
    color: black;
    text-decoration: none;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
    transition: all 0.3s ease;
  }

  .button:hover {
    background: #a0a0ff;
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(160, 160, 255, 0.4);
  }

  @keyframes float {
    0%, 100% { transform: perspective(1000px) rotateX(10deg) translateY(0); }
    50% { transform: perspective(1000px) rotateX(10deg) translateY(-10px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
