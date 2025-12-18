<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let canvasContainer;
  let scene, camera, renderer;
  let mirrorPlane, mirrorCamera, mirrorRenderTarget;
  let objects = [];
  let animationId;

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

  let currentIndex = $state(0);

  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % images.length;
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  };

  function createLowPolyGeometry() {
    const geometry = new THREE.OctahedronGeometry(1, 0);
    const position = geometry.attributes.position;
    const count = position.count;

    for (let i = 0; i < count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const noise = 0.15;
      position.setX(i, x + (Math.random() - 0.5) * noise);
      position.setY(i, y + (Math.random() - 0.5) * noise);
      position.setZ(i, z + (Math.random() - 0.5) * noise);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }

  function initThree() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90e2, 1, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const mirrorGeometry = new THREE.PlaneGeometry(15, 15);
    mirrorRenderTarget = new THREE.WebGLRenderTarget(1024, 1024);
    mirrorRenderTarget.texture.flipY = false;
    mirrorCamera = new THREE.PerspectiveCamera(
      75,
      1,
      0.1,
      1000
    );

    const mirrorMaterial = new THREE.MeshStandardMaterial({
      map: mirrorRenderTarget.texture,
      metalness: 0.95,
      roughness: 0.05,
    });

    mirrorPlane = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane.rotation.x = -Math.PI / 2;
    mirrorPlane.position.y = -2;
    scene.add(mirrorPlane);

    for (let i = 0; i < 8; i++) {
      const geometry = createLowPolyGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          (i * 0.1) % 1,
          0.7,
          0.6
        ),
        metalness: 0.3,
        roughness: 0.7,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 3;
      mesh.position.set(
        Math.cos(angle) * radius,
        2 + Math.sin(i * 0.5) * 1.5,
        Math.sin(angle) * radius
      );
      mesh.scale.setScalar(0.8 + Math.random() * 0.4);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(mesh);
      objects.push(mesh);
    }

    function animate() {
      animationId = requestAnimationFrame(animate);

      objects.forEach((obj, i) => {
        obj.rotation.x += 0.005;
        obj.rotation.y += 0.01;
        obj.position.y = 2 + Math.sin(Date.now() * 0.001 + i) * 1.5;
      });

      const mirrorY = -2;
      const distanceToMirror = camera.position.y - mirrorY;
      mirrorCamera.position.copy(camera.position);
      mirrorCamera.position.y = mirrorY - distanceToMirror;
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
      mirrorCamera.rotation.set(-euler.x, euler.y, -euler.z);

      const currentRenderTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(mirrorRenderTarget);
      renderer.render(scene, mirrorCamera);
      renderer.setRenderTarget(currentRenderTarget);

      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", handleResize);
  }

  onMount(() => {
    if (canvasContainer) {
      initThree();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (renderer) {
        renderer.dispose();
      }
      window.removeEventListener("resize", () => {});
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2024</title>
</svelte:head>

<div class="page-container">
  <div class="three-container" bind:this={canvasContainer}></div>

  <div class="content-overlay">
    <div class="header-section">
      <img
        src="/2024/logo.png"
        alt="Cambridge Game Jam Logo"
        class="logo"
      />
      <h1 class="title">Cambridge Game Jam 2024</h1>
      <h2 class="date">9th - 11th February</h2>
      <div class="theme-badge">Reflection</div>
      <a
        href="https://itch.io/jam/camgamejam2024"
        class="submissions-link"
      >
        23 Submissions
      </a>
    </div>

    <div class="gallery-section">
      <div
        class="gallery-track"
        style="transform: translateX(-{currentIndex * 100}%)"
      >
        {#each images as { src, alt, link, title, prize }, index}
          <div class="gallery-slide">
            <a href={link} class="slide-link">
              <img src={src} alt={alt} class="slide-image" />
              <div class="slide-overlay">
                <h3 class="slide-title">{title}</h3>
                {#if prize}
                  <p class="slide-prize">{prize}</p>
                {/if}
              </div>
            </a>
          </div>
        {/each}
      </div>

      <button class="nav-button nav-prev" onclick={prevSlide}>
        ←
      </button>
      <button class="nav-button nav-next" onclick={nextSlide}>
        →
      </button>

      <div class="indicators">
        {#each images as _, index}
          <button
            class="indicator"
            class:active={index === currentIndex}
            onclick={() => (currentIndex = index)}
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    </div>

    <div class="info-section">
      <p class="info-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </p>
    </div>
  </div>

  <BackToMainButton />
</div>

<style>
  .page-container {
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
    height: 100%;
    z-index: 0;
  }

  .content-overlay {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    background: linear-gradient(
      to bottom,
      rgba(26, 26, 46, 0.3) 0%,
      rgba(26, 26, 46, 0.7) 50%,
      rgba(26, 26, 46, 0.9) 100%
    );
    backdrop-filter: blur(1px);
  }

  .header-section {
    padding: 4rem 2rem 2rem;
    text-align: center;
    color: white;
  }

  .logo {
    width: 200px;
    height: 200px;
    margin: 0 auto 2rem;
    filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3));
  }

  .title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .date {
    font-size: 2rem;
    font-weight: 400;
    margin-bottom: 1.5rem;
    opacity: 0.9;
  }

  .theme-badge {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: rgba(74, 144, 226, 0.3);
    border: 2px solid rgba(74, 144, 226, 0.6);
    border-radius: 50px;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(10px);
  }

  .submissions-link {
    display: inline-block;
    color: white;
    text-decoration: underline;
    font-size: 1.25rem;
    transition: opacity 0.3s;
  }

  .submissions-link:hover {
    opacity: 0.7;
  }

  .gallery-section {
    position: relative;
    margin: 4rem 0;
    overflow: hidden;
  }

  .gallery-track {
    display: flex;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .gallery-slide {
    min-width: 100%;
    flex-shrink: 0;
  }

  .slide-link {
    display: block;
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
  }

  .slide-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }

  .slide-link:hover .slide-image {
    transform: scale(1.05);
  }

  .slide-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
    padding: 2rem;
    color: white;
  }

  .slide-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .slide-prize {
    font-size: 1.25rem;
    opacity: 0.9;
  }

  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.4);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 20;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .nav-prev {
    left: 2rem;
  }

  .nav-next {
    right: 2rem;
  }

  .indicators {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-bottom: 2rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s;
  }

  .indicator.active {
    background: white;
    border-color: white;
  }

  .indicator:hover {
    border-color: white;
  }

  .info-section {
    padding: 3rem 2rem;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    color: white;
  }

  .info-text {
    font-size: 1.125rem;
    line-height: 1.8;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .title {
      font-size: 2.5rem;
    }

    .date {
      font-size: 1.5rem;
    }

    .theme-badge {
      font-size: 1.25rem;
      padding: 0.5rem 1.5rem;
    }

    .slide-overlay {
      padding: 1.5rem;
    }

    .slide-title {
      font-size: 1.5rem;
    }

    .slide-prize {
      font-size: 1rem;
    }

    .nav-button {
      width: 40px;
      height: 40px;
      font-size: 1.25rem;
    }

    .nav-prev {
      left: 1rem;
    }

    .nav-next {
      right: 1rem;
    }
  }
</style>
