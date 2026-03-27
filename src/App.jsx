import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

// Import all Gaze scene components
import LabyrinthusScrum from "./scenes/labyrinthus-sacrum.jsx";
import TemplumSonorum from "./scenes/templum-sonorum.jsx";
import PortaDimensionum from "./scenes/porta-dimensionum.jsx";
import NervusCosmicus from "./scenes/nervus-cosmicus.jsx";
import CorpusStellae from "./scenes/corpus-stellae.jsx";
import CrystallumInfinitum from "./scenes/crystallum-infinitum.jsx";
import AquaVitae from "./scenes/aqua-vitae.jsx";
import ArborMundi from "./scenes/arbor-mundi.jsx";
import CaelumMechanicum from "./scenes/caelum-mechanicum.jsx";
import OceanusProfundus from "./scenes/oceanus-profundus.jsx";
import MachinaTemporis from "./scenes/machina-temporis.jsx";

const DK = {
  bg: "#08080B",
  card: "#111116",
  surface: "#0D0D12",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#D8D7D0",
  textMuted: "#7A7970",
  textDim: "#4A4940",
  accent: "#6BC5D2",
  accentDim: "rgba(107,197,210,0.10)",
};

const JHANAS = [
  { id: 1, name: "Euphoria", quality: "Rapture", color: "#F2C94C", metaphor: "Seeing an oasis after a dehydrating hike", feel: "Sunny, bright, yellow", body: "Head", desc: "Intense pleasurable fizzing or buzzing. Giddy, electric, radiating pleasure. Thoughts still present but joyful. Hands and chest may tingle.", transition: "Allow the intensity to stabilize fully, then gently let it release. J2 arrives as J1 settles — like being pulled, not pushed." },
  { id: 2, name: "Joy", quality: "Contentment", color: "#E24B8B", metaphor: "Entering the oasis, drinking", feel: "Beaming, hot pink", body: "Heart", desc: "Effort drops away. Warm, loving, oceanic happiness. Less intense but deeper. Like cuddling early in a relationship. An ocean of love.", transition: "Stay present. Don't interact with it. The warmth broadens naturally into a quieter contentment." },
  { id: 3, name: "Contentment", quality: "Calm assurance", color: "#6BC5D2", metaphor: "Swimming in the oasis", feel: "Soft, wide, robin's egg blue", body: "Stomach", desc: "Thoughts become rare. Broad, calm contentment. A quiet okayness with everything. 'I could stay here forever' arises naturally.", transition: "The contentment settles further. Thoughts thin to almost nothing. A vast, dissociative stillness emerges." },
  { id: 4, name: "Peace", quality: "Equanimity", color: "#9B8EC4", metaphor: "Resting in the shade", feel: "Vast, muted lavender", body: "Legs / whole body", desc: "Deep stillness. Almost no thoughts. Nothing needs to be different. A sense of completion. You hear your own heartbeat.", transition: "Expand and soften awareness, as if the walls of the bathtub were falling away. Sense what is around you in pitch dark." },
  { id: 5, name: "Infinite space", quality: "Dissolution", color: "#6A6A72", metaphor: "Waking up floating in outer space", feel: "Grayscale, infinite", body: "Dissolved", desc: "Body dissolves into infinite space. Disembodied. Like waking up floating in outer space. No physical reference point.", transition: "You are staring at infinite space — now become the infinite space. Float forward, merge with it." },
  { id: 6, name: "Infinite consciousness", quality: "Merging", color: "#D4537E", metaphor: "Merging forward into the space", feel: "Rose petal pink", body: "Dissolved", desc: "You become the infinite space. Psychedelic beauty and benevolence. Your consciousness merges with everything.", transition: "Keep sensations soft. J6 tends to dissolve on its own. Reminding yourself it is finite can accelerate this." },
  { id: 7, name: "No-thingness", quality: "Void", color: "#5A5A62", metaphor: "Nothingness in nothingness", feel: "Blank, indescribable", body: "Absent", desc: "Dissolution of sense of self. A blank that cannot be described. Base camp for J8 and J9. Nothing in nothingness.", transition: "Relax more deeply. Notice where reality breaks down. Fleeting nonsensical thoughts float through. Gently notice without reacting." },
  { id: 8, name: "Neither perception nor non-perception", quality: "Surreal", color: "#7B6FD4", metaphor: "Things winking in and out of existence", feel: "Flickering", body: "Absent", desc: "Surreal dissolution. May be thoughts or non-thoughts. You might be noticing or not-noticing. Let it be.", transition: "When very deeply settled, 'shoot the gap' — a light touch carries you across into cessation." },
  { id: 9, name: "Cessation", quality: "Absence", color: "#3A3A42", metaphor: "General anesthesia while alert", feel: "Absent", body: "Absent", desc: "Consciousness switches off entirely. No direct experience. You only know from the return. One moment present, the next you have returned." },
];

