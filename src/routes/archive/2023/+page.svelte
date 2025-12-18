<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let canvasContainer;
  let scene, camera, renderer;
  let caveGeometry, caveMaterial, caveMesh;
  let particles, particleSystem;
  let stalactites = [];
  let crystals = [];
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let animationFrameId;

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

  onMount(() => {
    if (canvasContainer) {
      initThree();
      animate();
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
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
    };
  });

  function initThree() {
    if (!canvasContainer) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 20);

    renderer = new THREE.WebGLRenderer({
      canvas: canvasContainer,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const caveGroup = new THREE.Group();

    const createCaveWall = (width, height, depth, position, rotation) => {
      const geometry = new THREE.PlaneGeometry(width, height, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.95,
        metalness: 0.05,
      });

      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        const noise =
          Math.sin(x * 0.3) *
            Math.cos(y * 0.3) *
            Math.sin((x + y) * 0.2) *
            0.5 +
          Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.3;
        positions[i + 2] = z + noise * 2;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.rotation.copy(rotation);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      return mesh;
    };

    const floor = createCaveWall(
      60,
      60,
      0,
      new THREE.Vector3(0, -10, 0),
      new THREE.Euler(-Math.PI / 2, 0, 0)
    );
    caveGroup.add(floor);

    const ceiling = createCaveWall(
      60,
      60,
      0,
      new THREE.Vector3(0, 10, 0),
      new THREE.Euler(Math.PI / 2, 0, 0)
    );
    caveGroup.add(ceiling);

    const leftWall = createCaveWall(
      60,
      20,
      0,
      new THREE.Vector3(-15, 0, 0),
      new THREE.Euler(0, Math.PI / 2, 0)
    );
    caveGroup.add(leftWall);

    const rightWall = createCaveWall(
      60,
      20,
      0,
      new THREE.Vector3(15, 0, 0),
      new THREE.Euler(0, -Math.PI / 2, 0)
    );
    caveGroup.add(rightWall);

    const backWall = createCaveWall(
      30,
      20,
      0,
      new THREE.Vector3(0, 0, -30),
      new THREE.Euler(0, 0, 0)
    );
    caveGroup.add(backWall);

    scene.add(caveGroup);

    for (let i = 0; i < 40; i++) {
      const length = 1.5 + Math.random() * 3;
      const radius = 0.2 + Math.random() * 0.4;
      const segments = 8;
      const stalactiteGeometry = new THREE.ConeGeometry(radius, length, segments);
      const stalactiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d44,
        roughness: 0.9,
        metalness: 0.1,
      });
      const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
      stalactite.position.set(
        (Math.random() - 0.5) * 28,
        9 - length / 2 + Math.random() * 0.5,
        (Math.random() - 0.5) * 50 - 10
      );
      stalactite.rotation.x = (Math.random() - 0.5) * 0.3;
      stalactite.rotation.z = (Math.random() - 0.5) * 0.3;
      stalactite.castShadow = true;
      stalactite.receiveShadow = true;
      scene.add(stalactite);
      stalactites.push({
        mesh: stalactite,
        baseY: stalactite.position.y,
        phase: Math.random() * Math.PI * 2,
      });
    }

    for (let i = 0; i < 25; i++) {
      const length = 1 + Math.random() * 2.5;
      const radius = 0.15 + Math.random() * 0.35;
      const stalagmiteGeometry = new THREE.ConeGeometry(radius, length, 8);
      const stalagmiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d44,
        roughness: 0.9,
        metalness: 0.1,
      });
      const stalagmite = new THREE.Mesh(stalagmiteGeometry, stalagmiteMaterial);
      stalagmite.position.set(
        (Math.random() - 0.5) * 28,
        -10 + length / 2 + Math.random() * 0.5,
        (Math.random() - 0.5) * 50 - 10
      );
      stalagmite.rotation.x = Math.PI + (Math.random() - 0.5) * 0.3;
      stalagmite.rotation.z = (Math.random() - 0.5) * 0.3;
      stalagmite.castShadow = true;
      stalagmite.receiveShadow = true;
      scene.add(stalagmite);
      stalactites.push({
        mesh: stalagmite,
        baseY: stalagmite.position.y,
        phase: Math.random() * Math.PI * 2,
      });
    }

    for (let i = 0; i < 30; i++) {
      const size = 0.15 + Math.random() * 0.4;
      const crystalGeometry = new THREE.OctahedronGeometry(size, 0);
      const hue = 0.55 + Math.random() * 0.15;
      const crystalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, 0.9, 0.4 + Math.random() * 0.3),
        roughness: 0.1,
        metalness: 0.9,
        emissive: new THREE.Color().setHSL(hue, 0.8, 0.2),
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set(
        (Math.random() - 0.5) * 28,
        -8 + Math.random() * 16,
        (Math.random() - 0.5) * 50 - 10
      );
      crystal.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      crystal.castShadow = true;
      scene.add(crystal);
      crystals.push({
        mesh: crystal,
        baseY: crystal.position.y,
        phase: Math.random() * Math.PI * 2,
        rotationSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    const particleCount = 800;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 60 - 10;

      const hue = 0.55 + Math.random() * 0.15;
      const color = new THREE.Color().setHSL(
        hue,
        0.6,
        0.2 + Math.random() * 0.5
      );
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;

      sizes[i / 3] = 0.05 + Math.random() * 0.15;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4a90e2, 2, 80);
    pointLight1.position.set(12, 6, 8);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 1024;
    pointLight1.shadow.mapSize.height = 1024;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7b68ee, 2, 80);
    pointLight2.position.set(-12, 6, -8);
    pointLight2.castShadow = true;
    pointLight2.shadow.mapSize.width = 1024;
    pointLight2.shadow.mapSize.height = 1024;
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x5f9ea0, 1.5, 100);
    pointLight3.position.set(0, -8, 0);
    pointLight3.castShadow = true;
    scene.add(pointLight3);

    const spotLight = new THREE.SpotLight(0xffffff, 1.5, 100, Math.PI / 6, 0.5);
    spotLight.position.set(0, 15, 20);
    spotLight.target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    stalactites.forEach((item, i) => {
      const { mesh, baseY, phase } = item;
      mesh.rotation.x += Math.sin(time * 0.5 + phase) * 0.0005;
      mesh.rotation.z += Math.cos(time * 0.5 + phase) * 0.0005;
      mesh.position.y = baseY + Math.sin(time * 1.2 + phase) * 0.15;
      mesh.scale.y = 1 + Math.sin(time * 1.5 + phase) * 0.05;
    });

    crystals.forEach((item, i) => {
      const { mesh, baseY, phase, rotationSpeed } = item;
      mesh.rotation.x += rotationSpeed + Math.sin(time + phase) * 0.003;
      mesh.rotation.y += rotationSpeed + Math.cos(time + phase) * 0.003;
      mesh.rotation.z += rotationSpeed * 0.7;
      mesh.position.y = baseY + Math.sin(time * 1.8 + phase) * 0.3;
      const pulse = Math.sin(time * 2.5 + phase) * 0.4 + 0.6;
      mesh.material.emissiveIntensity = pulse * 0.8;
      const scale = 1 + Math.sin(time * 2 + phase) * 0.1;
      mesh.scale.set(scale, scale, scale);
    });

    if (particleSystem) {
      const positions = particleSystem.geometry.attributes.position.array;
      const sizes = particleSystem.geometry.attributes.size.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time * 0.8 + i * 0.01) * 0.02;
        positions[i] += Math.cos(time * 0.6 + i * 0.01) * 0.01;
        if (positions[i + 1] > 15) positions[i + 1] = -15;
        if (positions[i + 1] < -15) positions[i + 1] = 15;
        sizes[i / 3] = 0.05 + Math.sin(time * 2 + i * 0.1) * 0.1;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.size.needsUpdate = true;
      particleSystem.rotation.y += 0.0003;
      particleSystem.rotation.x += 0.0002;
    }

    const targetX = mouseX * 0.02;
    const targetY = mouseY * 0.02 + 3 + scrollY * 0.01;
    const targetZ = 20 - scrollY * 0.05;

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    const lookAtY = scrollY * 0.01;
    camera.lookAt(0, lookAtY, 0);

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 10;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 10;
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#16213e]">
  <canvas
    bind:this={canvasContainer}
    class="fixed top-0 left-0 w-full h-full z-0"
  ></canvas>

  <div class="relative z-10">
    <div class="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div
        class="text-center mb-16 transform transition-all duration-1000 hero-content"
        style="transform: translateY({scrollY * 0.5}px)"
      >
        <h1
          class="text-7xl md:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 title-glow"
          style="text-shadow: 0 0 20px rgba(79, 172, 254, 0.5), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(96, 165, 250, 0.2); animation: titlePulse 3s ease-in-out infinite;"
        >
          {title}
        </h1>
        <div
          class="text-3xl md:text-5xl text-cyan-300 mb-4 font-light duration-text"
          style="text-shadow: 0 0 15px rgba(103, 232, 249, 0.4), 0 0 30px rgba(103, 232, 249, 0.2); animation: fadeInUp 1s ease-out 0.3s both;"
        >
          {duration}
        </div>
        <div
          class="text-4xl md:text-6xl text-purple-300 mb-8 font-bold theme-text"
          style="text-shadow: 0 0 15px rgba(196, 181, 253, 0.6), 0 0 30px rgba(196, 181, 253, 0.3); animation: fadeInUp 1s ease-out 0.6s both;"
        >
          {theme}
        </div>
        <a
          href="https://itch.io/jam/camgamejam2023"
          class="inline-block text-xl md:text-2xl text-blue-300 hover:text-cyan-200 transition-all duration-300 underline decoration-2 underline-offset-4 hover:decoration-cyan-400 submissions-link"
          style="text-shadow: 0 0 10px rgba(147, 197, 253, 0.5); animation: fadeInUp 1s ease-out 0.9s both;"
        >
          {submissions} {submissions == 1 ? "Submission" : "Submissions"}
        </a>
      </div>
    </div>

    <div class="relative z-10 py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <h2
          class="text-5xl md:text-7xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 featured-title"
          style="text-shadow: 0 0 30px rgba(96, 165, 250, 0.4), 0 0 60px rgba(139, 92, 246, 0.2); animation: fadeInUp 1s ease-out 1.2s both;"
        >
          Featured Projects
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {#each images.slice(0, 5) as { src, alt, link, title, prize }, index}
            <a
              href={link}
              class="group relative block overflow-hidden rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] project-card"
              style="animation: fadeInUp 0.8s ease-out {1.5 + index * 0.1}s both;"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>
              <div
                class="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-700"
              ></div>
              <div class="relative p-6">
                <div class="aspect-video mb-4 overflow-hidden rounded-lg bg-black/50 relative">
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                  ></div>
                  <img
                    {src}
                    {alt}
                    class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3
                  class="text-2xl font-bold mb-2 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300"
                  style="text-shadow: 0 0 10px rgba(103, 232, 249, 0.4), 0 0 20px rgba(103, 232, 249, 0.2);"
                >
                  {title}
                </h3>
                {#if prize}
                  <p
                    class="text-lg text-purple-300 group-hover:text-purple-200 transition-colors duration-300"
                    style="text-shadow: 0 0 8px rgba(196, 181, 253, 0.3), 0 0 16px rgba(196, 181, 253, 0.15);"
                  >
                    {prize}
                  </p>
                {/if}
              </div>
              <div
                class="absolute inset-0 border-2 border-cyan-400/0 group-hover:border-cyan-400/50 rounded-lg transition-all duration-500"
              ></div>
              <div
                class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10"
              ></div>
            </a>
          {/each}
        </div>

        <div
          class="text-center mb-20 all-submissions-button"
          style="animation: fadeInUp 0.8s ease-out 2.2s both;"
        >
          <a
            href={images[5].link}
            class="inline-block group relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-12 py-6 text-2xl font-bold text-white transform transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(139,92,246,0.8)] button-glow"
            style="text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(96, 165, 250, 0.2);"
          >
            <span class="relative z-10">{images[5].title}</span>
            <div
              class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
          </a>
        </div>
      </div>
    </div>

    <div class="relative z-10 pb-20">
      <BackToMainButton />
    </div>
  </div>
</div>

<style>
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

  @keyframes titlePulse {
    0%,
    100% {
      filter: brightness(1) drop-shadow(0 0 20px rgba(79, 172, 254, 0.5))
        drop-shadow(0 0 40px rgba(139, 92, 246, 0.3));
    }
    50% {
      filter: brightness(1.2) drop-shadow(0 0 30px rgba(79, 172, 254, 0.7))
        drop-shadow(0 0 60px rgba(139, 92, 246, 0.5));
    }
  }

  .hero-content {
    animation: fadeInUp 1s ease-out;
  }

  .project-card:hover {
    animation: cardFloat 2s ease-in-out infinite;
  }

  @keyframes cardFloat {
    0%,
    100% {
      transform: translateY(0) scale(1.05);
    }
    50% {
      transform: translateY(-5px) scale(1.05);
    }
  }

  .button-glow:hover {
    animation: buttonPulse 1.5s ease-in-out infinite;
  }

  @keyframes buttonPulse {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(96, 165, 250, 0.2),
        0 0 40px rgba(139, 92, 246, 0.8);
    }
    50% {
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), inset 0 0 30px rgba(96, 165, 250, 0.3),
        0 0 60px rgba(139, 92, 246, 1);
    }
  }
</style>
