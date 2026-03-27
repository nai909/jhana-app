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
  {
    title: "Prepare",
    subtitle: "Relax deeply",
    icon: "○",
    visual: "arbor-mundi",
    detail: "Sit comfortably or lie down. Try to fall asleep, but stop just before you do. Reach a level of physical relaxation you've never experienced while remaining alert. Deep bodily ease with mental clarity.",
    expanded: "The goal is not trance — it's deep bodily ease with mental clarity. One practical hack: try to fall asleep but stop just before you actually do. This helps you reach a level of physical relaxation most people have never experienced while remaining alert. Clear your mind of distractions. Let the roots of your attention sink down into stillness."
  },
  {
    title: "Feel",
    subtitle: "Find your scaffold",
    icon: "♡",
    visual: "corpus-stellae",
    detail: "Think of someone you love. A memory of pure joy. A phrase invoking warmth. Focus not on the thought, but on what it does to your body — the warmth in your chest, the subtle expansion. That embodied signature is your meditation object.",
    expanded: "The scaffolding itself is not your meditation object — the feeling it generates is. You're not focusing on the thought; you're focusing on the emotion, especially its embodied signature. Think of someone you love, then notice what happens in your chest, head, or gut. That warmth, that subtle expansion — that's your object. Not the person, but what thinking about them does to your body. Feel the energy channels begin to open."
  },
  {
    title: "Sustain",
    subtitle: "Pulse and glide",
    icon: "◐",
    visual: "templum-sonorum",
    detail: "Pulse: gently re-invoke the scaffolding for 5–30 seconds. Glide: let the feeling resonate without effort. When it fades, notice that fade — it may be an invitation to relax deeper. The glide is where the magic happens.",
    expanded: "Once you have a feeling, the instinct is to grip it. Don't. Pulse means gently re-invoking the scaffolding. Glide means letting the feeling resonate without effort. The biggest mistake is stacking pulses frantically because you're afraid of losing the feeling. The glide is where the magic happens. Think of it like a sneeze — it requires some intentionality, but only happens if you don't think too hard about it. Let the resonance build like sound waves in a temple."
  },
  {
    title: "Deepen",
    subtitle: "Three questions",
    icon: "◇",
    visual: "aqua-vitae",
    detail: "Can I relax more? Can I enjoy this more? Can I bring more wonder to this? One elegant move: how would it feel to give the feeling away? Joy is often a byproduct of generosity.",
    expanded: "When you have a feeling established, three questions open pathways into depth. Can I relax more? (Check for tension you might be adding.) Can I enjoy this more? (Are you actually receiving, or just observing?) Can I bring more wonder to this? (Interest without agenda.) One particularly elegant move that blends all three: how would it feel to give the feeling away? This is a pointer to a subtle way of relating to experience. Let yourself flow deeper, like water finding its level."
  },
  {
    title: "Enter",
    subtitle: "Allow the loop",
    icon: "◉",
    visual: "crystallum-infinitum",
    detail: "Allow the joy to grow and loop upon itself. If it dissipates, pulse again. Don't think too much. When euphoria hits — hands tingling, chest buzzing — you're in J1. It has a distinct momentum, magnitude, and afterglow.",
    expanded: "Allow the joy to grow and loop upon itself, feeling more and more joyful. Once pulsing and gliding reliably result in a feeling, see if you can allow the feeling to grow by feeding on itself — extend gratitude toward gratitude, or joyfully celebrate your joy. This is the attention-pleasure feedback loop beginning to take hold. If it dissipates, pulse again. Don't think too much. When euphoria hits — hands and chest may tingle — you're entering J1. It will have a distinct type of momentum, magnitude, and afterglow. Let the clarity crystallize."
  },
  {
    title: "Progress",
    subtitle: "Stay, don't push",
    icon: "∞",
    visual: "porta-dimensionum",
    detail: "To progress through J2–J4: stay in the current state, be present, don't try to change it. It will evolve on its own. Notice how it changes until you find yourself in a qualitatively different state.",
    expanded: "To progress from J1 to J2, do not try to force anything. Stay in the moment and enjoy the sensation. If it does not dissipate, it will begin to evolve on its own. Notice how it is changing until you find yourself in a qualitatively different state. Repeat to progress further: stay with the current state, be present, don't try to change or interact with it. The door opens before you — not through effort, but through allowing. You are being pulled, not pushed."
  },
];

