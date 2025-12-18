<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let container;
  let scene, camera, renderer;
  let particles, caveWalls, stalactites, stalagmites;
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let targetScrollY = 0;
  let animationFrame;

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
  let projectImagesLoaded = $state(false);

  onMount(() => {
    if (!container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a0f05, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6b35, 2, 80);
    pointLight1.position.set(-6, 3, 6);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 2048;
    pointLight1.shadow.mapSize.height = 2048;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4a90e2, 1.5, 80);
    pointLight2.position.set(6, -3, 6);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    const spotLight = new THREE.SpotLight(0xffaa44, 3, 100, Math.PI / 6, 0.5);
    spotLight.position.set(0, 8, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const caveGroup = new THREE.Group();
    scene.add(caveGroup);

    const wallGeometry = new THREE.CylinderGeometry(8, 8, 30, 32, 1, true);
    const wallMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 10,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });

    const noise = (x, y, z) => {
      return (
        Math.sin(x * 0.5) * Math.cos(y * 0.7) * Math.sin(z * 0.3) +
        Math.cos(x * 0.3) * Math.sin(y * 0.5) * Math.cos(z * 0.7)
      );
    };

    const wallPositions = wallGeometry.attributes.position.array;
    for (let i = 0; i < wallPositions.length; i += 3) {
      const x = wallPositions[i];
      const y = wallPositions[i + 1];
      const z = wallPositions[i + 2];
      const n = noise(x * 0.1, y * 0.1, z * 0.1);
      const scale = 1 + n * 0.3;
      wallPositions[i] *= scale;
      wallPositions[i + 1] *= scale;
      wallPositions[i + 2] *= scale;
    }
    wallGeometry.attributes.position.needsUpdate = true;
    wallGeometry.computeVertexNormals();

    caveWalls = new THREE.Mesh(wallGeometry, wallMaterial);
    caveWalls.rotation.x = Math.PI / 2;
    caveWalls.receiveShadow = true;
    caveGroup.add(caveWalls);

    const floorGeometry = new THREE.CylinderGeometry(8.5, 8.5, 0.5, 32);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x0f0f0f,
      shininess: 5,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -15;
    floor.receiveShadow = true;
    caveGroup.add(floor);

    const ceilingGeometry = new THREE.CylinderGeometry(8.5, 8.5, 0.5, 32);
    const ceilingMaterial = new THREE.MeshPhongMaterial({
      color: 0x0f0f0f,
      shininess: 5,
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 15;
    ceiling.receiveShadow = true;
    caveGroup.add(ceiling);

    stalactites = new THREE.Group();
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const radius = 6 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 1 + Math.random() * 2;
      const width = 0.3 + Math.random() * 0.4;

      const geometry = new THREE.ConeGeometry(width, height, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x2a2a2a,
        shininess: 20,
      });
      const stalactite = new THREE.Mesh(geometry, material);
      stalactite.position.set(x, 13, z);
      stalactite.rotation.x = Math.PI;
      stalactite.castShadow = true;
      stalactites.add(stalactite);
    }
    caveGroup.add(stalactites);

    stalagmites = new THREE.Group();
    for (let i = 0; i < 25; i++) {
      const angle = (Math.PI * 2 * i) / 25;
      const radius = 6 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 0.8 + Math.random() * 1.5;
      const width = 0.3 + Math.random() * 0.4;

      const geometry = new THREE.ConeGeometry(width, height, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x2a2a2a,
        shininess: 20,
      });
      const stalagmite = new THREE.Mesh(geometry, material);
      stalagmite.position.set(x, -13, z);
      stalagmite.castShadow = true;
      stalagmites.add(stalagmite);
    }
    caveGroup.add(stalagmites);

    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      const color = new THREE.Color();
      if (Math.random() > 0.5) {
        color.setHSL(0.05, 0.8, 0.5);
      } else {
        color.setHSL(0.6, 0.6, 0.4);
      }
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
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
          pos.y += sin(time * 0.5 + position.x * 0.1) * 2.0;
          pos.x += cos(time * 0.3 + position.z * 0.1) * 1.5;
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
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      scrollY += (targetScrollY - scrollY) * 0.05;

      if (particles) {
        particles.rotation.y += 0.0003;
        particles.material.uniforms.time.value = time;
        const particlePositions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particlePositions.length; i += 3) {
          particlePositions[i + 1] += Math.sin(time * 0.5 + particlePositions[i] * 0.1) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      if (caveWalls) {
        caveWalls.rotation.z += 0.0002;
        caveWalls.position.y = Math.sin(time * 0.2) * 0.3;
      }

      if (stalactites) {
        stalactites.children.forEach((stalactite, i) => {
          stalactite.rotation.z = Math.sin(time * 0.5 + i) * 0.1;
          stalactite.position.y = 13 + Math.sin(time * 0.3 + i * 0.5) * 0.2;
        });
      }

      if (stalagmites) {
        stalagmites.children.forEach((stalagmite, i) => {
          stalagmite.rotation.z = Math.sin(time * 0.4 + i) * 0.1;
          stalagmite.position.y = -13 + Math.sin(time * 0.25 + i * 0.5) * 0.15;
        });
      }

      const targetX = mouseX * 3;
      const targetY = -mouseY * 2;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.position.z = 8 + scrollY * 0.008;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      pointLight1.position.x = Math.sin(time * 0.6) * 6;
      pointLight1.position.y = Math.cos(time * 0.5) * 4;
      pointLight1.position.z = 6 + Math.sin(time * 0.4) * 2;
      pointLight1.intensity = 2 + Math.sin(time) * 0.5;

      pointLight2.position.x = Math.cos(time * 0.7) * 6;
      pointLight2.position.y = Math.sin(time * 0.6) * 4;
      pointLight2.position.z = 6 + Math.cos(time * 0.5) * 2;
      pointLight2.intensity = 1.5 + Math.cos(time * 1.2) * 0.4;

      spotLight.position.y = 8 + Math.sin(time * 0.3) * 1;
      spotLight.intensity = 3 + Math.sin(time * 0.8) * 1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    const autoRotateProjects = setInterval(() => {
      currentProjectIndex = (currentProjectIndex + 1) % images.length;
    }, 5000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearInterval(autoRotateProjects);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cave-splash">
  <div bind:this={container} class="three-container"></div>

  <div class="content-wrapper">
    <div class="hero-section">
      <div class="title-group">
        <h1 class="main-title">{title}</h1>
        <div class="title-underline"></div>
        <h2 class="subtitle">{duration}</h2>
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
      <div class="projects-grid">
        {#each images as { src, alt, link, title: projectTitle, prize }, index}
          <a
            href={link}
            class="project-card"
            style="animation-delay: {index * 0.1}s"
            onmouseenter={() => (currentProjectIndex = index)}
          >
            <div class="project-image-wrapper">
              <img src={src} alt={alt} class="project-image" />
              <div class="project-overlay"></div>
            </div>
            <div class="project-info">
              <h3 class="project-title">{projectTitle}</h3>
              {#if prize}
                <p class="project-prize">{prize}</p>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </div>

    <div class="lore-section">
      <div class="lore-content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
          non proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
      </div>
    </div>
  </div>

  <BackToMainButton />
</div>

<style>
  .cave-splash {
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
    background: #0a0a0a;
    color: #e0e0e0;
  }

  .three-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .content-wrapper {
    position: relative;
    z-index: 1;
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
  }

  .title-group {
    text-align: center;
    animation: fadeInUp 1.5s ease-out;
  }

  .main-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ff6b35 0%, #4a90e2 50%, #ff6b35 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
    text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
    letter-spacing: 0.05em;
  }

  .title-underline {
    width: 200px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #ff6b35, transparent);
    margin: 1rem auto;
    animation: expandLine 1s ease-out 0.5s both;
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
  }

  .subtitle {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #b0b0b0;
    margin-top: 1rem;
    font-weight: 300;
    letter-spacing: 0.1em;
  }

  .theme-badge {
    display: inline-block;
    margin-top: 2rem;
    padding: 1rem 2.5rem;
    background: rgba(255, 107, 53, 0.1);
    border: 2px solid rgba(255, 107, 53, 0.5);
    border-radius: 50px;
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: #ff6b35;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    animation: pulse 2s ease-in-out infinite;
    box-shadow: 0 0 30px rgba(255, 107, 53, 0.3);
  }

  .submissions-link {
    display: inline-block;
    margin-top: 2rem;
    padding: 0.8rem 2rem;
    color: #4a90e2;
    text-decoration: none;
    font-size: clamp(1rem, 2.5vw, 1.4rem);
    border: 2px solid rgba(74, 144, 226, 0.5);
    border-radius: 30px;
    transition: all 0.3s ease;
    background: rgba(74, 144, 226, 0.05);
  }

  .submissions-link:hover {
    background: rgba(74, 144, 226, 0.2);
    border-color: #4a90e2;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(74, 144, 226, 0.4);
  }

  .projects-section {
    padding: 6rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    text-align: center;
    margin-bottom: 4rem;
    background: linear-gradient(135deg, #ff6b35, #4a90e2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2.5rem;
    padding: 2rem 0;
  }

  .project-card {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(20, 20, 20, 0.8);
    border: 2px solid rgba(255, 107, 53, 0.2);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideInUp 0.8s ease-out both;
    text-decoration: none;
    color: inherit;
    backdrop-filter: blur(10px);
  }

  .project-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(255, 107, 53, 0.8);
    box-shadow: 0 20px 60px rgba(255, 107, 53, 0.4);
  }

  .project-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 75%;
    overflow: hidden;
    background: #1a1a1a;
  }

  .project-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .project-card:hover .project-image {
    transform: scale(1.1);
  }

  .project-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.7) 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .project-card:hover .project-overlay {
    opacity: 1;
  }

  .project-info {
    padding: 1.5rem;
    position: relative;
    z-index: 2;
  }

  .project-title {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #e0e0e0;
  }

  .project-prize {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    color: #ff6b35;
    font-weight: 500;
    margin: 0;
  }

  .lore-section {
    padding: 6rem 2rem;
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }

  .lore-content {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
    line-height: 1.8;
    color: #b0b0b0;
  }

  .lore-content p {
    margin-bottom: 2rem;
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

  @keyframes expandLine {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 200px;
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 30px rgba(255, 107, 53, 0.3);
    }
    50% {
      box-shadow: 0 0 50px rgba(255, 107, 53, 0.6);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .hero-section {
      padding: 1rem;
    }

    .projects-section {
      padding: 4rem 1rem;
    }
  }
</style>
