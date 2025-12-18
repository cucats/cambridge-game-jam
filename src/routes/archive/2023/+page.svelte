<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvas;
  let scrollProgress = $state(0);
  let isLoaded = $state(false);

  const projects = [
    {
      title: "Inferno Rising",
      prize: "Popular Vote",
      src: "/2023/inferno-rising.png",
      link: "https://firedemon111.itch.io/inferno-rising",
    },
    {
      title: "MAYI Garden",
      prize: "Best for Theme",
      src: "/2023/mayi-garden.png",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
    },
    {
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      src: "/2023/rhythm-mythril-fever.png",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
    },
    {
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      src: "/2023/beaneth-the-earth.png",
      link: "https://mxbi.itch.io/beaneth-the-earth",
    },
    {
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      src: "/2023/deck-of-dwarves.png",
      link: "https://joeoc.itch.io/deck-of-dwarves",
    },
  ];

  onMount(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a15, 0.015);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const crystalGeometry = new THREE.OctahedronGeometry(1, 0);
    const crystals = [];

    for (let i = 0; i < 30; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.7, 0.5),
        emissive: new THREE.Color().setHSL(
          0.55 + Math.random() * 0.1,
          0.5,
          0.3
        ),
        shininess: 100,
        transparent: true,
        opacity: 0.8,
      });

      const crystal = new THREE.Mesh(crystalGeometry, material);
      crystal.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crystal.scale.set(
        0.2 + Math.random() * 0.3,
        0.5 + Math.random() * 0.8,
        0.2 + Math.random() * 0.3
      );
      crystal.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      };
      crystal.userData.floatSpeed = Math.random() * 0.02 + 0.01;
      crystal.userData.floatOffset = Math.random() * Math.PI * 2;
      scene.add(crystal);
      crystals.push(crystal);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.8, 0.6);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6699ff, 2, 50);
    pointLight1.position.set(10, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x9966ff, 2, 50);
    pointLight2.position.set(-10, -5, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x66ffcc, 1.5, 40);
    pointLight3.position.set(0, 10, -5);
    scene.add(pointLight3);

    const stalactiteGeometry = new THREE.ConeGeometry(0.3, 2, 8);
    const stalactiteMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a2a4a,
      shininess: 30,
    });

    for (let i = 0; i < 20; i++) {
      const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
      stalactite.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 10 + 10,
        (Math.random() - 0.5) * 30
      );
      stalactite.rotation.x = Math.PI;
      stalactite.scale.y = 0.5 + Math.random() * 1.5;
      scene.add(stalactite);
    }

    for (let i = 0; i < 20; i++) {
      const stalagmite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
      stalagmite.position.set(
        (Math.random() - 0.5) * 30,
        -Math.random() * 10 - 10,
        (Math.random() - 0.5) * 30
      );
      stalagmite.scale.y = 0.5 + Math.random() * 1.5;
      scene.add(stalagmite);
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      targetX += (mouseX * 2 - targetX) * 0.05;
      targetY += (mouseY * 2 - targetY) * 0.05;

      camera.position.x = targetX * 0.5;
      camera.position.y = targetY * 0.5;
      camera.lookAt(scene.position);

      camera.position.z = 5 + scrollProgress * 10;
      camera.rotation.z = scrollProgress * Math.PI * 0.2;

      crystals.forEach((crystal) => {
        crystal.rotation.x += crystal.userData.rotationSpeed.x;
        crystal.rotation.y += crystal.userData.rotationSpeed.y;
        crystal.rotation.z += crystal.userData.rotationSpeed.z;

        crystal.position.y +=
          Math.sin(elapsedTime * crystal.userData.floatSpeed + crystal.userData.floatOffset) *
          0.01;
      });

      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = elapsedTime * 0.03;

      pointLight1.position.x = Math.sin(elapsedTime * 0.7) * 10;
      pointLight1.position.z = Math.cos(elapsedTime * 0.7) * 10;

      pointLight2.position.x = Math.cos(elapsedTime * 0.5) * 10;
      pointLight2.position.z = Math.sin(elapsedTime * 0.5) * 10;

      pointLight3.intensity = 1.5 + Math.sin(elapsedTime * 2) * 0.5;

      renderer.render(scene, camera);
    };

    animate();
    setTimeout(() => (isLoaded = true), 500);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2023 - Beneath the Earth</title>
  <meta
    name="description"
    content="Cambridge Game Jam 2023 - Beneath the Earth"
  />
</svelte:head>

<canvas bind:this={canvas} class="fixed top-0 left-0 w-full h-full -z-10"></canvas>

