<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let container;
  let scene, camera, renderer;
  let mirrorObjects = [];
  let lowPolyObjects = [];
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

  onMount(() => {
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90e2, 1, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const mirrorGeometry = new THREE.PlaneGeometry(4, 4, 1, 1);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 1.0,
      roughness: 0.1,
      envMapIntensity: 1.0,
    });

    const mirror1 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror1.position.set(-3, 2, -2);
    mirror1.rotation.y = Math.PI / 4;
    scene.add(mirror1);
    mirrorObjects.push(mirror1);

    const mirror2 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror2.position.set(3, 2, -2);
    mirror2.rotation.y = -Math.PI / 4;
    scene.add(mirror2);
    mirrorObjects.push(mirror2);

    const mirror3 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror3.position.set(0, 2, -4);
    scene.add(mirror3);
    mirrorObjects.push(mirror3);

    const createLowPolyShape = (type) => {
      let geometry;
      if (type === "tetrahedron") {
        geometry = new THREE.TetrahedronGeometry(1, 0);
      } else if (type === "octahedron") {
        geometry = new THREE.OctahedronGeometry(1, 0);
      } else if (type === "dodecahedron") {
        geometry = new THREE.DodecahedronGeometry(1, 0);
      } else {
        geometry = new THREE.IcosahedronGeometry(1, 0);
      }

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        metalness: 0.8,
        roughness: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      return mesh;
    };

    for (let i = 0; i < 8; i++) {
      const shapes = ["tetrahedron", "octahedron", "dodecahedron", "icosahedron"];
      const shape = createLowPolyShape(
        shapes[Math.floor(Math.random() * shapes.length)]
      );
      shape.position.set(
        (Math.random() - 0.5) * 6,
        Math.random() * 4,
        (Math.random() - 0.5) * 4
      );
      shape.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      shape.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      };
      scene.add(shape);
      lowPolyObjects.push(shape);
    }

    const floorGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.3,
      roughness: 0.7,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    scene.add(floor);

    const renderScene = () => {
      lowPolyObjects.forEach((obj) => {
        obj.rotation.x += obj.userData.rotationSpeed.x;
        obj.rotation.y += obj.userData.rotationSpeed.y;
        obj.rotation.z += obj.userData.rotationSpeed.z;
      });

      mirrorObjects.forEach((mirror, index) => {
        mirror.rotation.y += 0.005 * (index % 2 === 0 ? 1 : -1);
      });

      camera.position.x = Math.sin(Date.now() * 0.0005) * 2;
      camera.lookAt(0, 1, 0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(renderScene);
    };

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);
    renderScene();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2024</title>
</svelte:head>

<div class="page-container">
  <div class="three-container" bind:this={container}></div>

  <div class="content-overlay">
    <div class="header-section">
      <img
        src="/2024/logo.png"
        alt="Cambridge Game Jam Logo"
        class="logo"
      />
      <h1 class="title">Cambridge Game Jam 2024</h1>
      <h2 class="date">9th - 11th February</h2>
      <div class="theme-badge">
        <span class="theme-text">Reflection</span>
      </div>
      <a
        href="https://itch.io/jam/camgamejam2024"
        class="submissions-link"
      >
        23 Submissions
      </a>
    </div>

    <div class="gallery-section">
      <h3 class="gallery-title">Featured Projects</h3>
      <div class="gallery-grid">
        {#each images as { src, alt, link, title, prize }}
          <a href={link} class="gallery-item" target="_blank" rel="noopener">
            <img {src} {alt} class="gallery-image" />
            <div class="gallery-overlay">
              <h4 class="gallery-item-title">{title}</h4>
              {#if prize}
                <p class="gallery-item-prize">{prize}</p>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </div>

    <div class="info-section">
      <p class="info-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </p>
      <p class="info-text">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </p>
    </div>

    <BackToMainButton />
  </div>
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
    height: 100vh;
    z-index: 0;
  }

  .content-overlay {
    position: relative;
    z-index: 10;
    background: linear-gradient(
      to bottom,
      rgba(26, 26, 46, 0.7) 0%,
      rgba(26, 26, 46, 0.9) 50%,
      rgba(26, 26, 46, 0.95) 100%
    );
    min-height: 100vh;
    padding: 2rem;
    color: #ffffff;
  }

  .header-section {
    text-align: center;
    padding: 4rem 2rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .logo {
    width: 200px;
    height: auto;
    margin: 0 auto 2rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }

  .title {
    font-size: 3.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    color: #ffffff;
  }

  .date {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #b8b8d4;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .theme-badge {
    display: inline-block;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
    border-radius: 50px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
  }

  .theme-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .submissions-link {
    display: inline-block;
    font-size: 1.25rem;
    color: #4a90e2;
    text-decoration: underline;
    transition: color 0.3s ease;
  }

  .submissions-link:hover {
    color: #7b68ee;
  }

  .gallery-section {
    max-width: 1200px;
    margin: 4rem auto;
    padding: 0 2rem;
  }

  .gallery-title {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 3rem;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    aspect-ratio: 16 / 9;
    background: rgba(42, 42, 62, 0.8);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .gallery-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
  }

  .gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .gallery-item:hover .gallery-image {
    transform: scale(1.05);
  }

  .gallery-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
    padding: 1.5rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .gallery-item:hover .gallery-overlay {
    transform: translateY(0);
  }

  .gallery-item-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #ffffff;
  }

  .gallery-item-prize {
    font-size: 0.9rem;
    color: #b8b8d4;
  }

  .info-section {
    max-width: 800px;
    margin: 4rem auto;
    padding: 2rem;
    background: rgba(42, 42, 62, 0.6);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .info-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #e0e0e0;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .title {
      font-size: 2.5rem;
    }

    .date {
      font-size: 1.5rem;
    }

    .gallery-grid {
      grid-template-columns: 1fr;
    }

    .content-overlay {
      padding: 1rem;
    }

    .header-section {
      padding: 2rem 1rem 1rem;
    }
  }
</style>