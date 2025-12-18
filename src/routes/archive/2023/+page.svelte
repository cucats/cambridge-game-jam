<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  
  let canvas;
  let scrollY = 0;
  let selectedProject = null;

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
  ];

  onMount(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.15);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const crystalGeometry = new THREE.OctahedronGeometry(0.1, 0);
    const stalactiteGeometry = new THREE.ConeGeometry(0.15, 1.5, 8);
    const stalagmiteGeometry = new THREE.ConeGeometry(0.2, 1.2, 8);
    
    const crystals = [];
    const stalactites = [];
    const stalagmites = [];
    
    for (let i = 0; i < 150; i++) {
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.5);
      
      const crystalMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.x = (Math.random() - 0.5) * 20;
      crystal.position.y = (Math.random() - 0.5) * 20;
      crystal.position.z = (Math.random() - 0.5) * 20;
      crystal.rotation.x = Math.random() * Math.PI;
      crystal.rotation.y = Math.random() * Math.PI;
      crystal.userData = {
        initialY: crystal.position.y,
        speed: 0.5 + Math.random() * 0.5,
        rotationSpeed: 0.01 + Math.random() * 0.02
      };
      scene.add(crystal);
      crystals.push(crystal);
    }
    
    for (let i = 0; i < 25; i++) {
      const stalactiteMaterial = new THREE.MeshPhongMaterial({
        color: 0x2a2a3a,
        shininess: 30
      });
      
      const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
      stalactite.position.x = (Math.random() - 0.5) * 30;
      stalactite.position.y = 8 + Math.random() * 4;
      stalactite.position.z = (Math.random() - 0.5) * 30;
      stalactite.rotation.x = Math.PI;
      scene.add(stalactite);
      stalactites.push(stalactite);
    }
    
    for (let i = 0; i < 25; i++) {
      const stalagmiteMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2a,
        shininess: 30
      });
      
      const stalagmite = new THREE.Mesh(stalagmiteGeometry, stalagmiteMaterial);
      stalagmite.position.x = (Math.random() - 0.5) * 30;
      stalagmite.position.y = -8 - Math.random() * 4;
      stalagmite.position.z = (Math.random() - 0.5) * 30;
      scene.add(stalagmite);
      stalagmites.push(stalagmite);
    }
    
    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x6666ff, 1.5, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff6666, 1.5, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x66ffff, 1.5, 50);
    pointLight3.position.set(0, 0, -5);
    scene.add(pointLight3);
    
    let time = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;
      
      crystals.forEach((crystal, i) => {
        crystal.position.y = crystal.userData.initialY + Math.sin(time * crystal.userData.speed + i) * 0.5;
        crystal.rotation.x += crystal.userData.rotationSpeed;
        crystal.rotation.y += crystal.userData.rotationSpeed * 0.7;
        
        const distance = camera.position.distanceTo(crystal.position);
        crystal.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + i) * 0.3;
      });
      
      pointLight1.position.x = Math.sin(time * 0.7) * 7;
      pointLight1.position.y = Math.cos(time * 0.5) * 7;
      
      pointLight2.position.x = Math.cos(time * 0.6) * 7;
      pointLight2.position.y = Math.sin(time * 0.8) * 7;
      
      pointLight3.intensity = 1 + Math.sin(time * 1.5) * 0.5;
      
      camera.position.x = Math.sin(time * 0.1) * 0.5;
      camera.position.y = Math.cos(time * 0.15) * 0.3 - scrollY * 0.001;
      camera.rotation.z = Math.sin(time * 0.05) * 0.02;
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      renderer.dispose();
    };
  });
</script>

<svelte:head>
  <title>Cambridge Game Jam 2023 - Beneath the Earth</title>
</svelte:head>

<canvas bind:this={canvas} class="fixed top-0 left-0 w-full h-full -z-10"></canvas>

