<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  const title = "Cambridge Game Jam 2023";
  const duration = "10th - 12th February";
  const submissions = "19 Submissions";
  const theme = "Beneath the Earth";

  const projects = [
    {
      src: "/2023/inferno-rising.png",
      title: "Inferno Rising",
      prize: "Popular Vote",
      link: "https://firedemon111.itch.io/inferno-rising"
    },
    {
      src: "/2023/mayi-garden.png",
      title: "MAYI Garden",
      prize: "Best for Theme",
      link: "https://qiaozhi-lei.itch.io/mayi-garden"
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever"
    },
    {
      src: "/2023/beaneth-the-earth.png",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      link: "https://mxbi.itch.io/beaneth-the-earth"
    },
    {
      src: "/2023/deck-of-dwarves.png",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      link: "https://joeoc.itch.io/deck-of-dwarves"
    },
    {
      src: "/2023/all-submissions.png",
      title: "All Submissions",
      prize: "",
      link: "https://itch.io/jam/camgamejam2023"
    }
  ];

  let container;
  let canvas;
  let width, height;

  onMount(() => {
    width = window.innerWidth;
    height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x110b29, 0.035);
    scene.background = new THREE.Color(0x110b29);

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    camera.position.z = 5;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xaa88ff, 3, 50);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    const caveGroup = new THREE.Group();
    scene.add(caveGroup);

    const geometry = new THREE.DodecahedronGeometry(1, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x332244,
      roughness: 0.8,
      flatShading: true
    });

    const particles = new THREE.BufferGeometry();
    const particleCount = 1500;
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 40;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    for (let i = 0; i < 400; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      const z = (Math.random() - 0.5) * 60;
      
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.setScalar(0.5 + Math.random());
      caveGroup.add(mesh);
    }

    const textureLoader = new THREE.TextureLoader();
    const projectMeshes = [];

    projects.forEach((proj, i) => {
        textureLoader.load(proj.src, (texture) => {
            const aspect = texture.image.width / texture.image.height;
            const planeGeo = new THREE.PlaneGeometry(3, 3 / aspect);
            const planeMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(planeGeo, planeMat);
            
            const theta = (i / projects.length) * Math.PI * 2;
            const r = 5;
            plane.position.set(
                Math.cos(theta) * r,
                Math.sin(theta) * r * 0.5 + (Math.random() - 0.5),
                -10 - i * 5
            );
            plane.lookAt(0, 0, plane.position.z + 10);
            
            plane.userData = { link: proj.link };
            
            scene.add(plane);
            projectMeshes.push(plane);

            const light = new THREE.PointLight(0xffaa00, 1, 10);
            light.position.copy(plane.position);
            light.position.z += 1;
            scene.add(light);
        });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
        mouse.x = (event.clientX / width) * 2 - 1;
        mouse.y = -(event.clientY / height) * 2 + 1;
    };
    
    const onClick = () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(projectMeshes);
        if (intersects.length > 0) {
            const link = intersects[0].object.userData.link;
            if (link) window.open(link, '_blank');
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      particleSystem.rotation.y = time * 0.05;
      
      caveGroup.rotation.z = time * 0.02;
      
      camera.position.z = 5 - Math.sin(time * 0.1) * 2;
      camera.rotation.z = Math.sin(time * 0.05) * 0.1;

      projectMeshes.forEach((mesh, i) => {
          mesh.rotation.y += Math.sin(time + i) * 0.002;
          mesh.position.y += Math.sin(time * 2 + i) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('click', onClick);
        cancelAnimationFrame(animationId);
        renderer.dispose();
    };
  });
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<div class="page-container" bind:this={container}>
    <canvas bind:this={canvas}></canvas>
    <div class="overlay">
        <h1 class="glitch" data-text={title}>{title}</h1>
        <div class="info">
            <h2>{duration}</h2>
            <h3>{theme}</h3>
            <p>{submissions}</p>
        </div>
        
        <div class="scroll-indicator">
            <p>Explore the Depths</p>
            <div class="chevron"></div>
        </div>

        <div class="projects-list">
            {#each projects as project}
                <a href={project.link} target="_blank" rel="noopener noreferrer" class="project-link">
                    <span class="project-title">{project.title}</span>
                    <span class="project-prize">{project.prize}</span>
                </a>
            {/each}
        </div>
    </div>
</div>

<style>
    :global(body), :global(html) {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #110b29;
    }

    :global(footer), :global(header), :global(nav) {
        display: none !important;
    }

    .page-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        background: radial-gradient(circle at center, #1a103c 0%, #000000 100%);
    }

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        text-align: center;
        background: radial-gradient(transparent 50%, #000 150%);
    }

    h1 {
        font-family: 'Courier New', Courier, monospace;
        font-size: 4rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin: 0;
        text-shadow: 0 0 10px #a48eff, 0 0 20px #a48eff;
        animation: pulse 3s infinite ease-in-out;
    }

    .info {
        margin-top: 2rem;
        font-family: sans-serif;
        opacity: 0.8;
    }

    h2, h3 {
        margin: 0.5rem 0;
        font-weight: 300;
        letter-spacing: 0.1em;
    }

    h2 { font-size: 1.5rem; color: #ffbbaa; }
    h3 { font-size: 2rem; color: #ccddff; text-shadow: 0 0 10px #0044ff; }
    p { margin-top: 1rem; font-size: 1.2rem; color: #888; }

    .scroll-indicator {
        position: absolute;
        bottom: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: 0.6;
        animation: bounce 2s infinite;
    }

    .chevron {
        width: 20px;
        height: 20px;
        border-right: 2px solid white;
        border-bottom: 2px solid white;
        transform: rotate(45deg);
        margin-top: 10px;
    }

    .projects-list {
        position: absolute;
        bottom: 5rem;
        right: 2rem;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 1rem;
        pointer-events: auto;
    }

    .project-link {
        text-decoration: none;
        color: rgba(255, 255, 255, 0.5);
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        transition: all 0.3s ease;
    }

    .project-link:hover {
        color: #fff;
        transform: translateX(-10px);
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    }

    .project-title {
        font-weight: bold;
        font-size: 1.1rem;
    }

    .project-prize {
        font-size: 0.8rem;
        font-style: italic;
        color: #ffd700;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; text-shadow: 0 0 10px #a48eff, 0 0 20px #a48eff; }
        50% { opacity: 0.8; text-shadow: 0 0 5px #a48eff, 0 0 10px #a48eff; }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }

    @media (max-width: 768px) {
        h1 { font-size: 2rem; }
        .projects-list { display: none; } 
    }
</style>
