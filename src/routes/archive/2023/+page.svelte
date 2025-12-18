<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let canvasContainer;
  let scene, camera, renderer;
  let caveGeometry, caveMesh;
  let particles = [];
  let crystals = [];
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let animationFrameId;

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

  let currentProjectIndex = $state(0);
  let projectVisible = $state(false);

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 200);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x2a1a3d, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6b35, 1, 50);
    pointLight1.position.set(-10, 5, 10);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4a90e2, 0.8, 50);
    pointLight2.position.set(10, -5, 10);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const caveShape = new THREE.Shape();
    const segments = 32;
    const radius = 8;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = radius + Math.sin(angle * 3) * 1.5 + Math.cos(angle * 5) * 0.8;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) {
        caveShape.moveTo(x, y);
      } else {
        caveShape.lineTo(x, y);
      }
    }

    const extrudeSettings = {
      depth: 40,
      bevelEnabled: false,
      curveSegments: 8,
    };

    caveGeometry = new THREE.ExtrudeGeometry(caveShape, extrudeSettings);
    caveGeometry.rotateX(-Math.PI / 2);
    caveGeometry.translate(0, -20, 0);

    const caveMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.1,
      emissive: 0x0a0a1a,
      emissiveIntensity: 0.2,
    });

    caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
    caveMesh.receiveShadow = true;
    caveMesh.castShadow = true;
    scene.add(caveMesh);

    for (let i = 0; i < 200; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.8, 0.3),
        emissiveIntensity: 0.5,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 40
      );
      particle.userData = {
        speed: Math.random() * 0.02 + 0.01,
        amplitude: Math.random() * 2 + 1,
      };
      particles.push(particle);
      scene.add(particle);
    }

    for (let i = 0; i < 30; i++) {
      const crystalSize = Math.random() * 0.3 + 0.1;
      const crystalGeometry = new THREE.OctahedronGeometry(crystalSize, 0);
      const crystalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          Math.random() * 0.3 + 0.5,
          0.7,
          Math.random() * 0.3 + 0.5
        ),
        emissive: new THREE.Color().setHSL(
          Math.random() * 0.3 + 0.5,
          0.7,
          0.3
        ),
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9,
      });
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      const angle = (i / 30) * Math.PI * 2;
      const radius = 6 + Math.random() * 2;
      crystal.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * 2 - 15,
        Math.sin(angle * 2) * 5
      );
      crystal.userData = {
        rotationSpeed: Math.random() * 0.02 + 0.01,
        floatSpeed: Math.random() * 0.01 + 0.005,
        baseY: crystal.position.y,
      };
      crystals.push(crystal);
      scene.add(crystal);
    }

    const stalactiteGroup = new THREE.Group();
    for (let i = 0; i < 20; i++) {
      const length = Math.random() * 2 + 1;
      const width = Math.random() * 0.3 + 0.2;
      const stalactiteGeometry = new THREE.ConeGeometry(width, length, 6);
      const stalactiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.8,
      });
      const stalactite = new THREE.Mesh(
        stalactiteGeometry,
        stalactiteMaterial
      );
      const angle = (i / 20) * Math.PI * 2;
      const radius = 7 + Math.random() * 1;
      stalactite.position.set(
        Math.cos(angle) * radius,
        8 + Math.random() * 2,
        Math.sin(angle * 2) * 3
      );
      stalactite.rotation.z = Math.random() * 0.2 - 0.1;
      stalactite.castShadow = true;
      stalactiteGroup.add(stalactite);
    }
    scene.add(stalactiteGroup);

    const stalagmiteGroup = new THREE.Group();
    for (let i = 0; i < 15; i++) {
      const length = Math.random() * 1.5 + 0.5;
      const width = Math.random() * 0.4 + 0.3;
      const stalagmiteGeometry = new THREE.ConeGeometry(width, length, 6);
      const stalagmiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.8,
      });
      const stalagmite = new THREE.Mesh(
        stalagmiteGeometry,
        stalagmiteMaterial
      );
      const angle = (i / 15) * Math.PI * 2;
      const radius = 6 + Math.random() * 1;
      stalagmite.position.set(
        Math.cos(angle) * radius,
        -18 + Math.random() * 1,
        Math.sin(angle * 2) * 3
      );
      stalagmite.rotation.z = Math.random() * 0.2 - 0.1;
      stalagmite.castShadow = true;
      stalagmiteGroup.add(stalagmite);
    }
    scene.add(stalagmiteGroup);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    if (caveMesh) {
      caveMesh.rotation.y += 0.001;
      caveMesh.position.y = Math.sin(time * 0.3) * 0.5 - 20;
    }

    particles.forEach((particle, index) => {
      particle.position.y += Math.sin(time * 2 + index) * particle.userData.speed;
      particle.rotation.x += particle.userData.speed;
      particle.rotation.y += particle.userData.speed * 0.5;
      const distance = Math.sqrt(
        particle.position.x ** 2 + particle.position.y ** 2 + particle.position.z ** 2
      );
      if (distance > 25) {
        particle.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30
        );
      }
    });

    crystals.forEach((crystal) => {
      crystal.rotation.x += crystal.userData.rotationSpeed;
      crystal.rotation.y += crystal.userData.rotationSpeed * 0.7;
      crystal.position.y =
        crystal.userData.baseY + Math.sin(time * 2 + crystal.position.x) * 0.3;
    });

    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(0, -15, 0);

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
  }

  function handleResize() {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  function nextProject() {
    projectVisible = false;
    setTimeout(() => {
      currentProjectIndex = (currentProjectIndex + 1) % images.length;
      projectVisible = true;
    }, 300);
  }

  function prevProject() {
    projectVisible = false;
    setTimeout(() => {
      currentProjectIndex =
        (currentProjectIndex - 1 + images.length) % images.length;
      projectVisible = true;
    }, 300);
  }

  onMount(() => {
    initThree();
    animate();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      projectVisible = true;
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (renderer) {
        renderer.dispose();
      }
      if (caveGeometry) {
        caveGeometry.dispose();
      }
      particles.forEach((p) => {
        p.geometry.dispose();
        p.material.dispose();
      });
      crystals.forEach((c) => {
        c.geometry.dispose();
        c.material.dispose();
      });
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cave-container">
  <div bind:this={canvasContainer} class="three-canvas"></div>

  <div class="content-overlay">
    <div class="title-section">
      <h1 class="main-title">{title}</h1>
      <h2 class="duration-text">{duration}</h2>
      <div class="theme-badge">{theme}</div>
      <a
        href="https://itch.io/jam/camgamejam2023"
        class="submissions-link"
      >
        {submissions} {submissions == 1 ? "Submission" : "Submissions"}
      </a>
    </div>

    <div class="projects-section">
      <div
        class="project-card"
        class:visible={projectVisible}
        style="--index: {currentProjectIndex}"
      >
        <a href={images[currentProjectIndex].link} class="project-link">
          <div class="project-image-wrapper">
            <img
              src={images[currentProjectIndex].src}
              alt={images[currentProjectIndex].alt}
              class="project-image"
            />
            <div class="project-glow"></div>
          </div>
          <div class="project-info">
            <h3 class="project-title">{images[currentProjectIndex].title}</h3>
            {#if images[currentProjectIndex].prize}
              <p class="project-prize">{images[currentProjectIndex].prize}</p>
            {/if}
          </div>
        </a>
      </div>

      <div class="project-nav">
        <button class="nav-button prev" onclick={prevProject}>‹</button>
        <div class="project-indicators">
          {#each images as _, index}
            <button
              class="indicator"
              class:active={index === currentProjectIndex}
              aria-label="Go to project {index + 1}"
              onclick={() => {
                projectVisible = false;
                setTimeout(() => {
                  currentProjectIndex = index;
                  projectVisible = true;
                }, 300);
              }}
            ></button>
          {/each}
        </div>
        <button class="nav-button next" onclick={nextProject}>›</button>
      </div>
    </div>

    <BackToMainButton />
  </div>
</div>

<style>
  .cave-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a1a 100%);
  }

  .three-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .content-overlay {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2rem;
    pointer-events: none;
  }

  .title-section {
    text-align: center;
    pointer-events: auto;
    animation: fadeInDown 1.5s ease-out;
  }

  .main-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 900;
    background: linear-gradient(
      135deg,
      #ff6b35 0%,
      #f7931e 25%,
      #4a90e2 50%,
      #7b68ee 75%,
      #ff6b35 100%
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 8s ease infinite;
    text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
    margin-bottom: 1rem;
    letter-spacing: 0.05em;
  }

  .duration-text {
    font-size: clamp(1.2rem, 3vw, 2rem);
    color: #e0e0e0;
    margin-bottom: 1.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    animation: fadeIn 2s ease-out 0.3s both;
  }

  .theme-badge {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(74, 144, 226, 0.2));
    border: 2px solid rgba(255, 107, 53, 0.5);
    border-radius: 50px;
    color: #fff;
    font-size: clamp(1rem, 2vw, 1.5rem);
    font-weight: 600;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 107, 53, 0.1);
    margin-bottom: 1rem;
    animation: fadeIn 2s ease-out 0.6s both, pulse 3s ease-in-out infinite 2s;
  }

  .submissions-link {
    display: inline-block;
    color: #4a90e2;
    font-size: clamp(1rem, 2vw, 1.2rem);
    text-decoration: underline;
    text-decoration-color: rgba(74, 144, 226, 0.5);
    transition: all 0.3s ease;
    animation: fadeIn 2s ease-out 0.9s both;
  }

  .submissions-link:hover {
    color: #7b68ee;
    text-decoration-color: rgba(123, 104, 238, 0.8);
    text-shadow: 0 0 10px rgba(123, 104, 238, 0.5);
  }

  .projects-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    pointer-events: auto;
    animation: fadeInUp 1.5s ease-out 1.2s both;
  }

  .project-card {
    position: relative;
    width: 100%;
    max-width: 800px;
    opacity: 0;
    transform: translateY(50px) scale(0.9);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  .project-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .project-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .project-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 107, 53, 0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 107, 53, 0.2);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .project-image-wrapper:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(255, 107, 53, 0.6);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 107, 53, 0.4);
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .project-image-wrapper:hover .project-image {
    transform: scale(1.1);
  }

  .project-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at center,
      transparent 0%,
      rgba(255, 107, 53, 0.1) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .project-image-wrapper:hover .project-glow {
    opacity: 1;
  }

  .project-info {
    margin-top: 1.5rem;
    text-align: center;
  }

  .project-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #fff;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
    font-weight: 700;
  }

  .project-prize {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #4a90e2;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
    font-weight: 500;
  }

  .project-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 107, 53, 0.2);
    border: 2px solid rgba(255, 107, 53, 0.5);
    color: #fff;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .nav-button:hover {
    background: rgba(255, 107, 53, 0.4);
    border-color: rgba(255, 107, 53, 0.8);
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(255, 107, 53, 0.4);
  }

  .nav-button:active {
    transform: scale(0.95);
  }

  .project-indicators {
    display: flex;
    gap: 0.75rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(255, 107, 53, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }

  .indicator:hover {
    background: rgba(255, 107, 53, 0.5);
    transform: scale(1.2);
  }

  .indicator.active {
    background: #ff6b35;
    border-color: #ff6b35;
    box-shadow: 0 0 15px rgba(255, 107, 53, 0.8);
    transform: scale(1.3);
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
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

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 107, 53, 0.1);
    }
    50% {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 107, 53, 0.3);
    }
  }

  @media (max-width: 768px) {
    .content-overlay {
      padding: 1rem;
    }

    .projects-section {
      gap: 1rem;
    }

    .project-card {
      max-width: 100%;
    }

    .nav-button {
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
    }
  }
</style>
