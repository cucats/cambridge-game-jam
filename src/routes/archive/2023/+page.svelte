<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let container: HTMLDivElement;
	let scrollY = 0;

	const projects = [
		{
			title: 'Inferno Rising',
			src: '/2023/inferno-rising.png',
			link: 'https://firedemon111.itch.io/inferno-rising',
			prize: 'Popular Vote'
		},
		{
			title: 'MAYI Garden',
			src: '/2023/mayi-garden.png',
			link: 'https://qiaozhi-lei.itch.io/mayi-garden',
			prize: 'Best for Theme'
		},
		{
			title: 'Rhythm Mythril Fever',
			src: '/2023/rhythm-mythril-fever.png',
			link: 'https://stolencheese.itch.io/rhythm-mythril-fever',
			prize: 'Best Presentation'
		},
		{
			title: 'Beaneth the Earth',
			src: '/2023/beaneth-the-earth.png',
			link: 'https://mxbi.itch.io/beaneth-the-earth',
			prize: 'Best Gameplay'
		},
		{
			title: 'Deck of Dwarves',
			src: '/2023/deck-of-dwarves.png',
			link: 'https://joeoc.itch.io/deck-of-dwarves',
			prize: 'Most Original Idea'
		},
		{
			title: 'All Submissions',
			src: '/2023/all-submissions.png',
			link: 'https://itch.io/jam/camgamejam2023',
			prize: ''
		}
	];

	onMount(() => {
		const scene = new THREE.Scene();
		const fogColor = 0x050210;
		scene.fog = new THREE.FogExp2(fogColor, 0.025);
		scene.background = new THREE.Color(fogColor);

		const camera = new THREE.PerspectiveCamera(
			70,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.z = 5;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		container.appendChild(renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
		scene.add(ambientLight);

		const textureLoader = new THREE.TextureLoader();

		const caveGroup = new THREE.Group();
		scene.add(caveGroup);

		const geometry = new THREE.CylinderGeometry(10, 10, 150, 32, 64, true);
		const positions = geometry.attributes.position;
		const vertex = new THREE.Vector3();
		for (let i = 0; i < positions.count; i++) {
			vertex.fromBufferAttribute(positions, i);
			const noise =
				Math.sin(vertex.x * 0.5) * Math.cos(vertex.y * 0.5) +
				Math.sin(vertex.y * 0.2) * Math.cos(vertex.z * 0.2);
			vertex.x += noise * 2 + (Math.random() - 0.5);
			vertex.y += noise * 2 + (Math.random() - 0.5);
			positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
		}
		geometry.computeVertexNormals();
		geometry.rotateX(-Math.PI / 2);

		const material = new THREE.MeshStandardMaterial({
			color: 0x443355,
			roughness: 0.8,
			metalness: 0.2,
			side: THREE.BackSide,
			flatShading: true
		});

		const tunnel = new THREE.Mesh(geometry, material);
		caveGroup.add(tunnel);

		const particlesGeometry = new THREE.BufferGeometry();
		const particleCount = 1500;
		const pPositions = new Float32Array(particleCount * 3);
		for (let i = 0; i < particleCount * 3; i += 3) {
			pPositions[i] = (Math.random() - 0.5) * 15;
			pPositions[i + 1] = (Math.random() - 0.5) * 15;
			pPositions[i + 2] = (Math.random() - 0.5) * 150;
		}
		particlesGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
		const particlesMaterial = new THREE.PointsMaterial({
			color: 0xccffaa,
			size: 0.05,
			transparent: true,
			opacity: 0.6
		});
		const starField = new THREE.Points(particlesGeometry, particlesMaterial);
		scene.add(starField);

		const projectMeshes: THREE.Mesh[] = [];
		const projectLights: THREE.PointLight[] = [];

		projects.forEach((proj, index) => {
			const zPos = -15 - index * 20;
			const angle = (index % 3) * ((Math.PI * 2) / 3);
			const xPos = Math.cos(angle) * 3;
			const yPos = Math.sin(angle) * 3;

			const group = new THREE.Group();
			group.position.set(xPos, yPos, zPos);

			const tex = textureLoader.load(proj.src);
			tex.colorSpace = THREE.SRGBColorSpace;
			const crystalGeo = new THREE.IcosahedronGeometry(1.5, 0);
			const crystalMat = new THREE.MeshPhysicalMaterial({
				map: tex,
				roughness: 0.2,
				metalness: 0.1,
				transmission: 0.2,
				thickness: 1,
				clearcoat: 1
			});
			const crystal = new THREE.Mesh(crystalGeo, crystalMat);
			crystal.userData = { link: proj.link };
			group.add(crystal);
			projectMeshes.push(crystal);

			const light = new THREE.PointLight(0xffaa00, 5, 15);
			light.position.set(0, 0, 0);
			group.add(light);
			projectLights.push(light);

			scene.add(group);
		});

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		const onClick = (event: MouseEvent) => {
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
			const intersects = raycaster.intersectObjects(projectMeshes);
			if (intersects.length > 0) {
				const link = intersects[0].object.userData.link;
				if (link) window.open(link, '_blank');
			}
		};
		window.addEventListener('click', onClick);

		const onMouseMove = (event: MouseEvent) => {
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener('mousemove', onMouseMove);

		const handleScroll = () => {
			scrollY = window.scrollY;
		};
		window.addEventListener('scroll', handleScroll);

		const clock = new THREE.Clock();

		const animate = () => {
			requestAnimationFrame(animate);
			const time = clock.getElapsedTime();

			const targetZ = 5 - (scrollY * 0.02);
			camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
			camera.position.x = Math.sin(time * 0.2) * 0.5 + mouse.x * 0.5;
			camera.position.y = Math.cos(time * 0.3) * 0.5 + mouse.y * 0.5;

			camera.rotation.z = Math.sin(time * 0.1) * 0.05;

			projectMeshes.forEach((mesh, i) => {
				mesh.rotation.x = time * 0.5 + i;
				mesh.rotation.y = time * 0.3 + i;
				
				const hover = raycaster.intersectObject(mesh).length > 0;
				if (hover) {
					mesh.scale.setScalar(1.2);
				} else {
					mesh.scale.setScalar(1.0);
				}
			});
			
			projectLights.forEach((light, i) => {
				light.intensity = 5 + Math.sin(time * 3 + i) * 2;
			});

			renderer.render(scene, camera);
		};
		animate();

		const onResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('click', onClick);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', handleScroll);
			renderer.dispose();
		};
	});
</script>

<div bind:this={container} class="fixed inset-0 top-0 left-0 w-full h-full -z-10 bg-black"></div>

<div class="relative z-10 text-white min-h-[800vh]">
	<section class="h-screen flex flex-col items-center justify-center pointer-events-none">
		<h1 class="text-6xl md:text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 drop-shadow-lg tracking-tighter">Cambridge Game Jam 2023</h1>
		<p class="text-2xl md:text-3xl text-amber-100 opacity-90 mb-2">10th - 12th February</p>
		<p class="text-xl md:text-2xl text-amber-200/80 italic">Theme: Beneath the Earth</p>
		<div class="mt-20 animate-bounce opacity-50">
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
			</svg>
		</div>
	</section>

	{#each projects as project, i}
		<section class="h-[100vh] flex items-center justify-center pointer-events-none">
			<div class="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 max-w-md transform transition-all duration-500 hover:scale-105 pointer-events-auto text-center"
				style="margin-left: {i % 3 === 0 ? '25vw' : (i % 3 === 1 ? '-25vw' : '0')}; margin-top: {i % 3 === 2 ? '20vh' : '0'}">
				<h2 class="text-3xl font-bold mb-2 text-amber-300">{project.title}</h2>
				<p class="text-amber-100/80 mb-4">{project.prize}</p>
				<a href={project.link} target="_blank" rel="noopener noreferrer" 
				   class="inline-block bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-full transition-colors">
					View Project
				</a>
			</div>
		</section>
	{/each}

	<section class="h-screen flex items-center justify-center">
		<div class="text-center">
			<h2 class="text-4xl font-bold mb-8 text-amber-200">Thanks for exploring!</h2>
			<a href="/archive" class="text-xl text-white hover:text-amber-300 underline underline-offset-4">Back to Archive</a>
		</div>
	</section>
</div>

<style>
	:global(footer) {
		display: none !important;
	}
	:global(html), :global(body) {
		background-color: #050210;
		overflow-x: hidden;
	}
</style>