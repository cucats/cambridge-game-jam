<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { browser } from '$app/environment';

  const projects = [
    { title: "Beneath the Earth", image: "/2023/beaneth-the-earth.png", color: 0x44aa88 },
    { title: "Deck of Dwarves", image: "/2023/deck-of-dwarves.png", color: 0xaa4444 },
    { title: "Inferno Rising", image: "/2023/inferno-rising.png", color: 0xff8800 },
    { title: "Mayi Garden", image: "/2023/mayi-garden.png", color: 0x88cc44 },
    { title: "Rhythm Mythril Fever", image: "/2023/rhythm-mythril-fever.png", color: 0xcc44cc }
  ];

  let container;
  let canvas;

  onMount(() => {
    if (!browser) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.035);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0x222233);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffaa00, 2, 50);
    mainLight.position.set(0, 5, 5);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x0088ff, 1.5, 30);
    blueLight.position.set(-5, 2, 0);
    scene.add(blueLight);
    
    const caveGroup = new THREE.Group();
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333344, 
      roughness: 0.8,
      flatShading: true
    });

    for (let i = 0; i < 400; i++) {
      const mesh = new THREE.Mesh(rockGeometry, rockMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 3;
      const z = (Math.random() - 0.5) * 60;
      
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const scale = 2 + Math.random() * 4;
      mesh.scale.set(scale, scale, scale);
      
      caveGroup.add(mesh);
    }
    scene.add(caveGroup);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 40;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const projectsGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();
    
    projects.forEach((proj, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      const radius = 3.5;
      
      const group = new THREE.Group();
      group.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, 0);
      group.lookAt(0, 0, 0);
      
      const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: proj.color,
        transmission: 0.6,
        opacity: 0.8,
        metalness: 0,
        roughness: 0.1,
        ior: 1.5,
        thickness: 2,
        specularIntensity: 1,
        transparent: true,
        side: THREE.DoubleSide
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.scale.set(1.5, 1.2, 0.2);
      group.add(crystal);

      textureLoader.load(proj.image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const aspect = texture.image.width / texture.image.height;
        const planeGeo = new THREE.PlaneGeometry(1.8, 1.8 / aspect);
        const planeMat = new THREE.MeshBasicMaterial({ 
            map: texture,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.position.z = 0.25;
        group.add(plane);
      });

      const pLight = new THREE.PointLight(proj.color, 1, 5);
      pLight.position.set(0, 0, 1);
      group.add(pLight);

      projectsGroup.add(group);
    });
    scene.add(projectsGroup);

    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;
    
    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      camera.position.x += (mouseX * 1 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 1 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      projectsGroup.rotation.z = Math.sin(elapsedTime * 0.1) * 0.5;
      projectsGroup.rotation.y = elapsedTime * 0.1;

      projectsGroup.children.forEach((child, i) => {
        child.position.y += Math.sin(elapsedTime * 2 + i) * 0.002;
        child.rotation.x = Math.sin(elapsedTime + i) * 0.1;
      });

      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = elapsedTime * 0.02;

      mainLight.intensity = 2 + Math.sin(elapsedTime * 3) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  });
</script>

<div bind:this={container} class="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
  <canvas bind:this={canvas} class="absolute top-0 left-0 w-full h-full z-0 block"></canvas>
  
  <div class="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
    <div class="text-center animate-fade-in-up">
      <h1 class="text-5xl md:text-7xl font-bold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 drop-shadow-lg">
        Cambridge Game Jam
      </h1>
      <h2 class="text-3xl md:text-5xl font-light text-purple-200 mb-8 tracking-widest uppercase">
        2023 Archive
      </h2>
      
      <p class="max-w-2xl mx-auto text-lg text-gray-300 mb-12 px-6 drop-shadow-md">
        Explore the depths of creativity. Discover the gems forged in the 2023 jam.
      </p>

    </div>
  </div>

  <div class="absolute bottom-10 left-0 w-full z-20 pointer-events-auto">
     <div class="flex flex-wrap justify-center gap-4 px-4">
        {#each projects as project}
            <div class="group relative overflow-hidden rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105 p-3 cursor-default">
                <div class="flex items-center gap-3">
                   <div class="w-2 h-2 rounded-full shadow-[0_0_8px]" style="background-color: #{project.color.toString(16).padStart(6, '0')}; box-shadow: 0 0 10px #{project.color.toString(16).padStart(6, '0')}"></div>
                   <span class="text-sm font-medium text-gray-200 group-hover:text-white">{project.title}</span>
                </div>
            </div>
        {/each}
     </div>
  </div>
  
  <div class="absolute top-6 left-6 z-30 pointer-events-auto">
     <a href="/" class="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-sm font-medium transition-colors border border-white/10">
       &larr; Back to Main
     </a>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    background: #050510;
  }
  
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 1.5s ease-out forwards;
  }
</style>