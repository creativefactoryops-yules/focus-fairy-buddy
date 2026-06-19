import React, { useEffect, useRef, useState } from "react";

const RAINBOW_TRACK = "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3";

const STEPS = [
  { icon: "💜", title: "Welcome, friend",
    body: "Body Double is a cozy pixel room with a friend + their cat Mochi. They body-double with you while you work — focus feels lighter when you're not alone.",
    action: "Begin tour" },
  { icon: "🧠", title: "Focus sessions, gentle breaks",
    body: "Pick 15/25/45/60 min. Break reminders pop at 25/50/75/90% so time-blindness doesn't sneak up on you.",
    action: "Got it" },
  { icon: "🎨", title: "Make it yours",
    body: "Tap 🎨 Customize to change hair, outfit, skin, accessories, facial hair, Mochi's coat. Toggle 👧/👦 anytime. Drag any item — your room saves.",
    action: "Cool" },
  { icon: "📞", title: "Call or text a friend",
    body: "Loneliness hits hard. Tap the rotary phone to call or text a real contact from your phone book — opens your device's dialer.",
    action: "Nice" },
  { icon: "🎵", title: "Vibes + Mochi",
    body: "Pick a theme. Tap ▶ Play to enable music. Tap Mochi or your friend for a little 💜. Ready?",
    action: "Let's go 💜" },
];

function meowViaAudio(ctx: AudioContext) {
  const t0 = ctx.currentTime;
  const dur = 0.5;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(620, t0);
  o.frequency.exponentialRampToValueAtTime(880, t0 + 0.18);
  o.frequency.exponentialRampToValueAtTime(380, t0 + dur);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 6;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.25, t0 + 0.05);
  g.gain.linearRampToValueAtTime(0.18, t0 + 0.3);
  g.gain.linearRampToValueAtTime(0, t0 + dur);
  o.connect(filter); filter.connect(g); g.connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  const startMusic = async () => {
    setStarted(true);
    try {
      const a = new Audio(RAINBOW_TRACK);
      a.loop = true; a.volume = 0.4;
      audioRef.current = a;
      await a.play().catch(() => {});
    } catch {}
  };

  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);

  const finish = async () => {
    try { audioRef.current?.pause(); } catch {}
    try {
      const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        if (ctx.state === "suspended") await ctx.resume();
        meowViaAudio(ctx);
        setTimeout(() => ctx.close().catch(() => {}), 900);
      }
    } catch {}
    setTimeout(onComplete, 600);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:120, background:"linear-gradient(120deg,#a78bfa,#c084fc,#f472b6,#fb7185,#fbbf24,#34d399,#60a5fa,#a78bfa)", backgroundSize:"400% 400%", animation:"rainbowSky 18s ease infinite", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      {["🦄","🍀","🌈","✨","🦄","🍀"].map((e, i) => (
        <div key={i} style={{ position:"absolute", top:(8 + (i*13)%70) + "%", left:(5 + (i*17)%85) + "%", fontSize:22, opacity:0, animation:"unicornFloat " + (5 + (i%4)) + "s ease-in-out " + (i*0.7) + "s infinite", pointerEvents:"none" }}>{e}</div>
      ))}
      <div style={{ width:"100%", maxWidth:380, background:"rgba(15,10,25,0.85)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:20, padding:24, color:"#f1f5f9", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.6)", backdropFilter:"blur(14px)", position:"relative", zIndex:2 }}>
        <div style={{ fontSize:52, marginBottom:8 }}>{s.icon}</div>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#c084fc", marginBottom:6 }}>Onboarding · {step + 1}/{STEPS.length}</div>
        <h2 style={{ margin:"0 0 12px", fontSize:22, fontWeight:800 }}>{s.title}</h2>
        <p style={{ fontSize:14, lineHeight:1.55, color:"rgba(255,255,255,0.85)", margin:"0 0 18px" }}>{s.body}</p>
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:18 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height:6, borderRadius:3, background: i === step ? "#fff" : "rgba(255,255,255,0.3)", transition:"all 0.3s ease" }} />
          ))}
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          {!started && step === 0 && (
            <button onClick={startMusic} style={btn}>🎵 Play theme music</button>
          )}
          {step > 0 && <button onClick={() => setStep(step - 1)} style={btnGhost}>Back</button>}
          <button onClick={finish} style={btnGhost}>Skip</button>
          <button onClick={() => last ? finish() : setStep(step + 1)} style={btn}>
            {last ? s.action + " 🐱" : s.action + " →"}
          </button>
        </div>
        {started && step === 0 && (
          <div style={{ marginTop:10, fontSize:10, color:"rgba(255,255,255,0.55)" }}>♪ Theme playing — ends with Mochi's meow</div>
        )}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { padding:"10px 16px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#a78bfa,#7c3aed)", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer" };
const btnGhost: React.CSSProperties = { padding:"10px 14px", borderRadius:11, border:"1px solid rgba(255,255,255,0.3)", background:"transparent", color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer" };