// Map steps to visual scenes for the progressive journey
const STEP_VISUALS = {
  "arbor-mundi": ArborMundi,        // Grounding, roots, settling
  "corpus-stellae": CorpusStellae,   // Body awareness, energy channels
  "templum-sonorum": TemplumSonorum, // Resonance, waves, rhythm
  "aqua-vitae": AquaVitae,           // Flowing deeper, releasing
  "crystallum-infinitum": CrystallumInfinitum, // Clarity crystallizing
  "porta-dimensionum": PortaDimensionum, // Opening to vastness
};

const MISTAKES = [
  { title: "Over-efforting", fix: "Try half as hard. Then half as hard again.", desc: "Practice feels like work. Subtle strain in forehead or jaw. You're concentrating at the experience rather than resting in it. There exists a level of non-effort most people have never experienced while remaining alert.", color: "#E24B4A" },
  { title: "Sensation-hunting", fix: "You're not scanning for a sensation. You're becoming it.", desc: "You're scanning the body for 'the right feeling.' It feels clinical. Emotions live in the body but they're not just sensations — there's a felt quality that raw tracking doesn't capture.", color: "#378ADD" },
  { title: "Scaffolding goes flat", fix: "Stay with it. This is exactly the skill you're building.", desc: "Your scaffolding worked, then stopped. This is progress — the novelty bonus faded. Now learn to relate appreciatively without the extra buzz. Find enjoyment in subtler territory.", color: "#EF9F27" },
  { title: "Relaxing away, not into", fix: "The emotion doesn't need to disappear. Your war with it does.", desc: "Negative emotion arises and you try to relax it away. Instead, relax into it — allow it fully with less resistance. This distinction is subtle and usually invisible to the person making it.", color: "#9B8EC4" },
  { title: "Following something boring", fix: "If the mind wanders, the anchor might be the problem — not you.", desc: "Standard meditation asks you to follow something neutral like the breath. Neutral is often boring. If it's boring, the mind wanders. That's your nervous system doing exactly what it's designed to do — not a character flaw. Find an anchor that's genuinely pleasant.", color: "#6BC5D2" },
  { title: "Blaming yourself", fix: "It wasn't you. It was never you. It was your technique.", desc: "After hitting the guesswork problem, trying harder, and watching your mind wander — most people blame themselves. They think they're a failure at meditation. But the problem was always structural: no feedback, a boring anchor, and effort where relaxation was needed. You're not broken. You were using broken instructions.", color: "#D4537E" },
];

function BreathCircle({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 280 * dpr; canvas.height = 280 * dpr; ctx.scale(dpr, dpr);
    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const phases = [
        { name: "inhale", dur: 4 },
        { name: "pause", dur: 1 },
        { name: "exhale", dur: 7 },
        { name: "rest", dur: 1 },
      ];
      const totalCycle = 13;
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

      const rMin = 38, rMax = 100;
      const r = rMin + bp * (rMax - rMin);
      ctx.clearRect(0, 0, 280, 280);
      for (let i = 3; i >= 0; i--) { ctx.beginPath(); ctx.arc(140, 140, r + i * 18, 0, Math.PI * 2); ctx.fillStyle = `rgba(107,197,210,${0.025 - i * 0.005})`; ctx.fill(); }
      ctx.beginPath(); ctx.arc(140, 140, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(107,197,210,${0.04 + bp * 0.06})`; ctx.fill();
      ctx.strokeStyle = `rgba(107,197,210,${0.18 + bp * 0.35})`; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(140, 140, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(107,197,210,${0.35 + bp * 0.5})`; ctx.fill();
      ctx.font = "500 11px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(107,197,210,0.4)"; ctx.fillText(phases[phaseIdx].name, 140, 140 + rMax + 30);
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); startRef.current = null; };
  }, [active]);
  return <canvas ref={canvasRef} style={{ width: 280, height: 280 }} />;
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

