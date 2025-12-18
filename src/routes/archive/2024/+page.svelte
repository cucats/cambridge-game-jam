<script>
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

    let container;

    const projects = [
        { title: "Blight", prize: "Most Popular & Best Gameplay" },
        { title: "Reflect Upon Your Actions", prize: "Most Popular & Most Original" },
        { title: "Reflected", prize: "Theme Winner" },
        { title: "Asymmetry", prize: "Best Gameplay" },
        { title: "Coulda Woulda Buddha", prize: "Best Presentation" }
    ];

    onMount(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);
        scene.fog = new THREE.Fog(0x111111, 10, 50);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 5, 15);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(10, 10, 0);
        scene.add(pointLight);
        
        const pointLight2 = new THREE.PointLight(0x66ccff, 0.5);
        pointLight2.position.set(-10, 5, 5);
        scene.add(pointLight2);

        const geometry = new THREE.CircleGeometry(40, 64);
        const groundMirror = new Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0x777777
        });
        groundMirror.rotateX(-Math.PI / 2);
        scene.add(groundMirror);

        const shapes = [];
        const shapeGeometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0)
        ];

        for (let i = 0; i < 20; i++) {
            const geo = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
            const mat = new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff,
                flatShading: true,
                roughness: 0.1,
                metalness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);
            
            mesh.position.set(
                (Math.random() - 0.5) * 20,
                2 + Math.random() * 5,
                (Math.random() - 0.5) * 10 - 5
            );
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            const scale = 0.5 + Math.random();
            mesh.scale.set(scale, scale, scale);

            scene.add(mesh);
            shapes.push({
                mesh,
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: Math.random() * 0.02 + 0.01,
                floatOffset: Math.random() * Math.PI * 2
            });
        }

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            shapes.forEach(item => {
                item.mesh.rotation.x += item.rotSpeed.x;
                item.mesh.rotation.y += item.rotSpeed.y;
                item.mesh.rotation.z += item.rotSpeed.z;
                
                item.mesh.position.y += Math.sin(time * 2 + item.floatOffset) * 0.005;
            });

            camera.position.x = Math.sin(time * 0.1) * 2;
            camera.lookAt(0, 1, 0);

            renderer.render(scene, camera);
        }

        animate();

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            groundMirror.getRenderTarget().setSize(
                window.innerWidth * window.devicePixelRatio,
                window.innerHeight * window.devicePixelRatio
            );
        }

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    });
</script>

<div bind:this={container} class="fixed inset-0 -z-10 bg-black"></div>

<div class="relative z-10 min-h-screen text-white p-8 md:p-16 pointer-events-none overflow-y-auto">
    <div class="max-w-4xl mx-auto space-y-12">
        <header class="space-y-4">
            <h1 class="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Cambridge Game Jam 2024
            </h1>
            <div class="text-2xl font-light opacity-90">
                Theme: <span class="font-bold text-white">Reflection</span>
            </div>
            <div class="text-xl opacity-75">
                9th - 11th February • 23 Submissions
            </div>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-auto">
            {#each projects as project}
                <div class="backdrop-blur-sm bg-white/10 p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <h3 class="text-xl font-bold mb-2">{project.title}</h3>
                    <p class="text-sm opacity-80">{project.prize}</p>
                </div>
            {/each}
             <div class="backdrop-blur-sm bg-white/10 p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                 <a href="https://itch.io/jam/camgamejam2024" target="_blank" class="text-xl font-bold underline decoration-blue-400 decoration-2 underline-offset-4 hover:text-blue-300 transition-colors">
                    View All Submissions
                 </a>
            </div>
        </section>
        
        <div class="text-sm opacity-50 pt-20 pb-8">
            <p>Reflecting on a year of creativity and code.</p>
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        background-color: #111;
    }
</style>
