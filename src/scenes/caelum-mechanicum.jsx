import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function CaelumMechanicum() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    scene.fog = new THREE.FogExp2(0x000005, 0.0003);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 150, 450);
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

    const tealMat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: TEAL_DARK, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: WHITE_GLOW, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 888;
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

    function createSmallCube(x, y, z, s = 3, color = TEAL) {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
      m.position.set(x, y, z);
      return m;
    }

    // === 1. CENTRAL SUN ===
    const sunGroup = new THREE.Group();
    sunGroup.position.y = 80;
    mainGroup.add(sunGroup);

    const sunSphere = new THREE.Mesh(
      new THREE.SphereGeometry(25, 20, 20),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.25 })
    );
    sunGroup.add(sunSphere);

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const inner = 28;
      const outer = i % 2 === 0 ? 50 : 38;
      sunGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * inner, 0, Math.sin(a) * inner),
          new THREE.Vector3(Math.cos(a) * outer, 0, Math.sin(a) * outer)
        ]), i % 2 === 0 ? tealBrightMat : tealDimMat));
    }
    sunGroup.add(createDot(0, 0, 0, 5, coreDotMat));

    // === 2. PLANETARY ORBITS ===
    const orbitGroup = new THREE.Group();
    orbitGroup.position.y = 80;
    mainGroup.add(orbitGroup);

    const planetData = [
      { name: "Mercury", r: 60, speed: 2.0, size: 3, color: TEAL },
      { name: "Venus", r: 80, speed: 1.5, size: 4, color: TEAL_DARK },
      { name: "Earth", r: 105, speed: 1.0, size: 5, color: TEAL_BRIGHT },
      { name: "Mars", r: 130, speed: 0.7, size: 4, color: TEAL },
      { name: "Jupiter", r: 165, speed: 0.4, size: 8, color: TEAL_DARK },
      { name: "Saturn", r: 200, speed: 0.25, size: 7, color: TEAL },
    ];

    const planets = [];
    planetData.forEach((pd, i) => {
      orbitGroup.add(createRing(pd.r, 0, 64, i % 2 === 0 ? tealDimMat : tealDarkMat));
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(pd.size, 10, 10),
        new THREE.MeshBasicMaterial({ color: pd.color, wireframe: true, transparent: true, opacity: 0.4 })
      );
      planet.position.x = pd.r;
      orbitGroup.add(planet);

      for (let j = 0; j < 8; j++) {
        const oa = (j / 8) * Math.PI * 2;
        orbitGroup.add(createDot(Math.cos(oa) * pd.r, 0, Math.sin(oa) * pd.r, 1, accentDotMat));
      }

      planets.push({ mesh: planet, ...pd, angle: rand() * Math.PI * 2 });

      if (pd.name === "Saturn") {
        const ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(pd.size + 4, 1, 2, 24),
          new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.3 })
        );
        ringMesh.rotation.x = Math.PI / 3;
        planet.add(ringMesh);
      }

      if (pd.name === "Earth") {
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 8, 8),
          new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.5 })
        );
        moon.position.x = 12;
        planet.add(moon);
        planet.userData.moon = moon;
      }
    });

    // === 3. ZODIAC WHEEL ===
    const zodiacGroup = new THREE.Group();
    zodiacGroup.position.y = 80;
    mainGroup.add(zodiacGroup);

    const zodiacOuter = 230;
    const zodiacInner = 215;
    zodiacGroup.add(createRing(zodiacOuter, 0, 96, tealMat));
    zodiacGroup.add(createRing(zodiacInner, 0, 96, tealDarkMat));

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const nextA = ((i + 1) / 12) * Math.PI * 2;
      zodiacGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * zodiacInner, 0, Math.sin(a) * zodiacInner),
          new THREE.Vector3(Math.cos(a) * zodiacOuter, 0, Math.sin(a) * zodiacOuter)
        ]), tealDarkMat));
      const midA = (a + nextA) / 2;
      const midR = (zodiacInner + zodiacOuter) / 2;
      zodiacGroup.add(createSmallCube(Math.cos(midA) * midR, 0, Math.sin(midA) * midR, 4, TEAL_BRIGHT));
    }

    // === 4. CELESTIAL SPHERES ===
    const sphereGroup = new THREE.Group();
    sphereGroup.position.y = 80;
    mainGroup.add(sphereGroup);

    const ecliptic = new THREE.Mesh(
      new THREE.TorusGeometry(180, 0.8, 4, 80),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.2 })
    );
    ecliptic.rotation.x = Math.PI / 2;
    ecliptic.rotation.z = 0.41;
    sphereGroup.add(ecliptic);

    const equator = new THREE.Mesh(
      new THREE.TorusGeometry(175, 0.6, 4, 64),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.15 })
    );
    equator.rotation.x = Math.PI / 2;
    sphereGroup.add(equator);

    for (let i = 0; i < 6; i++) {
      const meridian = new THREE.Mesh(
        new THREE.TorusGeometry(170, 0.4, 4, 48),
        new THREE.MeshBasicMaterial({ color: TEAL_DIM, wireframe: true, transparent: true, opacity: 0.1 })
      );
      meridian.rotation.y = (i / 6) * Math.PI;
      sphereGroup.add(meridian);
    }

    sphereGroup.add(createDot(0, 170, 0, 3, coreDotMat));
    sphereGroup.add(createDot(0, -170, 0, 3, coreDotMat));

    const axisLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 180, 0), new THREE.Vector3(0, -180, 0)
      ]),
      new THREE.LineDashedMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.3, dashSize: 5, gapSize: 3 })
    );
    axisLine.computeLineDistances();
    sphereGroup.add(axisLine);

    // === 5. MOON PHASE DIAGRAM ===
    const moonPhaseGroup = new THREE.Group();
    moonPhaseGroup.position.set(-200, 200, 0);
    mainGroup.add(moonPhaseGroup);

    moonPhaseGroup.add(createRing(40, 0, 32, tealMat));

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * 40;
      const z = Math.sin(a) * 40;
      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(6, 12, 12),
        new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.3 })
      );
      moonMesh.position.set(x, 0, z);
      moonPhaseGroup.add(moonMesh);
    }
    moonPhaseGroup.add(createDot(0, 0, 0, 2, coreDotMat));

    // === 6. ECLIPSE MECHANISM ===
    const eclipseGroup = new THREE.Group();
    eclipseGroup.position.set(200, 200, 0);
    mainGroup.add(eclipseGroup);

    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(20, 24),
      new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, wireframe: true, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    sunDisc.position.z = -60;
    eclipseGroup.add(sunDisc);

    const earthDisc = new THREE.Mesh(
      new THREE.SphereGeometry(8, 12, 12),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.4 })
    );
    eclipseGroup.add(earthDisc);

    const moonDisc = new THREE.Mesh(
      new THREE.SphereGeometry(4, 10, 10),
      new THREE.MeshBasicMaterial({ color: TEAL_DARK, wireframe: true, transparent: true, opacity: 0.5 })
    );
    moonDisc.position.z = 30;
    eclipseGroup.add(moonDisc);

    eclipseGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(-15, 0, 60)
    ]), tealDimMat));
    eclipseGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(15, 0, 60)
    ]), tealDimMat));
    eclipseGroup.add(createRing(30, 0, 32, tealDimMat));

    // === 7. SEXTANT OUTLINE ===
    const sextantGroup = new THREE.Group();
    sextantGroup.position.set(0, -100, -100);
    sextantGroup.rotation.x = -0.3;
    mainGroup.add(sextantGroup);

    const arcPts = [];
    for (let i = 0; i <= 30; i++) {
      const a = (i / 30) * Math.PI / 3 - Math.PI / 6;
      arcPts.push(new THREE.Vector3(Math.cos(a) * 80, Math.sin(a) * 80, 0));
    }
    sextantGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), tealMat));

    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI / 3 - Math.PI / 6;
      sextantGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(a) * 85, Math.sin(a) * 85, 0)
        ]), i === 3 ? tealBrightMat : tealDimMat));
    }

    const indexArm = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(75, 20, 5)
      ]), tealBrightMat);
    sextantGroup.add(indexArm);
    sextantGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // === 8. STAR CATALOG GRID ===
    const catalogGroup = new THREE.Group();
    catalogGroup.position.set(0, -80, 100);
    catalogGroup.rotation.x = 0.4;
    mainGroup.add(catalogGroup);

    const gridSize = 100;
    const gridDiv = 8;
    for (let i = 0; i <= gridDiv; i++) {
      const t = (i / gridDiv - 0.5) * 2 * gridSize;
      catalogGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-gridSize, t, 0), new THREE.Vector3(gridSize, t, 0)
        ]), tealDimMat));
      catalogGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(t, -gridSize, 0), new THREE.Vector3(t, gridSize, 0)
        ]), tealDimMat));
    }

    for (let i = 0; i < 25; i++) {
      const x = (rand() - 0.5) * gridSize * 1.8;
      const y = (rand() - 0.5) * gridSize * 1.8;
      catalogGroup.add(createDot(x, y, 0, 1 + rand() * 2, rand() > 0.7 ? coreDotMat : accentDotMat));
    }

    // === 9. CONSTELLATIONS ===
    const constellationGroup = new THREE.Group();
    constellationGroup.position.y = 80;
    mainGroup.add(constellationGroup);

    const constellations = [
      [[-40, 120, 160], [-30, 100, 155], [-20, 80, 150], [-35, 60, 155], [-50, 80, 160]],
      [[80, 150, -100], [100, 145, -80], [115, 140, -55], [105, 135, -30], [130, 130, -35]],
      [[-100, 160, -80], [-85, 150, -60], [-70, 165, -40], [-55, 150, -20], [-40, 165, 0]],
    ];

    constellations.forEach(constellation => {
      for (let i = 0; i < constellation.length; i++) {
        const [x, y, z] = constellation[i];
        constellationGroup.add(createDot(x, y, z, 2, accentDotMat));
        if (i > 0) {
          const [px, py, pz] = constellation[i - 1];
          constellationGroup.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(px, py, pz), new THREE.Vector3(x, y, z)
            ]),
            new THREE.LineBasicMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.2 })
          ));
        }
      }
    });

    // === 10. FRAME ===
    const frameGroup = new THREE.Group();
    frameGroup.position.y = 80;
    mainGroup.add(frameGroup);

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const r = 250;
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * r, -180, Math.sin(a) * r),
          new THREE.Vector3(Math.cos(a) * r * 0.8, 200, Math.sin(a) * r * 0.8)
        ]),
        new THREE.LineDashedMaterial({ color: TEAL_DIM, transparent: true, opacity: 0.15, dashSize: 6, gapSize: 4 })
      );
      line.computeLineDistances();
      frameGroup.add(line);
      frameGroup.add(createSmallCube(Math.cos(a) * r, -180, Math.sin(a) * r, 6, TEAL_DIM));
    }
    frameGroup.add(createRing(250, -180, 64, tealDarkMat));

    // === 11. PARTICLES ===
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (rand() - 0.5) * 500;
      particlePositions[i * 3 + 1] = (rand() - 0.5) * 500 + 50;
      particlePositions[i * 3 + 2] = (rand() - 0.5) * 500;
      particleVelocities.push({
        x: (rand() - 0.5) * 0.05,
        y: (rand() - 0.5) * 0.06,
        z: (rand() - 0.5) * 0.05,
      });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: TEAL_BRIGHT, size: 1.2, transparent: true, opacity: 0.3 }));
    mainGroup.add(particles);

    // === CONTROLS ===
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotTarget = { x: 0.2, y: 0 };
    let rotCurrent = { x: 0.2, y: 0 };
    let zoomTarget = 450;
    let zoomCurrent = 450;

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
    el.addEventListener("wheel", (e) => { zoomTarget = Math.max(200, Math.min(800, zoomTarget + e.deltaY * 0.5)); });

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

      if (!isDragging) rotTarget.y += 0.0005;

      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      zoomCurrent += (zoomTarget - zoomCurrent) * 0.05;

      camera.position.x = Math.sin(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.position.y = Math.sin(rotCurrent.x) * zoomCurrent * 0.5 + 150;
      camera.position.z = Math.cos(rotCurrent.y) * Math.cos(rotCurrent.x) * zoomCurrent;
      camera.lookAt(0, 50, 0);

      const pulse = 1 + Math.sin(time * 2) * 0.08;
      sunSphere.scale.setScalar(pulse);

      planets.forEach(p => {
        p.angle += p.speed * 0.002;
        p.mesh.position.x = Math.cos(p.angle) * p.r;
        p.mesh.position.z = Math.sin(p.angle) * p.r;
        if (p.mesh.userData.moon) {
          p.mesh.userData.moon.position.x = Math.cos(time * 3) * 12;
          p.mesh.userData.moon.position.z = Math.sin(time * 3) * 12;
        }
      });

      zodiacGroup.rotation.y = time * 0.02;
      ecliptic.rotation.y = time * 0.03;
      sphereGroup.rotation.y = time * 0.01;
      moonPhaseGroup.rotation.y = time * 0.05;
      moonDisc.position.x = Math.cos(time * 0.8) * 30;
      moonDisc.position.z = Math.sin(time * 0.8) * 30;
      indexArm.rotation.z = Math.sin(time * 0.3) * 0.2;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (Math.abs(pos[i * 3]) > 300 || Math.abs(pos[i * 3 + 1]) > 300 || Math.abs(pos[i * 3 + 2]) > 300) {
          pos[i * 3] = (rand() - 0.5) * 400;
          pos[i * 3 + 1] = (rand() - 0.5) * 400 + 50;
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
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000005" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.3)", fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", pointerEvents: "none", fontFamily: "serif" }}>
        Caelum Mechanicum
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", color: "rgba(78,205,196,0.35)", fontSize: 12, letterSpacing: "0.3em", fontStyle: "italic", pointerEvents: "none", fontFamily: "serif" }}>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
