<script>
  import { onMount } from "svelte";

  let canvasContainer;
  let scene, camera, renderer, controls;
  let mirrorGroup, lowPolyObjects = [];
  let animationFrame;
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let currentSlide = 0;
  let isTransitioning = false;
  let THREE, OrbitControls;

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
    {
      src: "/2024/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2024",
      title: "All Submissions",
      prize: "",
    },
  ];

  function createLowPolyGeometry(shape, segments = 3) {
    if (!THREE) return null;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    if (shape === "cube") {
      const size = 1;
      const positions = [
        [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
        [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]
      ];
      
      const faces = [
        [0, 1, 2], [0, 2, 3],
        [4, 7, 6], [4, 6, 5],
        [0, 4, 5], [0, 5, 1],
        [2, 6, 7], [2, 7, 3],
        [0, 3, 7], [0, 7, 4],
        [1, 5, 6], [1, 6, 2]
      ];

      faces.forEach(face => {
        face.forEach(i => vertices.push(...positions[i]));
        const base = vertices.length / 3 - 3;
        indices.push(base, base + 1, base + 2);
      });
    } else if (shape === "sphere") {
      const radius = 1;
      const detail = segments;
      const verticesPerRow = detail + 1;
      
      for (let i = 0; i <= detail; i++) {
        const theta = (i / detail) * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        for (let j = 0; j <= detail; j++) {
          const phi = (j / detail) * 2 * Math.PI;
          const x = radius * sinTheta * Math.cos(phi);
          const y = radius * cosTheta;
          const z = radius * sinTheta * Math.sin(phi);
          vertices.push(x, y, z);
        }
      }
      
      for (let i = 0; i < detail; i++) {
        for (let j = 0; j < detail; j++) {
          const a = i * verticesPerRow + j;
          const b = i * verticesPerRow + j + 1;
          const c = (i + 1) * verticesPerRow + j;
          const d = (i + 1) * verticesPerRow + j + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
    } else if (shape === "pyramid") {
      const height = 1.5;
      const baseSize = 1;
      vertices.push(
        0, height, 0,
        -baseSize, -height, -baseSize,
        baseSize, -height, -baseSize,
        baseSize, -height, baseSize,
        -baseSize, -height, baseSize
      );
      indices.push(
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 1,
        1, 2, 3,
        1, 3, 4
      );
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }

  async function initThree() {
    const threeModule = await import("three");
    THREE = threeModule;
    const orbitModule = await import("three/examples/jsm/controls/OrbitControls.js");
    OrbitControls = orbitModule.OrbitControls;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);

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

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.enablePan = false;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 1.5, 50);
    pointLight1.position.set(-5, 3, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 1.5, 50);
    pointLight2.position.set(5, 3, 5);
    scene.add(pointLight2);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const renderTarget = pmremGenerator.fromScene(scene, 0.04);
    const envMap = renderTarget.texture;

    mirrorGroup = new THREE.Group();
    scene.add(mirrorGroup);

    const mirrorGeometry = new THREE.PlaneGeometry(4, 4, 8, 8);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 1.0,
      roughness: 0.05,
      envMap: envMap,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
    });

    const mirror1 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror1.rotation.y = Math.PI / 4;
    mirror1.position.set(-3, 2, -2);
    mirror1.castShadow = true;
    mirror1.receiveShadow = true;
    mirrorGroup.add(mirror1);

    const mirror2 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror2.rotation.y = -Math.PI / 4;
    mirror2.position.set(3, 2, -2);
    mirror2.castShadow = true;
    mirror2.receiveShadow = true;
    mirrorGroup.add(mirror2);

    const mirror3 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror3.rotation.y = Math.PI;
    mirror3.position.set(0, 2, -4);
    mirror3.castShadow = true;
    mirror3.receiveShadow = true;
    mirrorGroup.add(mirror3);

    const mirror4 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror4.rotation.x = Math.PI / 3;
    mirror4.position.set(-4, 4, 0);
    mirror4.castShadow = true;
    mirror4.receiveShadow = true;
    mirrorGroup.add(mirror4);

    const mirror5 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror5.rotation.x = -Math.PI / 3;
    mirror5.position.set(4, 4, 0);
    mirror5.castShadow = true;
    mirror5.receiveShadow = true;
    mirrorGroup.add(mirror5);

    for (let i = 0; i < 15; i++) {
      const shapes = ["cube", "sphere", "pyramid"];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const geometry = createLowPolyGeometry(shape, 4);
      
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          (i * 0.1) % 1,
          0.7,
          0.5 + Math.random() * 0.3
        ),
        metalness: 0.5 + Math.random() * 0.4,
        roughness: 0.1 + Math.random() * 0.2,
        envMap: envMap,
        envMapIntensity: 1.0 + Math.random() * 0.5,
        emissive: new THREE.Color().setHSL(
          (i * 0.1) % 1,
          0.7,
          0.1
        ),
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 3,
        (Math.random() - 0.5) * 8
      );
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      mesh.scale.setScalar(0.5 + Math.random() * 0.8);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      lowPolyObjects.push({
        mesh,
        basePosition: mesh.position.clone(),
        baseRotation: mesh.rotation.clone(),
        speed: 0.5 + Math.random() * 1.5,
        rotationSpeed: 0.01 + Math.random() * 0.02,
      });
      
      scene.add(mesh);
    }

    const floorGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2,
      envMap: envMap,
      envMapIntensity: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    pmremGenerator.dispose();

    animate();
  }

  function animate() {
    if (!renderer || !scene || !camera) return;
    animationFrame = requestAnimationFrame(animate);
    time += 0.01;

    lowPolyObjects.forEach((obj, index) => {
      const wave = Math.sin(time * obj.speed + index);
      const wave2 = Math.cos(time * obj.speed * 0.7 + index * 0.5);
      
      obj.mesh.position.y = obj.basePosition.y + wave * 0.5;
      obj.mesh.position.x = obj.basePosition.x + wave2 * 0.3;
      obj.mesh.position.z = obj.basePosition.z + Math.sin(time * obj.speed * 0.5 + index) * 0.3;
      
      obj.mesh.rotation.x += obj.rotationSpeed;
      obj.mesh.rotation.y += obj.rotationSpeed * 0.7;
      obj.mesh.rotation.z += obj.rotationSpeed * 0.3;
      
      const scale = 0.5 + wave * 0.2;
      obj.mesh.scale.setScalar(scale);
      
      if (obj.mesh.material) {
        obj.mesh.material.emissive.setHSL(
          (index * 0.1 + time * 0.1) % 1,
          0.7,
          0.1 + Math.abs(wave) * 0.1
        );
      }
    });

    mirrorGroup.rotation.y = time * 0.1;
    mirrorGroup.children.forEach((mirror, index) => {
      const mirrorWave = Math.sin(time * 0.3 + index);
      mirror.rotation.y += 0.002 * (index % 2 === 0 ? 1 : -1);
      mirror.rotation.x += mirrorWave * 0.001;
      mirror.position.y += mirrorWave * 0.05;
      
      if (mirror.material) {
        mirror.material.envMapIntensity = 1.5 + Math.sin(time + index) * 0.5;
      }
    });

    const cameraOrbit = time * 0.1;
    camera.position.x = Math.sin(cameraOrbit) * 3 + mouseX * 0.5;
    camera.position.y = 2 + Math.sin(time * 0.15) * 0.5 + mouseY * 0.2;
    camera.position.z = 8 + Math.cos(cameraOrbit) * 1.5 + mouseY * 0.3;
    camera.lookAt(
      Math.sin(time * 0.05) * 0.5,
      1 + Math.sin(time * 0.1) * 0.3,
      Math.cos(time * 0.05) * 0.5
    );

    controls.update();
    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 4;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 4;
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentSlide = (currentSlide + 1) % images.length;
    setTimeout(() => { isTransitioning = false; }, 600);
  }

  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentSlide = (currentSlide - 1 + images.length) % images.length;
    setTimeout(() => { isTransitioning = false; }, 600);
  }

  function goToSlide(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentSlide = index;
    setTimeout(() => { isTransitioning = false; }, 600);
  }

  onMount(() => {
    initThree();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (renderer) {
        renderer.dispose();
        if (canvasContainer && renderer.domElement.parentNode) {
          canvasContainer.removeChild(renderer.domElement);
        }
      }
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="page-container">
  <div bind:this={canvasContainer} class="canvas-container"></div>
  
  <div class="content-overlay">
    <header class="header">
      <h1 class="title">{title}</h1>
      <div class="subtitle">{duration}</div>
      <div class="theme-badge">{theme}</div>
      <a href="https://itch.io/jam/camgamejam2024" class="submissions-link">
        {submissions} {submissions === 1 ? "Submission" : "Submissions"}
      </a>
    </header>

    <div class="gallery-section">
      <div class="gallery-container">
        <div 
          class="gallery-track"
          style="transform: translateX(-{currentSlide * 100}%)"
        >
          {#each images as image, index}
            <div class="gallery-slide">
              <a href={image.link} target="_blank" rel="noopener noreferrer" class="slide-link">
                <div class="image-wrapper">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    class="gallery-image"
                    style="opacity: {index === currentSlide ? 1 : 0.3}; transform: scale({index === currentSlide ? 1 : 0.8})"
                  />
                  <div class="image-overlay">
                    <h2 class="image-title">{image.title}</h2>
                    {#if image.prize}
                      <div class="image-prize">{image.prize}</div>
                    {/if}
                  </div>
                </div>
              </a>
            </div>
          {/each}
        </div>
      </div>

      <div class="gallery-controls">
        <button class="nav-button prev" onclick={prevSlide} aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button class="nav-button next" onclick={nextSlide} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div class="gallery-indicators">
        {#each images as _, index}
          <button
            class="indicator"
            class:active={index === currentSlide}
            onclick={() => goToSlide(index)}
            aria-label="Go to slide {index + 1}"
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }

  .header {
    padding: 3rem 2rem 2rem;
    text-align: center;
    pointer-events: auto;
    background: linear-gradient(180deg, rgba(10, 10, 26, 0.9) 0%, rgba(10, 10, 26, 0) 100%);
  }

  .title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 900;
    background: linear-gradient(135deg, #4a9eff 0%, #ff6b9d 50%, #4a9eff 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    animation: gradientShift 3s ease infinite, fadeInDown 1s ease-out both;
    text-shadow: 0 0 30px rgba(74, 158, 255, 0.5);
    letter-spacing: -0.02em;
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .subtitle {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    animation: fadeInUp 1s ease-out 0.3s both;
  }

  @keyframes fadeInUp {
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
    display: inline-block;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.2) 0%, rgba(255, 107, 157, 0.2) 100%);
    border: 2px solid rgba(74, 158, 255, 0.5);
    border-radius: 50px;
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    color: #ffffff;
    font-weight: 600;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(74, 158, 255, 0.3);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(74, 158, 255, 0.3); }
    50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(74, 158, 255, 0.5); }
  }

  .submissions-link {
    display: inline-block;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: clamp(1rem, 2vw, 1.2rem);
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
  }

  .submissions-link:hover {
    color: #4a9eff;
    border-bottom-color: #4a9eff;
    transform: translateY(-2px);
  }

  .gallery-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    pointer-events: auto;
  }

  .gallery-container {
    width: 100%;
    max-width: 1200px;
    height: 60vh;
    overflow: hidden;
    border-radius: 20px;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 158, 255, 0.2);
    backdrop-filter: blur(10px);
    background: rgba(26, 26, 46, 0.3);
    border: 1px solid rgba(74, 158, 255, 0.2);
    animation: containerGlow 4s ease-in-out infinite;
  }

  @keyframes containerGlow {
    0%, 100% { 
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 158, 255, 0.2);
      border-color: rgba(74, 158, 255, 0.2);
    }
    50% { 
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 107, 157, 0.4);
      border-color: rgba(255, 107, 157, 0.4);
    }
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
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .slide-link {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .image-wrapper {
    position: relative;
    width: 90%;
    height: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gallery-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 15px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 10px 30px rgba(74, 158, 255, 0.3));
    animation: imageFloat 6s ease-in-out infinite;
  }

  @keyframes imageFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-10px) scale(1.02); }
  }

  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 26, 0.95) 100%);
    border-radius: 0 0 15px 15px;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(5px);
  }

  .image-wrapper:hover .image-overlay {
    opacity: 1;
  }

  .image-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #ffffff;
    margin-bottom: 0.5rem;
    font-weight: 700;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  }

  .image-prize {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #4a9eff;
    font-weight: 500;
  }

  .gallery-controls {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 1rem;
    pointer-events: none;
  }

  .nav-button {
    pointer-events: auto;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(26, 26, 46, 0.8);
    border: 2px solid rgba(74, 158, 255, 0.5);
    color: #4a9eff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 15px rgba(74, 158, 255, 0.2);
  }

  .nav-button:hover {
    background: rgba(74, 158, 255, 0.2);
    border-color: #4a9eff;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(74, 158, 255, 0.4);
  }

  .nav-button svg {
    width: 24px;
    height: 24px;
  }

  .gallery-indicators {
    display: flex;
    gap: 0.75rem;
    margin-top: 2rem;
    justify-content: center;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(74, 158, 255, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }

  .indicator:hover {
    transform: scale(1.3);
    border-color: #4a9eff;
  }

  .indicator.active {
    background: #4a9eff;
    border-color: #4a9eff;
    box-shadow: 0 0 15px rgba(74, 158, 255, 0.8);
    transform: scale(1.2);
  }

  @media (max-width: 768px) {
    .header {
      padding: 2rem 1rem 1.5rem;
    }

    .gallery-container {
      height: 50vh;
    }

    .nav-button {
      width: 40px;
      height: 40px;
    }

    .nav-button svg {
      width: 20px;
      height: 20px;
    }
  }
</style>