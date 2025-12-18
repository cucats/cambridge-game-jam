<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

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

  let container;
  let canvas;
  
  let scene, camera, renderer;
  let tunnel;
  let particles;
  let projectMeshes = [];
  let frameId;
  let curve;
  
  let scrollY = 0;
  let targetScrollY = 0;
  
  onMount(() => {
    init();
    animate();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll);
    
    return () => {
        if (frameId) cancelAnimationFrame(frameId);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        if (renderer) renderer.dispose();
    };
  });

  function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02);
    scene.background = new THREE.Color(0x050510);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, 1, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    
    curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 5, -50),
      new THREE.Vector3(-5, -5, -100),
      new THREE.Vector3(0, 0, -150),
      new THREE.Vector3(10, 10, -200)
    ]);
    
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 8, 16, false);
    
    const pos = tubeGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const amp = 1.5;
        pos.setX(i, x + (Math.random() - 0.5) * amp);
        pos.setY(i, y + (Math.random() - 0.5) * amp);
        pos.setZ(i, z + (Math.random() - 0.5) * amp);
    }
    tubeGeometry.computeVertexNormals();

    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a5a,
        roughness: 0.9,
        metalness: 0.2,
        side: THREE.BackSide,
        flatShading: true
    });
    
    tunnel = new THREE.Mesh(tubeGeometry, rockMaterial);
    scene.add(tunnel);

    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    
    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = (Math.random() - 0.5) * 50;
        particlePos[i*3+1] = (Math.random() - 0.5) * 50;
        particlePos[i*3+2] = (Math.random() - 0.5) * 200;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const textureLoader = new THREE.TextureLoader();
    
    projects.forEach((proj, index) => {
        textureLoader.load(proj.src, (texture) => {
            const aspect = texture.image.width / texture.image.height;
            const planeGeo = new THREE.PlaneGeometry(4 * aspect, 4);
            const planeMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(planeGeo, planeMat);
            
            const t = 0.15 + (index / projects.length) * 0.7; 
            const point = curve.getPoint(t);
            
            mesh.position.copy(point);
            const side = index % 2 === 0 ? 1 : -1;
            mesh.position.x += side * 4;
            mesh.position.y += (Math.random() - 0.5) * 2;
            
            mesh.lookAt(curve.getPoint(Math.max(0, t - 0.1)));
            
            const frameGeo = new THREE.BoxGeometry(4 * aspect + 0.5, 4.5, 0.5);
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.z = -0.3;
            mesh.add(frame);

            mesh.userData = { link: proj.link, title: proj.title };
            
            scene.add(mesh);
            projectMeshes.push(mesh);
            
            const projLight = new THREE.PointLight(0xffaa55, 1.5, 15);
            projLight.position.copy(mesh.position);
            projLight.position.z += 2;
            scene.add(projLight);
        });
    });

    camera.position.set(0, 0, 10);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onScroll() {
    targetScrollY = window.scrollY;
  }

  function animate() {
    frameId = requestAnimationFrame(animate);

    scrollY += (targetScrollY - scrollY) * 0.05;

    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollFraction = Math.max(0, scrollY / (maxScroll || 1));
    const t = Math.min(scrollFraction, 1) * 0.98;
    
    if (curve) {
      const camPos = curve.getPoint(t);
      const lookAtT = Math.min(t + 0.05, 1);
      const camLookAt = curve.getPoint(lookAtT);

      camera.position.copy(camPos);
      camera.lookAt(camLookAt);
      
      camera.rotation.z += (Math.sin(scrollY * 0.002) * 0.05);
    }

    if (particles) {
        particles.rotation.z += 0.001;
    }

    const time = Date.now() * 0.001;
    projectMeshes.forEach((mesh, i) => {
        mesh.position.y += Math.sin(time + i) * 0.005;
    });

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<!-- Global Style to hide footer -->
<style>
  :global(footer) {
    display: none !important;
  }
  :global(body) {
    background-color: #050510;
    overflow-x: hidden;
  }
</style>

<div class="fixed top-0 left-0 w-full h-full -z-10">
  <canvas bind:this={canvas}></canvas>
</div>

<div class="relative z-10 text-white min-h-[500vh]">
  <div class="h-screen flex flex-col items-center justify-center text-center p-4">
    <h1 class="text-6xl md:text-8xl font-bold mb-4 drop-shadow-[0_0_15px_rgba(255,165,0,0.8)] text-transparent bg-clip-text bg-linear-to-b from-yellow-300 to-red-600 animate-pulse">
      {title}
    </h1>
    <p class="text-2xl md:text-4xl text-gray-300 mb-8 font-light tracking-widest uppercase border-b-2 border-red-500 pb-2">
      {theme}
    </p>
    <div class="flex gap-8 text-xl text-gray-400">
      <span>{duration}</span>
      <span>•</span>
      <span>{submissions} Submissions</span>
    </div>
    <div class="mt-12 animate-bounce">
      <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  </div>

  <div class="absolute top-[100vh] w-full px-4 md:px-20 pointer-events-none">
     {#each projects as project, i}
        <div class="h-[60vh] flex items-center {i % 2 === 0 ? 'justify-start' : 'justify-end'}">
            <div class="bg-black/60 backdrop-blur-md p-6 rounded-lg border border-red-900/50 max-w-md transform transition-all duration-500 hover:scale-105 pointer-events-auto shadow-[0_0_30px_rgba(200,50,0,0.2)]">
                <h3 class="text-2xl font-bold text-amber-500 mb-2">{project.title}</h3>
                {#if project.prize}
                    <div class="text-rose-400 text-sm font-bold uppercase tracking-wide mb-3">{project.prize}</div>
                {/if}
                <a href={project.link} target="_blank" rel="noopener noreferrer" class="inline-block bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
                    View Project
                </a>
            </div>
        </div>
     {/each}
  </div>

  <div class="h-screen flex flex-col items-center justify-center bg-gradient-to-t from-black to-transparent pointer-events-auto mt-[50vh]">
      <h2 class="text-4xl font-bold mb-8">Ready for the next adventure?</h2>
      <a href="/archive" class="text-xl underline text-amber-400 hover:text-amber-300">Back to Archives</a>
  </div>
</div>
