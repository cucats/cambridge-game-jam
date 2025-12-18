<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const theme = "Reflection";

  const projects = [
    {
      src: "/2024/blight.png",
      title: "Blight",
      prize: "Most Popular & Best Gameplay",
      link: "https://hex-26.itch.io/blight"
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular & Most Original",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions"
    },
    {
      src: "/2024/reflected.png",
      title: "Reflected",
      prize: "Theme Winner",
      link: "https://ekorrette.itch.io/reflected"
    },
    {
      src: "/2024/asymmetry.png",
      title: "Asymmetry",
      prize: "Best Gameplay",
      link: "https://alex-davies.itch.io/asymmetry"
    },
    {
      src: "/2024/coulda-woulda-buddha.png",
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha"
    },
    {
      src: "/2024/all-submissions.png",
      title: "All Submissions",
      prize: "23 Entries",
      link: "https://itch.io/jam/camgamejam2024"
    }
  ];

  let container;
  let renderer, scene, camera;
  let frameId;
  let objects = [];

  onMount(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 10, 50);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 10, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    const geometry = new THREE.CircleGeometry(40, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: width * window.devicePixelRatio,
      textureHeight: height * window.devicePixelRatio,
      color: 0x777777
    });
    groundMirror.position.y = -0.1;
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    const geometryLowPoly = new THREE.IcosahedronGeometry(1, 0);
    const materialLowPoly = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      flatShading: true,
      roughness: 0.1,
      metalness: 0.5
    });

    // Mountains
    const geometryMountain = new THREE.ConeGeometry(5, 20, 4);
    const materialMountain = new THREE.MeshStandardMaterial({
      color: 0x222222,
      flatShading: true,
      roughness: 0.9
    });

    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(geometryMountain, materialMountain);
      mesh.position.x = (Math.random() - 0.5) * 80;
      mesh.position.y = 0; // Base at 0
      mesh.position.z = -15 - Math.random() * 40;
      mesh.scale.set(1 + Math.random() * 2, 0.5 + Math.random(), 1 + Math.random() * 2);
      mesh.rotateY(Math.random() * Math.PI);
      scene.add(mesh);
    }

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(geometryLowPoly, materialLowPoly);
      mesh.position.x = (Math.random() - 0.5) * 20;
      mesh.position.y = Math.random() * 4 + 0.5;
      mesh.position.z = (Math.random() - 0.5) * 15;
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      
      const scale = Math.random() * 0.5 + 0.5;
      mesh.scale.set(scale, scale, scale);

      scene.add(mesh);
      objects.push({
        mesh,
        speedRot: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() + 0.1) * 0.01,
        initialY: mesh.position.y
      });
    }

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      objects.forEach(obj => {
        obj.mesh.rotation.x += obj.speedRot;
        obj.mesh.rotation.y += obj.speedRot;
        obj.mesh.position.y = obj.initialY + Math.sin(time + obj.mesh.position.x) * 0.5;
      });

      // groundMirror.material.uniforms.time.value = time;
      
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      groundMirror.getRenderTarget().setSize(
        w * window.devicePixelRatio,
        h * window.devicePixelRatio
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (renderer) renderer.dispose();
    };
  });
</script>

<div bind:this={container} class="canvas-container"></div>

<div class="content">
  <header>
    <h1>{title}</h1>
    <h2>{duration}</h2>
    <div class="theme">THEME: {theme.toUpperCase()}</div>
  </header>

  <div class="grid">
    {#each projects as project}
      <a href={project.link} target="_blank" rel="noopener noreferrer" class="card">
        <div class="image-wrapper">
          <img src={project.src} alt={project.title} />
        </div>
        <div class="info">
          <h3>{project.title}</h3>
          <p>{project.prize}</p>
        </div>
      </a>
    {/each}
  </div>
  
  <div class="back-link">
     <a href="/">Back to Home</a>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow-x: hidden;
    background-color: #111;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 2;
    color: white;
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Courier New', Courier, monospace;
    pointer-events: none;
  }

  header {
    text-align: center;
    margin-bottom: 4rem;
    pointer-events: auto;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  h2 {
    font-size: 1.5rem;
    color: #ccc;
    margin-bottom: 2rem;
  }

  .theme {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    border: 1px solid white;
    font-size: 1.25rem;
    letter-spacing: 4px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    pointer-events: auto;
  }

  .card {
    display: block;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    text-decoration: none;
    color: white;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }

  .image-wrapper {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .card:hover img {
    transform: scale(1.05);
  }

  .info {
    padding: 1.5rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #ddd;
  }
  
  .back-link {
    margin-top: 4rem;
    text-align: center;
    pointer-events: auto;
  }
  
  .back-link a {
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
  }
  
  .back-link a:hover {
    color: white;
    border-bottom-color: white;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
  }
</style>
