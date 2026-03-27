import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function TemplumSonorum() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020005);
    scene.fog = new THREE.FogExp2(0x020005, 0.00025);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 180, 450);
    camera.lookAt(0, 50, 0);

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

    let seed = 555;
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

    // === 1. CENTRAL SINGING BOWL ===
    const bowlGroup = new THREE.Group();
    mainGroup.add(bowlGroup);

    // Bowl shape (half torus)
    const bowlMesh = new THREE.Mesh(
      new THREE.SphereGeometry(50, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.2 })
    );
    bowlMesh.rotation.x = Math.PI;
    bowlMesh.position.y = 30;
    bowlGroup.add(bowlMesh);

    // Bowl rim
    bowlGroup.add(createRing(50, 30, 48, tealBrightMat));

    // Inner rings (vibration visualization)
    const bowlRings = [];
    for (let i = 1; i <= 5; i++) {
      const ring = createRing(50 - i * 8, 30, 32, i === 1 ? tealMat : tealDimMat);
      bowlGroup.add(ring);
      bowlRings.push({ mesh: ring, baseY: 30, phase: i * 0.5 });
    }

    bowlGroup.add(createDot(0, 5, 0, 4, coreDotMat));

    // === 2. CHLADNI PLATE PATTERNS ===
    const chladniGroup = new THREE.Group();
    chladniGroup.position.y = 0;
    mainGroup.add(chladniGroup);

    // Square plate outline
    const plateSize = 120;
    chladniGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-plateSize, 0, -plateSize),
        new THREE.Vector3(plateSize, 0, -plateSize),
        new THREE.Vector3(plateSize, 0, plateSize),
        new THREE.Vector3(-plateSize, 0, plateSize),
        new THREE.Vector3(-plateSize, 0, -plateSize),
      ]), tealMat));

    // Chladni nodal lines (mode 3,2)
    const chladniLines = [];
    const resolution = 50;
    for (let mode = 1; mode <= 3; mode++) {
      const pts = [];
      for (let i = 0; i <= resolution; i++) {
        const x = (i / resolution - 0.5) * plateSize * 2;
        // Nodal lines where vibration = 0
        const z = Math.sin(mode * Math.PI * i / resolution) * plateSize * 0.8;
        pts.push(new THREE.Vector3(x, 1, z));
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.4 })
      );
      chladniGroup.add(line);
      chladniLines.push({ mesh: line, mode });
    }

    // Cross pattern nodal lines
    for (let i = 1; i <= 4; i++) {
      const t = (i / 5 - 0.5) * plateSize * 2;
      chladniGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(t, 1, -plateSize),
          new THREE.Vector3(t, 1, plateSize)
        ]), tealDimMat));
      chladniGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-plateSize, 1, t),
          new THREE.Vector3(plateSize, 1, t)
        ]), tealDimMat));
    }

    // === 3. CIRCLE OF FIFTHS ===
    const circleOfFifthsGroup = new THREE.Group();
    circleOfFifthsGroup.position.set(0, 150, 0);
    mainGroup.add(circleOfFifthsGroup);

    const fifthsRadius = 80;
    circleOfFifthsGroup.add(createRing(fifthsRadius, 0, 48, tealMat));
    circleOfFifthsGroup.add(createRing(fifthsRadius * 0.7, 0, 36, tealDarkMat));

    // 12 notes
    const notes = ["C", "G", "D", "A", "E", "B", "F♯", "C♯", "G♯", "D♯", "A♯", "F"];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * fifthsRadius;
      const z = Math.sin(a) * fifthsRadius;

      // Note marker
      circleOfFifthsGroup.add(createDot(x, 0, z, 3, i % 3 === 0 ? coreDotMat : accentDotMat));

      // Radial line
      circleOfFifthsGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, 0, z)
        ]), tealDimMat));

      // Connect to relative minor (inner circle)
      const innerX = Math.cos(a) * fifthsRadius * 0.7;
      const innerZ = Math.sin(a) * fifthsRadius * 0.7;
      circleOfFifthsGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, z),
          new THREE.Vector3(innerX, 0, innerZ)
        ]), tealDimMat));
      circleOfFifthsGroup.add(createDot(innerX, 0, innerZ, 2, accentDotMat));
    }

    circleOfFifthsGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // === 4. HARMONIC OVERTONE COLUMNS ===
    const overtoneGroup = new THREE.Group();
    overtoneGroup.position.set(-150, 0, -50);
    mainGroup.add(overtoneGroup);

    // Fundamental and harmonics
    const harmonics = [1, 2, 3, 4, 5, 6, 7, 8];
    harmonics.forEach((h, i) => {
      const baseHeight = 120 / h;
      const x = i * 20 - 70;

      // Column
      overtoneGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, 0),
          new THREE.Vector3(x, baseHeight, 0)
        ]), h === 1 ? tealBrightMat : (h <= 4 ? tealMat : tealDimMat)));

      // Wave visualization on column
      const wavePts = [];
      for (let w = 0; w <= 30; w++) {
        const t = w / 30;
        const y = t * baseHeight;
        const wave = Math.sin(t * Math.PI * h) * 8;
        wavePts.push(new THREE.Vector3(x + wave, y, 0));
      }
      overtoneGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(wavePts),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.3 })
      ));

      // Node points
      for (let n = 0; n <= h; n++) {
        const nodeY = (n / h) * baseHeight;
        overtoneGroup.add(createDot(x, nodeY, 0, 1.5, accentDotMat));
      }
    });

    // === 5. TUNING FORKS ===
    const forkGroup = new THREE.Group();
    forkGroup.position.set(150, 0, -50);
    mainGroup.add(forkGroup);

    for (let f = 0; f < 3; f++) {
      const forkX = f * 40 - 40;
      const forkHeight = 80 - f * 15;

      // Fork prongs
      forkGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(forkX - 5, 0, 0),
          new THREE.Vector3(forkX - 5, forkHeight, 0)
        ]), tealMat));
      forkGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(forkX + 5, 0, 0),
          new THREE.Vector3(forkX + 5, forkHeight, 0)
        ]), tealMat));

      // Fork base
      forkGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(forkX - 5, 0, 0),
          new THREE.Vector3(forkX, -20, 0),
          new THREE.Vector3(forkX + 5, 0, 0)
        ]), tealDarkMat));

      // Top connection
      forkGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(forkX - 5, forkHeight, 0),
          new THREE.Vector3(forkX, forkHeight + 5, 0),
          new THREE.Vector3(forkX + 5, forkHeight, 0)
        ]), tealDimMat));

      forkGroup.add(createDot(forkX, forkHeight + 5, 0, 2, coreDotMat));
    }

    // === 6. STANDING WAVE PATTERNS ===
    const standingWaveGroup = new THREE.Group();
    standingWaveGroup.position.set(0, 80, 100);
    mainGroup.add(standingWaveGroup);

    const waveLength = 150;
    const waves = [];
    for (let mode = 1; mode <= 4; mode++) {
      const y = mode * 25 - 50;
      const wavePts = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const x = (t - 0.5) * waveLength;
        wavePts.push(new THREE.Vector3(x, y, 0));
      }
      const waveLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(wavePts),
        new THREE.LineBasicMaterial({ color: mode === 1 ? TEAL_BRIGHT : TEAL, transparent: true, opacity: 0.5 })
      );
      standingWaveGroup.add(waveLine);
      waves.push({ line: waveLine, mode, pts: wavePts, baseY: y });

      // End nodes
      standingWaveGroup.add(createDot(-waveLength / 2, y, 0, 2, accentDotMat));
      standingWaveGroup.add(createDot(waveLength / 2, y, 0, 2, accentDotMat));

      // Boundary lines
      standingWaveGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-waveLength / 2, y - 15, 0),
          new THREE.Vector3(-waveLength / 2, y + 15, 0)
        ]), tealDimMat));
      standingWaveGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(waveLength / 2, y - 15, 0),
          new THREE.Vector3(waveLength / 2, y + 15, 0)
        ]), tealDimMat));
    }

    // === 7. RESONANT FREQUENCY RINGS ===
    const resonanceGroup = new THREE.Group();
    resonanceGroup.position.y = 30;
    mainGroup.add(resonanceGroup);

    const resonanceRings = [];
    for (let i = 1; i <= 6; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(50 + i * 25, 0.8, 4, 48),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? TEAL : TEAL_DARK, wireframe: true, transparent: true, opacity: 0.15 })
      );
      ring.rotation.x = Math.PI / 2;
      resonanceGroup.add(ring);
      resonanceRings.push({ mesh: ring, baseRadius: 50 + i * 25, phase: i * 0.4 });
    }

    // === 8. SOUND PARTICLES ===
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = 50 + rand() * 150;
      particlePositions[i * 3] = Math.cos(a) * r;
      particlePositions[i * 3 + 1] = rand() * 200;
      particlePositions[i * 3 + 2] = Math.sin(a) * r;
      particleVelocities.push({
        angle: a,
        radius: r,
        speed: 0.01 + rand() * 0.02,
        ySpeed: (rand() - 0.5) * 0.3,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.5, transparent: true, opacity: 0.4 }));
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
      time += 0.008;

      if (!isDragging) rotTarget.y += 0.0004;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 180;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 50, 0);

      // Bowl vibration
      bowlRings.forEach(r => {
        const vibration = Math.sin(time * 3 + r.phase) * 2;
        r.mesh.position.y = r.baseY + vibration;
      });

      // Circle of fifths rotation
      circleOfFifthsGroup.rotation.y = time * 0.05;

      // Standing wave animation
      waves.forEach(w => {
        const positions = w.line.geometry.attributes.position.array;
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          const amplitude = Math.sin(t * Math.PI * w.mode) * 15 * Math.sin(time * 2);
          positions[i * 3 + 1] = w.baseY + amplitude;
        }
        w.line.geometry.attributes.position.needsUpdate = true;
      });

      // Resonance rings pulse
      resonanceRings.forEach(r => {
        const scale = 1 + Math.sin(time * 2 + r.phase) * 0.05;
        r.mesh.scale.setScalar(scale);
        r.mesh.material.opacity = 0.15 + Math.sin(time * 2 + r.phase) * 0.05;
      });

      // Sound particles orbit
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        particleVelocities[i].angle += particleVelocities[i].speed;
        pos[i * 3] = Math.cos(particleVelocities[i].angle) * particleVelocities[i].radius;
        pos[i * 3 + 1] += particleVelocities[i].ySpeed;
        pos[i * 3 + 2] = Math.sin(particleVelocities[i].angle) * particleVelocities[i].radius;

        if (pos[i * 3 + 1] > 220 || pos[i * 3 + 1] < -20) {
          particleVelocities[i].ySpeed *= -1;
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#020005" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Templum Sonorum
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
