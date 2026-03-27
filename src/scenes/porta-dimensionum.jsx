import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function PortaDimensionum() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000002);
    scene.fog = new THREE.FogExp2(0x000002, 0.0002);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 100, 500);
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

    let seed = 666;
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

    // === 1. CENTRAL TOROIDAL GATEWAY ===
    const gatewayGroup = new THREE.Group();
    gatewayGroup.position.y = 80;
    mainGroup.add(gatewayGroup);

    const torusMesh = new THREE.Mesh(
      new THREE.TorusGeometry(80, 25, 16, 48),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.2 })
    );
    gatewayGroup.add(torusMesh);

    const innerTorus = new THREE.Mesh(
      new THREE.TorusGeometry(80, 15, 12, 36),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.15 })
    );
    gatewayGroup.add(innerTorus);

    const horizonMesh = new THREE.Mesh(
      new THREE.CircleGeometry(55, 32),
      new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
    );
    gatewayGroup.add(horizonMesh);

    for (let i = 1; i <= 5; i++) {
      gatewayGroup.add(createRing(i * 10, 0, 32, i === 5 ? tealBrightMat : tealDimMat));
    }
    gatewayGroup.add(createDot(0, 0, 0, 5, coreDotMat));

    // === 2. TESSERACT ===
    const tesseractGroup = new THREE.Group();
    tesseractGroup.position.y = 80;
    mainGroup.add(tesseractGroup);

    const tesseractSize = 40;
    const tesseractVertices = [];
    for (let w = -1; w <= 1; w += 2) {
      for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
          for (let z = -1; z <= 1; z += 2) {
            const projFactor = 1 / (2 - w * 0.3);
            tesseractVertices.push(new THREE.Vector3(
              x * tesseractSize * projFactor,
              y * tesseractSize * projFactor,
              z * tesseractSize * projFactor
            ));
          }
        }
      }
    }

    const drawnEdges = new Set();
    tesseractVertices.forEach((v1, i) => {
      tesseractVertices.forEach((v2, j) => {
        if (i >= j) return;
        const dist = v1.distanceTo(v2);
        const edgeKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (dist < tesseractSize * 1.5 && !drawnEdges.has(edgeKey)) {
          drawnEdges.add(edgeKey);
          tesseractGroup.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([v1, v2]),
            dist < tesseractSize * 0.9 ? tealMat : tealDimMat
          ));
        }
      });
      tesseractGroup.add(createDot(v1.x, v1.y, v1.z, 1.5, accentDotMat));
    });

    // === 3. WORMHOLE TUNNEL ===
    const wormholeGroup = new THREE.Group();
    wormholeGroup.position.y = 80;
    mainGroup.add(wormholeGroup);

    const tunnelRings = [];
    for (let i = 0; i < 20; i++) {
      const z = -i * 15;
      const radius = 50 + Math.abs(z) * 0.3;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 1, 4, 32),
        new THREE.MeshBasicMaterial({
          color: i < 5 ? TEAL_BRIGHT : (i < 12 ? TEAL : TEAL_DIM),
          wireframe: true, transparent: true, opacity: 0.3 - i * 0.012
        })
      );
      ring.position.z = z;
      wormholeGroup.add(ring);
      tunnelRings.push({ mesh: ring, baseZ: z, baseRadius: radius });
    }

    for (let s = 0; s < 6; s++) {
      const spiralPts = [];
      const startAngle = (s / 6) * Math.PI * 2;
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        const z = -t * 300;
        const a = startAngle + t * Math.PI * 4;
        const r = 50 + Math.abs(z) * 0.3;
        spiralPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z));
      }
      wormholeGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(spiralPts),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.15 })
      ));
    }

    // === 4. SPACETIME GRID ===
    const gridGroup = new THREE.Group();
    gridGroup.position.y = -50;
    mainGroup.add(gridGroup);

    const gridSize = 250;
    const gridDiv = 20;

    for (let i = 0; i <= gridDiv; i++) {
      const t = (i / gridDiv - 0.5) * gridSize * 2;
      const xPts = [];
      for (let j = 0; j <= gridDiv; j++) {
        const x = (j / gridDiv - 0.5) * gridSize * 2;
        const dist = Math.sqrt(x * x + t * t);
        const warp = dist < 100 ? Math.pow(1 - dist / 100, 2) * -40 : 0;
        xPts.push(new THREE.Vector3(x, warp, t));
      }
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(xPts), tealDimMat));

      const zPts = [];
      for (let j = 0; j <= gridDiv; j++) {
        const z = (j / gridDiv - 0.5) * gridSize * 2;
        const dist = Math.sqrt(t * t + z * z);
        const warp = dist < 100 ? Math.pow(1 - dist / 100, 2) * -40 : 0;
        zPts.push(new THREE.Vector3(t, warp, z));
      }
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(zPts), tealDimMat));
    }

    // === 5. ENERGY VORTEX ===
    const vortexGroup = new THREE.Group();
    vortexGroup.position.y = 80;
    mainGroup.add(vortexGroup);

    for (let s = 0; s < 12; s++) {
      const startAngle = (s / 12) * Math.PI * 2;
      const streamPts = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const a = startAngle + t * Math.PI * 2;
        const r = 120 - t * 70;
        const y = (t - 0.5) * 60;
        streamPts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      vortexGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(streamPts),
        new THREE.LineBasicMaterial({ color: s % 2 === 0 ? TEAL : TEAL_DARK, transparent: true, opacity: 0.4 })
      ));
    }

    // === 6. DIMENSIONAL AXES ===
    const coordGroup = new THREE.Group();
    coordGroup.position.y = 80;
    mainGroup.add(coordGroup);

    const axisLength = 150;
    [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)].forEach((dir, idx) => {
      const end = dir.clone().multiplyScalar(axisLength);
      const negEnd = dir.clone().multiplyScalar(-axisLength);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([negEnd, end]),
        new THREE.LineDashedMaterial({ color: [TEAL, TEAL_BRIGHT, TEAL_DARK][idx], transparent: true, opacity: 0.2, dashSize: 5, gapSize: 3 })
      );
      line.computeLineDistances();
      coordGroup.add(line);

      for (let t = -4; t <= 4; t++) {
        if (t === 0) continue;
        const tickPos = dir.clone().multiplyScalar(t * 30);
        coordGroup.add(createDot(tickPos.x, tickPos.y, tickPos.z, 1, accentDotMat));
      }
    });

    // === 7. GLYPHS ===
    const glyphGroup = new THREE.Group();
    glyphGroup.position.y = 80;
    mainGroup.add(glyphGroup);

    for (let g = 0; g < 8; g++) {
      const a = (g / 8) * Math.PI * 2;
      const gx = Math.cos(a) * 130;
      const gz = Math.sin(a) * 130;

      const glyphMesh = new THREE.Group();
      glyphMesh.position.set(gx, 0, gz);
      glyphMesh.lookAt(0, 0, 0);

      if (g % 4 === 0) {
        glyphMesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 10, 0), new THREE.Vector3(-8, -6, 0),
          new THREE.Vector3(8, -6, 0), new THREE.Vector3(0, 10, 0)
        ]), tealMat));
      } else if (g % 4 === 1) {
        const circlePts = [];
        for (let i = 0; i <= 24; i++) circlePts.push(new THREE.Vector3(Math.cos((i / 24) * Math.PI * 2) * 8, Math.sin((i / 24) * Math.PI * 2) * 8, 0));
        glyphMesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(circlePts), tealMat));
        glyphMesh.add(createDot(0, 0, 0, 2, accentDotMat));
      } else if (g % 4 === 2) {
        glyphMesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -10, 0), new THREE.Vector3(0, 10, 0)]), tealMat));
        glyphMesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)]), tealMat));
      } else {
        glyphMesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 10, 0), new THREE.Vector3(8, 0, 0),
          new THREE.Vector3(0, -10, 0), new THREE.Vector3(-8, 0, 0), new THREE.Vector3(0, 10, 0)
        ]), tealMat));
      }
      glyphGroup.add(glyphMesh);
    }

    // === 8. PARTICLES ===
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleData = [];

    for (let i = 0; i < particleCount; i++) {
      const type = rand() > 0.5 ? 'orbit' : 'stream';
      if (type === 'orbit') {
        const a = rand() * Math.PI * 2;
        const r = 60 + rand() * 60;
        particlePositions[i * 3] = Math.cos(a) * r;
        particlePositions[i * 3 + 1] = 80 + (rand() - 0.5) * 40;
        particlePositions[i * 3 + 2] = Math.sin(a) * r;
        particleData.push({ type, angle: a, radius: r, speed: 0.01 + rand() * 0.02 });
      } else {
        particlePositions[i * 3] = (rand() - 0.5) * 20;
        particlePositions[i * 3 + 1] = 80 + (rand() - 0.5) * 100;
        particlePositions[i * 3 + 2] = -rand() * 200;
        particleData.push({ type, speed: 1 + rand() * 3 });
      }
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 2, transparent: true, opacity: 0.6 }));
    mainGroup.add(particles);

    // === CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.15, y: 0 };
    let rotCurrent = { x: 0.15, y: 0 };
    let zoomTarget = 500;
    let zoomCurrent = 500;

    const el = renderer.domElement;
    el.addEventListener("mousedown", (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    el.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      rotTarget.y += (e.clientX - prevMouse.x) * 0.005;
      rotTarget.x += (e.clientY - prevMouse.y) * 0.005;
      rotTarget.x = Math.max(-0.8, Math.min(1.2, rotTarget.x));
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
        rotTarget.x = Math.max(-0.8, Math.min(1.2, rotTarget.x));
        touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: false });
    el.addEventListener("touchend", () => touchPrev = null);

    // === ANIMATION ===
    let time = 0;
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.006;

      if (!isDragging) rotTarget.y += 0.0004;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 100;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 50, 0);

      torusMesh.rotation.x = time * 0.2;
      torusMesh.rotation.y = time * 0.3;
      innerTorus.rotation.x = -time * 0.3;
      innerTorus.rotation.y = -time * 0.2;

      tesseractGroup.rotation.x = time * 0.15;
      tesseractGroup.rotation.y = time * 0.2;
      tesseractGroup.rotation.z = time * 0.1;

      tunnelRings.forEach((r, i) => {
        r.mesh.scale.setScalar(1 + Math.sin(time * 2 - i * 0.3) * 0.1);
      });

      vortexGroup.rotation.y = time * 0.15;
      glyphGroup.rotation.y = -time * 0.1;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const pd = particleData[i];
        if (pd.type === 'orbit') {
          pd.angle += pd.speed;
          pos[i * 3] = Math.cos(pd.angle) * pd.radius;
          pos[i * 3 + 2] = Math.sin(pd.angle) * pd.radius;
        } else {
          pos[i * 3 + 2] -= pd.speed;
          if (pos[i * 3 + 2] < -300) {
            pos[i * 3] = (rand() - 0.5) * 20;
            pos[i * 3 + 1] = 80 + (rand() - 0.5) * 100;
            pos[i * 3 + 2] = 0;
          }
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000002" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Porta Dimensionum
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
