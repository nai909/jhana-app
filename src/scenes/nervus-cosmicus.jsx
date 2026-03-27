import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function NervusCosmicus() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000008);
    scene.fog = new THREE.FogExp2(0x000008, 0.00025);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 80, 500);
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

    let seed = 999;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createCurve(points, mat = tealMat, segments = 30) {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments)), mat);
    }

    // === 1. NEURONS (star-like nodes) ===
    const neurons = [];
    const neuronGroup = new THREE.Group();
    mainGroup.add(neuronGroup);

    // Generate neuron positions in a brain-like shape
    for (let i = 0; i < 60; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 80 + rand() * 120;

      // Brain shape modifier (wider at top, narrower at bottom)
      const yMod = Math.cos(phi) * 0.6 + 0.4;
      const xzMod = Math.sin(phi);

      const x = Math.sin(phi) * Math.cos(theta) * r * xzMod;
      const y = Math.cos(phi) * r * yMod + 80;
      const z = Math.sin(phi) * Math.sin(theta) * r * xzMod;

      const size = 3 + rand() * 5;
      const isMain = rand() > 0.7;

      // Neuron cell body
      const neuronMesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, isMain ? 12 : 8, isMain ? 12 : 8),
        new THREE.MeshBasicMaterial({
          color: isMain ? TEAL_BRIGHT : TEAL,
          wireframe: true,
          transparent: true,
          opacity: isMain ? 0.4 : 0.25
        })
      );
      neuronMesh.position.set(x, y, z);
      neuronGroup.add(neuronMesh);

      // Inner nucleus
      if (isMain) {
        neuronGroup.add(createDot(x, y, z, size * 0.4, coreDotMat));
      }

      neurons.push({
        mesh: neuronMesh,
        pos: new THREE.Vector3(x, y, z),
        size,
        isMain,
        pulsePhase: rand() * Math.PI * 2,
        pulseSpeed: 0.5 + rand() * 1.5,
      });
    }

    // === 2. SYNAPTIC CONNECTIONS ===
    const synapseGroup = new THREE.Group();
    mainGroup.add(synapseGroup);

    const connections = [];
    neurons.forEach((n1, i) => {
      // Find nearest neighbors
      const distances = neurons.map((n2, j) => ({
        index: j,
        dist: n1.pos.distanceTo(n2.pos)
      })).filter(d => d.index !== i).sort((a, b) => a.dist - b.dist);

      // Connect to 2-4 nearest
      const connectCount = 2 + Math.floor(rand() * 3);
      for (let c = 0; c < Math.min(connectCount, distances.length); c++) {
        if (distances[c].dist > 150) continue;

        const n2 = neurons[distances[c].index];

        // Curved synapse
        const mid = new THREE.Vector3().addVectors(n1.pos, n2.pos).multiplyScalar(0.5);
        mid.x += (rand() - 0.5) * 30;
        mid.y += (rand() - 0.5) * 30;
        mid.z += (rand() - 0.5) * 30;

        const pts = [n1.pos.clone(), mid, n2.pos.clone()];
        synapseGroup.add(createCurve(pts, n1.isMain ? tealDarkMat : tealDimMat, 20));

        connections.push({
          from: i,
          to: distances[c].index,
          curve: new THREE.CatmullRomCurve3(pts),
        });
      }
    });

    // === 3. DENDRITE FRACTALS ===
    const dendriteGroup = new THREE.Group();
    mainGroup.add(dendriteGroup);

    function createDendrite(start, direction, length, depth = 0, maxD = 4) {
      if (depth > maxD || length < 5) return;

      const end = start.clone().add(direction.clone().multiplyScalar(length));

      // Add some curve
      const mid = start.clone().lerp(end, 0.5);
      mid.x += (rand() - 0.5) * length * 0.3;
      mid.y += (rand() - 0.5) * length * 0.3;
      mid.z += (rand() - 0.5) * length * 0.3;

      const opacity = 0.3 - depth * 0.05;
      const mat = new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: Math.max(0.05, opacity) });
      dendriteGroup.add(createCurve([start, mid, end], mat, 10));

      // Branch
      const branches = depth < 2 ? 3 : 2;
      for (let b = 0; b < branches; b++) {
        const newDir = direction.clone();
        newDir.x += (rand() - 0.5) * 1.5;
        newDir.y += (rand() - 0.5) * 1.5;
        newDir.z += (rand() - 0.5) * 1.5;
        newDir.normalize();
        createDendrite(end, newDir, length * 0.6, depth + 1, maxD);
      }
    }

    // Create dendrites from main neurons
    neurons.filter(n => n.isMain).forEach(n => {
      for (let d = 0; d < 4; d++) {
        const dir = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
        createDendrite(n.pos.clone(), dir, 30, 0, 3);
      }
    });

    // === 4. CENTRAL BRAINSTEM ===
    const brainstemGroup = new THREE.Group();
    mainGroup.add(brainstemGroup);

    // Main column
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 200, 0),
      new THREE.Vector3(3, 150, 2),
      new THREE.Vector3(-2, 100, -1),
      new THREE.Vector3(2, 50, 2),
      new THREE.Vector3(-1, 0, -1),
      new THREE.Vector3(0, -50, 0),
    ]);

    brainstemGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(stemCurve, 40, 8, 8, false),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.15 })
    ));

    brainstemGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(stemCurve.getPoints(50)),
      tealBrightMat
    ));

    // Vertebrae nodes
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const p = stemCurve.getPoint(t);
      brainstemGroup.add(createDot(p.x, p.y, p.z, 3, i % 2 === 0 ? coreDotMat : accentDotMat));

      // Neural branches from stem
      for (let b = 0; b < 4; b++) {
        const a = (b / 4) * Math.PI * 2 + i * 0.5;
        const branchEnd = new THREE.Vector3(
          p.x + Math.cos(a) * 40,
          p.y + (rand() - 0.5) * 20,
          p.z + Math.sin(a) * 40
        );
        brainstemGroup.add(createCurve([p.clone(), branchEnd], tealDimMat, 10));
      }
    }

    // === 5. THOUGHT-WAVE RIPPLES ===
    const rippleGroup = new THREE.Group();
    rippleGroup.position.y = 80;
    mainGroup.add(rippleGroup);

    const ripples = [];
    for (let i = 0; i < 5; i++) {
      const neuron = neurons[Math.floor(rand() * neurons.length)];
      for (let r = 1; r <= 4; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r * 15, 0.5, 4, 32),
          new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.15 / r })
        );
        ring.position.copy(neuron.pos);
        ring.position.y -= 80;
        ring.rotation.x = Math.PI / 2;
        rippleGroup.add(ring);
        ripples.push({ mesh: ring, baseRadius: r * 15, phase: rand() * Math.PI * 2, neuronPos: neuron.pos });
      }
    }

    // === 6. NEUROTRANSMITTER PARTICLES ===
    const ntCount = 150;
    const ntGeo = new THREE.BufferGeometry();
    const ntPositions = new Float32Array(ntCount * 3);
    const ntData = [];

    for (let i = 0; i < ntCount; i++) {
      const conn = connections[Math.floor(rand() * connections.length)];
      const t = rand();
      const pos = conn.curve.getPoint(t);
      ntPositions[i * 3] = pos.x;
      ntPositions[i * 3 + 1] = pos.y;
      ntPositions[i * 3 + 2] = pos.z;
      ntData.push({
        connection: conn,
        t,
        speed: 0.002 + rand() * 0.008,
        direction: rand() > 0.5 ? 1 : -1,
      });
    }
    ntGeo.setAttribute("position", new THREE.BufferAttribute(ntPositions, 3));
    const ntParticles = new THREE.Points(ntGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 2, transparent: true, opacity: 0.7 }));
    mainGroup.add(ntParticles);

    // === 7. CEREBRAL HEMISPHERES OUTLINE ===
    const hemisphereGroup = new THREE.Group();
    hemisphereGroup.position.y = 80;
    mainGroup.add(hemisphereGroup);

    // Left hemisphere
    const leftHemi = new THREE.Mesh(
      new THREE.SphereGeometry(100, 16, 12, 0, Math.PI, 0, Math.PI),
      new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.06 })
    );
    leftHemi.position.x = -20;
    leftHemi.rotation.y = Math.PI / 2;
    hemisphereGroup.add(leftHemi);

    // Right hemisphere
    const rightHemi = new THREE.Mesh(
      new THREE.SphereGeometry(100, 16, 12, 0, Math.PI, 0, Math.PI),
      new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.06 })
    );
    rightHemi.position.x = 20;
    rightHemi.rotation.y = -Math.PI / 2;
    hemisphereGroup.add(rightHemi);

    // Corpus callosum (connection band)
    const ccPts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const a = t * Math.PI;
      ccPts.push(new THREE.Vector3(0, Math.sin(a) * 20 + 50, Math.cos(a) * 50));
    }
    hemisphereGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ccPts), tealDarkMat));

    // === 8. ELECTRICAL FIELD LINES ===
    const fieldGroup = new THREE.Group();
    mainGroup.add(fieldGroup);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= 30; j++) {
        const t = j / 30;
        const r = 150 + Math.sin(t * Math.PI * 3) * 30;
        const y = 200 - t * 300;
        pts.push(new THREE.Vector3(
          Math.cos(a + t * 0.5) * r,
          y,
          Math.sin(a + t * 0.5) * r
        ));
      }
      fieldGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.1 })
      ));
    }

    // === 9. AMBIENT PARTICLES ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (rand() - 0.5) * 400;
      particlePositions[i * 3 + 1] = (rand() - 0.5) * 400 + 80;
      particlePositions[i * 3 + 2] = (rand() - 0.5) * 400;
      particleVelocities.push({
        x: (rand() - 0.5) * 0.1,
        y: (rand() - 0.5) * 0.1,
        z: (rand() - 0.5) * 0.1,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1, transparent: true, opacity: 0.25 }));
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

      if (!isDragging) rotTarget.y += 0.0004;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 80;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 50, 0);

      // Neuron pulses
      neurons.forEach(n => {
        const pulse = 1 + Math.sin(time * n.pulseSpeed + n.pulsePhase) * 0.15;
        n.mesh.scale.setScalar(pulse);
      });

      // Neurotransmitter flow
      const ntPos = ntParticles.geometry.attributes.position.array;
      ntData.forEach((nt, i) => {
        nt.t += nt.speed * nt.direction;
        if (nt.t > 1) { nt.t = 0; nt.direction = 1; }
        if (nt.t < 0) { nt.t = 1; nt.direction = -1; }
        const pos = nt.connection.curve.getPoint(nt.t);
        ntPos[i * 3] = pos.x;
        ntPos[i * 3 + 1] = pos.y;
        ntPos[i * 3 + 2] = pos.z;
      });
      ntParticles.geometry.attributes.position.needsUpdate = true;

      // Ripple animation
      ripples.forEach(r => {
        const scale = 1 + Math.sin(time * 2 + r.phase) * 0.2;
        r.mesh.scale.setScalar(scale);
        r.mesh.material.opacity = 0.15 / (r.baseRadius / 15) * (1 - Math.abs(Math.sin(time * 2 + r.phase)) * 0.5);
      });

      // Ambient particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (Math.abs(pos[i * 3]) > 250 || Math.abs(pos[i * 3 + 2]) > 250) {
          particleVelocities[i].x *= -1;
          particleVelocities[i].z *= -1;
        }
        if (pos[i * 3 + 1] > 300 || pos[i * 3 + 1] < -100) {
          particleVelocities[i].y *= -1;
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000008" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Nervus Cosmicus
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