const STEPS = [
  // Phase 1: Settling
  { title: "Settle", subtitle: "Find your position", icon: "○",
    text: "Sit comfortably or lie down. Whatever lets you be deeply relaxed while alert." },
  { title: "Soften", subtitle: "Release tension", icon: "○",
    text: "Scan for tension — especially face, jaw, shoulders. Let it go. Try half as hard." },

  // Phase 2: Scaffolding
  { title: "Scaffold", subtitle: "Bring up warmth", icon: "♡",
    text: "Think of someone you love. A memory of pure joy. A phrase invoking warmth." },
  { title: "Notice", subtitle: "Feel your body", icon: "♡",
    text: "What does the thought do to your body? Warmth in your chest? A subtle expansion? That's your object." },

  // Phase 3: Pulse and Glide
  { title: "Pulse", subtitle: "Re-invoke gently", icon: "◐",
    text: "Gently bring up the scaffolding again for 5–30 seconds. Let the feeling arise." },
  { title: "Glide", subtitle: "Let it resonate", icon: "◐",
    text: "Now let the feeling resonate without effort. Don't grip it. The glide is where the magic happens." },
  { title: "Repeat", subtitle: "Pulse and glide", icon: "◐",
    text: "When it fades, pulse again. Then glide. The fading may be an invitation to relax deeper." },

  // Phase 4: Deepening
  { title: "Relax more", subtitle: "First question", icon: "◇",
    text: "Can I relax more? Check for tension you might be adding. Try half as hard again." },
  { title: "Enjoy more", subtitle: "Second question", icon: "◇",
    text: "Can I enjoy this more? Are you actually receiving the feeling, or just observing it?" },
  { title: "Wonder", subtitle: "Third question", icon: "◇",
    text: "Can I bring more wonder to this? Interest without agenda. Curiosity without grasping." },

  // Phase 5: The Loop
  { title: "Allow", subtitle: "Let it grow", icon: "◉",
    text: "Let the feeling feed on itself. Extend gratitude toward gratitude. Joyfully celebrate your joy." },
  { title: "Enter", subtitle: "The loop takes hold", icon: "◉",
    text: "When euphoria hits — hands tingling, chest buzzing — you're in J1. Don't narrate. Just be in it." },

  // Phase 6: Progression
  { title: "Stay", subtitle: "Don't push", icon: "∞",
    text: "Stay in the moment. Enjoy the sensation. Don't try to change or interact with it." },
  { title: "Evolve", subtitle: "Let it transform", icon: "∞",
    text: "It will evolve on its own. You are being pulled, not pushed. The door opens through allowing." },
];

// All available visuals for practice sessions (cycles through each time)
const PRACTICE_VISUALS = [
  ArborMundi,
  CorpusStellae,
  TemplumSonorum,
  AquaVitae,
  OceanusProfundus,
  CrystallumInfinitum,
  PortaDimensionum,
  NervusCosmicus,
  CaelumMechanicum,
  MachinaTemporis,
  LabyrinthusScrum,
];

const MISTAKES = [
  { title: "Over-efforting", fix: "Try half as hard. Then half as hard again.", desc: "Practice feels like work. Subtle strain in forehead or jaw. You're concentrating at the experience rather than resting in it. There exists a level of non-effort most people have never experienced while remaining alert.", color: "#E24B4A" },
  { title: "Sensation-hunting", fix: "You're not scanning for a sensation. You're becoming it.", desc: "You're scanning the body for 'the right feeling.' It feels clinical. Emotions live in the body but they're not just sensations — there's a felt quality that raw tracking doesn't capture.", color: "#378ADD" },
  { title: "Scaffolding goes flat", fix: "Stay with it. This is exactly the skill you're building.", desc: "Your scaffolding worked, then stopped. This is progress — the novelty bonus faded. Now learn to relate appreciatively without the extra buzz. Find enjoyment in subtler territory.", color: "#EF9F27" },
  { title: "Relaxing away, not into", fix: "The emotion doesn't need to disappear. Your war with it does.", desc: "Negative emotion arises and you try to relax it away. Instead, relax into it — allow it fully with less resistance. This distinction is subtle and usually invisible to the person making it.", color: "#9B8EC4" },
  { title: "Following something boring", fix: "If the mind wanders, the anchor might be the problem — not you.", desc: "Standard meditation asks you to follow something neutral like the breath. Neutral is often boring. If it's boring, the mind wanders. That's your nervous system doing exactly what it's designed to do — not a character flaw. Find an anchor that's genuinely pleasant.", color: "#6BC5D2" },
  { title: "Blaming yourself", fix: "It wasn't you. It was never you. It was your technique.", desc: "After hitting the guesswork problem, trying harder, and watching your mind wander — most people blame themselves. They think they're a failure at meditation. But the problem was always structural: no feedback, a boring anchor, and effort where relaxation was needed. You're not broken. You were using broken instructions.", color: "#D4537E" },
];

