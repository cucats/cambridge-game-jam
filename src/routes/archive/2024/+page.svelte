<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

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

  let canvasContainer;
  let scrollY = 0;
  let mouseX = 0;
  let mouseY = 0;

  onMount(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    const crystals = [];
    const mirrors = [];
    const particles = [];

    const createCrystal = (x, y, z) => {
      const geometry = new THREE.ConeGeometry(2, 8, 4);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6),
        flatShading: true,
        transparent: true,
        opacity: 0.7,
        shininess: 100
      });
      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.set(x, y, z);
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.02 + 0.01
      };
      return crystal;
    };

    const createMirror = (x, y, z) => {
      const geometry = new THREE.PlaneGeometry(15, 15, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        shininess: 100,
        reflectivity: 0.9
      });
      const mirror = new THREE.Mesh(geometry, material);
      mirror.position.set(x, y, z);
      mirror.rotation.y = Math.random() * Math.PI;
      mirror.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        initialY: y
      };
      return mirror;
    };

    const createParticle = () => {
      const geometry = new THREE.TetrahedronGeometry(0.3, 0);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 1, 0.7),
        transparent: true,
        opacity: 0.6
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 100
      );
      particle.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        }
      };
      return particle;
    };

    for (let i = 0; i < 40; i++) {
      const crystal = createCrystal(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      crystals.push(crystal);
      scene.add(crystal);
    }

    for (let i = 0; i < 8; i++) {
      const mirror = createMirror(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60 - 20
      );
      mirrors.push(mirror);
      scene.add(mirror);
    }

    for (let i = 0; i < 100; i++) {
      const particle = createParticle();
      particles.push(particle);
      scene.add(particle);
    }

    const ambientLight = new THREE.AmbientLight(0x6688cc, 0.6);
    scene.add(ambientLight);

    const lights = [];
    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight(
        new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
        1,
        100
      );
      light.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        Math.random() * 50
      );
      light.userData = {
        angle: Math.random() * Math.PI * 2,
        radius: 30 + Math.random() * 20,
        speed: 0.001 + Math.random() * 0.002,
        height: light.position.y
      };
      lights.push(light);
      scene.add(light);
    }

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      crystals.forEach((crystal, i) => {
        crystal.rotation.x += crystal.userData.rotationSpeed.x;
        crystal.rotation.y += crystal.userData.rotationSpeed.y;
        crystal.rotation.z += crystal.userData.rotationSpeed.z;
        crystal.position.y += Math.sin(time + crystal.userData.floatOffset) * 0.05;
      });

      mirrors.forEach((mirror) => {
        mirror.rotation.y += mirror.userData.rotationSpeed;
        mirror.position.y = mirror.userData.initialY + Math.sin(time * 0.5) * 5;
      });

      particles.forEach((particle) => {
        particle.position.x += particle.userData.velocity.x;
        particle.position.y += particle.userData.velocity.y;
        particle.position.z += particle.userData.velocity.z;

        if (Math.abs(particle.position.x) > 100) particle.userData.velocity.x *= -1;
        if (Math.abs(particle.position.y) > 100) particle.userData.velocity.y *= -1;
        if (Math.abs(particle.position.z) > 50) particle.userData.velocity.z *= -1;

        particle.rotation.x += particle.userData.rotationSpeed.x;
        particle.rotation.y += particle.userData.rotationSpeed.y;
        particle.rotation.z += particle.userData.rotationSpeed.z;
      });

      lights.forEach((light) => {
        light.userData.angle += light.userData.speed;
        light.position.x = Math.cos(light.userData.angle) * light.userData.radius;
        light.position.z = Math.sin(light.userData.angle) * light.userData.radius;
        light.position.y = light.userData.height + Math.sin(time) * 10;
      });

      camera.position.x = mouseX * 0.05;
      camera.position.y = -scrollY * 0.02 + mouseY * 0.05;
      camera.lookAt(0, 0, 0);

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
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  });
</script>

