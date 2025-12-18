<script>
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

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

  let container;
  let scene, camera, renderer;
  let mirrorPlane, mirrorCamera, mirrorTexture;
  let lowPolyObjects = [];
  let animationFrameId;
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let time = 0;
  let pointLight1, pointLight2, pointLight3;

  const createLowPolyGeometry = () => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const positions = geometry.attributes.position;
    const count = positions.count;

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const noise = 0.15;
      positions.setX(i, x + (Math.random() - 0.5) * noise);
      positions.setY(i, y + (Math.random() - 0.5) * noise);
      positions.setZ(i, z + (Math.random() - 0.5) * noise);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  const initThree = () => {
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0x0a0a0f, 15, 60);

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
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    pointLight1 = new THREE.PointLight(0x4a9eff, 1.5, 30);
    pointLight1.position.set(-5, 3, 5);
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(0xff6b9d, 1.5, 30);
    pointLight2.position.set(5, 3, -5);
    scene.add(pointLight2);

    pointLight3 = new THREE.PointLight(0x9bff4a, 1.2, 25);
    pointLight3.position.set(0, -2, 0);
    scene.add(pointLight3);

    for (let i = 0; i < 30; i++) {
      const geometry = createLowPolyGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          Math.random() * 0.3 + 0.5,
          0.7,
          0.6 + Math.random() * 0.3
        ),
        metalness: 0.3 + Math.random() * 0.4,
        roughness: 0.2 + Math.random() * 0.3,
        emissive: new THREE.Color().setHSL(
          Math.random() * 0.3 + 0.5,
          0.5,
          0.1
        ),
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const scale = 0.3 + Math.random() * 0.5;
      mesh.scale.set(scale, scale, scale);

      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      );

      mesh.userData = {
        basePosition: mesh.position.clone(),
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatAmount: Math.random() * 0.5 + 0.3,
      };

      lowPolyObjects.push(mesh);
      scene.add(mesh);
    }

    mirrorTexture = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    mirrorCamera = new THREE.CubeCamera(0.1, 1000, mirrorTexture);
    scene.add(mirrorCamera);

    const mirrorGeometry = new THREE.PlaneGeometry(20, 12);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      envMap: mirrorTexture.texture,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    mirrorPlane = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane.position.set(0, 1, -10);
    mirrorPlane.rotation.y = Math.PI;
    scene.add(mirrorPlane);

    const mirrorPlane2 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane2.position.set(-12, 1, 0);
    mirrorPlane2.rotation.y = Math.PI / 2;
    scene.add(mirrorPlane2);

    const mirrorPlane3 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane3.position.set(12, 1, 0);
    mirrorPlane3.rotation.y = -Math.PI / 2;
    scene.add(mirrorPlane3);

    const mirrorPlane4 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane4.position.set(0, 1, 10);
    mirrorPlane4.rotation.y = 0;
    scene.add(mirrorPlane4);

    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    floor.receiveShadow = true;
    scene.add(floor);
  };

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    time += 0.01;

    mirrorCamera.position.copy(camera.position);

    lowPolyObjects.forEach((obj, index) => {
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;

      const floatOffset =
        Math.sin(time * 2 + index) * obj.userData.floatAmount;
      obj.position.y = obj.userData.basePosition.y + floatOffset;

      const orbitRadius = 3 + index * 0.2;
      const orbitSpeed = 0.015 + index * 0.0015;
      obj.position.x =
        obj.userData.basePosition.x +
        Math.cos(time * orbitSpeed + index) * orbitRadius * 0.4;
      obj.position.z =
        obj.userData.basePosition.z +
        Math.sin(time * orbitSpeed + index) * orbitRadius * 0.4;

      const scalePulse = 1 + Math.sin(time * 1.5 + index) * 0.15;
      const baseScale = 0.3 + (index % 5) * 0.1;
      obj.scale.setScalar(baseScale * scalePulse);

      obj.material.emissiveIntensity = 0.2 + Math.sin(time * 2 + index) * 0.1;
    });

    const targetX = mouseX * 1.5;
    const targetY = mouseY * 1.5 + 2;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 1, 0);

    pointLight1.position.x = -5 + Math.sin(time) * 2;
    pointLight1.position.z = 5 + Math.cos(time) * 2;
    pointLight2.position.x = 5 + Math.cos(time * 1.2) * 2;
    pointLight2.position.z = -5 + Math.sin(time * 1.2) * 2;
    pointLight3.position.y = -2 + Math.sin(time * 0.8) * 1;

    mirrorCamera.update(renderer, scene);

    renderer.render(scene, camera);
  };

  const handleResize = () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const handleMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  };

  const handleScroll = () => {
    scrollY = window.scrollY;
    if (camera) {
      camera.position.z = 8 + scrollY * 0.01;
    }
  };

  onMount(() => {
    initThree();
    animate();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
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
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="splash-container">
  <div bind:this={container} class="three-container"></div>

  <div class="content-overlay">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="main-title">{title}</h1>
        <div class="theme-badge">{theme}</div>
        <div class="date-info">{duration}</div>
        <div class="submissions-info">{submissions} Submissions</div>
      </div>
    </div>

    <div class="games-section">
      <h2 class="section-title">Featured Games</h2>
      <div class="games-grid">
        {#each games as game}
          <a href={game.link} target="_blank" class="game-card">
            <div class="game-title">{game.title}</div>
            <div class="game-prize">{game.prize}</div>
          </a>
        {/each}
      </div>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3>Lorem Ipsum</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>
      <div class="info-card">
        <h3>Lorem Ipsum</h3>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .splash-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .three-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1;
  }

  .content-overlay {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .hero-section {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .hero-content {
    text-align: center;
    color: white;
    animation: fadeInUp 1s ease-out;
  }

  .main-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    margin-bottom: 1.5rem;
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.5),
      0 0 60px rgba(74, 158, 255, 0.3);
    letter-spacing: -0.02em;
    animation: pulseGlow 3s ease-in-out infinite;
  }

  .theme-badge {
    display: inline-block;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    padding: 1rem 2.5rem;
    margin: 1rem 0;
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(255, 107, 157, 0.3));
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50px;
    backdrop-filter: blur(10px);
    animation: float 3s ease-in-out infinite;
  }

  .date-info {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    margin: 1rem 0;
    opacity: 0.9;
    animation: fadeIn 1.5s ease-out 0.3s both;
  }

  .submissions-info {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    margin-top: 1rem;
    opacity: 0.8;
    animation: fadeIn 1.5s ease-out 0.6s both;
  }

  .games-section {
    padding: 6rem 2rem;
    background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.95) 10%);
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    color: white;
    text-align: center;
    margin-bottom: 3rem;
    text-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
  }

  .games-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .game-card {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.15), rgba(255, 107, 157, 0.15));
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 2rem;
    color: white;
    text-decoration: none;
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: slideInUp 0.6s ease-out both;
    position: relative;
    overflow: hidden;
  }

  .game-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .game-card:hover::before {
    left: 100%;
  }

  .game-card:nth-child(1) { animation-delay: 0.1s; }
  .game-card:nth-child(2) { animation-delay: 0.2s; }
  .game-card:nth-child(3) { animation-delay: 0.3s; }
  .game-card:nth-child(4) { animation-delay: 0.4s; }
  .game-card:nth-child(5) { animation-delay: 0.5s; }

  .game-card:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 20px 40px rgba(74, 158, 255, 0.3);
  }

  .game-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .game-prize {
    font-size: 1rem;
    opacity: 0.8;
  }

  .info-section {
    padding: 6rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2.5rem;
    color: white;
    backdrop-filter: blur(10px);
    animation: fadeIn 1s ease-out both;
  }

  .info-card:nth-child(2) {
    animation-delay: 0.2s;
  }

  .info-card h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.95);
  }

  .info-card p {
    font-size: 1.1rem;
    line-height: 1.8;
    opacity: 0.85;
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

  @keyframes pulseGlow {
    0%, 100% {
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.5),
        0 0 60px rgba(74, 158, 255, 0.3);
    }
    50% {
      text-shadow: 0 0 40px rgba(255, 255, 255, 0.7),
        0 0 80px rgba(74, 158, 255, 0.5),
        0 0 100px rgba(255, 107, 157, 0.3);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
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
    .hero-section {
      padding: 1rem;
    }

    .games-section,
    .info-section {
      padding: 4rem 1rem;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
