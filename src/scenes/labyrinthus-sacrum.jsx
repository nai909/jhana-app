import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function LabyrinthisSacrum() {
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
    camera.position.set(0, 300, 400);
    camera.lookAt(0, 0, 0);

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

    let seed = 333;
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

    // === 1. LABYRINTH PATH ===
    const labyrinthGroup = new THREE.Group();
    mainGroup.add(labyrinthGroup);

    const circuits = 11;
    const maxRadius = 180;
    const pathWidth = maxRadius / (circuits + 1);

    for (let c = 1; c <= circuits; c++) {
      const r = c * pathWidth;
      const openings = [];
      const baseOpenings = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
      baseOpenings.forEach(o => {
        if (rand() > 0.3) openings.push(o + (rand() - 0.5) * 0.3);
      });

      const segments = 64;
      let drawing = true;
      const pts = [];

      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        let nearOpening = false;
        openings.forEach(o => {
          if (Math.abs(a - o) < 0.15 || Math.abs(a - o + Math.PI * 2) < 0.15) nearOpening = true;
        });

        if (nearOpening && drawing && pts.length > 1) {
          labyrinthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), c % 2 === 0 ? tealMat : tealDarkMat));
          pts.length = 0;
          drawing = false;
        } else if (!nearOpening && !drawing) {
          drawing = true;
        }
        if (drawing) pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      if (pts.length > 1) labyrinthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), c % 2 === 0 ? tealMat : tealDarkMat));
    }

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const startR = pathWidth * (1 + Math.floor(rand() * 3));
      const endR = pathWidth * (circuits - Math.floor(rand() * 3));
      labyrinthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * startR, 0, Math.sin(a) * startR),
        new THREE.Vector3(Math.cos(a) * endR, 0, Math.sin(a) * endR)
      ]), tealDimMat));
    }

    // === 2. ROSE WINDOW CENTER ===
    const roseGroup = new THREE.Group();
    roseGroup.position.y = 1;
    mainGroup.add(roseGroup);

    const roseRadius = pathWidth * 1.5;
    roseGroup.add(createRing(roseRadius, 0, 48, tealBrightMat));

    const petals = 12;
    for (let p = 0; p < petals; p++) {
      const a = (p / petals) * Math.PI * 2;
      const nextA = ((p + 1) / petals) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const petalA = a + t * (nextA - a);
        const petalR = roseRadius * 0.3 + Math.sin(t * Math.PI) * roseRadius * 0.5;
        pts.push(new THREE.Vector3(Math.cos(petalA) * petalR, 0, Math.sin(petalA) * petalR));
      }
      roseGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealMat));
      roseGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(a) * roseRadius, 0, Math.sin(a) * roseRadius)
      ]), tealDimMat));
    }

    for (let i = 1; i <= 3; i++) roseGroup.add(createRing(roseRadius * i / 4, 0, 24, tealDimMat));
    roseGroup.add(createDot(0, 0, 0, 4, coreDotMat));

    // === 3. PILLAR MARKERS ===
    const pillarGroup = new THREE.Group();
    mainGroup.add(pillarGroup);

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = maxRadius + 20;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 60, 6),
        new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.2 }));
      pillar.position.set(Math.cos(a) * r, 30, Math.sin(a) * r);
      pillarGroup.add(pillar);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(6, 10, 6),
        new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.3 }));
      cap.position.set(Math.cos(a) * r, 65, Math.sin(a) * r);
      pillarGroup.add(cap);
      pillarGroup.add(createDot(Math.cos(a) * r, 70, Math.sin(a) * r, 2, coreDotMat));
    }

    // === 4. ASCENDING SPIRAL STAIRS ===
    const stairsGroup = new THREE.Group();
    mainGroup.add(stairsGroup);

    const stairSteps = 36;
    const stairRadius = 25;
    const stairHeight = 150;

    for (let s = 0; s < stairSteps; s++) {
      const t = s / stairSteps;
      const a = t * Math.PI * 4;
      const y = t * stairHeight;
      const r = stairRadius - t * 5;
      const stepPts = [];
      for (let i = 0; i <= 8; i++) {
        const sa = a + (i / 8) * (Math.PI / 6);
        stepPts.push(new THREE.Vector3(Math.cos(sa) * r, y, Math.sin(sa) * r));
      }
      stairsGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(stepPts), s % 3 === 0 ? tealMat : tealDimMat));
    }

    stairsGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, stairHeight + 20, 0)
    ]), tealBrightMat));
    stairsGroup.add(createDot(0, stairHeight + 25, 0, 4, coreDotMat));

    // === 5. MANDALA CEILING ===
    const ceilingGroup = new THREE.Group();
    ceilingGroup.position.y = 200;
    mainGroup.add(ceilingGroup);

    for (let i = 1; i <= 8; i++) ceilingGroup.add(createRing(i * 25, 0, 48, i % 2 === 0 ? tealMat : tealDimMat));

    for (let p = 0; p < 16; p++) {
      const a = (p / 16) * Math.PI * 2;
      ceilingGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(a) * 200, 0, Math.sin(a) * 200)
      ]), tealDimMat));
    }

    const oculusMesh = new THREE.Mesh(new THREE.TorusGeometry(15, 2, 6, 24),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.3 }));
    oculusMesh.rotation.x = Math.PI / 2;
    ceilingGroup.add(oculusMesh);
    ceilingGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // === 6. FLOOR PATTERN ===
    const floorGroup = new THREE.Group();
    floorGroup.position.y = -1;
    mainGroup.add(floorGroup);

    const hexSize = 20;
    const hexH = hexSize * Math.sqrt(3);
    for (let row = -8; row <= 8; row++) {
      for (let col = -8; col <= 8; col++) {
        const x = col * hexSize * 1.5;
        const z = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
        const dist = Math.sqrt(x * x + z * z);
        if (dist > maxRadius - 10 || dist < roseRadius + 5) continue;
        const pts = [];
        for (let i = 0; i <= 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          pts.push(new THREE.Vector3(x + Math.cos(a) * hexSize * 0.4, 0, z + Math.sin(a) * hexSize * 0.4));
        }
        floorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDimMat));
      }
    }

    // === 7. PARTICLES ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * maxRadius;
      particlePositions[i * 3] = Math.cos(a) * r;
      particlePositions[i * 3 + 1] = rand() * 200;
      particlePositions[i * 3 + 2] = Math.sin(a) * r;
      particleVelocities.push({ y: 0.1 + rand() * 0.2 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.5, transparent: true, opacity: 0.4 }));
    mainGroup.add(particles);

    // === CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.5, y: 0 };
    let rotCurrent = { x: 0.5, y: 0 };
    let zoomTarget = 500;
    let zoomCurrent = 500;

    const el = renderer.domElement;
    el.addEventListener("mousedown", (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    el.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      rotTarget.y += (e.clientX - prevMouse.x) * 0.005;
      rotTarget.x += (e.clientY - prevMouse.y) * 0.005;
      rotTarget.x = Math.max(0.1, Math.min(1.4, rotTarget.x));
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
        rotTarget.x = Math.max(0.1, Math.min(1.4, rotTarget.x));
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

      if (!isDragging) rotTarget.y += 0.0005;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 50, 0);

      const pulse = 1 + Math.sin(time * 2) * 0.05;
      roseGroup.scale.setScalar(pulse);
      ceilingGroup.rotation.y = time * 0.02;
      oculusMesh.rotation.z = time * 0.5;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += particleVelocities[i].y;
        if (pos[i * 3 + 1] > 200) {
          pos[i * 3 + 1] = 0;
          const a = rand() * Math.PI * 2;
          const r = rand() * maxRadius;
          pos[i * 3] = Math.cos(a) * r;
          pos[i * 3 + 2] = Math.sin(a) * r;
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
        Labyrinthus Sacrum
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
