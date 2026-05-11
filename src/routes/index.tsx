import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  component: BodyDouble,
  head: () => ({
    meta: [
      { title: "Body Double · Focus with Yulia" },
      { name: "description", content: "A cozy ADHD body-doubling companion with a pixel girl, her cat Mochi, and a focus timer." },
    ],
  }),
});

const CSS = `
* { box-sizing:border-box; }
@keyframes breathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.97)} }
@keyframes type { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-1px)} 75%{transform:translateY(1px)} }
@keyframes headbob { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-3deg)} }
@keyframes armtype { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-8deg)} }
@keyframes catwalk { 0%{transform:translateX(0) scaleX(1)} 45%{transform:translateX(52px) scaleX(1)} 50%{transform:translateX(52px) scaleX(-1)} 95%{transform:translateX(0) scaleX(-1)} 100%{transform:translateX(0) scaleX(1)} }
@keyframes tailwag { 0%,100%{transform:rotate(-20deg) translateX(0)} 50%{transform:rotate(20deg) translateX(2px)} }
@keyframes cattail-still { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} }
@keyframes pounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes catblink { 0%,88%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.05)} }
@keyframes sitbob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1px)} }
@keyframes flicker { 0%,100%{opacity:1} 92%{opacity:0.85} 96%{opacity:1} 98%{opacity:0.9} }
@keyframes startwinkle { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
@keyframes floatnote { 0%{opacity:0;transform:translateY(0) rotate(-5deg)} 20%{opacity:1} 100%{opacity:0;transform:translateY(-28px) rotate(5deg)} }
@keyframes screenglow { 0%,100%{box-shadow:0 0 10px #4ade8066} 50%{box-shadow:0 0 18px #4ade8099} }
@keyframes fadein { from{opacity:0} to{opacity:1} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes slideup { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes raindrop { 0%{transform:translateY(-10px);opacity:0} 10%{opacity:0.6} 100%{transform:translateY(100vh);opacity:0} }
@keyframes lightning { 0%,100%{opacity:0} 2%,4%{opacity:0.15} 3%{opacity:0} }
@keyframes thoughtpop { 0%{opacity:0;transform:scale(0.5) translateY(4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
`;

const MOODS = [
  { id: "focus", label: "Focus", bg: "#0f1a0f", accent: "#4ade80", sky: "#0a150a", desc: "Deep work 🌿" },
  { id: "chill", label: "Chill", bg: "#0f0f1f", accent: "#818cf8", sky: "#090914", desc: "Easy flow 🌙" },
  { id: "storm", label: "Storm", bg: "#0d1117", accent: "#60a5fa", sky: "#080c12", desc: "Power ⚡" },
  { id: "cozy", label: "Cozy", bg: "#1a100a", accent: "#fb923c", sky: "#110900", desc: "Warm 🕯️" },
];

const MESSAGES = [
  "Still here with you 💜",
  "You're doing great!",
  "Keep going, almost there",
  "One task at a time",
  "I believe in you!",
  "This is our time 🧠",
  "Flow state loading...",
  "You've got this, Yulia",
];

function Stars({ count, accent }: { count: number; accent: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const top = (i * 37) % 60;
        const left = (i * 53) % 100;
        const delay = (i * 0.31) % 4;
        const size = i % 5 === 0 ? 2 : 1;
        return (
          <div key={i} style={{
            position: "absolute", top: top + "%", left: left + "%",
            width: size, height: size, borderRadius: "50%",
            background: i % 5 === 0 ? accent : "#fff",
            opacity: 0.3 + ((i * 7) % 50) / 100,
            animation: "startwinkle " + (2 + (i % 4) * 0.6) + "s ease-in-out " + delay + "s infinite",
          }} />
        );
      })}
    </div>
  );
}

