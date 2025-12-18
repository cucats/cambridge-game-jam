<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvasContainer;
  let scene, camera, renderer;
  let mirrors = [];
  let mirrorRenderTargets = [];
  let mirrorCameras = [];
  let lowPolyObjects = [];
  let particles = [];
  let animationId;
  let mouse = new THREE.Vector2();
  let raycaster = new THREE.Raycaster();
  let selectedObject = null;
  let time = 0;
  let frameCount = 0;

  const gameData = [
    {
      title: "Blight",
      prize: "Most Popular and Best Gameplay",
      link: "https://hex-26.itch.io/blight",
      image: "/2024/blight.png",
    },
    {
      title: "Reflect Upon Your Actions",
      prize: "Most Popular and Most Original",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      image: "/2024/reflect-upon-your-actions.png",
    },
    {
      title: "Reflected",
      prize: "Theme Winner",
      link: "https://ekorrette.itch.io/reflected",
      image: "/2024/reflected.png",
    },
    {
      title: "Asymmetry",
      prize: "Best Gameplay",
      link: "https://alex-davies.itch.io/asymmetry",
      image: "/2024/asymmetry.png",
    },
    {
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
      image: "/2024/coulda-woulda-buddha.png",
    },
    {
      title: "All Submissions",
      prize: "",
      link: "https://itch.io/jam/camgamejam2024",
      image: "/2024/all-submissions.png",
    },
  ];

  let currentGameIndex = $state(0);
  let isHovering = $state(false);
  let isTransitioning = $state(false);

  function createLowPolyGeometry() {
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
  }

  function createMirrorPlane(width, height, position, rotation, index) {
    const geometry = new THREE.PlaneGeometry(width, height, 16, 16);
    const positions = geometry.attributes.position;
    const newPositions = [];
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const noise = (Math.random() - 0.5) * 0.05;
      newPositions.push(x + noise, y + noise, z + noise);
    }
    
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(newPositions, 3)
    );
    geometry.computeVertexNormals();

    const renderTarget = new THREE.WebGLCubeRenderTarget(512, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 1.0,
      roughness: 0.05,
      envMap: renderTarget.texture,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
    });

    const mirror = new THREE.Mesh(geometry, material);
    mirror.position.copy(position);
    mirror.rotation.copy(rotation);
    mirror.userData.renderTarget = renderTarget;
    mirror.userData.index = index;

    const mirrorCamera = new THREE.CubeCamera(0.1, 1000, renderTarget);
    mirrorCamera.position.copy(position);

    mirrorRenderTargets.push(renderTarget);
    mirrorCameras.push(mirrorCamera);

    return mirror;
  }

  function createLowPolyObject() {
    const geometry = createLowPolyGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.userData = {
      originalScale: 1 + Math.random() * 0.5,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      },
      floatSpeed: Math.random() * 0.01 + 0.005,
      floatAmplitude: Math.random() * 0.5 + 0.3,
    };
    return mesh;
  }

  function createParticle() {
    const geometry = new THREE.TetrahedronGeometry(0.1, 0);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.7),
      emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.3),
      metalness: 0.9,
      roughness: 0.1,
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30
    );
    particle.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
      },
    };
    return particle;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.05);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x4a9eff, 1);
    directionalLight1.position.set(10, 10, 5);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xff6b9d, 0.8);
    directionalLight2.position.set(-10, -10, -5);
    scene.add(directionalLight2);

    const pointLight1 = new THREE.PointLight(0x00ff88, 2, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0088, 2, 50);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    for (let i = 0; i < 25; i++) {
      const obj = createLowPolyObject();
      lowPolyObjects.push(obj);
      scene.add(obj);
    }

    for (let i = 0; i < 80; i++) {
      const particle = createParticle();
      particles.push(particle);
      scene.add(particle);
    }

    const mirror1 = createMirrorPlane(
      10,
      10,
      new THREE.Vector3(-10, 0, 0),
      new THREE.Euler(0, Math.PI / 2, 0),
      0
    );
    mirrors.push(mirror1);
    scene.add(mirror1);

    const mirror2 = createMirrorPlane(
      10,
      10,
      new THREE.Vector3(10, 0, 0),
      new THREE.Euler(0, -Math.PI / 2, 0),
      1
    );
    mirrors.push(mirror2);
    scene.add(mirror2);

    const mirror3 = createMirrorPlane(
      15,
      10,
      new THREE.Vector3(0, 0, -10),
      new THREE.Euler(0, 0, 0),
      2
    );
    mirrors.push(mirror3);
    scene.add(mirror3);

    const mirror4 = createMirrorPlane(
      15,
      10,
      new THREE.Vector3(0, 0, 10),
      new THREE.Euler(0, Math.PI, 0),
      3
    );
    mirrors.push(mirror4);
    scene.add(mirror4);

    const mirror5 = createMirrorPlane(
      15,
      15,
      new THREE.Vector3(0, -8, 0),
      new THREE.Euler(-Math.PI / 2, 0, 0),
      4
    );
    mirrors.push(mirror5);
    scene.add(mirror5);

    const mirror6 = createMirrorPlane(
      15,
      15,
      new THREE.Vector3(0, 8, 0),
      new THREE.Euler(Math.PI / 2, 0, 0),
      5
    );
    mirrors.push(mirror6);
    scene.add(mirror6);

    mirrors.forEach((mirror) => {
      scene.add(mirrorCameras[mirror.userData.index]);
    });

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;
    frameCount++;

    camera.position.x = Math.sin(time * 0.3) * 4;
    camera.position.y = 5 + Math.sin(time * 0.2) * 2.5;
    camera.position.z = 15 + Math.cos(time * 0.25) * 3;
    camera.lookAt(0, 0, 0);

    mirrorCameras.forEach((mirrorCamera, index) => {
      mirrorCamera.position.copy(mirrors[index].position);
      mirrorCamera.update(renderer, scene);
    });

    lowPolyObjects.forEach((obj, index) => {
      obj.rotation.x += obj.userData.rotationSpeed.x * (1 + Math.sin(time + index) * 0.5);
      obj.rotation.y += obj.userData.rotationSpeed.y * (1 + Math.cos(time + index) * 0.5);
      obj.rotation.z += obj.userData.rotationSpeed.z * (1 + Math.sin(time * 2 + index) * 0.5);

      const floatOffset =
        Math.sin(time * 5 + index * 0.5) * obj.userData.floatAmplitude;
      const baseY = (index % 5 - 2) * 3;
      obj.position.y = baseY + floatOffset;

      const orbitRadius = 8 + (index % 3) * 2;
      const orbitAngle = time * 0.3 + index * 0.5;
      obj.position.x = Math.cos(orbitAngle) * orbitRadius;
      obj.position.z = Math.sin(orbitAngle) * orbitRadius;

      const scalePulse = 1 + Math.sin(time * 2 + index) * 0.15;
      const hoverScale = selectedObject === obj ? 1.8 : 1;
      obj.scale.setScalar(obj.userData.originalScale * scalePulse * hoverScale);

      if (selectedObject === obj) {
        obj.material.emissiveIntensity = 0.8 + Math.sin(time * 8) * 0.4;
        obj.material.emissive.setHSL(
          (time * 0.1 + index * 0.1) % 1,
          0.8,
          0.5 + Math.sin(time * 5) * 0.3
        );
      } else {
        obj.material.emissiveIntensity = 0.15 + Math.sin(time * 0.5 + index) * 0.05;
      }

      const colorShift = Math.sin(time * 0.3 + index * 0.2);
      obj.material.color.setHSL(
        (time * 0.05 + index * 0.1) % 1,
        0.7 + colorShift * 0.2,
        0.6 + colorShift * 0.2
      );
    });

    particles.forEach((particle, index) => {
      particle.userData.velocity.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.001
        )
      );
      particle.userData.velocity.multiplyScalar(0.99);
      particle.position.add(particle.userData.velocity);
      
      particle.rotation.x += particle.userData.rotationSpeed.x;
      particle.rotation.y += particle.userData.rotationSpeed.y;
      particle.rotation.z += particle.userData.rotationSpeed.z;

      const distance = particle.position.length();
      if (distance > 25) {
        particle.position.normalize().multiplyScalar(-25);
        particle.userData.velocity.multiplyScalar(-0.5);
      }

      const pulse = Math.sin(time * 4 + index * 0.1) * 0.5 + 0.5;
      particle.scale.setScalar(0.3 + pulse * 0.7);
      
      const colorPulse = Math.sin(time * 2 + index * 0.05);
      particle.material.emissiveIntensity = 0.3 + colorPulse * 0.3;
      particle.material.color.setHSL(
        (time * 0.1 + index * 0.01) % 1,
        0.8,
        0.6 + colorPulse * 0.2
      );
    });

    mirrors.forEach((mirror, index) => {
      const baseRotation = index === 0 ? Math.PI / 2 : index === 1 ? -Math.PI / 2 : index === 2 ? 0 : index === 3 ? Math.PI : index === 4 ? -Math.PI / 2 : Math.PI / 2;
      if (index < 2) {
        mirror.rotation.y = baseRotation + Math.sin(time * 0.5 + index) * 0.1;
      } else if (index < 4) {
        mirror.rotation.y = baseRotation + Math.cos(time * 0.5 + index) * 0.1;
      } else {
        mirror.rotation.x = baseRotation + Math.sin(time * 0.5 + index) * 0.1;
      }
      
      const pulse = Math.sin(time * 2 + index) * 0.15 + 0.85;
      mirror.material.metalness = pulse;
      mirror.material.roughness = 0.05 + Math.sin(time * 3 + index) * 0.02;
      
      const colorShift = (Math.sin(time + index) + 1) * 0.5;
      mirror.material.color.setHSL(0.55 + colorShift * 0.1, 0.3, 0.5 + colorShift * 0.2);
    });

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(lowPolyObjects);

    if (intersects.length > 0) {
      if (selectedObject !== intersects[0].object) {
        selectedObject = intersects[0].object;
      }
    } else {
      selectedObject = null;
    }
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMount(() => {
    initThree();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  });

  function nextGame() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => {
      currentGameIndex = (currentGameIndex + 1) % gameData.length;
      isTransitioning = false;
    }, 300);
  }

  function prevGame() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => {
      currentGameIndex = (currentGameIndex - 1 + gameData.length) % gameData.length;
      isTransitioning = false;
    }, 300);
  }
