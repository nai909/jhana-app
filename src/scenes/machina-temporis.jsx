import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function MachinaTemporis() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.0004);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 60, 500);
    camera.lookAt(0, 40, 0);

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

    function createSmallCube(x, y, z, s = 3, color = TEAL) {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createCurve(points, mat = tealMat, segments = 50) {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments)), mat);
    }

    // === 1. ARMILLARY SPHERE (center) ===
    const armillaryGroup = new THREE.Group();
    armillaryGroup.position.y = 120;
    mainGroup.add(armillaryGroup);

    // Nested rings at different tilts
    const ringData = [
      { r: 100, tiltX: 0, tiltZ: 0, mat: tealMat, tube: 1.2 },
      { r: 100, tiltX: Math.PI / 6, tiltZ: 0.3, mat: tealDarkMat, tube: 0.8 },
      { r: 100, tiltX: -Math.PI / 4, tiltZ: -0.2, mat: tealDimMat, tube: 0.8 },
      { r: 95, tiltX: Math.PI / 3, tiltZ: 0.5, mat: tealDimMat, tube: 0.6 },
      { r: 90, tiltX: -Math.PI / 6, tiltZ: 0.8, mat: tealDimMat, tube: 0.6 },
      { r: 85, tiltX: Math.PI / 2.5, tiltZ: -0.4, mat: tealDimMat, tube: 0.5 },
    ];

    const armillaryRings = [];
    ringData.forEach((rd) => {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(rd.r, rd.tube, 6, 64),
        new THREE.MeshBasicMaterial({ color: rd.mat.color || TEAL_DIM, wireframe: true, transparent: true, opacity: 0.2 })
      );
      torus.rotation.x = rd.tiltX;
      torus.rotation.z = rd.tiltZ;
      armillaryGroup.add(torus);
      armillaryRings.push(torus);
    });

    // Zodiac ring (thicker, with markers)
    const zodiacRing = new THREE.Mesh(
      new THREE.TorusGeometry(105, 3, 4, 64),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.15 })
    );
    zodiacRing.rotation.x = 0.1;
    armillaryGroup.add(zodiacRing);

    // Zodiac markers
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = Math.cos(a) * 108;
      const z = Math.sin(a) * 108;
      armillaryGroup.add(createSmallCube(x, Math.sin(0.1) * z * 0.01, z, 4, i % 3 === 0 ? TEAL_BRIGHT : TEAL));

      // Tick marks between zodiac signs
      for (let t = 1; t < 3; t++) {
        const ta = a + (t / 3) * (Math.PI * 2 / 12);
        armillaryGroup.add(createDot(Math.cos(ta) * 106, 0, Math.sin(ta) * 106, 0.8, accentDotMat));
      }
    }

    // Central axis (pole)
    const poleGeo = new THREE.CylinderGeometry(1, 1, 220, 6);
    armillaryGroup.add(new THREE.Mesh(poleGeo,
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.2 })));

    // Center mechanism
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(15, 14, 14),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.2 })
    );
    armillaryGroup.add(centerSphere);

    const innerIco = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8, 0),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.45 })
    );
    armillaryGroup.add(innerIco);

    armillaryGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // Orbital planets
    const orbitalBodies = [];
    const orbitData = [
      { r: 35, speed: 1.2, size: 3 },
      { r: 55, speed: 0.7, size: 4 },
      { r: 75, speed: 0.4, size: 3.5 },
    ];

    orbitData.forEach((od) => {
      armillaryGroup.add(createRing(od.r, 0, 48, tealDimMat));
      const body = createDot(od.r, 0, 0, od.size, accentDotMat);
      armillaryGroup.add(body);
      orbitalBodies.push({ mesh: body, r: od.r, speed: od.speed, angle: Math.random() * Math.PI * 2 });
    });

    // === 2. GEAR TRAIN (left side) ===
    const gearGroup = new THREE.Group();
    gearGroup.position.set(-180, 120, 0);
    mainGroup.add(gearGroup);

    function createGear(x, y, z, radius, teeth, mat = tealMat) {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      // Main ring
      group.add(createRing(radius, 0, 48, mat));

      // Inner ring
      group.add(createRing(radius * 0.4, 0, 24, tealDimMat));

      // Spokes
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const pts = [
          new THREE.Vector3(Math.cos(a) * radius * 0.4, 0, Math.sin(a) * radius * 0.4),
          new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDimMat));
      }

      // Teeth
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        const inner = radius;
        const outer = radius + 4;
        const pts = [
          new THREE.Vector3(Math.cos(a - 0.04) * inner, 0, Math.sin(a - 0.04) * inner),
          new THREE.Vector3(Math.cos(a - 0.02) * outer, 0, Math.sin(a - 0.02) * outer),
          new THREE.Vector3(Math.cos(a + 0.02) * outer, 0, Math.sin(a + 0.02) * outer),
          new THREE.Vector3(Math.cos(a + 0.04) * inner, 0, Math.sin(a + 0.04) * inner),
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
      }

      // Center dot
      group.add(createDot(0, 0, 0, 2, accentDotMat));

      return group;
    }

    const gear1 = createGear(0, 0, 0, 40, 20, tealMat);
    const gear2 = createGear(0, -70, 0, 28, 14, tealDarkMat);
    const gear3 = createGear(0, -120, 0, 18, 10, tealDimMat);
    gearGroup.add(gear1, gear2, gear3);

    // Connections between gears
    gearGroup.add(createCurve([
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(-5, -35, 5),
      new THREE.Vector3(0, -68, 0)
    ], tealDimMat, 15));
    gearGroup.add(createCurve([
      new THREE.Vector3(0, -72, 0),
      new THREE.Vector3(3, -96, -3),
      new THREE.Vector3(0, -118, 0)
    ], tealDimMat, 12));

    // === 3. GEAR TRAIN (right side, mirrored) ===
    const gearGroupR = new THREE.Group();
    gearGroupR.position.set(180, 120, 0);
    mainGroup.add(gearGroupR);

    const gearR1 = createGear(0, 0, 0, 35, 18, tealMat);
    const gearR2 = createGear(0, -60, 0, 25, 12, tealDarkMat);
    const gearR3 = createGear(0, -105, 0, 20, 10, tealDimMat);
    const gearR4 = createGear(0, -140, 0, 14, 8, tealDimMat);
    gearGroupR.add(gearR1, gearR2, gearR3, gearR4);

    // === 4. HOURGLASS (below center) ===
    const hourglassGroup = new THREE.Group();
    hourglassGroup.position.y = -80;
    mainGroup.add(hourglassGroup);

    // Upper and lower cones
    const glassH = 80, glassR = 40, neckR = 5;

    function createHourglassHalf(flip) {
      const pts = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const r = neckR + (glassR - neckR) * Math.pow(t, 0.7);
        const y = t * glassH * flip;
        pts.push(new THREE.Vector2(r, y));
      }
      const geo = new THREE.LatheGeometry(pts, 16);
      return new THREE.Mesh(geo,
        new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.15 }));
    }

    hourglassGroup.add(createHourglassHalf(1));
    hourglassGroup.add(createHourglassHalf(-1));

    // Horizontal rings on hourglass
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const t = Math.abs(i) / 3;
      const r = neckR + (glassR - neckR) * Math.pow(t, 0.7);
      hourglassGroup.add(createRing(r, i * (glassH / 3), 24,
        Math.abs(i) === 3 ? tealMat : tealDimMat));
    }

    // Neck ring
    hourglassGroup.add(createRing(neckR, 0, 16, tealBrightMat));
    hourglassGroup.add(createDot(0, 0, 0, 2, coreDotMat));

    // Frame
    const frameH = glassH + 10;
    [[-glassR - 5, glassR + 5], [glassR + 5, glassR + 5], [-glassR - 5, -glassR - 5], [glassR + 5, -glassR - 5]].forEach(([x, z]) => {
      hourglassGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, -frameH, z > 0 ? 5 : -5),
          new THREE.Vector3(x, frameH, z > 0 ? 5 : -5)
        ]), tealDarkMat));
    });

    // Top and bottom frame rings
    hourglassGroup.add(createRing(glassR + 8, frameH, 32, tealMat));
    hourglassGroup.add(createRing(glassR + 8, -frameH, 32, tealMat));

    // Sand particles (falling)
    const sandCount = 60;
    const sandGeo = new THREE.BufferGeometry();
    const sandPositions = new Float32Array(sandCount * 3);
    const sandVelocities = [];

    for (let i = 0; i < sandCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 3;
      sandPositions[i * 3] = Math.cos(a) * r;
      sandPositions[i * 3 + 1] = Math.random() * glassH * 0.8;
      sandPositions[i * 3 + 2] = Math.sin(a) * r;
      sandVelocities.push({ speed: 0.3 + Math.random() * 0.5 });
    }
    sandGeo.setAttribute("position", new THREE.BufferAttribute(sandPositions, 3));
    const sandParticles = new THREE.Points(sandGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.2, transparent: true, opacity: 0.6 }));
    hourglassGroup.add(sandParticles);

    // === 5. PENDULUM (below hourglass) ===
    const pendulumGroup = new THREE.Group();
    pendulumGroup.position.y = -180;
    mainGroup.add(pendulumGroup);

    // Pivot
    pendulumGroup.add(createDot(0, 50, 0, 3, accentDotMat));

    // Rod
    const pendulumRod = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 50, 0), new THREE.Vector3(0, -50, 0)
      ]), tealMat);
    pendulumGroup.add(pendulumRod);

    // Bob (disc)
    const bob = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 3, 16),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.25 })
    );
    bob.position.y = -50;
    pendulumGroup.add(bob);
    pendulumGroup.add(createDot(0, -50, 0, 2.5, coreDotMat));

    // Fibonacci spiral trail
    const fibPts = [];
    let fibA = 0, fibR = 0;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      fibR = Math.pow(1.618, t * 4) * 2;
      fibA = t * Math.PI * 8;
      fibPts.push(new THREE.Vector3(Math.cos(fibA) * fibR, -50, Math.sin(fibA) * fibR));
    }
    pendulumGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(fibPts),
      new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2 })));

    // === 6. ASTRONOMICAL DIALS (flanking) ===
    function createDial(x, y, z, radius, divisions, label) {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      // Outer ring
      group.add(createRing(radius, 0, 64, tealMat));
      group.add(createRing(radius * 0.85, 0, 48, tealDarkMat));
      group.add(createRing(radius * 0.3, 0, 24, tealDimMat));

      // Tick marks
      for (let i = 0; i < divisions; i++) {
        const a = (i / divisions) * Math.PI * 2;
        const inner = i % (divisions / 4) === 0 ? radius * 0.7 : radius * 0.82;
        const pts = [
          new THREE.Vector3(Math.cos(a) * inner, 0, Math.sin(a) * inner),
          new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
          i % (divisions / 4) === 0 ? tealBrightMat : tealDimMat));
      }

      // Cardinal cubes
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        group.add(createSmallCube(Math.cos(a) * radius, 0, Math.sin(a) * radius, 3, TEAL_BRIGHT));
      }

      // Needle / hand
      const handMesh = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, radius * 0.75)
        ]), tealBrightMat);
      group.add(handMesh);
      group.userData.hand = handMesh;

      group.add(createDot(0, 0, 0, 2.5, coreDotMat));

      return group;
    }

    const dialL = createDial(-200, 280, 0, 45, 24, "hours");
    const dialR = createDial(200, 280, 0, 35, 60, "minutes");
    const dialBot = createDial(0, -300, 0, 50, 12, "months");
    mainGroup.add(dialL, dialR, dialBot);

    // === 7. CONNECTING FRAMEWORK ===
    // Vertical columns
    [[-160, 160], [160, 160]].forEach(([x, z]) => {
      const col = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 350, 0),
          new THREE.Vector3(x, -250, 0)
        ]),
        new THREE.LineDashedMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2, dashSize: 4, gapSize: 3 })
      );
      col.computeLineDistances();
      mainGroup.add(col);
    });

    // Cross braces
    mainGroup.add(createCurve([
      new THREE.Vector3(-160, 280, 0), new THREE.Vector3(-120, 200, 20),
      new THREE.Vector3(-100, 140, 10), new THREE.Vector3(-80, 120, 0)
    ], tealDimMat, 20));
    mainGroup.add(createCurve([
      new THREE.Vector3(160, 280, 0), new THREE.Vector3(120, 200, -20),
      new THREE.Vector3(100, 140, -10), new THREE.Vector3(80, 120, 0)
    ], tealDimMat, 20));

    // Junction cubes
    [[-160, 280], [160, 280], [-160, -80], [160, -80], [0, 320], [0, -250]].forEach(([x, y]) => {
      mainGroup.add(createSmallCube(x, y, 0, 4, TEAL));
    });

    // === 8. ESCAPEMENT MECHANISM (top) ===
    const escapementGroup = new THREE.Group();
    escapementGroup.position.y = 320;
    mainGroup.add(escapementGroup);

    // Escape wheel
    const escR = 30;
    escapementGroup.add(createRing(escR, 0, 48, tealMat));
    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(Math.cos(a) * escR, 0, Math.sin(a) * escR),
        new THREE.Vector3(Math.cos(a) * (escR + 6), 0, Math.sin(a + 0.1) * (escR + 6)),
      ];
      escapementGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDarkMat));
    }
    escapementGroup.add(createDot(0, 0, 0, 2, coreDotMat));

    // Pallet fork
    const palletPts = [
      new THREE.Vector3(-15, 20, 0),
      new THREE.Vector3(0, 8, 0),
      new THREE.Vector3(15, 20, 0),
    ];
    escapementGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(palletPts), tealBrightMat));
    palletPts.forEach(p => escapementGroup.add(createDot(p.x, p.y, p.z, 1.5, accentDotMat)));

    // === 9. AMBIENT PARTICLES ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 400;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 700 + 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.1 + 0.04,
        z: (Math.random() - 0.5) * 0.08,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.5, transparent: true, opacity: 0.35 }));
    mainGroup.add(particles);

    // === ORBIT CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.1, y: 0 };
    let rotCurrent = { x: 0.1, y: 0 };
    let zoomTarget = 500;
    let zoomCurrent = 500;

    const el = renderer.domElement;
    const onDown = (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const onMove = (e) => {
      if (!isDragging) return;
      rotTarget.y += (e.clientX - prevMouse.x) * 0.005;
      rotTarget.x += (e.clientY - prevMouse.y) * 0.005;
      rotTarget.x = Math.max(-1.2, Math.min(1.2, rotTarget.x));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => isDragging = false;
    const onWheel = (e) => { zoomTarget = Math.max(200, Math.min(900, zoomTarget + e.deltaY * 0.5)); };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mouseleave", onUp);
    el.addEventListener("wheel", onWheel);

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

      if (!isDragging) rotTarget.y += 0.0008;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 60;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 40, 0);

      // Armillary rings rotate at different speeds
      armillaryRings.forEach((ring, i) => {
        ring.rotation.y += 0.001 * (1 + i * 0.3) * (i % 2 === 0 ? 1 : -1);
      });
      zodiacRing.rotation.y += 0.0005;

      // Center mechanism
      innerIco.rotation.x = time * 0.5;
      innerIco.rotation.y = time * 0.7;
      centerSphere.scale.setScalar(1 + Math.sin(time * 2) * 0.08);

      // Orbital bodies
      orbitalBodies.forEach((ob) => {
        ob.angle += ob.speed * 0.003;
        ob.mesh.position.x = Math.cos(ob.angle) * ob.r;
        ob.mesh.position.z = Math.sin(ob.angle) * ob.r;
      });

      // Gears rotate
      gear1.rotation.y = time * 0.4;
      gear2.rotation.y = -time * 0.57;
      gear3.rotation.y = time * 0.8;
      gearR1.rotation.y = -time * 0.35;
      gearR2.rotation.y = time * 0.5;
      gearR3.rotation.y = -time * 0.7;
      gearR4.rotation.y = time * 1.0;

      // Dial hands
      dialL.userData.hand.rotation.y = time * 0.1;
      dialR.userData.hand.rotation.y = time * 1.2;
      dialBot.userData.hand.rotation.y = time * 0.008;

      // Escapement
      escapementGroup.rotation.y = time * 0.6;

      // Pendulum swing
      const swing = Math.sin(time * 1.5) * 0.25;
      pendulumGroup.rotation.z = swing;

      // Sand particles
      const sPos = sandParticles.geometry.attributes.position.array;
      for (let i = 0; i < sandCount; i++) {
        sPos[i * 3 + 1] -= sandVelocities[i].speed * 0.3;
        if (sPos[i * 3 + 1] < -glassH * 0.7) {
          sPos[i * 3 + 1] = glassH * 0.6;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 3;
          sPos[i * 3] = Math.cos(a) * r;
          sPos[i * 3 + 2] = Math.sin(a) * r;
        }
      }
      sandParticles.geometry.attributes.position.needsUpdate = true;

      // Ambient particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (pos[i * 3 + 1] > 400) {
          pos[i * 3 + 1] = -250;
          pos[i * 3] = (Math.random() - 0.5) * 400;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
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
        Machina Temporis
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
