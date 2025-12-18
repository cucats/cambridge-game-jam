<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvasContainer;
  let scene, camera, renderer;
  let caveGeometry, caveMaterial;
  let crystals = [];
  let stalactites = [];
  let stalagmites = [];
  let particles;
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let animationId;
  let time = 0;
  let pointLight1, pointLight2, spotLight;

  const featuredProjects = [
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

  const initThreeJS = () => {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x2a1a3d, 0.4);
    scene.add(ambientLight);

    pointLight1 = new THREE.PointLight(0xff6b35, 1, 50);
    pointLight1.position.set(-5, 8, -5);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(0x4a90e2, 0.8, 50);
    pointLight2.position.set(5, 6, -8);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    spotLight = new THREE.SpotLight(0xffd700, 2, 30, Math.PI / 6, 0.5);
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const caveShape = new THREE.Shape();
    caveShape.moveTo(-15, -10);
    caveShape.lineTo(-15, 10);
    caveShape.quadraticCurveTo(-12, 12, -8, 10);
    caveShape.lineTo(-8, -10);
    caveShape.quadraticCurveTo(-10, -12, -15, -10);

    const extrudeSettings = {
      depth: 30,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 1,
      bevelSegments: 8,
    };

    caveGeometry = new THREE.ExtrudeGeometry(caveShape, extrudeSettings);
    caveMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.1,
    });
    const caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
    caveMesh.receiveShadow = true;
    scene.add(caveMesh);

    const caveShape2 = new THREE.Shape();
    caveShape2.moveTo(8, -10);
    caveShape2.lineTo(8, 10);
    caveShape2.quadraticCurveTo(12, 12, 15, 10);
    caveShape2.lineTo(15, -10);
    caveShape2.quadraticCurveTo(10, -12, 8, -10);

    const caveMesh2 = new THREE.Mesh(
      new THREE.ExtrudeGeometry(caveShape2, extrudeSettings),
      caveMaterial
    );
    caveMesh2.receiveShadow = true;
    scene.add(caveMesh2);

    for (let i = 0; i < 30; i++) {
      const length = Math.random() * 3 + 1;
      const radius = Math.random() * 0.3 + 0.1;
      const geometry = new THREE.ConeGeometry(radius, length, 8);
      const material = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.8,
      });
      const stalactite = new THREE.Mesh(geometry, material);
      stalactite.position.set(
        (Math.random() - 0.5) * 20,
        8 + Math.random() * 2,
        (Math.random() - 0.5) * 25
      );
      stalactite.rotation.x = Math.PI;
      stalactite.castShadow = true;
      stalactites.push(stalactite);
      scene.add(stalactite);
    }

    for (let i = 0; i < 25; i++) {
      const length = Math.random() * 2.5 + 0.8;
      const radius = Math.random() * 0.25 + 0.08;
      const geometry = new THREE.ConeGeometry(radius, length, 8);
      const material = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.8,
      });
      const stalagmite = new THREE.Mesh(geometry, material);
      stalagmite.position.set(
        (Math.random() - 0.5) * 20,
        -8 + Math.random() * 1,
        (Math.random() - 0.5) * 25
      );
      stalagmite.castShadow = true;
      stalagmites.push(stalagmite);
      scene.add(stalagmite);
    }

    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 0.4 + 0.15;
      const geometry = new THREE.OctahedronGeometry(size, 2);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          Math.random() * 0.15 + 0.45,
          0.9,
          Math.random() * 0.4 + 0.5
        ),
        emissive: new THREE.Color().setHSL(
          Math.random() * 0.15 + 0.45,
          0.9,
          Math.random() * 0.3 + 0.2
        ),
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9,
      });
      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.set(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 28
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.castShadow = true;
      crystal.userData = {
        baseRotation: {
          x: Math.random() * Math.PI,
          y: Math.random() * Math.PI,
          z: Math.random() * Math.PI,
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
      };
      crystals.push(crystal);
      scene.add(crystal);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const color = new THREE.Color();
      const hue = Math.random() * 0.2 + 0.5;
      color.setHSL(hue, 0.8, Math.random() * 0.5 + 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.08 + 0.02;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f1f,
      roughness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    floor.receiveShadow = true;
    scene.add(floor);
  };

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    time += 0.016;

    const mouseInfluence = 0.08;
    camera.position.x += (mouseX * mouseInfluence - camera.position.x) * 0.05;
    camera.position.y += (mouseY * mouseInfluence + 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    if (pointLight1) {
      pointLight1.intensity = 1 + Math.sin(time * 1.5) * 0.3;
      pointLight1.position.x = -5 + Math.sin(time * 0.8) * 2;
      pointLight1.position.z = -5 + Math.cos(time * 0.8) * 2;
    }

    if (pointLight2) {
      pointLight2.intensity = 0.8 + Math.cos(time * 1.2) * 0.25;
      pointLight2.position.x = 5 + Math.cos(time * 0.9) * 1.5;
      pointLight2.position.z = -8 + Math.sin(time * 0.9) * 1.5;
    }

    if (spotLight) {
      spotLight.intensity = 2 + Math.sin(time * 2) * 0.5;
      spotLight.angle = Math.PI / 6 + Math.sin(time) * 0.1;
    }

    crystals.forEach((crystal, i) => {
      const userData = crystal.userData;
      crystal.rotation.x = userData.baseRotation.x + time * userData.rotationSpeed.x;
      crystal.rotation.y = userData.baseRotation.y + time * userData.rotationSpeed.y;
      crystal.rotation.z = userData.baseRotation.z + time * userData.rotationSpeed.z;
      
      const pulse = Math.sin(time * 2.5 + i * 0.5) * 0.15 + 1;
      crystal.scale.set(pulse, pulse, pulse);
      
      const material = crystal.material;
      if (material.emissive) {
        const intensity = Math.sin(time * 3 + i) * 0.3 + 0.7;
        material.emissiveIntensity = intensity;
      }
    });

    stalactites.forEach((stalactite, i) => {
      stalactite.position.y += Math.sin(time * 1.2 + i * 0.3) * 0.015;
      stalactite.rotation.z = Math.sin(time * 0.8 + i) * 0.05;
    });

    stalagmites.forEach((stalagmite, i) => {
      stalagmite.position.y += Math.sin(time * 1.8 + i * 0.4) * 0.012;
      stalagmite.rotation.z = Math.sin(time * 1.1 + i) * 0.03;
    });

    if (particles) {
      particles.rotation.y += 0.002;
      particles.rotation.x += 0.001;
      
      const positions = particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i * 0.01) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };

  const handleMouseMove = (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 10;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 10;
  };

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const handleScroll = () => {
    scrollY = window.scrollY;
    if (camera) {
      camera.position.z = 5 + scrollY * 0.01;
    }
  };

  onMount(() => {
    initThreeJS();
    animate();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2023</title>
</svelte:head>

<div class="cave-page">
  <div bind:this={canvasContainer} class="three-canvas"></div>

  <div class="content-wrapper">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Cambridge Game Jam 2023</h1>
        <h2 class="hero-subtitle">10th - 12th February</h2>
        <div class="theme-badge">
          <span class="theme-text">Beneath the Earth</span>
        </div>
        <div class="stats">
          <a href="https://itch.io/jam/camgamejam2023" class="submission-link">
            19 Submissions
          </a>
        </div>
      </div>
    </section>

    <section class="projects-section">
      <div class="projects-container">
        <h2 class="section-title">Featured Projects</h2>
        <div class="projects-grid">
          {#each featuredProjects as project, index}
            <a
              href={project.link}
              class="project-card"
              style="animation-delay: {index * 0.1}s"
            >
              <div class="project-image-wrapper">
                <img src={project.src} alt={project.alt} class="project-image" />
                <div class="project-overlay">
                  <div class="project-info">
                    <h3 class="project-title">{project.title}</h3>
                    {#if project.prize}
                      <p class="project-prize">{project.prize}</p>
                    {/if}
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </section>

    <section class="info-section">
      <div class="info-content">
        <p class="lorem-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <p class="lorem-text">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
      </div>
    </section>
  </div>
</div>

<style>
  .cave-page {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1f 100%);
    overflow-x: hidden;
  }

  .three-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  .content-wrapper {
    position: relative;
    z-index: 2;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    position: relative;
  }

  .hero-content {
    text-align: center;
    animation: fadeInUp 1s ease-out;
  }

  .hero-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    background: linear-gradient(135deg, #ff6b35 0%, #4a90e2 50%, #ffd700 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
    animation: glowPulse 3s ease-in-out infinite, gradientShift 5s ease infinite;
  }

  .hero-subtitle {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #e0e0e0;
    margin-bottom: 2rem;
    font-weight: 300;
    letter-spacing: 0.1em;
  }

  .theme-badge {
    display: inline-block;
    padding: 1rem 2rem;
    background: rgba(42, 26, 61, 0.6);
    border: 2px solid rgba(255, 107, 53, 0.5);
    border-radius: 50px;
    backdrop-filter: blur(10px);
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  .theme-text {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: #ffd700;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .stats {
    margin-top: 2rem;
  }

  .submission-link {
    display: inline-block;
    padding: 0.8rem 2rem;
    background: linear-gradient(135deg, #4a90e2 0%, #ff6b35 100%);
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
  }

  .submission-link:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 25px rgba(74, 144, 226, 0.6);
  }

  .projects-section {
    padding: 6rem 2rem;
    background: rgba(10, 10, 26, 0.7);
    backdrop-filter: blur(10px);
  }

  .projects-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    text-align: center;
    margin-bottom: 4rem;
    background: linear-gradient(135deg, #ffd700 0%, #ff6b35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
  }

  .project-card {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(26, 26, 46, 0.8);
    border: 2px solid rgba(255, 107, 53, 0.3);
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: slideInFromBottom 0.8s ease-out backwards;
    text-decoration: none;
    display: block;
    backdrop-filter: blur(10px);
  }

  .project-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 107, 53, 0.1) 0%,
      rgba(74, 144, 226, 0.1) 50%,
      rgba(255, 215, 0, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: 1;
    pointer-events: none;
  }

  .project-card:hover::before {
    opacity: 1;
  }

  .project-card:hover {
    transform: translateY(-15px) scale(1.03) rotateY(2deg);
    border-color: rgba(255, 107, 53, 0.9);
    box-shadow: 0 25px 50px rgba(255, 107, 53, 0.5),
      0 0 40px rgba(74, 144, 226, 0.4),
      inset 0 0 30px rgba(255, 215, 0, 0.1);
  }

  .project-image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      filter 0.5s ease;
    filter: brightness(0.8) contrast(1.1);
  }

  .project-card:hover .project-image {
    transform: scale(1.15) rotate(3deg);
    filter: brightness(1.1) contrast(1.2);
  }

  .project-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(
      to top,
      rgba(10, 10, 26, 0.98) 0%,
      rgba(10, 10, 26, 0.85) 50%,
      rgba(10, 10, 26, 0.7) 70%,
      transparent 100%
    );
    padding: 2rem;
    transform: translateY(100%);
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 2;
  }

  .project-card:hover .project-overlay {
    transform: translateY(0);
  }

  .project-info {
    color: white;
  }

  .project-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #ffd700;
  }

  .project-prize {
    font-size: 1rem;
    color: #e0e0e0;
    font-weight: 400;
  }

  .info-section {
    padding: 6rem 2rem;
    background: rgba(15, 15, 31, 0.8);
  }

  .info-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .lorem-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #c0c0c0;
    margin-bottom: 1.5rem;
    text-align: justify;
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

  @keyframes glowPulse {
    0%,
    100% {
      filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(255, 107, 53, 0.8));
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }

    .hero-section {
      padding: 2rem 1rem;
    }

    .projects-section,
    .info-section {
      padding: 4rem 1rem;
    }
  }
</style>
