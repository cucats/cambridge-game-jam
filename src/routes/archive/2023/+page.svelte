<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

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

  let container;
  let scene, camera, renderer;
  let stalactites = [];
  let stalagmites = [];
  let particles;
  let crystals = [];
  let lights = [];
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let currentProject = $state(0);
  let projectVisible = $state(false);
  let animationFrameId;

  const createStalactite = (x, z, length, radius) => {
    const geometry = new THREE.ConeGeometry(radius, length, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3a2f2a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const stalactite = new THREE.Mesh(geometry, material);
    stalactite.position.set(x, 15, z);
    stalactite.rotation.z = Math.PI;
    stalactite.castShadow = true;
    stalactite.receiveShadow = true;
    return stalactite;
  };

  const createStalagmite = (x, z, height, radius) => {
    const geometry = new THREE.ConeGeometry(radius, height, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3a2f2a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const stalagmite = new THREE.Mesh(geometry, material);
    stalagmite.position.set(x, -15 + height / 2, z);
    stalagmite.castShadow = true;
    stalagmite.receiveShadow = true;
    return stalagmite;
  };

  const createCaveWall = () => {
    const wallGeometry = new THREE.PlaneGeometry(200, 100);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 0.95,
      metalness: 0.05,
    });
    const walls = [];

    const positions = [
      [0, 0, -50],
      [0, 0, 50],
      [-50, 0, 0],
      [50, 0, 0],
    ];
    const rotations = [
      [0, 0, 0],
      [0, Math.PI, 0],
      [0, Math.PI / 2, 0],
      [0, -Math.PI / 2, 0],
    ];

    positions.forEach((pos, i) => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.rotation.set(rotations[i][0], rotations[i][1], rotations[i][2]);
      wall.receiveShadow = true;
      walls.push(wall);
    });

    return walls;
  };

  const createParticleSystem = () => {
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 200;
      velocities[i] = (Math.random() - 0.5) * 0.03;
      velocities[i + 1] = Math.random() * 0.015 + 0.005;
      velocities[i + 2] = (Math.random() - 0.5) * 0.03;
      sizes[i / 3] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData.velocities = velocities;
    return particleSystem;
  };

  const createCrystal = (x, y, z) => {
    const geometry = new THREE.OctahedronGeometry(0.5, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffcc88,
      emissive: 0xffaa44,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7,
    });
    const crystal = new THREE.Mesh(geometry, material);
    crystal.position.set(x, y, z);
    crystal.castShadow = true;
    return crystal;
  };

  const initThreeJS = () => {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a0f0a, 10, 150);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x4a3a2a, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffaa44, 1.5, 100);
    pointLight1.position.set(-20, 10, 20);
    pointLight1.castShadow = true;
    scene.add(pointLight1);
    lights.push(pointLight1);

    const pointLight2 = new THREE.PointLight(0xaa8844, 1.2, 100);
    pointLight2.position.set(20, -10, -20);
    pointLight2.castShadow = true;
    scene.add(pointLight2);
    lights.push(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffcc88, 1, 80);
    pointLight3.position.set(0, 5, 0);
    pointLight3.castShadow = true;
    scene.add(pointLight3);
    lights.push(pointLight3);

    const spotLight = new THREE.SpotLight(0xffcc88, 2.5, 100, Math.PI / 5, 0.6);
    spotLight.position.set(0, 20, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);
    lights.push(spotLight);

    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      const length = Math.random() * 8 + 4;
      const radius = Math.random() * 2 + 1;
      const stalactite = createStalactite(x, z, length, radius);
      scene.add(stalactite);
      stalactites.push(stalactite);
    }

    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      const height = Math.random() * 6 + 3;
      const radius = Math.random() * 2 + 1;
      const stalagmite = createStalagmite(x, z, height, radius);
      scene.add(stalagmite);
      stalagmites.push(stalagmite);
    }

    const walls = createCaveWall();
    walls.forEach((wall) => scene.add(wall));

    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0f0a,
      roughness: 0.95,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -15;
    floor.receiveShadow = true;
    scene.add(floor);

    particles = createParticleSystem();
    scene.add(particles);

    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 60;
      const crystal = createCrystal(x, y, z);
      scene.add(crystal);
      crystals.push(crystal);
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      stalactites.forEach((stalactite, i) => {
        stalactite.rotation.z = Math.PI + Math.sin(time * 0.8 + i) * 0.08;
        stalactite.position.y = 15 + Math.sin(time * 0.6 + i) * 0.8;
        stalactite.rotation.x = Math.sin(time * 0.4 + i) * 0.05;
      });

      stalagmites.forEach((stalagmite, i) => {
        stalagmite.rotation.z = Math.sin(time * 0.9 + i) * 0.08;
        const baseY = -15 + stalagmite.geometry.parameters.height / 2;
        stalagmite.position.y = baseY + Math.sin(time * 0.7 + i) * 0.5;
        stalagmite.rotation.x = Math.cos(time * 0.5 + i) * 0.05;
      });

      crystals.forEach((crystal, i) => {
        crystal.rotation.x += 0.01 + i * 0.001;
        crystal.rotation.y += 0.015 + i * 0.001;
        crystal.position.y += Math.sin(time * 1.2 + i) * 0.02;
        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
        crystal.material.emissiveIntensity = pulse * 0.8;
        crystal.scale.setScalar(0.8 + Math.sin(time * 1.5 + i) * 0.2);
      });

      lights.forEach((light, i) => {
        if (light.type === "PointLight") {
          light.intensity = 1 + Math.sin(time * 1.5 + i) * 0.5;
          light.position.x += Math.sin(time * 0.5 + i) * 0.1;
          light.position.y += Math.cos(time * 0.7 + i) * 0.1;
        }
      });

      const positions = particles.geometry.attributes.position.array;
      const velocities = particles.userData.velocities;
      const sizes = particles.geometry.attributes.size.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        if (Math.abs(positions[i]) > 100) velocities[i] *= -1;
        if (positions[i + 1] > 50 || positions[i + 1] < -50)
          velocities[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 100) velocities[i + 2] *= -1;

        sizes[i / 3] = 0.5 + Math.sin(time * 2 + i) * 0.5;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.size.needsUpdate = true;

      const targetX = mouseX * 2;
      const targetY = -mouseY * 2 + scrollY * 0.2;
      camera.position.x += (targetX - camera.position.x) * 0.08;
      camera.position.y += (targetY - camera.position.y) * 0.08;
      camera.position.z = 30 + Math.sin(time * 0.3) * 2;
      camera.lookAt(mouseX, scrollY * 0.1 - mouseY, 0);

      renderer.render(scene, camera);
    };

    animate();
  };

  const handleMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  const handleScroll = () => {
    scrollY = window.scrollY;
  };

  const nextProject = () => {
    projectVisible = false;
    setTimeout(() => {
      currentProject = (currentProject + 1) % images.length;
      projectVisible = true;
    }, 300);
  };

  const prevProject = () => {
    projectVisible = false;
    setTimeout(() => {
      currentProject = (currentProject - 1 + images.length) % images.length;
      projectVisible = true;
    }, 300);
  };

  onMount(() => {
    if (container) {
      initThreeJS();
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("scroll", handleScroll);
      projectVisible = true;

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (renderer) {
          renderer.dispose();
        }
      };
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="fixed inset-0 z-0" bind:this={container}></div>

<div class="relative z-10 min-h-screen">
  <section class="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <div
      class="mb-8 transform transition-all duration-1000"
      style="opacity: {projectVisible ? 1 : 0}; transform: translateY({projectVisible ? 0 : 20}px)"
    >
      <img
        src="/2023/logo.png"
        alt="Cambridge Game Jam Logo"
        class="mx-auto mb-6 w-48 h-48 sm:w-64 sm:h-64 drop-shadow-2xl animate-pulse"
      />
    </div>
    <h1
      class="text-5xl sm:text-7xl font-bold mb-4 text-amber-100 drop-shadow-lg transform transition-all duration-1000"
      style="opacity: {projectVisible ? 1 : 0}; transform: translateY({projectVisible ? 0 : 30}px) scale({projectVisible ? 1 : 0.9})"
    >
      {title}
    </h1>
    <h2
      class="text-2xl sm:text-4xl mb-6 text-amber-200 drop-shadow-md transform transition-all duration-1000 delay-100"
      style="opacity: {projectVisible ? 1 : 0}; transform: translateY({projectVisible ? 0 : 30}px)"
    >
      {duration}
    </h2>
    <div
      class="mb-8 transform transition-all duration-1000 delay-200"
      style="opacity: {projectVisible ? 1 : 0}; transform: translateY({projectVisible ? 0 : 30}px)"
    >
      <span class="text-xl sm:text-3xl text-amber-300 font-semibold px-6 py-3 bg-amber-900/40 backdrop-blur-sm rounded-full border-2 border-amber-700/50 shadow-xl">
        {theme}
      </span>
    </div>
    <a
      href="https://itch.io/jam/camgamejam2023"
      class="text-lg sm:text-xl text-amber-200 underline hover:text-amber-100 transition-colors transform transition-all duration-1000 delay-300"
      style="opacity: {projectVisible ? 1 : 0}; transform: translateY({projectVisible ? 0 : 30}px)"
    >
      {submissions} {submissions == 1 ? "Submission" : "Submissions"}
    </a>
  </section>

  <section class="min-h-screen flex items-center justify-center px-4 py-20">
    <div class="max-w-6xl w-full">
      <h2
        class="text-4xl sm:text-5xl font-bold text-center mb-12 text-amber-100 drop-shadow-lg"
      >
        Featured Projects
      </h2>

      <div class="relative">
        <div
          class="flex transition-transform duration-500 ease-in-out"
          style="transform: translateX(-{currentProject * 100}%)"
        >
          {#each images as { src, alt, link, title: projectTitle, prize }, index}
            <div class="w-full shrink-0 px-4">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                class="block group"
              >
                <div
                  class="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-[1.02] perspective-1000"
                  style="opacity: {projectVisible ? 1 : 0.2}; transform: scale({projectVisible && index === currentProject ? 1 : 0.88}) rotateY({index === currentProject ? 0 : index < currentProject ? -15 : 15}deg) rotateX({index === currentProject ? 0 : 5}deg); transform-style: preserve-3d;"
                >
                  <div class="absolute inset-0 bg-gradient-to-br from-amber-900/70 via-amber-800/50 to-amber-900/70 backdrop-blur-md z-10 transition-opacity duration-700" style="opacity: {index === currentProject ? 1 : 0.6}"></div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-15"></div>
                  <img
                    {src}
                    {alt}
                    class="w-full h-96 object-cover mix-blend-overlay opacity-90 group-hover:opacity-100 transition-all duration-700 transform"
                    style="filter: brightness({index === currentProject ? 0.85 : 0.6}) contrast({index === currentProject ? 1.3 : 1.1}) saturate({index === currentProject ? 1.2 : 0.9}); transform: scale({index === currentProject ? 1.05 : 1}) translateZ({index === currentProject ? 10 : 0}px);"
                  />
                  <div
                    class="absolute inset-0 flex flex-col items-center justify-center z-20 p-8 text-center transform transition-all duration-700"
                    style="transform: translateY({index === currentProject ? 0 : 30}px) translateZ({index === currentProject ? 20 : 0}px); opacity: {index === currentProject ? 1 : 0.4}"
                  >
                    <h3
                      class="text-3xl sm:text-4xl font-bold mb-4 text-amber-100 drop-shadow-2xl transform transition-all duration-700"
                      style="transform: scale({index === currentProject ? 1 : 0.85}) translateZ(30px); text-shadow: 0 0 20px rgba(251, 191, 36, {index === currentProject ? 0.8 : 0.3})"
                    >
                      {projectTitle}
                    </h3>
                    {#if prize}
                      <p
                        class="text-xl sm:text-2xl text-amber-200 drop-shadow-lg bg-amber-900/70 px-6 py-2 rounded-full backdrop-blur-md border-2 border-amber-600/60 transform transition-all duration-700 delay-100"
                        style="transform: translateY({index === currentProject ? 0 : 15}px) translateZ(20px); box-shadow: {index === currentProject ? '0 0 30px rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.3)' : 'none'}"
                      >
                        {prize}
                      </p>
                    {/if}
                  </div>
                  <div
                    class="absolute inset-0 border-2 border-amber-500/40 rounded-2xl z-30 pointer-events-none transform transition-all duration-700"
                    style="opacity: {index === currentProject ? 1 : 0}; box-shadow: {index === currentProject ? '0 0 60px rgba(251, 191, 36, 0.7), inset 0 0 60px rgba(251, 191, 36, 0.3), 0 0 120px rgba(251, 191, 36, 0.4)' : 'none'}; transform: translateZ(5px);"
                  ></div>
                  <div
                    class="absolute inset-0 rounded-2xl z-25 pointer-events-none"
                    style="background: radial-gradient(circle at center, transparent 0%, rgba(251, 191, 36, {index === currentProject ? 0.15 : 0}) 100%); opacity: {index === currentProject ? 1 : 0}; transition: opacity 0.7s"
                  ></div>
                </div>
              </a>
            </div>
          {/each}
        </div>

        <button
          onclick={prevProject}
          class="absolute left-4 top-1/2 -translate-y-1/2 bg-amber-900/90 hover:bg-amber-800/95 text-amber-100 p-5 rounded-full shadow-2xl backdrop-blur-md border-2 border-amber-600/60 transition-all duration-300 hover:scale-125 z-40 group"
          style="box-shadow: 0 0 20px rgba(251, 191, 36, 0.5)"
          aria-label="Previous project"
        >
          <svg
            class="w-6 h-6 transform transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <button
          onclick={nextProject}
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-900/90 hover:bg-amber-800/95 text-amber-100 p-5 rounded-full shadow-2xl backdrop-blur-md border-2 border-amber-600/60 transition-all duration-300 hover:scale-125 z-40 group"
          style="box-shadow: 0 0 20px rgba(251, 191, 36, 0.5)"
          aria-label="Next project"
        >
          <svg
            class="w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>

        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-40">
          {#each images as _, index}
            {@const boxShadow = index === currentProject ? '0 0 15px rgba(251, 191, 36, 0.8), 0 0 30px rgba(251, 191, 36, 0.4)' : '0 0 5px rgba(251, 191, 36, 0.3)'}
            <button
              onclick={() => {
                projectVisible = false;
                setTimeout(() => {
                  currentProject = index;
                  projectVisible = true;
                }, 300);
              }}
              class="rounded-full transition-all duration-500 shadow-xl hover:scale-150"
              class:w-4={index === currentProject}
              class:h-4={index === currentProject}
              class:w-3={index !== currentProject}
              class:h-3={index !== currentProject}
              class:bg-amber-200={index === currentProject}
              class:bg-amber-600={index !== currentProject}
              class:opacity-60={index !== currentProject}
              style:box-shadow={boxShadow}
              aria-label="Go to project {index + 1}"
            ></button>
          {/each}
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(body) {
    background: #1a0f0a;
    overflow-x: hidden;
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

  .animate-pulse {
    animation: pulse 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .perspective-1000 {
    perspective: 1000px;
  }
</style>
