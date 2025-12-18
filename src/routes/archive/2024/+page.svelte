<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

  let container;
  let animationId;
  let scene, camera, renderer;
  let reflector;
  const objects = [];

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const images = [
    {
      src: "/2024/blight.png",
      alt: "Blight",
      link: "https://hex-26.itch.io/blight",
      title: "Blight",
      prize: "Most Popular & Best Gameplay",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      alt: "Reflect Upon Your Actions",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular & Most Original",
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

  let originalBodyStyle = '';

  onMount(() => {
    // Save and override body style
    originalBodyStyle = document.body.style.cssText;
    document.body.style.backgroundColor = '#111';
    document.body.style.color = 'white';
    document.body.style.margin = '0';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 20, 60);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const lights = [];
    const lightColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff0000];
    for(let i=0; i<4; i++) {
        const pl = new THREE.PointLight(lightColors[i], 2, 50);
        scene.add(pl);
        lights.push({ light: pl, offset: i * (Math.PI/2), speed: 0.5 + Math.random() });
    }

    // Mirror Floor
    const geometry = new THREE.CircleGeometry(50, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x555555,
    });
    groundMirror.rotateX(-Math.PI / 2);
    groundMirror.position.y = -2;
    scene.add(groundMirror);

    // Floating Objects (Low Poly)
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.OctahedronGeometry(1, 0),
        new THREE.TetrahedronGeometry(1, 0),
        new THREE.ConeGeometry(0.5, 1.5, 4, 1)
    ];

    for (let i = 0; i < 150; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0xff00ff : 0x00ffff,
        flatShading: true,
        roughness: 0.1,
        metalness: 0.6,
        emissive: Math.random() > 0.8 ? 0x220022 : 0x000000
      });
      const mesh = new THREE.Mesh(geo, mat);
      
      const spread = 40;
      mesh.position.set(
        (Math.random() - 0.5) * spread,
        Math.random() * 15 - 1,
        (Math.random() - 0.5) * spread
      );
      
      const scale = Math.random() * 0.8 + 0.2;
      mesh.scale.set(scale, scale, scale);

      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      mesh.userData = {
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.03
        },
        floatSpeed: Math.random() * 0.03 + 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: mesh.position.y,
        radius: Math.random() * 5 + 5,
        orbitSpeed: (Math.random() - 0.5) * 0.01,
        orbitAngle: Math.random() * Math.PI * 2
      };
      
      scene.add(mesh);
      objects.push(mesh);
    }

    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      objects.forEach(obj => {
        obj.rotation.x += obj.userData.rotSpeed.x;
        obj.rotation.y += obj.userData.rotSpeed.y;
        obj.rotation.z += obj.userData.rotSpeed.z;
        
        // Bobbing
        obj.position.y = obj.userData.initialY + Math.sin(time * 2 * obj.userData.floatSpeed + obj.userData.floatOffset) * 1;
        
        // Slight orbiting
        obj.userData.orbitAngle += obj.userData.orbitSpeed;
        obj.position.x += Math.cos(obj.userData.orbitAngle) * 0.02;
        obj.position.z += Math.sin(obj.userData.orbitAngle) * 0.02;
      });

      // Move lights
      lights.forEach((l, i) => {
          l.light.position.x = Math.sin(time * l.speed + l.offset) * 15;
          l.light.position.z = Math.cos(time * l.speed + l.offset) * 15;
          l.light.position.y = 5 + Math.sin(time * 0.5 + i) * 3;
      });

      // Camera movement
      camera.position.x = Math.sin(time * 0.15) * 18;
      camera.position.z = Math.cos(time * 0.15) * 18;
      camera.lookAt(0, 3, 0);

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
      cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      document.body.style.cssText = originalBodyStyle; // Restore styles
    };
  });
</script>

<div bind:this={container} class="canvas-container"></div>

<div class="content-overlay">
  <div class="header">
    <h1 class="title">{title}</h1>
    <h2 class="theme">Theme: {theme}</h2>
    <div class="info">
      <span>{duration}</span>
      <span>•</span>
      <span>{submissions} Submissions</span>
    </div>
  </div>

  <div class="grid">
    {#each images as item}
      <a href={item.link} target="_blank" rel="noopener noreferrer" class="card">
        <div class="card-content">
          <div class="image-wrapper">
             <img src={item.src} alt={item.alt} />
          </div>
          <div class="text">
            <h3>{item.title}</h3>
            {#if item.prize}
              <p class="prize">{item.prize}</p>
            {/if}
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>

<style>
  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
    background: #111;
  }

  .content-overlay {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4rem 2rem;
    pointer-events: none;
    font-family: 'Lexend', sans-serif;
  }

  .header {
    text-align: center;
    margin-bottom: 4rem;
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.4);
    padding: 2.5rem;
    border-radius: 1.5rem;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
    animation: fadeIn 1s ease-out;
  }

  .title {
    font-size: 4.5rem;
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-transform: uppercase;
    letter-spacing: -2px;
    filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
  }

  .theme {
    font-size: 2.2rem;
    color: #e0e0e0;
    margin: 0.5rem 0;
    font-weight: 300;
    letter-spacing: 6px;
    text-transform: uppercase;
  }

  .info {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    color: #a0a0a0;
    font-size: 1.3rem;
    margin-top: 1rem;
    font-weight: 500;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    width: 100%;
    max-width: 1300px;
    pointer-events: auto;
    padding-bottom: 4rem;
  }

  .card {
    text-decoration: none;
    color: white;
    perspective: 1000px;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: slideUp 0.8s ease-out backwards;
  }

  /* Stagger animations for cards */
  .grid .card:nth-child(1) { animation-delay: 0.2s; }
  .grid .card:nth-child(2) { animation-delay: 0.3s; }
  .grid .card:nth-child(3) { animation-delay: 0.4s; }
  .grid .card:nth-child(4) { animation-delay: 0.5s; }
  .grid .card:nth-child(5) { animation-delay: 0.6s; }
  .grid .card:nth-child(6) { animation-delay: 0.7s; }

  .card:hover {
    transform: translateY(-15px) scale(1.02);
    z-index: 10;
  }

  .card-content {
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.2rem;
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: all 0.4s;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .card:hover .card-content {
    background: rgba(50, 50, 50, 0.8);
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 40px rgba(0, 255, 255, 0.3);
  }

  .image-wrapper {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .card:hover img {
    transform: scale(1.15);
  }

  .text {
    padding: 1.8rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  h3 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.2;
    background: linear-gradient(to right, #fff, #ccc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .prize {
    margin-top: auto;
    color: #00ffff;
    font-size: 1rem;
    padding-top: 1rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .title {
      font-size: 3rem;
    }
    .theme {
      font-size: 1.5rem;
    }
    .content-overlay {
      padding: 2rem 1rem;
    }
    .header {
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
  }
</style>
