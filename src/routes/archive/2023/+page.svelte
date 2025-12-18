<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let canvasContainer;
  let scene, camera, renderer;
  let caveGeometry, caveMaterial, caveMesh;
  let caveGroup;
  let particles;
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let animationFrameId;
  let time = 0;

  const featuredProjects = [
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

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = 19;
  const theme = "Beneath the Earth";

  onMount(() => {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.08);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({
      canvas: canvasContainer,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    caveGroup = new THREE.Group();

    const caveShape = new THREE.Shape();
    const width = 10;
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2;
      const noise = Math.sin(angle * 5) * 0.2 + Math.sin(angle * 13) * 0.1;
      const radius = width * (1 + noise);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        caveShape.moveTo(x, y);
      } else {
        caveShape.lineTo(x, y);
      }
    }
    caveShape.closePath();

    const extrudeSettings = {
      depth: 25,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.2,
      bevelSegments: 5,
      steps: 20,
    };

    caveGeometry = new THREE.ExtrudeGeometry(caveShape, extrudeSettings);
    caveGeometry.rotateX(-Math.PI / 2);
    caveGeometry.translate(0, -12.5, 0);

    caveMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1414,
      roughness: 0.95,
      metalness: 0.05,
      emissive: 0x0a0505,
      emissiveIntensity: 0.1,
    });

    caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
    caveMesh.castShadow = true;
    caveMesh.receiveShadow = true;
    caveGroup.add(caveMesh);

    for (let i = 0; i < 30; i++) {
      const stalactiteGeometry = new THREE.ConeGeometry(
        0.1 + Math.random() * 0.15,
        1 + Math.random() * 2,
        8
      );
      const stalactiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d1b1b,
        roughness: 0.9,
        metalness: 0.1,
      });
      const stalactite = new THREE.Mesh(
        stalactiteGeometry,
        stalactiteMaterial
      );
      const angle = (Math.PI * 2 * i) / 30;
      const radius = 4 + Math.random() * 2;
      stalactite.position.set(
        Math.cos(angle) * radius,
        5 + Math.random() * 2,
        Math.sin(angle) * radius
      );
      stalactite.rotation.x = Math.random() * 0.2 - 0.1;
      stalactite.rotation.z = Math.random() * 0.2 - 0.1;
      stalactite.castShadow = true;
      caveGroup.add(stalactite);
    }

    for (let i = 0; i < 20; i++) {
      const stalagmiteGeometry = new THREE.ConeGeometry(
        0.15 + Math.random() * 0.2,
        0.8 + Math.random() * 1.5,
        8
      );
      const stalagmiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d1b1b,
        roughness: 0.9,
        metalness: 0.1,
      });
      const stalagmite = new THREE.Mesh(
        stalagmiteGeometry,
        stalagmiteMaterial
      );
      const angle = (Math.PI * 2 * i) / 20;
      const radius = 3 + Math.random() * 2;
      stalagmite.position.set(
        Math.cos(angle) * radius,
        -5 - Math.random() * 1,
        Math.sin(angle) * radius
      );
      stalagmite.rotation.x = Math.PI;
      stalagmite.rotation.x += Math.random() * 0.2 - 0.1;
      stalagmite.rotation.z = Math.random() * 0.2 - 0.1;
      stalagmite.castShadow = true;
      caveGroup.add(stalagmite);
    }

    scene.add(caveGroup);
    caveMesh = caveGroup;

    const ambientLight = new THREE.AmbientLight(0x3a2a1a, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffaa44, 2, 60);
    pointLight1.position.set(-4, 3, 4);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 1024;
    pointLight1.shadow.mapSize.height = 1024;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x44aaff, 1.2, 50);
    pointLight2.position.set(4, -3, -4);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xff8844, 1.5, 45);
    pointLight3.position.set(0, 6, 0);
    pointLight3.castShadow = true;
    scene.add(pointLight3);

    const spotLight = new THREE.SpotLight(0xffdd88, 1.5, 50, Math.PI / 6, 0.5);
    spotLight.position.set(0, 8, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      const color = Math.random() > 0.5 ? 0xffaa44 : 0x44aaff;
      colors[i3] = ((color >> 16) & 255) / 255;
      colors[i3 + 1] = ((color >> 8) & 255) / 255;
      colors[i3 + 2] = (color & 255) / 255;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

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

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.008;

      caveGroup.rotation.y += 0.001;
      caveGroup.rotation.x = Math.sin(time * 0.4) * 0.05;

      camera.position.x += (mouseX * 2.5 - camera.position.x) * 0.06;
      camera.position.y += (mouseY * 2.5 - camera.position.y) * 0.06;
      camera.position.z = 8 + scrollY * 0.015;
      camera.lookAt(0, 0, 0);

      pointLight1.position.x = Math.sin(time) * 4;
      pointLight1.position.z = Math.cos(time) * 4;
      pointLight1.position.y = 3 + Math.sin(time * 0.7) * 1.5;
      pointLight1.intensity = 2 + Math.sin(time * 1.2) * 0.5;

      pointLight2.position.x = Math.cos(time * 0.8) * 4;
      pointLight2.position.z = Math.sin(time * 0.8) * 4;
      pointLight2.position.y = -3 + Math.cos(time * 0.5) * 1;
      pointLight2.intensity = 1.2 + Math.cos(time * 1.5) * 0.3;

      pointLight3.position.y = 6 + Math.sin(time * 0.3) * 1.5;
      pointLight3.intensity = 1.5 + Math.sin(time * 0.9) * 0.4;

      spotLight.position.x = Math.sin(time * 0.6) * 2;
      spotLight.position.z = Math.cos(time * 0.6) * 2;
      spotLight.intensity = 1.5 + Math.sin(time * 1.1) * 0.5;

      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.002;
        positions[i3] += Math.cos(time * 0.3 + i * 0.1) * 0.002;
        positions[i3 + 2] += Math.sin(time * 0.7 + i * 0.1) * 0.001;
        if (Math.abs(positions[i3 + 1]) > 15) positions[i3 + 1] *= -0.8;
        if (Math.abs(positions[i3]) > 15) positions[i3] *= -0.8;
        if (Math.abs(positions[i3 + 2]) > 15) positions[i3 + 2] *= -0.8;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0005;

      caveGroup.children.forEach((child, index) => {
        if (index > 0) {
          child.rotation.y += 0.0005 * (index % 2 === 0 ? 1 : -1);
          child.position.y += Math.sin(time + index) * 0.01;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (caveGeometry) caveGeometry.dispose();
      if (caveMaterial) caveMaterial.dispose();
      if (particleGeometry) particleGeometry.dispose();
      if (particleMaterial) particleMaterial.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-[#1a1a2e]">
  <canvas
    bind:this={canvasContainer}
    class="fixed top-0 left-0 w-full h-full z-0"
  ></canvas>

  <div class="relative z-10">
    <div class="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div
        class="text-center mb-16 animate-fade-in relative"
        style="animation: fadeInUp 1.5s ease-out;"
      >
        <div
          class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"
          style="filter: blur(40px);"
        >
          <h1
            class="text-6xl md:text-8xl font-bold text-amber-400"
            style="animation: glowPulse 3s ease-in-out infinite;"
          >
            {title}
          </h1>
        </div>
        <h1
          class="relative text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600"
          style="text-shadow: 0 0 40px rgba(255, 170, 68, 0.8), 0 0 80px rgba(255, 170, 68, 0.4), 0 0 120px rgba(255, 170, 68, 0.2); animation: titleShimmer 4s ease-in-out infinite;"
        >
          {title}
        </h1>
        <div
          class="text-2xl md:text-4xl text-amber-300 mb-4 font-light tracking-wider relative"
          style="text-shadow: 0 0 20px rgba(255, 193, 7, 0.6), 0 0 40px rgba(255, 193, 7, 0.3); animation: fadeInUp 1.8s ease-out 0.3s both;"
        >
          <span class="relative z-10">{duration}</span>
          <span
            class="absolute inset-0 blur-sm opacity-50"
            style="animation: glowPulse 2.5s ease-in-out infinite 0.5s;"
          >
            {duration}
          </span>
        </div>
        <div
          class="text-xl md:text-3xl text-orange-400 mb-6 font-semibold relative inline-block"
          style="text-shadow: 0 0 15px rgba(255, 152, 0, 0.5), 0 0 30px rgba(255, 152, 0, 0.3); animation: fadeInUp 2s ease-out 0.6s both;"
        >
          <span class="relative z-10">{theme}</span>
          <span
            class="absolute -inset-2 bg-orange-500/20 blur-xl opacity-0"
            style="animation: themeGlow 3s ease-in-out infinite 1s;"
          ></span>
        </div>
        <a
          href="https://itch.io/jam/camgamejam2023"
          class="relative inline-block text-lg md:text-xl text-blue-400 hover:text-blue-200 transition-all duration-500 underline decoration-2 underline-offset-4 hover:decoration-blue-300 group"
          style="text-shadow: 0 0 10px rgba(66, 170, 255, 0.4); animation: fadeInUp 2.2s ease-out 0.9s both;"
        >
          <span class="relative z-10">{submissions} {submissions == 1 ? "Submission" : "Submissions"}</span>
          <span
            class="absolute inset-0 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"
            style="text-shadow: 0 0 20px rgba(66, 170, 255, 0.8);"
          >
            {submissions} {submissions == 1 ? "Submission" : "Submissions"}
          </span>
        </a>
      </div>

      <div class="w-full max-w-6xl mt-20">
        <h2
          class="text-4xl md:text-5xl font-bold text-center mb-12 text-amber-400 relative inline-block"
          style="text-shadow: 0 0 20px rgba(255, 193, 7, 0.6), 0 0 40px rgba(255, 193, 7, 0.3); animation: fadeInUp 2s ease-out 0.5s both;"
        >
          <span class="relative z-10">Featured Projects</span>
          <span
            class="absolute inset-0 blur-xl opacity-30"
            style="animation: glowPulse 3s ease-in-out infinite 1s;"
          >
            Featured Projects
          </span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each featuredProjects as project, index}
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              class="group relative block overflow-hidden rounded-lg bg-gradient-to-br from-amber-900/50 to-orange-900/50 backdrop-blur-md border-2 border-amber-800/60 hover:border-amber-500/90 transition-all duration-700 hover:scale-[1.08] hover:shadow-[0_0_60px_rgba(255,170,68,0.6),inset_0_0_30px_rgba(255,170,68,0.1)]"
              style="animation: fadeInUp 1s ease-out {index * 0.15 + 1}s both, float 6s ease-in-out infinite {index * 0.2}s;"
              onmouseenter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
              }}
              onmousemove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
              }}
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-red-500/0 group-hover:from-amber-500/30 group-hover:via-orange-500/20 group-hover:to-red-500/10 transition-all duration-700 z-10"
              ></div>
              <div
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style="background: radial-gradient(circle 300px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,170,68,0.15), transparent 70%);"
              ></div>
              <div class="relative z-20 p-6">
                <div
                  class="relative overflow-hidden rounded-lg mb-4 aspect-video bg-black/70 group-hover:bg-black/50 transition-all duration-700"
                  style="box-shadow: inset 0 0 40px rgba(0,0,0,0.9), 0 0 30px rgba(255,170,68,0.4), 0 0 60px rgba(255,170,68,0.2);"
                >
                  <div
                    class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
                    style="background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), transparent 30%, rgba(255,170,68,0.3) 100%);"
                  ></div>
                  <img
                    src={project.src}
                    alt={project.alt}
                    class="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:brightness-110"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                  ></div>
                  <div
                    class="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(255,193,7,0.8)]"
                    style="animation: pulse 2s ease-in-out infinite;"
                  ></div>
                </div>
                <h3
                  class="text-xl font-bold text-amber-300 mb-2 group-hover:text-amber-100 transition-all duration-500 group-hover:translate-x-1"
                  style="text-shadow: 0 0 15px rgba(255, 193, 7, 0.5), 0 2px 4px rgba(0,0,0,0.5);"
                >
                  {project.title}
                </h3>
                <p
                  class="text-sm text-orange-400 font-medium group-hover:text-orange-300 transition-all duration-500"
                  style="text-shadow: 0 0 10px rgba(255, 152, 0, 0.4), 0 1px 2px rgba(0,0,0,0.5);"
                >
                  {project.prize}
                </p>
              </div>
              <div
                class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style="transform: translateX(-100%); animation: slideIn 0.7s ease-out forwards;"
              ></div>
            </a>
          {/each}
        </div>

        <div class="mt-16 text-center">
          <a
            href="https://itch.io/jam/camgamejam2023"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-300 shadow-[0_0_30px_rgba(255,170,68,0.5)] hover:shadow-[0_0_50px_rgba(255,170,68,0.8)] hover:scale-105"
            style="animation: fadeInUp 1s ease-out 2s both;"
          >
            View All Submissions
          </a>
        </div>
      </div>

      <div class="mt-20 mb-8">
        <BackToMainButton />
      </div>
    </div>
  </div>
</div>

<style>
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

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }

  @keyframes slideIn {
    to {
      transform: translateX(0);
    }
  }

  @keyframes glowPulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }

  @keyframes titleShimmer {
    0%, 100% {
      filter: brightness(1) saturate(1);
    }
    50% {
      filter: brightness(1.2) saturate(1.3);
    }
  }

  @keyframes themeGlow {
    0%, 100% {
      opacity: 0;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(1.1);
    }
  }

  .animate-fade-in {
    animation: fadeInUp 1.5s ease-out;
  }
</style>
