<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import BackToMainButton from "$lib/components/BackToMainButton.svelte";

  let canvasContainer;
  let scene, camera, renderer;
  let mirrorPlane, mirrorCamera, mirrorRenderTarget;
  let objects = [];
  let animationId;

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

  function createLowPolyGeometry() {
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
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4a90e2, 1, 100);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe24a90, 1, 100);
    pointLight2.position.set(5, 5, -5);
    scene.add(pointLight2);

    for (let i = 0; i < 8; i++) {
      const geometry = createLowPolyGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          (i * 0.1) % 1,
          0.7,
          0.5 + Math.random() * 0.3
        ),
        metalness: 0.8,
        roughness: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const angle = (i / 8) * Math.PI * 2;
      const radius = 3;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.random() * 2 - 1,
        Math.sin(angle) * radius
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      objects.push({
        mesh,
        baseAngle: angle,
        baseRadius: radius,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });

      scene.add(mesh);
    }

    mirrorRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    mirrorRenderTarget.texture.format = THREE.RGBAFormat;
    mirrorRenderTarget.texture.type = THREE.HalfFloatType;

    mirrorCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const mirrorGeometry = new THREE.PlaneGeometry(15, 15);
    const mirrorMaterial = new THREE.ShaderMaterial({
      uniforms: {
        mirrorTexture: { value: mirrorRenderTarget.texture },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D mirrorTexture;
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
          vec4 reflection = texture2D(mirrorTexture, uv);
          vec3 baseColor = vec3(0.3, 0.3, 0.35);
          vec3 finalColor = mix(baseColor, reflection.rgb, 0.85);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    mirrorPlane = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirrorPlane.rotation.x = -Math.PI / 2;
    mirrorPlane.position.y = -2;
    mirrorPlane.receiveShadow = true;
    scene.add(mirrorPlane);

    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.3,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.1;
    floor.receiveShadow = true;
    scene.add(floor);

    function animate() {
      animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      if (mirrorMaterial.uniforms) {
        mirrorMaterial.uniforms.time.value = time;
      }

      objects.forEach((obj, i) => {
        obj.mesh.rotation.x += obj.rotationSpeed;
        obj.mesh.rotation.y += obj.rotationSpeed * 0.7;
        obj.mesh.rotation.z += obj.rotationSpeed * 0.3;

        const angle = obj.baseAngle + time * 0.1;
        obj.mesh.position.x = Math.cos(angle) * obj.baseRadius;
        obj.mesh.position.z = Math.sin(angle) * obj.baseRadius;
        obj.mesh.position.y =
          Math.sin(time * 0.5 + i) * 0.5 + Math.random() * 0.3;
      });

      const mirrorY = mirrorPlane.position.y;
      mirrorCamera.position.copy(camera.position);
      mirrorCamera.position.y = 2 * mirrorY - camera.position.y;
      mirrorCamera.rotation.x = -camera.rotation.x;
      mirrorCamera.rotation.y = camera.rotation.y;
      mirrorCamera.rotation.z = -camera.rotation.z;

      mirrorPlane.visible = false;
      renderer.setRenderTarget(mirrorRenderTarget);
      renderer.render(scene, mirrorCamera);
      renderer.setRenderTarget(null);
      mirrorPlane.visible = true;

      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mirrorRenderTarget.setSize(window.innerWidth, window.innerHeight);
      mirrorCamera.aspect = window.innerWidth / window.innerHeight;
      mirrorCamera.updateProjectionMatrix();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) cancelAnimationFrame(animationId);
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

<div class="relative w-full min-h-screen">
  <div bind:this={canvasContainer} class="fixed inset-0"></div>

  <div class="relative z-10 flex flex-col items-center justify-center min-h-screen py-20 text-white">
    <div class="text-center mb-8 px-4">
      <h1 class="text-6xl md:text-8xl font-bold mb-4 drop-shadow-2xl">
        {title}
      </h1>
      <h2 class="text-3xl md:text-4xl mb-6 drop-shadow-xl">{duration}</h2>
      <div class="text-2xl md:text-3xl mb-8 drop-shadow-lg">
        <p class="mb-2">Theme: {theme}</p>
        <a
          href="https://itch.io/jam/camgamejam2024"
          class="underline hover:text-blue-300 transition-colors"
        >
          {submissions} {submissions == 1 ? "Submission" : "Submissions"}
        </a>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl px-4 mt-8">
      {#each images.slice(0, 5) as { src, alt, link, title: gameTitle, prize }}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          class="group bg-black/40 backdrop-blur-sm rounded-lg p-4 hover:bg-black/60 transition-all transform hover:scale-105"
        >
          <img
            {src}
            {alt}
            class="w-full h-48 object-cover rounded mb-2"
          />
          <h3 class="text-lg font-bold mb-1">{gameTitle}</h3>
          {#if prize}
            <p class="text-sm text-gray-300">{prize}</p>
          {/if}
        </a>
      {/each}
    </div>

    <div class="mt-8">
      <BackToMainButton />
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
</style>
