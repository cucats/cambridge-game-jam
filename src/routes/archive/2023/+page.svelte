<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const images = [
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

  let container;
  let scene, camera, renderer, controls;
  let caveGeometry, caveMaterial, caveMesh;
  let particles, particleSystem;
  let crystals = [];
  let stalactites = [];
  let stalagmites = [];
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let time = 0;
  let currentProjectIndex = $state(0);
  let projectCards = [];

  const initThree = () => {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.enablePan = false;

    const ambientLight = new THREE.AmbientLight(0x2a1a3d, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6b35, 1, 50);
    pointLight1.position.set(-5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4a90e2, 0.8, 50);
    pointLight2.position.set(5, -3, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffd700, 0.6, 40);
    pointLight3.position.set(0, 0, 8);
    scene.add(pointLight3);

    const caveShape = new THREE.Shape();
    const radius = 8;
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const variation = Math.sin(angle * 3) * 0.3 + Math.cos(angle * 5) * 0.2;
      const r = radius + variation;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) {
        caveShape.moveTo(x, y);
      } else {
        caveShape.lineTo(x, y);
      }
    }

    const extrudeSettings = {
      depth: 20,
      bevelEnabled: false,
      curveSegments: 32,
    };

    caveGeometry = new THREE.ExtrudeGeometry(caveShape, extrudeSettings);
    caveGeometry.rotateX(Math.PI / 2);
    caveGeometry.translate(0, -10, 0);

    const textureLoader = new THREE.TextureLoader();
    const caveTexture = createCaveTexture();
    caveMaterial = new THREE.MeshStandardMaterial({
      map: caveTexture,
      roughness: 0.9,
      metalness: 0.1,
      color: 0x1a1a2e,
    });

    caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
    scene.add(caveMesh);

    for (let i = 0; i < 30; i++) {
      const stalactite = createStalactite();
      stalactite.position.set(
        (Math.random() - 0.5) * 15,
        8 + Math.random() * 2,
        (Math.random() - 0.5) * 15
      );
      stalactite.rotation.z = (Math.random() - 0.5) * 0.3;
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 25; i++) {
      const stalagmite = createStalagmite();
      stalagmite.position.set(
        (Math.random() - 0.5) * 15,
        -8 - Math.random() * 2,
        (Math.random() - 0.5) * 15
      );
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    for (let i = 0; i < 50; i++) {
      const crystal = createCrystal();
      crystal.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 12
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystals.push(crystal);
      scene.add(crystal);
    }

    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      const color = new THREE.Color();
      const hue = Math.random() * 0.3 + 0.5;
      color.setHSL(hue, 0.7, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(time * 0.5 + position.x * 0.1) * 0.5;
          pos.x += cos(time * 0.3 + position.z * 0.1) * 0.3;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `,
      transparent: true,
      vertexColors: true,
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    animate();
  };

  const createCaveTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 3;
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  const createStalactite = () => {
    const geometry = new THREE.ConeGeometry(0.3, 2 + Math.random() * 2, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      roughness: 0.8,
      metalness: 0.1,
    });
    return new THREE.Mesh(geometry, material);
  };

  const createStalagmite = () => {
    const geometry = new THREE.ConeGeometry(0.4, 1.5 + Math.random() * 1.5, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      roughness: 0.8,
      metalness: 0.1,
    });
    return new THREE.Mesh(geometry, material);
  };

  const createCrystal = () => {
    const geometry = new THREE.OctahedronGeometry(0.2 + Math.random() * 0.3);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5),
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.3),
      emissiveIntensity: 0.5,
    });
    return new THREE.Mesh(geometry, material);
  };

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const handleMouseMove = (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  };

  const handleScroll = () => {
    scrollY = window.scrollY;
  };

  const animate = () => {
    requestAnimationFrame(animate);
    time += 0.01;

    if (particleSystem) {
      particleSystem.material.uniforms.time.value = time;
      particleSystem.rotation.y += 0.0005;
    }

    crystals.forEach((crystal, index) => {
      crystal.rotation.x += 0.01 + index * 0.001;
      crystal.rotation.y += 0.015 + index * 0.001;
      const pulse = Math.sin(time * 2 + index) * 0.1 + 1;
      crystal.scale.set(pulse, pulse, pulse);
    });

    stalactites.forEach((stalactite, index) => {
      stalactite.rotation.z += Math.sin(time + index) * 0.001;
      const sway = Math.sin(time * 0.5 + index) * 0.05;
      stalactite.position.x += sway;
    });

    stalagmites.forEach((stalagmite, index) => {
      const sway = Math.sin(time * 0.5 + index + 10) * 0.03;
      stalagmite.position.x += sway;
    });

    if (caveMesh) {
      caveMesh.rotation.y += 0.001;
    }

    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;

    controls.update();
    renderer.render(scene, camera);
  };

  const nextProject = () => {
    currentProjectIndex = (currentProjectIndex + 1) % images.length;
  };

  const prevProject = () => {
    currentProjectIndex =
      (currentProjectIndex - 1 + images.length) % images.length;
  };

  onMount(() => {
    if (container) {
      initThree();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (renderer) {
        renderer.dispose();
      }
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cave-page">
  <div class="three-container" bind:this={container}></div>

  <div class="content-overlay">
    <a href="/archive" class="back-button">← Back to Archive</a>
    <div class="hero-section">
      <div class="title-container">
        <h1 class="main-title">{title}</h1>
        <div class="subtitle">{duration}</div>
        <div class="theme-badge">{theme}</div>
        <a
          href="https://itch.io/jam/camgamejam2023"
          class="submissions-link"
        >
          {submissions} {submissions == 1 ? "Submission" : "Submissions"}
        </a>
      </div>
    </div>

    <div class="projects-section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="project-carousel">
        <button class="carousel-btn prev" onclick={prevProject}>‹</button>
        <div class="project-card-container">
          {#each images as project, index}
            <div
              class="project-card"
              class:active={index === currentProjectIndex}
              style="transform: translateX({(index - currentProjectIndex) * 120}%) scale({index === currentProjectIndex ? 1 : 0.85}); opacity: {index === currentProjectIndex ? 1 : 0.6};"
            >
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <div class="project-image-wrapper">
                  <img src={project.src} alt={project.alt} />
                  <div class="project-overlay">
                    <h3 class="project-title">{project.title}</h3>
                    {#if project.prize}
                      <div class="project-prize">{project.prize}</div>
                    {/if}
                  </div>
                </div>
              </a>
            </div>
          {/each}
        </div>
        <button class="carousel-btn next" onclick={nextProject}>›</button>
      </div>
      <div class="carousel-indicators">
        {#each images as _, index}
          <button
            class="indicator"
            class:active={index === currentProjectIndex}
            onclick={() => (currentProjectIndex = index)}
            aria-label="Go to project {index + 1}"
          ></button>
        {/each}
      </div>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3>Lorem Ipsum</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>
      <div class="info-card">
        <h3>Dolor Sit Amet</h3>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
          non proident.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .cave-page {
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
    background: #0a0a1a;
  }

  .back-button {
    position: fixed;
    top: 2rem;
    left: 2rem;
    z-index: 100;
    padding: 0.75rem 1.5rem;
    background: rgba(26, 26, 46, 0.8);
    border: 2px solid rgba(255, 107, 53, 0.5);
    border-radius: 30px;
    color: #ffd700;
    text-decoration: none;
    font-weight: 600;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(26, 26, 46, 0.95);
    border-color: rgba(255, 107, 53, 0.8);
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
    transform: translateX(-5px);
  }

  .three-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .content-overlay {
    position: relative;
    z-index: 1;
    min-height: 100vh;
  }

  .hero-section {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .title-container {
    text-align: center;
    animation: fadeInUp 1.5s ease-out;
  }

  .main-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    background: linear-gradient(135deg, #ff6b35 0%, #4a90e2 50%, #ffd700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
    animation: glow 3s ease-in-out infinite alternate;
  }

  .subtitle {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #e0e0e0;
    margin-bottom: 1.5rem;
    animation: fadeInUp 1.5s ease-out 0.3s both;
  }

  .theme-badge {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(74, 144, 226, 0.2));
    border: 2px solid rgba(255, 107, 53, 0.5);
    border-radius: 50px;
    color: #ffd700;
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 600;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    animation: fadeInUp 1.5s ease-out 0.6s both, pulse 2s ease-in-out infinite 2s;
  }

  .submissions-link {
    display: inline-block;
    color: #4a90e2;
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    text-decoration: none;
    padding: 0.5rem 1.5rem;
    border: 2px solid rgba(74, 144, 226, 0.5);
    border-radius: 30px;
    transition: all 0.3s ease;
    animation: fadeInUp 1.5s ease-out 0.9s both;
  }

  .submissions-link:hover {
    background: rgba(74, 144, 226, 0.2);
    box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
    transform: translateY(-2px);
  }

  .projects-section {
    padding: 4rem 2rem;
    background: linear-gradient(to bottom, transparent, rgba(10, 10, 26, 0.8));
  }

  .section-title {
    text-align: center;
    font-size: clamp(2.5rem, 6vw, 4rem);
    color: #ffd700;
    margin-bottom: 3rem;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  .project-carousel {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .project-card-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    perspective: 1000px;
  }

  .project-card {
    flex: 0 0 100%;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.6s ease;
    transform-style: preserve-3d;
  }

  .project-image-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease;
  }

  .project-card:hover .project-image-wrapper {
    transform: translateY(-10px) scale(1.02);
  }

  .project-image-wrapper img {
    width: 100%;
    height: auto;
    display: block;
    filter: brightness(0.8);
    transition: filter 0.3s ease;
  }

  .project-card:hover .project-image-wrapper img {
    filter: brightness(1);
  }

  .project-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
    padding: 2rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .project-card:hover .project-overlay {
    transform: translateY(0);
  }

  .project-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    color: #ffd700;
    margin-bottom: 0.5rem;
  }

  .project-prize {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #4a90e2;
  }

  .carousel-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #ffd700;
    font-size: 3rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    flex-shrink: 0;
  }

  .carousel-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    transform: scale(1.1);
  }

  .carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 215, 0, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .indicator.active {
    background: #ffd700;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
    transform: scale(1.3);
  }

  .info-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-card {
    background: rgba(26, 26, 46, 0.6);
    border: 2px solid rgba(255, 107, 53, 0.3);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .info-card:hover {
    border-color: rgba(255, 107, 53, 0.6);
    box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
    transform: translateY(-5px);
  }

  .info-card h3 {
    color: #ff6b35;
    margin-bottom: 1rem;
    font-size: clamp(1.5rem, 3vw, 2rem);
  }

  .info-card p {
    color: #e0e0e0;
    line-height: 1.6;
    font-size: clamp(1rem, 2vw, 1.2rem);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes glow {
    from {
      filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.5));
    }
    to {
      filter: drop-shadow(0 0 40px rgba(74, 144, 226, 0.8));
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    .project-carousel {
      flex-direction: column;
    }

    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    .carousel-btn.prev {
      left: 10px;
    }

    .carousel-btn.next {
      right: 10px;
    }

    .project-card-container {
      width: 100%;
    }
  }
</style>