// Scene components map
const SCENE_COMPONENTS = {
  "labyrinthus-sacrum": LabyrinthusScrum,
  "templum-sonorum": TemplumSonorum,
  "porta-dimensionum": PortaDimensionum,
  "nervus-cosmicus": NervusCosmicus,
  "corpus-stellae": CorpusStellae,
  "crystallum-infinitum": CrystallumInfinitum,
  "aqua-vitae": AquaVitae,
  "arbor-mundi": ArborMundi,
  "caelum-mechanicum": CaelumMechanicum,
  "oceanus-profundus": OceanusProfundus,
  "machina-temporis": MachinaTemporis,
};

// Gaze Scene Wrapper with Back Button
function GazeSceneWrapper({ sceneId, onBack }) {
  const SceneComponent = SCENE_COMPONENTS[sceneId];

  if (!SceneComponent) {
    return <div style={{ color: "#fff", padding: 20 }}>Scene not found</div>;
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}>
      <SceneComponent />
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.6)",
          border: "0.5px solid rgba(78,205,196,0.3)",
          borderRadius: 8,
          color: "rgba(78,205,196,0.7)",
          padding: "10px 20px",
          fontSize: 13,
          cursor: "pointer",
          zIndex: 10001,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "0.05em"
        }}
      >
        ← Back
      </button>
    </div>
  );
}

