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
  let caveMesh;
  let stalactiteGroup;
  let stalagmiteGroup;
  let torchLights = [];
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let currentProject = $state(0);
  let loaded = $state(false);
  let projectImages = [];

  const initThree = () => {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const caveGroup = new THREE.Group();
    
    for (let ring = 0; ring < 8; ring++) {
      const caveShape = new THREE.Shape();
      const segments = 64;
      const baseRadius = 2.5 - ring * 0.3;
      const depth = ring * 2.5;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const noise1 = Math.sin(angle * 4 + ring) * 0.4;
        const noise2 = Math.cos(angle * 7 + ring * 2) * 0.3;
        const noise3 = Math.sin(angle * 11 + ring * 3) * 0.2;
        const r = baseRadius + noise1 + noise2 + noise3;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) {
          caveShape.moveTo(x, y);
        } else {
          caveShape.lineTo(x, y);
        }
      }

      const extrudeSettings = {
        depth: 2.5,
        bevelEnabled: false,
        curveSegments: 32,
      };

      const ringGeometry = new THREE.ExtrudeGeometry(caveShape, extrudeSettings);
      ringGeometry.rotateX(Math.PI / 2);
      ringGeometry.translate(0, -depth, 0);
      
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.08, 0.6, 0.15 - ring * 0.01),
        roughness: 0.95,
        metalness: 0.05,
        emissive: new THREE.Color().setHSL(0.08, 0.8, 0.05),
        emissiveIntensity: 0.3 + ring * 0.05,
      });
      
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      caveGroup.add(ringMesh);
    }
    
    caveGroup.position.set(0, -5, 0);
    scene.add(caveGroup);
    
    stalactiteGroup = new THREE.Group();
    for (let i = 0; i < 30; i++) {
      const height = Math.random() * 1.5 + 0.5;
      const radius = Math.random() * 0.3 + 0.1;
      const stalactiteGeometry = new THREE.ConeGeometry(radius, height, 8);
      const stalactiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1a0a,
        roughness: 0.9,
        metalness: 0.1,
      });
      const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 3 + 1;
      stalactite.position.set(
        Math.cos(angle) * distance,
        3 - height / 2,
        Math.sin(angle) * distance
      );
      stalactite.rotation.x = Math.random() * 0.2 - 0.1;
      stalactite.rotation.z = Math.random() * 0.2 - 0.1;
      stalactite.userData = { baseY: 3 - height / 2, height: height };
      stalactiteGroup.add(stalactite);
    }
    scene.add(stalactiteGroup);
    
    stalagmiteGroup = new THREE.Group();
    for (let i = 0; i < 25; i++) {
      const height = Math.random() * 1.2 + 0.4;
      const radius = Math.random() * 0.25 + 0.08;
      const stalagmiteGeometry = new THREE.ConeGeometry(radius, height, 8);
      const stalagmiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1a0a,
        roughness: 0.9,
        metalness: 0.1,
      });
      const stalagmite = new THREE.Mesh(stalagmiteGeometry, stalagmiteMaterial);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 2.5 + 0.8;
      stalagmite.position.set(
        Math.cos(angle) * distance,
        -5 + height / 2,
        Math.sin(angle) * distance
      );
      stalagmite.rotation.x = Math.random() * 0.2 - 0.1;
      stalagmite.rotation.z = Math.random() * 0.2 - 0.1;
      stalagmiteGroup.add(stalagmite);
    }
    scene.add(stalagmiteGroup);
    
    caveMesh = caveGroup;

    caveMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a2a1a,
      roughness: 0.9,
      metalness: 0.1,
      emissive: 0x1a0a00,
      emissiveIntensity: 0.2,
    });

    caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
    scene.add(caveMesh);

    const ambientLight = new THREE.AmbientLight(0x4a3a2a, 0.3);
    scene.add(ambientLight);

    const torchLight1 = new THREE.PointLight(0xff8844, 2, 15);
    torchLight1.position.set(1.5, 1, 2);
    torchLight1.castShadow = true;
    torchLight1.userData = { baseY: 1, baseIntensity: 2 };
    scene.add(torchLight1);
    torchLights.push(torchLight1);

    const torchLight2 = new THREE.PointLight(0xffaa66, 1.5, 12);
    torchLight2.position.set(-1.5, 0.5, 2);
    torchLight2.castShadow = true;
    torchLight2.userData = { baseY: 0.5, baseIntensity: 1.5 };
    scene.add(torchLight2);
    torchLights.push(torchLight2);

    const torchLight3 = new THREE.PointLight(0xffcc88, 1.2, 10);
    torchLight3.position.set(0, 2, 1.5);
    torchLight3.castShadow = true;
    torchLight3.userData = { baseY: 2, baseIntensity: 1.2 };
    scene.add(torchLight3);
    torchLights.push(torchLight3);
    
    const torchLight4 = new THREE.PointLight(0xffaa44, 1.8, 14);
    torchLight4.position.set(-1, -1, 3);
    torchLight4.castShadow = true;
    torchLight4.userData = { baseY: -1, baseIntensity: 1.8 };
    scene.add(torchLight4);
    torchLights.push(torchLight4);
    
    const torchLight5 = new THREE.PointLight(0xff8844, 1.5, 13);
    torchLight5.position.set(1, -0.5, 2.5);
    torchLight5.castShadow = true;
    torchLight5.userData = { baseY: -0.5, baseIntensity: 1.5 };
    scene.add(torchLight5);
    torchLights.push(torchLight5);

    for (let i = 0; i < 300; i++) {
      const size = Math.random() * 0.03 + 0.01;
      const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
      const hue = Math.random() * 0.15 + 0.05;
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.7, 0.4 + Math.random() * 0.3),
        transparent: true,
        opacity: 0.4 + Math.random() * 0.4,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 4 + 1;
      const height = (Math.random() - 0.5) * 8;
      particle.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      particle.userData = {
        speed: Math.random() * 0.015 + 0.005,
        rotationSpeed: Math.random() * 0.03 + 0.01,
        baseAngle: angle,
        baseRadius: radius,
        floatSpeed: Math.random() * 0.02 + 0.01,
      };
      scene.add(particle);
      particles.push(particle);
    }

    const loader = new THREE.TextureLoader();
    images.forEach((img, index) => {
      const texture = loader.load(img.src, () => {
        if (index === images.length - 1) {
          loaded = true;
        }
      });
      projectImages.push(texture);
    });

    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
  };

  const animate = () => {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    if (caveMesh) {
      caveMesh.rotation.y += 0.0005;
      caveMesh.rotation.x = Math.sin(time * 0.3) * 0.05;
      caveMesh.position.y = -5 + scrollY * 0.005;
      
      caveMesh.children.forEach((ring, index) => {
        ring.rotation.z = Math.sin(time * 0.2 + index) * 0.02;
        ring.material.emissiveIntensity = 0.3 + Math.sin(time + index) * 0.1;
      });
    }

    torchLights.forEach((light, index) => {
      if (light && light.userData) {
        light.intensity = light.userData.baseIntensity + Math.sin(time * 2 + index) * 0.5;
        light.position.y = light.userData.baseY + Math.sin(time * 3 + index) * 0.02;
      }
    });
    
    if (stalactiteGroup) {
      stalactiteGroup.children.forEach((stalactite, index) => {
        if (stalactite.userData) {
          stalactite.rotation.y = Math.sin(time * 0.5 + index * 0.1) * 0.05;
          stalactite.position.y = stalactite.userData.baseY + Math.sin(time + index) * 0.05;
        }
      });
    }
    
    if (stalagmiteGroup) {
      stalagmiteGroup.children.forEach((stalagmite, index) => {
        stalagmite.rotation.y = Math.sin(time * 0.4 + index * 0.15) * 0.03;
      });
    }

    particles.forEach((particle) => {
      particle.userData.baseAngle += particle.userData.speed * 0.1;
      particle.position.x = Math.cos(particle.userData.baseAngle) * particle.userData.baseRadius;
      particle.position.z = Math.sin(particle.userData.baseAngle) * particle.userData.baseRadius;
      particle.position.y += Math.sin(time * 2 + particle.userData.baseAngle) * particle.userData.floatSpeed;
      particle.rotation.x += particle.userData.rotationSpeed;
      particle.rotation.y += particle.userData.rotationSpeed * 1.2;
      particle.rotation.z += particle.userData.rotationSpeed * 0.8;
      
      const distance = Math.sqrt(
        particle.position.x ** 2 +
          particle.position.y ** 2 +
          particle.position.z ** 2
      );
      particle.material.opacity = 0.2 + (1 - distance / 6) * 0.4 + Math.sin(time * 2 + particle.userData.baseAngle) * 0.1;
      particle.scale.setScalar(1 + Math.sin(time * 3 + particle.userData.baseAngle) * 0.2);
    });

    if (camera) {
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.03;
      camera.position.z = 5 + Math.sin(time * 0.5) * 0.3;
      camera.lookAt(0, 0, 0);
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  onMount(() => {
    initThree();
    return () => {
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  });

  const nextProject = () => {
    currentProject = (currentProject + 1) % images.length;
  };

  const prevProject = () => {
    currentProject = (currentProject - 1 + images.length) % images.length;
  };
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a]">
  <div bind:this={container} class="fixed inset-0 z-0"></div>

  <div class="relative z-10">
    <div class="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div
        class="text-center mb-16 transform transition-all duration-1000"
        style="opacity: {loaded ? 1 : 0}; transform: translateY({loaded ? 0 : 50}px);"
      >
        <h1
          class="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,165,0,0.5)] animate-pulse"
        >
          {title}
        </h1>
        <h2
          class="text-3xl md:text-5xl text-amber-300 mb-4 drop-shadow-[0_0_20px_rgba(255,193,7,0.4)]"
        >
          {duration}
        </h2>
        <div class="text-2xl md:text-4xl text-orange-400 mb-8">
          {theme}
        </div>
        <a
          href="https://itch.io/jam/camgamejam2023"
          class="inline-block text-xl md:text-2xl text-amber-200 hover:text-amber-400 transition-colors duration-300 underline decoration-amber-400/50 hover:decoration-amber-400"
        >
          {submissions} {submissions == 1 ? "Submission" : "Submissions"}
        </a>
      </div>

      <div
        class="w-full max-w-6xl mb-20 transform transition-all duration-1000 delay-300"
        style="opacity: {loaded ? 1 : 0}; transform: translateY({loaded ? 0 : 50}px);"
      >
        <div class="relative h-[600px] rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-[0_0_50px_rgba(255,165,0,0.3)] backdrop-blur-sm bg-black/20">
          <div
            class="flex transition-transform duration-700 ease-in-out h-full"
            style="transform: translateX(-{currentProject * 100}%)"
          >
            {#each images as { src, alt, link, title: projectTitle, prize }, index}
              <a
                href={link}
                class="w-full h-full shrink-0 relative group cursor-pointer"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
                <img
                  {src}
                  {alt}
                  class="w-full h-full object-cover blur-sm scale-110 transition-all duration-700"
                  class:scale-100={index === currentProject}
                  class:opacity-30={index !== currentProject}
                />
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center text-center px-8 transform transition-all duration-700"
                  class:scale-110={index === currentProject}
                  class:opacity-50={index !== currentProject}
                >
                  <h3
                    class="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-[0_0_30px_rgba(255,165,0,0.8)] transform transition-all duration-500"
                    class:scale-110={index === currentProject}
                  >
                    {projectTitle}
                  </h3>
                  {#if prize}
                    <p
                      class="text-2xl md:text-4xl text-amber-300 drop-shadow-[0_0_20px_rgba(255,193,7,0.6)] transform transition-all duration-500"
                      class:scale-110={index === currentProject}
                    >
                      {prize}
                    </p>
                  {/if}
                </div>
                <div
                  class="absolute inset-0 border-4 border-amber-400/0 group-hover:border-amber-400/50 transition-all duration-500"
                ></div>
              </a>
            {/each}
          </div>

          <button
            onclick={prevProject}
            class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-amber-400 hover:text-amber-300 p-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,165,0,0.4)] hover:shadow-[0_0_30px_rgba(255,165,0,0.6)] backdrop-blur-sm border border-amber-400/30"
            aria-label="Previous project"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <button
            onclick={nextProject}
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-amber-400 hover:text-amber-300 p-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,165,0,0.4)] hover:shadow-[0_0_30px_rgba(255,165,0,0.6)] backdrop-blur-sm border border-amber-400/30"
            aria-label="Next project"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>

          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
            {#each images as _, index}
              <button
                onclick={() => (currentProject = index)}
                class="rounded-full transition-all duration-300 shadow-lg {index === currentProject ? 'bg-amber-400 w-8 h-3' : 'bg-amber-400/30 w-3 h-3'}"
                aria-label="Go to project {index + 1}"
              ></button>
            {/each}
          </div>
        </div>
      </div>

      <div
        class="text-center text-amber-200/80 text-lg md:text-xl max-w-3xl px-4 transform transition-all duration-1000 delay-500"
        style="opacity: {loaded ? 1 : 0}; transform: translateY({loaded ? 0 : 50}px);"
      >
        <p class="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>

      <a
        href="/archive"
        class="mt-16 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xl font-bold rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,165,0,0.4)] hover:shadow-[0_0_40px_rgba(255,165,0,0.6)] transform hover:scale-105"
        style="opacity: {loaded ? 1 : 0}; transform: translateY({loaded ? 0 : 50}px); transition: all 1s ease 0.7s;"
      >
        Back to Archive
      </a>
    </div>
  </div>

  <div class="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a1a] to-transparent pointer-events-none z-20"></div>
</div>
