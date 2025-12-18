<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let container;
  let scrollProgress = 0;
  let targetProgress = 0;
  
  const images = [
    {
      src: "/2023/inferno-rising.png",
      alt: "Inferno Rising",
      link: "https://firedemon111.itch.io/inferno-rising",
      title: "Inferno Rising",
      prize: "Popular Vote",
      desc: "A fiery descent into the depths."
    },
    {
      src: "/2023/mayi-garden.png",
      alt: "Mayi Garden",
      link: "https://qiaozhi-lei.itch.io/mayi-garden",
      title: "MAYI Garden",
      prize: "Best for Theme",
      desc: "Cultivate life beneath the surface."
    },
    {
      src: "/2023/rhythm-mythril-fever.png",
      alt: "Rhythm Mythril Fever",
      link: "https://stolencheese.itch.io/rhythm-mythril-fever",
      title: "Rhythm Mythril Fever",
      prize: "Best Presentation",
      desc: "Strike the earth to the beat."
    },
    {
      src: "/2023/beaneth-the-earth.png",
      alt: "Beaneth the Earth",
      link: "https://mxbi.itch.io/beaneth-the-earth",
      title: "Beaneth the Earth",
      prize: "Best Gameplay",
      desc: "Beans growing where the sun don't shine."
    },
    {
      src: "/2023/deck-of-dwarves.png",
      alt: "Deck of Dwarves",
      link: "https://joeoc.itch.io/deck-of-dwarves",
      title: "Deck of Dwarves",
      prize: "Most Original Idea",
      desc: "Play your cards right in the mines."
    },
    {
      src: "/2023/all-submissions.png",
      alt: "All Submissions",
      link: "https://itch.io/jam/camgamejam2023",
      title: "See All Submissions",
      prize: "Join us next time!",
      desc: "Explore all 19 entries."
    }
  ];

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050205);
    scene.fog = new THREE.FogExp2(0x050205, 0.04);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    
    const points = [];
    for (let i = 0; i < 50; i++) {
      points.push(new THREE.Vector3(
        Math.sin(i * 0.2) * 3,
        Math.cos(i * 0.3) * 3 + (i * 0.5),
        -i * 4
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);

    const geometry = new THREE.TubeGeometry(curve, 100, 2, 8, false);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x332233, 
      side: THREE.BackSide,
      wireframe: true,
      roughness: 0.8,
      metalness: 0.2
    });
    const tube = new THREE.Mesh(geometry, material);
    
    
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = [];
    for(let i=0; i<particleCount; i++) {
      const t = Math.random();
      const pos = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const normal = new THREE.Vector3(0,1,0).applyAxisAngle(tangent, Math.random() * Math.PI * 2);
      const radius = 2.5 + Math.random() * 4;
      pos.add(normal.multiplyScalar(radius));
      particlePos.push(pos.x, pos.y, pos.z);
    }
    particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.05 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const light = new THREE.PointLight(0xffaa55, 1, 10);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x221133);
    scene.add(ambientLight);

    const projectMeshes = [];
    
    images.forEach((img, i) => {
      const t = (i + 1) / (images.length + 1);
      const pos = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      
      const planeGeo = new THREE.PlaneGeometry(3, 2);
      const tex = textureLoader.load(img.src);
      const planeMat = new THREE.MeshBasicMaterial({ map: tex });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      
      plane.position.copy(pos);
      plane.lookAt(pos.clone().add(tangent)); 
      plane.rotateY(Math.PI / 2); 
      
      const offset = new THREE.Vector3(1.5, 0, 0); 
      if (i % 2 === 0) offset.x = -1.5;
      
      plane.position.add(offset);
      plane.lookAt(pos);

      scene.add(plane);
      projectMeshes.push({ mesh: plane, data: img, originalPos: plane.position.clone() });
      
      const pl = new THREE.PointLight(0xffffff, 0.5, 5);
      pl.position.copy(plane.position);
      scene.add(pl);
    });

    function updateCamera() {
      scrollProgress += (targetProgress - scrollProgress) * 0.05;
      const camPos = curve.getPoint(scrollProgress * 0.98); 
      const camLookAt = curve.getPoint((scrollProgress * 0.98) + 0.01);
      
      camera.position.copy(camPos);
      camera.lookAt(camLookAt);
      
      light.position.copy(camPos);

      // Simple HTML overlay update logic
      const threshold = 0.05;
      projectMeshes.forEach((p, i) => {
        const t = (i + 1) / (images.length + 1);
        const dist = Math.abs(scrollProgress - t);
        
        const el = document.getElementById(`project-${i}`);
        if (el) {
            if (dist < threshold) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
            } else {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
        }
      });
      
      const titleEl = document.getElementById('main-title');
      if (titleEl) {
        titleEl.style.opacity = scrollProgress < 0.05 ? '1' : '0';
        titleEl.style.transform = `scale(${1 - scrollProgress * 5})`;
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      updateCamera();
      
      particles.rotation.z += 0.001;
      
      projectMeshes.forEach(p => {
        p.mesh.position.y = p.originalPos.y + Math.sin(Date.now() * 0.001 + p.mesh.position.z) * 0.1;
      });

      renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('wheel', (e) => {
      targetProgress += e.deltaY * 0.0005;
      targetProgress = Math.max(0, Math.min(1, targetProgress));
    });
    
    // Mobile touch
    let touchStartY = 0;
    window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY);
    window.addEventListener('touchmove', e => {
       const deltaY = touchStartY - e.touches[0].clientY;
       targetProgress += deltaY * 0.001;
       targetProgress = Math.max(0, Math.min(1, targetProgress));
       touchStartY = e.touches[0].clientY;
    });

    animate();
    
    return () => {
        // cleanup if needed
    };
  });