<div class="container">
  <div class="canvas-container" bind:this={canvasContainer}></div>

  <div class="content">
    <section class="hero">
      <div class="hero-content">
        <div class="logo-container">
          <img src="/2024/logo.png" alt="Cambridge Game Jam 2024" class="logo" />
        </div>
        <h1 class="title">{title}</h1>
        <div class="theme-container">
          <div class="theme-label">THEME</div>
          <div class="theme">{theme}</div>
        </div>
        <div class="date">{duration}</div>
        <div class="submissions">{submissions} Submissions</div>
      </div>
    </section>

    <section class="games">
      <h2 class="section-title">Featured Games</h2>
      <div class="games-grid">
        {#each games as game, i}
          <a href={game.link} target="_blank" rel="noopener noreferrer" class="game-card" style="animation-delay: {i * 0.1}s">
            <div class="game-image-container">
              <img src={game.src} alt={game.alt} class="game-image" />
              <div class="game-overlay">
                <div class="game-title">{game.title}</div>
                {#if game.prize}
                  <div class="game-prize">{game.prize}</div>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="about">
      <div class="about-content">
        <h2 class="section-title">About the Jam</h2>
        <p class="about-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p class="about-text">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
          fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">Cambridge Game Jam 2024</div>
        <div class="footer-links">
          <a href="/" class="footer-link">Home</a>
          <a href="/archive" class="footer-link">Archive</a>
          <a href="/code-of-conduct" class="footer-link">Code of Conduct</a>
        </div>
        <div class="footer-copyright">Cambridge Game Jam 2024</div>
      </div>
    </footer>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .container {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0f0f2a 100%);
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

  .content {
    position: relative;
    z-index: 1;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }

  .hero-content {
    animation: fadeInUp 1s ease-out;
  }

  .logo-container {
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  .logo {
    max-width: 300px;
    height: auto;
    filter: drop-shadow(0 0 30px rgba(136, 204, 255, 0.5));
    animation: pulse 2s ease-in-out infinite;
  }

  .title {
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 2rem 0;
    background: linear-gradient(135deg, #88ccff, #ff88cc, #88ccff);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 3s ease infinite, textGlow 2s ease-in-out infinite;
    letter-spacing: -2px;
    text-transform: uppercase;
  }

  .theme-container {
    margin: 2rem 0;
    animation: scaleIn 1s ease-out 0.3s backwards;
  }

  .theme-label {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 3px;
    color: #88ccff;
    margin-bottom: 0.5rem;
  }

  .theme {
    font-size: 3rem;
    font-weight: 800;
    color: #fff;
    text-shadow: 0 0 20px rgba(136, 204, 255, 0.8), 0 0 40px rgba(136, 204, 255, 0.4);
    animation: flicker 4s ease-in-out infinite;
  }

  .date {
    font-size: 1.5rem;
    color: #aaccff;
    margin: 1.5rem 0;
    animation: fadeIn 1s ease-out 0.6s backwards;
  }

  .submissions {
    font-size: 1.25rem;
    color: #88ccff;
    font-weight: 600;
    animation: fadeIn 1s ease-out 0.9s backwards;
  }

  .games {
    padding: 6rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    font-size: 3rem;
    font-weight: 900;
    text-align: center;
    margin-bottom: 4rem;
    background: linear-gradient(135deg, #88ccff, #ff88cc);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: slideInFromLeft 1s ease-out;
    text-transform: uppercase;
    letter-spacing: -1px;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .game-card {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    background: rgba(26, 26, 58, 0.6);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(136, 204, 255, 0.2);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: fadeInUp 0.8s ease-out backwards;
    text-decoration: none;
    cursor: pointer;
  }

  .game-card:hover {
    transform: translateY(-10px) scale(1.03);
    border-color: rgba(136, 204, 255, 0.8);
    box-shadow: 0 20px 60px rgba(136, 204, 255, 0.4);
  }

  .game-image-container {
    position: relative;
    overflow: hidden;
  }

  .game-image {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .game-card:hover .game-image {
    transform: scale(1.1);
  }

  .game-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(to top, rgba(10, 10, 26, 0.95) 0%, rgba(10, 10, 26, 0) 100%);
    transform: translateY(100%);
    transition: transform 0.4s ease;
  }

  .game-card:hover .game-overlay {
    transform: translateY(0);
  }

  .game-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .game-prize {
    font-size: 1rem;
    color: #88ccff;
    font-weight: 500;
  }

  .about {
    padding: 6rem 2rem;
    background: rgba(15, 15, 42, 0.6);
    backdrop-filter: blur(20px);
  }

  .about-content {
    max-width: 900px;
    margin: 0 auto;
    animation: fadeInUp 1s ease-out;
  }

  .about-text {
    font-size: 1.25rem;
    line-height: 1.8;
    color: #aaccff;
    margin-bottom: 1.5rem;
  }

  .footer {
    padding: 4rem 2rem;
    background: rgba(10, 10, 26, 0.9);
    backdrop-filter: blur(20px);
    border-top: 2px solid rgba(136, 204, 255, 0.2);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .footer-logo {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #88ccff, #ff88cc);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 2rem;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .footer-link {
    color: #88ccff;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.125rem;
    transition: all 0.3s ease;
    position: relative;
  }

  .footer-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: #88ccff;
    transition: width 0.3s ease;
  }

  .footer-link:hover {
    color: #fff;
    text-shadow: 0 0 10px rgba(136, 204, 255, 0.8);
  }

  .footer-link:hover::after {
    width: 100%;
  }

  .footer-copyright {
    color: #6688aa;
    font-size: 0.875rem;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
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

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      filter: drop-shadow(0 0 30px rgba(136, 204, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 50px rgba(136, 204, 255, 0.8));
    }
  }

  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes textGlow {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(136, 204, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(255, 136, 204, 0.8));
    }
  }

  @keyframes flicker {
    0%, 100% {
      opacity: 1;
      text-shadow: 0 0 20px rgba(136, 204, 255, 0.8), 0 0 40px rgba(136, 204, 255, 0.4);
    }
    50% {
      opacity: 0.95;
      text-shadow: 0 0 30px rgba(136, 204, 255, 1), 0 0 60px rgba(136, 204, 255, 0.6);
    }
  }

  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 768px) {
    .title {
      font-size: 2.5rem;
    }

    .theme {
      font-size: 2rem;
    }

    .section-title {
      font-size: 2rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }

    .logo {
      max-width: 200px;
    }
  }
</style>