// Wireframe Lava Lamp breathing visual
function BreathingLava({ active }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const clockRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(280, 280);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    // 3D noise for organic deformation
    const noise3D = (x, y, z) => {
      const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
      const perm = [...p, ...p];
      const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
      const lerp = (t, a, b) => a + t * (b - a);
      const grad = (hash, x, y, z) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z);
      const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
      const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
      return lerp(w, lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x-1, y, z)),
        lerp(u, grad(perm[AB], x, y-1, z), grad(perm[BB], x-1, y-1, z))),
        lerp(v, lerp(u, grad(perm[AA+1], x, y, z-1), grad(perm[BA+1], x-1, y, z-1)),
          lerp(u, grad(perm[AB+1], x, y-1, z-1), grad(perm[BB+1], x-1, y-1, z-1))));
    };

    const lavaGroup = new THREE.Group();
    scene.add(lavaGroup);

    const blobs = [];
    blobsRef.current = blobs;

    // Create blob
    const createBlob = (x, y, z, radius) => {
      const geometry = new THREE.IcosahedronGeometry(radius, 3);
      const originalPositions = geometry.attributes.position.array.slice();
      geometry.userData = { originalPositions };

      const material = new THREE.MeshBasicMaterial({
        color: 0x6BC5D2,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);

      const blob = {
        mesh,
        radius,
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.002
        ),
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.04 + Math.random() * 0.03,
        wobbleSpeed: 0.08 + Math.random() * 0.04,
        wobbleIntensity: 0.1 + Math.random() * 0.06,
      };

      blobs.push(blob);
      lavaGroup.add(mesh);
      return blob;
    };

    // Create initial blobs
    createBlob(0, 0, 0, 0.5);
    createBlob(-0.6, 0.4, -0.2, 0.35);
    createBlob(0.5, -0.3, 0.1, 0.3);
    createBlob(-0.3, -0.5, 0.2, 0.25);
    createBlob(0.4, 0.5, -0.1, 0.28);

    // Glow particles
    const glowParticleCount = 80;
    const glowGeom = new THREE.BufferGeometry();
    const glowPositions = new Float32Array(glowParticleCount * 3);
    const glowVelocities = [];

    for (let i = 0; i < glowParticleCount; i++) {
      const i3 = i * 3;
      glowPositions[i3] = (Math.random() - 0.5) * 4;
      glowPositions[i3 + 1] = (Math.random() - 0.5) * 4;
      glowPositions[i3 + 2] = (Math.random() - 0.5) * 2;
      glowVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.002,
        phase: Math.random() * Math.PI * 2
      });
    }

    glowGeom.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    const glowMat = new THREE.PointsMaterial({
      color: 0x6BC5D2,
      size: 0.03,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const glowParticles = new THREE.Points(glowGeom, glowMat);
    lavaGroup.add(glowParticles);

    let animationId;
    let isMounted = true;

    // Breath timing
    const phases = [
      { name: "inhale", dur: 4 },
      { name: "pause", dur: 1 },
      { name: "exhale", dur: 7 },
      { name: "rest", dur: 1 },
    ];
    const totalCycle = 13;

    const getBreathPhase = (elapsed) => {
      const cyclePos = elapsed % totalCycle;
      let accum = 0, phaseIdx = 0, phaseProgress = 0;
      for (let i = 0; i < phases.length; i++) {
        if (cyclePos < accum + phases[i].dur) {
          phaseIdx = i;
          phaseProgress = (cyclePos - accum) / phases[i].dur;
          break;
        }
        accum += phases[i].dur;
      }

      let bp;
      if (phaseIdx === 0) {
        bp = (1 - Math.cos(phaseProgress * Math.PI)) / 2;
      } else if (phaseIdx === 1) {
        bp = 1;
      } else if (phaseIdx === 2) {
        bp = 1 - (1 - Math.cos(phaseProgress * Math.PI)) / 2;
      } else {
        bp = 0;
      }

      return { bp };
    };

    // Spring physics for smooth transitions
    let currentBreath = 0.5;
    let breathVelocity = 0;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const { bp: targetBreath } = getBreathPhase(elapsed);

      // Spring physics
      const breathForce = (targetBreath - currentBreath) * 0.004;
      breathVelocity = (breathVelocity + breathForce) * 0.9;
      currentBreath += breathVelocity;
      currentBreath = Math.max(0, Math.min(1, currentBreath));

      // Breath-synced scale
      const groupScale = 0.8 + currentBreath * 0.4;
      lavaGroup.scale.setScalar(groupScale);

      // Gentle rotation
      lavaGroup.rotation.y += 0.0003;
      lavaGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.05;

      // Animate blobs
      blobs.forEach((blob) => {
        // Vertical oscillation
        const verticalOsc = Math.sin(elapsed * blob.floatSpeed + blob.phase) * 0.2;
        blob.position.y += (verticalOsc - (blob.position.y - blob.mesh.position.y)) * 0.01;

        // Gentle drift
        blob.position.x += Math.sin(elapsed * 0.02 + blob.phase * 1.5) * 0.0003;
        blob.position.z += Math.cos(elapsed * 0.015 + blob.phase * 0.7) * 0.0002;

        // Apply velocity
        blob.position.add(blob.velocity);
        blob.velocity.multiplyScalar(0.98);

        // Soft boundaries
        if (blob.position.y > 1.2) blob.velocity.y -= 0.0002;
        if (blob.position.y < -1.2) blob.velocity.y += 0.0002;
        if (blob.position.x > 1) blob.velocity.x -= 0.0001;
        if (blob.position.x < -1) blob.velocity.x += 0.0001;

        blob.mesh.position.copy(blob.position);

        // Organic deformation
        const geometry = blob.mesh.geometry;
        const positions = geometry.attributes.position.array;
        const originalPositions = geometry.userData.originalPositions;
        const normal = new THREE.Vector3();

        for (let i = 0; i < positions.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];
          normal.set(ox, oy, oz).normalize();

          const noiseVal = noise3D(
            ox * 1.5 + blob.phase,
            oy * 1.5 + elapsed * blob.wobbleSpeed,
            oz * 1.5 + elapsed * 0.04
          );

          const displacement = noiseVal * blob.wobbleIntensity;
          positions[i] = ox + normal.x * displacement;
          positions[i + 1] = oy + normal.y * displacement;
          positions[i + 2] = oz + normal.z * displacement;
        }
        geometry.attributes.position.needsUpdate = true;

        // Breath-synced individual scale and opacity
        blob.mesh.scale.setScalar(0.85 + currentBreath * 0.3);
        blob.mesh.material.opacity = 0.5 + currentBreath * 0.35;
      });

      // Animate glow particles
      const glowPositionsArr = glowGeom.attributes.position.array;
      for (let i = 0; i < glowParticleCount; i++) {
        const i3 = i * 3;
        const vel = glowVelocities[i];
        glowPositionsArr[i3] += vel.x * 0.3 + Math.sin(elapsed * 0.08 + vel.phase) * 0.0006;
        glowPositionsArr[i3 + 1] += vel.y * 0.3 + Math.cos(elapsed * 0.06 + vel.phase) * 0.0006;
        glowPositionsArr[i3 + 2] += vel.z * 0.3;

        if (Math.abs(glowPositionsArr[i3]) > 2) glowPositionsArr[i3] *= -0.9;
        if (Math.abs(glowPositionsArr[i3 + 1]) > 2) glowPositionsArr[i3 + 1] *= -0.9;
        if (Math.abs(glowPositionsArr[i3 + 2]) > 1) glowPositionsArr[i3 + 2] *= -0.9;
      }
      glowGeom.attributes.position.needsUpdate = true;
      glowMat.opacity = 0.2 + currentBreath * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      blobs.forEach(blob => {
        blob.mesh.geometry.dispose();
        blob.mesh.material.dispose();
      });
      glowGeom.dispose();
      glowMat.dispose();
      renderer.dispose();
    };
  }, [active]);

  return (
    <div ref={containerRef} style={{ width: 280, height: 280 }} />
  );
}


