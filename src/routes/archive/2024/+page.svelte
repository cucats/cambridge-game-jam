<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Reflector } from "three/examples/jsm/objects/Reflector.js";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  // Data
  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

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
      prize: "View on itch.io",
    },
  ];

  let container;
  let canvas;

  onMount(() => {
    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x110b29); // Dark purple/blue
    scene.fog = new THREE.FogExp2(0x110b29, 0.02);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff00ff, 2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x00ffff, 2, 50);
    blueLight.position.set(-10, 10, -10);
    scene.add(blueLight);

    // MIRROR FLOOR
    const geometry = new THREE.CircleGeometry(40, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x777777,
    });
    groundMirror.position.y = -0.1;
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    // CRYSTALS / LOW POLY OBJECTS
    const crystals = [];
    const crystalGeo = new THREE.OctahedronGeometry(1);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 1,
      flatShading: true,
    });

    for (let i = 0; i < 50; i++) {
      const mesh = new THREE.Mesh(crystalGeo, crystalMat);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 10 + 1,
        (Math.random() - 0.5) * 30
      );
      mesh.scale.setScalar(Math.random() * 1.5 + 0.5);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Store random rotation speed
      mesh.userData = {
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: mesh.position.y
      };
      
      scene.add(mesh);
      crystals.push(mesh);
    }

    // MONOLITH (Centerpiece)
    const monolithGeo = new THREE.IcosahedronGeometry(3, 0);
    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0x440044,
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true
    });
    const monolith = new THREE.Mesh(monolithGeo, monolithMat);
    monolith.position.set(0, 4, 0);
    scene.add(monolith);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate Crystals
      crystals.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotSpeed.x;
        mesh.rotation.y += mesh.userData.rotSpeed.y;
        mesh.rotation.z += mesh.userData.rotSpeed.z;
        mesh.position.y = mesh.userData.initialY + Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.5;
      });

      // Animate Monolith
      monolith.rotation.y = time * 0.2;
      monolith.rotation.x = Math.sin(time * 0.5) * 0.1;
      monolith.position.y = 4 + Math.sin(time) * 0.5;

      // Animate Camera
      camera.position.x = Math.sin(time * 0.1) * 20;
      camera.position.z = Math.cos(time * 0.1) * 20;
      camera.lookAt(0, 3, 0);

      // Animate Lights
      dirLight.position.x = Math.sin(time * 0.5) * 20;
      dirLight.color.setHSL((time * 0.1) % 1, 1, 0.5);

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE HANDLER
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Update mirror
      groundMirror.getRenderTarget().setSize(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container?.removeChild(renderer.domElement);
      geometry.dispose();
      // Dispose other geometries/materials if needed
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div bind:this={container} class="fixed inset-0 w-full h-full -z-10 bg-[#110b29]"></div>

<div class="relative min-h-screen text-white overflow-hidden font-sans">
  <div class="absolute top-4 left-4 z-50 pointer-events-auto">
    <div class="inline-block">
        <BackToMainButton />
    </div>
  </div>

  <div class="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen pointer-events-none">
    
    <!-- Title Section -->
    <div class="text-center mb-16 space-y-4 animate-fade-in backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-white/10">
      <h1 class="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-400 drop-shadow-lg tracking-tighter">
        {title}
      </h1>
      <p class="text-2xl md:text-3xl text-gray-200 tracking-wide font-light">{duration}</p>
      <div class="text-4xl md:text-5xl font-mono text-purple-300 mt-4 uppercase tracking-[0.2em]">{theme}</div>
      <p class="text-xl text-gray-400">{submissions} Submissions</p>
    </div>

    <!-- Winners Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl pointer-events-auto">
      {#each images as item}
        <a 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
          class="group relative overflow-hidden rounded-xl bg-black/40 border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/60 hover:shadow-[0_0_30px_rgba(147,51,234,0.3)]"
        >
          <div class="aspect-video overflow-hidden">
            <img 
              src={item.src} 
              alt={item.alt} 
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            />
          </div>
          <div class="p-4 relative z-10">
            <h3 class="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
            {#if item.prize}
              <p class="text-sm text-purple-300 font-medium">{item.prize}</p>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow-x: hidden;
    background-color: #110b29;
  }
  
  .animate-fade-in {
    animation: fadeIn 1.5s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
