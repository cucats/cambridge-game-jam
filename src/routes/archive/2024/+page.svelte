<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvasContainer;
  let scene, camera, renderer;
  let mirrorGroup, floatingObjects = [];
  let mirroredObjects = [];
  let animationId;
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;

  const featuredProjects = [
    { title: "Reflected", prize: "Theme Winner" },
    { title: "Reflect Upon Your Actions", prize: "Most Popular and Most Original" },
    { title: "Blight", prize: "Most Popular and Best Gameplay" },
    { title: "Asymmetry", prize: "Best Gameplay" },
    { title: "Coulda Woulda Buddha", prize: "Best Presentation" }
  ];

  const createLowPolyGeometry = () => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    return geometry;
  };

  const createMirror = () => {
    const mirrorGeometry = new THREE.PlaneGeometry(8, 8, 4, 4);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    const edgeGeometry = new THREE.EdgesGeometry(mirrorGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    mirror.add(edges);
    return mirror;
  };

  const createFloatingObject = (x, y, z, color) => {
    const geometry = createLowPolyGeometry();
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.7,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(0.5 + Math.random() * 0.5);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.userData = {
      baseY: y,
      speed: 0.5 + Math.random() * 0.5,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      }
    };
    return mesh;
  };

  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

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
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 2, 20);
    pointLight1.position.set(-5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 2, 20);
    pointLight2.position.set(5, 3, -5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x9bff4a, 2, 20);
    pointLight3.position.set(0, -3, 0);
    scene.add(pointLight3);

    const spotLight1 = new THREE.SpotLight(0x4a9eff, 3, 30, Math.PI / 6, 0.5);
    spotLight1.position.set(-6, 8, 6);
    spotLight1.castShadow = true;
    scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight(0xff6b9d, 3, 30, Math.PI / 6, 0.5);
    spotLight2.position.set(6, 8, -6);
    spotLight2.castShadow = true;
    scene.add(spotLight2);

    mirrorGroup = new THREE.Group();

    const mirrorPositions = [
      { pos: [-4, 0, -2], rot: [0, Math.PI / 4, 0], scale: [1, 1, 1] },
      { pos: [4, 0, -2], rot: [0, -Math.PI / 4, 0], scale: [1, 1, 1] },
      { pos: [0, 0, -4], rot: [0, 0, 0], scale: [1.2, 1.2, 1] },
      { pos: [0, 4, 0], rot: [-Math.PI / 2, 0, 0], scale: [1.5, 1.5, 1] }
    ];

    mirrorPositions.forEach((config) => {
      const mirror = createMirror();
      mirror.position.set(...config.pos);
      mirror.rotation.set(...config.rot);
      mirror.scale.set(...config.scale);
      mirrorGroup.add(mirror);
    });

    scene.add(mirrorGroup);

    const colors = [0x4a9eff, 0xff6b9d, 0x9bff4a, 0xffd93d, 0x6bcf7f];
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const obj = createFloatingObject(x, y, z, color);
      obj.castShadow = true;
      obj.receiveShadow = true;
      floatingObjects.push(obj);
      scene.add(obj);

      const mirroredObj = obj.clone();
      mirroredObj.position.set(-x, y, -z);
      mirroredObj.scale.multiplyScalar(0.8);
      mirroredObj.material = obj.material.clone();
      mirroredObj.material.opacity = 0.6;
      mirroredObj.material.transparent = true;
      mirroredObjects.push(mirroredObj);
      scene.add(mirroredObj);
    }

    const floorGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    floor.receiveShadow = true;
    scene.add(floor);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  };

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    time += 0.01;

    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 + 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    mirrorGroup.rotation.y += 0.002;
    mirrorGroup.rotation.x = Math.sin(time * 0.5) * 0.1;

    floatingObjects.forEach((obj, index) => {
      obj.position.y = obj.userData.baseY + Math.sin(time * obj.userData.speed + index) * 1.5;
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;
      obj.position.x += Math.sin(time * 0.3 + index) * 0.01;
      obj.position.z += Math.cos(time * 0.3 + index) * 0.01;
    });

    mirroredObjects.forEach((obj, index) => {
      const original = floatingObjects[index];
      obj.position.x = -original.position.x;
      obj.position.y = original.position.y;
      obj.position.z = -original.position.z;
      obj.rotation.x = -original.rotation.x;
      obj.rotation.y = -original.rotation.y;
      obj.rotation.z = -original.rotation.z;
    });

    mirrorGroup.children.forEach((mirror, index) => {
      mirror.rotation.y += 0.001 * (index % 2 === 0 ? 1 : -1);
      mirror.rotation.x += Math.sin(time * 0.3 + index) * 0.01;
      if (mirror.material) {
        mirror.material.emissive = new THREE.Color(
          0x000000 + Math.floor(Math.sin(time + index) * 0.1 + 0.1) * 0x111111
        );
      }
    });

    scene.children.forEach((child) => {
      if (child.type === "PointLight" || child.type === "SpotLight") {
        child.intensity = 2 + Math.sin(time * 2) * 0.5;
      }
    });

    renderer.render(scene, camera);
  };

  onMount(() => {
    if (canvasContainer) {
      const cleanup = initScene();
      animate();
      return () => {
        if (cleanup) cleanup();
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) {
          renderer.dispose();
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
    }
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2024 - Reflection</title>
</svelte:head>

<div class="splash-container">
  <div class="canvas-wrapper" bind:this={canvasContainer}></div>
  
  <div class="content-overlay">
    <div class="hero-section">
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam Logo" class="logo" />
      </div>
      <h1 class="main-title">
        <span class="title-line">Cambridge Game Jam</span>
        <span class="title-line year">2024</span>
      </h1>
      <div class="theme-badge">
        <span class="theme-text">Reflection</span>
      </div>
      <div class="date-info">
        <span class="date">9th - 11th February</span>
      </div>
      <div class="subtitle">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
    </div>

    <div class="projects-section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        {#each featuredProjects as project, i}
          <div class="project-card" style="animation-delay: {i * 0.1}s">
            <div class="project-title">{project.title}</div>
            <div class="project-prize">{project.prize}</div>
          </div>
        {/each}
      </div>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3>Lorem Ipsum</h3>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>
      <div class="info-card">
        <h3>Dolor Sit Amet</h3>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      </div>
      <div class="info-card">
        <h3>Consectetur</h3>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
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

  .canvas-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .canvas-wrapper :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .content-overlay {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4rem 2rem;
    background: linear-gradient(
      to bottom,
      rgba(10, 10, 26, 0.3) 0%,
      rgba(10, 10, 26, 0.6) 50%,
      rgba(10, 10, 26, 0.9) 100%
    );
  }

  .hero-section {
    text-align: center;
    margin-bottom: 6rem;
    animation: fadeInUp 1s ease-out;
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

  .main-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #4a9eff 0%, #ff6b9d 50%, #9bff4a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px rgba(74, 158, 255, 0.3);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title-line {
    display: block;
    animation: slideInLeft 1s ease-out;
  }

  .title-line.year {
    animation: slideInRight 1s ease-out 0.3s;
    animation-fill-mode: both;
    font-size: 0.8em;
  }

  .theme-badge {
    display: inline-block;
    padding: 1rem 3rem;
    margin: 2rem 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(74, 158, 255, 0.5);
    border-radius: 50px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(74, 158, 255, 0.2);
    animation: scaleIn 0.8s ease-out 0.6s, glow 2s ease-in-out infinite 1.4s;
    animation-fill-mode: both;
  }

  .theme-text {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    background: linear-gradient(135deg, #4a9eff, #ff6b9d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .date-info {
    margin: 2rem 0;
    animation: fadeIn 1s ease-out 0.9s;
    animation-fill-mode: both;
  }

  .date {
    font-size: clamp(1.2rem, 3vw, 2rem);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 300;
    letter-spacing: 0.1em;
    text-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
  }

  .subtitle {
    max-width: 800px;
    margin: 3rem auto 0;
    animation: fadeIn 1s ease-out 1.2s;
    animation-fill-mode: both;
  }

  .subtitle p {
    font-size: clamp(1rem, 2vw, 1.3rem);
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
  }

  .projects-section {
    width: 100%;
    max-width: 1200px;
    margin: 4rem 0;
    animation: fadeInUp 1s ease-out 1.5s;
    animation-fill-mode: both;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    text-align: center;
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #4a9eff, #ff6b9d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .project-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(74, 158, 255, 0.3);
    border-radius: 20px;
    padding: 2rem;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: fadeInUp 0.8s ease-out;
    animation-fill-mode: both;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .project-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .project-card:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(74, 158, 255, 0.8);
    box-shadow: 0 20px 40px rgba(74, 158, 255, 0.3);
  }

  .project-card:hover::before {
    left: 100%;
  }

  .project-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .project-prize {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
  }

  .info-section {
    width: 100%;
    max-width: 1200px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
    animation: fadeInUp 1s ease-out 1.8s;
    animation-fill-mode: both;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 107, 157, 0.2);
    border-radius: 15px;
    padding: 2rem;
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 107, 157, 0.5);
    box-shadow: 0 10px 30px rgba(255, 107, 157, 0.2);
  }

  .info-card h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ff6b9d;
    margin-bottom: 1rem;
  }

  .info-card p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
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

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      filter: drop-shadow(0 0 30px rgba(74, 158, 255, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 50px rgba(74, 158, 255, 0.8));
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(74, 158, 255, 0.2);
    }
    50% {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(74, 158, 255, 0.4), 0 0 40px rgba(74, 158, 255, 0.3);
    }
  }

  @media (max-width: 768px) {
    .content-overlay {
      padding: 2rem 1rem;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .info-section {
      grid-template-columns: 1fr;
    }
  }
</style>