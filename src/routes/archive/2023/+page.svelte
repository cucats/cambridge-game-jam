<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvasContainer;
  let scene, camera, renderer, particles, crystals = [];
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let currentProjectIndex = $state(0);
  let isAnimating = false;

  const projects = [
    {
      title: "Inferno Rising",
      prize: "Popular Vote",
      link: "https://firedemon111.itch.io/inferno-rising",
      image: "/2023/inferno-rising.png"
    },
    {
      title: "MAYI Garden",
      prize: "Best for Theme",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      image: "/2023/mayi-garden.png"
    },
    {
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      image: "/2023/rhythm-mythril-fever.png"
    },
    {
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      image: "/2023/beaneth-the-earth.png"
    },
    {
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      image: "/2023/deck-of-dwarves.png"
    }
  ];

  function nextProject() {
    if (!isAnimating) {
      isAnimating = true;
      currentProjectIndex = (currentProjectIndex + 1) % projects.length;
      setTimeout(() => { isAnimating = false; }, 600);
    }
  }

  function prevProject() {
    if (!isAnimating) {
      isAnimating = true;
      currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
      setTimeout(() => { isAnimating = false; }, 600);
    }
  }

  onMount(() => {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0f);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x4a3520, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6b35, 2, 100);
    pointLight1.position.set(20, 15, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3a86ff, 1.5, 100);
    pointLight2.position.set(-20, 10, -10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x8b5cf6, 2, 80);
    pointLight3.position.set(0, 20, -15);
    scene.add(pointLight3);

    const stalactiteGeometry = new THREE.ConeGeometry(1.5, 8, 6);
    const caveMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3d2817,
      roughness: 0.8,
      metalness: 0.2
    });

    for (let i = 0; i < 30; i++) {
      const stalactite = new THREE.Mesh(stalactiteGeometry, caveMaterial);
      stalactite.position.set(
        Math.random() * 100 - 50,
        20 + Math.random() * 10,
        Math.random() * 100 - 50
      );
      stalactite.rotation.x = Math.PI;
      stalactite.scale.y = 0.5 + Math.random() * 1.5;
      scene.add(stalactite);
    }

    const stalagmiteGeometry = new THREE.ConeGeometry(1.2, 6, 6);
    for (let i = 0; i < 35; i++) {
      const stalagmite = new THREE.Mesh(stalagmiteGeometry, caveMaterial);
      stalagmite.position.set(
        Math.random() * 100 - 50,
        -15,
        Math.random() * 100 - 50
      );
      stalagmite.scale.y = 0.4 + Math.random() * 1.2;
      scene.add(stalagmite);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = Math.random() * 200 - 100;
      positions[i * 3 + 1] = Math.random() * 100 - 20;
      positions[i * 3 + 2] = Math.random() * 200 - 100;

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.2;
      } else if (colorChoice < 0.6) {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.9;
      }
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const crystalGeometry = new THREE.OctahedronGeometry(2, 0);
    const crystalColors = [0xff6b35, 0x3a86ff, 0x8b5cf6, 0xfbbf24, 0x10b981];
    
    for (let i = 0; i < 12; i++) {
      const crystalMaterial = new THREE.MeshStandardMaterial({
        color: crystalColors[i % crystalColors.length],
        emissive: crystalColors[i % crystalColors.length],
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7,
        roughness: 0.3,
        metalness: 0.8
      });
      
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set(
        Math.random() * 80 - 40,
        Math.random() * 30 - 10,
        Math.random() * 80 - 40
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.scale.set(
        0.5 + Math.random() * 0.5,
        1 + Math.random() * 1.5,
        0.5 + Math.random() * 0.5
      );
      crystals.push({
        mesh: crystal,
        rotationSpeed: { 
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2
      });
      scene.add(crystal);
    }

    const wallGeometry = new THREE.PlaneGeometry(120, 60);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1810,
      roughness: 1,
      metalness: 0
    });
    
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -40;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -60;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = 60;
    scene.add(rightWall);

    const floorGeometry = new THREE.PlaneGeometry(120, 120);
    const floor = new THREE.Mesh(floorGeometry, wallMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -15;
    scene.add(floor);

    const ceilingGeometry = new THREE.PlaneGeometry(120, 120);
    const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 30;
    scene.add(ceiling);

    function handleMouseMove(event) {
      targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX * 5;
      camera.position.y = 5 - mouseY * 3;
      camera.lookAt(0, 0, 0);

      particles.rotation.y += 0.0005;
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i]) * 0.01;
        if (positions[i + 1] > 50) positions[i + 1] = -20;
        if (positions[i + 1] < -20) positions[i + 1] = 50;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      crystals.forEach((crystal, index) => {
        crystal.mesh.rotation.x += crystal.rotationSpeed.x;
        crystal.mesh.rotation.y += crystal.rotationSpeed.y;
        crystal.mesh.rotation.z += crystal.rotationSpeed.z;
        crystal.mesh.position.y += Math.sin(time * crystal.floatSpeed + crystal.floatOffset) * 0.05;
      });

      pointLight1.intensity = 2 + Math.sin(time * 0.5) * 0.5;
      pointLight2.intensity = 1.5 + Math.cos(time * 0.7) * 0.3;
      pointLight3.intensity = 2 + Math.sin(time * 0.3) * 0.4;

      pointLight1.position.x = 20 + Math.sin(time * 0.2) * 10;
      pointLight2.position.x = -20 + Math.cos(time * 0.3) * 10;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2023 - Beneath the Earth</title>
