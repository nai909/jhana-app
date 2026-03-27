import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function OceanusProfundus() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000205);
    scene.fog = new THREE.FogExp2(0x000205, 0.0003);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 60, 500);
    camera.lookAt(0, 20, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const TEAL = 0x4ecdc4;
    const TEAL_DARK = 0x2a9d8f;
    const TEAL_BRIGHT = 0x7fffe5;
    const TEAL_DIM = 0x1a3a38;
    const WHITE_GLOW = 0xa0fff0;
    const DEEP_BLUE = 0x0a3a5a;

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

    // === 1. JELLYFISH CATHEDRAL (center) ===
    const jellyGroup = new THREE.Group();
    jellyGroup.position.y = 180;
    mainGroup.add(jellyGroup);

    // Bell dome — layered hemispheres
    for (let layer = 0; layer < 4; layer++) {
      const r = 70 - layer * 8;
      const bellMesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16 - layer * 2, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
        new THREE.MeshBasicMaterial({ color: layer === 0 ? TEAL : (layer === 1 ? TEAL_DARK : TEAL_DIM), wireframe: true, transparent: true, opacity: 0.15 - layer * 0.03 })
      );
      jellyGroup.add(bellMesh);
    }

    // Bell ribs (meridian lines)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const phi = t * Math.PI * 0.6;
        const r = 70;
        pts.push(new THREE.Vector3(
          Math.sin(phi) * Math.cos(a) * r,
          Math.cos(phi) * r,
          Math.sin(phi) * Math.sin(a) * r
        ));
      }
      jellyGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDarkMat));
    }

    // Bell rings (latitude)
    for (let i = 1; i <= 5; i++) {
      const phi = (i / 8) * Math.PI * 0.6;
      const ringR = Math.sin(phi) * 70;
      const ringY = Math.cos(phi) * 70;
      jellyGroup.add(createRing(ringR, ringY, 32, tealDimMat));
    }

    // Inner organs / radial channels
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = 40;
      jellyGroup.add(createCurve([
        new THREE.Vector3(0, 50, 0),
        new THREE.Vector3(Math.cos(a) * r * 0.4, 30, Math.sin(a) * r * 0.4),
        new THREE.Vector3(Math.cos(a) * r, 5, Math.sin(a) * r),
      ], tealDimMat, 15));
      jellyGroup.add(createDot(Math.cos(a) * r, 5, Math.sin(a) * r, 2, accentDotMat));
    }

    // Core
    const jellyCoreGeo = new THREE.SphereGeometry(10, 12, 12);
    const jellyCore = new THREE.Mesh(jellyCoreGeo,
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.3 }));
    jellyCore.position.y = 40;
    jellyGroup.add(jellyCore);
    jellyGroup.add(createDot(0, 40, 0, 3, coreDotMat));

    // === TENTACLES (neural network) ===
    let tseed = 42;
    function tRand() { tseed = (tseed * 16807) % 2147483647; return (tseed - 1) / 2147483646; }

    const tentacles = [];
    for (let t = 0; t < 16; t++) {
      const baseA = (t / 16) * Math.PI * 2;
      const baseR = 55 + tRand() * 15;
      const length = 120 + tRand() * 80;
      const segs = 8;
      const pts = [];
      for (let s = 0; s <= segs; s++) {
        const st = s / segs;
        const x = Math.cos(baseA) * baseR * (1 - st * 0.3) + tRand() * 15 * st;
        const y = -st * length;
        const z = Math.sin(baseA) * baseR * (1 - st * 0.3) + tRand() * 15 * st;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const tentacle = createCurve(pts, t % 3 === 0 ? tealMat : tealDarkMat, 20);
      jellyGroup.add(tentacle);
      tentacles.push(pts);

      // Neural nodes along tentacle
      for (let n = 1; n < segs; n += 2) {
        const p = pts[n];
        jellyGroup.add(createDot(p.x, p.y, p.z, 1.5, accentDotMat));

        // Branch connections
        if (t < 15) {
          const nextBase = ((t + 1) / 16) * Math.PI * 2;
          const nx = Math.cos(nextBase) * baseR * (1 - (n / segs) * 0.3);
          const nz = Math.sin(nextBase) * baseR * (1 - (n / segs) * 0.3);
          jellyGroup.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(p.x, p.y, p.z),
              new THREE.Vector3((p.x + nx) / 2, p.y - 5, (p.z + nz) / 2)
            ]),
            new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.15 })
          ));
        }
      }
    }

    // Oral arms (thicker, fewer)
    for (let oa = 0; oa < 4; oa++) {
      const a = (oa / 4) * Math.PI * 2 + Math.PI / 8;
      const pts = [];
      for (let s = 0; s <= 12; s++) {
        const st = s / 12;
        const ruffle = Math.sin(st * Math.PI * 4) * 15 * st;
        pts.push(new THREE.Vector3(
          Math.cos(a) * (30 + ruffle) * (1 - st * 0.2),
          -st * 150,
          Math.sin(a) * (30 + ruffle) * (1 - st * 0.2)
        ));
      }
      jellyGroup.add(createCurve(pts, tealBrightMat, 30));
    }

    // === 2. NAUTILUS SHELL (left side) ===
    const nautilusGroup = new THREE.Group();
    nautilusGroup.position.set(-200, 60, 0);
    mainGroup.add(nautilusGroup);

    // Golden spiral
    const spiralPts = [];
    const spiralPtsInner = [];
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const a = t * Math.PI * 5;
      const r = Math.pow(1.618, t * 3) * 3;
      spiralPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
      spiralPtsInner.push(new THREE.Vector3(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, 0));
    }
    nautilusGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(spiralPts), tealMat));
    nautilusGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(spiralPtsInner), tealDarkMat));

    // Chamber walls
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const a = t * Math.PI * 5;
      const r = Math.pow(1.618, t * 3) * 3;
      const rI = r * 0.85;
      nautilusGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * rI, Math.sin(a) * rI, 0),
          new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
        ]), tealDimMat));
    }

    // Outer shell curve
    const shellOuter = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const a = t * Math.PI * 5;
      const r = Math.pow(1.618, t * 3) * 3 + 5;
      shellOuter.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -3 + Math.sin(t * Math.PI) * 6));
    }
    nautilusGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(shellOuter), tealDimMat));

    // Siphuncle (center tube)
    nautilusGroup.add(createCurve([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 5, 0),
      new THREE.Vector3(30, 15, 0),
      new THREE.Vector3(60, 30, 0),
    ], tealBrightMat, 20));

    nautilusGroup.add(createDot(0, 0, 0, 2.5, coreDotMat));

    // === 3. CORAL REEF (bottom) ===
    const coralGroup = new THREE.Group();
    coralGroup.position.y = -120;
    mainGroup.add(coralGroup);

    // Seafloor grid
    const gridSize = 300, gridDiv = 15;
    for (let i = -gridDiv / 2; i <= gridDiv / 2; i++) {
      const x = (i / (gridDiv / 2)) * gridSize;
      coralGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, -gridSize), new THREE.Vector3(x, 0, gridSize)
        ]),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.1 })
      ));
      coralGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-gridSize, 0, x), new THREE.Vector3(gridSize, 0, x)
        ]),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.1 })
      ));
    }

    // Fractal coral branches
    function createCoral(x, z, height, depth = 0, maxD = 3) {
      if (depth > maxD) return;
      const topY = height;
      const sway = (tRand() - 0.5) * 10;

      coralGroup.add(createCurve([
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(x + sway * 0.5, topY * 0.5, z + sway * 0.3),
        new THREE.Vector3(x + sway, topY, z + sway * 0.5),
      ], depth === 0 ? tealMat : tealDarkMat, 10));

      coralGroup.add(createDot(x + sway, topY, z + sway * 0.5, 1.5 - depth * 0.3, accentDotMat));

      const branches = depth < 1 ? 3 : 2;
      for (let b = 0; b < branches; b++) {
        const ba = tRand() * Math.PI * 2;
        const bx = x + sway + Math.cos(ba) * 8;
        const bz = z + sway * 0.5 + Math.sin(ba) * 8;
        createCoral(bx, bz, height * 0.6, depth + 1, maxD);
      }
    }

    // Coral placements
    createCoral(-100, -40, 50, 0, 3);
    createCoral(-60, 30, 40, 0, 2);
    createCoral(80, -30, 55, 0, 3);
    createCoral(120, 20, 35, 0, 2);
    createCoral(-30, -60, 30, 0, 2);
    createCoral(40, 50, 45, 0, 3);

    // Fan corals (flat shapes)
    function createFanCoral(x, z, size, rotY) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotY;

      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 0.8 - Math.PI * 0.4;
        const pts = [];
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          pts.push(new THREE.Vector3(
            Math.sin(a) * t * size,
            t * size,
            Math.cos(a) * t * size * 0.1
          ));
        }
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDimMat));
      }

      // Cross connections
      for (let h = 0.3; h < 1; h += 0.25) {
        const arcPts = [];
        for (let i = 0; i <= 12; i++) {
          const a = (i / 12) * Math.PI * 0.8 - Math.PI * 0.4;
          arcPts.push(new THREE.Vector3(
            Math.sin(a) * h * size,
            h * size,
            Math.cos(a) * h * size * 0.1
          ));
        }
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts),
          new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.15 })));
      }

      coralGroup.add(group);
    }

    createFanCoral(-140, 10, 40, 0.3);
    createFanCoral(150, -20, 35, -0.5);

    // === 4. FISH SCHOOLS ===
    const fishGroup = new THREE.Group();
    fishGroup.position.y = 100;
    mainGroup.add(fishGroup);

    const fishData = [];
    for (let school = 0; school < 3; school++) {
      const centerA = (school / 3) * Math.PI * 2;
      const centerR = 140 + school * 20;
      const centerY = 20 - school * 30;

      for (let f = 0; f < 8; f++) {
        const offset = { x: (tRand() - 0.5) * 30, y: (tRand() - 0.5) * 15, z: (tRand() - 0.5) * 30 };

        // Simple diamond fish shape
        const fishMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(3 + tRand() * 2, 0),
          new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.35 })
        );
        fishMesh.scale.set(2, 0.8, 0.6);
        fishGroup.add(fishMesh);

        fishData.push({
          mesh: fishMesh,
          baseAngle: centerA,
          radius: centerR,
          baseY: centerY,
          offset,
          speed: 0.2 + tRand() * 0.15,
          phase: tRand() * Math.PI * 2,
        });
      }
    }

    // === 5. THERMAL VENTS ===
    const ventGroup = new THREE.Group();
    ventGroup.position.y = -120;
    mainGroup.add(ventGroup);

    const ventPositions = [
      { x: -180, z: -60 }, { x: 170, z: 70 }, { x: -20, z: -100 }
    ];

    const ventParticleData = [];
    ventPositions.forEach((vp) => {
      // Chimney
      const chimneyPts = [
        new THREE.Vector2(8, 0), new THREE.Vector2(6, 15),
        new THREE.Vector2(5, 30), new THREE.Vector2(4, 45),
        new THREE.Vector2(3.5, 55),
      ];
      const chimneyGeo = new THREE.LatheGeometry(chimneyPts, 8);
      const chimney = new THREE.Mesh(chimneyGeo,
        new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.2 }));
      chimney.position.set(vp.x, 0, vp.z);
      ventGroup.add(chimney);

      ventGroup.add(createDot(vp.x, 55, vp.z, 2, coreDotMat));

      // Vent particles
      for (let i = 0; i < 20; i++) {
        ventParticleData.push({
          x: vp.x, z: vp.z,
          y: Math.random() * 100 + 55,
          speed: 0.3 + Math.random() * 0.5,
          drift: (Math.random() - 0.5) * 0.2,
          driftZ: (Math.random() - 0.5) * 0.2,
        });
      }
    });

    const ventParticleGeo = new THREE.BufferGeometry();
    const vpPositions = new Float32Array(ventParticleData.length * 3);
    ventParticleData.forEach((vp, i) => {
      vpPositions[i * 3] = vp.x + (Math.random() - 0.5) * 5;
      vpPositions[i * 3 + 1] = vp.y;
      vpPositions[i * 3 + 2] = vp.z + (Math.random() - 0.5) * 5;
    });
    ventParticleGeo.setAttribute("position", new THREE.BufferAttribute(vpPositions, 3));
    const ventParticles = new THREE.Points(ventParticleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 2, transparent: true, opacity: 0.5 }));
    ventGroup.add(ventParticles);

    // === 6. ABYSSAL TRENCH (below) ===
    const trenchGroup = new THREE.Group();
    trenchGroup.position.y = -200;
    mainGroup.add(trenchGroup);

    // V-shaped trench cross section
    const trenchW = 250, trenchD = 120;
    for (let z = -3; z <= 3; z++) {
      const zOff = z * 25;
      const pts = [
        new THREE.Vector3(-trenchW / 2, 0, zOff),
        new THREE.Vector3(-trenchW / 4, -trenchD * 0.6, zOff),
        new THREE.Vector3(0, -trenchD, zOff),
        new THREE.Vector3(trenchW / 4, -trenchD * 0.6, zOff),
        new THREE.Vector3(trenchW / 2, 0, zOff),
      ];
      trenchGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        z === 0 ? tealMat : tealDimMat));
    }

    // Longitudinal lines
    for (let i = 0; i < 5; i++) {
      const x = -trenchW / 2 + (i / 4) * trenchW;
      const depth = i === 2 ? -trenchD : -trenchD * 0.6 * (1 - Math.abs(i - 2) * 0.2);
      trenchGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, i === 2 ? -trenchD : depth, -75),
          new THREE.Vector3(x, i === 2 ? -trenchD : depth, 75),
        ]), tealDimMat));
    }

    // Bioluminescent dots in trench
    for (let i = 0; i < 15; i++) {
      const x = (tRand() - 0.5) * trenchW * 0.6;
      const depth = -trenchD * (0.3 + tRand() * 0.7);
      const z = (tRand() - 0.5) * 100;
      trenchGroup.add(createDot(x, depth, z, 1 + tRand(), accentDotMat));
    }

    trenchGroup.add(createDot(0, -trenchD - 10, 0, 3, coreDotMat));

    // === 7. WATER COLUMN MARKERS ===
    // Depth measurement lines (right side)
    const depthGroup = new THREE.Group();
    depthGroup.position.set(220, 0, 0);
    mainGroup.add(depthGroup);

    for (let i = 0; i < 8; i++) {
      const y = 250 - i * 60;
      const tickLen = i % 2 === 0 ? 20 : 10;
      depthGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, y, 0), new THREE.Vector3(tickLen, y, 0)
        ]), tealDimMat));
      if (i % 2 === 0) depthGroup.add(createDot(tickLen + 3, y, 0, 1.5, accentDotMat));
    }

    // Vertical line
    const vLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 260, 0), new THREE.Vector3(0, -180, 0)
      ]),
      new THREE.LineDashedMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2, dashSize: 4, gapSize: 3 })
    );
    vLine.computeLineDistances();
    depthGroup.add(vLine);

    // === 8. AMBIENT PARTICLES (ocean snow) ===
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 500;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 600 + 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 500;
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.06,
        y: -(0.03 + Math.random() * 0.08), // Sinking — marine snow
        z: (Math.random() - 0.5) * 0.06,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.2, transparent: true, opacity: 0.3 }));
    mainGroup.add(particles);

    // === ORBIT CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.05, y: 0 };
    let rotCurrent = { x: 0.05, y: 0 };
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

      if (!isDragging) rotTarget.y += 0.0006;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 60;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 20, 0);

      // Jellyfish bell pulse
      const pulse = 1 + Math.sin(time * 1.5) * 0.06;
      jellyGroup.children.forEach((child) => {
        if (child.geometry && child.geometry.type === "SphereGeometry" && child !== jellyCore) {
          child.scale.set(pulse, 1, pulse);
        }
      });
      jellyCore.rotation.y = time * 0.5;
      jellyCore.scale.setScalar(1 + Math.sin(time * 2) * 0.1);

      // Fish swim
      fishData.forEach((fd) => {
        fd.baseAngle += fd.speed * 0.003;
        const x = Math.cos(fd.baseAngle + fd.phase) * fd.radius + fd.offset.x;
        const y = fd.baseY + Math.sin(time * 2 + fd.phase) * 5 + fd.offset.y;
        const z = Math.sin(fd.baseAngle + fd.phase) * fd.radius * 0.6 + fd.offset.z;
        fd.mesh.position.set(x, y, z);
        fd.mesh.rotation.y = fd.baseAngle + fd.phase + Math.PI / 2;
      });

      // Vent particles rise
      const vpArr = ventParticles.geometry.attributes.position.array;
      ventParticleData.forEach((vp, i) => {
        vpArr[i * 3] += vp.drift;
        vpArr[i * 3 + 1] += vp.speed;
        vpArr[i * 3 + 2] += vp.driftZ;
        if (vpArr[i * 3 + 1] > 200) {
          vpArr[i * 3] = vp.x + (Math.random() - 0.5) * 5;
          vpArr[i * 3 + 1] = 55;
          vpArr[i * 3 + 2] = vp.z + (Math.random() - 0.5) * 5;
        }
      });
      ventParticles.geometry.attributes.position.needsUpdate = true;

      // Ambient particles sink (marine snow)
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x + Math.sin(time + i) * 0.02;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (pos[i * 3 + 1] < -300) {
          pos[i * 3 + 1] = 350;
          pos[i * 3] = (Math.random() - 0.5) * 500;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 500;
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000205" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Oceanus Profundus
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
