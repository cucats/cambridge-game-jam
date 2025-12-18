<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import BackToMainButton from '$lib/components/BackToMainButton.svelte';

  let canvasContainer;
  let renderer, scene, camera;
  let animationId;
  let objects = [];
  let particles;

  const projects = [
    { title: "Blight", author: "Hex-26", link: "https://hex-26.itch.io/blight" },
    { title: "Reflect Upon Your Actions", author: "Dylan Moss", link: "https://dylanmoss.itch.io/reflect-upon-you-actions" },
    { title: "Reflected", author: "Ekorrette", link: "https://ekorrette.itch.io/reflected" },
    { title: "Asymmetry", author: "Alex Davies", link: "https://alex-davies.itch.io/asymmetry" },
    { title: "Coulda Woulda Buddha", author: "Greenwood672", link: "https://greenwood672.itch.io/coulda-woulda-buddha" }
  ];

  onMount(() => {
    initThree();
    animate();
    window.addEventListener('resize', onResize);
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) renderer.dispose();
    window.removeEventListener('resize', onResize);
  });

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.03);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    canvasContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xff00ff, 100);
    spotLight.position.set(10, 20, 10);
    spotLight.angle = 0.5;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    const spotLight2 = new THREE.SpotLight(0x00ffff, 100);
    spotLight2.position.set(-10, 20, -10);
    spotLight2.angle = 0.5;
    spotLight2.penumbra = 0.5;
    spotLight2.castShadow = true;
    scene.add(spotLight2);

    // Floor (Mirror-like)
    const floorGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x050510,
      roughness: 0.1,
      metalness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Low Poly Shapes
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0)
    ];

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    for (let i = 0; i < 40; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const scale = Math.random() * 1 + 0.5;
      mesh.scale.set(scale, scale, scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      mesh.userData = {
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: mesh.position.y
      };
      
      scene.add(mesh);
      objects.push(mesh);
    }

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Camera movement
    camera.position.x = Math.sin(time * 0.2) * 12;
    camera.position.z = Math.cos(time * 0.2) * 12;
    camera.lookAt(0, 2, 0);

    // Objects animation
    objects.forEach(obj => {
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;
      obj.position.y = obj.userData.initialY + Math.sin(time * 2 + obj.userData.floatOffset) * 0.5;
    });

    // Particles animation
    if (particles) {
      particles.rotation.y = time * 0.05;
      particles.rotation.x = time * 0.02;
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
</script>

<div class="fixed inset-0 z-[9999] bg-black text-white font-sans overflow-hidden">
  <div bind:this={canvasContainer} class="absolute inset-0 z-0"></div>

  <!-- Content Overlay -->
  <div class="relative z-10 w-full h-full overflow-y-auto pointer-events-none custom-scrollbar">
    <div class="min-h-screen flex flex-col items-center p-6 md:p-12 pointer-events-auto">
      
      <!-- Back Button -->
      <div class="w-full max-w-7xl flex justify-start mb-8">
         <BackToMainButton />
      </div>

      <!-- Header -->
      <header class="text-center mb-20 mt-10 mix-blend-screen">
        <h1 class="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse-slow">
          CAMBRIDGE
          <br />
          GAME JAM 2024
        </h1>
        <div class="inline-block relative">
          <p class="text-3xl md:text-4xl font-light tracking-[0.5em] uppercase text-cyan-100 mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">Reflection</p>
          <div class="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        </div>
        <p class="text-xl md:text-2xl text-fuchsia-200 mt-6 font-mono tracking-wider">9th - 11th February</p>
      </header>

      <!-- Projects Grid -->
      <div class="w-full max-w-7xl mb-24">
        <h2 class="text-3xl font-bold mb-10 text-center text-white/90 uppercase tracking-widest border-b border-white/10 pb-4">Featured Projects</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {#each projects as project}
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              class="group relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(0,255,255,0.2)]"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <!-- Low poly decoration inside card -->
              <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rotate-45 transform group-hover:rotate-90 transition-transform duration-700 blur-xl"></div>

              <h3 class="text-2xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors relative z-10 font-display">{project.title}</h3>
              <p class="text-base text-gray-300 group-hover:text-white transition-colors relative z-10 font-mono">by {project.author}</p>
              
              <div class="absolute top-4 right-4 text-white/20 group-hover:text-cyan-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </div>
            </a>
          {/each}
        </div>
      </div>

      <!-- Footer Text -->
      <div class="text-center max-w-3xl text-gray-400 text-sm mb-12 backdrop-blur-md p-8 rounded-2xl bg-black/40 border border-white/5 shadow-2xl">
        <p class="leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>

    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
  }

  .animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .8;
    }
  }
</style>
