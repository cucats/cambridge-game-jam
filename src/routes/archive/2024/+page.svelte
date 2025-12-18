<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

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
  ];

  let canvasContainer;
  let heroSection;
  let gameCards = [];
  let scrollY = $state(0);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let isLoaded = $state(false);
  let activeCard = $state(-1);

  onMount(() => {
    let scene,
      camera,
      renderer,
      crystals = [],
      particles,
      mirrorMesh,
      clock;
    let animationId;

    const init = () => {
      clock = new THREE.Clock();
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 8, 20);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      canvasContainer.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0x4444ff, 0.3);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1);
      mainLight.position.set(10, 20, 10);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      scene.add(mainLight);

      const pointLight1 = new THREE.PointLight(0xff00ff, 2, 50);
      pointLight1.position.set(-10, 5, -10);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x00ffff, 2, 50);
      pointLight2.position.set(10, 5, 10);
      scene.add(pointLight2);

      const pointLight3 = new THREE.PointLight(0xffff00, 1.5, 40);
      pointLight3.position.set(0, 10, 0);
      scene.add(pointLight3);

      const mirrorGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
      const mirrorMaterial = new THREE.MeshStandardMaterial({
        color: 0x111122,
        metalness: 0.95,
        roughness: 0.05,
        envMapIntensity: 1.5,
      });
      mirrorMesh = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
      mirrorMesh.rotation.x = -Math.PI / 2;
      mirrorMesh.position.y = -2;
      mirrorMesh.receiveShadow = true;
      scene.add(mirrorMesh);

      const createLowPolyCrystal = (size, color, position, rotationSpeed) => {
        const geometry = new THREE.OctahedronGeometry(size, 0);
        const material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.8,
          roughness: 0.1,
          flatShading: true,
          transparent: true,
          opacity: 0.9,
        });

        const crystal = new THREE.Mesh(geometry, material);
        crystal.position.copy(position);
        crystal.castShadow = true;
        crystal.userData = {
          rotationSpeed,
          originalY: position.y,
          floatSpeed: Math.random() * 0.5 + 0.5,
          floatOffset: Math.random() * Math.PI * 2,
        };
        scene.add(crystal);

        const reflectionGeometry = new THREE.OctahedronGeometry(size, 0);
        const reflectionMaterial = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.8,
          roughness: 0.1,
          flatShading: true,
          transparent: true,
          opacity: 0.4,
        });
        const reflection = new THREE.Mesh(
          reflectionGeometry,
          reflectionMaterial,
        );
        reflection.position.copy(position);
        reflection.position.y = -4 - position.y;
        reflection.scale.y = -1;
        reflection.userData = { parent: crystal };
        scene.add(reflection);

        return { crystal, reflection };
      };

      const crystalConfigs = [
        {
          size: 2,
          color: 0xff3366,
          pos: new THREE.Vector3(-8, 4, -5),
          speed: { x: 0.003, y: 0.005, z: 0.002 },
        },
        {
          size: 1.5,
          color: 0x33ff99,
          pos: new THREE.Vector3(6, 6, -3),
          speed: { x: 0.004, y: 0.003, z: 0.005 },
        },
        {
          size: 2.5,
          color: 0x3399ff,
          pos: new THREE.Vector3(0, 8, -8),
          speed: { x: 0.002, y: 0.004, z: 0.003 },
        },
        {
          size: 1,
          color: 0xffff33,
          pos: new THREE.Vector3(-5, 3, 2),
          speed: { x: 0.005, y: 0.002, z: 0.004 },
        },
        {
          size: 1.8,
          color: 0xff33ff,
          pos: new THREE.Vector3(8, 5, 0),
          speed: { x: 0.003, y: 0.006, z: 0.002 },
        },
        {
          size: 1.2,
          color: 0x33ffff,
          pos: new THREE.Vector3(-3, 7, -6),
          speed: { x: 0.004, y: 0.003, z: 0.005 },
        },
        {
          size: 0.8,
          color: 0xff6633,
          pos: new THREE.Vector3(4, 4, 3),
          speed: { x: 0.006, y: 0.004, z: 0.003 },
        },
        {
          size: 1.4,
          color: 0x66ff33,
          pos: new THREE.Vector3(-6, 5, -2),
          speed: { x: 0.003, y: 0.005, z: 0.004 },
        },
      ];

      crystalConfigs.forEach((config) => {
        crystals.push(
          createLowPolyCrystal(
            config.size,
            config.color,
            config.pos,
            config.speed,
          ),
        );
      });

      const particleCount = 500;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = Math.random() * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.8, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 1;
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      particleGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3),
      );
      particleGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(sizes, 1),
      );

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      for (let i = 0; i < 12; i++) {
        const ringGeometry = new THREE.TorusGeometry(5 + i * 2, 0.05, 8, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(i / 12, 0.7, 0.5),
          metalness: 0.9,
          roughness: 0.1,
          transparent: true,
          opacity: 0.4,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1.9;
        ring.userData = {
          rotationSpeed: 0.001 * (i % 2 === 0 ? 1 : -1) * (i + 1),
        };
        scene.add(ring);

        crystals.push({ crystal: ring, reflection: null });
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      crystals.forEach(({ crystal, reflection }) => {
        if (crystal.geometry.type === "OctahedronGeometry") {
          crystal.rotation.x += crystal.userData.rotationSpeed.x;
          crystal.rotation.y += crystal.userData.rotationSpeed.y;
          crystal.rotation.z += crystal.userData.rotationSpeed.z;

          const floatY =
            Math.sin(
              elapsed * crystal.userData.floatSpeed +
                crystal.userData.floatOffset,
            ) * 0.5;
          crystal.position.y = crystal.userData.originalY + floatY;

          if (reflection) {
            reflection.rotation.x = -crystal.rotation.x;
            reflection.rotation.y = crystal.rotation.y;
            reflection.rotation.z = -crystal.rotation.z;
            reflection.position.y = -4 - crystal.position.y;
          }
        } else if (crystal.geometry.type === "TorusGeometry") {
          crystal.rotation.z += crystal.userData.rotationSpeed;
        }
      });

      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(elapsed + i) * 0.01;
        if (positions[i + 1] > 30) positions[i + 1] = 0;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsed * 0.02;

      const targetX = mouseX * 0.00005;
      const targetY = mouseY * 0.00005;
      camera.position.x += (targetX * 10 - camera.position.x) * 0.02;
      camera.position.y += (8 + targetY * 5 - camera.position.y) * 0.02;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    init();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    setTimeout(() => {
      isLoaded = true;
    }, 100);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (renderer) {
        renderer.dispose();
        canvasContainer?.removeChild(renderer.domElement);
      }
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-container">
  <div class="three-canvas" bind:this={canvasContainer}></div>

  <section class="hero" bind:this={heroSection} class:loaded={isLoaded}>
    <div class="hero-content" style="transform: translateY({scrollY * 0.3}px)">
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        <div class="logo-glow"></div>
      </div>

      <h1 class="title">
        <span class="title-line">Cambridge</span>
        <span class="title-line">Game Jam</span>
        <span class="title-year">2024</span>
      </h1>

      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-text">{theme}</span>
      </div>

      <div class="event-info">
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span class="info-text">{duration}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">🎮</span>
          <span class="info-text">{submissions} Submissions</span>
        </div>
      </div>

      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
        <span>Scroll to Explore</span>
      </div>
    </div>
  </section>

  <section class="games-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-accent">Featured</span> Games
      </h2>
      <div class="title-underline"></div>
    </div>

    <div class="games-grid">
      {#each games as game, i}
        <a
          href={game.link}
          target="_blank"
          rel="noopener noreferrer"
          class="game-card"
          class:active={activeCard === i}
          bind:this={gameCards[i]}
          onmouseenter={() => (activeCard = i)}
          onmouseleave={() => (activeCard = -1)}
          style="animation-delay: {i * 0.1}s"
        >
          <div class="card-inner">
            <div class="card-front">
              <div class="card-image-container">
                <img src={game.src} alt={game.alt} class="card-image" />
                <div class="card-overlay"></div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{game.title}</h3>
                <div class="card-prize">
                  <span class="prize-icon">🏆</span>
                  <span>{game.prize}</span>
                </div>
              </div>
            </div>
            <div class="card-reflection">
              <img src={game.src} alt="" class="reflection-image" />
            </div>
          </div>
          <div class="card-glow"></div>
        </a>
      {/each}
    </div>

    <a
      href="https://itch.io/jam/camgamejam2024"
      target="_blank"
      rel="noopener noreferrer"
      class="view-all-btn"
    >
      <span>View All Submissions</span>
      <span class="btn-arrow">→</span>
    </a>
  </section>

  <section class="about-section">
    <div class="about-content">
      <div class="about-text">
        <h2>Lorem Ipsum Dolor Sit</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident.
        </p>
      </div>
      <div class="about-stats">
        <div class="stat-item">
          <span class="stat-number">48</span>
          <span class="stat-label">Lorem Hours</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{submissions}</span>
          <span class="stat-label">Ipsum Games</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">100+</span>
          <span class="stat-label">Dolor Makers</span>
        </div>
      </div>
    </div>
  </section>

  <a href="/archive" class="back-button">
    <span class="back-arrow">←</span>
    <span>Back to Archive</span>
  </a>
</div>

<style>
  :global(body) {
    overflow-x: hidden;
  }

  .page-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%);
    color: white;
    font-family: "Rajdhani", sans-serif;
    position: relative;
  }

  .three-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
  }

  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    opacity: 0;
    transition: opacity 1s ease;
  }

  .hero.loaded {
    opacity: 1;
  }

  .hero-content {
    text-align: center;
    padding: 2rem;
  }

  .logo-container {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
    animation: floatLogo 4s ease-in-out infinite;
  }

  @keyframes floatLogo {
    0%,
    100% {
      transform: translateY(0) rotate(-2deg);
    }
    50% {
      transform: translateY(-20px) rotate(2deg);
    }
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 30px rgba(255, 51, 102, 0.5));
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(
      circle,
      rgba(255, 51, 102, 0.4) 0%,
      transparent 70%
    );
    animation: pulseGlow 2s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.5;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.3);
      opacity: 1;
    }
  }

  .title {
    font-family: "Orbitron", sans-serif;
    font-size: 1rem;
    line-height: 1.1;
    margin-bottom: 2rem;
    text-shadow: 0 0 40px rgba(51, 153, 255, 0.8);
  }

  .title-line {
    display: block;
    font-size: clamp(2rem, 8vw, 4rem);
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, #a8d8ff 50%, #fff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s ease-in-out infinite;
  }

  .title-year {
    display: block;
    font-size: clamp(3rem, 15vw, 8rem);
    font-weight: 900;
    background: linear-gradient(
      135deg,
      #ff3366 0%,
      #ff9933 25%,
      #33ff99 50%,
      #3399ff 75%,
      #ff33ff 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbowShift 5s linear infinite;
    background-size: 200% auto;
  }

  @keyframes shimmer {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.3);
    }
  }

  @keyframes rainbowShift {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  .theme-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 3rem;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    backdrop-filter: blur(10px);
    margin-bottom: 2rem;
    animation: breathe 4s ease-in-out infinite;
  }

  @keyframes breathe {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 30px rgba(255, 51, 102, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 50px rgba(255, 51, 102, 0.6);
    }
  }

  .theme-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: rgba(255, 255, 255, 0.6);
  }

  .theme-text {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: 700;
    background: linear-gradient(90deg, #ff3366, #33ff99, #3399ff, #ff3366);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 300% auto;
    animation: gradientFlow 4s linear infinite;
  }

  @keyframes gradientFlow {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 300% center;
    }
  }

  .event-info {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 3rem;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: slideUp 0.8s ease backwards;
  }

  .info-item:nth-child(1) {
    animation-delay: 0.5s;
  }
  .info-item:nth-child(2) {
    animation-delay: 0.7s;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .info-icon {
    font-size: 1.5rem;
  }

  .info-text {
    font-size: 1.1rem;
    font-weight: 500;
  }

  .scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.5);
    animation: bounce 2s ease-in-out infinite;
  }

  .scroll-arrow {
    width: 30px;
    height: 30px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(15px);
    }
  }

  .games-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(10, 10, 26, 0.95) 10%,
      rgba(10, 10, 26, 0.98) 100%
    );
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-title {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .title-accent {
    background: linear-gradient(90deg, #ff3366, #ff9933);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .title-underline {
    width: 150px;
    height: 4px;
    margin: 0 auto;
    background: linear-gradient(90deg, #ff3366, #3399ff);
    border-radius: 2px;
    animation: expandLine 1s ease forwards;
  }

  @keyframes expandLine {
    from {
      width: 0;
    }
    to {
      width: 150px;
    }
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto 3rem;
  }

  .game-card {
    position: relative;
    perspective: 1000px;
    animation: fadeInCard 0.8s ease backwards;
  }

  @keyframes fadeInCard {
    from {
      opacity: 0;
      transform: translateY(50px) rotateX(10deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }

  .card-inner {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition:
      transform 0.5s ease,
      box-shadow 0.5s ease;
  }

  .game-card:hover .card-inner {
    transform: translateY(-10px) scale(1.02);
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(255, 51, 102, 0.2);
  }

  .card-front {
    position: relative;
  }

  .card-image-container {
    position: relative;
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .game-card:hover .card-image {
    transform: scale(1.1);
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(10, 10, 26, 0.8) 100%
    );
    pointer-events: none;
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-title {
    font-family: "Orbitron", sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #fff, #a8d8ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .card-prize {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .prize-icon {
    font-size: 1.2rem;
    animation: wiggle 1s ease-in-out infinite;
  }

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(-5deg);
    }
    50% {
      transform: rotate(5deg);
    }
  }

  .card-reflection {
    position: absolute;
    bottom: -100%;
    left: 0;
    right: 0;
    height: 100%;
    transform: scaleY(-1);
    opacity: 0.15;
    mask-image: linear-gradient(to bottom, transparent 50%, black 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 50%, black 100%);
    pointer-events: none;
  }

  .reflection-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    filter: blur(2px);
  }

  .card-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #ff3366, #3399ff, #33ff99, #ff3366);
    background-size: 400% 400%;
    border-radius: 22px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: glowRotate 3s linear infinite;
  }

  .game-card:hover .card-glow {
    opacity: 1;
  }

  @keyframes glowRotate {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .view-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #ff3366, #ff6633);
    border: none;
    border-radius: 50px;
    color: white;
    font-family: "Orbitron", sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    box-shadow: 0 10px 40px rgba(255, 51, 102, 0.4);
  }

  .view-all-btn:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 20px 60px rgba(255, 51, 102, 0.6);
  }

  .btn-arrow {
    transition: transform 0.3s ease;
  }

  .view-all-btn:hover .btn-arrow {
    transform: translateX(10px);
  }

  .about-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 26, 0.98) 0%,
      rgba(26, 10, 42, 0.98) 100%
    );
  }

  .about-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  @media (max-width: 768px) {
    .about-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  .about-text h2 {
    font-family: "Orbitron", sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    margin-bottom: 1.5rem;
    background: linear-gradient(90deg, #33ff99, #3399ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .about-text p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1rem;
  }

  .about-stats {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    min-width: 140px;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .stat-item:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .stat-number {
    font-family: "Orbitron", sans-serif;
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #ff3366, #ff9933);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .back-button {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    color: white;
    text-decoration: none;
    font-weight: 500;
    z-index: 100;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-5px);
  }

  .back-arrow {
    transition: transform 0.3s ease;
  }

  .back-button:hover .back-arrow {
    transform: translateX(-5px);
  }
</style>
