import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Onboarding } from "@/components/Onboarding";
import { track } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    meta: [
      { title: "Body Double · Focus with your pixel friend & Mochi" },
      { name: "description", content: "A cozy ADHD body-doubling companion: pixel friend, cat Mochi, focus timer, dance/eat/feed/phone breaks, themed music." },
    ],
  }),
});

const MOODS = [
  { id: "focus",   label: "Focus",   bg: "#0c160c", sky: "#07100a", accent: "#4ade80", desc: "Classical · deep work 🌿",
    music: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Air%20Prelude.mp3" },
  { id: "chill",   label: "Chill",   bg: "#0e0e1e", sky: "#080812", accent: "#818cf8", desc: "Jazz · easy flow 🌙",
    music: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Bossa%20Antigua.mp3" },
  { id: "storm",   label: "Storm",   bg: "#0b1018", sky: "#070c10", accent: "#60a5fa", desc: "Power ⚡",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id: "cozy",    label: "Cozy",    bg: "#180f08", sky: "#100800", accent: "#fb923c", desc: "Hip-hop · warm 🕯️",
    music: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/George%20Street%20Shuffle.mp3" },
  { id: "sunrise", label: "Sunrise", bg: "#1a0f12", sky: "#2a1410", accent: "#fda4af", desc: "Morning warmth 🌅",
    music: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wallpaper.mp3" },
  { id: "rainbow", label: "Rainbow", bg: "#150818", sky: "#1a0a22", accent: "#c084fc", desc: "Magic time 🦄🌈",
    music: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3" },
];

type PoseKey = "idle" | "work" | "dance" | "eat" | "feed" | "perch" | "pet" | "candle" | "phone";

const MSGS: Record<PoseKey, string[]> = {
  idle:   ["Hey friend! Ready when you are ✨","I'm right here with you 💜","Take your time — I'm not going anywhere 🌸"],
  work:   ["We're locked in together! 💪","You're doing so well 🧠","Stay in flow, I've got you ✨","One thing at a time 🌟"],
  dance:  ["BREAK TIME!! Shake it out!! 🎉","You earned this — dance it out! 💃","Mochi is vibing too 🐱🎵"],
  eat:    ["Fuel up, friend! You need this 🍜","Don't skip it — we're eating together! 🥣","Nourish that brilliant brain 🌸"],
  feed:   ["Mochi is SO happy right now 🐱","Look at him go!! 🥰","He was waiting patiently 💜"],
  perch:  ["Mochi found his sunny spot 🌤️","Window watch mode activated 🐱","He's bird-watching, shhh 🍃"],
  pet:    ["Pets pets pets 💜","Mochi is purring so loud 🐱✨","Soft kitty, warm kitty 🌸"],
  candle: ["Candle lit — cozy mode on 🕯️","Tiny ritual, big calm ✨","Soft glow, soft brain 💛"],
  phone:  ["Calling a friend — connection time 📞","You're not alone, friend 💜","Hearing a voice helps ☎️"],
};

const CSS = `
@keyframes breathe   { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.965)} }
@keyframes headbob   { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-3deg)} }
@keyframes gblink    { 0%,88%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.07)} }
@keyframes typeL     { 0%,100%{transform:rotate(0) translateY(0)} 50%{transform:rotate(-14deg) translateY(-2px)} }
@keyframes typeR     { 0%,100%{transform:rotate(0) translateY(0)} 50%{transform:rotate(14deg) translateY(-2px)} }
@keyframes ponyIdle  { 0%,100%{transform:rotate(10deg)} 50%{transform:rotate(5deg)} }
@keyframes girlIdleSway { 0%,100%{transform:translateX(-50%) rotate(-1.2deg)} 50%{transform:translateX(-50%) rotate(1.2deg)} }
@keyframes girlSway  { 0%,100%{transform:translateX(-50%) rotate(0)} 25%{transform:translateX(calc(-50% - 5px)) rotate(-6deg)} 75%{transform:translateX(calc(-50% + 5px)) rotate(6deg)} }
@keyframes girlWalkToCat { 0%{transform:translateX(-50%)} 100%{transform:translateX(calc(-50% - 70px))} }
@keyframes legStep  { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-1px) rotate(8deg)} }
@keyframes legStepB { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-1px) rotate(-8deg)} }
@keyframes waveL     { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(-140deg)} }
@keyframes waveR     { 0%,100%{transform:rotate(30deg)} 50%{transform:rotate(140deg)} }
@keyframes headDance { 0%,100%{transform:rotate(0)} 30%{transform:rotate(-12deg)} 70%{transform:rotate(12deg)} }
@keyframes kickL     { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-28deg)} }
@keyframes kickR     { 0%,100%{transform:rotate(0)} 50%{transform:rotate(28deg)} }
@keyframes ponyDance { 0%,100%{transform:rotate(15deg)} 50%{transform:rotate(-20deg)} }
@keyframes eatArm    { 0%,100%{transform:rotate(0) translateY(0)} 45%,55%{transform:rotate(-70deg) translateY(-10px)} }
@keyframes chew      { 0%,100%{transform:scaleY(1)} 40%,60%{transform:scaleY(0.2)} }
@keyframes reachL    { 0%,100%{transform:rotate(0) translateY(0)} 50%{transform:rotate(55deg) translateY(9px)} }
@keyframes catwalk   { 0%{transform:translateX(0) scaleX(1)} 45%{transform:translateX(56px) scaleX(1)} 50%{transform:translateX(56px) scaleX(-1)} 95%{transform:translateX(0) scaleX(-1)} 100%{transform:translateX(0) scaleX(1)} }
@keyframes catDance  { 0%,100%{transform:translateY(0) rotate(0) scaleX(1)} 20%{transform:translateY(-12px) rotate(-10deg) scaleX(1)} 50%{transform:translateY(0) rotate(0) scaleX(-1)} 70%{transform:translateY(-12px) rotate(10deg) scaleX(-1)} }
@keyframes catEatBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
@keyframes catTapJump{ 0%{transform:translateY(0) scale(1)} 30%{transform:translateY(-10px) scale(1.08)} 100%{transform:translateY(0) scale(1)} }
@keyframes tailWag   { 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(22deg)} }
@keyframes tailFast  { 0%,100%{transform:rotate(-35deg)} 50%{transform:rotate(35deg)} }
@keyframes catblink  { 0%,86%,100%{transform:scaleY(1)} 93%{transform:scaleY(0.05)} }
@keyframes flicker   { 0%,100%{opacity:1} 91%{opacity:0.7} 95%{opacity:1} 98%{opacity:0.8} }
@keyframes startwink { 0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
@keyframes floatnote { 0%{opacity:0;transform:translateY(0) rotate(-6deg)} 15%{opacity:1} 100%{opacity:0;transform:translateY(-32px) rotate(8deg)} }
@keyframes screenglo { 0%,100%{opacity:0.75} 50%{opacity:1} }
@keyframes raindrop  { 0%{transform:translateY(-10px);opacity:0} 8%{opacity:0.55} 100%{transform:translateY(200px);opacity:0} }
@keyframes pulseglo  { 0%,100%{opacity:0.5} 50%{opacity:1} }
@keyframes fadein    { from{opacity:0} to{opacity:1} }
@keyframes notifPop  { 0%{opacity:0;transform:translateX(-50%) translateY(-16px)} 12%{opacity:1;transform:translateX(-50%) translateY(0)} 85%{opacity:1;transform:translateX(-50%) translateY(0)} 100%{opacity:0;transform:translateX(-50%) translateY(-12px)} }
@keyframes confettiFall { 0%{transform:translateY(-8px) rotate(0);opacity:1} 100%{transform:translateY(90px) rotate(400deg);opacity:0} }
@keyframes flame      { 0%{transform:translateX(-50%) scaleY(1) scaleX(1) rotate(-2deg);opacity:1} 25%{transform:translateX(-50%) scaleY(1.18) scaleX(0.82) rotate(3deg);opacity:0.95} 50%{transform:translateX(-50%) scaleY(0.92) scaleX(1.1) rotate(-3deg);opacity:1} 75%{transform:translateX(-50%) scaleY(1.22) scaleX(0.78) rotate(2deg);opacity:0.88} 100%{transform:translateX(-50%) scaleY(1) scaleX(1) rotate(-2deg);opacity:1} }
@keyframes hangSway   { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
@keyframes flowerNod  { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
@keyframes petArm     { 0%,100%{transform:rotate(60deg) translateY(2px)} 25%{transform:rotate(95deg) translateY(10px)} 75%{transform:rotate(78deg) translateY(6px)} }
@keyframes purrPaw    { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-3px) rotate(-2deg)} 75%{transform:translateY(-1px) rotate(2deg)} }
@keyframes perchBreathe { 0%,100%{transform:translateX(-50%) scaleY(1)} 30%{transform:translateX(-50%) scaleY(0.94)} 60%{transform:translateX(-50%) scaleY(1.05)} }
@keyframes dripDali   { 0%,100%{transform:translateY(0) scaleY(1)} 50%{transform:translateY(2px) scaleY(1.1)} }
@keyframes heartFloat { 0%{opacity:0;transform:translate(0,0) scale(0.6)} 18%{opacity:1} 100%{opacity:0;transform:translate(var(--dx,8px),-38px) scale(1.1)} }
@keyframes candleSparkle { 0%{opacity:0;transform:translateY(0) scale(0.4)} 30%{opacity:1} 100%{opacity:0;transform:translateY(-22px) scale(1.1)} }
@keyframes candleGlow { 0%,100%{box-shadow:0 0 14px rgba(251,191,36,0.45)} 50%{box-shadow:0 0 26px rgba(251,191,36,0.85)} }
@keyframes girlReachSwing { 0%,100%{transform:rotate(40deg) translateY(2px)} 50%{transform:rotate(70deg) translateY(10px)} }
@keyframes phoneArm   { 0%,100%{transform:rotate(-12deg) translateY(-2px)} 50%{transform:rotate(-30deg) translateY(-5px)} }
@keyframes phoneRing  { 0%,100%{transform:rotate(-3deg)} 25%{transform:rotate(3deg)} 50%{transform:rotate(-2deg)} 75%{transform:rotate(2deg)} }
@keyframes phoneHueCycle { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
@keyframes dialSpin   { 0%{transform:rotate(0)} 30%{transform:rotate(140deg)} 35%{transform:rotate(140deg)} 65%{transform:rotate(0)} 100%{transform:rotate(0)} }
@keyframes rainbowSky { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes unicornFloat { 0%{transform:translate(0,0) rotate(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translate(40px,-80px) rotate(20deg);opacity:0} }
@keyframes wmDrift    { 0%{background-position:0 0} 100%{background-position:240px -240px} }
@keyframes tapPulse   { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
.bd-app button { font-family:inherit; }
.bd-app .wm { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.05; mix-blend-mode:overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='80' viewBox='0 0 320 80'><text x='0' y='52' font-family='Georgia,serif' font-style='italic' font-weight='700' font-size='30' fill='white' letter-spacing='2'>bodydoubleCFS bodydoubleCFS</text></svg>");
  background-size: 320px 80px; background-repeat: repeat; transform: rotate(-14deg) scale(1.4); animation: wmDrift 60s linear infinite; }
.bd-stage { position:relative; width:100%; padding-top:78%; border-radius:20px 20px 0 0; overflow:hidden; border:1px solid rgba(255,255,255,0.07); border-bottom:none; box-shadow:0 -4px 24px rgba(0,0,0,0.5); touch-action: none; }
.bd-drag { touch-action:none; user-select:none; -webkit-user-select:none; cursor:grab; }
.bd-drag:active { cursor:grabbing; }
.bd-tap { animation: tapPulse 0.4s ease-out; }
@media (min-width: 900px) {
  .bd-shell { max-width: 1100px !important; }
  .bd-grid { display: grid; grid-template-columns: 1.45fr 1fr; gap: 22px; align-items: start; }
  .bd-stage { padding-top: 70%; border-radius: 20px !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
  .bd-panel { border-radius: 20px !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
  .bd-msgbar { border-radius: 0 !important; }
  .bd-rightcol { display:flex; flex-direction:column; gap:14px; }
}
@media (min-width: 1280px) { .bd-shell { max-width: 1280px !important; } }
`;

type CharColors = { hair: string; skin: string; outfit?: string | null; fur: string; hairLength?: string };

/* ============ Character component (girl + boy) ============ */
function Character({
  pose, accent, colors, kind, onTap, tapBurst, facialHair, accessory,
}: {
  pose: string; accent: string; colors: CharColors;
  kind: "girl" | "boy";
  onTap: () => void;
  tapBurst: number;
  facialHair?: string;
  accessory?: string;
}) {
  const { hair, skin } = colors;
  const pants = kind === "boy" ? "#1f2937" : "#374151";
  const outfit = colors.outfit || accent;
  const hairLen = colors.hairLength || "long";
  const isDancing = pose === "dance", isEating = pose === "eat";
  const isFeeding = pose === "feed",  isWorking = pose === "work";
  const isPetting = pose === "pet",   isCandle  = pose === "candle";
  const isPhone = pose === "phone";

  // Position the *whole body* per activity. Default: standing on floor in front of desk.
  // Bottom percentages refer to the stage. Stage is now taller (padding 78%).
  let leftPct = "50%";
  let bottomPct = "3%";              // standing on floor
  if (isWorking)  bottomPct = "10%"; // sit at desk a touch higher so face is visible
  if (isEating)   { leftPct = "55%"; bottomPct = "10%"; }
  if (isDancing)  bottomPct = "4%";
  if (isPetting)  { leftPct = "25%"; bottomPct = "3%"; }   // walks to Mochi
  if (isFeeding)  { leftPct = "30%"; bottomPct = "3%"; }
  if (isPhone)    { leftPct = "78%"; bottomPct = "3%"; }
  if (pose === "candle") { leftPct = "44%"; bottomPct = "3%"; }

  // Pose toggles: idle sway when not active
  const idleSway = (pose === "idle" || pose === "perch");

  const ponyH = hairLen === "short" ? 8 : hairLen === "medium" ? 16 : 24;
  const ponyTop = hairLen === "short" ? 4 : 5;

  // Note: container has explicit height so transformOrigin works correctly.
  const W = 50, H = 94;

  return (
    <div
      onPointerDown={(e) => { e.stopPropagation(); onTap(); }}
      style={{
        position:"absolute",
        bottom: bottomPct, left: leftPct, width: W, height: H,
        marginLeft: -W/2,            // center on the leftPct anchor
        zIndex: 7,
        cursor: "pointer",
        touchAction: "manipulation",
        transition: "bottom 0.6s cubic-bezier(0.34,1.56,0.64,1), left 0.6s ease",
        animation: isDancing
          ? "girlSway 0.55s ease-in-out infinite"
          : idleSway
          ? "girlIdleSway 3.2s ease-in-out infinite"
          : "none",
        transformOrigin: "bottom center",
      }}
    >
      <div key={"tap"+tapBurst} style={{ position:"absolute", top:-4, left:0, right:0, height:0, pointerEvents:"none", zIndex:20 }}>
        {tapBurst > 0 && ["💜","✨","💕"].map((h, i) => (
          <div key={i} style={{ position:"absolute", top:0, left: 8 + i*14, fontSize:14, opacity:0, ["--dx" as any]: ((i%2?1:-1)*(4+i*3))+"px", animation:"heartFloat 1.2s ease-out "+(i*0.08)+"s forwards" }}>{h}</div>
        ))}
      </div>

      {/* HEAD area — hair back layer */}
      {kind === "girl" ? (
        <div style={{ position:"absolute", top:0, left:3, width:44, height:26, background:hair, borderRadius:"50% 50% 0 0", zIndex:0 }} />
      ) : (
        <div style={{ position:"absolute", top:1, left:5, width:40, height:18, background:hair, borderRadius:"50% 50% 6px 6px", zIndex:0 }} />
      )}

      {/* face */}
      <div style={{ position:"absolute", top:3, left:7, width:36, height:31, background:skin, borderRadius:"45% 45% 40% 40%", zIndex:2, animation: isDancing ? "headDance 0.55s ease-in-out infinite" : isWorking ? "headbob 2s ease-in-out infinite" : "breathe 3.5s ease-in-out infinite" }}>
        <div style={{ position:"absolute", top:12, left:7, width:6, height:6, background:"#1e1b4b", borderRadius:"50%", animation:"gblink 4.5s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:12, left:9, width:2, height:2, background:"white", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:12, right:7, width:6, height:6, background:"#1e1b4b", borderRadius:"50%", animation:"gblink 4.5s ease-in-out 0.4s infinite" }} />
        <div style={{ position:"absolute", top:12, right:9, width:2, height:2, background:"white", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:6, left:"50%", transform:"translateX(-50%)", width:10, height:4, borderBottom:"2px solid #c87941", borderLeft:"1px solid #c87941", borderRight:"1px solid #c87941", borderRadius:"0 0 5px 5px", animation: isEating ? "chew 0.9s ease-in-out infinite" : "none" }} />
        <div style={{ position:"absolute", bottom:9, left:3, width:7, height:4, background:"rgba(255,130,100,0.32)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:9, right:3, width:7, height:4, background:"rgba(255,130,100,0.32)", borderRadius:"50%" }} />
      </div>

      {/* Hair front pieces */}
      {kind === "girl" ? (
        <>
          <div style={{ position:"absolute", top:3, left:4, width:18, height:13, background:hair, borderRadius:"50% 30% 40% 50%", zIndex:3 }} />
          <div style={{ position:"absolute", top:1, left:21, width:12, height:9, background:hair, borderRadius:"30% 50% 50% 30%", zIndex:3 }} />
          {/* ponytail */}
          <div style={{ position:"absolute", top:ponyTop, right:0, width:10, height:ponyH, background:hair, borderRadius:"40% 60% 60% 40%", zIndex:1, transformOrigin:"top center", animation: isDancing ? "ponyDance 0.4s ease-in-out infinite" : "ponyIdle 3s ease-in-out infinite" }} />
        </>
      ) : (
        <>
          {/* boy short fringe */}
          <div style={{ position:"absolute", top:3, left:8, width:14, height:6, background:hair, borderRadius:"50% 30% 6px 50%", zIndex:3 }} />
          <div style={{ position:"absolute", top:2, left:20, width:14, height:7, background:hair, borderRadius:"30% 50% 50% 6px", zIndex:3 }} />
          {/* ear hint */}
          <div style={{ position:"absolute", top:16, left:3, width:3, height:5, background:skin, borderRadius:3, zIndex:1 }} />
          <div style={{ position:"absolute", top:16, right:3, width:3, height:5, background:skin, borderRadius:3, zIndex:1 }} />
        </>
      )}

      {/* Left arm */}
      <div style={{ position:"absolute", top: isDancing ? 38 : 33, left: isDancing ? -6 : 1, width:7, height: isPetting ? 22 : 20, background:skin, borderRadius:5, zIndex:1, transformOrigin: "top center", animation: isDancing ? "waveL 0.52s ease-in-out infinite" : isFeeding ? "reachL 1.4s ease-in-out infinite" : isPetting ? "petArm 0.65s ease-in-out infinite" : isWorking ? "typeL 0.38s ease-in-out infinite" : "none", transition:"top 0.4s ease,left 0.4s ease" }} />

      {/* Torso / outfit */}
      <div style={{ position:"absolute", top:31, left:5, width:40, height:25, background: "linear-gradient(180deg," + outfit + "ee 0%," + outfit + "cc 60%," + outfit + "dd 100%)", borderRadius: kind === "boy" ? "16% 16% 8% 8%" : "22% 22% 12% 12%", zIndex:2, animation: isPetting ? "girlSway 0.7s ease-in-out infinite" : "breathe 3s ease-in-out infinite", boxShadow:"inset 0 2px 0 rgba(255,255,255,0.18)" }}>
        {kind === "girl" ? (
          <>
            <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:14, height:3, background:"rgba(255,255,255,0.35)", borderRadius:"0 0 6px 6px" }} />
            <div style={{ position:"absolute", bottom:8, left:0, right:0, height:2, background:"rgba(0,0,0,0.18)" }} />
          </>
        ) : (
          <>
            {/* T-shirt collar */}
            <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:10, height:4, background: skin, borderRadius:"0 0 50% 50%" }} />
            {/* center stripe */}
            <div style={{ position:"absolute", top:5, left:"50%", transform:"translateX(-50%)", width:3, height:15, background:"rgba(255,255,255,0.15)" }} />
          </>
        )}
      </div>

      {/* Right arm */}
      <div style={{ position:"absolute", top: isDancing ? 38 : isPhone ? 22 : 33, right: isDancing ? -6 : isPhone ? -2 : 1, width:7, height: isEating ? 22 : isCandle || isPhone ? 22 : 20, background:skin, borderRadius:5, zIndex:isPhone ? 7 : 1, transformOrigin: isDancing || isEating || isCandle || isPhone ? "bottom center" : "top center", animation: isDancing ? "waveR 0.52s ease-in-out 0.26s infinite" : isEating ? "eatArm 1.1s ease-in-out infinite" : isCandle ? "girlReachSwing 0.9s ease-in-out infinite" : isPhone ? "phoneArm 1.6s ease-in-out infinite" : isWorking ? "typeR 0.38s ease-in-out 0.19s infinite" : "none", transition:"top 0.4s ease,right 0.4s ease" }} />

      {/* Phone handset to ear */}
      {isPhone && (
        <div style={{ position:"absolute", top:8, right:-6, width:12, height:18, background:"#fb7185", borderRadius:"40% 40% 60% 60%", zIndex:8, boxShadow:"0 1px 3px rgba(0,0,0,0.4)", border:"1px solid #be123c", animation:"phoneRing 0.35s ease-in-out infinite" }}>
          <div style={{ position:"absolute", top:2, left:3, right:3, height:3, background:"rgba(0,0,0,0.35)", borderRadius:1 }} />
          <div style={{ position:"absolute", bottom:2, left:3, right:3, height:3, background:"rgba(0,0,0,0.35)", borderRadius:1 }} />
        </div>
      )}
      {isEating && <div style={{ position:"absolute", top:33, right:0, width:2, height:18, background:"#9ca3af", borderRadius:1, transformOrigin:"bottom center", animation:"eatArm 1.1s ease-in-out infinite", zIndex:6 }} />}

      {/* Hips/pants */}
      <div style={{ position:"absolute", top:54, left:5, width:40, height: isDancing ? 18 : 16, background:pants, borderRadius:"0 0 8px 8px", zIndex:2 }} />

      {/* Legs */}
      <div style={{ position:"absolute", top:70, left:8, width:14, height:18, background:pants, borderRadius:"0 0 6px 6px", transformOrigin:"top center", animation: isDancing ? "kickL 0.55s ease-in-out infinite" : idleSway ? "legStep 1.6s ease-in-out infinite" : "none", zIndex:2 }} />
      <div style={{ position:"absolute", top:70, right:8, width:14, height:18, background:pants, borderRadius:"0 0 6px 6px", transformOrigin:"top center", animation: isDancing ? "kickR 0.55s ease-in-out 0.27s infinite" : idleSway ? "legStepB 1.6s ease-in-out 0.5s infinite" : "none", zIndex:2 }} />
      {/* Shoes */}
      <div style={{ position:"absolute", bottom:0, left:7, width:16, height:6, background:"#111", borderRadius:"40% 40% 50% 50%", zIndex:3 }} />
      <div style={{ position:"absolute", bottom:0, right:7, width:16, height:6, background:"#111", borderRadius:"40% 40% 50% 50%", zIndex:3 }} />

      {isEating && (
        <div style={{ position:"absolute", top:62, left:12, width:28, height:9, background:"#f8fafc", borderRadius:"50%", border:"1.5px solid #e2e8f0", zIndex:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:20, height:5, borderRadius:"50%", background:"#fde68a" }} />
        </div>
      )}
      {isFeeding && (
        <div style={{ position:"absolute", bottom:-12, left:-16, zIndex:4 }}>
          <div style={{ width:28, height:12, background:"#7c3aed", borderRadius:"0 0 14px 14px", border:"2px solid #5b21b6", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:2, left:3, right:3, height:6, background:"rgba(255,200,80,0.7)", borderRadius:4 }} />
          </div>
          <div style={{ position:"absolute", top:-1, left:-1, width:30, height:6, background:"#8b5cf6", borderRadius:"50%" }} />
        </div>
      )}

      {/* Facial hair (boy) */}
      {kind === "boy" && facialHair && facialHair !== "none" && (
        <>
          {facialHair === "stubble" && (
            <div style={{ position:"absolute", top:24, left:11, width:28, height:8, background:"radial-gradient(ellipse at center,rgba(0,0,0,0.45),transparent 70%)", borderRadius:"50%", zIndex:5, pointerEvents:"none" }} />
          )}
          {facialHair === "mustache" && (
            <div style={{ position:"absolute", top:23, left:14, width:22, height:4, background:hair, borderRadius:"40% 40% 50% 50%", zIndex:5, pointerEvents:"none", boxShadow:"0 1px 0 rgba(0,0,0,0.3)" }} />
          )}
          {facialHair === "goatee" && (
            <>
              <div style={{ position:"absolute", top:23, left:18, width:14, height:3, background:hair, borderRadius:"40% 40% 50% 50%", zIndex:5 }} />
              <div style={{ position:"absolute", top:27, left:20, width:10, height:7, background:hair, borderRadius:"30% 30% 60% 60%", zIndex:5 }} />
            </>
          )}
          {facialHair === "fullbeard" && (
            <div style={{ position:"absolute", top:21, left:8, width:34, height:14, background:hair, borderRadius:"40% 40% 60% 60%", zIndex:4, pointerEvents:"none", boxShadow:"inset 0 -2px 0 rgba(0,0,0,0.2)" }} />
          )}
        </>
      )}

      {/* Accessory */}
      {accessory && accessory !== "none" && (
        <>
          {accessory === "glasses" && (
            <>
              <div style={{ position:"absolute", top:14, left:10, width:11, height:8, border:"1.5px solid #1f2937", borderRadius:"50%", background:"rgba(255,255,255,0.1)", zIndex:6, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:14, right:10, width:11, height:8, border:"1.5px solid #1f2937", borderRadius:"50%", background:"rgba(255,255,255,0.1)", zIndex:6, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:17, left:20, width:5, height:1.5, background:"#1f2937", zIndex:6, pointerEvents:"none" }} />
            </>
          )}
          {accessory === "headphones" && (
            <>
              <div style={{ position:"absolute", top:-1, left:6, right:6, height:8, border:"3px solid #1f2937", borderBottom:"none", borderRadius:"50% 50% 0 0", zIndex:6, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:8, left:1, width:8, height:11, background:accent, borderRadius:"40% 40% 50% 50%", border:"1.5px solid #1f2937", zIndex:6, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:8, right:1, width:8, height:11, background:accent, borderRadius:"40% 40% 50% 50%", border:"1.5px solid #1f2937", zIndex:6, pointerEvents:"none" }} />
            </>
          )}
          {accessory === "hat" && (
            <>
              <div style={{ position:"absolute", top:-6, left:2, width:46, height:6, background:"#1f2937", borderRadius:"4px 4px 1px 1px", zIndex:6, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:-14, left:9, width:32, height:10, background:"#1f2937", borderRadius:"50% 50% 6px 6px", zIndex:6, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:-6, left:14, width:22, height:2, background: accent, zIndex:7, pointerEvents:"none" }} />
            </>
          )}
          {accessory === "flower" && (
            <div style={{ position:"absolute", top:2, left:30, fontSize:12, zIndex:6, pointerEvents:"none" }}>🌸</div>
          )}
          {accessory === "earrings" && (
            <>
              <div style={{ position:"absolute", top:20, left:1, width:3, height:3, borderRadius:"50%", background:"#fbbf24", boxShadow:"0 0 4px #fbbf24", zIndex:6, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:20, right:1, width:3, height:3, borderRadius:"50%", background:"#fbbf24", boxShadow:"0 0 4px #fbbf24", zIndex:6, pointerEvents:"none" }} />
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ============ Cat ============ */
function Cat({ pose, accent, colors, onTap, tapBurst }: { pose: string; accent: string; colors: CharColors; onTap: () => void; tapBurst: number }) {
  const fur = colors.fur, dark = "#000";
  const isDancing = pose === "dance", isFeeding = pose === "feed";
  const isPerch = pose === "perch", isPet = pose === "pet";
  const posStyle: React.CSSProperties = isPerch
    ? { top:"calc(5% + 46px)", left:"50%", bottom:"auto", transform:"translateX(-50%)" }
    : isPet
    ? { bottom:"3%", left:"20%" }
    : { bottom: isDancing || isFeeding ? "4%" : "3%", left:"15%" };
  const anim = isDancing ? "catDance 0.8s ease-in-out infinite"
    : isFeeding ? "catEatBob 0.9s ease-in-out infinite"
    : isPerch ? "perchBreathe 1.8s ease-in-out infinite"
    : isPet ? "purrPaw 0.32s ease-in-out infinite"
    : "catwalk 8s ease-in-out 1s infinite";
  return (
    <div
      onPointerDown={(e) => { e.stopPropagation(); onTap(); }}
      style={{ position:"absolute", width:34, height:32, zIndex:8, cursor:"pointer", touchAction:"manipulation", transition:"bottom 0.5s ease, top 0.5s ease, left 0.5s ease", animation: anim, transformOrigin: isPerch ? "bottom center" : undefined, ...posStyle }}>
      <div key={"ct"+tapBurst} style={{ position:"absolute", top:-6, left:0, right:0, height:0, zIndex:25, pointerEvents:"none" }}>
        {tapBurst > 0 && ["💜","🐾","✨"].map((h, i) => (
          <div key={i} style={{ position:"absolute", left:6+i*10, fontSize:12, opacity:0, ["--dx" as any]: ((i%2?1:-1)*4)+"px", animation:"heartFloat 1.2s ease-out "+(i*0.08)+"s forwards" }}>{h}</div>
        ))}
      </div>
      <div style={{ position:"absolute", top:0, left:3, width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderBottom:"9px solid " + fur }} />
      <div style={{ position:"absolute", top:0, right:3, width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderBottom:"9px solid " + fur }} />
      <div style={{ position:"absolute", top:5, left:2, width:28, height:18, background:fur, borderRadius:"50% 50% 40% 40%" }}>
        <div style={{ position:"absolute", top:5, left:5, width:5, height:5, background:accent, borderRadius:"50%", boxShadow:"0 0 4px " + accent, animation:"catblink 3.8s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:5, right:5, width:5, height:5, background:accent, borderRadius:"50%", boxShadow:"0 0 4px " + accent, animation:"catblink 3.8s ease-in-out 0.6s infinite" }} />
        <div style={{ position:"absolute", top:6, left:7, width:2, height:4, background:dark, borderRadius:1 }} />
        <div style={{ position:"absolute", top:6, right:7, width:2, height:4, background:dark, borderRadius:1 }} />
        <div style={{ position:"absolute", bottom:5, left:"50%", transform:"translateX(-50%)", width:4, height:3, background:"#f9a8d4", borderRadius:"40% 40% 50% 50%" }} />
      </div>
      <div style={{ position:"absolute", top:18, left:4, width:24, height:10, background:fur, borderRadius:"30% 30% 50% 50%" }} />
      <div style={{ position:"absolute", top:14, right:-10, width:11, height:7, borderTop:"3px solid " + fur, borderRight:"3px solid " + fur, borderRadius:"0 50% 50% 0", transformOrigin:"left center", animation: isDancing || isPet || isPerch ? "tailFast 0.3s ease-in-out infinite" : "tailWag 2s ease-in-out infinite" }} />
      <div style={{ position:"absolute", bottom:0, left:4, width:8, height:5, background:fur, borderRadius:"50% 50% 40% 40%" }} />
      <div style={{ position:"absolute", bottom:0, right:4, width:8, height:5, background:fur, borderRadius:"50% 50% 40% 40%" }} />
    </div>
  );
}

/* ============ Draggable wrapper ============ */
type Pt = { x: number; y: number };
function Draggable({
  id, offset, onMove, children, style, zIndex,
}: {
  id: string; offset?: Pt; onMove: (id: string, pt: Pt) => void;
  children?: React.ReactNode; style?: React.CSSProperties; zIndex?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const off = offset || { x: 0, y: 0 };

  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: off.x, baseY: off.y };
  };
  const onMv = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    onMove(id, { x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy });
  };
  const onUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  };

  return (
    <div ref={ref} className="bd-drag"
      onPointerDown={onDown} onPointerMove={onMv} onPointerUp={onUp} onPointerCancel={onUp}
      style={{
        ...style,
        transform: `translate(${off.x}px, ${off.y}px) ${style?.transform || ""}`,
        zIndex: zIndex,
      }}>
      {children}
    </div>
  );
}

/* ============ Room (now with draggable wrappers) ============ */
function Room({
  mood, pose, accent, candleLit, layout, onMove, dialing,
}: {
  mood: string; pose: string; accent: string; candleLit: boolean;
  layout: Record<string, Pt>; onMove: (id: string, pt: Pt) => void; dialing: boolean;
}) {
  const md = MOODS.find((m) => m.id === mood) || MOODS[0];
  const raining = mood === "storm", isWorking = pose === "work", isDancing = pose === "dance";
  const isRainbow = mood === "rainbow";
  const phoneBase = accent;
  const off = (id: string) => layout[id] || { x: 0, y: 0 };

  return (
    <>
      {isRainbow ? (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(120deg,#a78bfa,#c084fc,#f472b6,#fb7185,#fbbf24,#34d399,#60a5fa,#a78bfa)", backgroundSize:"400% 400%", animation:"rainbowSky 18s ease infinite", opacity:0.55 }} />
      ) : (
        <div style={{ position:"absolute", inset:0, background:md.sky }} />
      )}
      {isRainbow && ["🦄","🍀","🌈","🦄","🍀","✨","🌟"].map((e, i) => (
        <div key={"r"+i} style={{ position:"absolute", top:(8 + (i*11)%70) + "%", left:(5 + (i*13)%85) + "%", fontSize:14, opacity:0, animation:"unicornFloat " + (5 + (i%4)) + "s ease-in-out " + (i*0.7) + "s infinite", pointerEvents:"none", zIndex:1 }}>{e}</div>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{ position:"absolute", top:(8 + Math.sin(i * 1.8) * 28 + 22) + "%", left:(i * 4.9 % 92) + "%", width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 2 : 1, borderRadius:"50%", background: i % 7 === 0 ? accent : "#fff", opacity: 0.2 + (i % 3) * 0.14, animation: "startwink " + (2.4 + (i % 4) * 0.65) + "s ease-in-out " + (i * 0.3) + "s infinite" }} />
      ))}
      {raining && Array.from({ length: 24 }, (_, i) => (
        <div key={i} style={{ position:"absolute", top:0, left:(i * 4.2 % 100) + "%", width:1, height:10, background:"rgba(147,197,253,0.3)", animation:"raindrop " + (0.5 + (i % 5) * 0.07) + "s linear " + (i * 0.08) + "s infinite" }} />
      ))}
      <div style={{ position:"absolute", top:"7%", right:"14%", width:18, height:18, borderRadius:"50%", background:"#fef9c3", boxShadow:"0 0 10px rgba(254,249,195,0.5)", opacity: raining ? 0.2 : 0.82 }} />

      {/* Window (fixed) */}
      <div style={{ position:"absolute", top:"5%", left:"50%", transform:"translateX(-50%)", width:90, height:74, border:"3px solid #4b3b2a", borderRadius:4, overflow:"hidden", boxShadow:"inset 0 0 16px rgba(0,0,0,0.6)" }}>
        <div style={{ position:"absolute", inset:0, background: md.sky + "dd" }} />
        {raining && Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{ position:"absolute", top:0, left:(i * 14) + "%", width:1, height:8, background:"rgba(147,197,253,0.4)", animation:"raindrop " + (0.44 + i * 0.06) + "s linear " + (i * 0.07) + "s infinite" }} />
        ))}
        <div style={{ position:"absolute", top:0, left:"50%", width:2, height:"100%", background:"#4b3b2a" }} />
        <div style={{ position:"absolute", top:"50%", left:0, width:"100%", height:2, background:"#4b3b2a" }} />
      </div>
      <div style={{ position:"absolute", top:"calc(5% + 72px)", left:"50%", transform:"translateX(-50%)", width:104, height:6, background:"#6b4a2a", borderRadius:"2px 2px 1px 1px", boxShadow:"0 3px 6px rgba(0,0,0,0.4)", zIndex:3 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:"#8a6438" }} />
        <div style={{ position:"absolute", top:-3, left:"50%", transform:"translateX(-50%)", width:38, height:4, background: accent + "44", borderRadius:3, border:"1px solid " + accent + "55" }} />
      </div>

      {/* Salvador Dalí painting — draggable */}
      <Draggable id="dali" offset={off("dali")} onMove={onMove} zIndex={2}
        style={{ position:"absolute", top:"16%", left:"6%", width:30, height:26, background:"#2a1a0d", border:"2px solid #6b4a2a", borderRadius:2, boxShadow:"0 3px 8px rgba(0,0,0,0.55)", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,#d4a574 0%,#c97f4a 45%,#3a2418 70%,#1a0f08 100%)" }} />
        <div style={{ position:"absolute", top:"55%", left:0, right:0, height:1, background:"rgba(0,0,0,0.4)" }} />
        <div style={{ position:"absolute", top:7, left:5, width:14, height:8, background:"#e8c97a", borderRadius:"50%", transform:"rotate(-8deg)" }} />
        <div style={{ position:"absolute", top:13, left:9, width:3, height:6, background:"#e8c97a", borderRadius:"40% 40% 50% 50%", animation:"dripDali 3.4s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:1, right:2, fontSize:4, color:"rgba(232,201,122,0.55)", fontStyle:"italic" }}>Dalí</div>
      </Draggable>

      {/* Framed monogram — draggable */}
      <Draggable id="mono" offset={off("mono")} onMove={onMove} zIndex={2}
        style={{ position:"absolute", top:"17%", right:"6%", width:28, height:28, background:"#f5e6c8", border:"2px solid #6b4a2a", borderRadius:2, boxShadow:"0 3px 8px rgba(0,0,0,0.5)", padding:2 }}>
        <img src="/cf-monogram.png" alt="" draggable={false} style={{ width:"100%", height:"100%", objectFit:"contain", pointerEvents:"none" }} />
      </Draggable>

      {/* Hanging plant — draggable */}
      <Draggable id="plant" offset={off("plant")} onMove={onMove} zIndex={3}
        style={{ position:"absolute", top:0, left:"22%", width:24, transformOrigin:"top center", animation:"hangSway 5.5s ease-in-out infinite" }}>
        <div style={{ width:1, height:18, background:"#6b4a2a", margin:"0 auto" }} />
        <div style={{ position:"relative", width:24, height:10, margin:"-1px auto 0", background:"linear-gradient(to bottom,#b45309,#7c2d12)", borderRadius:"3px 3px 8px 8px" }} />
        <div style={{ position:"absolute", top:24, left:1, width:5, height:18, background:"linear-gradient(to bottom,#16a34a,#15803d)", borderRadius:"40% 50% 50% 50%", transform:"rotate(-12deg)" }} />
        <div style={{ position:"absolute", top:24, right:1, width:5, height:22, background:"linear-gradient(to bottom,#22c55e,#166534)", borderRadius:"50% 40% 50% 50%", transform:"rotate(10deg)" }} />
        <div style={{ position:"absolute", top:22, left:9, width:6, height:14, background:"#15803d", borderRadius:"50%" }} />
      </Draggable>

      {/* Cat tree — draggable */}
      <Draggable id="tree" offset={off("tree")} onMove={onMove} zIndex={3}
        style={{ position:"absolute", bottom:"18%", left:"3%", width:18, height:"45%" }}>
        <div style={{ position:"absolute", bottom:0, left:-3, width:24, height:5, background:"#5c4a35", borderRadius:2, boxShadow:"0 2px 4px rgba(0,0,0,0.45)" }} />
        <div style={{ position:"absolute", bottom:5, left:6, width:6, height:"100%", background:"repeating-linear-gradient(0deg,#c69d6a 0 3px,#a87844 3px 6px)", borderRadius:2 }} />
        <div style={{ position:"absolute", bottom:"35%", left:-3, width:24, height:5, background:"#6b4a2a", borderRadius:3 }}>
          <div style={{ position:"absolute", top:-2, left:2, right:2, height:2, background: accent + "55", borderRadius:2 }} />
        </div>
        <div style={{ position:"absolute", top:0, left:-5, width:28, height:6, background:"#6b4a2a", borderRadius:3, boxShadow:"0 2px 5px rgba(0,0,0,0.45)" }}>
          <div style={{ position:"absolute", top:-3, left:3, right:3, height:4, background: accent + "55", borderRadius:3, border:"1px solid " + accent + "66" }} />
        </div>
        <div style={{ position:"absolute", top:6, left:14, width:1, height:10, background:"#9ca3af" }} />
        <div style={{ position:"absolute", top:15, left:11, width:6, height:6, borderRadius:"50%", background:"#ec4899", boxShadow:"0 0 6px rgba(236,72,153,0.6)" }} />
      </Draggable>

      {/* Rotary vintage phone — draggable + dial spinner */}
      <Draggable id="phone" offset={off("phone")} onMove={onMove} zIndex={4}
        style={{ position:"absolute", bottom:"calc(20% + 16px)", right:"6%", width:30, height:22, animation:"phoneHueCycle 14s linear infinite", filter: pose === "phone" ? "drop-shadow(0 0 10px " + accent + "aa)" : "none" }}>
        <div style={{ position:"absolute", bottom:0, left:0, width:30, height:12, background:"linear-gradient(180deg," + phoneBase + "," + phoneBase + "aa)", borderRadius:"50% 50% 30% 30% / 60% 60% 40% 40%", border:"1.5px solid rgba(0,0,0,0.4)", boxShadow:"0 2px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.3)" }} />
        {/* rotary dial */}
        <div style={{ position:"absolute", bottom:1.5, left:9, width:12, height:10, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), " + phoneBase + " 60%, rgba(0,0,0,0.35))", border:"1px solid rgba(0,0,0,0.4)", transformOrigin:"center", animation: dialing ? "dialSpin 1.2s ease-in-out 3" : "none" }}>
          {[0,1,2,3,4,5].map((i) => {
            const a = (i * 40 - 90) * Math.PI / 180;
            return <div key={i} style={{ position:"absolute", top: 5 + Math.sin(a)*3.4 - 0.6, left: 6 + Math.cos(a)*3.4 - 0.6, width:1.4, height:1.4, background:"rgba(0,0,0,0.55)", borderRadius:"50%" }} />;
          })}
        </div>
        {/* handset cradle */}
        <div style={{ position:"absolute", top:0, left:3, width:24, height:6, background: phoneBase, borderRadius:"40% 40% 50% 50%", border:"1.5px solid rgba(0,0,0,0.45)", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.35)", animation: pose === "phone" ? "phoneRing 0.25s ease-in-out infinite" : "none" }} />
        <div style={{ position:"absolute", top:4, left:-6, width:8, height:14, borderLeft:"1.5px solid " + phoneBase, borderRadius:"50%", transform:"rotate(-10deg)" }} />
        <div style={{ position:"absolute", top:8, left:-9, width:6, height:5, borderLeft:"1.5px solid " + phoneBase, borderRadius:"50%" }} />
        {(pose === "phone" || dialing) && Array.from({ length: 3 }, (_, i) => (
          <div key={i} style={{ position:"absolute", top:-8, left: 6 + i*5, fontSize:9, color:accent, opacity:0, animation:"floatnote 1.2s ease-out " + (i*0.3) + "s infinite" }}>♪</div>
        ))}
      </Draggable>

      {/* small abstract canvas — draggable */}
      <Draggable id="canvas" offset={off("canvas")} onMove={onMove} zIndex={2}
        style={{ position:"absolute", top:"30%", right:"4%", width:22, height:14, background:"linear-gradient(135deg,#fbbf24 0%,#fbbf24 40%,#ec4899 40%,#ec4899 70%,#60a5fa 70%)", border:"1.5px solid #3b2a1a", borderRadius:1 }} />

      {/* bookshelf — draggable */}
      <Draggable id="shelf" offset={off("shelf")} onMove={onMove} zIndex={2}
        style={{ position:"absolute", top:"18%", right:"7%", width:34, height:64, background:"#3b2a1a", borderRadius:3, overflow:"hidden" }}>
        {["#dc2626","#2563eb","#059669","#d97706","#7c3aed","#ec4899"].map((c, i) => (
          <div key={i} style={{ position:"absolute", bottom: 3 + i * 10, left:3, width: 3 + (i % 3) * 2, height:8, background:c, borderRadius:"1px 1px 0 0" }} />
        ))}
      </Draggable>

      {/* String lights (fixed) */}
      <div style={{ position:"absolute", top:"2.5%", left:"5%", right:"5%", height:2 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"rgba(255,255,255,0.1)", borderRadius:1 }} />
        {Array.from({ length: 11 }, (_, i) => {
          const cs = [accent, "#fbbf24", "#f472b6", "#34d399"];
          return <div key={i} style={{ position:"absolute", top:1, left:(i * 9.5) + "%", width:5, height:5, borderRadius:"50%", background:cs[i % 4], boxShadow:"0 0 5px " + cs[i % 4], animation:"flicker " + (2.4 + i * 0.3) + "s ease-in-out " + (i * 0.22) + "s infinite" }} />;
        })}
      </div>

      {/* Fireplace — draggable, in the back */}
      <Draggable id="fireplace" offset={off("fireplace")} onMove={onMove} zIndex={2}
        style={{ position:"absolute", bottom:"22%", left:"50%", marginLeft:-30, width:60, height:54 }}>
        {/* mantel */}
        <div style={{ position:"absolute", top:0, left:-4, right:-4, height:5, background:"#3b2a1a", borderRadius:2, boxShadow:"0 2px 4px rgba(0,0,0,0.5)" }} />
        {/* brick surround */}
        <div style={{ position:"absolute", top:5, left:0, right:0, bottom:0, background:"repeating-linear-gradient(0deg,#5a2a1a 0 4px,#3b1810 4px 5px), repeating-linear-gradient(90deg,transparent 0 9px,#3b1810 9px 10px)", border:"1.5px solid #2a1208", borderRadius:"2px 2px 0 0" }} />
        {/* opening */}
        <div style={{ position:"absolute", top:13, left:9, right:9, bottom:6, background:"#1a0a04", borderRadius:"4px 4px 1px 1px", overflow:"hidden", boxShadow:"inset 0 2px 6px rgba(0,0,0,0.8)" }}>
          {/* logs */}
          <div style={{ position:"absolute", bottom:2, left:3, right:3, height:5, background:"linear-gradient(180deg,#5a2a14,#2a1208)", borderRadius:2 }} />
          {/* flames */}
          <div style={{ position:"absolute", bottom:5, left:"50%", transform:"translateX(-50%)", width:18, height:18, background:"radial-gradient(ellipse at center bottom,#fbbf24 10%,#fb923c 45%,#dc2626 75%,transparent 100%)", borderRadius:"50% 50% 30% 30%", animation:"flame 0.6s ease-in-out infinite", filter:"blur(0.4px)" }} />
          <div style={{ position:"absolute", bottom:6, left:"50%", transform:"translateX(-50%)", width:10, height:12, background:"radial-gradient(ellipse at center bottom,#fef3c7,#fbbf24 60%,transparent)", borderRadius:"50% 50% 40% 40%", animation:"flame 0.42s ease-in-out infinite", filter:"blur(0.3px)" }} />
          {/* sparks */}
          {[0,1,2].map((i) => (
            <div key={i} style={{ position:"absolute", bottom:14, left: (12 + i*8) + "px", width:1.5, height:1.5, borderRadius:"50%", background:"#fde68a", animation:"candleSparkle 1.3s ease-out " + (i*0.4) + "s infinite" }} />
          ))}
        </div>
        {/* warm glow on the floor */}
        <div style={{ position:"absolute", bottom:-6, left:-8, right:-8, height:8, background:"radial-gradient(ellipse at center,rgba(251,146,60,0.55),transparent 70%)", pointerEvents:"none" }} />
      </Draggable>

      {/* floor + desk (fixed) */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"22%", background:"#1c1208" }} />
      <div style={{ position:"absolute", bottom:"22%", left:0, right:0, height:2, background:"rgba(0,0,0,0.3)" }} />
      <div style={{ position:"absolute", bottom:"19%", left:"9%", right:"9%", height:17, background:"#4b3b2a", borderRadius:"3px 3px 0 0", boxShadow:"0 4px 16px rgba(0,0,0,0.5)" }} />
      <div style={{ position:"absolute", bottom:"19%", left:"9%", right:"9%", height:3, background:"#5c4a35", borderRadius:"3px 3px 0 0" }} />


      {/* Money tree — draggable */}
      <Draggable id="money" offset={off("money")} onMove={onMove} zIndex={4}
        style={{ position:"absolute", bottom:"calc(19% + 16px)", left:"22%", width:18, height:22 }}>
        <div style={{ position:"absolute", bottom:0, left:2, width:14, height:8, background:"linear-gradient(to bottom,#b45309,#7c2d12)", borderRadius:"1px 1px 3px 3px" }} />
        <div style={{ position:"absolute", bottom:7, left:1, width:16, height:2, background:"#92400e", borderRadius:1 }} />
        <div style={{ position:"absolute", bottom:8, left:8, width:2, height:6, background:"#3f2410", borderRadius:1 }} />
        <div style={{ position:"absolute", bottom:11, left:0, width:9, height:9, background:"#15803d", borderRadius:"60% 50% 50% 60%" }} />
        <div style={{ position:"absolute", bottom:12, left:6, width:11, height:10, background:"#16a34a", borderRadius:"50% 60% 55% 50%" }} />
        <div style={{ position:"absolute", bottom:15, left:3, width:9, height:8, background:"#22c55e", borderRadius:"50% 60% 50% 60%" }} />
        <div style={{ position:"absolute", bottom:8, left:6, width:6, height:1.5, background:"#dc2626", borderRadius:1 }} />
      </Draggable>

      {/* Candle — draggable */}
      <Draggable id="candle" offset={off("candle")} onMove={onMove} zIndex={4}
        style={{ position:"absolute", bottom:"calc(19% + 16px)", left:"40%", width:12, height:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, width:12, height:2, background:"#1f1f1f", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:1, left:2, width:8, height:12, background:"linear-gradient(to right,#f5e6c8,#d9c08a,#f5e6c8)", borderRadius:"1px 1px 0 0" }} />
        <div style={{ position:"absolute", bottom:13, left:5.5, width:1, height: candleLit ? 1.5 : 3, background:"#1a1a1a" }} />
        {candleLit && (
          <>
            <div style={{ position:"absolute", bottom:14, left:"50%", width:4, height:7, background:"radial-gradient(ellipse at center bottom,#fff4a3 10%,#fbbf24 50%,#f97316 85%)", borderRadius:"50% 50% 40% 40% / 70% 70% 30% 30%", transformOrigin:"bottom center", animation:"flame 0.32s ease-in-out infinite", boxShadow:"0 0 8px #fbbf24cc, 0 0 16px #f9731688" }} />
            <div style={{ position:"absolute", bottom:13, left:"50%", transform:"translateX(-50%)", width:14, height:14, background:"radial-gradient(circle,#fbbf2433 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
          </>
        )}
      </Draggable>

      {/* desk legs (fixed) */}
      <div style={{ position:"absolute", bottom:0, left:"13%", width:8, height:"20%", background:"#3b2a1a", borderRadius:"0 0 3px 3px" }} />
      <div style={{ position:"absolute", bottom:0, right:"13%", width:8, height:"20%", background:"#3b2a1a", borderRadius:"0 0 3px 3px" }} />

      {/* monitor — draggable */}
      <Draggable id="monitor" offset={off("monitor")} onMove={onMove} zIndex={2}
        style={{ position:"absolute", bottom:"32%", left:"50%", marginLeft:-23, width:46, height:32, background:"#111", borderRadius:3, border:"2px solid #374151", animation:"screenglo 3s ease-in-out infinite", boxShadow:"0 0 12px " + accent + "55" }}>
        <div style={{ position:"absolute", inset:2, background:md.sky, borderRadius:2, overflow:"hidden" }}>
          <div style={{ position:"absolute", top:2, left:2, right:2, height:2, background: accent + "44", borderRadius:1 }} />
          {[6, 9, 12, 15].map((t, i) => (
            <div key={i} style={{ position:"absolute", top:t, left:2, right: 4 + i * 3, height:1, background:"rgba(255,255,255," + (0.12 - i * 0.02) + ")", borderRadius:1 }} />
          ))}
          {isWorking && <div style={{ position:"absolute", top:6, left:2, width:2, height:10, background:accent, animation:"pulseglo 0.8s ease-in-out infinite" }} />}
        </div>
      </Draggable>
      <div style={{ position:"absolute", bottom:"31%", left:"50%", marginLeft:-4.5, width:9, height:5, background:"#374151" }} />
      <div style={{ position:"absolute", bottom:"30%", left:"50%", marginLeft:-10, width:20, height:3, background:"#4b5563", borderRadius:1 }} />

      {/* mug — draggable */}
      <Draggable id="mug" offset={off("mug")} onMove={onMove} zIndex={4}
        style={{ position:"absolute", bottom:"32%", right:"21%", width:14, height:14 }}>
        <div style={{ width:11, height:11, background:"#7c3aed", borderRadius:"20% 20% 30% 30%", border:"1.5px solid #5b21b6", position:"relative" }}>
          <div style={{ position:"absolute", top:2, right:-3, width:4, height:6, border:"1.5px solid #5b21b6", borderLeft:"none", borderRadius:"0 4px 4px 0" }} />
        </div>
        <div style={{ position:"absolute", top:-7, left:2, fontSize:7, color:"rgba(255,255,255,0.3)", animation:"floatnote 2.2s ease-out infinite" }}>~</div>
      </Draggable>

      {/* floor cushion + pillows (fixed) */}
      <div style={{ position:"absolute", bottom:"1%", left:"18%", right:"18%", height:7, background: accent + "15", borderRadius:4, border:"1px solid " + accent + "22" }} />
      <Draggable id="pill1" offset={off("pill1")} onMove={onMove} zIndex={5}
        style={{ position:"absolute", bottom:"2.5%", left:"20%", width:14, height:9, background:"linear-gradient(135deg,#f472b6,#db2777)", borderRadius:"45% 45% 35% 35%", border:"1px solid rgba(0,0,0,0.25)" }} />
      <Draggable id="pill2" offset={off("pill2")} onMove={onMove} zIndex={5}
        style={{ position:"absolute", bottom:"2.5%", right:"21%", width:13, height:8, background:"linear-gradient(135deg,#fbbf24,#d97706)", borderRadius:"40% 40% 35% 35%", border:"1px solid rgba(0,0,0,0.25)", transform:"rotate(-6deg)" }} />

      {/* flower vase — draggable */}
      <Draggable id="vase" offset={off("vase")} onMove={onMove} zIndex={5}
        style={{ position:"absolute", bottom:"calc(19% + 16px)", left:"32%", width:10, height:18 }}>
        <div style={{ position:"absolute", bottom:0, left:1, width:8, height:7, background:"linear-gradient(to bottom,#a7f3d0,#34d399)", borderRadius:"30% 30% 50% 50%" }} />
        <div style={{ position:"absolute", bottom:7, left:4, width:1, height:7, background:"#15803d" }} />
        <div style={{ position:"absolute", bottom:12, left:3, width:4, height:4, background:"#ec4899", borderRadius:"50%", animation:"flowerNod 4.2s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:11, left:0, width:3.5, height:3.5, background:"#f59e0b", borderRadius:"50%", animation:"flowerNod 4.6s ease-in-out 0.4s infinite" }} />
        <div style={{ position:"absolute", bottom:12, right:0, width:3.5, height:3.5, background:"#a78bfa", borderRadius:"50%", animation:"flowerNod 4.4s ease-in-out 0.8s infinite" }} />
      </Draggable>

      {isDancing && ["♪","♫","♩"].map((n, i) => (
        <div key={i} style={{ position:"absolute", top:"45%", left:(22 + i * 12) + "%", fontSize:13, color:accent, opacity:0, animation:"floatnote 2s ease-out " + (i * 0.75) + "s infinite" }}>{n}</div>
      ))}
      {pose === "pet" && ["💜","💕","💖","✨","💜"].map((h, i) => (
        <div key={"h"+i} style={{ position:"absolute", bottom:"22%", left:(20 + i * 4) + "%", fontSize:12, opacity:0, ["--dx" as any]: ((i % 2 ? 1 : -1) * (6 + i * 3)) + "px", animation:"heartFloat 1.6s ease-out " + (i * 0.32) + "s infinite" }}>{h}</div>
      ))}
      {pose === "candle" && Array.from({ length: 6 }, (_, i) => (
        <div key={"sp"+i} style={{ position:"absolute", bottom:"24%", left:(38 + (i % 3) * 3) + "%", width:3, height:3, borderRadius:"50%", background:"#fde68a", boxShadow:"0 0 6px #fbbf24", opacity:0, animation:"candleSparkle 1.4s ease-out " + (i * 0.22) + "s infinite" }} />
      ))}
    </>
  );
}

function Confetti({ active, accent }: { active: boolean; accent: string }) {
  if (!active) return null;
  const colors = [accent, "#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];
  return (
    <div style={{ position:"absolute", top:0, left:0, right:0, height:110, pointerEvents:"none", overflow:"hidden", zIndex:20 }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{ position:"absolute", top:-8, left:(4 + (i * 6.1) % 90) + "%", width: 4 + (i % 4), height: 4 + (i % 4), background: colors[i % colors.length], borderRadius: i % 3 === 0 ? "50%" : "2px", animation: "confettiFall " + (0.7 + (i % 3) * 0.2) + "s ease-in " + (i * 0.13) + "s infinite" }} />
      ))}
    </div>
  );
}

function Notif({ text, accent, id }: { text: string; accent: string; id: number }) {
  return (
    <div key={id} style={{ position:"absolute", top:10, left:"50%", padding:"8px 18px", borderRadius:20, background:"rgba(0,0,0,0.78)", border:"1px solid " + accent + "55", backdropFilter:"blur(12px)", color:accent, fontSize:12, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap", zIndex:30, boxShadow:"0 4px 16px rgba(0,0,0,0.4)", animation:"notifPop 4.5s ease forwards" }}>
      {text}
    </div>
  );
}

function TimerRing({ elapsed, duration, accent }: { elapsed: number; duration: number; accent: string }) {
  const total = duration * 60, pct = Math.min(elapsed / total, 1), left = Math.max(total - elapsed, 0);
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const circ = 2 * Math.PI * 42;
  return (
    <div style={{ position:"relative", width:100, height:100, flexShrink:0 }}>
      <svg width={100} height={100} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={50} cy={50} r={42} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle cx={50} cy={50} r={42} fill="none" stroke={accent} strokeWidth={7} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s linear", filter:"drop-shadow(0 0 5px " + accent + ")" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", fontVariantNumeric:"tabular-nums", letterSpacing:-1 }}>{mm}:{ss}</div>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:2 }}>left</div>
      </div>
    </div>
  );
}

const HAIR_OPTIONS = ["#2d1b69","#7c2d12","#0f172a","#facc15","#dc2626","#a78bfa","#f472b6","#16a34a","#0891b2","#fb923c","#f5e6c8","#1f2937"];
const SKIN_OPTIONS = ["#f5c5a3","#e0a878","#c08763","#8b5a3c","#fde2d3","#5c3a24"];
const OUTFIT_OPTIONS = ["#a78bfa","#f472b6","#34d399","#60a5fa","#fbbf24","#fb7185","#f5f5f4","#1f2937","#dc2626","#0891b2","#16a34a","#f97316"];
const CAT_FUR_OPTIONS = [
  { fur:"#d4a0d4", label:"Lilac"   },
  { fur:"#f5e6c8", label:"Cream"   },
  { fur:"#3b2a1a", label:"Tuxedo"  },
  { fur:"#e8a76a", label:"Orange"  },
  { fur:"#9ca3af", label:"Silver"  },
  { fur:"#1f1f1f", label:"Onyx"    },
];
const HAIR_LENGTHS = ["short", "medium", "long"];
const HAIR_STYLES_GIRL = ["default","ponytail","buns","bob","braids","wavy"];
const HAIR_STYLES_BOY  = ["default","buzz","messy","slick","curly","mohawk"];
const FACIAL_HAIR = ["none","stubble","mustache","goatee","fullbeard"];
const ACCESSORIES = ["none","glasses","headphones","hat","flower","earrings"];

function CharacterEditor({ onClose, onReplayIntro, resetLayout, kind }: { onClose: () => void; onReplayIntro: () => void; resetLayout: () => void; kind: "girl" | "boy" }) {
  const { profile, updateProfile } = useAuth();
  const [hair, setHair] = useState(profile?.hair_color || HAIR_OPTIONS[0]);
  const [hairLength, setHairLength] = useState(profile?.hair_length || "long");
  const [hairStyle, setHairStyle] = useState(profile?.hair_style || "default");
  const [skin, setSkin] = useState(profile?.skin_color || SKIN_OPTIONS[0]);
  const [outfit, setOutfit] = useState(profile?.outfit_color || OUTFIT_OPTIONS[0]);
  const [fur, setFur]   = useState(profile?.cat_fur_color || CAT_FUR_OPTIONS[0].fur);
  const [facialHair, setFacialHair] = useState(profile?.facial_hair || "none");
  const [accessory, setAccessory] = useState(profile?.accessory || "none");
  const [busy, setBusy] = useState(false);
  const styles = kind === "boy" ? HAIR_STYLES_BOY : HAIR_STYLES_GIRL;
  const save = async () => {
    setBusy(true);
    await updateProfile({ hair_color: hair, hair_length: hairLength, hair_style: hairStyle, skin_color: skin, outfit_color: outfit, cat_fur_color: fur, facial_hair: facialHair, accessory: accessory } as any);
    setBusy(false); onClose();
  };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:70, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:"linear-gradient(180deg,#1a1228,#0e0a18)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:20, width:"100%", maxWidth:380, color:"#f1f5f9", maxHeight:"90vh", overflowY:"auto" }}>
        <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800 }}>Customize your {kind === "boy" ? "buddy" : "friend"}</h2>
        <p style={{ margin:"0 0 14px", fontSize:12, color:"rgba(255,255,255,0.5)" }}>Pick your look, outfit, and Mochi's coat.</p>
        <Swatches label="Hair color"  values={HAIR_OPTIONS} selected={hair} onPick={setHair} />
        <Pills label="Hair length" values={HAIR_LENGTHS} selected={hairLength} onPick={setHairLength} />
        <Pills label="Hair style" values={styles} selected={hairStyle} onPick={setHairStyle} />
        {kind === "boy" && (
          <Pills label="Facial hair" values={FACIAL_HAIR} selected={facialHair} onPick={setFacialHair} />
        )}
        <Pills label="Accessory" values={ACCESSORIES} selected={accessory} onPick={setAccessory} />
        <Swatches label="Skin"  values={SKIN_OPTIONS} selected={skin} onPick={setSkin} />
        <Swatches label="Outfit"  values={OUTFIT_OPTIONS} selected={outfit} onPick={setOutfit} />
        <Swatches label="Mochi's coat" values={CAT_FUR_OPTIONS.map((c) => c.fur)} selected={fur} onPick={setFur} />
        <div style={{ display:"flex", gap:8, marginTop:8, marginBottom:12 }}>
          <button onClick={onReplayIntro} style={{ ...btnGhost, flex:1 }}>🎬 Replay onboarding</button>
          <button onClick={resetLayout} style={{ ...btnGhost, flex:1 }}>↺ Reset room layout</button>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={save} disabled={busy} style={{ ...btnSolid, flex:1 }}>{busy ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
function Pills({ label, values, selected, onPick }: { label: string; values: string[]; selected: string; onPick: (v: string) => void }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>{label}</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {values.map((l) => (
          <button key={l} onClick={() => onPick(l)}
            style={{ padding:"7px 11px", borderRadius:8, border: selected === l ? "2px solid #fff" : "1px solid rgba(255,255,255,0.15)", background: selected === l ? "rgba(255,255,255,0.1)" : "transparent", color:"#f1f5f9", fontSize:11.5, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
function Swatches({ label, values, selected, onPick }: { label: string; values: string[]; selected: string; onPick: (v: string) => void }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>{label}</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {values.map((v) => (
          <button key={v} onClick={() => onPick(v)} aria-label={v}
            style={{ width:34, height:34, borderRadius:"50%", border: selected === v ? "3px solid #fff" : "2px solid rgba(255,255,255,0.15)", background:v, cursor:"pointer", boxShadow: selected === v ? "0 0 10px rgba(255,255,255,0.5)" : "none" }} />
        ))}
      </div>
    </div>
  );
}
const btnSolid: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#a78bfa,#7c3aed)", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer" };
const btnGhost: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"#f1f5f9", fontWeight:600, fontSize:13, cursor:"pointer" };

/* ============ Intro screen ============ */
const INTRO_STEPS = [
  {
    icon: "💜", title: "Hey, you're not alone",
    body: "Body Double is a tiny pixel room with a friend + their cat Mochi. They sit with you while you work — that's body doubling. Built for ADHD brains, gentle for everyone.",
  },
  {
    icon: "🧠", title: "Focus together",
    body: "Pick 15/25/45/60 min. Your friend works alongside you. Break reminders pop at 25/50/75/90% so you don't lose track of time.",
  },
  {
    icon: "🎨", title: "Make it yours",
    body: "Tap Customize to change hair, outfit, skin, Mochi's coat. Toggle 👧/👦 anytime. Drag any item around the room — your layout saves.",
  },
  {
    icon: "🎵", title: "Sound + companions",
    body: "Tap ▶ Play to enable music (browsers block autoplay). Try Dance/Eat/Pet/Call buttons — tap Mochi or your friend for a little 💜.",
  },
];
function IntroScreen({ onClose, accent }: { onClose: () => void; accent: string }) {
  const [step, setStep] = useState(0);
  const s = INTRO_STEPS[step];
  const last = step === INTRO_STEPS.length - 1;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:90, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(10px)", animation:"fadein 0.3s ease" }}>
      <div style={{ width:"100%", maxWidth:360, background:"linear-gradient(180deg,#1a1228,#0e0a18)", border:"1px solid " + accent + "55", borderRadius:20, padding:24, color:"#f1f5f9", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>{s.icon}</div>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:accent, opacity:0.7, marginBottom:6 }}>Welcome · {step + 1}/{INTRO_STEPS.length}</div>
        <h2 style={{ margin:"0 0 10px", fontSize:22, fontWeight:800 }}>{s.title}</h2>
        <p style={{ fontSize:13.5, lineHeight:1.55, color:"rgba(255,255,255,0.75)", margin:"0 0 18px" }}>{s.body}</p>
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:14 }}>
          {INTRO_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 18 : 6, height:6, borderRadius:3, background: i === step ? accent : "rgba(255,255,255,0.2)", transition:"all 0.3s ease" }} />
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={btnGhost}>Back</button>}
          <button onClick={onClose} style={{ ...btnGhost, marginRight:"auto" }}>Skip</button>
          <button onClick={() => last ? onClose() : setStep(step + 1)} style={{ ...btnSolid, background: "linear-gradient(135deg," + accent + "," + accent + "aa)" }}>
            {last ? "Let's go 💜" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Contacts modal — uses tel: / sms: deep links ============ */
type Contact = { id: string; name: string; phone: string };
function ContactsModal({ onClose, accent, userId, onCall, onText }: {
  onClose: () => void; accent: string; userId: string | null;
  onCall: () => void; onText: () => void;
}) {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("bd-contacts") || "[]"); } catch { return []; }
  });
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from("contacts").select("*").eq("user_id", userId).order("name");
      if (data) setContacts(data as any);
    })();
  }, [userId]);

  const persist = (next: Contact[]) => {
    setContacts(next);
    if (typeof window !== "undefined") localStorage.setItem("bd-contacts", JSON.stringify(next));
  };

  const add = async () => {
    const n = name.trim(), p = phone.trim();
    if (!n || !p) return;
    setBusy(true);
    if (userId) {
      const { data } = await supabase.from("contacts").insert({ user_id: userId, name: n, phone: p }).select().single();
      if (data) persist([...contacts, data as any]);
    } else {
      persist([...contacts, { id: String(Date.now()), name: n, phone: p }]);
    }
    setName(""); setPhone(""); setBusy(false);
  };
  const remove = async (id: string) => {
    if (userId) await supabase.from("contacts").delete().eq("id", id);
    persist(contacts.filter((c) => c.id !== id));
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:80, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(8px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width:"100%", maxWidth:380, background:"linear-gradient(180deg,#1a1228,#0e0a18)", border:"1px solid " + accent + "55", borderRadius:18, padding:20, color:"#f1f5f9", maxHeight:"86vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>📞 Your contacts</h2>
          <button onClick={onClose} aria-label="Close" style={{ width:28, height:28, borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"transparent", color:"#fff", cursor:"pointer" }}>✕</button>
        </div>
        <p style={{ margin:"0 0 12px", fontSize:11.5, color:"rgba(255,255,255,0.55)" }}>Tap Call or Text — opens your device's dialer or messages.</p>

        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
            style={{ flex:1, padding:"9px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"#f1f5f9", fontSize:12.5 }} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555…" inputMode="tel"
            style={{ flex:1, padding:"9px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"#f1f5f9", fontSize:12.5 }} />
          <button onClick={add} disabled={busy} style={{ padding:"0 12px", borderRadius:8, border:"none", background:accent, color:"#0a0a0a", fontWeight:800, fontSize:12.5, cursor:"pointer" }}>Add</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {contacts.length === 0 && (
            <div style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.4)", padding:"18px 8px" }}>No contacts yet — add a friend above 💜</div>
          )}
          {contacts.map((c) => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{c.phone}</div>
              </div>
              <a href={"tel:" + c.phone} onClick={() => onCall()}
                style={{ padding:"7px 10px", borderRadius:8, background:accent, color:"#0a0a0a", fontSize:11.5, fontWeight:800, textDecoration:"none" }}>📞 Call</a>
              <a href={"sms:" + c.phone} onClick={() => onText()}
                style={{ padding:"7px 10px", borderRadius:8, border:"1px solid " + accent + "88", color:accent, fontSize:11.5, fontWeight:800, textDecoration:"none" }}>💬 Text</a>
              <button onClick={() => remove(c.id)} aria-label="Delete" style={{ width:24, height:24, border:"none", background:"transparent", color:"rgba(255,255,255,0.3)", fontSize:14, cursor:"pointer" }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



/* ============ App ============ */
function App() {
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const [mood, setMood] = useState("focus");
  const [pose, setPose] = useState<PoseKey>("idle");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(25);
  const [sessions, setSessions] = useState(0);
  const [notif, setNotif] = useState({ text: "", id: 0 });
  const [msgIdx, setMsgIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [candleLit, setCandleLit] = useState(true);
  const [todoOpen, setTodoOpen] = useState(false);
  const [charOpen, setCharOpen] = useState(false);
  const [dialing, setDialing] = useState(false);
  const [tapGirl, setTapGirl] = useState(0);
  const [tapCat, setTapCat] = useState(0);
  const [todoInput, setTodoInput] = useState("");

  // Character kind: local toggle, saved to profile if signed in, localStorage for guests.
  const [kind, setKind] = useState<"girl" | "boy">(() => {
    if (typeof window === "undefined") return "girl";
    return (localStorage.getItem("bd-kind") as "girl" | "boy") || "girl";
  });
  useEffect(() => {
    if (profile?.character_type === "boy" || profile?.character_type === "girl") {
      setKind(profile.character_type);
    }
  }, [profile?.character_type]);
  const setKindBoth = (k: "girl" | "boy") => {
    setKind(k);
    if (typeof window !== "undefined") localStorage.setItem("bd-kind", k);
    if (user) void updateProfile({ character_type: k } as any);
  };

  // Onboarding (full interactive walkthrough) — show on first visit.
  const [onbOpen, setOnbOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localDone = localStorage.getItem("bd-onb-done") === "1";
    const profDone = profile?.onboarding_completed === true;
    if (!localDone && !profDone) setOnbOpen(true);
  }, [profile?.onboarding_completed]);
  const closeOnboarding = () => {
    setOnbOpen(false);
    if (typeof window !== "undefined") { localStorage.setItem("bd-onb-done", "1"); localStorage.setItem("bd-intro-seen", "1"); }
    if (user) void updateProfile({ onboarding_completed: true, intro_seen: true } as any);
    void track("onboarding_complete");
  };
  const replayIntro = () => { setCharOpen(false); setOnbOpen(true); };

  // Room layout (drag offsets) — localStorage always, profile when signed in
  const [layout, setLayout] = useState<Record<string, Pt>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("bd-layout") || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    if (profile?.room_layout && typeof profile.room_layout === "object" && Object.keys(profile.room_layout).length > 0) {
      setLayout(profile.room_layout as Record<string, Pt>);
    }
  }, [profile?.room_layout]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMoveItem = useCallback((id: string, pt: Pt) => {
    setLayout((prev) => {
      const next = { ...prev, [id]: pt };
      if (typeof window !== "undefined") localStorage.setItem("bd-layout", JSON.stringify(next));
      if (user) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => { void updateProfile({ room_layout: next } as any); }, 600);
      }
      return next;
    });
  }, [user, updateProfile]);
  const resetLayout = () => {
    setLayout({});
    if (typeof window !== "undefined") localStorage.setItem("bd-layout", "{}");
    if (user) void updateProfile({ room_layout: {} } as any);
  };

  const [todos, setTodos] = useState<{ id: number; text: string; done: boolean }[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("bd-todos") || "[]"); } catch { return []; }
  });
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("bd-todos", JSON.stringify(todos)); }, [todos]);
  const addTodo = () => { const t = todoInput.trim(); if (!t) return; setTodos((p) => [{ id: Date.now(), text: t, done: false }, ...p]); setTodoInput(""); };
  const toggleTodo = (id: number) => setTodos((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const removeTodo = (id: number) => setTodos((p) => p.filter((t) => t.id !== id));
  const remaining = todos.filter((t) => !t.done).length;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const poseRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runningRef = useRef(running); runningRef.current = running;

  const md = MOODS.find((m) => m.id === mood) || MOODS[0];
  const accent = md.accent, total = duration * 60, isDone = elapsed >= total && total > 0;

  const colors: CharColors = {
    hair: profile?.hair_color || "#2d1b69",
    hairLength: profile?.hair_length || "long",
    skin: profile?.skin_color || "#f5c5a3",
    outfit: profile?.outfit_color || accent,
    fur: profile?.cat_fur_color || "#d4a0d4",
  };

  const showNotif = (text: string) => setNotif((n) => ({ text, id: n.id + 1 }));
  const triggerPose = (p: PoseKey, sec: number, msg: string) => {
    if (poseRef.current) clearTimeout(poseRef.current);
    setPose(p); showNotif(msg);
    poseRef.current = setTimeout(() => { setPose(runningRef.current ? "work" : "idle"); }, sec * 1000);
  };

  // Web Audio ring — improved reliability
  const ringCtxRef = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);
  const startRinging = async () => {
    try {
      const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx: AudioContext = new Ctx();
      if (ctx.state === "suspended") { try { await ctx.resume(); } catch {} }
      const stops: Array<() => void> = [];
      // 3 dial-tone clicks at the start (rotary feel)
      const clickAt = (t: number) => {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        g.connect(ctx.destination);
        const o = ctx.createOscillator();
        o.type = "square"; o.frequency.value = 220;
        o.connect(g); o.start(t); o.stop(t + 0.1);
        stops.push(() => { try { o.stop(); } catch {} });
      };
      const ringOnce = (startAt: number) => {
        const dur = 2;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(0.22, startAt + 0.04);
        gain.gain.setValueAtTime(0.22, startAt + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, startAt + dur);
        gain.connect(ctx.destination);
        [440, 480].forEach((f) => {
          const o = ctx.createOscillator();
          o.type = "sine"; o.frequency.value = f;
          o.connect(gain);
          o.start(startAt); o.stop(startAt + dur);
          stops.push(() => { try { o.stop(); } catch {} });
        });
      };
      const t0 = ctx.currentTime + 0.05;
      // dial clicks for ~1.2s
      for (let i = 0; i < 7; i++) clickAt(t0 + i * 0.18);
      // then 3 rings spaced 4s apart starting after dial
      for (let i = 0; i < 3; i++) ringOnce(t0 + 1.6 + i * 4);
      ringCtxRef.current = { ctx, stop: () => { stops.forEach((s) => s()); ctx.close().catch(() => {}); } };
    } catch {}
  };
  const stopRinging = () => { ringCtxRef.current?.stop(); ringCtxRef.current = null; };
  useEffect(() => () => stopRinging(), []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          const marks = [
            { at: Math.floor(total * 0.25), n: 1 },
            { at: Math.floor(total * 0.5),  n: 2 },
            { at: Math.floor(total * 0.75), n: 3 },
            { at: Math.floor(total * 0.9),  n: 4 },
          ];
          const hit = marks.find((m) => m.at === next);
          if (hit && next < total) {
            const mins = Math.floor(next / 60);
            const secs = next % 60;
            const elapsedStr = mins > 0 ? mins + " min" + (secs ? " " + secs + "s" : "") : secs + "s";
            showNotif("⏰ Break " + hit.n + " — you've been at it " + elapsedStr + " ✨");
            void track("break_taken", { mark: hit.n, elapsed: next });
          }
          if (next >= total) {
            if (timerRef.current) clearInterval(timerRef.current);
            setRunning(false); setSessions((s) => s + 1);
            triggerPose("dance", 28, "🎉 Session done! Dance it out, friend!");
            void track("session_complete", { duration });
            return total;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, total]);

  useEffect(() => {
    msgRef.current = setInterval(() => setMsgIdx((i) => i + 1), 28000);
    return () => { if (msgRef.current) clearInterval(msgRef.current); };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio(); a.loop = true; a.volume = 0.35; a.preload = "auto";
      a.addEventListener("error", () => setMusicError("Track couldn't load — try another mood"));
      a.addEventListener("playing", () => setMusicError(null));
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (muted) { a.pause(); return; }
    if (a.src !== md.music) { a.src = md.music; a.load(); }
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => setMusicError("Tap the speaker to start music"));
  }, [mood, muted, md.music]);
  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (!next) setMusicStarted(true);
      return next;
    });
  };

  const startFocus  = () => { setElapsed(0); setRunning(true); setPose("work"); showNotif("🧠 Focus started, friend!"); void track("session_start", { duration }); };
  const pauseFocus  = () => { setRunning(false); setPose("idle"); };
  const resumeFocus = () => { setRunning(true); setPose("work"); };
  const resetFocus  = () => { setRunning(false); setElapsed(0); setPose("idle"); };
  const doDance = () => triggerPose("dance", 15, "💃 Dance break! Shake it out!");
  const doEat   = () => triggerPose("eat", 14, "🍜 Time to eat — fuel up!");
  const doFeed  = () => triggerPose("feed", 12, "🐱 Feeding Mochi! He's so excited!");
  const doPerch = () => triggerPose("perch", 22, "🌤️ Mochi's on the window perch");
  const doPet   = () => triggerPose("pet", 14, "💜 Petting Mochi — purr engaged");
  const doCandle = () => { setCandleLit((v) => !v); triggerPose("candle", 8, candleLit ? "🌙 Candle out" : "🕯️ Candle lit — cozy ritual"); };
  const doPhone  = async () => {
    stopRinging();
    setDialing(true);
    await startRinging();
    setTimeout(() => setDialing(false), 1600);
    triggerPose("phone", 18, "📞 Dialing… ring ring!");
    setTimeout(stopRinging, 18500);
  };

  const onTapGirl = () => { setTapGirl((n) => n + 1); showNotif(kind === "girl" ? "💜 Hi friend!" : "💜 Hey, dude!"); };
  const onTapCat  = () => { setTapCat((n) => n + 1); showNotif("🐱 Mochi: mrrp!"); };

  const msgs = MSGS[pose] || MSGS.idle;
  const curMsg = msgs[msgIdx % msgs.length];
  const friendNoun = kind === "boy" ? "buddy" : "friend";
  const displayName = profile?.display_name ? "Hi, " + profile.display_name + " 💜" : "Hi, " + friendNoun + " 💜";

  return (
    <>
      <style>{CSS}</style>
      <main className="bd-app" style={{ width:"100%", minHeight:"100vh", padding:"12px 14px 28px", background: md.bg, animation:"fadein 0.5s ease", fontFamily:"system-ui, sans-serif", transition:"background 0.5s ease", position:"relative", overflowX:"hidden" }}>
        <div className="wm" aria-hidden="true" />

        {/* Top bar */}
        <div style={{ position:"sticky", top:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 4px 10px", marginBottom:8, background:"linear-gradient(180deg," + md.bg + " 70%,transparent)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src="/cf-monogram.png" alt="CreativeFactory.studio" style={{ height:34, width:34, objectFit:"contain", filter:"drop-shadow(0 0 8px " + accent + "66)" }} />
            <div style={{ lineHeight:1.15 }}>
              <div style={{ fontWeight:800, color:"#f1f5f9", fontSize:13, letterSpacing:0.3 }}>Body Double</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)" }}>{displayName}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={() => setKindBoth(kind === "girl" ? "boy" : "girl")} aria-label="Toggle character" style={topBtn(accent)}>
              {kind === "girl" ? "👧" : "👦"}
            </button>
            {user ? (
              <>
                <button onClick={() => setCharOpen(true)} style={topBtn(accent)}>🎨</button>
                {isAdmin && <Link to="/admin" style={{ ...topBtn(accent), textDecoration:"none" }}>📊 Admin</Link>}
                <button onClick={signOut} style={topBtn(accent)}>Sign out</button>
              </>
            ) : (
              <Link to="/login" style={{ ...topBtn(accent), textDecoration:"none" }}>Sign in</Link>
            )}
            <button onClick={() => setTodoOpen(true)} style={topBtn(accent)}>
              ✅ {remaining > 0 && <span style={{ background:accent, color:"#000", borderRadius:10, padding:"1px 7px", fontSize:10, marginLeft:2 }}>{remaining}</span>}
            </button>
          </div>
        </div>

        <div className="bd-shell" style={{ width:"100%", maxWidth:420, margin:"0 auto", position:"relative", zIndex:1 }}>
          <header style={{ textAlign:"center", marginBottom:10 }}>
            <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:accent, opacity:0.6, marginBottom:3 }}>body doubling mode</div>
            <h1 style={{ fontSize:19, fontWeight:800, color:"#f1f5f9", letterSpacing:-0.5, margin:0 }}>We're working together 💜</h1>
          </header>

          <div className="bd-grid">
            <div>
              <div className="bd-stage">
                <div style={{ position:"absolute", inset:0 }}>
                  <Room mood={mood} pose={pose} accent={accent} candleLit={candleLit} layout={layout} onMove={onMoveItem} dialing={dialing} />
                  {/* Scale wrapper — makes friend + Mochi smaller so the room has more breathing room for new items */}
                  <div style={{ position:"absolute", inset:0, transform:"scale(0.72)", transformOrigin:"50% 100%", pointerEvents:"none" }}>
                    <div style={{ position:"absolute", inset:0, pointerEvents:"auto" }}>
                      <Character pose={pose} accent={accent} colors={colors} kind={kind} onTap={onTapGirl} tapBurst={tapGirl} facialHair={profile?.facial_hair || "none"} accessory={profile?.accessory || "none"} />
                      <Cat pose={pose} accent={accent} colors={colors} onTap={onTapCat} tapBurst={tapCat} />
                    </div>
                  </div>
                  <Confetti active={pose === "dance"} accent={accent} />
                  {notif.text && <Notif text={notif.text} accent={accent} id={notif.id} />}
                </div>
              </div>
              <div className="bd-msgbar" style={{ padding:"9px 18px 7px", textAlign:"center", fontSize:12, color:accent, opacity:0.88, background:"rgba(0,0,0,0.28)", letterSpacing:0.2 }}>
                {curMsg}
              </div>
              <div style={{ textAlign:"center", fontSize:9.5, color:"rgba(255,255,255,0.32)", padding:"4px 0 8px", letterSpacing:0.5 }}>
                ✋ Tap your friend or Mochi · Drag any item to rearrange
              </div>
            </div>

            <div className="bd-rightcol">
              <div className="bd-panel" style={{ background:"rgba(255,255,255,0.038)", border:"1px solid rgba(255,255,255,0.07)", borderTop:"none", borderRadius:"0 0 20px 20px", padding:"14px 16px 18px", boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:14 }}>
                  <TimerRing elapsed={elapsed} duration={duration} accent={accent} />
                  <div style={{ display:"flex", flexDirection:"column", gap:7, flex:1 }}>
                    {!running && !isDone && (
                      <div style={{ display:"flex", gap:5 }}>
                        {[15, 25, 45, 60].map((d) => (
                          <button key={d} onClick={() => { setDuration(d); setElapsed(0); }}
                            style={{ flex:1, padding:"4px 0", borderRadius:8, border:"1px solid", fontSize:11, fontWeight:600, cursor:"pointer", borderColor: duration === d ? accent : "rgba(255,255,255,0.1)", background: duration === d ? accent + "20" : "transparent", color: duration === d ? accent : "rgba(255,255,255,0.3)" }}>
                            {d}m
                          </button>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", textAlign:"center" }}>
                      {sessions > 0 ? "🎯 " + sessions + " session" + (sessions !== 1 ? "s" : "") + " done!" : "Start your first session, friend!"}
                    </div>
                    {!isDone ? (
                      <button onClick={running ? pauseFocus : elapsed > 0 ? resumeFocus : startFocus}
                        style={{ padding:"10px 0", borderRadius:12, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg," + accent + "," + accent + "88)", color:"#fff", boxShadow:"0 4px 14px " + accent + "44" }}>
                        {running ? "⏸ Pause" : elapsed > 0 ? "▶ Resume" : "▶ Start Focus"}
                      </button>
                    ) : (
                      <button onClick={resetFocus} style={{ padding:"10px 0", borderRadius:12, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg," + accent + "," + accent + "88)", color:"#fff" }}>
                        ✨ New Session
                      </button>
                    )}
                    {elapsed > 0 && !isDone && (
                      <button onClick={resetFocus} style={{ padding:4, border:"none", background:"none", color:"rgba(255,255,255,0.22)", fontSize:11, cursor:"pointer" }}>↺ reset</button>
                    )}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:13 }}>
                  {[
                    { label: "💃 Dance", fn: doDance },
                    { label: "🍜 Eat", fn: doEat },
                    { label: "🐱 Feed", fn: doFeed },
                    { label: "💜 Pet Mochi", fn: doPet },
                    { label: "🌤️ Window perch", fn: doPerch },
                    { label: candleLit ? "🕯️ Candle ✓" : "🕯️ Light candle", fn: doCandle },
                    { label: "📞 Call a friend", fn: () => setContactsOpen(true) },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.fn}
                      style={{ padding:"9px 4px", borderRadius:11, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.7)", fontSize:10.5, fontWeight:600, cursor:"pointer", lineHeight:1.3, transition:"all 0.2s ease" }}>
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:11 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:2, color:"rgba(255,255,255,0.32)", flex:1, textAlign:"center", paddingLeft:24 }}>vibe + music</div>
                    <button onClick={toggleMute} aria-label={muted ? "Play music" : "Mute"}
                      style={{ minWidth:36, height:24, padding:"0 8px", borderRadius:6, border:"1px solid " + accent + "55", background: muted ? "rgba(255,255,255,0.03)" : accent + "22", color: muted ? "rgba(255,255,255,0.55)" : accent, fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                      {muted ? "▶ Play" : "🔊"}
                    </button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
                    {MOODS.map((m) => (
                      <button key={m.id} onClick={() => { setMood(m.id); void track("theme_change", { theme: m.id }); }}
                        style={{ padding:"7px 3px", borderRadius:10, border:"1px solid", fontSize:10, fontWeight:700, cursor:"pointer", textAlign:"center", borderColor: mood === m.id ? m.accent : "rgba(255,255,255,0.07)", background: mood === m.id ? m.accent + "22" : "rgba(255,255,255,0.02)", color: mood === m.id ? m.accent : "rgba(255,255,255,0.45)" }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:7 }}>{md.desc}</div>
                  {!musicStarted && (
                    <div style={{ textAlign:"center", fontSize:10, color:accent, opacity:0.7, marginTop:6 }}>
                      👋 Tap ▶ Play once to enable music
                    </div>
                  )}
                  {musicError && (
                    <div style={{ textAlign:"center", fontSize:10, color:"#fca5a5", marginTop:4 }}>{musicError}</div>
                  )}
                </div>
              </div>

              <footer style={{ marginTop:6, display:"flex", flexDirection:"column", alignItems:"center", gap:10, paddingBottom:6 }}>
                <a href="https://ko-fi.com/creativefactorystudio" target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 16px", borderRadius:20, background:"#13C3FF", color:"#fff", fontWeight:700, fontSize:13, textDecoration:"none", boxShadow:"0 4px 14px rgba(19,195,255,0.4)" }}>
                  <span style={{ fontSize:15 }}>☕</span> Support on Ko-fi
                </a>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.32)", letterSpacing:0.4 }}>
                  made with 💜 by <span style={{ color: accent }}>CreativeFactory.studio</span>
                </div>
              </footer>
            </div>
          </div>
        </div>

        {todoOpen && (
          <div onClick={() => setTodoOpen(false)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", backdropFilter:"blur(6px)", zIndex:60, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"60px 16px 16px", animation:"fadein 0.25s ease" }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ width:"100%", maxWidth:420, background:"linear-gradient(180deg,#181028,#0e0a18)", border:"1px solid " + accent + "44", borderRadius:18, padding:18, color:"#f1f5f9" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:accent, opacity:0.7 }}>focus list</div>
                  <h2 style={{ margin:"2px 0 0", fontSize:18, fontWeight:800 }}>To-dos, friend</h2>
                </div>
                <button onClick={() => setTodoOpen(false)} aria-label="Close"
                  style={{ width:30, height:30, borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.6)", fontSize:16, cursor:"pointer" }}>✕</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); addTodo(); }} style={{ display:"flex", gap:6, marginBottom:12 }}>
                <input value={todoInput} onChange={(e) => setTodoInput(e.target.value)} placeholder="Add a task…" autoFocus
                  style={{ flex:1, padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                <button type="submit" style={{ padding:"0 14px", borderRadius:10, border:"none", background:accent, color:"#0a0a0a", fontWeight:800, fontSize:13, cursor:"pointer" }}>Add</button>
              </form>
              <div style={{ maxHeight:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                {todos.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"24px 8px", color:"rgba(255,255,255,0.35)", fontSize:12 }}>No tasks yet — add one above ✨</div>
                ) : todos.map((t) => (
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                    <button onClick={() => toggleTodo(t.id)} aria-label="Toggle"
                      style={{ width:20, height:20, borderRadius:6, border:"2px solid " + (t.done ? accent : "rgba(255,255,255,0.25)"), background: t.done ? accent : "transparent", color:"#0a0a0a", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, flexShrink:0 }}>
                      {t.done ? "✓" : ""}
                    </button>
                    <div style={{ flex:1, fontSize:13, color: t.done ? "rgba(255,255,255,0.35)" : "#f1f5f9", textDecoration: t.done ? "line-through" : "none", wordBreak:"break-word" }}>{t.text}</div>
                    <button onClick={() => removeTodo(t.id)} aria-label="Remove"
                      style={{ width:24, height:24, borderRadius:6, border:"none", background:"transparent", color:"rgba(255,255,255,0.3)", fontSize:14, cursor:"pointer" }}>×</button>
                  </div>
                ))}
              </div>
              {todos.length > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontSize:11, color:"rgba(255,255,255,0.4)" }}>
                  <span>{remaining} left · {todos.length - remaining} done</span>
                  <button onClick={() => setTodos((p) => p.filter((t) => !t.done))}
                    style={{ background:"none", border:"none", color:accent, fontSize:11, cursor:"pointer", fontWeight:600 }}>Clear completed</button>
                </div>
              )}
            </div>
          </div>
        )}

        {charOpen && <CharacterEditor onClose={() => setCharOpen(false)} onReplayIntro={replayIntro} resetLayout={resetLayout} kind={kind} />}
        {contactsOpen && <ContactsModal onClose={() => setContactsOpen(false)} accent={accent} userId={user?.id || null} onCall={() => { void track("phone_call"); doPhone(); }} onText={() => void track("phone_sms")} />}
        {onbOpen && <Onboarding onComplete={closeOnboarding} />}
      </main>
    </>
  );
}

function topBtn(accent: string): React.CSSProperties {
  return {
    padding:"6px 10px", borderRadius:10, border:"1px solid " + accent + "55",
    background:"rgba(0,0,0,0.45)", backdropFilter:"blur(10px)",
    color:accent, fontSize:11, fontWeight:700, cursor:"pointer",
    display:"inline-flex", alignItems:"center", gap:4,
  };
}
