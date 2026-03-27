import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ArborMundi() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.00035);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 100, 550);
    camera.lookAt(0, 80, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const TEAL = 0x4ecdc4;
    const TEAL_DARK = 0x2a9d8f;
    const TEAL_BRIGHT = 0x7fffe5;
    const TEAL_DIM = 0x1a3a38;
    const WHITE_GLOW = 0xa0fff0;

    const tealMat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: TEAL_DARK, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: WHITE_GLOW, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 123;
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

    function createCurve(points, mat = tealMat, segments = 50) {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments)), mat);
    }

    function createSmallCube(x, y, z, s = 3, color = TEAL) {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
      m.position.set(x, y, z);
      return m;
    }

    // === REALM MARKERS ===
    // Underworld boundary
    mainGroup.add(createRing(200, -100, 64, tealDimMat));
    // Middle earth
    mainGroup.add(createRing(220, 0, 64, tealDarkMat));
    // Heavens boundary
    mainGroup.add(createRing(180, 280, 64, tealDimMat));

    // === 1. TRUNK ===
    const trunkGroup = new THREE.Group();
    mainGroup.add(trunkGroup);

    // Main trunk as tube with organic wobble
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -80, 0),
      new THREE.Vector3(3, -40, 2),
      new THREE.Vector3(-2, 0, -3),
      new THREE.Vector3(4, 50, 2),
      new THREE.Vector3(-3, 100, -2),
      new THREE.Vector3(2, 150, 3),
      new THREE.Vector3(0, 200, 0),
    ]);

    // Trunk wireframe layers
    for (let layer = 0; layer < 3; layer++) {
      const r = 25 - layer * 5;
      const trunkGeo = new THREE.TubeGeometry(trunkCurve, 40, r, 12, false);
      trunkGroup.add(new THREE.Mesh(trunkGeo, new THREE.MeshBasicMaterial({
        color: layer === 0 ? TEAL : (layer === 1 ? TEAL_DARK : TEAL_DIM),
        wireframe: true, transparent: true, opacity: 0.12 - layer * 0.03
      })));
    }

    // Trunk center line
    trunkGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(trunkCurve.getPoints(60)),
      tealBrightMat
    ));

    // Growth rings (cross-section visible at base)
    for (let i = 1; i <= 8; i++) {
      trunkGroup.add(createRing(i * 3, -80, 24, i % 2 === 0 ? tealDarkMat : tealDimMat));
    }
    trunkGroup.add(createDot(0, -80, 0, 3, coreDotMat));

    // Bark texture - vertical lines
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const p = trunkCurve.getPoint(t * 0.9 + 0.05);
        const wobble = Math.sin(t * 10 + i) * 2;
        pts.push(new THREE.Vector3(
          p.x + Math.cos(a) * (22 + wobble),
          p.y,
          p.z + Math.sin(a) * (22 + wobble)
        ));
      }
      trunkGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDimMat));
    }

    // === 2. BRANCHES ===
    const branchGroup = new THREE.Group();
    branchGroup.position.y = 180;
    mainGroup.add(branchGroup);

    function createBranch(startX, startY, startZ, length, angleH, angleV, depth = 0, maxD = 4) {
      if (depth > maxD) return;

      const endX = startX + Math.cos(angleH) * Math.cos(angleV) * length;
      const endY = startY + Math.sin(angleV) * length;
      const endZ = startZ + Math.sin(angleH) * Math.cos(angleV) * length;

      const midX = (startX + endX) / 2 + (rand() - 0.5) * length * 0.2;
      const midY = (startY + endY) / 2 + rand() * length * 0.1;
      const midZ = (startZ + endZ) / 2 + (rand() - 0.5) * length * 0.2;

      const opacity = 0.5 - depth * 0.1;
      const mat = new THREE.LineBasicMaterial({ color: depth < 2 ? TEAL : TEAL_DARK, transparent: true, opacity: Math.max(0.1, opacity) });

      branchGroup.add(createCurve([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(midX, midY, midZ),
        new THREE.Vector3(endX, endY, endZ)
      ], mat, 12));

      if (depth < maxD) {
        branchGroup.add(createDot(endX, endY, endZ, 1.5 - depth * 0.2, accentDotMat));
      }

      const branches = depth < 2 ? 3 : 2;
      for (let b = 0; b < branches; b++) {
        const newAngleH = angleH + (rand() - 0.5) * 1.2;
        const newAngleV = angleV * 0.7 + (rand() - 0.3) * 0.4;
        createBranch(endX, endY, endZ, length * 0.65, newAngleH, newAngleV, depth + 1, maxD);
      }
    }

    // Main branches radiating from crown
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      createBranch(0, 20, 0, 50, angle, 0.5 + rand() * 0.3, 0, 4);
    }

    // Upward reaching branches
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 0.3;
      createBranch(0, 25, 0, 60, angle, 0.8 + rand() * 0.2, 0, 3);
    }

    // === 3. ROOTS ===
    const rootGroup = new THREE.Group();
    rootGroup.position.y = -80;
    mainGroup.add(rootGroup);

    function createRoot(startX, startY, startZ, length, angleH, angleV, depth = 0, maxD = 4) {
      if (depth > maxD) return;

      const endX = startX + Math.cos(angleH) * Math.cos(angleV) * length;
      const endY = startY - Math.abs(Math.sin(angleV)) * length; // Always go down
      const endZ = startZ + Math.sin(angleH) * Math.cos(angleV) * length;

      const midX = (startX + endX) / 2 + (rand() - 0.5) * length * 0.3;
      const midY = (startY + endY) / 2;
      const midZ = (startZ + endZ) / 2 + (rand() - 0.5) * length * 0.3;

      const opacity = 0.5 - depth * 0.08;
      const mat = new THREE.LineBasicMaterial({ color: depth < 2 ? TEAL_DARK : TEAL_DIM, transparent: true, opacity: Math.max(0.08, opacity) });

      rootGroup.add(createCurve([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(midX, midY, midZ),
        new THREE.Vector3(endX, endY, endZ)
      ], mat, 12));

      const branches = depth < 2 ? 3 : 2;
      for (let b = 0; b < branches; b++) {
        const newAngleH = angleH + (rand() - 0.5) * 1.5;
        const newAngleV = angleV * 0.8 + (rand() - 0.5) * 0.3;
        createRoot(endX, endY, endZ, length * 0.6, newAngleH, newAngleV, depth + 1, maxD);
      }
    }

    // Main tap root
    rootGroup.add(createCurve([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, -50, 1),
      new THREE.Vector3(-1, -100, -2),
      new THREE.Vector3(0, -150, 0)
    ], tealMat, 30));
    rootGroup.add(createDot(0, -150, 0, 3, coreDotMat));

    // Spreading roots
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      createRoot(Math.cos(angle) * 20, 0, Math.sin(angle) * 20, 45, angle, 0.4 + rand() * 0.3, 0, 4);
    }

    // === 4. SERPENT (coiling around trunk) ===
    const serpentGroup = new THREE.Group();
    mainGroup.add(serpentGroup);

    const serpentPts = [];
    const coils = 4;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const y = -60 + t * 240;
      const p = trunkCurve.getPoint(Math.min(0.95, t * 0.8 + 0.1));
      const a = t * coils * Math.PI * 2;
      const r = 28 + Math.sin(t * Math.PI) * 5;
      serpentPts.push(new THREE.Vector3(
        p.x + Math.cos(a) * r,
        y,
        p.z + Math.sin(a) * r
      ));
    }
    serpentGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(serpentPts), tealBrightMat));

    // Serpent body tube
    const serpentCurve = new THREE.CatmullRomCurve3(serpentPts);
    serpentGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(serpentCurve, 100, 2, 6, false),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.15 })
    ));

    // Serpent head
    const headPos = serpentPts[serpentPts.length - 1];
    const headMesh = new THREE.Mesh(
      new THREE.ConeGeometry(4, 12, 6),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.3 })
    );
    headMesh.position.copy(headPos);
    headMesh.rotation.x = -Math.PI / 4;
    serpentGroup.add(headMesh);
    serpentGroup.add(createDot(headPos.x, headPos.y + 6, headPos.z, 2, coreDotMat));

    // Serpent scales (dots along body)
    for (let i = 0; i < 40; i++) {
      const p = serpentCurve.getPoint(i / 40);
      if (i % 4 === 0) serpentGroup.add(createDot(p.x, p.y, p.z, 1, accentDotMat));
    }

    // === 5. BIRD NESTS (in branches) ===
    const nestPositions = [
      { x: 60, y: 260, z: 30 },
      { x: -50, y: 280, z: -40 },
      { x: 20, y: 300, z: -60 },
    ];

    nestPositions.forEach(np => {
      const nestGroup = new THREE.Group();
      nestGroup.position.set(np.x, np.y, np.z);

      // Nest bowl
      const nestMesh = new THREE.Mesh(
        new THREE.SphereGeometry(10, 12, 8, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5),
        new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.25 })
      );
      nestGroup.add(nestMesh);

      // Nest rim
      nestGroup.add(createRing(10, Math.cos(Math.PI * 0.3) * 10, 16, tealMat));

      // Eggs
      for (let e = 0; e < 3; e++) {
        const ea = (e / 3) * Math.PI * 2;
        const egg = new THREE.Mesh(
          new THREE.SphereGeometry(2.5, 8, 8),
          new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.35 })
        );
        egg.position.set(Math.cos(ea) * 4, 2, Math.sin(ea) * 4);
        egg.scale.set(0.8, 1.2, 0.8);
        nestGroup.add(egg);
      }

      mainGroup.add(nestGroup);
    });

    // === 6. RUNIC SYMBOLS (carved into trunk) ===
    const runeGroup = new THREE.Group();
    mainGroup.add(runeGroup);

    // Simple rune shapes at trunk level
    const runePositions = [0, 40, 80, 120];
    runePositions.forEach((ry, ri) => {
      const runeA = (ri / 4) * Math.PI * 2 + 0.5;
      const rx = Math.cos(runeA) * 26;
      const rz = Math.sin(runeA) * 26;

      // Simple geometric runes
      const runeSize = 8;
      const runes = [
        // Algiz (protection)
        [[0, 0], [0, runeSize], [-runeSize / 2, runeSize * 0.7], [0, runeSize], [runeSize / 2, runeSize * 0.7]],
        // Ansuz (wisdom)
        [[0, 0], [0, runeSize], [-runeSize / 3, runeSize * 0.6], [0, runeSize], [-runeSize / 3, runeSize * 0.3]],
        // Fehu (abundance)
        [[0, 0], [0, runeSize], [runeSize / 2, runeSize], [0, runeSize], [runeSize / 2, runeSize * 0.6]],
        // Othala (home)
        [[0, 0], [runeSize / 2, runeSize / 2], [0, runeSize], [-runeSize / 2, runeSize / 2], [0, 0]],
      ];

      const runePts = runes[ri].map(([dx, dy]) =>
        new THREE.Vector3(rx + dx * 0.1, ry + dy, rz + dx * 0.1)
      );
      runeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(runePts), tealBrightMat));
    });

    // === 7. CELESTIAL CROWN (heavens) ===
    const celestialGroup = new THREE.Group();
    celestialGroup.position.y = 350;
    mainGroup.add(celestialGroup);

    // Sun symbol
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(20, 16, 16),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.25 })
    );
    celestialGroup.add(sunMesh);
    celestialGroup.add(createDot(0, 0, 0, 4, coreDotMat));

    // Sun rays
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      celestialGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * 22, Math.sin(a) * 22, 0),
          new THREE.Vector3(Math.cos(a) * 40, Math.sin(a) * 40, 0)
        ]), i % 3 === 0 ? tealBrightMat : tealDimMat
      ));
    }

    // Moon (offset)
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(12, 12, 12),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.2 })
    );
    moonMesh.position.set(60, -20, 30);
    celestialGroup.add(moonMesh);

    // Orbital path
    const orbitPts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      orbitPts.push(new THREE.Vector3(Math.cos(a) * 60, Math.sin(a * 0.5) * 10 - 10, Math.sin(a) * 60));
    }
    celestialGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), tealDimMat));

    // Stars
    for (let i = 0; i < 30; i++) {
      const sa = rand() * Math.PI * 2;
      const sr = 50 + rand() * 80;
      const sy = (rand() - 0.5) * 60;
      celestialGroup.add(createDot(Math.cos(sa) * sr, sy, Math.sin(sa) * sr, 1 + rand(), accentDotMat));
    }

    // === 8. UNDERWORLD WELL (below roots) ===
    const wellGroup = new THREE.Group();
    wellGroup.position.y = -180;
    mainGroup.add(wellGroup);

    // Well of wisdom
    for (let i = 0; i < 5; i++) {
      wellGroup.add(createRing(30 + i * 8, -i * 10, 24, i === 0 ? tealMat : tealDimMat));
    }

    // Water surface
    const waterMesh = new THREE.Mesh(
      new THREE.CircleGeometry(30, 24),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.15 })
    );
    waterMesh.rotation.x = -Math.PI / 2;
    wellGroup.add(waterMesh);
    wellGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // Ripples
    for (let i = 1; i <= 4; i++) {
      wellGroup.add(createRing(i * 7, 1, 16, tealDimMat));
    }

    // === 9. LEAF PARTICLES ===
    const leafCount = 100;
    const leafGeo = new THREE.BufferGeometry();
    const leafPositions = new Float32Array(leafCount * 3);
    const leafVelocities = [];

    for (let i = 0; i < leafCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = 30 + rand() * 120;
      leafPositions[i * 3] = Math.cos(a) * r;
      leafPositions[i * 3 + 1] = 200 + rand() * 150;
      leafPositions[i * 3 + 2] = Math.sin(a) * r;
      leafVelocities.push({
        x: (rand() - 0.5) * 0.15,
        y: -(0.05 + rand() * 0.1),
        z: (rand() - 0.5) * 0.15,
        phase: rand() * Math.PI * 2,
      });
    }
    leafGeo.setAttribute("position", new THREE.BufferAttribute(leafPositions, 3));
    const leafParticles = new THREE.Points(leafGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 2, transparent: true, opacity: 0.5 }));
    mainGroup.add(leafParticles);

    // === 10. AMBIENT PARTICLES ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (rand() - 0.5) * 400;
      particlePositions[i * 3 + 1] = (rand() - 0.5) * 600 + 50;
      particlePositions[i * 3 + 2] = (rand() - 0.5) * 400;
      particleVelocities.push({
        x: (rand() - 0.5) * 0.08,
        y: (rand() - 0.5) * 0.1 + 0.03,
        z: (rand() - 0.5) * 0.08,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.5, transparent: true, opacity: 0.3 }));
    mainGroup.add(particles);

    // === ORBIT CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.08, y: 0 };
    let rotCurrent = { x: 0.08, y: 0 };
    let zoomTarget = 550;
    let zoomCurrent = 550;

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
    el.addEventListener("wheel", (e) => { zoomTarget = Math.max(250, Math.min(900, zoomTarget + e.deltaY * 0.5)); });

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
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 100;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 80, 0);

      // Sun pulse
      const pulse = 1 + Math.sin(time * 2) * 0.08;
      sunMesh.scale.setScalar(pulse);

      // Moon orbit
      const moonA = time * 0.3;
      moonMesh.position.x = Math.cos(moonA) * 60;
      moonMesh.position.z = Math.sin(moonA) * 60;

      // Leaf particles fall and drift
      const lPos = leafParticles.geometry.attributes.position.array;
      for (let i = 0; i < leafCount; i++) {
        const lv = leafVelocities[i];
        lPos[i * 3] += lv.x + Math.sin(time * 2 + lv.phase) * 0.1;
        lPos[i * 3 + 1] += lv.y;
        lPos[i * 3 + 2] += lv.z + Math.cos(time * 1.5 + lv.phase) * 0.08;
        if (lPos[i * 3 + 1] < -100) {
          lPos[i * 3 + 1] = 350;
          const a = rand() * Math.PI * 2;
          const r = 30 + rand() * 100;
          lPos[i * 3] = Math.cos(a) * r;
          lPos[i * 3 + 2] = Math.sin(a) * r;
        }
      }
      leafParticles.geometry.attributes.position.needsUpdate = true;

      // Ambient particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (pos[i * 3 + 1] > 400) {
          pos[i * 3 + 1] = -200;
          pos[i * 3] = (rand() - 0.5) * 400;
          pos[i * 3 + 2] = (rand() - 0.5) * 400;
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Arbor Mundi
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
