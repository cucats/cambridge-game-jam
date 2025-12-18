<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { browser } from '$app/environment';

  const title = "Cambridge Game Jam 2024";
  const duration = "9th - 11th February";
  const theme = "Reflection";

  const images = [
    {
      src: "/2024/blight.png",
      link: "https://hex-26.itch.io/blight",
      title: "Blight",
      prize: "Most Popular and Best Gameplay",
    },
    {
      src: "/2024/reflect-upon-your-actions.png",
      link: "https://dylanmoss.itch.io/reflect-upon-you-actions",
      title: "Reflect Upon Your Actions",
      prize: "Most Popular and Most Original",
    },
    {
      src: "/2024/reflected.png",
      link: "https://ekorrette.itch.io/reflected",
      title: "Reflected",
      prize: "Theme Winner",
    },
    {
      src: "/2024/asymmetry.png",
      link: "https://alex-davies.itch.io/asymmetry",
      title: "Asymmetry",
      prize: "Best Gameplay",
    },
    {
      src: "/2024/coulda-woulda-buddha.png",
      link: "https://greenwood672.itch.io/coulda-woulda-buddha",
      title: "Coulda Woulda Buddha",
      prize: "Best Presentation",
    },
    {
      src: "/2024/all-submissions.png",
      link: "https://itch.io/jam/camgamejam2024",
      title: "All Submissions",
      prize: "",
    },
  ];

  let container;
  let canvas;

  onMount(() => {
    if (!browser) return;

    const originalOverflow = document.body.style.overflow;
    const originalBg = document.body.style.backgroundColor;
    const originalMargin = document.body.style.margin;
    
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#100020';
    document.body.style.margin = '0';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100020);
    scene.fog = new THREE.FogExp2(0x100020, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const pinkLight = new THREE.PointLight(0xff00ff, 2, 100);
    pinkLight.position.set(10, 5, 10);
    scene.add(pinkLight);

    const blueLight = new THREE.PointLight(0x0000ff, 2, 100);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    const geometry = new THREE.IcosahedronGeometry(3, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.2,
      thickness: 1.0,
      flatShading: true,
    });
    const monolith = new THREE.Mesh(geometry, material);
    monolith.castShadow = true;
    monolith.receiveShadow = true;
    scene.add(monolith);

    const shardGeo = new THREE.TetrahedronGeometry(0.5);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xccffcc,
      flatShading: true,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0x112233,
    });

    const shards = [];
    for (let i = 0; i < 100; i++) {
      const shard = new THREE.Mesh(shardGeo, shardMat);
      shard.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      shard.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      if (shard.position.length() < 6) shard.position.multiplyScalar(2);
      
      shard.userData = {
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05,
          z: (Math.random() - 0.5) * 0.05
        },
        floatSpeed: Math.random() * 0.02 + 0.005,
        floatOffset: Math.random() * Math.PI * 2
      };
      scene.add(shard);
      shards.push(shard);
    }

    const floorGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
    
    const posAttribute = floorGeo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        const z = posAttribute.getZ(i);
        const zOffset = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
        posAttribute.setZ(i, z + zOffset);
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x050510,
        flatShading: true,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: false
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -8;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.1 });
    const grid = new THREE.Mesh(floorGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -7.9;
    scene.add(grid);


    const textureLoader = new THREE.TextureLoader();
    const cards = [];
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    images.forEach((img, index) => {
        const texture = textureLoader.load(img.src);
        texture.colorSpace = THREE.SRGBColorSpace;
        
        const cardGeo = new THREE.PlaneGeometry(4, 2.5);
        const cardMat = new THREE.MeshBasicMaterial({ 
            map: texture,
            side: THREE.DoubleSide
        });
        const cardFrameGeo = new THREE.BoxGeometry(4.2, 2.7, 0.1);
        const cardFrameMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
        
        const frame = new THREE.Mesh(cardFrameGeo, cardFrameMat);
        const mesh = new THREE.Mesh(cardGeo, cardMat);
        mesh.position.z = 0.06;
        frame.add(mesh);

        const angle = (index / images.length) * Math.PI * 2;
        const radius = 12;
        frame.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        frame.lookAt(0, 0, 0);
        
        frame.userData = { 
            link: img.link,
            originalY: frame.position.y,
            phase: Math.random() * Math.PI * 2,
            hovered: false
        };
        
        cardGroup.add(frame);
        cards.push(frame);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cards, true);
        if (intersects.length > 0) {
            let target = intersects[0].object;
            while(target.parent && !target.userData.link) {
                target = target.parent;
            }
            if (target.userData.link) {
                window.open(target.userData.link, '_blank');
            }
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.01;

        monolith.rotation.x += 0.005;
        monolith.rotation.y += 0.01;

        shards.forEach(shard => {
            shard.rotation.x += shard.userData.rotSpeed.x;
            shard.rotation.y += shard.userData.rotSpeed.y;
            shard.rotation.z += shard.userData.rotSpeed.z;
            
            shard.position.y += Math.sin(time + shard.userData.floatOffset) * 0.02;
        });

        cardGroup.rotation.y += 0.002;

        cards.forEach(card => {
            card.position.y = Math.sin(time * 2 + card.userData.phase) * 0.5;
        });

        camera.position.x = Math.sin(time * 0.2) * 2;
        camera.position.y = 5 + Math.cos(time * 0.2) * 1;
        camera.lookAt(0, 0, 0);

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cards, true);
        
        cards.forEach(card => {
            if (intersects.find(i => {
                let p = i.object;
                while(p && p !== card) p = p.parent;
                return p === card;
            })) {
                if (!card.userData.hovered) {
                    card.scale.setScalar(1.2);
                    card.userData.hovered = true;
                    document.body.style.cursor = 'pointer';
                }
            } else {
                if (card.userData.hovered) {
                    card.scale.setScalar(1.0);
                    card.userData.hovered = false;
                    document.body.style.cursor = 'default';
                }
            }
        });

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
        if (browser) {
            document.body.style.overflow = originalOverflow;
            document.body.style.backgroundColor = originalBg;
            document.body.style.margin = originalMargin;
            document.body.style.cursor = ''; 

            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        }
    };
  });
