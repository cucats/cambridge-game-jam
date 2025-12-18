<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  const projects = [
    {
      src: "/2023/inferno-rising.png",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote"
    },
    {
      src: "/2023/mayi-garden.png",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme"
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation"
    },
    {
      src: "/2023/beaneth-the-earth.png",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay"
    },
    {
      src: "/2023/deck-of-dwarves.png",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea"
    },
    {
      src: "/2023/all-submissions.png",
      link: "https://itch.io/jam/camgamejam2023",
      title: "All Submissions",
      prize: "View All"
    }
  ];

  let container;
  let canvas;
  let titleOverlay;
  let hoveredProject = null;

  onMount(() => {
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.03);
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      roughness: 0.8,
      flatShading: true
    });
    
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    for (let i = 0; i < 600; i++) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 4;
      const z = (Math.random() - 0.5) * 80 - 10;
      
      rock.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z
      );
      
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const scale = 0.5 + Math.random() * 1.5;
      rock.scale.set(scale, scale, scale);
      tunnelGroup.add(rock);
    }

    const spikeGeo = new THREE.ConeGeometry(0.5, 4, 4);
    for (let i = 0; i < 50; i++) {
        const spike = new THREE.Mesh(spikeGeo, rockMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 2;
        const z = (Math.random() - 0.5) * 70 - 10;
        
        spike.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            z
        );
        spike.lookAt(0, 0, spike.position.z);
        spike.rotateX(Math.PI / 2); 

        const scale = 0.5 + Math.random();
        spike.scale.set(scale, scale, scale);
        tunnelGroup.add(spike);
    }

    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 2000;
    const posArray = new Float32Array(dustCount * 3);
    
    for(let i = 0; i < dustCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 50;
        posArray[i+1] = (Math.random() - 0.5) * 50;
        posArray[i+2] = (Math.random() - 0.5) * 80 - 10;
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
    });
    
    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);

    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, 2, 40);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0xaa00ff, 1, 30);
    secondaryLight.position.set(5, -5, -10);
    scene.add(secondaryLight);


    const textureLoader = new THREE.TextureLoader();
    const projectMeshes = [];

    projects.forEach((proj, index) => {
        textureLoader.load(proj.src, (texture) => {
            const aspect = texture.image.width / texture.image.height;
            const geo = new THREE.PlaneGeometry(3, 3 / aspect);
            const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (index / projects.length) * Math.PI * 4; 
            const radius = 4;
            const z = -5 - (index * 5);

            mesh.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.5,
                z
            );
            
            mesh.lookAt(0, 0, z + 5);
            
            mesh.userData = { project: proj, originalScale: 1 };
            scene.add(mesh);
            projectMeshes.push(mesh);
            
            const backGeo = new THREE.BoxGeometry(3.2, (3/aspect) + 0.2, 0.2);
            const backMesh = new THREE.Mesh(backGeo, rockMaterial);
            backMesh.position.copy(mesh.position);
            backMesh.position.z -= 0.1;
            backMesh.quaternion.copy(mesh.quaternion);
            scene.add(backMesh);
        });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.05;
    };
    
    const onClick = (event) => {
        if (hoveredProject) {
            window.open(hoveredProject.link, '_blank');
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.005;

        tunnelGroup.rotation.z = Math.sin(time * 0.2) * 0.1;
        
        camera.position.z -= 0.02;
        pointLight.position.z = camera.position.z;

        if (camera.position.z < -40) {
            camera.position.z = 10;
        }

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(projectMeshes);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object !== hoveredProject?.mesh) {
                if (hoveredProject) hoveredProject.mesh.scale.set(1, 1, 1);
                
                hoveredProject = {
                    mesh: object,
                    data: object.userData.project
                };
                document.body.style.cursor = 'pointer';
            }
            object.scale.setScalar(1.1 + Math.sin(time * 10) * 0.05);
        } else {
            if (hoveredProject) {
                hoveredProject.mesh.scale.set(1, 1, 1);
                hoveredProject = null;
                document.body.style.cursor = 'default';
            }
        }

        renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('click', onClick);
        window.removeEventListener('resize', handleResize);
        if (renderer) renderer.dispose();
    };
  });
</script>

<div class="overlay">
    <div class="header">
        <h1>Cambridge Game Jam 2023</h1>
        <h2>Beneath the Earth</h2>
        <p>10th - 12th February</p>
    </div>
    
    {#if hoveredProject}
        <div class="project-info">
            <h3>{hoveredProject.data.title}</h3>
            <p>{hoveredProject.data.prize}</p>
        </div>
    {/if}
</div>

<canvas bind:this={canvas} />

<style>
    :global(footer) {
        display: none !important;
    }
    :global(body) {
        margin: 0;
        overflow: hidden;
        background-color: #050505;
    }
    canvas {
        display: block;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1;
    }
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none;
        color: #f0f0f0;
        font-family: 'Courier New', Courier, monospace;
        text-shadow: 0 0 10px rgba(0,0,0,0.8);
    }
    .header {
        position: absolute;
        top: 2rem;
        left: 2rem;
    }
    h1 {
        font-size: 3rem;
        margin: 0;
        color: #ffaa00;
        text-transform: uppercase;
        letter-spacing: 0.2rem;
    }
    h2 {
        font-size: 1.5rem;
        margin: 0.5rem 0;
        color: #88ccff;
    }
    .project-info {
        position: absolute;
        bottom: 2rem;
        right: 2rem;
        background: rgba(0, 0, 0, 0.7);
        padding: 1rem 2rem;
        border: 1px solid #444;
        border-radius: 8px;
        text-align: right;
    }
    .project-info h3 {
        margin: 0;
        font-size: 2rem;
        color: #ffaa00;
    }
    .project-info p {
        margin: 0.5rem 0 0;
        font-size: 1.2rem;
        color: #ccc;
    }
</style>