// Practice Visual Background - renders the visual for the current step with crossfade
function PracticeVisual({ stepIndex, active }) {
  const [prevStep, setPrevStep] = useState(stepIndex);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (stepIndex !== prevStep && active) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setPrevStep(stepIndex);
        setTransitioning(false);
      }, 800); // Crossfade duration
      return () => clearTimeout(timer);
    }
  }, [stepIndex, prevStep, active]);

  if (!active) return null;

  const currentVisualId = STEPS[stepIndex]?.visual;
  const prevVisualId = STEPS[prevStep]?.visual;
  const CurrentVisual = STEP_VISUALS[currentVisualId];
  const PrevVisual = STEP_VISUALS[prevVisualId];

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
      {/* Previous visual (fading out) */}
      {transitioning && PrevVisual && prevVisualId !== currentVisualId && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.8s ease-out",
          zIndex: 1
        }}>
          <PrevVisual />
        </div>
      )}

      {/* Current visual */}
      {CurrentVisual && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: transitioning ? 0 : 0.35,
          transition: "opacity 0.8s ease-in",
          zIndex: 2
        }}>
          <CurrentVisual />
        </div>
      )}

      {/* Dark overlay for readability */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(to bottom, rgba(8,8,11,0.75) 0%, rgba(8,8,11,0.85) 50%, rgba(8,8,11,0.9) 100%)",
        zIndex: 3
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
  const [gazeScene, setGazeScene] = useState(0);
  const goHome = () => { setView("home"); setPa(false); };

  const SCENES = [
    { id: "labyrinthus-sacrum", name: "Labyrinthus Sacrum", desc: "Sacred labyrinth, rose window, spiral stairs, mandala ceiling", color: "#4ecdc4" },
    { id: "templum-sonorum", name: "Templum Sonorum", desc: "Singing bowl, Chladni patterns, circle of fifths, harmonic overtones", color: "#d4537e" },
    { id: "porta-dimensionum", name: "Porta Dimensionum", desc: "Toroidal gateway, tesseract, wormhole tunnel, spacetime grid", color: "#9b8ec4" },
    { id: "nervus-cosmicus", name: "Nervus Cosmicus", desc: "Neural network, synaptic connections, dendrite fractals, thought-waves", color: "#7fffe5" },
    { id: "corpus-stellae", name: "Corpus Stellae", desc: "Vitruvian body, chakra points, spiral galaxy crown, energy channels", color: "#d4a853" },
    { id: "crystallum-infinitum", name: "Crystallum Infinitum", desc: "Nested platonic solids, crystal growth, light refraction, geode", color: "#8bd4c4" },
    { id: "aqua-vitae", name: "Aqua Vitae", desc: "Water surface, molecular structures, vortex spirals, fountain", color: "#4ecdc4" },
    { id: "arbor-mundi", name: "Arbor Mundi", desc: "World tree, roots, branches, serpent, runic symbols, celestial crown", color: "#5dca70" },
    { id: "caelum-mechanicum", name: "Caelum Mechanicum", desc: "Armillary sphere, planetary orbits, zodiac wheel, eclipse mechanisms", color: "#6b8fd4" },
    { id: "oceanus-profundus", name: "Oceanus Profundus", desc: "Jellyfish cathedral, nautilus shell, coral reef, thermal vents", color: "#2a9d8f" },
    { id: "machina-temporis", name: "Machina Temporis", desc: "Gear trains, hourglass, pendulum, astronomical dials, escapement", color: "#c4a87b" },
  ];

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
        {[{ k:"map",t:"The map",s:"9 jhana states",i:"◎" },{ k:"method",t:"The method",s:"6-step practice",i:"→" },{ k:"mistakes",t:"Common mistakes",s:"6 traps to avoid",i:"△" },{ k:"practice",t:"Practice",s:"Guided session",i:"●" },{ k:"gaze",t:"Gaze",s:"11 wireframe worlds",i:"◇" }].map(x =>
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
            <p style={{ fontSize: 12, color: DK.text, lineHeight: 1.7, margin: 0, opacity: 0.8 }}>{st.detail}</p>
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
      {/* Visual background layer */}
      <PracticeVisual stepIndex={ps} active={pa} />

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
              <button onClick={() => { setPa(true); setPs(0); }} style={{ padding: "10px 40px", borderRadius: 20, fontSize: 13, fontWeight: 500, border: "none", background: `${DK.accent}18`, color: DK.accent, cursor: "pointer", letterSpacing: 0.3 }}>Begin</button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              {/* Breathing circle - fades as you progress deeper */}
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", opacity: ps === 0 ? 1 : Math.max(0, 1 - ps * 0.35), transition: "opacity 1s ease", pointerEvents: ps > 1 ? "none" : "auto" }}>
                {ps <= 2 && <BreathCircle active={pa} />}
              </div>
              {ps > 2 && <div style={{ height: 40 }} />}

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
                <p style={{ fontSize: 13, color: DK.text, lineHeight: 1.8, margin: "0 auto", maxWidth: 480, opacity: 0.85 }}>{STEPS[ps].expanded}</p>
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 18 }}>
                {STEPS.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setPs(i)}
                    style={{
                      width: i === ps ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      border: "none",
                      padding: 0,
                      background: i === ps ? JHANAS[i].color : `${JHANAS[i].color}25`,
                      cursor: "pointer",
                      transition: "all 0.4s ease"
                    }}
                  />
                ))}
              </div>

              {/* Three questions reminder for deepen stage */}
              {ps >= 3 && ps < 5 && (
                <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
                  {["Can I relax more?", "Can I enjoy this more?", "Can I bring more wonder?"].map((q, i) => (
                    <Chip key={i}>{q}</Chip>
                  ))}
                </div>
              )}

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
                      border: `0.5px solid ${JHANAS[ps + 1].color}35`,
                      background: `${JHANAS[ps + 1].color}12`,
                      color: JHANAS[ps + 1].color,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Next step →
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

  if (view === "gaze") return (
    <Page>
      <Back fn={goHome} />
      <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>Gaze</h1>
      <p style={{ fontSize: 12, color: DK.textMuted, margin: "0 0 20px", lineHeight: 1.6 }}>Wireframe worlds to rest your eyes on. No objectives — just continuous gentle motion.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {SCENES.map((s, i) => (
          <Card key={s.id} onClick={() => { setGazeScene(i); setView("gaze-scene"); }} style={{ borderLeft: `2px solid ${s.color}25`, borderRadius: "0 12px 12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${s.color}0C`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, opacity: 0.5 }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: DK.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: DK.textMuted }}>{s.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );

  if (view === "gaze-scene") {
    const scene = SCENES[gazeScene];
    return <GazeSceneWrapper sceneId={scene.id} onBack={() => setView("gaze")} />;
  }

  return null;
}
