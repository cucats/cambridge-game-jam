<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let container;
  let scene, camera, renderer;
  let mirrorObjects = [];
  let lowPolyObjects = [];
  let particles = [];
  let animationId;

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const submissions = 23;
  const theme = "Reflection";

  const featuredGames = [
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
  ];

  function createLowPolyGeometry(vertices, faces) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];

    vertices.forEach((v) => {
      positions.push(v.x, v.y, v.z);
    });

    faces.forEach((f) => {
      indices.push(f[0], f[1], f[2]);
    });

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  function createLowPolyCube(size = 1) {
    const s = size / 2;
    const vertices = [
      new THREE.Vector3(-s, -s, -s),
      new THREE.Vector3(s, -s, -s),
      new THREE.Vector3(s, s, -s),
      new THREE.Vector3(-s, s, -s),
      new THREE.Vector3(-s, -s, s),
      new THREE.Vector3(s, -s, s),
      new THREE.Vector3(s, s, s),
      new THREE.Vector3(-s, s, s),
    ];

    const faces = [
      [0, 1, 2],
      [0, 2, 3],
      [1, 5, 6],
      [1, 6, 2],
      [5, 4, 7],
      [5, 7, 6],
      [4, 0, 3],
      [4, 3, 7],
      [3, 2, 6],
      [3, 6, 7],
      [0, 4, 5],
      [0, 5, 1],
    ];

    return createLowPolyGeometry(vertices, faces);
  }

  function createLowPolySphere(radius = 1, segments = 8) {
    const vertices = [];
    const faces = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i * Math.PI) / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let j = 0; j <= segments; j++) {
        const phi = (j * 2 * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        vertices.push(
          new THREE.Vector3(x * radius, y * radius, z * radius)
        );
      }
    }

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;

        faces.push([a, b, a + 1]);
        faces.push([b, b + 1, a + 1]);
      }
    }

    return createLowPolyGeometry(vertices, faces);
  }

  function createMirrorPlane(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height, 8, 8);
    geometry.rotateX(-Math.PI / 2);
    geometry.rotateX(Math.PI / 2);
    
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
    });

    const mirror = new THREE.Mesh(geometry, mirrorMaterial);
    return mirror;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 1.5, 20);
    pointLight1.position.set(-5, 3, 5);
    pointLight1.userData.initialX = -5;
    pointLight1.userData.initialZ = 5;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 1.5, 20);
    pointLight2.position.set(5, 3, -5);
    pointLight2.userData.initialX = 5;
    pointLight2.userData.initialZ = -5;
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x9bff4a, 1.5, 20);
    pointLight3.position.set(0, -3, 0);
    pointLight3.userData.initialX = 0;
    pointLight3.userData.initialZ = 0;
    scene.add(pointLight3);

    const mirror1 = createMirrorPlane(10, 8);
    mirror1.position.set(0, 0, -6);
    mirror1.rotation.y = 0;
    scene.add(mirror1);
    mirrorObjects.push(mirror1);

    const mirror2 = createMirrorPlane(10, 8);
    mirror2.position.set(-7, 0, 0);
    mirror2.rotation.y = Math.PI / 2;
    scene.add(mirror2);
    mirrorObjects.push(mirror2);

    const mirror3 = createMirrorPlane(10, 8);
    mirror3.position.set(7, 0, 0);
    mirror3.rotation.y = -Math.PI / 2;
    scene.add(mirror3);
    mirrorObjects.push(mirror3);

    const mirror4 = createMirrorPlane(10, 8);
    mirror4.position.set(0, 4, 0);
    mirror4.rotation.x = -Math.PI / 2;
    scene.add(mirror4);
    mirrorObjects.push(mirror4);

    for (let i = 0; i < 15; i++) {
      const geometry =
        Math.random() > 0.5
          ? createLowPolyCube(0.5 + Math.random() * 1.5)
          : createLowPolySphere(0.3 + Math.random() * 0.8, 6 + Math.floor(Math.random() * 4));

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        metalness: 0.3 + Math.random() * 0.4,
        roughness: 0.2 + Math.random() * 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 8
      );

      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatAmount: Math.random() * 0.5 + 0.3,
        initialY: mesh.position.y,
      };

      scene.add(mesh);
      lowPolyObjects.push(mesh);
    }

    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 10 - 5;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);

    for (let i = 0; i < 10; i++) {
      const geometry = createLowPolyCube(0.2 + Math.random() * 0.3);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        emissive: new THREE.Color().setHSL(Math.random(), 1, 0.2),
        metalness: 0.5,
        roughness: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 15,
        Math.random() * 8 - 2,
        (Math.random() - 0.5) * 15
      );

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05,
          z: (Math.random() - 0.5) * 0.05,
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatAmount: Math.random() * 1 + 0.5,
        initialY: mesh.position.y,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      };

      scene.add(mesh);
      lowPolyObjects.push(mesh);
    }

    animate();
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    if (camera) {
      const baseX = Math.sin(time * 0.2) * 2;
      const baseY = 2 + Math.sin(time * 0.15) * 0.5;
      camera.position.x += (baseX + mouseX * 0.5 - camera.position.x) * 0.1;
      camera.position.y += (baseY + mouseY * 0.3 - camera.position.y) * 0.1;
      camera.lookAt(0, 0, 0);
    }

    lowPolyObjects.forEach((obj, index) => {
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;

      obj.position.y =
        obj.userData.initialY +
        Math.sin(time * obj.userData.floatSpeed + index) *
          obj.userData.floatAmount;

      obj.position.x += Math.sin(time * 0.1 + index) * 0.01;
      obj.position.z += Math.cos(time * 0.1 + index) * 0.01;

      if (obj.material.emissive) {
        const pulse = Math.sin(time * (obj.userData.pulseSpeed || 0.01) + index) * 0.5 + 0.5;
        obj.material.emissiveIntensity = pulse * 0.3;
      }

      const scale = 1 + Math.sin(time * 0.5 + index) * 0.1;
      obj.scale.set(scale, scale, scale);
    });

    mirrorObjects.forEach((mirror, index) => {
      mirror.rotation.y += Math.sin(time * 0.1 + index) * 0.001;
      const pulse = Math.sin(time * 0.3 + index) * 0.1 + 0.9;
      mirror.material.envMapIntensity = 1.5 * pulse;
    });

    particles.forEach((particleSystem) => {
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 0.5 + i) * 0.01;
        if (positions[i] > 5) positions[i] = -5;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y += 0.001;
    });

    scene.children.forEach((child) => {
      if (child.type === "PointLight") {
        child.position.x = child.userData.initialX + Math.sin(time * 0.3) * 2;
        child.position.z = child.userData.initialZ + Math.cos(time * 0.3) * 2;
        child.intensity = 1.5 + Math.sin(time * 0.5) * 0.5;
      }
      if (child.type === "DirectionalLight") {
        child.position.x = 5 + Math.sin(time * 0.2) * 2;
        child.position.z = 5 + Math.cos(time * 0.2) * 2;
      }
    });

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMount(() => {
    if (container) {
      initThree();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        if (renderer) {
          renderer.dispose();
        }
      };
    }
  });

  let mouseX = 0;
  let mouseY = 0;

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div
  class="fixed inset-0 z-0"
  bind:this={container}
  onmousemove={handleMouseMove}
  role="presentation"