function JhanaRings({ sel }) {
  return (
    <svg width="100%" viewBox="0 0 300 300" style={{ maxWidth: 260 }}>
      {JHANAS.slice().reverse().map((j, i) => { const idx = 8 - i; const r = 26 + idx * 14; return (
        <circle key={idx} cx="150" cy="150" r={r} fill="none" stroke={j.color} strokeWidth={idx === sel ? 2 : 0.5} opacity={idx === sel ? 0.85 : idx < sel ? 0.12 : 0.25} style={{ transition: "all 0.6s" }} />
      ); })}
      <circle cx="150" cy="150" r={3} fill={JHANAS[sel].color} opacity={0.7} style={{ transition: "fill 0.5s" }} />
    </svg>
  );
}

const Page = ({ children }) => <div style={{ maxWidth: 620, margin: "0 auto", background: DK.bg, minHeight: "100vh", padding: "0 1.25rem 3rem", color: DK.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>{children}</div>;

const Card = ({ children, style = {}, onClick }) => {
  const [hov, setHov] = useState(false);
  return <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    style={{ background: hov && onClick ? "#15151C" : DK.card, border: `0.5px solid ${hov && onClick ? DK.borderHover : DK.border}`, borderRadius: 12, padding: "1rem 1.2rem", cursor: onClick ? "pointer" : "default", transition: "all 0.15s", ...style }}>{children}</div>;
};

const Back = ({ fn }) => <button onClick={fn} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: DK.textMuted, padding: "18px 0 10px" }}>← Back</button>;
const Chip = ({ children }) => <span style={{ fontSize: 11, padding: "4px 12px", background: "rgba(255,255,255,0.035)", borderRadius: 12, color: DK.textMuted }}>{children}</span>;