</script>

<div bind:this={container} class="canvas-container"></div>

<div class="overlay">
    <div id="main-title" class="title-section">
        <h1>Cambridge Game Jam 2023</h1>
        <h2>Beneath the Earth</h2>
        <p>10th - 12th February</p>
        <p class="scroll-hint">Scroll to Descend</p>
    </div>

    {#each images as img, i}
        <div id="project-{i}" class="project-card" style="opacity: 0; pointer-events: none;">
            <h3>{img.title}</h3>
            <p class="prize">{img.prize}</p>
            <p>{img.desc}</p>
            <a href={img.link} target="_blank" rel="noopener noreferrer">View Project</a>
        </div>
    {/each}
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden; 
    background: #000;
  }
  
  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99999;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100000;
    pointer-events: none;
    font-family: 'Courier New', Courier, monospace;
    color: #fff;
    text-shadow: 0 0 10px rgba(136, 204, 255, 0.5);
  }

  .title-section {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    transition: opacity 0.5s, transform 0.5s;
    background: rgba(0,0,0,0.4);
    padding: 2rem;
    border-radius: 1rem;
    backdrop-filter: blur(5px);
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    color: #eebbff;
  }

  h2 {
    font-size: 2rem;
    color: #ccaaff;
  }
  
  .scroll-hint {
    margin-top: 2rem;
    animation: bounce 2s infinite;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
    40% {transform: translateY(-10px);}
    60% {transform: translateY(-5px);}
  }

  .project-card {
    position: absolute;
    top: 50%;
    left: 50%; /* Centered but maybe offset later if needed */
    transform: translate(-50%, -50%);
    text-align: center;
    background: rgba(0, 0, 0, 0.7);
    padding: 2rem;
    border: 1px solid #554466;
    border-radius: 8px;
    max-width: 400px;
    transition: opacity 0.5s;
  }
  
  .project-card h3 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    color: #ffaa55;
  }
  
  .project-card .prize {
    color: #ffee88;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .project-card a {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #553366;
    color: #fff;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.2s;
    pointer-events: auto; 
  }
  
  .project-card a:hover {
    background: #774499;
  }
</style>
