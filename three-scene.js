/* ==========================================================================
   RETROFUTURISTIC PORTFOLIO — THREE.JS SCROLL-LINKED 3D SCENE
   Holographic torus-knot with particle starfield, scroll-driven camera
   ========================================================================== */

(function () {
    'use strict';

    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // ── Scene ──
    const scene = new THREE.Scene();

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 6);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xa855f7, 2, 20);
    pointLight1.position.set(3, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 20);
    pointLight2.position.set(-4, -2, 4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xf43f5e, 1, 15);
    pointLight3.position.set(0, -3, 3);
    scene.add(pointLight3);

    // ── Holographic Torus Knot ──
    const torusGeometry = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32, 2, 3);
    const torusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8844ff,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0.75,
        envMapIntensity: 2.0,
        emissive: 0x220044,
        emissiveIntensity: 0.3
    });

    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    torusKnot.position.set(2.5, 0, 0);
    scene.add(torusKnot);

    // ── Secondary Geometry — Wireframe Icosahedron ──
    const icoGeometry = new THREE.IcosahedronGeometry(0.8, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.35
    });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    icosahedron.position.set(-3, 1.5, -2);
    scene.add(icosahedron);

    // ── Third Geometry — Small floating octahedron ──
    const octaGeometry = new THREE.OctahedronGeometry(0.4, 0);
    const octaMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6,
        emissive: 0x440011,
        emissiveIntensity: 0.3
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    octahedron.position.set(-2, -1.5, 1);
    scene.add(octahedron);

    // ── Particle Starfield ──
    const PARTICLE_COUNT = 1500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const colorPalette = [
        new THREE.Color(0xa855f7), // violet
        new THREE.Color(0x06b6d4), // cyan
        new THREE.Color(0xf43f5e), // rose
        new THREE.Color(0x10b981), // emerald
        new THREE.Color(0xffffff)  // white
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        // Spread in a large sphere
        const radius = 15 + Math.random() * 35;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ── Scroll State ──
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    function getScrollProgress() {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight > 0 ? window.scrollY / docHeight : 0;
    }

    window.addEventListener('scroll', () => {
        targetScrollProgress = getScrollProgress();
    }, { passive: true });

    // ── Theme awareness ──
    function getThemeOpacity() {
        const theme = document.body.getAttribute('data-theme');
        return theme === 'light' ? 0.3 : 0.8;
    }

    // ── Animation Loop ──
    const clock = new THREE.Clock();
    let animationId;

    function animate() {
        animationId = requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        const delta = clock.getDelta();

        // Smooth scroll interpolation
        scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;

        // ── Torus Knot animation ──
        torusKnot.rotation.x = time * 0.15 + scrollProgress * Math.PI * 2;
        torusKnot.rotation.y = time * 0.2 + scrollProgress * Math.PI;
        torusKnot.rotation.z = time * 0.1;
        torusKnot.position.y = Math.sin(time * 0.5) * 0.3;

        // Holographic color shift with scroll
        const hue = (time * 0.05 + scrollProgress * 0.5) % 1;
        torusMaterial.color.setHSL(hue, 0.7, 0.5);
        torusMaterial.emissive.setHSL(hue, 0.8, 0.15);

        // ── Icosahedron rotation ──
        icosahedron.rotation.x = time * 0.3;
        icosahedron.rotation.y = time * 0.2 + scrollProgress * Math.PI;
        icosahedron.position.y = 1.5 + Math.sin(time * 0.7) * 0.5;

        // ── Octahedron float ──
        octahedron.rotation.x = time * 0.4;
        octahedron.rotation.z = time * 0.3;
        octahedron.position.y = -1.5 + Math.cos(time * 0.6) * 0.4;
        octahedron.position.x = -2 + Math.sin(time * 0.3) * 0.3;

        // ── Particles slow rotation ──
        particles.rotation.y = time * 0.02 + scrollProgress * 0.5;
        particles.rotation.x = scrollProgress * 0.3;

        // ── Camera scroll-linked movement ──
        // Camera slowly trucks right and tilts as user scrolls
        camera.position.x = scrollProgress * 3;
        camera.position.y = scrollProgress * -1.5 + Math.sin(time * 0.3) * 0.1;
        camera.position.z = 6 - scrollProgress * 2;
        camera.lookAt(scrollProgress * 1.5, scrollProgress * -0.5, 0);

        // ── Point lights animate ──
        pointLight1.position.x = 3 + Math.sin(time * 0.5) * 2;
        pointLight1.position.y = 3 + Math.cos(time * 0.4) * 1.5;

        pointLight2.position.x = -4 + Math.cos(time * 0.3) * 2;
        pointLight2.position.z = 4 + Math.sin(time * 0.6) * 1;

        // ── Theme-aware opacity ──
        const targetOpacity = getThemeOpacity();
        torusMaterial.opacity += (targetOpacity - torusMaterial.opacity) * 0.02;
        particleMaterial.opacity += ((targetOpacity * 0.7) - particleMaterial.opacity) * 0.02;

        renderer.render(scene, camera);
    }

    animate();

    // ── Resize Handler ──
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }, 100);
    });

    // ── Visibility-based pause ──
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            clock.getDelta(); // Reset delta to avoid jumps
            animate();
        }
    });

})();