</script>

<svelte:head>
  <title>Cambridge Game Jam 2024 - Reflection</title>
</svelte:head>

<div class="page-container">
  <div bind:this={canvasContainer} class="canvas-container"></div>

  <div class="content-overlay">
    <div class="hero-section">
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam Logo" class="logo" />
      </div>
      <h1 class="title">Cambridge Game Jam 2024</h1>
      <h2 class="subtitle">9th - 11th February</h2>
      <div class="theme-badge">
        <span class="theme-text">Reflection</span>
      </div>
      <div class="stats">
        <a href="https://itch.io/jam/camgamejam2024" class="stat-link">
          23 Submissions
        </a>
      </div>
    </div>

    <div class="gallery-section">
      <div class="gallery-container">
        <button class="nav-button prev" onclick={prevGame}>‹</button>
        <div class="game-card">
          <a
            href={gameData[currentGameIndex].link}
            target="_blank"
            rel="noopener noreferrer"
            class="game-link"
            onmouseenter={() => (isHovering = true)}
            onmouseleave={() => (isHovering = false)}
          >
            <div class="image-wrapper">
              <img
                src={gameData[currentGameIndex].image}
                alt={gameData[currentGameIndex].title}
                class="game-image"
                style="animation: fadeIn 0.6s ease-in-out;"
              />
              <div class="image-overlay"></div>
            </div>
            <div class="game-info">
              <h3 class="game-title">{gameData[currentGameIndex].title}</h3>
              {#if gameData[currentGameIndex].prize}
                <p class="game-prize">{gameData[currentGameIndex].prize}</p>
              {/if}
            </div>
          </a>
        </div>
        <button class="nav-button next" onclick={nextGame}>›</button>
      </div>
      <div class="indicators">
        {#each gameData as _, index}
          <button
            class="indicator"
            class:active={index === currentGameIndex}
            onclick={() => (currentGameIndex = index)}
            aria-label="Game {index + 1}"
          ></button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .page-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #0a0a1a;
  }

  .canvas-container {
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
    pointer-events: none;
  }

  .hero-section {
    padding: 4rem 2rem 2rem;
    text-align: center;
    pointer-events: auto;
  }

  .logo-container {
    margin-bottom: 2rem;
    animation: float 6s ease-in-out infinite;
  }

  .logo {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 0 30px rgba(74, 158, 255, 0.5));
    animation: pulse 3s ease-in-out infinite;
  }

  .title {
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #4a9eff 0%, #ff6b9d 50%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    text-shadow: 0 0 40px rgba(74, 158, 255, 0.3);
    animation: shimmer 4s ease-in-out infinite;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
    font-weight: 300;
    letter-spacing: 0.1em;
  }

  .theme-badge {
    display: inline-block;
    padding: 1rem 3rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 50px;
    border: 2px solid rgba(74, 158, 255, 0.5);
    margin-bottom: 2rem;
    animation: glow 2s ease-in-out infinite;
  }

  .theme-text {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #4a9eff 0%, #ff6b9d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .stats {
    margin-top: 1rem;
  }

  .stat-link {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    text-decoration: none;
    padding: 0.5rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 25px;
    transition: all 0.3s ease;
    display: inline-block;
  }

  .stat-link:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(74, 158, 255, 0.8);
    transform: scale(1.05);
  }

  .gallery-section {
    padding: 2rem;
    pointer-events: auto;
  }

  .gallery-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .game-card {
    flex: 1;
    max-width: 800px;
    position: relative;
  }

  .game-card :global(.game-link) {
    animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .game-link {
    display: block;
    text-decoration: none;
    color: inherit;
    position: relative;
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 20px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .image-wrapper:hover {
    transform: scale(1.02) translateY(-5px);
    border-color: rgba(74, 158, 255, 0.8);
    box-shadow: 0 20px 60px rgba(74, 158, 255, 0.4);
  }

  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      filter 0.6s ease;
    filter: brightness(0.9) contrast(1.1);
  }

  .image-wrapper:hover .game-image {
    transform: scale(1.15) rotate(1deg);
    filter: brightness(1.1) contrast(1.2) saturate(1.2);
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.7) 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .image-wrapper:hover .image-overlay {
    opacity: 1;
  }

  .game-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  .game-link:hover .game-info {
    transform: translateY(0);
    opacity: 1;
  }

  .game-title {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .game-prize {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .nav-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(74, 158, 255, 0.8);
    transform: scale(1.1);
  }

  .indicators {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .indicator.active {
    background: rgba(74, 158, 255, 0.8);
    border-color: rgba(74, 158, 255, 1);
    transform: scale(1.3);
    box-shadow: 0 0 15px rgba(74, 158, 255, 0.6);
  }

  .indicator:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.2);
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 30px rgba(74, 158, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 50px rgba(74, 158, 255, 0.8));
    }
  }

  @keyframes shimmer {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes glow {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(74, 158, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(74, 158, 255, 0.6);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(1.05);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 768px) {
    .title {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1.2rem;
    }

    .theme-text {
      font-size: 1.5rem;
    }

    .logo {
      width: 150px;
    }

    .gallery-container {
      flex-direction: column;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    .nav-button.prev {
      left: 1rem;
    }

    .nav-button.next {
      right: 1rem;
    }

    .game-card {
      max-width: 100%;
    }
  }
</style>
