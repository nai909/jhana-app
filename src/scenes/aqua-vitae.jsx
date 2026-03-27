import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function AquaVitae() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000508);
    scene.fog = new THREE.FogExp2(0x000508, 0.00025);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 150, 450);
    camera.lookAt(0, 30, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const TEAL = 0x4ecdc4;
    const TEAL_DARK = 0x2a9d8f;
    const TEAL_BRIGHT = 0x7fffe5;
    const TEAL_DIM = 0x1a3a38;
    const WHITE_GLOW = 0xa0fff0;

    const tealMat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.6 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: TEAL_DARK, transparent: true, opacity: 0.4 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.25 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: WHITE_GLOW, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 444;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    // === 1. WATER SURFACE WITH RIPPLES ===
    const surfaceGroup = new THREE.Group();
    surfaceGroup.position.y = 0;
    mainGroup.add(surfaceGroup);

    // Base water plane grid
    const gridSize = 300;
    const gridDiv = 30;
    for (let i = 0; i <= gridDiv; i++) {
      const t = (i / gridDiv - 0.5) * gridSize;
      surfaceGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-gridSize / 2, 0, t),
          new THREE.Vector3(gridSize / 2, 0, t)
        ]), tealDimMat));
      surfaceGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(t, 0, -gridSize / 2),
          new THREE.Vector3(t, 0, gridSize / 2)
        ]), tealDimMat));
    }

    // Ripple rings (will be animated)
    const ripples = [];
    const rippleSources = [
      { x: 0, z: 0 },
      { x: -80, z: 60 },
      { x: 70, z: -50 },
      { x: -40, z: -80 },
      { x: 90, z: 70 },
    ];

    rippleSources.forEach((src, srcIdx) => {
      for (let r = 1; r <= 6; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r * 20, 0.5, 4, 48),
          new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.3 / r })
        );
        ring.position.set(src.x, 1, src.z);
        ring.rotation.x = Math.PI / 2;
        surfaceGroup.add(ring);
        ripples.push({
          mesh: ring,
          baseRadius: r * 20,
          source: src,
          phase: srcIdx * 0.5 + r * 0.3,
          speed: 0.8 + rand() * 0.4,
        });
      }
    });

    // === 2. H2O MOLECULAR STRUCTURE ===
    const moleculeGroup = new THREE.Group();
    moleculeGroup.position.y = 120;
    mainGroup.add(moleculeGroup);

    function createH2O(x, y, z, scale = 1) {
      const mol = new THREE.Group();
      mol.position.set(x, y, z);
      mol.scale.setScalar(scale);

      // Oxygen (center)
      const oxygen = new THREE.Mesh(
        new THREE.SphereGeometry(8, 12, 12),
        new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.35 })
      );
      mol.add(oxygen);
      mol.add(createDot(0, 0, 0, 3, coreDotMat));

      // Hydrogen atoms (104.5 degree angle)
      const angle = 104.5 * Math.PI / 180;
      const bondLength = 20;

      const h1Pos = new THREE.Vector3(Math.sin(angle / 2) * bondLength, Math.cos(angle / 2) * bondLength, 0);
      const h2Pos = new THREE.Vector3(-Math.sin(angle / 2) * bondLength, Math.cos(angle / 2) * bondLength, 0);

      const h1 = new THREE.Mesh(
        new THREE.SphereGeometry(5, 10, 10),
        new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.3 })
      );
      h1.position.copy(h1Pos);
      mol.add(h1);
      mol.add(createDot(h1Pos.x, h1Pos.y, h1Pos.z, 2, accentDotMat));

      const h2 = new THREE.Mesh(
        new THREE.SphereGeometry(5, 10, 10),
        new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.3 })
      );
      h2.position.copy(h2Pos);
      mol.add(h2);
      mol.add(createDot(h2Pos.x, h2Pos.y, h2Pos.z, 2, accentDotMat));

      // Bonds
      mol.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), h1Pos]),
        tealMat
      ));
      mol.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), h2Pos]),
        tealMat
      ));

      return mol;
    }

    // Central molecule
    const centralMol = createH2O(0, 0, 0, 1.5);
    moleculeGroup.add(centralMol);

    // Surrounding lattice
    const latticePositions = [
      { x: 60, y: 30, z: 0 },
      { x: -60, y: 30, z: 0 },
      { x: 0, y: 30, z: 60 },
      { x: 0, y: 30, z: -60 },
      { x: 40, y: -40, z: 40 },
      { x: -40, y: -40, z: 40 },
      { x: 40, y: -40, z: -40 },
      { x: -40, y: -40, z: -40 },
    ];

    latticePositions.forEach(pos => {
      const mol = createH2O(pos.x, pos.y, pos.z, 0.7);
      mol.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      moleculeGroup.add(mol);

      // Hydrogen bonds (dashed)
      const bondLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(pos.x * 0.6, pos.y * 0.6, pos.z * 0.6)
        ]),
        new THREE.LineDashedMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2, dashSize: 3, gapSize: 2 })
      );
      bondLine.computeLineDistances();
      moleculeGroup.add(bondLine);
    });

    // === 3. VORTEX SPIRAL ===
    const vortexGroup = new THREE.Group();
    vortexGroup.position.set(-100, 0, -80);
    mainGroup.add(vortexGroup);

    // Create descending vortex
    for (let layer = 0; layer < 4; layer++) {
      const pts = [];
      const startY = 80 - layer * 30;
      const turns = 3;
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const a = t * turns * Math.PI * 2;
        const r = 40 * (1 - t * 0.7);
        const y = startY - t * 80;
        pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      vortexGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: layer === 0 ? TEAL : TEAL_DIM, transparent: true, opacity: 0.4 - layer * 0.08 })
      ));
    }

    // Vortex rings
    for (let i = 0; i < 8; i++) {
      const y = 80 - i * 10;
      const r = 40 * (1 - i / 10);
      const ring = createRing(r, y, 24, i % 2 === 0 ? tealDarkMat : tealDimMat);
      ring.rotation.set(0, i * 0.3, 0);
      vortexGroup.add(ring);
    }

    vortexGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // === 4. FOUNTAIN (center) ===
    const fountainGroup = new THREE.Group();
    mainGroup.add(fountainGroup);

    // Rising streams
    const streamCount = 8;
    const streams = [];
    for (let s = 0; s < streamCount; s++) {
      const a = (s / streamCount) * Math.PI * 2;
      const streamPts = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const height = t * 100;
        const spread = Math.sin(t * Math.PI) * 30;
        streamPts.push(new THREE.Vector3(
          Math.cos(a) * (5 + spread),
          height,
          Math.sin(a) * (5 + spread)
        ));
      }
      const streamLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(streamPts),
        s % 2 === 0 ? tealBrightMat : tealMat
      );
      fountainGroup.add(streamLine);
      streams.push({ line: streamLine, angle: a, pts: streamPts });
    }

    // Basin rings
    for (let i = 1; i <= 3; i++) {
      fountainGroup.add(createRing(i * 15, 2, 32, i === 3 ? tealMat : tealDimMat));
    }

    // === 5. SNOWFLAKE PATTERNS (above) ===
    const snowflakeGroup = new THREE.Group();
    snowflakeGroup.position.y = 200;
    mainGroup.add(snowflakeGroup);

    function createSnowflake(x, y, z, size = 30) {
      const flake = new THREE.Group();
      flake.position.set(x, y, z);

      // 6-fold symmetry
      for (let arm = 0; arm < 6; arm++) {
        const a = (arm / 6) * Math.PI * 2;

        // Main arm
        flake.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(Math.cos(a) * size, 0, Math.sin(a) * size)
          ]), tealMat));

        // Side branches
        for (let b = 1; b <= 3; b++) {
          const branchDist = size * b / 4;
          const branchLen = size * 0.3 * (1 - b / 4);
          const baseX = Math.cos(a) * branchDist;
          const baseZ = Math.sin(a) * branchDist;

          // Left branch
          const leftA = a + Math.PI / 3;
          flake.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(baseX, 0, baseZ),
              new THREE.Vector3(baseX + Math.cos(leftA) * branchLen, 0, baseZ + Math.sin(leftA) * branchLen)
            ]), tealDimMat));

          // Right branch
          const rightA = a - Math.PI / 3;
          flake.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(baseX, 0, baseZ),
              new THREE.Vector3(baseX + Math.cos(rightA) * branchLen, 0, baseZ + Math.sin(rightA) * branchLen)
            ]), tealDimMat));
        }

        // Tip dot
        flake.add(createDot(Math.cos(a) * size, 0, Math.sin(a) * size, 1.5, accentDotMat));
      }

      flake.add(createDot(0, 0, 0, 2, coreDotMat));
      return flake;
    }

    const snowflakes = [];
    const flakePositions = [
      { x: 0, y: 0, z: 0, s: 40 },
      { x: -100, y: 30, z: 50, s: 25 },
      { x: 80, y: -20, z: -40, s: 30 },
      { x: -60, y: 50, z: -80, s: 20 },
      { x: 120, y: 40, z: 60, s: 22 },
    ];

    flakePositions.forEach(fp => {
      const flake = createSnowflake(fp.x, fp.y, fp.z, fp.s);
      snowflakeGroup.add(flake);
      snowflakes.push({ mesh: flake, rotSpeed: 0.002 + rand() * 0.003 });
    });

    // === 6. PHI SPIRAL (golden ratio water movement) ===
    const phiGroup = new THREE.Group();
    phiGroup.position.set(100, 50, 80);
    mainGroup.add(phiGroup);

    const phi = 1.618033988749;
    const phiPts = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const a = t * Math.PI * 6;
      const r = Math.pow(phi, a / Math.PI) * 2;
      phiPts.push(new THREE.Vector3(Math.cos(a) * r, t * 60 - 30, Math.sin(a) * r));
    }
    phiGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(phiPts), tealBrightMat));

    // Phi rectangles
    for (let i = 0; i < 5; i++) {
      const size = 10 * Math.pow(phi, i);
      const y = i * 12 - 24;
      const rect = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-size / 2, y, -size / (2 * phi)),
          new THREE.Vector3(size / 2, y, -size / (2 * phi)),
          new THREE.Vector3(size / 2, y, size / (2 * phi)),
          new THREE.Vector3(-size / 2, y, size / (2 * phi)),
          new THREE.Vector3(-size / 2, y, -size / (2 * phi)),
        ]), tealDimMat);
      phiGroup.add(rect);
    }

    // === 7. RAIN DROPS ===
    const rainCount = 100;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainVelocities = [];

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (rand() - 0.5) * 400;
      rainPositions[i * 3 + 1] = rand() * 300 + 50;
      rainPositions[i * 3 + 2] = (rand() - 0.5) * 400;
      rainVelocities.push({ speed: 1 + rand() * 2 });
    }
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
    const rainParticles = new THREE.Points(rainGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.5, transparent: true, opacity: 0.5 }));
    mainGroup.add(rainParticles);

    // === 8. AMBIENT PARTICLES ===
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (rand() - 0.5) * 400;
      particlePositions[i * 3 + 1] = rand() * 250;
      particlePositions[i * 3 + 2] = (rand() - 0.5) * 400;
      particleVelocities.push({
        x: (rand() - 0.5) * 0.1,
        y: (rand() - 0.5) * 0.05,
        z: (rand() - 0.5) * 0.1,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL, size: 1, transparent: true, opacity: 0.3 }));
    mainGroup.add(particles);

    // === CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.25, y: 0 };
    let rotCurrent = { x: 0.25, y: 0 };
    let zoomTarget = 450;
    let zoomCurrent = 450;

    const el = renderer.domElement;
    el.addEventListener("mousedown", (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    el.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      rotTarget.y += (e.clientX - prevMouse.x) * 0.005;
      rotTarget.x += (e.clientY - prevMouse.y) * 0.005;
      rotTarget.x = Math.max(-0.5, Math.min(1.2, rotTarget.x));
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener("mouseup", () => isDragging = false);
    el.addEventListener("mouseleave", () => isDragging = false);
    el.addEventListener("wheel", (e) => { zoomTarget = Math.max(200, Math.min(800, zoomTarget + e.deltaY * 0.5)); });

    let touchPrev = null;
    el.addEventListener("touchstart", (e) => { if (e.touches.length === 1) touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
    el.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && touchPrev) {
        rotTarget.y += (e.touches[0].clientX - touchPrev.x) * 0.005;
        rotTarget.x += (e.touches[0].clientY - touchPrev.y) * 0.005;
        rotTarget.x = Math.max(-0.5, Math.min(1.2, rotTarget.x));
        touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: false });
    el.addEventListener("touchend", () => touchPrev = null);

    // === ANIMATION ===
    let time = 0;
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;

      if (!isDragging) rotTarget.y += 0.0004;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 150;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 30, 0);

      // Ripple animation
      ripples.forEach(r => {
        const scale = 1 + Math.sin(time * r.speed + r.phase) * 0.3;
        r.mesh.scale.setScalar(scale);
        r.mesh.material.opacity = (0.3 / (r.baseRadius / 20)) * (1 - Math.abs(Math.sin(time * r.speed + r.phase)) * 0.5);
      });

      // Molecule rotation
      centralMol.rotation.y = time * 0.2;
      moleculeGroup.rotation.y = time * 0.05;

      // Vortex rotation
      vortexGroup.rotation.y = time * 0.3;

      // Snowflake rotation
      snowflakes.forEach(s => {
        s.mesh.rotation.y += s.rotSpeed;
      });

      // Phi spiral rotation
      phiGroup.rotation.y = time * 0.1;

      // Rain falling
      const rainPos = rainParticles.geometry.attributes.position.array;
      for (let i = 0; i < rainCount; i++) {
        rainPos[i * 3 + 1] -= rainVelocities[i].speed;
        if (rainPos[i * 3 + 1] < 0) {
          rainPos[i * 3 + 1] = 300;
          rainPos[i * 3] = (rand() - 0.5) * 400;
          rainPos[i * 3 + 2] = (rand() - 0.5) * 400;
        }
      }
      rainParticles.geometry.attributes.position.needsUpdate = true;

      // Ambient particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (Math.abs(pos[i * 3]) > 220) particleVelocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 220) particleVelocities[i].z *= -1;
        if (pos[i * 3 + 1] > 280 || pos[i * 3 + 1] < 0) particleVelocities[i].y *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000508" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Aqua Vitae
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