</script>

<div class="page-container">
    <canvas bind:this={canvas}></canvas>
    
    <div class="overlay">
        <header>
            <h1 class="glitch-text" data-text={title}>{title}</h1>
            <p class="subtitle">{duration}</p>
            <h2 class="theme">THEME: <span class="mirror-text">{theme}</span></h2>
        </header>
        
        <div class="instructions">
            <p>Click cards to view projects</p>
        </div>
    </div>
</div>

<style>
    :global(body) {
        font-family: 'Courier New', Courier, monospace;
    }

    :global(footer) {
        display: none !important;
    }

    .page-container {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        width: 100vw;
        height: 100vh;
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
        outline: none;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 2rem;
        box-sizing: border-box;
        color: white;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    header {
        text-align: center;
        margin-top: 2rem;
    }

    h1 {
        font-size: 3rem;
        margin: 0;
        letter-spacing: 0.2rem;
        text-transform: uppercase;
        font-weight: 800;
    }

    .subtitle {
        font-size: 1.2rem;
        opacity: 0.8;
        margin-top: 0.5rem;
    }

    .theme {
        margin-top: 1rem;
        font-size: 2rem;
        font-weight: 300;
    }

    .mirror-text {
        font-weight: bold;
        color: #00ffff;
        display: inline-block;
        transform: scaleY(1);
        animation: reflect-pulse 3s infinite;
    }

    .instructions {
        text-align: center;
        margin-bottom: 2rem;
        opacity: 0.6;
        font-size: 0.9rem;
    }

    .glitch-text {
        position: relative;
    }
    
    .glitch-text::before,
    .glitch-text::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #100020;
    }
    
    .glitch-text::before {
        left: 2px;
        text-shadow: -1px 0 #ff00c1;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim 5s infinite linear alternate-reverse;
    }
    
    .glitch-text::after {
        left: -2px;
        text-shadow: -1px 0 #00fff9;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim2 5s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim {
        0% { clip: rect(11px, 9999px, 86px, 0); }
        20% { clip: rect(69px, 9999px, 12px, 0); }
        40% { clip: rect(2px, 9999px, 80px, 0); }
        60% { clip: rect(85px, 9999px, 14px, 0); }
        80% { clip: rect(48px, 9999px, 29px, 0); }
        100% { clip: rect(16px, 9999px, 94px, 0); }
    }

    @keyframes glitch-anim2 {
        0% { clip: rect(65px, 9999px, 100px, 0); }
        20% { clip: rect(6px, 9999px, 81px, 0); }
        40% { clip: rect(41px, 9999px, 20px, 0); }
        60% { clip: rect(21px, 9999px, 84px, 0); }
        80% { clip: rect(98px, 9999px, 34px, 0); }
        100% { clip: rect(56px, 9999px, 6px, 0); }
    }

    @keyframes reflect-pulse {
        0%, 100% { opacity: 1; text-shadow: 0 0 10px #00ffff; }
        50% { opacity: 0.8; text-shadow: 0 0 20px #ff00ff; }
    }
</style>