</svelte:head>

<div class="cave-container">
  <div bind:this={canvasContainer} class="three-canvas"></div>
  
  <div class="content-overlay">
    <header class="cave-header">
      <div class="title-glow">
        <h1 class="main-title">Cambridge Game Jam 2023</h1>
        <div class="subtitle">
          <span class="theme-text">Beneath the Earth</span>
          <span class="date-text">10th - 12th February</span>
        </div>
      </div>
      <a href="https://itch.io/jam/camgamejam2023" class="submissions-link" target="_blank" rel="noopener">
        <span class="crystal-icon">◆</span> 19 Submissions <span class="crystal-icon">◆</span>
      </a>
    </header>

    <section class="projects-section">
      <div class="project-display">
        <button class="nav-button prev" onclick={prevProject} aria-label="Previous project">
          <span class="arrow">‹</span>
        </button>

        <div class="project-container">
          {#each projects as project, index}
            <div 
              class="project-card"
              class:active={index === currentProjectIndex}
              style="transform: translateX({(index - currentProjectIndex) * 100}%) scale({index === currentProjectIndex ? 1 : 0.8}); opacity: {index === currentProjectIndex ? 1 : 0};"
            >
              <a href={project.link} target="_blank" rel="noopener" class="project-link">
                <div class="image-frame">
                  <img src={project.image} alt={project.title} class="project-image" />
                  <div class="frame-glow"></div>
                </div>
                <div class="project-info">
                  <h2 class="project-title">{project.title}</h2>
                  <p class="project-prize">{project.prize}</p>
                </div>
              </a>
            </div>
          {/each}
        </div>

        <button class="nav-button next" onclick={nextProject} aria-label="Next project">
          <span class="arrow">›</span>
        </button>
      </div>

      <div class="indicators">
        {#each projects as _, index}
          <button
            class="indicator"
            class:active={index === currentProjectIndex}
            onclick={() => { 
              if (!isAnimating) {
                isAnimating = true;
                currentProjectIndex = index;
                setTimeout(() => { isAnimating = false; }, 600);
              }
            }}
            aria-label={`Go to project ${index + 1}`}
          ></button>
        {/each}
      </div>
    </section>

    <a href="/archive" class="back-button">
      <span class="back-arrow">←</span> Back to Archive
    </a>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #0a0a0f;
  }

  .cave-container {
    position: relative;
    width: 100vw;
    min-height: 100vh;
    overflow: hidden;
    background: #0a0a0f;
  }

  .three-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .content-overlay {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2rem;
  }

  .cave-header {
    text-align: center;
    padding: 3rem 1rem 2rem;
    animation: fadeInDown 1.5s ease-out;
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .title-glow {
    background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
    padding: 2rem;
    border-radius: 20px;
  }

  .main-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 900;
    color: #fbbf24;
    text-shadow: 
      0 0 20px rgba(251, 191, 36, 0.8),
      0 0 40px rgba(251, 191, 36, 0.6),
      0 0 60px rgba(251, 191, 36, 0.4),
      3px 3px 10px rgba(0, 0, 0, 0.8);
    margin: 0 0 1rem;
    letter-spacing: 0.05em;
    animation: titlePulse 3s ease-in-out infinite;
  }

  @keyframes titlePulse {
    0%, 100% {
      text-shadow: 
        0 0 20px rgba(251, 191, 36, 0.8),
        0 0 40px rgba(251, 191, 36, 0.6),
        0 0 60px rgba(251, 191, 36, 0.4),
        3px 3px 10px rgba(0, 0, 0, 0.8);
    }
    50% {
      text-shadow: 
        0 0 30px rgba(251, 191, 36, 1),
        0 0 60px rgba(251, 191, 36, 0.8),
        0 0 90px rgba(251, 191, 36, 0.6),
        3px 3px 10px rgba(0, 0, 0, 0.8);
    }
  }

  .subtitle {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: clamp(1.2rem, 4vw, 2rem);
  }

  .theme-text {
    color: #8b5cf6;
    font-weight: 700;
    text-shadow: 
      0 0 15px rgba(139, 92, 246, 0.9),
      0 0 30px rgba(139, 92, 246, 0.6),
      2px 2px 8px rgba(0, 0, 0, 0.8);
  }

  .date-text {
    color: #3a86ff;
    font-weight: 600;
    text-shadow: 
      0 0 10px rgba(58, 134, 255, 0.8),
      0 0 20px rgba(58, 134, 255, 0.5),
      2px 2px 6px rgba(0, 0, 0, 0.8);
  }

  .submissions-link {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(251, 191, 36, 0.3));
    border: 2px solid rgba(251, 191, 36, 0.6);
    border-radius: 15px;
    color: #fbbf24;
    font-size: 1.3rem;
    font-weight: 700;
    text-decoration: none;
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
    box-shadow: 
      0 0 20px rgba(139, 92, 246, 0.4),
      inset 0 0 20px rgba(139, 92, 246, 0.2);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .submissions-link:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(251, 191, 36, 0.5));
    border-color: rgba(251, 191, 36, 0.9);
    box-shadow: 
      0 0 30px rgba(251, 191, 36, 0.6),
      inset 0 0 30px rgba(139, 92, 246, 0.3);
    transform: translateY(-3px);
  }

  .crystal-icon {
    color: #8b5cf6;
    font-size: 1.5rem;
    animation: crystalRotate 2s linear infinite;
    display: inline-block;
  }

  @keyframes crystalRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .projects-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem 0;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .project-display {
    position: relative;
    width: 100%;
    max-width: 900px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .project-container {
    position: relative;
    width: 100%;
    height: 600px;
    overflow: hidden;
    perspective: 1000px;
  }

  .project-card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  .project-card.active {
    pointer-events: auto;
  }

  .project-link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    transition: transform 0.3s ease;
  }

  .project-link:hover {
    transform: scale(1.02);
  }

  .image-frame {
    position: relative;
    width: 100%;
    height: 450px;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a2e, #0f0f1e);
    border: 3px solid rgba(139, 92, 246, 0.5);
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.6),
      0 0 40px rgba(139, 92, 246, 0.3),
      inset 0 0 30px rgba(139, 92, 246, 0.1);
    animation: frameGlow 2s ease-in-out infinite;
  }

  @keyframes frameGlow {
    0%, 100% {
      box-shadow: 
        0 10px 40px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(139, 92, 246, 0.3),
        inset 0 0 30px rgba(139, 92, 246, 0.1);
    }
    50% {
      box-shadow: 
        0 10px 40px rgba(0, 0, 0, 0.6),
        0 0 60px rgba(139, 92, 246, 0.5),
        inset 0 0 40px rgba(139, 92, 246, 0.2);
    }
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .project-link:hover .project-image {
    transform: scale(1.05);
  }

  .frame-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 40%, rgba(139, 92, 246, 0.2) 100%);
    pointer-events: none;
  }

  .project-info {
    text-align: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(42, 24, 16, 0.8), rgba(61, 40, 23, 0.8));
    border-radius: 0 0 20px 20px;
    backdrop-filter: blur(10px);
  }

  .project-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 800;
    color: #fbbf24;
    text-shadow: 
      0 0 15px rgba(251, 191, 36, 0.8),
      2px 2px 8px rgba(0, 0, 0, 0.8);
    margin: 0 0 0.5rem;
  }

  .project-prize {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    color: #3a86ff;
    text-shadow: 
      0 0 10px rgba(58, 134, 255, 0.8),
      1px 1px 5px rgba(0, 0, 0, 0.8);
    margin: 0;
    font-weight: 600;
  }

  .nav-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(58, 134, 255, 0.4));
    border: 2px solid rgba(139, 92, 246, 0.6);
    color: #fbbf24;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 
      0 5px 20px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(139, 92, 246, 0.4);
    backdrop-filter: blur(10px);
    flex-shrink: 0;
  }

  .nav-button:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(58, 134, 255, 0.6));
    border-color: rgba(251, 191, 36, 0.8);
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(251, 191, 36, 0.5);
    transform: scale(1.1);
  }

  .nav-button:active {
    transform: scale(0.95);
  }

  .arrow {
    display: block;
    line-height: 1;
  }

  .indicators {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .indicator {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.3);
    border: 2px solid rgba(139, 92, 246, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
  }

  .indicator:hover {
    background: rgba(139, 92, 246, 0.5);
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
    transform: scale(1.2);
  }

  .indicator.active {
    background: linear-gradient(135deg, #fbbf24, #ff6b35);
    border-color: #fbbf24;
    box-shadow: 
      0 0 20px rgba(251, 191, 36, 0.8),
      0 0 30px rgba(255, 107, 53, 0.5);
    transform: scale(1.3);
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, rgba(42, 24, 16, 0.7), rgba(61, 40, 23, 0.7));
    border: 2px solid rgba(139, 92, 246, 0.5);
    border-radius: 15px;
    color: #fbbf24;
    font-size: 1.2rem;
    font-weight: 700;
    text-decoration: none;
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
    box-shadow: 
      0 5px 20px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(139, 92, 246, 0.3);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    align-self: flex-start;
    margin-top: 2rem;
  }

  .back-button:hover {
    background: linear-gradient(135deg, rgba(61, 40, 23, 0.8), rgba(80, 52, 30, 0.8));
    border-color: rgba(251, 191, 36, 0.8);
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(251, 191, 36, 0.5);
    transform: translateX(-5px);
  }

  .back-arrow {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  .back-button:hover .back-arrow {
    transform: translateX(-5px);
  }

  @media (max-width: 768px) {
    .content-overlay {
      padding: 1rem;
    }

    .cave-header {
      padding: 2rem 0.5rem 1rem;
    }

    .title-glow {
      padding: 1rem;
    }

    .project-display {
      gap: 1rem;
    }

    .project-container {
      height: 500px;
    }

    .image-frame {
      height: 350px;
    }

    .nav-button {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
    }

    .submissions-link {
      font-size: 1rem;
      padding: 0.8rem 1.5rem;
    }

    .crystal-icon {
      font-size: 1.2rem;
    }
  }

  @media (max-width: 480px) {
    .project-container {
      height: 400px;
    }

    .image-frame {
      height: 280px;
    }

    .project-info {
      padding: 1rem;
    }

    .nav-button {
      width: 45px;
      height: 45px;
      font-size: 1.3rem;
    }
  }
</style>
