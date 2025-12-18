<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

  let container;
  let canvas;
  let renderer;
  let scene;
  let camera;
  let frameId;
  
  // Objects
  const floatingShapes = [];

  onMount(() => {
    init();
    animate();
    window.addEventListener('resize', onWindowResize);
  });

  onDestroy(() => {
    if (frameId) cancelAnimationFrame(frameId);
    if (renderer) renderer.dispose();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onWindowResize);
    }
  });

  function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.Fog(0x050510, 10, 60);

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 100, 100);
    pointLight1.position.set(5, 10, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 100, 100);
    pointLight2.position.set(-5, 10, -5);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xffffff, 50, 100);
    pointLight3.position.set(0, 15, 0);
    scene.add(pointLight3);

    // Ground Mirror
    const geometry = new THREE.CircleGeometry(40, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x777777
    });
    groundMirror.position.y = -0.1;
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    // Low Poly Shapes
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.ConeGeometry(0.8, 1.5, 4), // Pyramid
    ];

    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x00ffff, roughness: 0.1, metalness: 0.1, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0xff00ff, roughness: 0.1, metalness: 0.1, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.1, metalness: 0.1, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0x00ffaa, roughness: 0.1, metalness: 0.1, flatShading: true }),
    ];

    for (let i = 0; i < 50; i++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const mat = materials[Math.floor(Math.random() * materials.length)];
        
        const mesh = new THREE.Mesh(geom, mat);
        
        // Random position
        mesh.position.x = (Math.random() - 0.5) * 30;
        mesh.position.y = Math.random() * 10 + 1;
        mesh.position.z = (Math.random() - 0.5) * 20 - 5;
        
        // Random rotation speed
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.05,
            rotSpeedY: (Math.random() - 0.5) * 0.05,
            floatSpeed: Math.random() * 0.02 + 0.01,
            floatOffset: Math.random() * Math.PI * 2,
            initialY: mesh.position.y
        };

        mesh.scale.setScalar(Math.random() * 0.5 + 0.5);

        scene.add(mesh);
        floatingShapes.push(mesh);
    }
    
    // Central Monument
    const monumentGeom = new THREE.IcosahedronGeometry(3, 1);
    const monumentMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.0, 
        metalness: 0.9, 
        flatShading: true,
        emissive: 0x111111 
    });
    const monument = new THREE.Mesh(monumentGeom, monumentMat);
    monument.position.set(0, 4, -5);
    scene.add(monument);
    floatingShapes.push(monument);
    monument.userData = {
        rotSpeedX: 0.005,
        rotSpeedY: 0.01,
        floatSpeed: 0.005,
        floatOffset: 0,
        initialY: 4
    };

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    const time = performance.now() * 0.001;
    
    floatingShapes.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        
        mesh.position.y = mesh.userData.initialY + Math.sin(time * 2 + mesh.userData.floatOffset) * 0.5;
    });

    // Camera sway
    camera.position.x = Math.sin(time * 0.2) * 2;
    camera.lookAt(0, 3, 0);

    renderer.render(scene, camera);
  }

</script>

<div class="page-container">
    <div bind:this={container} class="canvas-container"></div>
    
    <div class="content-overlay">
        <header class="hero">
            <h1 class="glitch" data-text="Cambridge Game Jam 2024">Cambridge Game Jam 2024</h1>
            <h2 class="theme">THEME: <span class="highlight">REFLECTION</span></h2>
            <p class="date">9th - 11th February</p>
        </header>
        
        <section class="projects">
            <h3>Featured Projects</h3>
            <div class="project-grid">
                <a href="https://hex-26.itch.io/blight" target="_blank" class="project-card">
                    <h4>Blight</h4>
                    <p class="prize">Most Popular & Best Gameplay</p>
                    <p class="desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </a>
                <a href="https://dylanmoss.itch.io/reflect-upon-you-actions" target="_blank" class="project-card">
                    <h4>Reflect Upon Your Actions</h4>
                    <p class="prize">Most Popular & Most Original</p>
                    <p class="desc">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </a>
                <a href="https://ekorrette.itch.io/reflected" target="_blank" class="project-card">
                    <h4>Reflected</h4>
                    <p class="prize">Theme Winner</p>
                    <p class="desc">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                </a>
                <a href="https://alex-davies.itch.io/asymmetry" target="_blank" class="project-card">
                    <h4>Asymmetry</h4>
                    <p class="prize">Best Gameplay</p>
                    <p class="desc">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </a>
                <a href="https://greenwood672.itch.io/coulda-woulda-buddha" target="_blank" class="project-card">
                    <h4>Coulda Woulda Buddha</h4>
                    <p class="prize">Best Presentation</p>
                    <p class="desc">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
                </a>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <span class="number">23</span>
                    <span class="label">Submissions</span>
                </div>
                <div class="stat-item">
                    <span class="number">48h</span>
                    <span class="label">Duration</span>
                </div>
            </div>
        </section>
    </div>
