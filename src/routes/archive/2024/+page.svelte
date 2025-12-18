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

  let canvasContainer = $state(null);
  let scrollY = $state(0);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let activeGame = $state(0);
  let isLoaded = $state(false);

  onMount(() => {
    isLoaded = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 15;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight1.position.set(-10, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight2.position.set(10, 5, -5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 1.5, 40);
    pointLight3.position.set(0, -5, 10);
    scene.add(pointLight3);

    const mirrorGeometry = new THREE.PlaneGeometry(100, 100);
    const mirrorMaterial = new THREE.MeshPhongMaterial({
      color: 0x111122,
      shininess: 100,
      reflectivity: 1,
      side: THREE.DoubleSide,
    });
    const mirrorPlane = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane.rotation.x = -Math.PI / 2;
    mirrorPlane.position.y = -8;
    mirrorPlane.receiveShadow = true;
    scene.add(mirrorPlane);

    const crystals = [];
    const crystalGeometry = new THREE.OctahedronGeometry(1, 0);

    for (let i = 0; i < 30; i++) {
      const crystalMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        flatShading: true,
      });
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.x = (Math.random() - 0.5) * 40;
      crystal.position.y = (Math.random() - 0.5) * 20;
      crystal.position.z = (Math.random() - 0.5) * 40 - 10;
      crystal.scale.setScalar(Math.random() * 1.5 + 0.5);
      crystal.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: crystal.position.y,
      };
      crystal.castShadow = true;
      crystals.push(crystal);
      scene.add(crystal);

      const reflectedCrystal = crystal.clone();
      reflectedCrystal.position.y = -16 - crystal.position.y;
      reflectedCrystal.scale.y *= -1;
      reflectedCrystal.material = crystalMaterial.clone();
      reflectedCrystal.material.opacity = 0.3;
      reflectedCrystal.userData = { ...crystal.userData, isReflection: true };
      crystals.push(reflectedCrystal);
      scene.add(reflectedCrystal);
    }

    const shards = [];
    const shardGeometry = new THREE.TetrahedronGeometry(0.5, 0);

    for (let i = 0; i < 100; i++) {
      const shardMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.7, 0.6),
        flatShading: true,
        transparent: true,
        opacity: 0.6,
      });
      const shard = new THREE.Mesh(shardGeometry, shardMaterial);
      shard.position.x = (Math.random() - 0.5) * 60;
      shard.position.y = (Math.random() - 0.5) * 40;
      shard.position.z = (Math.random() - 0.5) * 60 - 20;
      shard.scale.setScalar(Math.random() * 0.8 + 0.2);
      shard.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05,
          z: (Math.random() - 0.5) * 0.05,
        },
        driftSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.005,
          z: (Math.random() - 0.5) * 0.01,
        },
      };
      shards.push(shard);
      scene.add(shard);
    }

    const centralGeometry = new THREE.IcosahedronGeometry(3, 1);
    const centralMaterial = new THREE.MeshPhongMaterial({
      color: 0x8844ff,
      flatShading: true,
      shininess: 150,
      transparent: true,
      opacity: 0.9,
    });
    const centralCrystal = new THREE.Mesh(centralGeometry, centralMaterial);
    centralCrystal.position.set(0, 0, -5);
    centralCrystal.castShadow = true;
    scene.add(centralCrystal);

    const reflectedCentral = centralCrystal.clone();
    reflectedCentral.position.y = -16;
    reflectedCentral.scale.y = -1;
    reflectedCentral.material = centralMaterial.clone();
    reflectedCentral.material.opacity = 0.4;
    scene.add(reflectedCentral);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;

      const color = new THREE.Color().setHSL(
        0.5 + Math.random() * 0.3,
        0.8,
        0.6,
      );
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const rings = [];
    for (let i = 0; i < 5; i++) {
      const ringGeometry = new THREE.TorusGeometry(5 + i * 2, 0.1, 8, 32);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.7 + i * 0.05, 0.8, 0.5),
        flatShading: true,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.z = -5;
      ring.userData = {
        rotationSpeed: 0.002 * (i % 2 === 0 ? 1 : -1),
        wobbleSpeed: 0.5 + i * 0.1,
        wobbleAmount: 0.1 + i * 0.02,
      };
      rings.push(ring);
      scene.add(ring);
    }

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      crystals.forEach((crystal) => {
        if (!crystal.userData.isReflection) {
          crystal.rotation.x += crystal.userData.rotationSpeed.x;
          crystal.rotation.y += crystal.userData.rotationSpeed.y;
          crystal.rotation.z += crystal.userData.rotationSpeed.z;
          crystal.position.y =
            crystal.userData.originalY +
            Math.sin(
              time * crystal.userData.floatSpeed + crystal.userData.floatOffset,
            ) *
              0.5;
        }
      });

      shards.forEach((shard) => {
        shard.rotation.x += shard.userData.rotationSpeed.x;
        shard.rotation.y += shard.userData.rotationSpeed.y;
        shard.rotation.z += shard.userData.rotationSpeed.z;
        shard.position.x += shard.userData.driftSpeed.x;
        shard.position.y += shard.userData.driftSpeed.y;
        shard.position.z += shard.userData.driftSpeed.z;

        if (Math.abs(shard.position.x) > 30) shard.userData.driftSpeed.x *= -1;
        if (Math.abs(shard.position.y) > 20) shard.userData.driftSpeed.y *= -1;
        if (shard.position.z > 10 || shard.position.z < -40)
          shard.userData.driftSpeed.z *= -1;
      });

      centralCrystal.rotation.x += 0.005;
      centralCrystal.rotation.y += 0.007;
      centralCrystal.position.y = Math.sin(time * 0.5) * 0.5;

      reflectedCentral.rotation.x = centralCrystal.rotation.x;
      reflectedCentral.rotation.y = centralCrystal.rotation.y;
      reflectedCentral.position.y = -16 - centralCrystal.position.y;

      rings.forEach((ring, i) => {
        ring.rotation.x =
          Math.sin(time * ring.userData.wobbleSpeed) *
          ring.userData.wobbleAmount;
        ring.rotation.y += ring.userData.rotationSpeed;
        ring.rotation.z =
          Math.cos(time * ring.userData.wobbleSpeed * 0.7) *
          ring.userData.wobbleAmount;
      });

      particles.rotation.y += 0.0002;
      particles.rotation.x += 0.0001;

      pointLight1.position.x = Math.sin(time * 0.3) * 15;
      pointLight1.position.z = Math.cos(time * 0.3) * 15;
      pointLight2.position.x = Math.cos(time * 0.4) * 15;
      pointLight2.position.z = Math.sin(time * 0.4) * 15;
      pointLight3.position.x = Math.sin(time * 0.5 + 2) * 10;
      pointLight3.position.z = Math.cos(time * 0.5 + 2) * 10;

      const targetX = mouseX * 0.05;
      const targetY = mouseY * 0.03 + 2;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, -5);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (canvasContainer && renderer.domElement) {
        canvasContainer.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  });

  const nextGame = () => {
    activeGame = (activeGame + 1) % games.length;
  };

  const prevGame = () => {
    activeGame = (activeGame - 1 + games.length) % games.length;
  };
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<div class="splash-page">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <section class="hero" class:loaded={isLoaded}>
    <div class="hero-content">
      <div class="logo-wrapper">
        <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        <div class="logo-glow"></div>
      </div>
      <h1 class="title">{title}</h1>
      <p class="date">{duration}</p>
      <div class="theme-badge">
        <span class="theme-label">Theme:</span>
        <span class="theme-name">{theme}</span>
      </div>
      <a href="https://itch.io/jam/camgamejam2024" class="submissions-link">
        {submissions} Submissions
      </a>
    </div>
    <div class="scroll-indicator">
      <span>Scroll</span>
      <div class="scroll-arrow"></div>
    </div>
  </section>

  <section class="games-section">
    <div class="games-header">
      <h2>Featured Games</h2>
      <p class="section-desc">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </div>

    <div class="games-carousel">
      <button
        class="nav-btn prev"
        onclick={prevGame}
        aria-label="Previous game"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div class="games-track">
        {#each games as game, i}
          <a
            href={game.link}
            class="game-card"
            class:active={i === activeGame}
            class:prev={i === (activeGame - 1 + games.length) % games.length}
            class:next={i === (activeGame + 1) % games.length}
            style="--offset: {i - activeGame}"
          >
            <div class="game-image-wrapper">
              <img src={game.src} alt={game.alt} class="game-image" />
              <div class="game-reflection">
                <img src={game.src} alt="" class="reflection-img" />
              </div>
            </div>
            <div class="game-info">
              <h3>{game.title}</h3>
              {#if game.prize}
                <span class="prize">{game.prize}</span>
              {/if}
            </div>
          </a>
        {/each}
      </div>

      <button class="nav-btn next" onclick={nextGame} aria-label="Next game">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="carousel-dots">
      {#each games as _, i}
        <button
          class="dot"
          class:active={i === activeGame}
          onclick={() => (activeGame = i)}
          aria-label="Go to slide {i + 1}"
        ></button>
      {/each}
    </div>
  </section>

  <section class="gallery-section">
    <h2>All Submissions</h2>
    <div class="gallery-grid">
      {#each games as game, i}
        <a href={game.link} class="gallery-item" style="--delay: {i * 0.1}s">
          <img src={game.src} alt={game.alt} />
          <div class="gallery-overlay">
            <span>{game.title}</span>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <section class="group-photo-section">
    <div class="photo-wrapper">
      <img
        src="/2024/group-photo.jpg"
        alt="Participants at Cambridge Game Jam 2024"
        class="group-photo"
      />
      <div class="photo-reflection"></div>
    </div>
    <p class="photo-caption">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt.
    </p>
  </section>

  <section class="cta-section">
    <div class="cta-content">
      <h2>Lorem Ipsum Dolor</h2>
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium.
      </p>
      <a href="/archive" class="cta-button">Back to Archive</a>
    </div>
  </section>

  <footer class="page-footer">
    <div class="footer-content">
      <p>&copy; 2024 Cambridge Game Jam</p>
      <div class="footer-links">
        <a href="https://itch.io/jam/camgamejam2024">itch.io</a>
      </div>
    </div>
  </footer>
</div>

<style>
  .splash-page {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%);
    color: #fff;
    overflow-x: hidden;
  }

  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1;
    padding: 2rem;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s ease-out;
  }

  .hero.loaded {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-content {
    text-align: center;
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .logo-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
  }

  .logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    animation: pulse-glow 3s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(136, 68, 255, 0.5));
  }

  @keyframes pulse-glow {
    0%,
    100% {
      filter: drop-shadow(0 0 30px rgba(136, 68, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 60px rgba(136, 68, 255, 0.8));
    }
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(136, 68, 255, 0.3) 0%,
      transparent 70%
    );
    transform: translate(-50%, -50%);
    animation: glow-pulse 4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes glow-pulse {
    0%,
    100% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  .title {
    font-size: clamp(2rem, 8vw, 5rem);
    font-weight: 900;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #60a5fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    animation: title-shimmer 5s linear infinite;
    background-size: 200% 200%;
  }

  @keyframes title-shimmer {
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

  .date {
    font-size: 1.5rem;
    opacity: 0.9;
    margin-bottom: 2rem;
    animation: fade-in-up 1s ease-out 0.3s both;
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background: rgba(136, 68, 255, 0.2);
    border: 2px solid rgba(136, 68, 255, 0.5);
    border-radius: 100px;
    margin-bottom: 2rem;
    animation:
      fade-in-up 1s ease-out 0.5s both,
      border-glow 3s ease-in-out infinite;
  }

  @keyframes border-glow {
    0%,
    100% {
      border-color: rgba(136, 68, 255, 0.5);
      box-shadow: 0 0 20px rgba(136, 68, 255, 0.2);
    }
    50% {
      border-color: rgba(136, 68, 255, 0.8);
      box-shadow: 0 0 40px rgba(136, 68, 255, 0.4);
    }
  }

  .theme-label {
    opacity: 0.7;
    font-size: 1rem;
  }

  .theme-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #a78bfa;
  }

  .submissions-link {
    display: inline-block;
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: #fff;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    animation: fade-in-up 1s ease-out 0.7s both;
  }

  .submissions-link:hover {
    transform: scale(1.05) translateY(-3px);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.4);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    animation: bounce 2s ease-in-out infinite;
    opacity: 0.7;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(10px);
    }
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
    transform: rotate(45deg);
  }

  .games-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(10, 10, 26, 0.9) 20%
    );
  }

  .games-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .games-header h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-desc {
    opacity: 0.7;
    max-width: 600px;
    margin: 0 auto;
  }

  .games-carousel {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem 0;
  }

  .nav-btn {
    position: relative;
    z-index: 10;
    width: 50px;
    height: 50px;
    background: rgba(136, 68, 255, 0.3);
    border: 2px solid rgba(136, 68, 255, 0.5);
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btn:hover {
    background: rgba(136, 68, 255, 0.5);
    transform: scale(1.1);
  }

  .nav-btn svg {
    width: 24px;
    height: 24px;
  }

  .games-track {
    position: relative;
    width: 100%;
    max-width: 600px;
    height: 500px;
    perspective: 1000px;
  }

  .game-card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    max-width: 400px;
    transform: translate(-50%, -50%) scale(0.7)
      rotateY(calc(var(--offset) * 30deg))
      translateZ(calc(var(--offset) * -200px));
    opacity: 0.3;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    color: #fff;
    pointer-events: none;
  }

  .game-card.active {
    transform: translate(-50%, -50%) scale(1) rotateY(0deg) translateZ(0);
    opacity: 1;
    pointer-events: auto;
  }

  .game-card.prev {
    transform: translate(calc(-50% - 120%), -50%) scale(0.8) rotateY(15deg);
    opacity: 0.5;
  }

  .game-card.next {
    transform: translate(calc(-50% + 120%), -50%) scale(0.8) rotateY(-15deg);
    opacity: 0.5;
  }

  .game-image-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  }

  .game-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }

  .game-card:hover .game-image {
    transform: scale(1.05);
  }

  .game-reflection {
    position: absolute;
    bottom: -100%;
    left: 0;
    right: 0;
    height: 100%;
    overflow: hidden;
    opacity: 0.3;
    pointer-events: none;
  }

  .reflection-img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    transform: scaleY(-1);
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      transparent 50%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      transparent 50%
    );
  }

  .game-info {
    padding: 1.5rem;
    text-align: center;
  }

  .game-info h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .prize {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #000;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #a78bfa;
    transform: scale(1.3);
  }

  .dot:hover {
    background: rgba(255, 255, 255, 0.6);
  }

  .gallery-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    background: rgba(10, 10, 26, 0.95);
  }

  .gallery-section h2 {
    text-align: center;
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #fff 0%, #60a5fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .gallery-item {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 16/10;
    animation: gallery-fade-in 0.8s ease-out var(--delay) both;
  }

  @keyframes gallery-fade-in {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .gallery-item:hover img {
    transform: scale(1.1);
  }

  .gallery-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 50%,
      rgba(0, 0, 0, 0.8) 100%
    );
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .gallery-item:hover .gallery-overlay {
    opacity: 1;
  }

  .gallery-overlay span {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .group-photo-section {
    position: relative;
    z-index: 1;
    padding: 6rem 2rem;
    text-align: center;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 26, 0.95) 0%,
      rgba(26, 10, 46, 0.95) 100%
    );
  }

  .photo-wrapper {
    position: relative;
    max-width: 1000px;
    margin: 0 auto 2rem;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
  }

  .group-photo {
    width: 100%;
    display: block;
  }

  .photo-reflection {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30%;
    background: linear-gradient(to top, rgba(136, 68, 255, 0.2), transparent);
    pointer-events: none;
  }

  .photo-caption {
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.7;
    font-style: italic;
  }

  .cta-section {
    position: relative;
    z-index: 1;
    padding: 8rem 2rem;
    text-align: center;
    background: radial-gradient(
      ellipse at center,
      rgba(136, 68, 255, 0.2) 0%,
      transparent 70%
    );
  }

  .cta-content h2 {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 1rem;
  }

  .cta-content p {
    max-width: 600px;
    margin: 0 auto 2rem;
    opacity: 0.8;
  }

  .cta-button {
    display: inline-block;
    padding: 1rem 3rem;
    background: transparent;
    color: #fff;
    text-decoration: none;
    border: 2px solid #a78bfa;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
  }

  .cta-button:hover {
    background: #a78bfa;
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(167, 139, 250, 0.3);
  }

  .page-footer {
    position: relative;
    z-index: 1;
    padding: 3rem 2rem;
    background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer-content p {
    margin: 0;
    opacity: 0.7;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
  }

  .footer-links a {
    color: #a78bfa;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-links a:hover {
    color: #fff;
  }

  @media (max-width: 768px) {
    .logo {
      width: 150px;
      height: 150px;
    }

    .games-carousel {
      flex-direction: column;
      gap: 1rem;
    }

    .games-track {
      height: 400px;
    }

    .game-card {
      max-width: 300px;
    }

    .game-card.prev,
    .game-card.next {
      display: none;
    }

    .nav-btn {
      position: static;
    }

    .games-carousel {
      flex-direction: row;
    }

    .footer-content {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