// Practice Visual Background - one visual per session, opacity increases with progress
function PracticeVisual({ visualIndex, stepIndex, active }) {
  if (!active) return null;

  const VisualComponent = PRACTICE_VISUALS[visualIndex % PRACTICE_VISUALS.length];

  // Opacity: starts at 0.1, increases to 0.6 by the final step
  const progress = stepIndex / (STEPS.length - 1);
  const visualOpacity = 0.1 + progress * 0.5;

  // Overlay darkness: starts heavy, gets lighter as you progress
  const overlayBase = 0.85 - progress * 0.25;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 0,
      overflow: "hidden"
    }}>
      {/* The visual */}
      {VisualComponent && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: visualOpacity,
          transition: "opacity 1.5s ease-in-out",
          zIndex: 1
        }}>
          <VisualComponent />
        </div>
      )}

      {/* Dark overlay for readability - gets lighter as you progress */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `linear-gradient(to bottom, rgba(8,8,11,${overlayBase}) 0%, rgba(8,8,11,${overlayBase + 0.05}) 100%)`,
        transition: "background 1.5s ease",
        zIndex: 2
      }} />
    </div>
  );
}

export default function JhanaApp() {
  const [view, setView] = useState("home");
  const [sel, setSel] = useState(0);
  const [pa, setPa] = useState(false);
  const [ps, setPs] = useState(0);
  const [em, setEm] = useState(null);
  const [es, setEs] = useState(null);
  const [practiceVisual, setPracticeVisual] = useState(0); // Cycles through visuals each session
  const goHome = () => { setView("home"); setPa(false); };

  if (view === "home") return (
    <Page>
      <div style={{ textAlign: "center", padding: "3rem 0 2rem" }}>
        <div style={{ marginBottom: 22 }}>
          <svg width="52" height="52" viewBox="0 0 64 64">
            {[0,1,2,3].map(i => <circle key={i} cx="32" cy="32" r={8+i*6} fill="none" stroke={JHANAS[i].color} strokeWidth={0.6} opacity={0.35+i*0.08} />)}
            <circle cx="32" cy="32" r="2" fill={DK.accent} opacity={0.7} />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 6px" }}>Entering the jhanas</h1>
        <p style={{ fontSize: 13, color: DK.textMuted, margin: 0, lineHeight: 1.5 }}>A guided practice for the attention-pleasure feedback loop</p>
      </div>

      <Card style={{ cursor: "default", borderLeft: `2px solid ${DK.accent}40`, borderRadius: "0 12px 12px 0", marginBottom: 22 }}>
        <p style={{ fontSize: 10, color: DK.textDim, margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Core insight</p>
        <p style={{ fontSize: 13, color: DK.text, margin: 0, lineHeight: 1.7, opacity: 0.85 }}>
          Jhana isn't about concentrating harder — it's about relaxing into stability. Concentration comes from relaxation, not the other way around. If it feels like work, you're not yet moving in the right direction.
        </p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 26 }}>
        {[{ k:"map",t:"The map",s:"9 jhana states",i:"◎" },{ k:"method",t:"The method",s:"14-step practice",i:"→" },{ k:"mistakes",t:"Common mistakes",s:"6 traps to avoid",i:"△" },{ k:"practice",t:"Practice",s:"Guided session",i:"●" }].map(x =>
          <Card key={x.k} onClick={() => setView(x.k)}>
            <div style={{ fontSize: 16, marginBottom: 7, opacity: 0.3 }}>{x.i}</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{x.t}</div>
            <div style={{ fontSize: 11, color: DK.textMuted }}>{x.s}</div>
          </Card>
        )}
      </div>

      <div style={{ padding: "1.5rem 0", borderTop: `0.5px solid ${DK.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>The mechanism</h2>
        <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: "0 0 14px" }}>Think of a panic attack in reverse. In anxiety, worry captures attention, attention amplifies worry, and the cycle escalates. Jhana works identically — but on pleasure instead of fear.</p>
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          {["Attention settles","→","Pleasure increases","→","Attention deepens","→","Loop takes off"].map((t,i) =>
            t === "→" ? <span key={i} style={{ color: DK.textDim, fontSize: 12 }}>→</span> : <Chip key={i}>{t}</Chip>
          )}
        </div>
      </div>

      <div style={{ padding: "1.5rem 0", borderTop: `0.5px solid ${DK.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>The guesswork problem</h2>
        <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: "0 0 10px" }}>Most meditation gives you a starting set of steps — follow the breath, quiet the mind — and the idea is that you just follow them until something happens. In every other skill domain, you get feedback along the way. In meditation, nobody can see inside your head. So your feedback loops get corrupted with guesswork.</p>
        <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: "0 0 10px" }}>Without feedback, the natural assumption is to try harder. But trying harder creates tension — the exact opposite of what deeper states require. 90% of meditators are grappling with this without knowing it has a name.</p>
        <p style={{ fontSize: 12, color: DK.text, lineHeight: 1.7, margin: 0, opacity: 0.8, fontStyle: "italic" }}>Jhana practice solves this: pleasant absorption is the compass. If you're not moving toward it, change something. If you are, continue.</p>
      </div>

      <div style={{ padding: "1.5rem 0", borderTop: `0.5px solid ${DK.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>Why enjoyment comes first</h2>
        <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: "0 0 10px" }}>Standard meditation asks you to follow something neutral — the breath, a body scan. Neutral is often boring. If it's boring, the mind wanders. That's your nervous system doing exactly what it's designed to do. It's not a character flaw.</p>
        <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: 0 }}>Good technique starts with what makes things enjoyable. Find the subtle things in your experience you may never have noticed before. Be like Sherlock Holmes on the hunt, following the good clues. Playfully run experiments. When you do, this puzzle can blow open on you in a way that pulls you into extraordinary states.</p>
      </div>

      <div style={{ padding: "1.5rem 0", borderTop: `0.5px solid ${DK.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>The deeper purpose</h2>
        <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: "0 0 10px" }}>Bliss isn't the point. Meditation offers a way to see how you treat yourself at a level faster than thought — before you can even verbalize what's happening. You might discover you're a compassionate coach, or a vicious critic. Jhana gives you the safety to look.</p>
        <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: "0 0 10px" }}>Through memory reconsolidation, jhana creates conditions to rewrite emotional defaults: reactivate a charged memory while holding overwhelming safety or love, and the two wash over each other, resetting the default response. Knowing you can reset your emotional defaults is one of the most underappreciated secrets in the world.</p>
        <p style={{ fontSize: 12, color: DK.text, lineHeight: 1.7, margin: 0, opacity: 0.8, fontStyle: "italic" }}>Altered states alter traits. The temporary states, practiced repeatedly, become the permanent change.</p>
      </div>

      <div style={{ padding: "1.5rem 0", borderTop: `0.5px solid ${DK.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 14px" }}>Key principles</h2>
        {[{ p:"Relaxation over effort", d:"You relax first, and focus emerges as a side effect." },{ p:"Feeling over technique", d:"Focus on the emotional experience in the body." },{ p:"Play over strain", d:"Flow states are innately human — you've touched them in play, music, love." },{ p:"Curiosity over self-criticism", d:"Reflect like a scientist, play like a child." },{ p:"Holding goals without striving", d:"You can want a jhana. The game is how you relate to that goal — with play and openness, not desperation." }].map((x,i) =>
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 2.5, minHeight: "100%", borderRadius: 2, background: JHANAS[i].color, opacity: 0.35, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{x.p}</div>
              <div style={{ fontSize: 11, color: DK.textMuted, lineHeight: 1.5 }}>{x.d}</div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );

  if (view === "map") { const j = JHANAS[sel]; return (
    <Page>
      <Back fn={goHome} />
      <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>The map</h1>
      <p style={{ fontSize: 12, color: DK.textMuted, margin: "0 0 16px" }}>Nine states from euphoria to cessation. Tap to explore.</p>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 18 }}>
        {JHANAS.map((jh, i) => <button key={i} onClick={() => setSel(i)} style={{ padding: "4px 12px", borderRadius: 14, fontSize: 11, fontWeight: 500, border: `0.5px solid ${i === sel ? jh.color + "55" : DK.border}`, background: i === sel ? `${jh.color}12` : "transparent", color: i === sel ? jh.color : DK.textMuted, cursor: "pointer", transition: "all 0.2s" }}>J{jh.id}</button>)}
      </div>
      <Card style={{ cursor: "default", borderTop: `2px solid ${j.color}35` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 500, margin: "0 0 2px" }}>J{j.id} — {j.name}</h2>
            <p style={{ fontSize: 11, color: DK.textMuted, margin: 0 }}>{j.quality}</p>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${j.color}0C`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: j.color, opacity: 0.6 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
          {[["Metaphor", j.metaphor],["Felt sense", j.feel]].map(([l,v],i) =>
            <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: "7px 10px" }}>
              <div style={{ fontSize: 9, color: DK.textDim, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.6 }}>{l}</div>
              <div style={{ fontSize: 11, color: DK.text, opacity: 0.8 }}>{v}</div>
            </div>
          )}
        </div>
        {j.id <= 4 && <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: "7px 10px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: DK.textDim, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.6 }}>Body location</div>
          <div style={{ fontSize: 11, color: DK.text, opacity: 0.8 }}>{j.body}</div>
        </div>}
        <p style={{ fontSize: 12, color: DK.text, lineHeight: 1.7, margin: "0 0 12px", opacity: 0.8 }}>{j.desc}</p>
        {j.transition && <div style={{ borderTop: `0.5px solid ${DK.border}`, paddingTop: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: DK.textMuted, marginBottom: 4 }}>Transition to J{j.id + 1}</div>
          <p style={{ fontSize: 11, color: DK.textMuted, lineHeight: 1.6, margin: 0 }}>{j.transition}</p>
        </div>}
      </Card>
      {sel === 3 && <div style={{ textAlign: "center", padding: "18px 0", color: DK.textDim, fontSize: 10, letterSpacing: 1.5 }}>── form · formless ──</div>}
      <div style={{ display: "flex", justifyContent: "center", padding: "18px 0" }}><JhanaRings sel={sel} /></div>
    </Page>
  ); }

  if (view === "method") return (
    <Page>
      <Back fn={goHome} />
      <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>The method</h1>
      <p style={{ fontSize: 12, color: DK.textMuted, margin: "0 0 4px", lineHeight: 1.6 }}>Jhourney's approach in six steps. The entire method reduces to two instructions: bring up an open-hearted feeling, then relax into it.</p>
      <p style={{ fontSize: 11, color: DK.textDim, margin: "0 0 18px", fontStyle: "italic" }}>Tap any step to expand.</p>
      {STEPS.map((st, i) => { const open = es === i; return (
        <Card key={i} onClick={() => setEs(open ? null : i)} style={{ marginBottom: 6, borderLeft: open ? `2px solid ${JHANAS[i].color}40` : `0.5px solid ${DK.border}`, borderRadius: open ? "0 12px 12px 0" : 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${JHANAS[i].color}0C`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, color: JHANAS[i].color, opacity: 0.7 }}>{st.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{i + 1}. {st.title}</div>
              <div style={{ fontSize: 11, color: DK.textMuted }}>{st.subtitle}</div>
            </div>
            <span style={{ fontSize: 9, color: DK.textDim, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
          </div>
          {open && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${DK.border}` }}>
            <p style={{ fontSize: 12, color: DK.text, lineHeight: 1.7, margin: 0, opacity: 0.8 }}>{st.text}</p>
          </div>}
        </Card>
      ); })}
      <div style={{ marginTop: 22, padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: DK.textDim, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.8 }}>The law of reversed effort</p>
        <p style={{ fontSize: 12, color: DK.text, lineHeight: 1.7, margin: 0, opacity: 0.75 }}>You cannot force your way into jhana. The more desperately you pursue it, the further away it gets. They're like trying to catch a butterfly — run after it and it will flee. Stay still, and it will alight upon you.</p>
      </div>
      <div style={{ marginTop: 22 }}>
        <h3 style={{ fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>Common scaffolds</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {["A cherished memory","Someone you love being happy","A soft smile","Gratitude meditation","A warm mantra","Any pleasant body sensation"].map((s,i) => <Chip key={i}>{s}</Chip>)}
        </div>
      </div>
    </Page>
  );

  if (view === "mistakes") return (
    <Page>
      <Back fn={goHome} />
      <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>Common mistakes</h1>
      <p style={{ fontSize: 12, color: DK.textMuted, margin: "0 0 18px", lineHeight: 1.6 }}>Based on watching over a thousand people learn — and the patterns that keep them stuck.</p>
      {MISTAKES.map((m, i) => { const open = em === i; return (
        <Card key={i} onClick={() => setEm(open ? null : i)} style={{ marginBottom: 8, borderLeft: `2px solid ${m.color}35`, borderRadius: "0 12px 12px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{m.title}</div>
              <div style={{ fontSize: 11, color: DK.accent, opacity: 0.75 }}>{m.fix}</div>
            </div>
            <span style={{ fontSize: 9, color: DK.textDim, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0, marginTop: 3 }}>▶</span>
          </div>
          {open && <p style={{ fontSize: 12, color: DK.textMuted, lineHeight: 1.7, margin: "10px 0 0", paddingTop: 10, borderTop: `0.5px solid ${DK.border}` }}>{m.desc}</p>}
        </Card>
      ); })}
      <div style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 14px" }}>What progress looks like</h2>
        <p style={{ fontSize: 11, color: DK.textDim, margin: "0 0 12px" }}>Assuming daily practice. The trend matters more than any single sit.</p>
        {[{ p:"First weeks", d:"You can find a feeling reliably. Sits feel restorative. Thirty minutes feels manageable." },{ p:"First months", d:"Occasionally you slip into flow. Bleed-through into daily life: more patience, less reactivity. Jhana may happen — it will have distinct momentum and afterglow." },{ p:"Later", d:"Jhana access reliable in 20–60 minutes. Afterglows linger between sits. You can subtly move toward jhana throughout the day." }].map((x,i) =>
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: JHANAS[i+1].color, opacity: 0.5 }} />
              {i < 2 && <div style={{ width: 0.5, flex: 1, background: DK.border }} />}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{x.p}</div>
              <div style={{ fontSize: 11, color: DK.textMuted, lineHeight: 1.6 }}>{x.d}</div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );

  if (view === "practice") return (
    <>
      {/* Visual background layer - one visual per session, brightens as you progress */}
      <PracticeVisual visualIndex={practiceVisual} stepIndex={ps} active={pa} />

      <Page>
        <div style={{ position: "relative", zIndex: 10 }}>
          <Back fn={() => { setPa(false); setPs(0); goHome(); }} />
          {!pa ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 6px" }}>Practice session</h1>
              <p style={{ fontSize: 12, color: DK.textMuted, margin: "0 0 26px", lineHeight: 1.6 }}>A gentle guided container. The breathing circle helps you settle into deep relaxation. As you progress, the visual world evolves with your journey.</p>
              <div style={{ marginBottom: 26, padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, textAlign: "left" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: DK.textDim, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.8 }}>Before you begin</p>
                <p style={{ fontSize: 12, color: DK.text, lineHeight: 1.7, margin: 0, opacity: 0.75 }}>Find a comfortable position. Sit or lie down — whatever lets you be deeply relaxed while alert. Close your eyes when ready. If you feel strain, try half as hard. Then half as hard again.</p>
              </div>
              <button onClick={() => { setPa(true); setPs(0); setPracticeVisual(v => v + 1); }} style={{ padding: "10px 40px", borderRadius: 20, fontSize: 13, fontWeight: 500, border: "none", background: `${DK.accent}18`, color: DK.accent, cursor: "pointer", letterSpacing: 0.3 }}>Begin</button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              {/* Breathing lava - visible throughout, gently fades as you deepen */}
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", opacity: Math.max(0.4, 1 - ps * 0.04), transition: "opacity 1s ease" }}>
                <BreathingLava active={pa} />
              </div>

              {/* Step indicator with visual name */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: DK.textDim, textTransform: "uppercase", letterSpacing: 1.2 }}>
                  Step {ps + 1} of {STEPS.length}
                </span>
              </div>

              {/* Step content */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, opacity: 0.4 }}>{STEPS[ps].icon}</span>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>{STEPS[ps].title}</div>
                </div>
                <div style={{ fontSize: 12, color: DK.accent, marginBottom: 12, opacity: 0.7 }}>{STEPS[ps].subtitle}</div>
                <p style={{ fontSize: 14, color: DK.text, lineHeight: 1.8, margin: "0 auto", maxWidth: 440, opacity: 0.9 }}>{STEPS[ps].text}</p>
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 18 }}>
                {STEPS.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setPs(i)}
                    style={{
                      width: i === ps ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      border: "none",
                      padding: 0,
                      background: i === ps ? DK.accent : i < ps ? `${DK.accent}50` : `${DK.accent}20`,
                      cursor: "pointer",
                      transition: "all 0.4s ease"
                    }}
                  />
                ))}
              </div>


              {/* Navigation buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                {ps > 0 && (
                  <button
                    onClick={() => setPs(p => p - 1)}
                    style={{
                      padding: "9px 20px",
                      borderRadius: 18,
                      fontSize: 12,
                      border: `0.5px solid ${DK.border}`,
                      background: "rgba(255,255,255,0.02)",
                      color: DK.textMuted,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    ← Previous
                  </button>
                )}
                {ps < STEPS.length - 1 && (
                  <button
                    onClick={() => setPs(p => p + 1)}
                    style={{
                      padding: "9px 24px",
                      borderRadius: 18,
                      fontSize: 12,
                      fontWeight: 500,
                      border: `0.5px solid ${DK.accent}35`,
                      background: `${DK.accent}12`,
                      color: DK.accent,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Next →
                  </button>
                )}
                <button
                  onClick={() => { setPa(false); setPs(0); }}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 18,
                    fontSize: 12,
                    border: `0.5px solid ${DK.border}`,
                    background: "transparent",
                    color: DK.textDim,
                    cursor: "pointer"
                  }}
                >
                  End session
                </button>
              </div>

            </div>
          )}
        </div>
      </Page>
    </>
  );

  return null;
}
