<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

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
  ];

  let canvasContainer = $state(null);
  let currentSlide = $state(0);

  function nextSlide() {
    currentSlide = (currentSlide + 1) % images.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + images.length) % images.length;
  }

  onMount(() => {
    if (!canvasContainer) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const mirrorMaterial = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      specular: 0xffffff,
      shininess: 100,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    });

    const darkMaterial = new THREE.MeshPhongMaterial({
      color: 0x2244aa,
      specular: 0x6688ff,
      shininess: 80,
      flatShading: true,
      transparent: true,
      opacity: 0.7,
    });

    const accentMaterial = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      specular: 0xffffff,
      shininess: 120,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
    });

    const mirrorGroup = new THREE.Group();

    const mainMirror = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      mirrorMaterial
    );
    mainMirror.position.set(0, 0, 0);
    mirrorGroup.add(mainMirror);

    const reflectedMirror = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      darkMaterial
    );
    reflectedMirror.position.set(0, -3.5, 0);
    reflectedMirror.scale.y = -1;
    mirrorGroup.add(reflectedMirror);

    for (let i = 0; i < 8; i++) {
      const size = Math.random() * 0.4 + 0.2;
      const fragment = new THREE.Mesh(
        new THREE.OctahedronGeometry(size, 0),
        i % 2 === 0 ? accentMaterial : mirrorMaterial
      );
      const angle = (i / 8) * Math.PI * 2;
      const radius = 2.5 + Math.random();
      fragment.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * 0.5 + Math.random() - 0.5,
        Math.sin(angle) * radius * 0.3
      );
      fragment.userData = {
        rotationSpeed: Math.random() * 0.02 + 0.005,
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
      };
      mirrorGroup.add(fragment);
    }

    for (let i = 0; i < 6; i++) {
      const size = Math.random() * 0.3 + 0.1;
      const shard = new THREE.Mesh(
        new THREE.TetrahedronGeometry(size, 0),
        darkMaterial
      );
      const angle = (i / 6) * Math.PI * 2 + 0.3;
      const radius = 3.5 + Math.random() * 0.5;
      shard.position.set(
        Math.cos(angle) * radius,
        -3 + Math.sin(angle) * 0.3,
        Math.sin(angle) * radius * 0.2
      );
      shard.userData = {
        rotationSpeed: Math.random() * 0.015 + 0.003,
        floatSpeed: Math.random() * 0.3 + 0.3,
        floatOffset: Math.random() * Math.PI * 2,
      };
      mirrorGroup.add(shard);
    }

    const planeGeometry = new THREE.PlaneGeometry(20, 0.02);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.3,
    });
    const mirrorPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    mirrorPlane.position.y = -1.75;
    mirrorPlane.rotation.x = -Math.PI / 2;
    mirrorGroup.add(mirrorPlane);

    scene.add(mirrorGroup);

    const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    fillLight.position.set(-5, -3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x88ccff, 0.8);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      mainMirror.rotation.y += 0.003;
      mainMirror.rotation.x = Math.sin(time * 0.5) * 0.1;
      reflectedMirror.rotation.y = mainMirror.rotation.y;
      reflectedMirror.rotation.x = -mainMirror.rotation.x;

      mirrorGroup.children.forEach((child, index) => {
        if (index > 1 && child.userData.rotationSpeed) {
          child.rotation.x += child.userData.rotationSpeed;
          child.rotation.y += child.userData.rotationSpeed * 0.7;
          child.position.y +=
            Math.sin(time * child.userData.floatSpeed + child.userData.floatOffset) *
            0.002;
        }
      });

      mirrorGroup.rotation.y += (mouseX * 0.3 - mirrorGroup.rotation.y) * 0.05;
      mirrorGroup.rotation.x += (mouseY * 0.2 - mirrorGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (canvasContainer && renderer.domElement) {
        canvasContainer.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<div class="page-2024">
  <div class="canvas-bg" bind:this={canvasContainer}></div>

  <section class="hero">
    <div class="hero-content">
      <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
      <h1 class="title">{title}</h1>
      <p class="date">{duration}</p>
      <div class="theme-badge">
        <span class="theme-label">Theme</span>
        <span class="theme-text">{theme}</span>
      </div>
      <p class="submissions">{submissions} Submissions</p>
    </div>
    <div class="scroll-indicator">
      <span>Scroll to explore</span>
      <div class="arrow"></div>
    </div>
  </section>

  <section class="about">
    <div class="about-content">
      <h2>About the Jam</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
  </section>

  <section class="featured">
    <h2>Featured Games</h2>
    <div class="carousel">
      <button class="nav-btn prev" onclick={prevSlide}>&#9664;</button>
      <div class="carousel-track">
        {#each images as game, index}
          <a
            href={game.link}
            class="game-card"
            class:active={index === currentSlide}
            style="transform: translateX({(index - currentSlide) * 100}%)"
          >
            <div class="card-image">
              <img src={game.src} alt={game.alt} />
            </div>
            <div class="card-info">
              <h3>{game.title}</h3>
              <p class="prize">{game.prize}</p>
            </div>
          </a>
        {/each}
      </div>
      <button class="nav-btn next" onclick={nextSlide}>&#9654;</button>
      <div class="carousel-dots">
        {#each images as _, index}
          <button
            class="dot"
            class:active={index === currentSlide}
            onclick={() => (currentSlide = index)}
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    </div>
  </section>

  <section class="gallery">
    <h2>All Submissions</h2>
    <div class="gallery-grid">
      {#each images as game}
        <a href={game.link} class="gallery-item">
          <img src={game.src} alt={game.alt} />
          <div class="gallery-overlay">
            <span>{game.title}</span>
          </div>
        </a>
      {/each}
      <a href="https://itch.io/jam/camgamejam2024" class="gallery-item view-all">
        <img src="/2024/all-submissions.png" alt="All Submissions" />
        <div class="gallery-overlay">
          <span>View All {submissions} Games</span>
        </div>
      </a>
    </div>
  </section>

  <section class="photos">
    <h2>Memories</h2>
    <div class="photo-container">
      <img src="/2024/group-photo.jpg" alt="Cambridge Game Jam 2024 attendees" class="group-photo" />
    </div>
    <p class="photo-caption">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  </section>

  <div class="back-link">
    <a href="/archive">← Back to Archive</a>
  </div>
</div>

<style>
  .page-2024 {
    --primary: #4488ff;
    --primary-dark: #2244aa;
    --primary-light: #88ccff;
    --bg-dark: #0a0a12;
    --bg-section: #0d0d1a;
    --text: #e8e8f0;
    --text-muted: #8888aa;
    font-family: "Lexend", system-ui, sans-serif;
    background: var(--bg-dark);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .canvas-bg {
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
    text-align: center;
    padding: 2rem;
    z-index: 1;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .logo {
    width: 180px;
    height: 180px;
    object-fit: contain;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 20px rgba(68, 136, 255, 0.5));
  }

  .title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px rgba(68, 136, 255, 0.3);
  }

  .date {
    font-size: 1.5rem;
    color: var(--text-muted);
    margin: 0;
  }

  .theme-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(68, 136, 255, 0.1);
    border: 1px solid rgba(68, 136, 255, 0.3);
    border-radius: 12px;
    margin: 1rem 0;
  }

  .theme-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--text-muted);
  }

  .theme-text {
    font-size: 2rem;
    font-weight: 600;
    color: var(--primary-light);
  }

  .submissions {
    font-size: 1.25rem;
    color: var(--primary);
    margin: 0;
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    animation: bounce 2s infinite;
  }

  .arrow {
    width: 20px;
    height: 20px;
    border-right: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
    transform: rotate(45deg);
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

  .about,
  .featured,
  .gallery,
  .photos {
    position: relative;
    z-index: 1;
    padding: 4rem 2rem;
    background: var(--bg-section);
  }

  .about {
    background: linear-gradient(180deg, transparent 0%, var(--bg-section) 20%);
  }

  .about-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .about h2,
  .featured h2,
  .gallery h2,
  .photos h2 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--primary-light);
  }

  .about p {
    line-height: 1.8;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
  }

  .carousel {
    position: relative;
    max-width: 700px;
    margin: 0 auto;
    overflow: hidden;
  }

  .carousel-track {
    position: relative;
    height: 450px;
  }

  .game-card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(20, 20, 40, 0.8);
    border: 1px solid rgba(68, 136, 255, 0.2);
    border-radius: 16px;
    overflow: hidden;
    transition:
      transform 0.5s ease,
      opacity 0.5s ease;
    opacity: 0;
    pointer-events: none;
    text-decoration: none;
    color: inherit;
  }

  .game-card.active {
    opacity: 1;
    pointer-events: auto;
  }

  .card-image {
    flex: 1;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .game-card:hover .card-image img {
    transform: scale(1.05);
  }

  .card-info {
    padding: 1.5rem;
    background: rgba(10, 10, 20, 0.9);
  }

  .card-info h3 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
    color: var(--text);
  }

  .prize {
    font-size: 1rem;
    color: var(--primary);
    margin: 0;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border: none;
    background: rgba(68, 136, 255, 0.2);
    color: var(--primary-light);
    font-size: 1.25rem;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    transition: background 0.3s ease;
  }

  .nav-btn:hover {
    background: rgba(68, 136, 255, 0.4);
  }

  .nav-btn.prev {
    left: -60px;
  }

  .nav-btn.next {
    right: -60px;
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: rgba(68, 136, 255, 0.3);
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .dot.active {
    background: var(--primary);
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .gallery-item {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .gallery-item:hover img {
    transform: scale(1.1);
  }

  .gallery-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 50%, rgba(10, 10, 20, 0.9));
    display: flex;
    align-items: flex-end;
    padding: 1rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .gallery-item:hover .gallery-overlay {
    opacity: 1;
  }

  .gallery-overlay span {
    color: var(--text);
    font-weight: 500;
  }

  .view-all .gallery-overlay {
    background: rgba(68, 136, 255, 0.3);
    align-items: center;
    justify-content: center;
    opacity: 1;
  }

  .view-all .gallery-overlay span {
    font-size: 1.25rem;
    text-align: center;
  }

  .photo-container {
    max-width: 1000px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(68, 136, 255, 0.2);
  }

  .group-photo {
    width: 100%;
    height: auto;
    display: block;
  }

  .photo-caption {
    text-align: center;
    color: var(--text-muted);
    margin-top: 1rem;
  }

  .back-link {
    position: relative;
    z-index: 1;
    padding: 3rem 2rem;
    text-align: center;
    background: var(--bg-section);
  }

  .back-link a {
    color: var(--primary);
    text-decoration: none;
    font-size: 1.125rem;
    padding: 0.75rem 1.5rem;
    border: 1px solid var(--primary);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .back-link a:hover {
    background: var(--primary);
    color: var(--bg-dark);
  }

  @media (max-width: 768px) {
    .title {
      font-size: 2rem;
    }

    .logo {
      width: 140px;
      height: 140px;
    }

    .theme-text {
      font-size: 1.5rem;
    }

    .nav-btn {
      width: 40px;
      height: 40px;
    }

    .nav-btn.prev {
      left: 10px;
    }

    .nav-btn.next {
      right: 10px;
    }

    .carousel-track {
      height: 400px;
    }
  }
</style>
