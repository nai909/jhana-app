import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function CrystallumInfinitum() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000003);
    scene.fog = new THREE.FogExp2(0x000003, 0.0003);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 60, 500);
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
    const CRYSTAL_VIOLET = 0x8a7fff;

    const tealMat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: TEAL_DARK, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: WHITE_GLOW, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 777;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    // === 1. CENTRAL NESTED PLATONIC SOLIDS ===
    const coreGroup = new THREE.Group();
    coreGroup.position.y = 100;
    mainGroup.add(coreGroup);

    // Outermost: Dodecahedron
    const dodeca = new THREE.Mesh(
      new THREE.DodecahedronGeometry(80, 0),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.12 })
    );
    coreGroup.add(dodeca);

    // Icosahedron
    const icosa = new THREE.Mesh(
      new THREE.IcosahedronGeometry(60, 0),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.15 })
    );
    coreGroup.add(icosa);

    // Octahedron
    const octa = new THREE.Mesh(
      new THREE.OctahedronGeometry(45, 0),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.18 })
    );
    coreGroup.add(octa);

    // Cube
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(50, 50, 50),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.2 })
    );
    coreGroup.add(cube);

    // Tetrahedron
    const tetra = new THREE.Mesh(
      new THREE.TetrahedronGeometry(30, 0),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.25 })
    );
    coreGroup.add(tetra);

    // Inner sphere
    const innerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(15, 16, 16),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.3 })
    );
    coreGroup.add(innerSphere);

    // Core point
    coreGroup.add(createDot(0, 0, 0, 4, coreDotMat));

    // Vertex connections (edges of consciousness)
    const dodecaGeo = new THREE.DodecahedronGeometry(80, 0);
    const positions = dodecaGeo.attributes.position;
    const vertices = [];
    for (let i = 0; i < positions.count; i++) {
      vertices.push(new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      ));
    }
    // Remove duplicates
    const uniqueVerts = vertices.filter((v, i, arr) =>
      arr.findIndex(u => u.distanceTo(v) < 0.1) === i
    );
    uniqueVerts.forEach(v => coreGroup.add(createDot(v.x, v.y, v.z, 1.5, accentDotMat)));

    // === 2. CRYSTAL GROWTH FORMATIONS ===
    const crystalGroup = new THREE.Group();
    mainGroup.add(crystalGroup);

    function createCrystalCluster(x, y, z, scale = 1) {
      const cluster = new THREE.Group();
      cluster.position.set(x, y, z);
      cluster.scale.setScalar(scale);

      const crystalCount = 5 + Math.floor(rand() * 4);
      for (let i = 0; i < crystalCount; i++) {
        const height = 20 + rand() * 40;
        const radius = 3 + rand() * 5;

        // Hexagonal prism with pyramidal termination
        const shape = new THREE.Shape();
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * Math.PI * 2;
          const px = Math.cos(a) * radius;
          const py = Math.sin(a) * radius;
          if (j === 0) shape.moveTo(px, py);
          else shape.lineTo(px, py);
        }
        shape.closePath();

        const extrudeSettings = { depth: height * 0.7, bevelEnabled: false };
        const crystalGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const crystal = new THREE.Mesh(crystalGeo,
          new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.2 })
        );

        const angle = rand() * Math.PI * 2;
        const tilt = rand() * 0.4 - 0.2;
        const dist = rand() * 10;

        crystal.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        crystal.rotation.x = tilt;
        crystal.rotation.z = rand() * 0.3 - 0.15;
        crystal.rotation.y = rand() * Math.PI * 2;

        cluster.add(crystal);

        // Termination point (pyramid tip)
        const tipGeo = new THREE.ConeGeometry(radius, height * 0.3, 6);
        const tip = new THREE.Mesh(tipGeo,
          new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.25 })
        );
        tip.position.copy(crystal.position);
        tip.position.y = height * 0.7;
        tip.rotation.copy(crystal.rotation);
        cluster.add(tip);

        cluster.add(createDot(
          crystal.position.x,
          crystal.position.y + height,
          crystal.position.z,
          1.5, accentDotMat
        ));
      }

      return cluster;
    }

    // Crystal formations around the scene
    const clusterPositions = [
      { x: -150, y: 0, z: -80, s: 1.2 },
      { x: 160, y: 0, z: -60, s: 1.0 },
      { x: -100, y: 0, z: 100, s: 0.9 },
      { x: 120, y: 0, z: 90, s: 1.1 },
      { x: 0, y: 0, z: -140, s: 0.8 },
      { x: -180, y: 0, z: 20, s: 0.7 },
      { x: 180, y: 0, z: 30, s: 0.85 },
    ];

    clusterPositions.forEach(cp => {
      crystalGroup.add(createCrystalCluster(cp.x, cp.y, cp.z, cp.s));
    });

    // === 3. LIGHT REFRACTION PATHS ===
    const refractionGroup = new THREE.Group();
    refractionGroup.position.y = 100;
    mainGroup.add(refractionGroup);

    // Light rays entering and bouncing inside crystal
    for (let ray = 0; ray < 8; ray++) {
      const entryA = (ray / 8) * Math.PI * 2;
      const entryR = 85;
      const entry = new THREE.Vector3(Math.cos(entryA) * entryR, Math.sin(entryA) * 30, Math.sin(entryA) * entryR);

      // Ray to center then bouncing out
      const bounces = 3 + Math.floor(rand() * 3);
      const pts = [entry];
      let current = entry.clone();

      for (let b = 0; b < bounces; b++) {
        const nextA = rand() * Math.PI * 2;
        const nextR = 20 + rand() * 50;
        const nextY = (rand() - 0.5) * 40;
        const next = new THREE.Vector3(Math.cos(nextA) * nextR, nextY, Math.sin(nextA) * nextR);
        pts.push(next);
        current = next;
      }

      // Exit point
      const exitA = rand() * Math.PI * 2;
      const exitR = 90;
      pts.push(new THREE.Vector3(Math.cos(exitA) * exitR, (rand() - 0.5) * 50, Math.sin(exitA) * exitR));

      refractionGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.15 })
      ));

      // Intersection dots
      pts.forEach((p, i) => {
        if (i > 0 && i < pts.length - 1) {
          refractionGroup.add(createDot(p.x, p.y, p.z, 1, accentDotMat));
        }
      });
    }

    // === 4. GEODE CROSS-SECTION (below) ===
    const geodeGroup = new THREE.Group();
    geodeGroup.position.y = -80;
    mainGroup.add(geodeGroup);

    // Outer geode shell (half sphere)
    const geodeShell = new THREE.Mesh(
      new THREE.SphereGeometry(100, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.1 })
    );
    geodeShell.rotation.x = Math.PI;
    geodeGroup.add(geodeShell);

    // Geode rim
    geodeGroup.add(createRing(100, 0, 48, tealMat));

    // Inner crystal cave formations pointing inward
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r = 70 + rand() * 25;
      const baseX = Math.cos(a) * r;
      const baseZ = Math.sin(a) * r;
      const height = 15 + rand() * 30;

      // Crystal pointing toward center
      const crystalGeo = new THREE.ConeGeometry(3 + rand() * 3, height, 6);
      const crystal = new THREE.Mesh(crystalGeo,
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? TEAL_BRIGHT : TEAL, wireframe: true, transparent: true, opacity: 0.25 })
      );

      crystal.position.set(baseX, -10 - rand() * 20, baseZ);

      // Point toward center
      crystal.lookAt(0, -40, 0);
      crystal.rotateX(Math.PI / 2);

      geodeGroup.add(crystal);
      geodeGroup.add(createDot(baseX * 0.7, crystal.position.y + 5, baseZ * 0.7, 1, accentDotMat));
    }

    // Central crystal formation in geode
    const centralCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(20, 0),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.35 })
    );
    centralCrystal.position.y = -50;
    geodeGroup.add(centralCrystal);
    geodeGroup.add(createDot(0, -50, 0, 3, coreDotMat));

    // === 5. MINERAL VEIN NETWORKS ===
    const veinGroup = new THREE.Group();
    mainGroup.add(veinGroup);

    function createVein(startX, startY, startZ, length, angleH, depth = 0, maxD = 3) {
      if (depth > maxD) return;

      const endX = startX + Math.cos(angleH) * length;
      const endY = startY + (rand() - 0.5) * length * 0.3;
      const endZ = startZ + Math.sin(angleH) * length;

      const pts = [
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3((startX + endX) / 2 + (rand() - 0.5) * 10, (startY + endY) / 2, (startZ + endZ) / 2 + (rand() - 0.5) * 10),
        new THREE.Vector3(endX, endY, endZ)
      ];

      const curve = new THREE.CatmullRomCurve3(pts);
      veinGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(15)),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2 - depth * 0.04 })
      ));

      // Mineral nodes
      if (rand() > 0.6) {
        veinGroup.add(createDot(endX, endY, endZ, 1.5 - depth * 0.3, accentDotMat));
      }

      // Branching
      const branches = depth < 1 ? 3 : 2;
      for (let b = 0; b < branches; b++) {
        if (rand() > 0.4) {
          createVein(endX, endY, endZ, length * 0.6, angleH + (rand() - 0.5) * 1.5, depth + 1, maxD);
        }
      }
    }

    // Create vein networks from crystal clusters
    clusterPositions.forEach(cp => {
      for (let v = 0; v < 3; v++) {
        const a = rand() * Math.PI * 2;
        createVein(cp.x, 5, cp.z, 30, a, 0, 3);
      }
    });

    // === 6. HEXAGONAL GRID FLOOR ===
    const gridGroup = new THREE.Group();
    gridGroup.position.y = 0;
    mainGroup.add(gridGroup);

    const hexSize = 30;
    const hexH = hexSize * Math.sqrt(3);
    for (let row = -4; row <= 4; row++) {
      for (let col = -6; col <= 6; col++) {
        const x = col * hexSize * 1.5;
        const z = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);

        if (Math.sqrt(x * x + z * z) > 220) continue;

        const pts = [];
        for (let i = 0; i <= 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          pts.push(new THREE.Vector3(x + Math.cos(a) * hexSize * 0.45, 0, z + Math.sin(a) * hexSize * 0.45));
        }
        gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDimMat));
      }
    }

    // === 7. PIEZOELECTRIC ENERGY STREAMS ===
    const energyCount = 60;
    const energyGeo = new THREE.BufferGeometry();
    const energyPositions = new Float32Array(energyCount * 3);
    const energyVelocities = [];

    for (let i = 0; i < energyCount; i++) {
      const cluster = clusterPositions[Math.floor(rand() * clusterPositions.length)];
      energyPositions[i * 3] = cluster.x + (rand() - 0.5) * 30;
      energyPositions[i * 3 + 1] = rand() * 60;
      energyPositions[i * 3 + 2] = cluster.z + (rand() - 0.5) * 30;
      energyVelocities.push({
        speed: 0.3 + rand() * 0.5,
        targetY: 100 + rand() * 100,
        originX: cluster.x,
        originZ: cluster.z,
      });
    }
    energyGeo.setAttribute("position", new THREE.BufferAttribute(energyPositions, 3));
    const energyParticles = new THREE.Points(energyGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 2, transparent: true, opacity: 0.6 }));
    mainGroup.add(energyParticles);

    // === 8. LATTICE FRAMEWORK ===
    const latticeGroup = new THREE.Group();
    latticeGroup.position.y = 100;
    mainGroup.add(latticeGroup);

    // Cubic lattice surrounding core
    const latticeSize = 120;
    const latticeDiv = 4;
    const step = latticeSize / latticeDiv;

    for (let x = -latticeDiv / 2; x <= latticeDiv / 2; x++) {
      for (let y = -latticeDiv / 2; y <= latticeDiv / 2; y++) {
        for (let z = -latticeDiv / 2; z <= latticeDiv / 2; z++) {
          const px = x * step;
          const py = y * step;
          const pz = z * step;

          // Only draw outer shell
          if (Math.abs(x) === latticeDiv / 2 || Math.abs(y) === latticeDiv / 2 || Math.abs(z) === latticeDiv / 2) {
            latticeGroup.add(createDot(px, py, pz, 1, accentDotMat));

            // Connect to neighbors
            if (x < latticeDiv / 2) {
              latticeGroup.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(px, py, pz),
                  new THREE.Vector3(px + step, py, pz)
                ]),
                new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.1 })
              ));
            }
            if (y < latticeDiv / 2) {
              latticeGroup.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(px, py, pz),
                  new THREE.Vector3(px, py + step, pz)
                ]),
                new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.1 })
              ));
            }
            if (z < latticeDiv / 2) {
              latticeGroup.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(px, py, pz),
                  new THREE.Vector3(px, py, pz + step)
                ]),
                new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.1 })
              ));
            }
          }
        }
      }
    }

    // === 9. AMBIENT PARTICLES ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (rand() - 0.5) * 400;
      particlePositions[i * 3 + 1] = (rand() - 0.5) * 400 + 50;
      particlePositions[i * 3 + 2] = (rand() - 0.5) * 400;
      particleVelocities.push({
        x: (rand() - 0.5) * 0.06,
        y: (rand() - 0.5) * 0.08,
        z: (rand() - 0.5) * 0.06,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.2, transparent: true, opacity: 0.3 }));
    mainGroup.add(particles);

    // === ORBIT CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.1, y: 0 };
    let rotCurrent = { x: 0.1, y: 0 };
    let zoomTarget = 500;
    let zoomCurrent = 500;

    const el = renderer.domElement;
    el.addEventListener("mousedown", (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    el.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      rotTarget.y += (e.clientX - prevMouse.x) * 0.005;
      rotTarget.x += (e.clientY - prevMouse.y) * 0.005;
      rotTarget.x = Math.max(-1.2, Math.min(1.2, rotTarget.x));
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener("mouseup", () => isDragging = false);
    el.addEventListener("mouseleave", () => isDragging = false);
    el.addEventListener("wheel", (e) => { zoomTarget = Math.max(200, Math.min(900, zoomTarget + e.deltaY * 0.5)); });

    let touchPrev = null;
    el.addEventListener("touchstart", (e) => { if (e.touches.length === 1) touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
    el.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && touchPrev) {
        rotTarget.y += (e.touches[0].clientX - touchPrev.x) * 0.005;
        rotTarget.x += (e.touches[0].clientY - touchPrev.y) * 0.005;
        rotTarget.x = Math.max(-1.2, Math.min(1.2, rotTarget.x));
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

      if (!isDragging) rotTarget.y += 0.0006;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 60;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 30, 0);

      // Rotate platonic solids at different speeds
      dodeca.rotation.y = time * 0.1;
      dodeca.rotation.x = time * 0.05;
      icosa.rotation.y = -time * 0.15;
      icosa.rotation.z = time * 0.08;
      octa.rotation.y = time * 0.2;
      octa.rotation.x = -time * 0.12;
      cube.rotation.y = -time * 0.08;
      cube.rotation.z = time * 0.06;
      tetra.rotation.y = time * 0.25;
      tetra.rotation.x = time * 0.18;
      innerSphere.rotation.y = time * 0.3;

      // Pulse inner sphere
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      innerSphere.scale.setScalar(pulse);

      // Central geode crystal rotation
      centralCrystal.rotation.y = time * 0.2;

      // Energy particles rise from crystals
      const ePos = energyParticles.geometry.attributes.position.array;
      for (let i = 0; i < energyCount; i++) {
        ePos[i * 3 + 1] += energyVelocities[i].speed;
        if (ePos[i * 3 + 1] > energyVelocities[i].targetY) {
          ePos[i * 3] = energyVelocities[i].originX + (rand() - 0.5) * 30;
          ePos[i * 3 + 1] = 0;
          ePos[i * 3 + 2] = energyVelocities[i].originZ + (rand() - 0.5) * 30;
        }
      }
      energyParticles.geometry.attributes.position.needsUpdate = true;

      // Ambient particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (Math.abs(pos[i * 3 + 1]) > 250) {
          particleVelocities[i].y *= -1;
        }
        if (Math.abs(pos[i * 3]) > 250 || Math.abs(pos[i * 3 + 2]) > 250) {
          pos[i * 3] = (rand() - 0.5) * 300;
          pos[i * 3 + 2] = (rand() - 0.5) * 300;
        }
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000003" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Crystallum Infinitum
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
