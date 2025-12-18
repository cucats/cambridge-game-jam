<script>
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

  const { images, title, duration, submissions, theme } = $props();

  let container;
  let scene, camera, renderer, controls;
  let mirrorPlane, mirrorCamera, mirrorTexture, mirrorRenderTarget;
  let lowPolyObjects = [];
  let animationFrameId;
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;

  const createLowPolyGeometry = (type, size = 1) => {
    let geometry;
    switch (type) {
      case "tetrahedron":
        geometry = new THREE.TetrahedronGeometry(size, 0);
        break;
      case "octahedron":
        geometry = new THREE.OctahedronGeometry(size, 0);
        break;
      case "icosahedron":
        geometry = new THREE.IcosahedronGeometry(size, 0);
        break;
      case "dodecahedron":
        geometry = new THREE.DodecahedronGeometry(size, 0);
        break;
      default:
        geometry = new THREE.TetrahedronGeometry(size, 0);
    }
    return geometry;
  };

  const initThree = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controls.enablePan = false;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(10, 10, 5);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x4a90e2, 0.6);
    directionalLight2.position.set(-10, 5, -5);
    scene.add(directionalLight2);

    const pointLight1 = new THREE.PointLight(0xff6b9d, 1, 30);
    pointLight1.position.set(5, 8, 5);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 30);
    pointLight2.position.set(-5, 8, -5);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    const geometries = ["tetrahedron", "octahedron", "icosahedron", "dodecahedron"];
    const colors = [0xff6b9d, 0x4ecdc4, 0xffe66d, 0x4a90e2, 0x95e1d3];

    for (let i = 0; i < 30; i++) {
      const geometryType = geometries[Math.floor(Math.random() * geometries.length)];
      const geometry = createLowPolyGeometry(geometryType, Math.random() * 0.8 + 0.3);
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        metalness: 0.7,
        roughness: 0.3,
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 0.2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const angle = (Math.PI * 2 * i) / 30;
      const radius = 5 + Math.random() * 8;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 10,
        Math.sin(angle) * radius
      );

      mesh.userData = {
        originalY: mesh.position.y,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatAmplitude: Math.random() * 0.5 + 0.3,
      };

      lowPolyObjects.push(mesh);
      scene.add(mesh);
    }

    mirrorRenderTarget = new THREE.WebGLRenderTarget(1024, 1024);
    mirrorRenderTarget.texture.format = THREE.RGBAFormat;
    mirrorRenderTarget.texture.type = THREE.HalfFloatType;

    mirrorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    mirrorCamera.position.set(0, -10, 0);
    mirrorCamera.lookAt(0, 0, 0);

    const mirrorGeometry = new THREE.PlaneGeometry(20, 20);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 1.0,
      roughness: 0.05,
      envMap: mirrorRenderTarget.texture,
    });
    mirrorPlane = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane.rotation.x = -Math.PI / 2;
    mirrorPlane.position.y = -8;
    mirrorPlane.receiveShadow = true;
    mirrorPlane.visible = false;
    scene.add(mirrorPlane);

    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -10;
    ground.receiveShadow = true;
    scene.add(ground);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
  };

  const handleMouseMove = (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  const handleResize = () => {
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    time += 0.01;

    if (controls) controls.update();

    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 + 5 - camera.position.y) * 0.05;

    lowPolyObjects.forEach((obj, index) => {
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;

      obj.position.y =
        obj.userData.originalY +
        Math.sin(time * obj.userData.floatSpeed + index) * obj.userData.floatAmplitude;

      const angle = Math.atan2(obj.position.z, obj.position.x) + 0.001;
      const radius = Math.sqrt(obj.position.x * obj.position.x + obj.position.z * obj.position.z);
      obj.position.x = Math.cos(angle) * radius;
      obj.position.z = Math.sin(angle) * radius;

      const distance = obj.position.distanceTo(camera.position);
      const scale = Math.max(0.5, 1 - distance * 0.05);
      obj.scale.set(scale, scale, scale);

      const pulse = Math.sin(time * 2 + index) * 0.1 + 1;
      obj.material.emissiveIntensity = 0.2 + Math.sin(time * 3 + index) * 0.1;
    });

    pointLight1.position.x = Math.sin(time) * 8;
    pointLight1.position.z = Math.cos(time) * 8;
    pointLight1.intensity = 1 + Math.sin(time * 2) * 0.3;
    pointLight2.position.x = Math.cos(time * 0.7) * 8;
    pointLight2.position.z = Math.sin(time * 0.7) * 8;
    pointLight2.intensity = 1 + Math.cos(time * 2.3) * 0.3;

    const mirrorY = mirrorPlane.position.y;
    mirrorCamera.position.x = camera.position.x;
    mirrorCamera.position.z = camera.position.z;
    mirrorCamera.position.y = 2 * mirrorY - camera.position.y;
    mirrorCamera.rotation.x = -camera.rotation.x;
    mirrorCamera.rotation.y = camera.rotation.y;
    mirrorCamera.rotation.z = -camera.rotation.z;

    mirrorPlane.visible = false;
    renderer.setRenderTarget(mirrorRenderTarget);
    renderer.render(scene, mirrorCamera);
    renderer.setRenderTarget(null);
    mirrorPlane.visible = true;
    renderer.render(scene, camera);
  };

  const cleanup = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("resize", handleResize);

    if (lowPolyObjects.length > 0) {
      lowPolyObjects.forEach((obj) => {
        obj.geometry.dispose();
        obj.material.dispose();
        scene.remove(obj);
      });
      lowPolyObjects = [];
    }

    if (mirrorPlane) {
      mirrorPlane.geometry.dispose();
      mirrorPlane.material.dispose();
      scene.remove(mirrorPlane);
    }

    if (mirrorRenderTarget) {
      mirrorRenderTarget.dispose();
    }

    if (renderer) {
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    }

    if (controls) controls.dispose();
  };

  onMount(() => {
    if (container) {
      initThree();
      animate();
    }
  });

  onDestroy(() => {
    cleanup();
  });

  let currentImageIndex = $state(0);

  const nextImage = () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
  };

  const prevImage = () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  };
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="cgj2024-splash">
  <div bind:this={container} class="three-container"></div>

  <div class="content-overlay">
    <div class="header-section">
      <div class="logo-container">
        <img src="/2024/logo.png" alt="Cambridge Game Jam Logo" class="logo" />
      </div>
      <h1 class="main-title">{title}</h1>
      <h2 class="duration">{duration}</h2>
      <div class="theme-badge">
        <span class="theme-text">{theme}</span>
      </div>
      <a
        href="https://itch.io/jam/camgamejam2024"
        class="submissions-link"
      >
        {submissions} {submissions == 1 ? "Submission" : "Submissions"}
      </a>
    </div>

    <div class="gallery-section">
      <div class="gallery-container">
        <div
          class="gallery-track"
          style="transform: translateX(-{currentImageIndex * 100}%)"
        >
          {#each images as { src, alt, link, title: imgTitle, prize }, index}
            <div class="gallery-slide">
              <a href={link} class="slide-link">
                <div class="image-wrapper">
                  <img src={src} alt={alt} class="gallery-image" />
                  <div class="image-overlay">
                    <h3 class="image-title">{imgTitle}</h3>
                    {#if prize}
                      <p class="image-prize">{prize}</p>
                    {/if}
                  </div>
                </div>
              </a>
            </div>
          {/each}
        </div>
      </div>

      <div class="gallery-controls">
        <button class="nav-button prev" onclick={prevImage}>‹</button>
        <div class="indicators">
          {#each images as _, index}
            <button
              class="indicator"
              class:active={index === currentImageIndex}
              onclick={() => (currentImageIndex = index)}
              aria-label="Go to slide {index + 1}"
            ></button>
          {/each}
        </div>
        <button class="nav-button next" onclick={nextImage}>›</button>
      </div>
    </div>

    <div class="info-section">
      <p class="info-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      </p>
      <p class="info-text">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
  </div>
</div>

<style>
  .cgj2024-splash {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    background: #0a0a0f;
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
    padding: 2rem;
    pointer-events: none;
  }

  .content-overlay > * {
    pointer-events: auto;
  }

  .header-section {
    text-align: center;
    padding: 4rem 2rem 2rem;
    animation: fadeInUp 1s ease-out;
  }

  .logo-container {
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  .logo {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(255, 255, 255, 0.3));
  }

  .main-title {
    font-size: 4rem;
    font-weight: 900;
    color: #ffffff;
    margin: 1rem 0;
    text-shadow: 0 0 20px rgba(255, 107, 157, 0.5),
      0 0 40px rgba(78, 205, 196, 0.3);
    animation: glow 2s ease-in-out infinite alternate;
    letter-spacing: 0.05em;
  }

  .duration {
    font-size: 2rem;
    color: #4ecdc4;
    margin: 0.5rem 0 2rem;
    font-weight: 300;
    letter-spacing: 0.1em;
  }

  .theme-badge {
    display: inline-block;
    padding: 1rem 3rem;
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.3), rgba(78, 205, 196, 0.3));
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50px;
    backdrop-filter: blur(10px);
    margin: 1rem 0;
    animation: pulse 2s ease-in-out infinite;
  }

  .theme-text {
    font-size: 1.5rem;
    color: #ffffff;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .submissions-link {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.75rem 2rem;
    color: #ffe66d;
    text-decoration: none;
    font-size: 1.2rem;
    border: 2px solid rgba(255, 230, 109, 0.5);
    border-radius: 30px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.3);
  }

  .submissions-link:hover {
    background: rgba(255, 230, 109, 0.2);
    border-color: #ffe66d;
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 230, 109, 0.4);
  }

  .gallery-section {
    margin: 4rem auto;
    max-width: 1200px;
    width: 100%;
    animation: fadeInUp 1s ease-out 0.3s both;
  }

  .gallery-container {
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .gallery-track {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .gallery-slide {
    min-width: 100%;
    height: 100%;
    position: relative;
  }

  .slide-link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .slide-link:hover .gallery-image {
    transform: scale(1.1);
  }

  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
    color: #ffffff;
    transform: translateY(100%);
    transition: transform 0.4s ease;
  }

  .slide-link:hover .image-overlay {
    transform: translateY(0);
  }

  .image-title {
    font-size: 2rem;
    margin: 0 0 0.5rem;
    font-weight: 700;
  }

  .image-prize {
    font-size: 1.2rem;
    margin: 0;
    color: #4ecdc4;
  }

  .gallery-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
  }

  .nav-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #ffffff;
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }

  .indicators {
    display: flex;
    gap: 0.75rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .indicator.active {
    background: #ffffff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
  }

  .indicator:hover {
    border-color: #ffffff;
    transform: scale(1.1);
  }

  .info-section {
    max-width: 800px;
    margin: 4rem auto;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInUp 1s ease-out 0.6s both;
  }

  .info-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    line-height: 1.8;
    margin: 1rem 0;
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

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes glow {
    from {
      text-shadow: 0 0 20px rgba(255, 107, 157, 0.5),
        0 0 40px rgba(78, 205, 196, 0.3);
    }
    to {
      text-shadow: 0 0 30px rgba(255, 107, 157, 0.8),
        0 0 60px rgba(78, 205, 196, 0.5),
        0 0 80px rgba(74, 144, 226, 0.3);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 20px rgba(255, 107, 157, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 40px rgba(78, 205, 196, 0.5);
    }
  }

  @media (max-width: 768px) {
    .main-title {
      font-size: 2.5rem;
    }

    .duration {
      font-size: 1.5rem;
    }

    .theme-text {
      font-size: 1.2rem;
    }

    .gallery-container {
      height: 300px;
    }

    .logo {
      width: 150px;
    }

    .content-overlay {
      padding: 1rem;
    }
  }
</style>
