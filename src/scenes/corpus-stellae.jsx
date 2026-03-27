import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function CorpusStellae() {
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
    camera.position.set(0, 80, 500);
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

    // === HELPERS ===
    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, radius = 1.5, mat = accentDotMat) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 8), mat);
      mesh.position.set(x, y, z);
      return mesh;
    }

    function createSmallCube(x, y, z, size = 3, color = TEAL) {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
      mesh.position.set(x, y, z);
      return mesh;
    }

    function createCurve(points, mat = tealMat, segments = 50) {
      const curve = new THREE.CatmullRomCurve3(points);
      const pts = curve.getPoints(segments);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    // === 1. CROWN — SPIRAL GALAXY ===
    const crownGroup = new THREE.Group();
    crownGroup.position.y = 280;
    mainGroup.add(crownGroup);

    // Spiral arms
    for (let arm = 0; arm < 4; arm++) {
      const armOffset = (arm / 4) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const t = i / 120;
        const r = 5 + t * 90;
        const a = armOffset + t * Math.PI * 3;
        const wobble = Math.sin(t * 20) * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, wobble * t, Math.sin(a) * r));
      }
      crownGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        arm % 2 === 0 ? tealMat : tealDarkMat));
    }

    // Concentric galaxy rings
    for (let i = 1; i <= 6; i++) {
      crownGroup.add(createRing(i * 15, 0, 48, tealDimMat));
    }

    // Core nebula sphere
    const nebulaSphere = new THREE.Mesh(
      new THREE.SphereGeometry(12, 16, 16),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.3 })
    );
    crownGroup.add(nebulaSphere);

    // Inner dodecahedron
    const dodeca = new THREE.Mesh(
      new THREE.DodecahedronGeometry(7, 0),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.5 })
    );
    crownGroup.add(dodeca);

    crownGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // Star field around galaxy
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 70;
      const h = (Math.random() - 0.5) * 15;
      crownGroup.add(createDot(Math.cos(a) * r, h, Math.sin(a) * r, 0.8 + Math.random(), accentDotMat));
    }

    // === 2. SPINE — CENTRAL COLUMN ===
    const spineGroup = new THREE.Group();
    mainGroup.add(spineGroup);

    // Main spinal column (tube)
    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 260, 0),
      new THREE.Vector3(1, 220, 1),
      new THREE.Vector3(-1, 180, -1),
      new THREE.Vector3(0, 140, 0),
      new THREE.Vector3(1, 100, 1),
      new THREE.Vector3(-1, 60, -1),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, -20, 0),
    ]);
    const spineTube = new THREE.Mesh(
      new THREE.TubeGeometry(spineCurve, 60, 2, 6, false),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.2 })
    );
    spineGroup.add(spineTube);

    // Center line
    spineGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(spineCurve.getPoints(80)),
      tealBrightMat
    ));

    // Vertebrae rings
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const y = 260 - t * 280;
      const r = 6 + Math.sin(t * Math.PI) * 4;
      spineGroup.add(createRing(r, y, 12, tealDimMat));
    }

    // === 3. CHAKRA POINTS (7 energy centers) ===
    const chakraData = [
      { y: 260, name: "crown", r: 14 },
      { y: 225, name: "third_eye", r: 12 },
      { y: 195, name: "throat", r: 11 },
      { y: 155, name: "heart", r: 16 },
      { y: 115, name: "solar", r: 13 },
      { y: 75, name: "sacral", r: 11 },
      { y: 35, name: "root", r: 12 },
    ];

    const chakraMeshes = [];
    chakraData.forEach((ch, ci) => {
      const group = new THREE.Group();
      group.position.y = ch.y;
      mainGroup.add(group);

      // Outer sphere
      const outerSphere = new THREE.Mesh(
        new THREE.SphereGeometry(ch.r, 12, 12),
        new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.15 })
      );
      group.add(outerSphere);

      // Inner octahedron
      const octa = new THREE.Mesh(
        new THREE.OctahedronGeometry(ch.r * 0.45, 0),
        new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.4 })
      );
      group.add(octa);

      // Radial petals
      const pCount = 4 + ci;
      for (let p = 0; p < pCount; p++) {
        const a = (p / pCount) * Math.PI * 2;
        const r = ch.r * 1.2;
        const pts = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(a) * r * 0.6, 3, Math.sin(a) * r * 0.6),
          new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r),
        ];
        group.add(createCurve(pts, tealDimMat, 12));
        group.add(createDot(Math.cos(a) * r, 0, Math.sin(a) * r, 1, accentDotMat));
      }

      // Orbital ring
      group.add(createRing(ch.r * 1.4, 0, 32, tealDimMat));

      // Core dot
      group.add(createDot(0, 0, 0, 2, coreDotMat));

      chakraMeshes.push({ group, outerSphere, octa });
    });

    // === 4. ENERGY CHANNELS (Ida, Pingala, Sushumna) ===
    // Sushumna (center) - already the spine
    // Ida (left spiral)
    const idaPts = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const y = 260 - t * 230;
      const a = t * Math.PI * 3.5;
      const r = 25 + Math.sin(t * Math.PI) * 10;
      idaPts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    mainGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(idaPts), tealDarkMat));

    // Pingala (right spiral, opposite phase)
    const pingPts = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const y = 260 - t * 230;
      const a = t * Math.PI * 3.5 + Math.PI;
      const r = 25 + Math.sin(t * Math.PI) * 10;
      pingPts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    mainGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pingPts),
      new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.4 })
    ));

    // === 5. RIBCAGE / THORAX (around heart chakra) ===
    const ribGroup = new THREE.Group();
    ribGroup.position.y = 155;
    mainGroup.add(ribGroup);

    for (let i = 0; i < 12; i++) {
      const t = (i - 5.5) / 6;
      const ry = t * 50;
      const ribWidth = (1 - Math.abs(t) * 0.6) * 70;
      const ribDepth = (1 - Math.abs(t) * 0.5) * 40;

      const ribPts = [];
      for (let j = 0; j <= 32; j++) {
        const a = (j / 32) * Math.PI;
        ribPts.push(new THREE.Vector3(
          Math.sin(a) * ribWidth,
          ry,
          -Math.cos(a) * ribDepth + ribDepth * 0.3
        ));
      }
      ribGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ribPts),
        i % 3 === 0 ? tealMat : tealDimMat));
    }

    // Sternum
    ribGroup.add(createCurve([
      new THREE.Vector3(0, -50, ribGroup.position.y > 0 ? 30 : 25),
      new THREE.Vector3(0, -20, 32),
      new THREE.Vector3(0, 10, 30),
      new THREE.Vector3(0, 40, 25),
    ].map(p => new THREE.Vector3(p.x, p.y, p.z - 155 + 30)), tealDarkMat, 20));

    // === 6. VITRUVIAN ARMS ===
    const armGroup = new THREE.Group();
    armGroup.position.y = 180;
    mainGroup.add(armGroup);

    function createArm(side) {
      const s = side;
      // Shoulder → elbow → wrist → fingers
      const armCurve = [
        new THREE.Vector3(s * 15, 0, 0),
        new THREE.Vector3(s * 50, -10, 10),
        new THREE.Vector3(s * 90, -30, 5),
        new THREE.Vector3(s * 120, -15, 0),
      ];
      armGroup.add(createCurve(armCurve, tealMat, 30));

      // Arm tube
      const curve = new THREE.CatmullRomCurve3(armCurve);
      armGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, 1.5, 5, false),
        new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.12 })
      ));

      // Joint dots
      armCurve.forEach(p => armGroup.add(createDot(p.x, p.y, p.z, 2, accentDotMat)));

      // Fingers
      for (let f = 0; f < 5; f++) {
        const spread = (f - 2) * 0.25;
        const fLen = 15 + (f === 2 ? 5 : 0);
        const base = armCurve[3];
        const fingerEnd = new THREE.Vector3(
          base.x + s * Math.cos(spread) * fLen,
          base.y + Math.sin(spread) * fLen * 0.5 - 5,
          base.z + Math.sin(spread + s) * 5
        );
        const pts = [base, fingerEnd];
        armGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDimMat));
        armGroup.add(createDot(fingerEnd.x, fingerEnd.y, fingerEnd.z, 0.8, accentDotMat));
      }

      // Palm circle
      const palmCenter = armCurve[3];
      armGroup.add(createRing(8, 0, 16, tealDimMat).translateX(palmCenter.x).translateY(palmCenter.y).translateZ(palmCenter.z));

      // Meridian energy lines along arm
      for (let m = 0; m < 3; m++) {
        const offset = (m - 1) * 3;
        const mPts = armCurve.map(p => new THREE.Vector3(p.x, p.y + offset, p.z + offset));
        armGroup.add(createCurve(mPts,
          new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2 }), 20));
      }
    }

    createArm(1);
    createArm(-1);

    // Raised arms (vitruvian)
    function createRaisedArm(side) {
      const s = side;
      const armCurve = [
        new THREE.Vector3(s * 15, 0, 0),
        new THREE.Vector3(s * 45, 25, -10),
        new THREE.Vector3(s * 80, 50, -5),
        new THREE.Vector3(s * 110, 65, 0),
      ];
      armGroup.add(createCurve(armCurve, tealDimMat, 25));
      armCurve.forEach(p => armGroup.add(createDot(p.x, p.y, p.z, 1.2, accentDotMat)));
    }

    createRaisedArm(1);
    createRaisedArm(-1);

    // === 7. LEGS ===
    const legGroup = new THREE.Group();
    legGroup.position.y = 20;
    mainGroup.add(legGroup);

    function createLeg(side) {
      const s = side;
      const legCurve = [
        new THREE.Vector3(s * 12, 0, 0),
        new THREE.Vector3(s * 18, -60, 5),
        new THREE.Vector3(s * 15, -120, 3),
        new THREE.Vector3(s * 15, -170, 0),
        new THREE.Vector3(s * 20, -180, 8),
      ];
      legGroup.add(createCurve(legCurve, tealMat, 30));

      const curve = new THREE.CatmullRomCurve3(legCurve);
      legGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(curve, 25, 2, 5, false),
        new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.12 })
      ));

      // Joints
      [0, 2, 3].forEach(idx => {
        const p = legCurve[idx];
        legGroup.add(createDot(p.x, p.y, p.z, 2.5, accentDotMat));
      });

      // Knee detail
      legGroup.add(createRing(6, -120, 12, tealDimMat).translateX(s * 15).translateZ(3));
    }

    createLeg(1);
    createLeg(-1);

    // Spread legs (vitruvian)
    function createSpreadLeg(side) {
      const s = side;
      const legCurve = [
        new THREE.Vector3(s * 12, 0, 0),
        new THREE.Vector3(s * 50, -55, -5),
        new THREE.Vector3(s * 75, -115, -3),
        new THREE.Vector3(s * 85, -165, 0),
      ];
      legGroup.add(createCurve(legCurve, tealDimMat, 25));
    }

    createSpreadLeg(1);
    createSpreadLeg(-1);

    // === 8. ENCLOSING CIRCLE (Vitruvian) ===
    const vitruvianGroup = new THREE.Group();
    vitruvianGroup.position.y = 130;
    mainGroup.add(vitruvianGroup);

    // Great circle
    const greatCircle = new THREE.Mesh(
      new THREE.TorusGeometry(200, 0.8, 4, 80),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.18 })
    );
    greatCircle.rotation.x = Math.PI / 2;
    vitruvianGroup.add(greatCircle);

    // Second tilted circle
    const tiltedCircle = new THREE.Mesh(
      new THREE.TorusGeometry(200, 0.5, 4, 64),
      new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.1 })
    );
    tiltedCircle.rotation.x = Math.PI / 2;
    tiltedCircle.rotation.z = 0.15;
    vitruvianGroup.add(tiltedCircle);

    // Cardinal points on circle
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      vitruvianGroup.add(createSmallCube(Math.cos(a) * 200, 0, Math.sin(a) * 200, 4, TEAL));
    }

    // Enclosing square
    const sq = 175;
    const squareCorners = [
      [-sq, -sq - 20], [sq, -sq - 20], [sq, sq - 20], [-sq, sq - 20]
    ];
    for (let i = 0; i < 4; i++) {
      const c1 = squareCorners[i];
      const c2 = squareCorners[(i + 1) % 4];
      vitruvianGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(c1[0], c1[1], 0),
          new THREE.Vector3(c2[0], c2[1], 0)
        ]), tealDarkMat));
    }
    squareCorners.forEach(c => vitruvianGroup.add(createSmallCube(c[0], c[1], 0, 5, TEAL_DIM)));

    // === 9. CONSTELLATION SPHERE ===
    const constellationGroup = new THREE.Group();
    constellationGroup.position.y = 130;
    mainGroup.add(constellationGroup);

    // Outer celestial sphere
    const celestialSphere = new THREE.Mesh(
      new THREE.SphereGeometry(250, 20, 20),
      new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.06 })
    );
    constellationGroup.add(celestialSphere);

    // Constellation lines
    let cseed = 77;
    function cRand() { cseed = (cseed * 16807) % 2147483647; return (cseed - 1) / 2147483646; }

    for (let c = 0; c < 12; c++) {
      const baseA = (c / 12) * Math.PI * 2;
      const baseEl = (cRand() - 0.5) * Math.PI * 0.8;
      const starCount = 3 + Math.floor(cRand() * 4);
      let prevStar = null;

      for (let s = 0; s < starCount; s++) {
        const a = baseA + (cRand() - 0.5) * 0.5;
        const el = baseEl + (cRand() - 0.5) * 0.4;
        const r = 245 + (cRand() - 0.5) * 10;
        const star = new THREE.Vector3(
          Math.cos(a) * Math.cos(el) * r,
          Math.sin(el) * r,
          Math.sin(a) * Math.cos(el) * r
        );

        constellationGroup.add(createDot(star.x, star.y, star.z, 1.5 + cRand(), accentDotMat));

        if (prevStar) {
          constellationGroup.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([prevStar, star]),
            new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2 })
          ));
        }
        prevStar = star;
      }
    }

    // Zodiac band
    const zodiacPts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      zodiacPts.push(new THREE.Vector3(Math.cos(a) * 230, Math.sin(a * 0.5) * 20, Math.sin(a) * 230));
    }
    constellationGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(zodiacPts),
      new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.15 })
    ));

    // === 10. HEAD / SKULL ===
    const headGroup = new THREE.Group();
    headGroup.position.y = 240;
    mainGroup.add(headGroup);

    // Skull wireframe (sphere + jaw)
    const skullSphere = new THREE.Mesh(
      new THREE.SphereGeometry(22, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.75),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.18 })
    );
    headGroup.add(skullSphere);

    // Third eye detail
    headGroup.add(createDot(0, 0, 22, 2, coreDotMat));

    // Eye sockets
    [-8, 8].forEach(x => {
      headGroup.add(createRing(4, 0, 12, tealDimMat)
        .translateX(x).translateZ(18).rotateX(Math.PI / 2));
      headGroup.add(createDot(x, 0, 20, 1.5, accentDotMat));
    });

    // === 11. PELVIS / ROOT STRUCTURE ===
    const pelvisGroup = new THREE.Group();
    pelvisGroup.position.y = 25;
    mainGroup.add(pelvisGroup);

    // Bowl shape
    const pelvisBowl = new THREE.Mesh(
      new THREE.SphereGeometry(30, 12, 8, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.4),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.15 })
    );
    pelvisGroup.add(pelvisBowl);

    // Hip joints
    [-22, 22].forEach(x => {
      pelvisGroup.add(createDot(x, -8, 0, 3, accentDotMat));
      pelvisGroup.add(createRing(5, -8, 12, tealDimMat).translateX(x));
    });

    // === 12. AURA LAYERS ===
    for (let i = 0; i < 4; i++) {
      const auraR = 160 + i * 30;
      const auraH = 250 + i * 20;
      const pts = [];
      for (let j = 0; j <= 64; j++) {
        const a = (j / 64) * Math.PI * 2;
        const y = 130 + Math.sin(a * 2 + i) * 10;
        pts.push(new THREE.Vector3(Math.cos(a) * auraR, y, Math.sin(a) * auraR));
      }
      mainGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.12 - i * 0.02 })
      ));
    }

    // === 13. AMBIENT PARTICLES ===
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 500;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 600 + 100;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 500;
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.12 + 0.06,
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
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 80;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 80, 0);

      // Crown galaxy rotation
      nebulaSphere.rotation.y = time * 0.3;
      dodeca.rotation.x = time * 0.5;
      dodeca.rotation.y = time * 0.7;

      // Chakra animations
      const breath = Math.sin(time * 2);
      chakraMeshes.forEach((ch, i) => {
        ch.octa.rotation.x = time * (0.3 + i * 0.08);
        ch.octa.rotation.y = time * (0.2 + i * 0.1);
        const scale = 1 + breath * 0.08;
        ch.outerSphere.scale.setScalar(scale);
      });

      // Constellation rotation
      celestialSphere.rotation.y = time * 0.05;

      // Particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (pos[i * 3 + 1] > 450) {
          pos[i * 3 + 1] = -150;
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Corpus Stellae
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
