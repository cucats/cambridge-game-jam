<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  const projects = [
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

  let canvasContainer;
  let scene, camera, renderer, animationId;
  let crystals = [];
  let particles = [];
  let stalactites = [];
  let stalagmites = [];
  let lights = [];
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  onMount(() => {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a15, 0.015);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a15, 1);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const createPointLight = (color, intensity, x, y, z) => {
      const light = new THREE.PointLight(color, intensity, 100);
      light.position.set(x, y, z);
      scene.add(light);
      lights.push(light);
      return light;
    };

    createPointLight(0xff6b35, 2, -15, 10, 10);
    createPointLight(0x4ecdc4, 2, 15, -10, 15);
    createPointLight(0xf7b801, 1.5, 0, 15, 5);
    createPointLight(0xff006e, 2, -10, -15, 20);
    createPointLight(0x06ffa5, 1.8, 20, 5, 8);

    const createCrystal = (x, y, z, scale, color) => {
      const geometry = new THREE.ConeGeometry(0.5 * scale, 2 * scale, 6);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
      });
      const crystal = new THREE.Mesh(geometry, material);
      crystal.position.set(x, y, z);
      crystal.rotation.z = Math.random() * Math.PI * 2;
      crystal.userData = { baseY: y, phase: Math.random() * Math.PI * 2 };
      scene.add(crystal);
      crystals.push(crystal);
    };

    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 60 - 10;
      const scale = Math.random() * 1.5 + 0.5;
      const colors = [0xff6b35, 0x4ecdc4, 0xf7b801, 0xff006e, 0x06ffa5];
      const color = colors[Math.floor(Math.random() * colors.length)];
      createCrystal(x, y, z, scale, color);
    }

    const createStalactite = (x, z) => {
      const height = Math.random() * 8 + 3;
      const radius = Math.random() * 0.8 + 0.3;
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x2a2a3e,
        shininess: 30,
      });
      const stalactite = new THREE.Mesh(geometry, material);
      stalactite.position.set(x, 25 - height / 2, z);
      stalactite.userData = { baseY: 25 - height / 2, phase: Math.random() * Math.PI * 2 };
      scene.add(stalactite);
      stalactites.push(stalactite);
    };

    const createStalagmite = (x, z) => {
      const height = Math.random() * 6 + 2;
      const radius = Math.random() * 0.9 + 0.4;
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        shininess: 30,
      });
      const stalagmite = new THREE.Mesh(geometry, material);
      stalagmite.position.set(x, -25 + height / 2, z);
      stalagmite.rotation.x = Math.PI;
      stalagmite.userData = { baseY: -25 + height / 2, phase: Math.random() * Math.PI * 2 };
      scene.add(stalagmite);
      stalagmites.push(stalagmite);
    };

    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50 - 20;
      createStalactite(x, z);
      if (Math.random() > 0.3) {
        createStalagmite(x + (Math.random() - 0.5) * 3, z);
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100 - 20;
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x4ecdc4,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push({ system: particleSystem, velocities: velocities });

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      camera.position.x = mouseX * 5;
      camera.position.y = -mouseY * 5;
      camera.position.z = 30 - scrollY * 0.02;
      camera.lookAt(0, 0, 0);

      crystals.forEach((crystal, i) => {
        crystal.rotation.y += 0.01;
        crystal.position.y = crystal.userData.baseY + Math.sin(time * 2 + crystal.userData.phase) * 0.5;
        crystal.material.emissiveIntensity = 0.3 + Math.sin(time * 3 + i) * 0.2;
      });

      stalactites.forEach((stalactite) => {
        stalactite.position.y = stalactite.userData.baseY + Math.sin(time + stalactite.userData.phase) * 0.2;
      });

      stalagmites.forEach((stalagmite) => {
        stalagmite.position.y = stalagmite.userData.baseY + Math.cos(time + stalagmite.userData.phase) * 0.15;
      });

      lights.forEach((light, i) => {
        light.intensity = 1.5 + Math.sin(time * 2 + i) * 0.5;
        light.position.x += Math.sin(time + i) * 0.05;
        light.position.y += Math.cos(time * 1.5 + i) * 0.05;
      });

      particles.forEach((particleData) => {
        const positions = particleData.system.geometry.attributes.position.array;
        const velocities = particleData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i / 3].x;
          positions[i + 1] += velocities[i / 3].y;
          positions[i + 2] += velocities[i / 3].z;

          if (Math.abs(positions[i]) > 50) velocities[i / 3].x *= -1;
          if (Math.abs(positions[i + 1]) > 50) velocities[i / 3].y *= -1;
          if (Math.abs(positions[i + 2]) > 50) velocities[i / 3].z *= -1;
        }

        particleData.system.geometry.attributes.position.needsUpdate = true;
        particleData.system.rotation.y += 0.0005;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="relative w-full min-h-screen overflow-x-hidden bg-gradient-to-b from-black via-slate-900 to-slate-800">
  <div bind:this={canvasContainer} class="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"></div>
  
  <div class="relative z-10">
    <section class="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
      <div class="cave-entrance-animation mb-8">
        <img
          src="/2023/logo.png"
          alt="Cambridge Game Jam Logo"
          class="w-64 h-64 md:w-80 md:h-80 object-contain floating-logo"
        />
      </div>
      
      <h1 class="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-600 mb-6 glitch-text">
        {title}
      </h1>
      
      <div class="text-3xl md:text-5xl font-semibold text-cyan-400 mb-4 pulse-text">
        {theme}
      </div>
      
      <div class="text-xl md:text-2xl text-stone-300 mb-8">
        {duration}
      </div>
      
      <a 
        href="https://itch.io/jam/camgamejam2023" 
        class="text-lg md:text-xl text-amber-400 hover:text-amber-300 underline transition-all duration-300 hover:scale-110 inline-block"
      >
        {submissions} Submissions
      </a>
      
      <div class="mt-16 animate-bounce text-stone-400 text-4xl">
        ↓
      </div>
    </section>

    <section class="min-h-screen py-20 px-4">
      <h2 class="text-5xl md:text-6xl font-bold text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        Featured Projects
      </h2>
      
      <div class="max-w-7xl mx-auto space-y-32">
        {#each projects as project, index}
          <div class="project-card relative" style="animation-delay: {index * 0.1}s">
            <a 
              href={project.link}
              class="block transform transition-all duration-500 hover:scale-105 group"
            >
              <div class="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-stone-700 hover:border-amber-500 transition-all duration-500">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-900/20 z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                
                <img
                  src={project.src}
                  alt={project.alt}
                  class="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-20 flex flex-col justify-end p-8">
                  <h3 class="text-4xl md:text-5xl font-bold text-white mb-2 transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    {project.title}
                  </h3>
                  
                  {#if project.prize}
                    <div class="inline-block">
                      <span class="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 transform group-hover:translate-y-[-8px] transition-transform duration-500 inline-block">
                        {project.prize}
                      </span>
                    </div>
                  {/if}
                </div>
                
                <div class="absolute top-0 left-0 w-full h-full border-4 border-transparent group-hover:border-cyan-400 transition-all duration-500 rounded-2xl pointer-events-none glow-border"></div>
              </div>
            </a>
          </div>
        {/each}
      </div>
    </section>

    <section class="py-20 px-4 text-center">
      <a 
        href="/archive"
        class="inline-block px-12 py-6 text-2xl font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 rounded-full hover:from-amber-500 hover:to-orange-600 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-amber-500/50"
      >
        Back to Archive
      </a>
    </section>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow-x: hidden;
  }

  .floating-logo {
    animation: float 6s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.6));
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    25% {
      transform: translateY(-20px) rotate(2deg);
    }
    75% {
      transform: translateY(-10px) rotate(-2deg);
    }
  }

  .glitch-text {
    animation: glitch 8s infinite;
    text-shadow: 
      0 0 10px rgba(251, 191, 36, 0.8),
      0 0 20px rgba(251, 191, 36, 0.6),
      0 0 30px rgba(251, 191, 36, 0.4);
  }

  @keyframes glitch {
    0%, 90%, 100% {
      transform: translate(0);
    }
    92% {
      transform: translate(-2px, 2px);
    }
    94% {
      transform: translate(2px, -2px);
    }
    96% {
      transform: translate(-2px, -2px);
    }
    98% {
      transform: translate(2px, 2px);
    }
  }

  .pulse-text {
    animation: pulse 3s ease-in-out infinite;
    text-shadow: 
      0 0 20px rgba(34, 211, 238, 0.8),
      0 0 40px rgba(34, 211, 238, 0.4);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  .project-card {
    animation: slideInUp 1s ease-out forwards;
    opacity: 0;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(100px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .glow-border {
    box-shadow: 
      inset 0 0 20px rgba(34, 211, 238, 0),
      0 0 20px rgba(34, 211, 238, 0);
    transition: box-shadow 0.5s ease;
  }

  .group:hover .glow-border {
    box-shadow: 
      inset 0 0 40px rgba(34, 211, 238, 0.4),
      0 0 60px rgba(34, 211, 238, 0.6);
  }

  .cave-entrance-animation {
    animation: caveEntrance 2s ease-out;
  }

  @keyframes caveEntrance {
    0% {
      opacity: 0;
      transform: scale(0.5) translateY(-100px);
      filter: brightness(0);
    }
    50% {
      filter: brightness(2);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
      filter: brightness(1);
    }
  }
</style>