<div class="relative min-h-screen">
  <div
    class="hero-section flex flex-col items-center justify-center min-h-screen text-center px-4"
    style="opacity: {isLoaded ? 1 : 0}; transition: opacity 1s ease-in;"
  >
    <div
      class="logo-container mb-8"
      style="transform: translateY({-scrollProgress * 100}px) scale({1 - scrollProgress * 0.3});"
    >
      <img
        src="/2023/logo.png"
        alt="Cambridge Game Jam 2023"
        class="w-64 h-64 md:w-80 md:h-80 mx-auto drop-shadow-[0_0_30px_rgba(102,153,255,0.6)] animate-float"
      />
    </div>

    <h1
      class="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse-slow"
      style="transform: translateY({-scrollProgress * 150}px);"
    >
      Cambridge Game Jam 2023
    </h1>

    <div
      class="text-2xl md:text-3xl mb-6 text-cyan-300 font-semibold tracking-wide"
      style="transform: translateY({-scrollProgress * 120}px);"
    >
      10th - 12th February
    </div>

    <div
      class="theme-badge inline-block px-8 py-4 bg-gradient-to-r from-purple-900/80 to-blue-900/80 rounded-full border-2 border-cyan-400 backdrop-blur-sm mb-8"
      style="transform: translateY({-scrollProgress * 130}px); box-shadow: 0 0 30px rgba(102, 153, 255, 0.4);"
    >
      <span class="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
        Beneath the Earth
      </span>
    </div>

    <a
      href="https://itch.io/jam/camgamejam2023"
      class="text-xl md:text-2xl text-cyan-300 hover:text-cyan-100 underline transition-colors duration-300"
      style="transform: translateY({-scrollProgress * 110}px);"
    >
      19 Submissions
    </a>

    <div
      class="mt-12 animate-bounce"
      style="transform: translateY({-scrollProgress * 90}px);"
    >
      <svg
        class="w-12 h-12 text-cyan-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </div>
  </div>

  <div class="projects-section py-20 px-4">
    <h2
      class="text-4xl md:text-6xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
    >
      Featured Projects
    </h2>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each projects as project, i}
        <a
          href={project.link}
          class="project-card group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/60 to-blue-900/60 backdrop-blur-md border-2 border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 hover:scale-105"
          style="animation-delay: {i * 0.1}s; box-shadow: 0 0 40px rgba(102, 153, 255, 0.2);"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/20 group-hover:to-purple-500/20 transition-all duration-500"></div>

          <div class="relative p-6">
            <div class="aspect-video mb-4 overflow-hidden rounded-lg">
              <img
                src={project.src}
                alt={project.title}
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <h3
              class="text-2xl font-bold mb-2 text-cyan-300 group-hover:text-cyan-100 transition-colors duration-300"
            >
              {project.title}
            </h3>

            <div
              class="inline-block px-4 py-2 bg-purple-800/60 rounded-full border border-cyan-400/50"
            >
              <span class="text-sm font-semibold text-cyan-300">
                {project.prize}
              </span>
            </div>
          </div>

          <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/40 transition-all duration-500 -mr-16 -mt-16"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all duration-500 -ml-16 -mb-16"></div>
        </a>
      {/each}
    </div>

    <div class="mt-16 text-center">
      <a
        href="https://itch.io/jam/camgamejam2023"
        class="inline-block px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-full text-white text-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-cyan-500/50"
      >
        View All Submissions
      </a>
    </div>
  </div>

  <div class="stats-section py-20 px-4 bg-gradient-to-b from-transparent to-purple-900/20">
    <div class="max-w-4xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div
          class="stat-card p-8 rounded-xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md border-2 border-cyan-500/30"
          style="box-shadow: 0 0 30px rgba(102, 153, 255, 0.2);"
        >
          <div class="text-5xl font-bold text-cyan-300 mb-2">48</div>
          <div class="text-xl text-cyan-400">Hours</div>
        </div>

        <div
          class="stat-card p-8 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md border-2 border-purple-500/30"
          style="box-shadow: 0 0 30px rgba(153, 102, 255, 0.2);"
        >
          <div class="text-5xl font-bold text-purple-300 mb-2">19</div>
          <div class="text-xl text-purple-400">Games</div>
        </div>

        <div
          class="stat-card p-8 rounded-xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-md border-2 border-blue-500/30"
          style="box-shadow: 0 0 30px rgba(102, 153, 255, 0.2);"
        >
          <div class="text-5xl font-bold text-blue-300 mb-2">5</div>
          <div class="text-xl text-blue-400">Winners</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-section py-12 text-center">
    <a
      href="/archive"
      class="inline-block px-6 py-3 bg-cyan-900/40 hover:bg-cyan-800/60 rounded-lg text-cyan-300 hover:text-cyan-100 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400"
    >
      ← Back to Archive
    </a>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: linear-gradient(to bottom, #0a0a15, #1a0a2a);
    color: #e0e0ff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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

  @keyframes pulse-slow {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
  }

  .project-card {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
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

  .stat-card {
    animation: scaleIn 0.6s ease-out forwards;
    animation-delay: 0.2s;
    opacity: 0;
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  canvas {
    background: radial-gradient(
      ellipse at center,
      rgba(10, 10, 30, 0.8) 0%,
      rgba(5, 5, 15, 0.95) 100%
    );
  }
</style>
