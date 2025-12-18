<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let container;
  let scene, camera, renderer;
  let mirrors = [];
  let lowPolyObjects = [];
  let particles = [];
  let animationFrame;
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;

  const games = [
    {
      title: "Blight",
      prize: "Most Popular and Best Gameplay",
      link: "https://hex-26.itch.io/blight",
    },
    {
      title: "Reflect Upon Your Actions",
      prize: "Most Popular and Most Original",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
    },
    {
      title: "Reflected",
      prize: "Theme Winner",
      link: "https://ekorrette.itch.io/reflected",
    },
    {
      title: "Asymmetry",
      prize: "Best Gameplay",
      link: "https://alex-davies.itch.io/asymmetry",
    },
    {
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
    },
  ];

  const createLowPolyGeometry = () => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const positions = geometry.attributes.position;
    const newPositions = [];

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const noise = (Math.random() - 0.5) * 0.3;
      newPositions.push(x + noise, y + noise, z + noise);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(newPositions, 3)
    );
    geometry.computeVertexNormals();
    return geometry;
  };

  const createMirror = (position, rotation) => {
    const mirrorGroup = new THREE.Group();

    const mirrorGeometry = new THREE.PlaneGeometry(3, 3, 2, 2);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 2.0,
    });
    const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror.position.set(0, 0, 0);
    mirrorGroup.add(mirror);

    const frameGeometry = new THREE.BoxGeometry(3.2, 3.2, 0.2);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 0, -0.1);
    mirrorGroup.add(frame);

    mirrorGroup.position.set(position.x, position.y, position.z);
    mirrorGroup.rotation.set(rotation.x, rotation.y, rotation.z);

    return { group: mirrorGroup, mirror: mirror };
  };

  const initThree = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.05);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 1.5, 20);
    pointLight1.position.set(-5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 1.5, 20);
    pointLight2.position.set(5, 3, -5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffd93d, 1.5, 20);
    pointLight3.position.set(0, -3, 0);
    scene.add(pointLight3);

    for (let i = 0; i < 25; i++) {
      const geometry = createLowPolyGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          (i * 0.08) % 1,
          0.7,
          0.5 + Math.random() * 0.3
        ),
        metalness: 0.6,
        roughness: 0.3,
        emissive: new THREE.Color().setHSL((i * 0.08) % 1, 0.7, 0.2),
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 25
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.scale.setScalar(0.4 + Math.random() * 1.8);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      lowPolyObjects.push({
        mesh: mesh,
        baseRotation: {
          x: Math.random() * Math.PI,
          y: Math.random() * Math.PI,
          z: Math.random() * Math.PI,
        },
        basePosition: mesh.position.clone(),
        speed: 0.5 + Math.random() * 1.5,
      });
    }

    const mirror1 = createMirror(
      { x: -4, y: 2, z: -3 },
      { x: 0, y: Math.PI / 4, z: 0 }
    );
    scene.add(mirror1.group);
    mirrors.push({ ...mirror1, baseRotation: { x: 0, y: Math.PI / 4, z: 0 } });

    const mirror2 = createMirror(
      { x: 4, y: -1, z: -2 },
      { x: 0, y: -Math.PI / 4, z: 0 }
    );
    scene.add(mirror2.group);
    mirrors.push({
      ...mirror2,
      baseRotation: { x: 0, y: -Math.PI / 4, z: 0 },
    });

    const mirror3 = createMirror(
      { x: 0, y: 0, z: -6 },
      { x: Math.PI / 6, y: 0, z: 0 }
    );
    scene.add(mirror3.group);
    mirrors.push({
      ...mirror3,
      baseRotation: { x: Math.PI / 6, y: 0, z: 0 },
    });

    const mirror4 = createMirror(
      { x: -6, y: -2, z: 2 },
      { x: 0, y: Math.PI / 2, z: Math.PI / 6 }
    );
    scene.add(mirror4.group);
    mirrors.push({
      ...mirror4,
      baseRotation: { x: 0, y: Math.PI / 2, z: Math.PI / 6 },
    });

    const mirror5 = createMirror(
      { x: 6, y: 1, z: 3 },
      { x: 0, y: -Math.PI / 2, z: -Math.PI / 6 }
    );
    scene.add(mirror5.group);
    mirrors.push({
      ...mirror5,
      baseRotation: { x: 0, y: -Math.PI / 2, z: -Math.PI / 6 },
    });

    const mirror6 = createMirror(
      { x: -3, y: -3, z: 4 },
      { x: -Math.PI / 4, y: Math.PI / 3, z: 0 }
    );
    scene.add(mirror6.group);
    mirrors.push({
      ...mirror6,
      baseRotation: { x: -Math.PI / 4, y: Math.PI / 3, z: 0 },
    });

    for (let i = 0; i < 300; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
        transparent: true,
        opacity: 0.6,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 35
      );
      scene.add(particle);
      particles.push({
        mesh: particle,
        basePosition: particle.position.clone(),
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      time += 0.016;

      const targetX = mouseX * 3;
      const targetY = mouseY * 2 + 2;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.position.z = 8 + Math.sin(time * 0.5) * 0.5;
      camera.lookAt(0, 0, 0);

      pointLight1.position.x = -5 + Math.sin(time) * 2;
      pointLight1.position.y = 3 + Math.cos(time * 0.7) * 1.5;
      pointLight1.intensity = 1.5 + Math.sin(time * 2) * 0.3;

      pointLight2.position.x = 5 + Math.cos(time * 0.8) * 2;
      pointLight2.position.y = 3 + Math.sin(time * 0.6) * 1.5;
      pointLight2.intensity = 1.5 + Math.cos(time * 2.2) * 0.3;

      pointLight3.position.x = Math.sin(time * 0.5) * 3;
      pointLight3.position.z = Math.cos(time * 0.5) * 3;
      pointLight3.intensity = 1.5 + Math.sin(time * 1.5) * 0.4;

      lowPolyObjects.forEach((obj, i) => {
        obj.mesh.rotation.x = obj.baseRotation.x + time * obj.speed * 0.5;
        obj.mesh.rotation.y = obj.baseRotation.y + time * obj.speed * 0.7;
        obj.mesh.rotation.z = obj.baseRotation.z + time * obj.speed * 0.3;
        obj.mesh.position.y =
          obj.basePosition.y + Math.sin(time * obj.speed + i) * 0.8;
        obj.mesh.position.x =
          obj.basePosition.x + Math.cos(time * obj.speed * 0.7 + i) * 0.6;
        obj.mesh.position.z =
          obj.basePosition.z + Math.sin(time * obj.speed * 0.5 + i) * 0.4;
        const scale = 1 + Math.sin(time * obj.speed + i) * 0.1;
        obj.mesh.scale.setScalar(
          (0.4 + Math.random() * 1.8) * scale * (0.9 + Math.random() * 0.2)
        );
      });

      mirrors.forEach((mirror, i) => {
        mirror.group.rotation.y =
          mirror.baseRotation.y + time * (0.1 + i * 0.05);
        mirror.group.rotation.x =
          mirror.baseRotation.x + Math.sin(time + i) * 0.15;
        mirror.group.rotation.z =
          mirror.baseRotation.z + Math.cos(time * 0.7 + i) * 0.1;
        const pulse = 1 + Math.sin(time * 2 + i) * 0.05;
        mirror.group.scale.set(pulse, pulse, pulse);
      });

      particles.forEach((particle, i) => {
        particle.mesh.position.x =
          particle.basePosition.x +
          Math.sin(time * particle.speed + particle.phase) * 1.5;
        particle.mesh.position.y =
          particle.basePosition.y +
          Math.cos(time * particle.speed * 0.7 + particle.phase) * 1.2;
        particle.mesh.position.z =
          particle.basePosition.z +
          Math.sin(time * particle.speed * 0.5 + particle.phase) * 1.0;
        particle.mesh.rotation.x += 0.02;
        particle.mesh.rotation.y += 0.015;
        const opacity = 0.4 + Math.sin(time * particle.speed + particle.phase) * 0.3;
        particle.mesh.material.opacity = Math.max(0.1, opacity);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  };

  onMount(() => {
    if (container) {
      const cleanup = initThree();
      return cleanup;
    }
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2024 - Reflection</title>
</svelte:head>

<div class="splash-container">
  <div bind:this={container} class="three-container"></div>

  <div class="content-overlay">
    <div class="hero-section">
      <h1 class="main-title" data-text="Cambridge Game Jam 2024">Cambridge Game Jam 2024</h1>
      <h2 class="subtitle">Reflection</h2>
      <p class="date">9th - 11th February</p>
      <p class="submissions">23 Submissions</p>
    </div>

    <div class="games-section">
      <h3 class="section-title">Featured Projects</h3>
      <div class="games-grid">
        {#each games as game}
          <a href={game.link} target="_blank" class="game-card">
            <div class="game-title">{game.title}</div>
            <div class="game-prize">{game.prize}</div>
          </a>
        {/each}
      </div>
      <a
        href="https://itch.io/jam/camgamejam2024"
        target="_blank"
        class="all-submissions-link"
      >
        View All Submissions
      </a>
    </div>

    <div class="info-section">
      <p class="lorem-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
      <p class="lorem-text">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </p>
    </div>
  </div>

  <BackToMainButton />
</div>

<style>
  .splash-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
  }

  .three-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .content-overlay {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: linear-gradient(
      to bottom,
      rgba(10, 10, 26, 0.3) 0%,
      rgba(10, 10, 26, 0.6) 50%,
      rgba(10, 10, 26, 0.8) 100%
    );
  }

  .hero-section {
    text-align: center;
    margin-bottom: 6rem;
    animation: fadeInUp 1s ease-out;
  }

  .main-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    background: linear-gradient(135deg, #4a9eff 0%, #ff6b9d 50%, #ffd93d 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    text-shadow: 0 0 40px rgba(74, 158, 255, 0.5);
    animation: pulse 3s ease-in-out infinite, gradientShift 5s ease infinite;
    letter-spacing: -0.02em;
    position: relative;
  }

  .main-title::before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    background: linear-gradient(135deg, #4a9eff 0%, #ff6b9d 50%, #ffd93d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: blur(20px);
    opacity: 0.5;
    animation: pulse 3s ease-in-out infinite;
  }

  .subtitle {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    animation: shimmer 2s ease-in-out infinite;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }

  .date {
    font-size: clamp(1.2rem, 3vw, 2rem);
    color: #cccccc;
    margin-bottom: 0.5rem;
    animation: fadeIn 1.5s ease-out 0.3s both;
  }

  .submissions {
    font-size: clamp(1rem, 2vw, 1.5rem);
    color: #aaaaaa;
    animation: fadeIn 1.5s ease-out 0.6s both;
  }

  .games-section {
    width: 100%;
    max-width: 1200px;
    margin-bottom: 4rem;
    animation: fadeInUp 1s ease-out 0.9s both;
  }

  .section-title {
    font-size: clamp(1.8rem, 4vw, 3rem);
    color: #ffffff;
    text-align: center;
    margin-bottom: 3rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .game-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 2rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    color: inherit;
    position: relative;
    overflow: hidden;
    animation: cardFloat 4s ease-in-out infinite;
  }

  .game-card:nth-child(1) {
    animation-delay: 0s;
  }

  .game-card:nth-child(2) {
    animation-delay: 0.2s;
  }

  .game-card:nth-child(3) {
    animation-delay: 0.4s;
  }

  .game-card:nth-child(4) {
    animation-delay: 0.6s;
  }

  .game-card:nth-child(5) {
    animation-delay: 0.8s;
  }

  .game-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    transition: left 0.6s;
  }

  .game-card::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(74, 158, 255, 0.1) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s;
  }

  .game-card:hover::before {
    left: 100%;
  }

  .game-card:hover::after {
    opacity: 1;
  }

  .game-card:hover {
    transform: translateY(-12px) scale(1.03) rotateY(5deg);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(74, 158, 255, 0.5);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(74, 158, 255, 0.3),
      inset 0 0 20px rgba(255, 107, 157, 0.1);
  }

  .game-title {
    font-size: clamp(1.2rem, 2.5vw, 1.8rem);
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.5rem;
  }

  .game-prize {
    font-size: clamp(0.9rem, 1.5vw, 1.1rem);
    color: #cccccc;
  }

  .all-submissions-link {
    display: block;
    text-align: center;
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    color: #4a9eff;
    text-decoration: none;
    padding: 1rem 2rem;
    border: 2px solid #4a9eff;
    border-radius: 8px;
    transition: all 0.3s ease;
    margin: 0 auto;
    max-width: 300px;
  }

  .all-submissions-link:hover {
    background: rgba(74, 158, 255, 0.1);
    box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
    transform: scale(1.05);
  }

  .info-section {
    max-width: 800px;
    text-align: center;
    animation: fadeInUp 1s ease-out 1.2s both;
  }

  .lorem-text {
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    color: #bbbbbb;
    line-height: 1.8;
    margin-bottom: 1.5rem;
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

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 1;
      filter: brightness(1);
    }
    50% {
      opacity: 0.85;
      filter: brightness(1.2);
    }
  }

  @keyframes cardFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @keyframes gradientShift {
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

  @media (max-width: 768px) {
    .content-overlay {
      padding: 2rem 1rem;
    }

    .hero-section {
      margin-bottom: 4rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>