</div>

<style>
    :global(footer), :global(header) {
        display: none !important;
    }
    
    :global(body), :global(html) {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background-color: #050510;
    }

    .page-container {
        position: relative;
        width: 100vw;
        min-height: 100vh;
        overflow-x: hidden;
        color: white;
        font-family: 'Courier New', Courier, monospace;
    }

    .canvas-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .content-overlay {
        position: relative;
        z-index: 2;
        padding: 4rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
        pointer-events: none; /* Let clicks pass through to canvas usually, but we want interaction for links */
    }

    .content-overlay * {
        pointer-events: auto; /* Re-enable pointer events for content */
    }

    .hero {
        text-align: center;
        margin-bottom: 6rem;
        text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }

    h1 {
        font-size: 4rem;
        font-weight: 900;
        margin-bottom: 1rem;
        letter-spacing: -2px;
        color: #fff;
        text-transform: uppercase;
        position: relative;
    }

    .theme {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #aaa;
    }

    .highlight {
        color: #00ffff;
        font-weight: bold;
        text-shadow: 0 0 10px #00ffff;
    }

    .date {
        font-size: 1.2rem;
        color: #ff00ff;
        font-weight: bold;
        letter-spacing: 2px;
    }

    .projects {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        padding: 3rem;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
    }

    h3 {
        font-size: 2rem;
        margin-bottom: 2rem;
        border-bottom: 2px solid #ff00ff;
        display: inline-block;
        padding-bottom: 0.5rem;
    }

    .project-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 4rem;
    }

    .project-card {
        background: rgba(255, 255, 255, 0.05);
        padding: 1.5rem;
        border-radius: 10px;
        transition: transform 0.3s, background 0.3s, box-shadow 0.3s;
        text-decoration: none;
        color: white;
        border: 1px solid transparent;
        display: block;
    }

    .project-card:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.1);
        border-color: #00ffff;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    }

    .project-card h4 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: #00ffff;
    }

    .prize {
        color: #ff00ff;
        font-weight: bold;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        text-transform: uppercase;
    }

    .desc {
        font-size: 0.9rem;
        line-height: 1.5;
        color: #ccc;
    }

    .stats {
        display: flex;
        justify-content: center;
        gap: 4rem;
        margin-top: 2rem;
    }

    .stat-item {
        text-align: center;
    }

    .stat-item .number {
        display: block;
        font-size: 3rem;
        font-weight: bold;
        color: #fff;
    }

    .stat-item .label {
        color: #888;
        text-transform: uppercase;
        font-size: 0.9rem;
        letter-spacing: 1px;
    }

    @media (max-width: 768px) {
        h1 {
            font-size: 2.5rem;
        }
        .stats {
            gap: 2rem;
        }
    }

    /* Glitch Effect */
    .glitch {
        position: relative;
    }
    
    .glitch::before,
    .glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #050510;
    }
    
    .glitch::before {
        left: 2px;
        text-shadow: -1px 0 #ff00c1;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim-1 5s infinite linear alternate-reverse;
    }
    
    .glitch::after {
        left: -2px;
        text-shadow: -1px 0 #00fff9;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim-2 5s infinite linear alternate-reverse;
    }
    
    @keyframes glitch-anim-1 {
        0% { clip: rect(20px, 9999px, 80px, 0); }
        20% { clip: rect(60px, 9999px, 10px, 0); }
        40% { clip: rect(30px, 9999px, 70px, 0); }
        60% { clip: rect(80px, 9999px, 5px, 0); }
        80% { clip: rect(10px, 9999px, 40px, 0); }
        100% { clip: rect(50px, 9999px, 90px, 0); }
    }
    
    @keyframes glitch-anim-2 {
        0% { clip: rect(10px, 9999px, 90px, 0); }
        20% { clip: rect(80px, 9999px, 10px, 0); }
        40% { clip: rect(50px, 9999px, 20px, 0); }
        60% { clip: rect(20px, 9999px, 60px, 0); }
        80% { clip: rect(90px, 9999px, 30px, 0); }
        100% { clip: rect(30px, 9999px, 80px, 0); }
    }
</style>