></div>

<div class="relative z-10 min-h-screen">
  <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>

  <div class="relative z-20 container mx-auto px-4 py-16">
    <div class="text-center mb-20">
      <div class="inline-block mb-8">
        <img
          src="/2024/logo.png"
          alt="Cambridge Game Jam Logo"
          class="w-48 h-48 mx-auto drop-shadow-2xl animate-pulse"
        />
      </div>
      <h1 class="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl animate-fade-in">
        {title}
      </h1>
      <h2 class="text-3xl md:text-5xl text-white/90 mb-6 drop-shadow-xl">
        {duration}
      </h2>
      <div class="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-8 animate-gradient">
        {theme}
      </div>
      <a
        href="https://itch.io/jam/camgamejam2024"
        class="inline-block text-2xl text-white/80 hover:text-white transition-colors underline decoration-2 underline-offset-4"
      >
        {submissions} {submissions == 1 ? "Submission" : "Submissions"}
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
      {#each featuredGames as game, index}
        <a
          href={game.link}
          target="_blank"
          rel="noopener noreferrer"
          class="group relative overflow-hidden rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-card-in"
          style="animation-delay: {index * 0.15}s"
        >
          <div class="aspect-video relative overflow-hidden">
            <img
              src={game.src}
              alt={game.alt}
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-2">{game.title}</h3>
            <p class="text-sm text-white/70">{game.prize}</p>
          </div>
        </a>
      {/each}
    </div>

    <div class="mt-20 text-center">
      <a
        href="/archive"
        class="inline-block px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 text-lg font-semibold"
      >
        Back to Archive
      </a>
    </div>
  </div>
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes gradient {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-fade-in {
    animation: fade-in 1s ease-out;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }

  .animate-card-in {
    animation: card-in 0.6s ease-out backwards;
  }

  .animate-pulse {
    animation: float 3s ease-in-out infinite;
  }

  .container {
    max-width: 1200px;
  }
</style>