function Rain() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 30 }, (_, i) => {
        const left = (i * 13) % 100;
        const delay = (i * 0.11) % 2;
        const dur = 0.6 + ((i * 7) % 40) / 100;
        return (
          <div key={i} style={{
            position: "absolute", top: 0, left: left + "%",
            width: 1, height: 10,
            background: "linear-gradient(to bottom, transparent, rgba(147,197,253,0.4))",
            animation: "raindrop " + dur + "s linear " + delay + "s infinite",
          }} />
        );
      })}
      <div style={{ position: "absolute", inset: 0, background: "rgba(147,197,253,0.02)", animation: "lightning 8s ease-in-out 2s infinite" }} />
    </div>
  );
}

function MusicNote({ accent, delay }: { accent: string; delay: number }) {
  return (
    <div style={{
      position: "absolute", fontSize: 10, color: accent, opacity: 0,
      animation: "floatnote 2.5s ease-out " + delay + "s infinite",
      pointerEvents: "none",
    }}>♪</div>
  );
}

function PixelGirl({ isWorking, accent }: { isWorking: boolean; accent: string }) {
  const hairColor = "#2d1b69";
  const skinColor = "#f5c5a3";
  const shirtColor = accent;
  const pantsColor = "#374151";
  return (
    <div style={{ position: "relative", width: 38, height: 64, flexShrink: 0 }}>
      {!isWorking && (
        <div style={{
          position: "absolute", top: -22, right: -28,
          background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8, padding: "2px 6px", fontSize: 9, color: "#e2e8f0",
          animation: "thoughtpop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          whiteSpace: "nowrap", backdropFilter: "blur(4px)",
        }}>
          ☕ break!
        </div>
      )}
      <div style={{ position: "absolute", top: 0, left: 2, width: 34, height: 20, background: hairColor, borderRadius: "50% 50% 0 0", zIndex: 0 }} />
      <div style={{
        position: "absolute", top: 2, left: 5, width: 28, height: 24,
        background: skinColor, borderRadius: "45% 45% 40% 40%", zIndex: 1,
        animation: isWorking ? "headbob 2s ease-in-out infinite" : "breathe 3s ease-in-out infinite",
      }}>
        <div style={{ position: "absolute", top: 9, left: 5, width: 5, height: 5, background: "#1e1b4b", borderRadius: "50%", animation: "catblink 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: 9, right: 5, width: 5, height: 5, background: "#1e1b4b", borderRadius: "50%", animation: "catblink 4s ease-in-out 0.2s infinite" }} />
        <div style={{ position: "absolute", top: 9, left: 7, width: 2, height: 2, background: "white", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: 9, right: 7, width: 2, height: 2, background: "white", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", width: 8, height: 3, borderBottom: "2px solid #c87941", borderLeft: "1px solid #c87941", borderRight: "1px solid #c87941", borderRadius: "0 0 4px 4px" }} />
        <div style={{ position: "absolute", bottom: 7, left: 2, width: 6, height: 3, background: "rgba(255,150,120,0.35)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 7, right: 2, width: 6, height: 3, background: "rgba(255,150,120,0.35)", borderRadius: "50%" }} />
      </div>
      <div style={{ position: "absolute", top: 2, left: 3, width: 14, height: 10, background: hairColor, borderRadius: "50% 30% 40% 50%", zIndex: 2 }} />
      <div style={{ position: "absolute", top: 1, left: 16, width: 8, height: 7, background: hairColor, borderRadius: "30% 50% 50% 30%", zIndex: 2 }} />
      <div style={{ position: "absolute", top: 4, right: 0, width: 8, height: 16, background: hairColor, borderRadius: "40% 60% 60% 40%", zIndex: 0, transform: "rotate(10deg)", animation: "tailwag 3s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: 24, left: 4, width: 30, height: 20, background: shirtColor + "cc", borderRadius: "20% 20% 10% 10%", zIndex: 1, animation: "breathe 3s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: 26, left: 0, width: 6, height: 16, background: skinColor, borderRadius: 4, transformOrigin: "top center", animation: isWorking ? "armtype 0.4s ease-in-out infinite" : "breathe 3s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: 26, right: 0, width: 6, height: 16, background: skinColor, borderRadius: 4, transformOrigin: "top center", animation: isWorking ? "armtype 0.4s ease-in-out 0.2s infinite" : "breathe 3s ease-in-out 0.5s infinite" }} />
      <div style={{ position: "absolute", top: 42, left: 4, width: 30, height: 14, background: pantsColor, borderRadius: "0 0 8px 8px", zIndex: 1 }} />
      <div style={{ position: "absolute", top: 52, left: 6, width: 10, height: 12, background: pantsColor, borderRadius: "0 0 4px 4px" }} />
      <div style={{ position: "absolute", top: 52, right: 6, width: 10, height: 12, background: pantsColor, borderRadius: "0 0 4px 4px" }} />
      <div style={{ position: "absolute", top: 60, left: 4, width: 13, height: 5, background: "#111", borderRadius: "40% 40% 50% 50%" }} />
      <div style={{ position: "absolute", top: 60, right: 4, width: 13, height: 5, background: "#111", borderRadius: "40% 40% 50% 50%" }} />
    </div>
  );
}

function PixelCat({ accent, isWalking }: { accent: string; isWalking: boolean }) {
  const furColor = "#d4a0d4";
  const darkFur = "#9b6b9b";
  return (
    <div style={{
      position: "relative", width: 32, height: 28, flexShrink: 0,
      animation: isWalking ? "pounce 0.5s ease-in-out infinite" : "sitbob 4s ease-in-out infinite",
    }}>
      <div style={{ position: "absolute", top: 0, left: 3, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "8px solid " + furColor }} />
      <div style={{ position: "absolute", top: 0, right: 3, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "8px solid " + furColor }} />
      <div style={{ position: "absolute", top: 2, left: 5, width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderBottom: "5px solid " + darkFur + "66" }} />
      <div style={{ position: "absolute", top: 2, right: 5, width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderBottom: "5px solid " + darkFur + "66" }} />
      <div style={{ position: "absolute", top: 5, left: 2, width: 28, height: 18, background: furColor, borderRadius: "50% 50% 40% 40%", animation: "catblink 3.5s ease-in-out 1s infinite" }}>
        <div style={{ position: "absolute", top: 5, left: 5, width: 5, height: 5, background: accent, borderRadius: "50%", boxShadow: "0 0 4px " + accent }} />
        <div style={{ position: "absolute", top: 5, right: 5, width: 5, height: 5, background: accent, borderRadius: "50%", boxShadow: "0 0 4px " + accent }} />
        <div style={{ position: "absolute", top: 6, left: 7, width: 2, height: 4, background: "#0a0a0a", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 6, right: 7, width: 2, height: 4, background: "#0a0a0a", borderRadius: 1 }} />
        <div style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", width: 4, height: 3, background: "#f9a8d4", borderRadius: "40% 40% 50% 50%" }} />
        <div style={{ position: "absolute", top: 8, left: -8, width: 10, height: 1, background: darkFur + "88", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 11, left: -8, width: 10, height: 1, background: darkFur + "88", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 8, right: -8, width: 10, height: 1, background: darkFur + "88", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 11, right: -8, width: 10, height: 1, background: darkFur + "88", borderRadius: 1 }} />
      </div>
      <div style={{ position: "absolute", top: 18, left: 4, width: 24, height: 10, background: furColor, borderRadius: "30% 30% 50% 50%" }} />
      <div style={{
        position: "absolute", top: 14, right: -8, width: 10, height: 6,
        borderTop: "3px solid " + furColor, borderRight: "3px solid " + furColor,
        borderRadius: "0 50% 50% 0", transformOrigin: "left center",
        animation: isWalking ? "tailwag 0.4s ease-in-out infinite" : "cattail-still 2s ease-in-out infinite",
      }} />
      <div style={{ position: "absolute", bottom: 0, left: 4, width: 8, height: 5, background: furColor, borderRadius: "50% 50% 40% 40%", animation: isWalking ? "type 0.4s ease-in-out infinite" : "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: 4, width: 8, height: 5, background: furColor, borderRadius: "50% 50% 40% 40%", animation: isWalking ? "type 0.4s ease-in-out 0.2s infinite" : "none" }} />
    </div>
  );
}

function DeskScene({ mood, isWorking, accent }: { mood: string; isWorking: boolean; accent: string }) {
  const moodData = MOODS.find((m) => m.id === mood) || MOODS[0];
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: moodData.sky }} />
      <Stars count={25} accent={accent} />
      {mood === "storm" && <Rain />}
      <div style={{ position: "absolute", top: 12, right: 24, width: 20, height: 20, borderRadius: "50%", background: "#fef9c3", boxShadow: "0 0 12px rgba(254,249,195,0.5)", opacity: mood === "storm" ? 0.2 : 0.9 }} />
      <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 90, height: 75, border: "3px solid #4b3b2a", borderRadius: 4, overflow: "hidden", boxShadow: "inset 0 0 12px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", inset: 0, background: moodData.sky + "cc" }} />
        <Stars count={8} accent={accent} />
        {mood === "storm" && <Rain />}
        <div style={{ position: "absolute", top: 0, left: "50%", width: 2, height: "100%", background: "#4b3b2a" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 2, background: "#4b3b2a" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: "100%", background: "linear-gradient(to right, #7c3aed44, transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: "100%", background: "linear-gradient(to left, #7c3aed44, transparent)" }} />
      </div>
      <div style={{ position: "absolute", top: 70, left: "50%", marginLeft: 36, width: 14, height: 18 }}>
        <div style={{ position: "absolute", bottom: 0, left: 4, width: 6, height: 10, background: "#92400e", borderRadius: 2 }} />
        <div style={{ position: "absolute", bottom: 6, left: 0, width: 14, height: 14, borderRadius: "50% 60% 40% 50%", background: "#166534" }} />
        <div style={{ position: "absolute", bottom: 8, left: 3, width: 10, height: 10, borderRadius: "50%", background: "#15803d" }} />
      </div>
      <div style={{ position: "absolute", top: 30, right: 16, width: 32, height: 60 }}>
        <div style={{ position: "absolute", inset: 0, background: "#3b2a1a", borderRadius: 3 }} />
        {["#dc2626", "#2563eb", "#059669", "#d97706", "#7c3aed"].map((c, i) => (
          <div key={i} style={{ position: "absolute", bottom: 4 + i * 11, left: 3, width: 4 + (i % 3) * 2, height: 9, background: c, borderRadius: "1px 1px 0 0", opacity: 0.9 }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: 2 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.15)", borderRadius: 1 }} />
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{
            position: "absolute", top: 1, left: (i * 12.5) + "%",
            width: 5, height: 5, borderRadius: "50%",
            background: i % 3 === 0 ? accent : i % 3 === 1 ? "#fbbf24" : "#f472b6",
            boxShadow: "0 0 5px " + (i % 3 === 0 ? accent : "#fbbf24"),
            animation: "flicker " + (3 + i * 0.4) + "s ease-in-out " + (i * 0.3) + "s infinite",
          }} />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 55, left: 0, right: 0, height: 2, background: "#2a1f0f55" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 58, background: "#1c1208" }} />
      <div style={{ position: "absolute", bottom: 40, left: 12, right: 12, height: 18, background: "#4b3b2a", borderRadius: "3px 3px 0 0", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", bottom: 40, left: 12, right: 12, height: 3, background: "#5c4a35", borderRadius: "3px 3px 0 0" }} />
      <div style={{ position: "absolute", bottom: 0, left: 20, width: 8, height: 42, background: "#3b2a1a", borderRadius: "0 0 3px 3px" }} />
      <div style={{ position: "absolute", bottom: 0, right: 20, width: 8, height: 42, background: "#3b2a1a", borderRadius: "0 0 3px 3px" }} />
      <div style={{ position: "absolute", bottom: 54, left: "50%", transform: "translateX(-50%)", width: 44, height: 30, background: "#111", borderRadius: 3, border: "2px solid #374151", animation: "screenglow 3s ease-in-out infinite", boxShadow: "0 0 10px " + accent + "66" }}>
        <div style={{ position: "absolute", inset: 2, background: moodData.sky, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 2, left: 2, right: 2, height: 2, background: accent + "55", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: 6, left: 2, right: 6, height: 1, background: "rgba(255,255,255,0.15)", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: 9, left: 2, right: 10, height: 1, background: "rgba(255,255,255,0.1)", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: 12, left: 2, right: 4, height: 1, background: "rgba(255,255,255,0.12)", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: 15, left: 2, right: 8, height: 1, background: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
          {isWorking && <div style={{ position: "absolute", top: 6, left: 2, width: 2, height: 10, background: accent, animation: "pulse 0.8s ease-in-out infinite" }} />}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 53, left: "50%", transform: "translateX(-50%)", width: 8, height: 4, background: "#374151" }} />
      <div style={{ position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)", width: 16, height: 2, background: "#4b5563", borderRadius: 1 }} />
      <div style={{ position: "absolute", bottom: 57, right: 30, width: 10, height: 10 }}>
        <div style={{ position: "absolute", inset: 0, background: "#7c3aed", borderRadius: "20% 20% 30% 30%", border: "1.5px solid #5b21b6" }} />
        <div style={{ position: "absolute", top: 1, left: 1, right: 1, height: 3, background: "#c4b5fd44", borderRadius: "10% 10% 0 0" }} />
        <div style={{ position: "absolute", top: 2, right: -3, width: 4, height: 5, border: "1.5px solid #5b21b6", borderLeft: "none", borderRadius: "0 4px 4px 0" }} />
        <div style={{ position: "absolute", top: -6, left: 2, fontSize: 6, color: "rgba(255,255,255,0.4)", animation: "floatnote 2s ease-out infinite" }}>~</div>
        <div style={{ position: "absolute", top: -6, right: 2, fontSize: 6, color: "rgba(255,255,255,0.3)", animation: "floatnote 2s ease-out 0.7s infinite" }}>~</div>
      </div>
      {isWorking && (
        <div style={{ position: "absolute", top: 55, left: 22 }}>
          <MusicNote accent={accent} delay={0} />
          <MusicNote accent={accent} delay={1.2} />
          <MusicNote accent={accent} delay={2.4} />
        </div>
      )}
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-60%)", width: 42, height: 32 }}>
        <div style={{ position: "absolute", top: 0, left: 4, right: 4, height: 14, background: "#1e3a5f", borderRadius: "4px 4px 0 0" }} />
        <div style={{ position: "absolute", top: 13, left: 0, right: 0, height: 8, background: "#1e3a5f", borderRadius: 3 }} />
        <div style={{ position: "absolute", bottom: 0, left: 8, width: 6, height: 10, background: "#374151", borderRadius: "0 0 3px 3px" }} />
        <div style={{ position: "absolute", bottom: 0, right: 8, width: 6, height: 10, background: "#374151", borderRadius: "0 0 3px 3px" }} />
      </div>
      <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-82%)" }}>
        <PixelGirl isWorking={isWorking} accent={accent} />
      </div>
      <div style={{ position: "absolute", bottom: 57, left: 18, animation: "catwalk 8s ease-in-out 2s infinite" }}>
        <PixelCat accent={accent} isWalking={true} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 20, right: 20, height: 6, background: "#7c3aed22", borderRadius: 3, border: "1px solid #7c3aed33" }} />
    </div>
  );
}

function BodyDouble() {
  const [mood, setMood] = useState("focus");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(25);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const moodData = MOODS.find((m) => m.id === mood) || MOODS[0];
  const accent = moodData.accent;
  const total = duration * 60;
  const pct = Math.min(elapsed / total, 1);
  const remaining = Math.max(total - elapsed, 0);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= total) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setRunning(false);
            setDone(true);
            return total;
          }
          return e + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, total]);

  useEffect(() => {
    if (!running) return;
    msgRef.current = setInterval(() => {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, 30000);
    return () => {
      if (msgRef.current) clearInterval(msgRef.current);
    };
  }, [running]);

  const start = () => { setDone(false); setElapsed(0); setRunning(true); };
  const pause = () => { setRunning((r) => !r); };
  const reset = () => { setRunning(false); setElapsed(0); setDone(false); };

  const circumference = 2 * Math.PI * 54;

  return (
    <>
      <style>{CSS}</style>
      <main style={{ minHeight: "100vh", background: moodData.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadein 0.5s ease", fontFamily: "system-ui, sans-serif", transition: "background 0.5s ease" }}>
        <header style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: accent, opacity: 0.7, marginBottom: 4 }}>body doubling mode</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5, margin: 0 }}>We're working together 💜</h1>
        </header>

        <div style={{ width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
          <DeskScene mood={mood} isWorking={running} accent={accent} />

          <div style={{ textAlign: "center", padding: "10px 20px 4px", fontSize: 12, color: accent, opacity: 0.85, animation: "slideup 0.4s ease", letterSpacing: 0.3 }}>
            {done ? "🎉 Session complete! You did amazing, Yulia!" : running ? message : "Ready when you are ✨"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 20px 12px" }}>
            <div style={{ position: "relative", width: 124, height: 124, marginBottom: 14 }}>
              <svg width={124} height={124} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={62} cy={62} r={54} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                <circle cx={62} cy={62} r={54} fill="none" stroke={accent} strokeWidth={8}
                  strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s linear", filter: "drop-shadow(0 0 6px " + accent + ")" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>{mm}:{ss}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2 }}>
                  {done ? "done!" : running ? "focusing" : "ready"}
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ height: "100%", width: pct * 100 + "%", background: accent, borderRadius: 2, transition: "width 1s linear", boxShadow: "0 0 8px " + accent }} />
            </div>

            {!running && !done && (
              <div style={{ display: "flex", gap: 6, marginBottom: 12, animation: "slideup 0.3s ease" }}>
                {[15, 25, 45, 60].map((d) => (
                  <button key={d} onClick={() => { setDuration(d); setElapsed(0); }}
                    style={{
                      padding: "5px 10px", borderRadius: 10, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.18s ease",
                      borderColor: duration === d ? accent : "rgba(255,255,255,0.12)",
                      background: duration === d ? accent + "22" : "transparent",
                      color: duration === d ? accent : "rgba(255,255,255,0.4)",
                    }}>
                    {d}m
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              {!done ? (
                <>
                  <button onClick={running ? pause : start}
                    style={{
                      padding: "11px 28px", borderRadius: 14, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.18s ease",
                      background: "linear-gradient(135deg," + accent + "," + accent + "99)",
                      color: "#fff", boxShadow: "0 4px 16px " + accent + "55",
                    }}>
                    {running ? "⏸ Pause" : elapsed > 0 ? "▶ Resume" : "▶ Start Focus"}
                  </button>
                  {elapsed > 0 && (
                    <button onClick={reset}
                      style={{ padding: "11px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", fontSize: 14, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }}>
                      ↺
                    </button>
                  )}
                </>
              ) : (
                <button onClick={start}
                  style={{ padding: "11px 28px", borderRadius: 14, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg," + accent + "," + accent + "99)", color: "#fff", boxShadow: "0 4px 16px " + accent + "55" }}>
                  ✨ Another session?
                </button>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 8, textAlign: "center" }}>vibe</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              {MOODS.map((m) => (
                <button key={m.id} onClick={() => setMood(m.id)}
                  style={{
                    flex: 1, padding: "7px 4px", borderRadius: 10, border: "1px solid", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", textAlign: "center",
                    borderColor: mood === m.id ? m.accent : "rgba(255,255,255,0.08)",
                    background: mood === m.id ? m.accent + "1a" : "rgba(255,255,255,0.03)",
                    color: mood === m.id ? m.accent : "rgba(255,255,255,0.35)",
                  }}>
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>{moodData.desc}</div>
          </div>
        </div>

        <footer style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          Your companion is always here 🐱
        </footer>
      </main>
    </>
  );
}
