<script>
  import { onMount, onDestroy } from "svelte";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const games = [
    {
      src: "/2024/blight.png",
      alt: "Blight",
      link: "https://hex-26.itch.io/blight",
      title: "Blight",
      prize: "Most Popular and Best Gameplay",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      alt: "Reflect Upon Your Actions",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular and Most Original",
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

  let currentIndex = $state(0);
  let canvasContainer = $state(null);
  let scene, camera, renderer, animationId;
  let crystals = [];
  let particles = [];
  let THREE;
  let scrollY = $state(0);

  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % games.length;
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + games.length) % games.length;
  };

  function createLowPolyCrystal(color, size) {
    const geometry = new THREE.OctahedronGeometry(size, 0);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
      emissive: color,
      emissiveIntensity: 0.1,
    });
    return new THREE.Mesh(geometry, material);
  }

  function createDiamond(color, size) {
    const geometry = new THREE.OctahedronGeometry(size, 0);
    geometry.scale(1, 1.5, 1);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      flatShading: true,
      transparent: true,
      opacity: 0.7,
      shininess: 200,
      emissive: color,
      emissiveIntensity: 0.15,
    });
    return new THREE.Mesh(geometry, material);
  }

  function createParticle() {
    const geometry = new THREE.TetrahedronGeometry(0.08, 0);
    const colors = [0x8b5cf6, 0x6366f1, 0x3b82f6, 0xa855f7, 0xec4899, 0x06b6d4];
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.8,
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(
      (Math.random() - 0.5) * 30,
      Math.random() * 15 - 5,
      (Math.random() - 0.5) * 20,
    );
    particle.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.03 + 0.01,
        z: (Math.random() - 0.5) * 0.02,
      },
      rotationSpeed: {
        x: Math.random() * 0.1,
        y: Math.random() * 0.1,
        z: Math.random() * 0.1,
      },
      life: Math.random() * 100,
    };
    return particle;
  }

  function createMirrorPlane() {
    const geometry = new THREE.PlaneGeometry(100, 100, 30, 30);
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += Math.random() * 0.3;
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      flatShading: true,
      shininess: 150,
      specular: 0x6366f1,
      transparent: true,
      opacity: 0.9,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3;
    plane.userData = { originalPositions: [...positions] };
    return plane;
  }

  function initThreeJS() {
    if (!canvasContainer || !THREE) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1a);
    scene.fog = new THREE.FogExp2(0x0f0f1a, 0.035);

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 25);
    purpleLight.position.set(-5, 3, 3);
    purpleLight.userData = { phase: 0 };
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 25);
    blueLight.position.set(5, 3, -3);
    blueLight.userData = { phase: Math.PI / 2 };
    scene.add(blueLight);

    const pinkLight = new THREE.PointLight(0xec4899, 1.5, 25);
    pinkLight.position.set(0, 5, 5);
    pinkLight.userData = { phase: Math.PI };
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.5, 25);
    cyanLight.position.set(-3, -1, 8);
    cyanLight.userData = { phase: Math.PI * 1.5 };
    scene.add(cyanLight);

    const mirrorPlane = createMirrorPlane();
    mirrorPlane.userData.isMirror = true;
    scene.add(mirrorPlane);

    const crystalColors = [
      0x8b5cf6, 0x6366f1, 0x3b82f6, 0xa855f7, 0x06b6d4, 0xec4899, 0xf472b6,
      0x818cf8,
    ];

    for (let i = 0; i < 25; i++) {
      const color =
        crystalColors[Math.floor(Math.random() * crystalColors.length)];
      const size = 0.2 + Math.random() * 0.8;
      const crystal =
        Math.random() > 0.5
          ? createLowPolyCrystal(color, size)
          : createDiamond(color, size);

      crystal.position.set(
        (Math.random() - 0.5) * 25,
        Math.random() * 8 - 2,
        (Math.random() - 0.5) * 18 - 3,
      );

      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );

      crystal.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.03,
        },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.3 + Math.random() * 0.7,
        floatAmplitude: 0.3 + Math.random() * 0.5,
        originalY: crystal.position.y,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 1 + Math.random() * 2,
        orbitRadius: Math.random() > 0.7 ? 0.5 + Math.random() * 1 : 0,
        orbitSpeed: (Math.random() - 0.5) * 0.5,
        orbitOffset: Math.random() * Math.PI * 2,
        originalX: crystal.position.x,
        originalZ: crystal.position.z,
        color: color,
      };

      crystals.push(crystal);
      scene.add(crystal);

      const reflectedCrystal = crystal.clone();
      reflectedCrystal.material = crystal.material.clone();
      reflectedCrystal.material.opacity = 0.3;
      reflectedCrystal.position.y = -6 - crystal.position.y;
      reflectedCrystal.scale.y = -1;
      reflectedCrystal.userData = {
        ...crystal.userData,
        isReflection: true,
        original: crystal,
      };
      crystals.push(reflectedCrystal);
      scene.add(reflectedCrystal);
    }

    const mainCrystal = createLowPolyCrystal(0xe879f9, 2);
    mainCrystal.position.set(0, 1, 0);
    mainCrystal.userData = {
      rotationSpeed: { x: 0.008, y: 0.015, z: 0.005 },
      floatOffset: 0,
      floatSpeed: 0.4,
      floatAmplitude: 0.5,
      originalY: 1,
      pulseOffset: 0,
      pulseSpeed: 1.5,
      orbitRadius: 0,
      isMain: true,
    };
    crystals.push(mainCrystal);
    scene.add(mainCrystal);

    const mainReflection = mainCrystal.clone();
    mainReflection.material = mainCrystal.material.clone();
    mainReflection.material.opacity = 0.25;
    mainReflection.position.y = -7;
    mainReflection.scale.y = -1;
    mainReflection.userData = {
      ...mainCrystal.userData,
      isReflection: true,
      original: mainCrystal,
    };
    crystals.push(mainReflection);
    scene.add(mainReflection);

    for (let i = 0; i < 60; i++) {
      const particle = createParticle();
      particles.push(particle);
      scene.add(particle);
    }

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    scene.children.forEach((child) => {
      if (child.type === "PointLight" && child.userData.phase !== undefined) {
        child.intensity = 1.5 + Math.sin(time * 2 + child.userData.phase) * 0.8;
        const radius = 2;
        child.position.x += Math.sin(time * 0.5 + child.userData.phase) * 0.02;
        child.position.z += Math.cos(time * 0.5 + child.userData.phase) * 0.02;
      }

      if (child.userData.isMirror) {
        const positions = child.geometry.attributes.position.array;
        const original = child.userData.originalPositions;
        for (let i = 0; i < positions.length; i += 3) {
          const waveX = Math.sin(time * 0.5 + original[i] * 0.1) * 0.1;
          const waveY = Math.cos(time * 0.7 + original[i + 1] * 0.1) * 0.1;
          positions[i + 2] = original[i + 2] + waveX + waveY;
        }
        child.geometry.attributes.position.needsUpdate = true;
      }
    });

    crystals.forEach((crystal) => {
      if (crystal.userData.isReflection) {
        const orig = crystal.userData.original;
        crystal.position.x = orig.position.x;
        crystal.position.y = -6 - orig.position.y;
        crystal.position.z = orig.position.z;
        crystal.rotation.x = -orig.rotation.x;
        crystal.rotation.y = orig.rotation.y;
        crystal.rotation.z = orig.rotation.z;
        crystal.scale.x = orig.scale.x;
        crystal.scale.z = orig.scale.z;
      } else {
        crystal.rotation.x += crystal.userData.rotationSpeed.x;
        crystal.rotation.y += crystal.userData.rotationSpeed.y;
        crystal.rotation.z += crystal.userData.rotationSpeed.z;

        crystal.position.y =
          crystal.userData.originalY +
          Math.sin(
            time * crystal.userData.floatSpeed + crystal.userData.floatOffset,
          ) *
            crystal.userData.floatAmplitude;

        if (crystal.userData.orbitRadius > 0) {
          crystal.position.x =
            crystal.userData.originalX +
            Math.sin(time * crystal.userData.orbitSpeed + crystal.userData.orbitOffset) *
              crystal.userData.orbitRadius;
          crystal.position.z =
            crystal.userData.originalZ +
            Math.cos(time * crystal.userData.orbitSpeed + crystal.userData.orbitOffset) *
              crystal.userData.orbitRadius;
        }

        const pulse =
          1 +
          Math.sin(
            time * crystal.userData.pulseSpeed + crystal.userData.pulseOffset,
          ) *
            0.15;
        crystal.scale.setScalar(pulse);

        if (crystal.material.emissiveIntensity !== undefined) {
          crystal.material.emissiveIntensity =
            0.1 +
            Math.sin(
              time * crystal.userData.pulseSpeed + crystal.userData.pulseOffset,
            ) *
              0.1;
        }
      }
    });

    particles.forEach((particle) => {
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;

      particle.rotation.x += particle.userData.rotationSpeed.x;
      particle.rotation.y += particle.userData.rotationSpeed.y;
      particle.rotation.z += particle.userData.rotationSpeed.z;

      if (particle.position.y > 10) {
        particle.position.y = -5;
        particle.position.x = (Math.random() - 0.5) * 30;
        particle.position.z = (Math.random() - 0.5) * 20;
      }

      particle.material.opacity = 0.3 + Math.sin(time * 3 + particle.userData.life) * 0.5;
    });

    const cameraRadius = 0.8;
    camera.position.x = Math.sin(time * 0.15) * cameraRadius;
    camera.position.y = 2 + Math.sin(time * 0.2) * 0.4 + scrollY * 0.002;
    camera.position.z = 12 + Math.cos(time * 0.1) * 0.5;
    camera.lookAt(
      Math.sin(time * 0.1) * 0.3,
      Math.sin(time * 0.15) * 0.2,
      0,
    );

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  onMount(async () => {
    THREE = await import("three");
    initThreeJS();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-wrapper">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <div class="content-overlay">
    <header class="hero-section">
      <div class="logo-wrapper">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        <div class="logo-glow"></div>
        <div class="logo-ring"></div>
        <div class="logo-ring ring-2"></div>
        <div class="logo-ring ring-3"></div>
      </div>
      <div class="hero-text">
        <h1 class="main-title">
          {#each title.split("") as char, i}
            <span class="char" style="--delay: {i * 0.05}s">{char === " " ? "\u00A0" : char}</span>
          {/each}
        </h1>
        <p class="date-text">{duration}</p>
        <div class="theme-badge">
          <span class="theme-label">Theme:</span>
          <span class="theme-value">{theme}</span>
          <div class="badge-shimmer"></div>
        </div>
        <p class="submissions-text">
          <a href="https://itch.io/jam/camgamejam2024" class="submissions-link">
            <span class="count-number">{submissions}</span> Submissions
          </a>
        </p>
      </div>
      <div class="scroll-indicator">
        <span class="scroll-text">Scroll to explore</span>
        <div class="scroll-arrow"></div>
      </div>
    </header>

    <section class="about-section">
      <h2 class="section-title">
        <span class="title-word">About</span>
        <span class="title-word">the</span>
        <span class="title-word">Jam</span>
      </h2>
      <p class="section-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </p>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </section>

    <section class="games-section">
      <h2 class="section-title">
        <span class="title-word">Featured</span>
        <span class="title-word">Games</span>
      </h2>
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" onclick={prevSlide}>
          <span class="btn-icon">&#9664;</span>
        </button>
        <div class="carousel">
          <div
            class="carousel-track"
            style="transform: translateX(-{currentIndex * 100}%)"
          >
            {#each games as game, idx}
              <a href={game.link} class="game-card">
                <div class="game-image-wrapper">
                  <img src={game.src} alt={game.alt} class="game-image" />
                  <div class="game-overlay"></div>
                  <div class="game-shine"></div>
                </div>
                <div class="game-info">
                  <h3 class="game-title">{game.title}</h3>
                  {#if game.prize}
                    <p class="game-prize">
                      <span class="prize-icon">🏆</span>
                      {game.prize}
                    </p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        </div>
        <button class="carousel-btn next" onclick={nextSlide}>
          <span class="btn-icon">&#9654;</span>
        </button>
      </div>
      <div class="carousel-dots">
        {#each games as _, index}
          <button
            class="dot"
            class:active={index === currentIndex}
            onclick={() => (currentIndex = index)}
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    </section>

    <section class="gallery-section">
      <h2 class="section-title">
        <span class="title-word">Memories</span>
      </h2>
      <div class="gallery-grid">
        <div class="gallery-item large">
          <img
            src="/2024/group-photo.jpg"
            alt="Participants at Cambridge Game Jam 2024"
          />
          <div class="gallery-overlay"></div>
        </div>
      </div>
      <p class="section-text gallery-caption">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </section>

    <nav class="back-nav">
      <a href="/" class="back-link">
        <span class="back-arrow">←</span>
        <span>Back to Main</span>
        <div class="link-glow"></div>
      </a>
    </nav>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .page-wrapper {
    min-height: 100vh;
    position: relative;
    font-family: "Space Grotesk", sans-serif;
    background: #0f0f1a;
    color: #e2e8f0;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .content-overlay {
    position: relative;
    z-index: 10;
    padding-bottom: 4rem;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(15, 15, 26, 0.4) 50%,
      rgba(15, 15, 26, 0.8) 100%
    );
    position: relative;
  }

  .logo-wrapper {
    margin-bottom: 2rem;
    position: relative;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5));
    animation: logoFloat 4s ease-in-out infinite, logoPulse 2s ease-in-out infinite;
    position: relative;
    z-index: 2;
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
    animation: glowPulse 3s ease-in-out infinite;
    z-index: 1;
  }

  .logo-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 220px;
    height: 220px;
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 50%;
    animation: ringExpand 3s ease-out infinite;
  }

  .logo-ring.ring-2 {
    animation-delay: 1s;
  }

  .logo-ring.ring-3 {
    animation-delay: 2s;
  }

  @keyframes logoFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-15px) rotate(2deg); }
    50% { transform: translateY(-5px) rotate(0deg); }
    75% { transform: translateY(-20px) rotate(-2deg); }
  }

  @keyframes logoPulse {
    0%, 100% { filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5)); }
    50% { filter: drop-shadow(0 0 50px rgba(236, 72, 153, 0.7)); }
  }

  @keyframes glowPulse {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.5;
    }
    50% { 
      transform: translate(-50%, -50%) scale(1.3);
      opacity: 0.8;
    }
  }

  @keyframes ringExpand {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }

  .hero-text {
    max-width: 600px;
  }

  .main-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #8b5cf6 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientFlow 3s ease infinite;
  }

  .char {
    display: inline-block;
    animation: charReveal 0.5s ease forwards, charFloat 3s ease-in-out infinite;
    animation-delay: var(--delay), calc(var(--delay) + 0.5s);
    opacity: 0;
    transform: translateY(20px);
  }

  @keyframes charReveal {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes charFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .date-text {
    font-size: 1.5rem;
    color: #94a3b8;
    margin-bottom: 1.5rem;
    animation: fadeSlideUp 0.8s ease 0.5s forwards;
    opacity: 0;
    transform: translateY(20px);
  }

  @keyframes fadeSlideUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;
    animation: fadeSlideUp 0.8s ease 0.7s forwards, badgePulse 2s ease-in-out infinite;
    opacity: 0;
    transform: translateY(20px);
  }

  .badge-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 200%; }
  }

  @keyframes badgePulse {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
      border-color: rgba(139, 92, 246, 0.3);
    }
    50% { 
      box-shadow: 0 0 40px rgba(236, 72, 153, 0.5);
      border-color: rgba(236, 72, 153, 0.5);
    }
  }

  .theme-label {
    color: #a78bfa;
    font-weight: 500;
  }

  .theme-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #e879f9;
    animation: textGlow 2s ease-in-out infinite;
  }

  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 10px rgba(232, 121, 249, 0.5); }
    50% { text-shadow: 0 0 20px rgba(232, 121, 249, 0.8), 0 0 30px rgba(232, 121, 249, 0.4); }
  }

  .submissions-text {
    margin-top: 1rem;
    animation: fadeSlideUp 0.8s ease 0.9s forwards;
    opacity: 0;
    transform: translateY(20px);
  }

  .submissions-link {
    color: #8b5cf6;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .count-number {
    font-size: 1.5rem;
    font-weight: 700;
    animation: countPulse 1s ease-in-out infinite;
  }

  @keyframes countPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .submissions-link:hover {
    color: #a78bfa;
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    animation: fadeIn 1s ease 1.5s forwards;
    opacity: 0;
  }

  @keyframes fadeIn {
    to { opacity: 1; }
  }

  .scroll-text {
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 2px solid #8b5cf6;
    border-bottom: 2px solid #8b5cf6;
    transform: rotate(45deg);
    animation: scrollBounce 1.5s ease-in-out infinite;
  }

  @keyframes scrollBounce {
    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 1; }
    50% { transform: rotate(45deg) translateY(10px); opacity: 0.5; }
  }

  .about-section,
  .games-section,
  .gallery-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 4rem 2rem;
    background: rgba(15, 15, 26, 0.85);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .floating-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .shape {
    position: absolute;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
    border-radius: 50%;
  }

  .shape-1 {
    width: 100px;
    height: 100px;
    top: 10%;
    left: 5%;
    animation: shapeFloat 8s ease-in-out infinite;
  }

  .shape-2 {
    width: 60px;
    height: 60px;
    top: 60%;
    right: 10%;
    animation: shapeFloat 6s ease-in-out infinite reverse;
  }

  .shape-3 {
    width: 80px;
    height: 80px;
    bottom: 10%;
    left: 15%;
    animation: shapeFloat 10s ease-in-out infinite;
    animation-delay: 1s;
  }

  @keyframes shapeFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(20px, -30px) rotate(90deg); }
    50% { transform: translate(-10px, -50px) rotate(180deg); }
    75% { transform: translate(30px, -20px) rotate(270deg); }
  }

  .section-title {
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 2rem;
    color: #a78bfa;
  }

  .title-word {
    display: inline-block;
    animation: wordBounce 0.5s ease forwards;
    opacity: 0;
    transform: translateY(30px);
  }

  .title-word:nth-child(1) { animation-delay: 0.1s; }
  .title-word:nth-child(2) { animation-delay: 0.2s; }
  .title-word:nth-child(3) { animation-delay: 0.3s; }

  @keyframes wordBounce {
    0% { 
      opacity: 0;
      transform: translateY(30px) scale(0.5);
    }
    60% {
      transform: translateY(-10px) scale(1.1);
    }
    100% { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .section-text {
    text-align: center;
    color: #94a3b8;
    line-height: 1.8;
    max-width: 700px;
    margin: 0 auto;
    animation: fadeSlideUp 0.8s ease 0.3s forwards;
    opacity: 0;
    transform: translateY(20px);
  }

  .carousel-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .carousel {
    flex: 1;
    overflow: hidden;
    border-radius: 1rem;
  }

  .carousel-track {
    display: flex;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .game-card {
    flex: 0 0 100%;
    text-decoration: none;
    color: inherit;
    display: block;
    transition: transform 0.3s ease;
  }

  .game-card:hover {
    transform: scale(1.02);
  }

  .game-image-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    aspect-ratio: 16 / 9;
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease, filter 0.3s ease;
  }

  .game-card:hover .game-image {
    transform: scale(1.1);
    filter: brightness(1.1);
  }

  .game-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to top,
      rgba(15, 15, 26, 0.8) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .game-card:hover .game-overlay {
    opacity: 1;
  }

  .game-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% { left: -100%; }
    100% { left: 200%; }
  }

  .game-info {
    text-align: center;
    padding: 1.5rem;
  }

  .game-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  .game-card:hover .game-title {
    color: #a78bfa;
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }

  .game-prize {
    color: #e879f9;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .prize-icon {
    animation: trophyBounce 1s ease-in-out infinite;
  }

  @keyframes trophyBounce {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(-10deg); }
    75% { transform: translateY(-5px) rotate(10deg); }
  }

  .carousel-btn {
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #a78bfa;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.3s ease;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .carousel-btn::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(139, 92, 246, 0.4);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.4s ease;
  }

  .carousel-btn:hover::before {
    width: 100%;
    height: 100%;
  }

  .carousel-btn:hover {
    border-color: #a78bfa;
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
  }

  .btn-icon {
    position: relative;
    z-index: 1;
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.3);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .dot::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 1px solid transparent;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #a78bfa;
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
  }

  .dot.active::after {
    border-color: rgba(139, 92, 246, 0.5);
    animation: dotRing 1.5s ease-out infinite;
  }

  @keyframes dotRing {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  .gallery-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .gallery-item {
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .gallery-item:hover img {
    transform: scale(1.05);
  }

  .gallery-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.1) 0%,
      rgba(236, 72, 153, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .gallery-item:hover .gallery-overlay {
    opacity: 1;
  }

  .gallery-item.large {
    aspect-ratio: 16 / 9;
  }

  .gallery-caption {
    margin-top: 1rem;
  }

  .back-nav {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 100;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(15, 15, 26, 0.95);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 9999px;
    color: #a78bfa;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }

  .link-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent);
    border-radius: 50%;
    transition: all 0.4s ease;
  }

  .back-link:hover .link-glow {
    width: 200%;
    height: 200%;
  }

  .back-link:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: #a78bfa;
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.3);
  }

  .back-arrow {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }

  .back-link:hover .back-arrow {
    transform: translateX(-5px);
    animation: arrowPulse 0.5s ease infinite;
  }

  @keyframes arrowPulse {
    0%, 100% { transform: translateX(-5px); }
    50% { transform: translateX(-10px); }
  }

  @media (max-width: 768px) {
    .main-title {
      font-size: 2rem;
    }

    .logo {
      width: 150px;
      height: 150px;
    }

    .logo-glow {
      width: 180px;
      height: 180px;
    }

    .logo-ring {
      width: 160px;
      height: 160px;
    }

    .hero-section {
      padding: 1rem;
    }

    .about-section,
    .games-section,
    .gallery-section {
      padding: 2rem 1rem;
    }

    .carousel-btn {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }
</style>
