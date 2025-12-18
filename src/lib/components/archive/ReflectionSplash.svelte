<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  const { images, title, duration, submissions, theme } = $props();

  let container;
  let scene, camera, renderer;
  let mirrorGroup;
  let lowPolyObjects = [];
  let animationId;

  const createLowPolyGeometry = () => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const positions = geometry.attributes.position;
    const count = positions.count;

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const noise = (Math.random() - 0.5) * 0.3;
      positions.setX(i, x + noise);
      positions.setY(i, y + noise);
      positions.setZ(i, z + noise);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90e2, 1, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    mirrorGroup = new THREE.Group();
    scene.add(mirrorGroup);

    const mirrorGeometry = new THREE.PlaneGeometry(4, 4);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 1.0,
      roughness: 0.05,
      side: THREE.DoubleSide,
    });

    const mirror1 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror1.position.set(-3, 2, -2);
    mirror1.rotation.y = Math.PI / 4;
    mirrorGroup.add(mirror1);

    const mirror2 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror2.position.set(3, 2, -2);
    mirror2.rotation.y = -Math.PI / 4;
    mirrorGroup.add(mirror2);

    const mirror3 = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror3.position.set(0, 0, -4);
    mirror3.rotation.x = Math.PI / 6;
    mirrorGroup.add(mirror3);

    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2d44,
      metalness: 0.3,
      roughness: 0.7,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    for (let i = 0; i < 8; i++) {
      const geometry = createLowPolyGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        metalness: 0.5,
        roughness: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const scale = 0.5 + Math.random() * 0.5;
      mesh.scale.set(scale, scale, scale);

      const angle = (i / 8) * Math.PI * 2;
      const radius = 2 + Math.random() * 2;
      mesh.position.set(
        Math.cos(angle) * radius,
        -1 + Math.random() * 2,
        Math.sin(angle) * radius
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      lowPolyObjects.push(mesh);
      scene.add(mesh);
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      lowPolyObjects.forEach((obj, index) => {
        obj.rotation.x += 0.005;
        obj.rotation.y += 0.008;
        obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
      });

      mirrorGroup.rotation.y += 0.002;

      camera.position.x = Math.sin(Date.now() * 0.0005) * 1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  };

  onMount(() => {
    if (container) {
      const cleanup = initScene();
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        if (renderer) {
          renderer.dispose();
          if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
          }
        }
        lowPolyObjects.forEach((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        if (scene) {
          while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
          }
        }
        if (cleanup) {
          cleanup();
        }
      };
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="reflection-splash-page relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
  <div bind:this={container} class="absolute inset-0 w-full h-full"></div>

  <div class="absolute inset-0 z-10 flex flex-col items-center justify-center text-white pointer-events-none">
    <div class="text-center px-4">
      <h1 class="text-6xl md:text-8xl font-bold mb-4 drop-shadow-2xl">
        {title}
      </h1>
      <h2 class="text-2xl md:text-4xl mb-6 drop-shadow-xl">{duration}</h2>
      <div class="text-xl md:text-2xl mb-4 drop-shadow-lg">
        <span class="font-semibold">Theme:</span> {theme}
      </div>
      <a
        href="https://itch.io/jam/camgamejam2024"
        class="text-lg md:text-xl underline pointer-events-auto hover:text-blue-300 transition-colors"
      >
        {submissions} {submissions == 1 ? "Submission" : "Submissions"}
      </a>
    </div>
  </div>

  <div
    class="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pointer-events-none"
  >
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {#each images.slice(0, 5) as { src, alt, link, title, prize }}
          <a
            href={link}
            class="pointer-events-auto group relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <img
              {src}
              {alt}
              class="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div class="p-2 text-white text-xs">
              <div class="font-semibold truncate">{title}</div>
              {#if prize}
                <div class="text-xs opacity-75 truncate">{prize}</div>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </div>
  </div>

  <div class="absolute top-4 left-4 z-30 pointer-events-auto">
    <BackToMainButton />
  </div>
</div>

<style>
  :global(body:has(.reflection-splash-page)) {
    overflow: hidden;
  }
</style>