<div class="relative min-h-screen text-white">
  <div class="container mx-auto px-4 py-20">
    <div class="hero-section text-center mb-32 animate-fade-in">
      <div class="inline-block mb-8 animate-float">
        <img src="/2023/logo.png" alt="Cambridge Game Jam 2023" class="h-32 md:h-48 mx-auto drop-shadow-glow" />
      </div>
      
      <h1 class="text-6xl md:text-8xl font-bold mb-6 text-shadow-glow animate-pulse-slow">
        Cambridge Game Jam 2023
      </h1>
      
      <div class="inline-block px-8 py-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg border-2 border-cyan-400/50 backdrop-blur-sm mb-6 animate-scale-in">
        <h2 class="text-3xl md:text-5xl font-bold text-cyan-300">
          Beneath the Earth
        </h2>
      </div>
      
      <p class="text-2xl md:text-3xl text-purple-300 mb-4 animate-fade-in-delay">
        10th - 12th February
      </p>
      
      <p class="text-xl md:text-2xl text-gray-300 animate-fade-in-delay-2">
        19 Submissions
      </p>
    </div>

    <div class="featured-section mb-32">
      <h2 class="text-4xl md:text-6xl font-bold text-center mb-16 text-cyan-300 text-shadow-glow">
        Featured Projects
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each projects as project, i}
          <div 
            class="project-card group relative overflow-hidden rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-gray-900/80 to-purple-900/40 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:border-cyan-400 hover:shadow-glow cursor-pointer"
            style="animation-delay: {i * 0.1}s"
            on:click={() => window.open(project.link, '_blank')}
            on:keypress={(e) => e.key === 'Enter' && window.open(project.link, '_blank')}
            role="button"
            tabindex="0"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="relative aspect-video overflow-hidden">
              <img 
                src={project.src} 
                alt={project.alt}
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              
              <div class="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-60"></div>
            </div>
            
            <div class="relative p-6">
              <div class="inline-block px-3 py-1 mb-3 bg-cyan-500/20 border border-cyan-400/50 rounded-full">
                <span class="text-sm text-cyan-300 font-semibold">{project.prize}</span>
              </div>
              
              <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {project.title}
              </h3>
              
              <div class="flex items-center text-purple-300 group-hover:text-cyan-400 transition-colors">
                <span class="text-sm">View Project</span>
                <svg class="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </div>
            
            <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500 -z-10"></div>
          </div>
        {/each}
      </div>
    </div>

    <div class="text-center mb-20">
      <a 
        href="https://itch.io/jam/camgamejam2023"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block px-12 py-6 text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full border-2 border-cyan-400 hover:from-purple-500 hover:to-cyan-500 hover:scale-110 hover:shadow-glow-strong transition-all duration-300 animate-pulse-glow"
      >
        View All Submissions
      </a>
    </div>

    <div class="cave-info text-center py-20 px-8 bg-gradient-to-br from-gray-900/60 to-purple-900/40 rounded-2xl border border-purple-500/30 backdrop-blur-md animate-fade-in-up">
      <h2 class="text-4xl font-bold mb-8 text-cyan-300 text-shadow-glow">
        Deep Underground
      </h2>
      
      <div class="max-w-4xl mx-auto space-y-6 text-lg text-gray-300 leading-relaxed">
        <p>
          In February 2023, game developers descended into the depths for Cambridge Game Jam's underground adventure. 
          Over three intense days, 19 teams explored the theme "Beneath the Earth," creating worlds of mystery, 
          danger, and discovery.
        </p>
        
        <p>
          From infernal caverns to mystical gardens, from rhythmic mining to bean-powered exploration, 
          each game carved its own unique tunnel through the darkness. Brave developers faced the challenge 
          with creativity and determination, emerging with gems of game design that shine bright.
        </p>
        
        <p class="text-xl text-purple-300 font-semibold pt-4">
          A celebration of subterranean creativity and collaborative spirit.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background: #0a0a0f;
    overflow-x: hidden;
  }

  .drop-shadow-glow {
    filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.6));
  }

  .text-shadow-glow {
    text-shadow: 
      0 0 10px rgba(34, 211, 238, 0.8),
      0 0 20px rgba(34, 211, 238, 0.6),
      0 0 30px rgba(147, 51, 234, 0.4);
  }

  .hover\:shadow-glow:hover {
    box-shadow: 
      0 0 20px rgba(34, 211, 238, 0.4),
      0 0 40px rgba(147, 51, 234, 0.3);
  }

  .hover\:shadow-glow-strong:hover {
    box-shadow: 
      0 0 30px rgba(34, 211, 238, 0.6),
      0 0 60px rgba(147, 51, 234, 0.5),
      0 0 90px rgba(147, 51, 234, 0.3);
  }

  @keyframes fadeIn {
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
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulseSlow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(34, 211, 238, 0.4),
        0 0 40px rgba(147, 51, 234, 0.3);
    }
    50% {
      box-shadow: 
        0 0 30px rgba(34, 211, 238, 0.6),
        0 0 60px rgba(147, 51, 234, 0.5);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 1s ease-out;
  }

  .animate-fade-in-delay {
    animation: fadeIn 1s ease-out 0.3s backwards;
  }

  .animate-fade-in-delay-2 {
    animation: fadeIn 1s ease-out 0.6s backwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-scale-in {
    animation: scaleIn 0.8s ease-out 0.5s backwards;
  }

  .animate-pulse-slow {
    animation: pulseSlow 3s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  .animate-fade-in-up {
    animation: fadeInUp 1s ease-out;
  }

  .project-card {
    animation: fadeIn 0.8s ease-out backwards;
  }

  .project-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(147, 51, 234, 0.3));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.5s;
  }

  .project-card:hover::before {
    opacity: 1;
  }
</style>
