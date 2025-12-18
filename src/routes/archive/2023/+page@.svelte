<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import '../../../app.css';

  const projects = [
    {
      title: "Inferno Rising",
      prize: "Popular Vote",
      src: "/2023/inferno-rising.png",
      link: "https://firedemon111.itch.io/inferno-rising"
    },
    {
      title: "MAYI Garden",
      prize: "Best for Theme",
      src: "/2023/mayi-garden.png",
      link: "https://qiaozhi-lei.itch.io/mayi-garden"
    },
    {
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      src: "/2023/rhythm-mythril-fever.png",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever"
    },
    {
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      src: "/2023/beaneth-the-earth.png",
      link: "https://mxbi.itch.io/beaneth-the-earth"
    },
    {
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      src: "/2023/deck-of-dwarves.png",
      link: "https://joeoc.itch.io/deck-of-dwarves"
    }
  ];

  let canvas;
  let scrollY = 0;
  let innerHeight;

  onMount(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050205, 0.02);
    scene.background = new THREE.Color(0x050205);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles - Cave Walls
    const geometry = new THREE.BufferGeometry();
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const color1 = new THREE.Color(0x4a90e2);
    const color2 = new THREE.Color(0xa55eea);
    const color3 = new THREE.Color(0xf1c40f); // Gold/Ores

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4; // Tunnel radius
      const depth = (Math.random() - 0.5) * 100; // Tunnel length

      // Spiral distortion
      const spiral = depth * 0.2;
      
      positions[i * 3] = Math.cos(angle + spiral) * radius;
      positions[i * 3 + 1] = Math.sin(angle + spiral) * radius;
      positions[i * 3 + 2] = depth;

      // Colors
      const mixedColor = Math.random() > 0.8 ? color3 : (Math.random() > 0.5 ? color1 : color2);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Shader Material for particles
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pointTexture: { value: new THREE.TextureLoader().load('/2023/jam.png') } // Fallback or use a generated texture if needed, but points work without too
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            uniform float time;
            void main() {
                vColor = color;
                vec3 pos = position;
                // Gentle sway
                pos.x += sin(time * 0.5 + pos.z * 0.5) * 0.2;
                pos.y += cos(time * 0.3 + pos.z * 0.5) * 0.2;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
                gl_FragColor = vec4(vColor, 1.0);
            }
        `,
        transparent: true,
        vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Stalactites/Stalagmites (Low poly cones)
    const rockMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x201020, 
      flatShading: true,
      shininess: 5
    });
    
    const rocks = new THREE.Group();
    for(let i=0; i<50; i++) {
        const h = Math.random() * 5 + 2;
        const r = Math.random() * 1 + 0.2;
        const geo = new THREE.ConeGeometry(r, h, 5);
        const mesh = new THREE.Mesh(geo, rockMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 3;
        const z = (Math.random() - 0.5) * 80;
        
        mesh.position.set(
            Math.cos(angle) * dist,
            Math.sin(angle) * dist,
            z
        );
        mesh.lookAt(0,0,z);
        // Randomize orientation slightly
        mesh.rotateX(Math.PI / 2);
        
        rocks.add(mesh);
    }
    scene.add(rocks);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xaa88ff, 2, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    camera.position.z = 20;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      material.uniforms.time.value = time;
      
      // Camera movement based on scroll + idle float
      const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      
      const targetZ = 20 - (scrollPercent * 60);
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      
      camera.position.x = Math.sin(time * 0.2) * 0.5;
      camera.position.y = Math.cos(time * 0.3) * 0.5;
      
      camera.rotation.z = Math.sin(time * 0.1) * 0.1 + scrollPercent * 0.5;

      rocks.rotation.z = time * 0.05;
      particles.rotation.z = time * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  });
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="page-container">
  <canvas bind:this={canvas}></canvas>

  <div class="content">
    <section class="hero">
      <h1 class="glitch-title">Cambridge Game Jam 2023</h1>
      <p class="subtitle">Beneath the Earth</p>
      <div class="date-badge">10th - 12th February</div>
      <p class="stat">19 Submissions</p>
    </section>

    <section class="projects">
      <h2>Featured Projects</h2>
      <div class="project-grid">
        {#each projects as project}
          <a href={project.link} target="_blank" class="project-card">
            <div class="img-container">
              <img src={project.src} alt={project.title} />
              <div class="overlay"></div>
            </div>
            <div class="info">
              <h3>{project.title}</h3>
              <span class="prize">{project.prize}</span>
            </div>
          </a>
        {/each}
      </div>
      <div class="all-subs">
        <a href="https://itch.io/jam/camgamejam2023" target="_blank" class="button-cave">View All Submissions</a>
      </div>
    </section>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #050205;
    color: white;
    font-family: 'Courier New', Courier, monospace; /* Tech/Terminal vibe */
    overflow-x: hidden;
  }

  .page-container {
    position: relative;
    width: 100%;
    min-height: 250vh; /* Allow scrolling */
  }

  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
  }

  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
    box-sizing: border-box;
  }

  .hero {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 1s, transform 1s;
  }

  .glitch-title {
    font-size: 4rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #fff;
    text-shadow: 0 0 10px #a55eea, 0 0 20px #a55eea;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 2rem;
    color: #4a90e2;
    text-shadow: 0 0 10px #4a90e2;
    margin-bottom: 2rem;
    font-style: italic;
  }

  .date-badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 99px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 1rem;
    backdrop-filter: blur(5px);
  }

  .stat {
    font-size: 1.2rem;
    opacity: 0.8;
  }

  .projects {
    background: linear-gradient(to bottom, transparent, #050205 20%, #050205 80%, transparent);
    width: 100%;
    padding-top: 4rem;
    padding-bottom: 4rem;
  }

  h2 {
    font-size: 3rem;
    margin-bottom: 3rem;
    text-shadow: 0 0 15px #f1c40f;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    width: 100%;
    padding: 0 1rem;
  }

  .project-card {
    background: rgba(20, 10, 30, 0.8);
    border: 1px solid rgba(165, 94, 234, 0.3);
    border-radius: 1rem;
    overflow: hidden;
    text-decoration: none;
    color: white;
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(10px);
  }

  .project-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(165, 94, 234, 0.3);
    border-color: #a55eea;
  }

  .img-container {
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;
  }

  .img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }

  .project-card:hover .img-container img {
    transform: scale(1.1);
  }

  .info {
    padding: 1.5rem;
    text-align: left;
  }

  .info h3 {
    margin: 0;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #fff;
  }

  .prize {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(45deg, #a55eea, #4a90e2);
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .all-subs {
    margin-top: 4rem;
  }

  .button-cave {
    display: inline-block;
    padding: 1rem 2rem;
    background: transparent;
    border: 2px solid #fff;
    color: #fff;
    font-size: 1.2rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: all 0.3s;
    letter-spacing: 2px;
  }

  .button-cave:hover {
    background: #fff;
    color: #000;
    box-shadow: 0 0 20px #fff;
  }

  @media (max-width: 768px) {
    .glitch-title {
      font-size: 2.5rem;
    }
    .subtitle {
      font-size: 1.5rem;
    }
  }
</style>
