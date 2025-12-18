<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  let canvasContainer;
  let scene, camera, renderer;
  let mirrorObjects = [];
  let lowPolyObjects = [];
  let particles = [];
  let animationFrameId;
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let currentImageIndex = 0;

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
      prize: "",
    },
  ];

  function createLowPolyShape(type, position, scale = 1, hue = null) {
    let geometry;
    
    switch(type) {
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(scale, 0);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(scale, 0);
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(scale, 0);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(scale, 0);
        break;
      default:
        geometry = new THREE.TetrahedronGeometry(scale, 0);
    }
    
    const finalHue = hue !== null ? hue : Math.random() * 0.3 + 0.5;
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(finalHue, 0.8, 0.6),
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color().setHSL(finalHue, 0.8, 0.15),
      envMapIntensity: 1.2,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return { 
      mesh, 
      basePosition: position.clone(), 
      baseRotation: { 
        x: Math.random() * Math.PI * 2, 
        y: Math.random() * Math.PI * 2, 
        z: Math.random() * Math.PI * 2 
      },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      },
      floatSpeed: Math.random() * 0.5 + 0.5,
      floatAmplitude: Math.random() * 0.8 + 0.4,
    };
  }

  function createMirrorPlane(width, height, position, rotation) {
    const mirrorGeometry = new THREE.PlaneGeometry(width, height, 32, 32);
    
    const positions = mirrorGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      positions[i + 2] = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.1;
    }
    mirrorGeometry.attributes.position.needsUpdate = true;
    mirrorGeometry.computeVertexNormals();
    
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
    });
    
    const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror.position.set(position.x, position.y, position.z);
    mirror.rotation.set(rotation.x, rotation.y, rotation.z);
    mirror.receiveShadow = true;
    
    return mirror;
  }

  function createParticleSystem(count) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 25 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const hue = Math.random() * 0.3 + 0.5;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.7);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.15 + 0.05;
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const points = new THREE.Points(geometry, material);
    return { points, velocities };
  }

  function createReflectionPlane() {
    const planeGeometry = new THREE.PlaneGeometry(40, 40, 64, 64);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -10;
    plane.receiveShadow = true;
    
    return plane;
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.08);

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(15, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 3, 60);
    pointLight1.position.set(-15, 8, -8);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 3, 60);
    pointLight2.position.set(15, 8, -8);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x9bff4a, 2.5, 60);
    pointLight3.position.set(0, -5, 15);
    pointLight3.castShadow = true;
    scene.add(pointLight3);

    const pointLight4 = new THREE.PointLight(0xffaa4a, 2, 50);
    pointLight4.position.set(0, 12, 0);
    pointLight4.castShadow = true;
    scene.add(pointLight4);

    const hues = [0.55, 0.6, 0.65, 0.7];
    for (let i = 0; i < 50; i++) {
      const type = ['tetrahedron', 'octahedron', 'icosahedron', 'dodecahedron'][Math.floor(Math.random() * 4)];
      const scale = Math.random() * 2 + 0.8;
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 35
      );
      const hue = hues[Math.floor(Math.random() * hues.length)];
      const obj = createLowPolyShape(type, position, scale, hue);
      lowPolyObjects.push(obj);
      scene.add(obj.mesh);
    }

    const mirror1 = createMirrorPlane(18, 12, new THREE.Vector3(-14, 2, -8), new THREE.Euler(0, Math.PI / 3.5, 0));
    scene.add(mirror1);
    mirrorObjects.push(mirror1);

    const mirror2 = createMirrorPlane(18, 12, new THREE.Vector3(14, 2, -8), new THREE.Euler(0, -Math.PI / 3.5, 0));
    scene.add(mirror2);
    mirrorObjects.push(mirror2);

    const mirror3 = createMirrorPlane(25, 15, new THREE.Vector3(0, 3, -18), new THREE.Euler(0, 0, 0));
    scene.add(mirror3);
    mirrorObjects.push(mirror3);

    const floorMirror = createMirrorPlane(60, 60, new THREE.Vector3(0, -10, 0), new THREE.Euler(-Math.PI / 2, 0, 0));
    scene.add(floorMirror);
    mirrorObjects.push(floorMirror);

    const reflectionPlane = createReflectionPlane();
    scene.add(reflectionPlane);

    const particleSystem1 = createParticleSystem(3000);
    scene.add(particleSystem1.points);
    particles.push(particleSystem1);

    const particleSystem2 = createParticleSystem(2000);
    scene.add(particleSystem2.points);
    particles.push(particleSystem2);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.016;

      const targetX = mouseX * 4;
      const targetY = mouseY * 4 + 8;
      camera.position.x += (targetX - camera.position.x) * 0.08;
      camera.position.y += (targetY - camera.position.y) * 0.08;
      camera.lookAt(mouseX * 2, mouseY * 2 + 2, 0);

      lowPolyObjects.forEach((obj, index) => {
        obj.mesh.rotation.x += obj.rotationSpeed.x;
        obj.mesh.rotation.y += obj.rotationSpeed.y;
        obj.mesh.rotation.z += obj.rotationSpeed.z;
        
        const floatY = Math.sin(time * obj.floatSpeed + index) * obj.floatAmplitude;
        const floatX = Math.cos(time * obj.floatSpeed * 1.3 + index) * obj.floatAmplitude * 0.6;
        const floatZ = Math.sin(time * obj.floatSpeed * 0.8 + index) * obj.floatAmplitude * 0.6;
        
        obj.mesh.position.x = obj.basePosition.x + floatX;
        obj.mesh.position.y = obj.basePosition.y + floatY;
        obj.mesh.position.z = obj.basePosition.z + floatZ;
        
        const pulse = Math.sin(time * 4 + index * 0.5) * 0.15 + 1;
        obj.mesh.scale.setScalar(pulse);
        
        const hueShift = Math.sin(time * 0.5 + index * 0.1) * 0.05;
        const currentHue = (obj.mesh.material.color.getHSL({}).h + hueShift) % 1;
        obj.mesh.material.color.setHSL(currentHue, 0.8, 0.6);
        obj.mesh.material.emissive.setHSL(currentHue, 0.8, 0.15);
      });

      mirrorObjects.forEach((mirror, index) => {
        const positions = mirror.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          positions[i + 2] = Math.sin(x * 0.3 + time * 2 + index) * Math.cos(y * 0.3 + time * 1.5) * 0.15;
        }
        mirror.geometry.attributes.position.needsUpdate = true;
        mirror.geometry.computeVertexNormals();
        
        mirror.rotation.y += Math.sin(time * 0.5 + index) * 0.003;
        mirror.rotation.x += Math.cos(time * 0.7 + index) * 0.002;
      });

      particles.forEach((particleSystem) => {
        const positions = particleSystem.points.geometry.attributes.position.array;
        const sizes = particleSystem.points.geometry.attributes.size.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const index = i / 3;
          const vel = particleSystem.velocities[index];
          
          positions[i] += vel.x + Math.sin(time + index) * 0.005;
          positions[i + 1] += vel.y + Math.cos(time * 1.2 + index) * 0.005;
          positions[i + 2] += vel.z + Math.sin(time * 0.8 + index) * 0.005;
          
          const distance = Math.sqrt(
            positions[i] ** 2 + 
            positions[i + 1] ** 2 + 
            positions[i + 2] ** 2
          );
          
          if (distance > 30) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 5;
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
          }
          
          sizes[index] = (Math.sin(time * 3 + index) * 0.05 + 0.1);
        }
        
        particleSystem.points.geometry.attributes.position.needsUpdate = true;
        particleSystem.points.geometry.attributes.size.needsUpdate = true;
      });

      pointLight1.position.x = -15 + Math.sin(time) * 3;
      pointLight1.position.z = -8 + Math.cos(time * 1.2) * 2;
      pointLight1.intensity = 3 + Math.sin(time * 2) * 0.5;

      pointLight2.position.x = 15 + Math.cos(time * 1.1) * 3;
      pointLight2.position.z = -8 + Math.sin(time * 0.9) * 2;
      pointLight2.intensity = 3 + Math.cos(time * 2.1) * 0.5;

      pointLight3.position.y = -5 + Math.sin(time * 1.5) * 2;
      pointLight3.intensity = 2.5 + Math.sin(time * 1.8) * 0.4;

      pointLight4.position.y = 12 + Math.sin(time * 0.8) * 1.5;
      pointLight4.intensity = 2 + Math.cos(time * 1.3) * 0.3;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      renderer.dispose();
    };
  }

  onMount(() => {
    if (canvasContainer) {
      const cleanup = initThree();
      return cleanup;
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="relative w-full min-h-screen overflow-hidden">
  <div bind:this={canvasContainer} class="fixed inset-0 z-0"></div>
  
  <div class="relative z-10 flex flex-col min-h-screen">
    <div class="flex-1 flex items-center justify-center px-4 py-20">
      <div class="text-center max-w-5xl">
        <div class="mb-8">
          <h1 class="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tighter" 
              style="background: linear-gradient(135deg, #4a9eff 0%, #ff6b9d 50%, #9bff4a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 80px rgba(74,158,255,0.5); filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));">
            {title}
          </h1>
        </div>
        <div class="text-2xl md:text-4xl lg:text-5xl mb-12 font-light text-white/90" 
             style="text-shadow: 0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(74,158,255,0.2);">
          {duration}
        </div>
        <div class="text-4xl md:text-6xl lg:text-7xl mb-16 font-bold text-white" 
             style="background: linear-gradient(135deg, #9bff4a 0%, #4a9eff 50%, #ff6b9d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 60px rgba(155,255,74,0.4); filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));">
          {theme}
        </div>
        <a 
          href="https://itch.io/jam/camgamejam2024" 
          target="_blank"
          class="inline-block text-xl md:text-2xl lg:text-3xl px-10 py-5 bg-white/10 backdrop-blur-xl rounded-full border-2 border-white/40 hover:bg-white/20 hover:border-white/60 transition-all duration-500 text-white font-semibold shadow-2xl"
          style="text-shadow: 0 0 20px rgba(255,255,255,0.6); box-shadow: 0 0 40px rgba(74,158,255,0.3), inset 0 0 20px rgba(255,255,255,0.1);"
        >
          {submissions} {submissions == 1 ? "Submission" : "Submissions"}
        </a>
      </div>
    </div>

    <div class="pb-12 px-4 md:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {#each images as { src, alt, link, title: imgTitle, prize }, index}
            <a 
              href={link} 
              target="_blank"
              class="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 hover:border-white/50 transition-all duration-700 hover:scale-105 hover:rotate-1 shadow-2xl"
              style="animation-delay: {index * 100}ms;"
            >
              <div class="aspect-video relative overflow-hidden">
                <img 
                  src={src} 
                  alt={alt}
                  class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-2"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-700"></div>
              </div>
              <div class="p-5 md:p-6">
                <h3 class="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-pink-400 transition-all duration-500">{imgTitle}</h3>
                {#if prize}
                  <p class="text-sm md:text-base text-white/70 group-hover:text-white/90 transition-colors duration-500">{prize}</p>
                {/if}
              </div>
              <div class="absolute top-4 right-4 w-3 h-3 rounded-full bg-white/0 group-hover:bg-white/100 transition-all duration-500 shadow-lg group-hover:shadow-white/50"></div>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="fixed top-6 left-6 z-30">
    <a 
      href="/archive" 
      class="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-white font-medium shadow-lg"
      style="box-shadow: 0 0 20px rgba(74,158,255,0.2);"
    >
      ← Back to Archive
    </a>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #050510;
  }
  
  h1, h3, p {
    margin: 0;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
</style>
