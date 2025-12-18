<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  const data = {
    title: "Cambridge Game Jam 2023",
    date: "10th - 12th February",
    theme: "Beneath the Earth",
    projects: [
      {
        title: "Inferno Rising",
        prize: "Popular Vote",
        src: "/2023/inferno-rising.png",
        link: "https://firedemon111.itch.io/inferno-rising"
      },
      {
        title: "MAYI Garden",
        prize: "Best for Theme",
        src: "/2023/mayi-garden.png",
        link: "https://qiaozhi-lei.itch.io/mayi-garden"
      },
      {
        title: "Rhythm Mythril Fever",
        prize: "Best Presentation",
        src: "/2023/rhythm-mythril-fever.png",
        link: "https://stolencheese.itch.io/rhythm-mythril-fever"
      },
      {
        title: "Beaneth the Earth",
        prize: "Best Gameplay",
        src: "/2023/beaneth-the-earth.png",
        link: "https://mxbi.itch.io/beaneth-the-earth"
      },
      {
        title: "Deck of Dwarves",
        prize: "Most Original Idea",
        src: "/2023/deck-of-dwarves.png",
        link: "https://joeoc.itch.io/deck-of-dwarves"
      }
    ]
  };

  let container;
  let scrollY = 0;
  let innerHeight = 0;

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050202);
    scene.fog = new THREE.FogExp2(0x050202, 0.035);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const points = [];
    for (let i = 0; i < 50; i++) {
      points.push(new THREE.Vector3(
        Math.sin(i * 0.5) * 5,
        Math.cos(i * 0.3) * 5 - i * 2,
        Math.sin(i * 0.2) * 5
      ));
    }
    const path = new THREE.CatmullRomCurve3(points);
    
    const geometry = new THREE.TubeGeometry(path, 300, 4, 16, false);
    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      const z = posAttribute.getZ(i);
      const noise = Math.random() * 0.8;
      posAttribute.setXYZ(i, x + noise, y + noise, z + noise);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x443333,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.BackSide,
      flatShading: true
    });
    
    const tube = new THREE.Mesh(geometry, material);
    scene.add(tube);

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 2000;
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount * 3; i+=3) {
      const t = Math.random(); 
      const point = path.getPoint(t);
      pPos[i] = point.x + (Math.random() - 0.5) * 10;
      pPos[i+1] = point.y + (Math.random() - 0.5) * 10;
      pPos[i+2] = point.z + (Math.random() - 0.5) * 10;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0xffaa55,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    const lights = [];
    [0.1, 0.3, 0.5, 0.7, 0.9].forEach(t => {
      const light = new THREE.PointLight(0xff6600, 2, 20);
      const pos = path.getPoint(t);
      light.position.set(pos.x, pos.y, pos.z);
      scene.add(light);
      lights.push(light);
    });

    const crystals = [];
    const crystalGeo = new THREE.OctahedronGeometry(0.5);
    const crystalMat = new THREE.MeshStandardMaterial({ 
      color: 0x00ffff, 
      emissive: 0x0044aa,
      roughness: 0.1,
      metalness: 0.9
    });
    
    for(let i=0; i<30; i++) {
      const t = Math.random();
      const pos = path.getPoint(t);
      const offset = new THREE.Vector3((Math.random()-0.5)*8, (Math.random()-0.5)*8, (Math.random()-0.5)*8);
      const mesh = new THREE.Mesh(crystalGeo, crystalMat);
      mesh.position.copy(pos).add(offset);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
      scene.add(mesh);
      crystals.push(mesh);
    }

    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      lights.forEach((l, i) => {
        l.intensity = 2 + Math.sin(time * 3 + i) * 0.5;
      });

      crystals.forEach((c, i) => {
        c.rotation.x = time * 0.5 + i;
        c.rotation.y = time * 0.3 + i;
        c.position.y += Math.sin(time + i) * 0.01;
      });

      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollFraction = Math.max(0, Math.min(1, scrollY / maxScroll));
      
      const looptime = 20; 
      const t = scrollFraction * 0.95; 
      
      const pos = path.getPointAt(t);
      const lookAt = path.getPointAt(Math.min(t + 0.01, 1));
      
      camera.position.copy(pos);
      camera.lookAt(lookAt);
      
      camera.rotation.z += Math.sin(time * 0.5) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  });
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="fixed top-0 left-0 w-full h-full -z-10" bind:this={container}></div>

<main class="relative z-10 text-white font-sans">
  <section class="h-screen flex flex-col items-center justify-center text-center p-4">
    <h1 class="text-6xl md:text-8xl font-bold mb-4 drop-shadow-lg tracking-widest uppercase">{data.title}</h1>
    <p class="text-2xl md:text-3xl text-orange-300 drop-shadow-md">{data.date}</p>
    <p class="text-xl mt-8 opacity-80 max-w-2xl mx-auto">Theme: <span class="font-bold text-red-400">{data.theme}</span></p>
    <div class="animate-bounce mt-12 text-4xl">↓</div>
  </section>

  {#each data.projects as project, i}
    <section class="h-screen flex items-center justify-center p-4 {i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}">
      <div class="bg-black/60 backdrop-blur-md p-8 rounded-xl border border-white/10 max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center transform transition-all duration-500 hover:scale-105">
        <img src={project.src} alt={project.title} class="w-full md:w-1/2 rounded-lg shadow-2xl" />
        <div class="flex-1 text-center md:text-left">
          <h2 class="text-4xl font-bold mb-2 text-orange-200">{project.title}</h2>
          <p class="text-xl text-yellow-500 mb-6">{project.prize}</p>
          <p class="mb-6 leading-relaxed opacity-90">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <a href={project.link} target="_blank" class="inline-block px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-full font-bold hover:from-orange-500 hover:to-red-500 transition-colors shadow-lg">
            Play Game
          </a>
        </div>
      </div>
    </section>
  {/each}

  <section class="h-[50vh] flex flex-col items-center justify-center text-center p-4">
    <h2 class="text-4xl font-bold mb-8">See All Submissions</h2>
    <a href="https://itch.io/jam/camgamejam2023" target="_blank" class="px-10 py-4 bg-white text-black font-bold text-xl rounded-full hover:bg-gray-200 transition-colors">
      View Archive
    </a>
  </section>
</main>
