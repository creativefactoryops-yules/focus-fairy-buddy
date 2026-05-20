import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    meta: [
      { title: "Body Double · Focus with your pixel friend & Mochi" },
      { name: "description", content: "A cozy ADHD body-doubling companion: pixel girl, her cat Mochi, focus timer, dance/eat/feed/phone breaks, themed music." },
    ],
  }),
});

// CC0 / royalty-free streams (incompetech + soundhelix)
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
  idle:   ["Hey friend! Ready when you are ✨","I'm right here with you 💜","Take your time, friend — I'm not going anywhere 🌸"],
  work:   ["We're locked in together! 💪","You're doing so well, friend 🧠","Stay in flow, I've got you ✨","One thing at a time 🌟"],
  dance:  ["BREAK TIME!! Shake it out!! 🎉","You earned this, friend — dance it out! 💃","Mochi is vibing too 🐱🎵"],
  eat:    ["Fuel up, friend! You need this 🍜","Don't skip it — we're eating together! 🥣","Nourish that brilliant brain 🌸"],
  feed:   ["Mochi is SO happy right now 🐱","Look at him go!! 🥰","He was waiting patiently 💜"],
  perch:  ["Mochi found his sunny spot 🌤️","Window watch mode activated 🐱","He's bird-watching, shhh 🍃"],
  pet:    ["Pets pets pets 💜","Mochi is purring so loud 🐱✨","Soft kitty, warm kitty 🌸"],
  candle: ["Candle lit — cozy mode on 🕯️","Tiny ritual, big calm ✨","Soft glow, soft brain 💛"],
  phone:  ["Calling a friend — connection time 📞","You're not alone, friend 💜","Hearing a voice helps — pick up! ☎️"],
};

const CSS = `
@keyframes breathe   { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.965)} }
@keyframes headbob   { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-3deg)} }
@keyframes gblink    { 0%,88%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.07)} }
@keyframes typeL     { 0%,100%{transform:rotate(0) translateY(0)} 50%{transform:rotate(-14deg) translateY(-2px)} }
@keyframes typeR     { 0%,100%{transform:rotate(0) translateY(0)} 50%{transform:rotate(14deg) translateY(-2px)} }
@keyframes ponyIdle  { 0%,100%{transform:rotate(10deg)} 50%{transform:rotate(5deg)} }
@keyframes girlSway  { 0%,100%{transform:translateX(0) rotate(0)} 25%{transform:translateX(-6px) rotate(-6deg)} 75%{transform:translateX(6px) rotate(6deg)} }
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
@keyframes rainbowSky { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes unicornFloat { 0%{transform:translate(0,0) rotate(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translate(40px,-80px) rotate(20deg);opacity:0} }
@keyframes wmDrift    { 0%{background-position:0 0} 100%{background-position:240px -240px} }
.bd-app button { font-family:inherit; }
.bd-app .wm { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.05; mix-blend-mode:overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='80' viewBox='0 0 320 80'><text x='0' y='52' font-family='Georgia,serif' font-style='italic' font-weight='700' font-size='30' fill='white' letter-spacing='2'>bodydoubleCFS bodydoubleCFS</text></svg>");
  background-size: 320px 80px; background-repeat: repeat; transform: rotate(-14deg) scale(1.4); animation: wmDrift 60s linear infinite; }
.bd-stage { position:relative; width:100%; padding-top:60%; border-radius:20px 20px 0 0; overflow:hidden; border:1px solid rgba(255,255,255,0.07); border-bottom:none; box-shadow:0 -4px 24px rgba(0,0,0,0.5); }
@media (min-width: 900px) {
  .bd-shell { max-width: 1100px !important; }
  .bd-grid { display: grid; grid-template-columns: 1.45fr 1fr; gap: 22px; align-items: start; }
  .bd-stage { padding-top: 62%; border-radius: 20px !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
  .bd-panel { border-radius: 20px !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
  .bd-msgbar { border-radius: 0 !important; }
  .bd-rightcol { display:flex; flex-direction:column; gap:14px; }
}
@media (min-width: 1280px) { .bd-shell { max-width: 1280px !important; } }
`;

type CharColors = { hair: string; skin: string; outfit?: string | null; fur: string };

function Girl({ pose, accent, colors }: { pose: string; accent: string; colors: CharColors }) {
  const { hair, skin } = colors;
  const pants = "#374151";
  const outfit = colors.outfit || accent;
  const isDancing = pose === "dance", isEating = pose === "eat";
  const isFeeding = pose === "feed",  isWorking = pose === "work";
  const isPetting = pose === "pet",   isCandle = pose === "candle";
  const isPhone = pose === "phone";
  const btm = isDancing ? "22%" : "15%";
  const lean = isPetting ? "rotate(-14deg) translateX(-78%)" : "translateX(-82%)";
  // bigger / taller pixel girl (was 38 wide)
  return (
    <div style={{ position:"absolute", bottom:btm, left:"50%", transform:lean, transformOrigin:"bottom center", width:50, zIndex:5, transition:"bottom 0.55s cubic-bezier(0.34,1.56,0.64,1), transform 0.4s ease", animation: isDancing ? "girlSway 0.55s ease-in-out infinite" : "none" }}>
      <div style={{ position:"absolute", top:0, left:3, width:44, height:26, background:hair, borderRadius:"50% 50% 0 0", zIndex:0 }} />
      <div style={{ position:"absolute", top:3, left:7, width:36, height:31, background:skin, borderRadius:"45% 45% 40% 40%", zIndex:2, animation: isDancing ? "headDance 0.55s ease-in-out infinite" : isWorking ? "headbob 2s ease-in-out infinite" : "breathe 3.5s ease-in-out infinite" }}>
        <div style={{ position:"absolute", top:12, left:7, width:6, height:6, background:"#1e1b4b", borderRadius:"50%", animation:"gblink 4.5s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:12, left:9, width:2, height:2, background:"white", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:12, right:7, width:6, height:6, background:"#1e1b4b", borderRadius:"50%", animation:"gblink 4.5s ease-in-out 0.4s infinite" }} />
        <div style={{ position:"absolute", top:12, right:9, width:2, height:2, background:"white", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:6, left:"50%", transform:"translateX(-50%)", width:10, height:4, borderBottom:"2px solid #c87941", borderLeft:"1px solid #c87941", borderRight:"1px solid #c87941", borderRadius:"0 0 5px 5px", animation: isEating ? "chew 0.9s ease-in-out infinite" : "none" }} />
        <div style={{ position:"absolute", bottom:9, left:3, width:7, height:4, background:"rgba(255,130,100,0.32)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:9, right:3, width:7, height:4, background:"rgba(255,130,100,0.32)", borderRadius:"50%" }} />
      </div>
      <div style={{ position:"absolute", top:3, left:4, width:18, height:13, background:hair, borderRadius:"50% 30% 40% 50%", zIndex:3 }} />
      <div style={{ position:"absolute", top:1, left:21, width:12, height:9, background:hair, borderRadius:"30% 50% 50% 30%", zIndex:3 }} />
      <div style={{ position:"absolute", top:5, right:0, width:10, height:21, background:hair, borderRadius:"40% 60% 60% 40%", zIndex:1, transformOrigin:"top center", animation: isDancing ? "ponyDance 0.4s ease-in-out infinite" : "ponyIdle 3s ease-in-out infinite" }} />
      {/* Left arm */}
      <div style={{ position:"absolute", top: isDancing ? 38 : 33, left: isDancing ? -6 : 1, width:7, height: isPetting ? 22 : 20, background:skin, borderRadius:5, zIndex:1, transformOrigin: "top center", animation: isDancing ? "waveL 0.52s ease-in-out infinite" : isFeeding ? "reachL 1.4s ease-in-out infinite" : isPetting ? "petArm 0.65s ease-in-out infinite" : isWorking ? "typeL 0.38s ease-in-out infinite" : "none", transition:"top 0.4s ease,left 0.4s ease" }} />
      {/* Torso / outfit (NEW outfit: cropped sweater + skirt look via gradient) */}
      <div style={{ position:"absolute", top:31, left:5, width:40, height:25, background: "linear-gradient(180deg," + outfit + "ee 0%," + outfit + "cc 60%," + outfit + "dd 100%)", borderRadius:"22% 22% 12% 12%", zIndex:2, animation: isPetting ? "girlSway 0.7s ease-in-out infinite" : "breathe 3s ease-in-out infinite", boxShadow:"inset 0 2px 0 rgba(255,255,255,0.18)" }}>
        {/* outfit detail: collar */}
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:14, height:3, background:"rgba(255,255,255,0.35)", borderRadius:"0 0 6px 6px" }} />
        {/* belt line */}
        <div style={{ position:"absolute", bottom:8, left:0, right:0, height:2, background:"rgba(0,0,0,0.18)" }} />
      </div>
      {/* Right arm */}
      <div style={{ position:"absolute", top: isDancing ? 38 : 33, right: isDancing ? -6 : 1, width:7, height: isEating ? 22 : isCandle || isPhone ? 22 : 20, background:skin, borderRadius:5, zIndex:isPhone ? 7 : 1, transformOrigin: isDancing || isEating || isCandle || isPhone ? "bottom center" : "top center", animation: isDancing ? "waveR 0.52s ease-in-out 0.26s infinite" : isEating ? "eatArm 1.1s ease-in-out infinite" : isCandle ? "girlReachSwing 0.9s ease-in-out infinite" : isPhone ? "phoneArm 1.6s ease-in-out infinite" : isWorking ? "typeR 0.38s ease-in-out 0.19s infinite" : "none", transition:"top 0.4s ease,right 0.4s ease" }} />
      {/* Phone in hand when on call */}
      {isPhone && (
        <div style={{ position:"absolute", top:30, right:-4, width:10, height:14, background:"#fb7185", borderRadius:"30% 30% 50% 50%", zIndex:8, boxShadow:"0 1px 3px rgba(0,0,0,0.4)", border:"1px solid #be123c", animation:"phoneRing 0.6s ease-in-out infinite" }}>
          <div style={{ position:"absolute", top:2, left:2, right:2, height:3, background:"rgba(0,0,0,0.3)", borderRadius:1 }} />
        </div>
      )}
      {isEating && <div style={{ position:"absolute", top:33, right:0, width:2, height:18, background:"#9ca3af", borderRadius:1, transformOrigin:"bottom center", animation:"eatArm 1.1s ease-in-out infinite", zIndex:6 }} />}
      <div style={{ position:"absolute", top:54, left:5, width:40, height: isDancing ? 24 : 17, background:pants, borderRadius:"0 0 10px 10px", zIndex:2, transition:"height 0.4s ease" }} />
      {isDancing && <>
        <div style={{ position:"absolute", top:74, left:6, width:16, height:20, background:pants, borderRadius:"0 0 6px 6px", transformOrigin:"top center", animation:"kickL 0.55s ease-in-out infinite", zIndex:2 }} />
        <div style={{ position:"absolute", top:74, right:6, width:16, height:20, background:pants, borderRadius:"0 0 6px 6px", transformOrigin:"top center", animation:"kickR 0.55s ease-in-out 0.27s infinite", zIndex:2 }} />
      </>}
      <div style={{ position:"absolute", bottom:0, left:4, width:17, height:7, background:"#111", borderRadius:"40% 40% 50% 50%", zIndex:3 }} />
      <div style={{ position:"absolute", bottom:0, right:4, width:17, height:7, background:"#111", borderRadius:"40% 40% 50% 50%", zIndex:3 }} />
      {isEating && (
        <div style={{ position:"absolute", top:62, left:12, width:28, height:9, background:"#f8fafc", borderRadius:"50%", border:"1.5px solid #e2e8f0", zIndex:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:20, height:5, borderRadius:"50%", background:"#fde68a" }} />
        </div>
      )}
      {isFeeding && (
        <div style={{ position:"absolute", bottom:-18, left:-16, zIndex:4 }}>
          <div style={{ width:28, height:12, background:"#7c3aed", borderRadius:"0 0 14px 14px", border:"2px solid #5b21b6", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:2, left:3, right:3, height:6, background:"rgba(255,200,80,0.7)", borderRadius:4 }} />
          </div>
          <div style={{ position:"absolute", top:-1, left:-1, width:30, height:6, background:"#8b5cf6", borderRadius:"50%" }} />
        </div>
      )}
    </div>
  );
}

function Cat({ pose, accent, colors }: { pose: string; accent: string; colors: CharColors }) {
  const fur = colors.fur;
  const dark = "#000";
  const isDancing = pose === "dance", isFeeding = pose === "feed";
  const isPerch = pose === "perch", isPet = pose === "pet";
  // Sit ON the perch shelf, not floating above
  const posStyle: React.CSSProperties = isPerch
    ? { top:"calc(5% + 46px)", left:"50%", bottom:"auto", transform:"translateX(-50%)" }
    : isPet
    ? { bottom:"15%", left:"32%" }
    : { bottom: isDancing || isFeeding ? "18%" : "26%", left:"18%" };
  const anim = isDancing ? "catDance 0.8s ease-in-out infinite"
    : isFeeding ? "catEatBob 0.9s ease-in-out infinite"
    : isPerch ? "perchBreathe 1.8s ease-in-out infinite"
    : isPet ? "purrPaw 0.32s ease-in-out infinite"
    : "catwalk 8s ease-in-out 1s infinite";
  return (
    <div style={{ position:"absolute", width:32, height:28, zIndex:6, transition:"bottom 0.5s ease, top 0.5s ease, left 0.5s ease", animation: anim, transformOrigin: isPerch ? "bottom center" : undefined, ...posStyle }}>
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

function Room({ mood, pose, accent, candleLit }: { mood: string; pose: string; accent: string; candleLit: boolean }) {
  const md = MOODS.find((m) => m.id === mood) || MOODS[0];
  const raining = mood === "storm", isWorking = pose === "work", isDancing = pose === "dance";
  const isRainbow = mood === "rainbow";
  // Rotary phone color cycles to complement Mochi's purple fur (uses hue-rotate filter)
  const phoneBase = accent;
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
      {/* Window */}
      <div style={{ position:"absolute", top:"5%", left:"50%", transform:"translateX(-50%)", width:90, height:74, border:"3px solid #4b3b2a", borderRadius:4, overflow:"hidden", boxShadow:"inset 0 0 16px rgba(0,0,0,0.6)" }}>
        <div style={{ position:"absolute", inset:0, background: md.sky + "dd" }} />
        {raining && Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{ position:"absolute", top:0, left:(i * 14) + "%", width:1, height:8, background:"rgba(147,197,253,0.4)", animation:"raindrop " + (0.44 + i * 0.06) + "s linear " + (i * 0.07) + "s infinite" }} />
        ))}
        <div style={{ position:"absolute", top:0, left:"50%", width:2, height:"100%", background:"#4b3b2a" }} />
        <div style={{ position:"absolute", top:"50%", left:0, width:"100%", height:2, background:"#4b3b2a" }} />
      </div>
      {/* Window perch shelf */}
      <div style={{ position:"absolute", top:"calc(5% + 72px)", left:"50%", transform:"translateX(-50%)", width:104, height:6, background:"#6b4a2a", borderRadius:"2px 2px 1px 1px", boxShadow:"0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)", zIndex:3 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:"#8a6438" }} />
        <div style={{ position:"absolute", top:-3, left:"50%", transform:"translateX(-50%)", width:38, height:4, background: accent + "44", borderRadius:3, border:"1px solid " + accent + "55" }} />
      </div>
      {/* Salvador Dalí painting */}
      <div style={{ position:"absolute", top:"16%", left:"6%", width:30, height:26, background:"#2a1a0d", border:"2px solid #6b4a2a", borderRadius:2, boxShadow:"0 3px 8px rgba(0,0,0,0.55)", zIndex:1, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,#d4a574 0%,#c97f4a 45%,#3a2418 70%,#1a0f08 100%)" }} />
        <div style={{ position:"absolute", top:"55%", left:0, right:0, height:1, background:"rgba(0,0,0,0.4)" }} />
        <div style={{ position:"absolute", top:7, left:5, width:14, height:8, background:"#e8c97a", borderRadius:"50%", transform:"rotate(-8deg)" }} />
        <div style={{ position:"absolute", top:13, left:9, width:3, height:6, background:"#e8c97a", borderRadius:"40% 40% 50% 50%", animation:"dripDali 3.4s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:1, right:2, fontSize:4, color:"rgba(232,201,122,0.55)", fontStyle:"italic" }}>Dalí</div>
      </div>
      {/* Framed monogram */}
      <div style={{ position:"absolute", top:"17%", right:"6%", width:28, height:28, background:"#f5e6c8", border:"2px solid #6b4a2a", borderRadius:2, boxShadow:"0 3px 8px rgba(0,0,0,0.5)", zIndex:1, padding:2 }}>
        <img src="/cf-monogram.png" alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
      </div>
      {/* Hanging plant */}
      <div style={{ position:"absolute", top:0, left:"22%", width:24, zIndex:2, transformOrigin:"top center", animation:"hangSway 5.5s ease-in-out infinite" }}>
        <div style={{ width:1, height:18, background:"#6b4a2a", margin:"0 auto" }} />
        <div style={{ position:"relative", width:24, height:10, margin:"-1px auto 0", background:"linear-gradient(to bottom,#b45309,#7c2d12)", borderRadius:"3px 3px 8px 8px" }} />
        <div style={{ position:"absolute", top:24, left:1, width:5, height:18, background:"linear-gradient(to bottom,#16a34a,#15803d)", borderRadius:"40% 50% 50% 50%", transform:"rotate(-12deg)" }} />
        <div style={{ position:"absolute", top:24, right:1, width:5, height:22, background:"linear-gradient(to bottom,#22c55e,#166534)", borderRadius:"50% 40% 50% 50%", transform:"rotate(10deg)" }} />
        <div style={{ position:"absolute", top:22, left:9, width:6, height:14, background:"#15803d", borderRadius:"50%" }} />
      </div>
      {/* Cat tree on the left wall — for Mochi */}
      <div style={{ position:"absolute", bottom:"24%", left:"3%", width:18, height:"55%", zIndex:2 }}>
        {/* base */}
        <div style={{ position:"absolute", bottom:0, left:-3, width:24, height:5, background:"#5c4a35", borderRadius:2, boxShadow:"0 2px 4px rgba(0,0,0,0.45)" }} />
        {/* trunk wrapped in sisal */}
        <div style={{ position:"absolute", bottom:5, left:6, width:6, height:"100%", background:"repeating-linear-gradient(0deg,#c69d6a 0 3px,#a87844 3px 6px)", borderRadius:2, boxShadow:"inset -1px 0 0 rgba(0,0,0,0.25)" }} />
        {/* lower platform */}
        <div style={{ position:"absolute", bottom:"35%", left:-3, width:24, height:5, background:"#6b4a2a", borderRadius:3 }}>
          <div style={{ position:"absolute", top:-2, left:2, right:2, height:2, background: accent + "55", borderRadius:2 }} />
        </div>
        {/* top platform with cushion */}
        <div style={{ position:"absolute", top:0, left:-5, width:28, height:6, background:"#6b4a2a", borderRadius:3, boxShadow:"0 2px 5px rgba(0,0,0,0.45)" }}>
          <div style={{ position:"absolute", top:-3, left:3, right:3, height:4, background: accent + "55", borderRadius:3, border:"1px solid " + accent + "66" }} />
        </div>
        {/* dangling toy */}
        <div style={{ position:"absolute", top:6, left:14, width:1, height:10, background:"#9ca3af" }} />
        <div style={{ position:"absolute", top:15, left:11, width:6, height:6, borderRadius:"50%", background:"#ec4899", boxShadow:"0 0 6px rgba(236,72,153,0.6)" }} />
      </div>
      {/* Rotary vintage phone on right side of desk */}
      <div style={{ position:"absolute", bottom:"calc(24% + 16px)", right:"4%", width:24, height:18, zIndex:3, animation:"phoneHueCycle 14s linear infinite", filter: pose === "phone" ? "drop-shadow(0 0 10px " + accent + "aa)" : "none" }}>
        {/* base */}
        <div style={{ position:"absolute", bottom:0, left:0, width:24, height:10, background:"linear-gradient(180deg," + phoneBase + "," + phoneBase + "aa)", borderRadius:"50% 50% 30% 30% / 60% 60% 40% 40%", border:"1.5px solid rgba(0,0,0,0.4)", boxShadow:"0 2px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.3)" }} />
        {/* rotary dial */}
        <div style={{ position:"absolute", bottom:1, left:7, width:10, height:8, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), " + phoneBase + " 60%, rgba(0,0,0,0.35))", border:"1px solid rgba(0,0,0,0.4)" }}>
          <div style={{ position:"absolute", top:2, left:4, width:2, height:2, background:"rgba(0,0,0,0.5)", borderRadius:"50%" }} />
        </div>
        {/* handset cradle */}
        <div style={{ position:"absolute", top:0, left:2, width:20, height:5, background: phoneBase, borderRadius:"40% 40% 50% 50%", border:"1.5px solid rgba(0,0,0,0.45)", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.35)" }} />
        {/* coiled cord */}
        <div style={{ position:"absolute", top:4, left:-6, width:8, height:14, borderLeft:"1.5px solid " + phoneBase, borderRadius:"50%", transform:"rotate(-10deg)" }} />
        <div style={{ position:"absolute", top:8, left:-9, width:6, height:5, borderLeft:"1.5px solid " + phoneBase, borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:12, left:-11, width:5, height:5, borderLeft:"1.5px solid " + phoneBase, borderRadius:"50%" }} />
        {pose === "phone" && Array.from({ length: 3 }, (_, i) => (
          <div key={i} style={{ position:"absolute", top:-6, left: 6 + i*4, fontSize:8, color:accent, opacity:0, animation:"floatnote 1.4s ease-out " + (i*0.3) + "s infinite" }}>♪</div>
        ))}
      </div>
      {/* small abstract canvas */}
      <div style={{ position:"absolute", top:"30%", right:"4%", width:22, height:14, background:"linear-gradient(135deg,#fbbf24 0%,#fbbf24 40%,#ec4899 40%,#ec4899 70%,#60a5fa 70%)", border:"1.5px solid #3b2a1a", borderRadius:1, zIndex:1 }} />
      {/* bookshelf */}
      <div style={{ position:"absolute", top:"18%", right:"7%", width:34, height:64, background:"#3b2a1a", borderRadius:3, overflow:"hidden" }}>
        {["#dc2626","#2563eb","#059669","#d97706","#7c3aed","#ec4899"].map((c, i) => (
          <div key={i} style={{ position:"absolute", bottom: 3 + i * 10, left:3, width: 3 + (i % 3) * 2, height:8, background:c, borderRadius:"1px 1px 0 0" }} />
        ))}
      </div>
      {/* String lights */}
      <div style={{ position:"absolute", top:"2.5%", left:"5%", right:"5%", height:2 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"rgba(255,255,255,0.1)", borderRadius:1 }} />
        {Array.from({ length: 11 }, (_, i) => {
          const cs = [accent, "#fbbf24", "#f472b6", "#34d399"];
          return <div key={i} style={{ position:"absolute", top:1, left:(i * 9.5) + "%", width:5, height:5, borderRadius:"50%", background:cs[i % 4], boxShadow:"0 0 5px " + cs[i % 4], animation:"flicker " + (2.4 + i * 0.3) + "s ease-in-out " + (i * 0.22) + "s infinite" }} />;
        })}
      </div>
      {/* floor + desk */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"28%", background:"#1c1208" }} />
      <div style={{ position:"absolute", bottom:"28%", left:0, right:0, height:2, background:"rgba(0,0,0,0.3)" }} />
      <div style={{ position:"absolute", bottom:"24%", left:"9%", right:"9%", height:17, background:"#4b3b2a", borderRadius:"3px 3px 0 0", boxShadow:"0 4px 16px rgba(0,0,0,0.5)" }} />
      <div style={{ position:"absolute", bottom:"24%", left:"9%", right:"9%", height:3, background:"#5c4a35", borderRadius:"3px 3px 0 0" }} />
      {/* Money tree */}
      <div style={{ position:"absolute", bottom:"calc(24% + 16px)", left:"22%", width:18, height:22, zIndex:3 }}>
        <div style={{ position:"absolute", bottom:0, left:2, width:14, height:8, background:"linear-gradient(to bottom,#b45309,#7c2d12)", borderRadius:"1px 1px 3px 3px" }} />
        <div style={{ position:"absolute", bottom:7, left:1, width:16, height:2, background:"#92400e", borderRadius:1 }} />
        <div style={{ position:"absolute", bottom:8, left:8, width:2, height:6, background:"#3f2410", borderRadius:1 }} />
        <div style={{ position:"absolute", bottom:11, left:0, width:9, height:9, background:"#15803d", borderRadius:"60% 50% 50% 60%" }} />
        <div style={{ position:"absolute", bottom:12, left:6, width:11, height:10, background:"#16a34a", borderRadius:"50% 60% 55% 50%" }} />
        <div style={{ position:"absolute", bottom:15, left:3, width:9, height:8, background:"#22c55e", borderRadius:"50% 60% 50% 60%" }} />
        <div style={{ position:"absolute", bottom:8, left:6, width:6, height:1.5, background:"#dc2626", borderRadius:1 }} />
      </div>
      {/* Candle */}
      <div style={{ position:"absolute", bottom:"calc(24% + 16px)", left:"40%", width:12, height:20, zIndex:3 }}>
        <div style={{ position:"absolute", bottom:0, left:0, width:12, height:2, background:"#1f1f1f", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:1, left:2, width:8, height:12, background:"linear-gradient(to right,#f5e6c8,#d9c08a,#f5e6c8)", borderRadius:"1px 1px 0 0" }} />
        <div style={{ position:"absolute", bottom:13, left:5.5, width:1, height: candleLit ? 1.5 : 3, background:"#1a1a1a" }} />
        {candleLit && (
          <>
            <div style={{ position:"absolute", bottom:14, left:"50%", width:4, height:7, background:"radial-gradient(ellipse at center bottom,#fff4a3 10%,#fbbf24 50%,#f97316 85%)", borderRadius:"50% 50% 40% 40% / 70% 70% 30% 30%", transformOrigin:"bottom center", animation:"flame 0.32s ease-in-out infinite", boxShadow:"0 0 8px #fbbf24cc, 0 0 16px #f9731688" }} />
            <div style={{ position:"absolute", bottom:13, left:"50%", transform:"translateX(-50%)", width:14, height:14, background:"radial-gradient(circle,#fbbf2433 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
          </>
        )}
      </div>
      {/* desk legs */}
      <div style={{ position:"absolute", bottom:0, left:"13%", width:8, height:"25%", background:"#3b2a1a", borderRadius:"0 0 3px 3px" }} />
      <div style={{ position:"absolute", bottom:0, right:"13%", width:8, height:"25%", background:"#3b2a1a", borderRadius:"0 0 3px 3px" }} />
      {/* monitor */}
      <div style={{ position:"absolute", bottom:"37%", left:"50%", transform:"translateX(-50%)", width:46, height:32, background:"#111", borderRadius:3, border:"2px solid #374151", animation:"screenglo 3s ease-in-out infinite", boxShadow:"0 0 12px " + accent + "55" }}>
        <div style={{ position:"absolute", inset:2, background:md.sky, borderRadius:2, overflow:"hidden" }}>
          <div style={{ position:"absolute", top:2, left:2, right:2, height:2, background: accent + "44", borderRadius:1 }} />
          {[6, 9, 12, 15].map((t, i) => (
            <div key={i} style={{ position:"absolute", top:t, left:2, right: 4 + i * 3, height:1, background:"rgba(255,255,255," + (0.12 - i * 0.02) + ")", borderRadius:1 }} />
          ))}
          {isWorking && <div style={{ position:"absolute", top:6, left:2, width:2, height:10, background:accent, animation:"pulseglo 0.8s ease-in-out infinite" }} />}
        </div>
      </div>
      <div style={{ position:"absolute", bottom:"36%", left:"50%", transform:"translateX(-50%)", width:9, height:5, background:"#374151" }} />
      <div style={{ position:"absolute", bottom:"35%", left:"50%", transform:"translateX(-50%)", width:20, height:3, background:"#4b5563", borderRadius:1 }} />
      {/* mug */}
      <div style={{ position:"absolute", bottom:"37.5%", right:"21%" }}>
        <div style={{ width:11, height:11, background:"#7c3aed", borderRadius:"20% 20% 30% 30%", border:"1.5px solid #5b21b6", position:"relative" }}>
          <div style={{ position:"absolute", top:2, right:-3, width:4, height:6, border:"1.5px solid #5b21b6", borderLeft:"none", borderRadius:"0 4px 4px 0" }} />
        </div>
        <div style={{ position:"absolute", top:-7, left:2, fontSize:7, color:"rgba(255,255,255,0.3)", animation:"floatnote 2.2s ease-out infinite" }}>~</div>
      </div>
      {/* floor cushion + pillows */}
      <div style={{ position:"absolute", bottom:"1%", left:"18%", right:"18%", height:7, background: accent + "15", borderRadius:4, border:"1px solid " + accent + "22" }} />
      <div style={{ position:"absolute", bottom:"2.5%", left:"20%", width:14, height:9, background:"linear-gradient(135deg,#f472b6,#db2777)", borderRadius:"45% 45% 35% 35%", border:"1px solid rgba(0,0,0,0.25)", zIndex:2 }} />
      <div style={{ position:"absolute", bottom:"2.5%", right:"21%", width:13, height:8, background:"linear-gradient(135deg,#fbbf24,#d97706)", borderRadius:"40% 40% 35% 35%", border:"1px solid rgba(0,0,0,0.25)", zIndex:2, transform:"rotate(-6deg)" }} />
      {/* flower vase */}
      <div style={{ position:"absolute", bottom:"calc(24% + 16px)", left:"32%", width:10, height:18, zIndex:4 }}>
        <div style={{ position:"absolute", bottom:0, left:1, width:8, height:7, background:"linear-gradient(to bottom,#a7f3d0,#34d399)", borderRadius:"30% 30% 50% 50%" }} />
        <div style={{ position:"absolute", bottom:7, left:4, width:1, height:7, background:"#15803d" }} />
        <div style={{ position:"absolute", bottom:12, left:3, width:4, height:4, background:"#ec4899", borderRadius:"50%", animation:"flowerNod 4.2s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:11, left:0, width:3.5, height:3.5, background:"#f59e0b", borderRadius:"50%", animation:"flowerNod 4.6s ease-in-out 0.4s infinite" }} />
        <div style={{ position:"absolute", bottom:12, right:0, width:3.5, height:3.5, background:"#a78bfa", borderRadius:"50%", animation:"flowerNod 4.4s ease-in-out 0.8s infinite" }} />
      </div>
      {isDancing && ["♪","♫","♩"].map((n, i) => (
        <div key={i} style={{ position:"absolute", top:"45%", left:(22 + i * 12) + "%", fontSize:13, color:accent, opacity:0, animation:"floatnote 2s ease-out " + (i * 0.75) + "s infinite" }}>{n}</div>
      ))}
      {pose === "pet" && ["💜","💕","💖","✨","💜"].map((h, i) => (
        <div key={"h"+i} style={{ position:"absolute", bottom:"32%", left:(28 + i * 4) + "%", fontSize:12, opacity:0, ["--dx" as any]: ((i % 2 ? 1 : -1) * (6 + i * 3)) + "px", animation:"heartFloat 1.6s ease-out " + (i * 0.32) + "s infinite" }}>{h}</div>
      ))}
      {pose === "candle" && Array.from({ length: 6 }, (_, i) => (
        <div key={"sp"+i} style={{ position:"absolute", bottom:"30%", left:(38 + (i % 3) * 3) + "%", width:3, height:3, borderRadius:"50%", background:"#fde68a", boxShadow:"0 0 6px #fbbf24", opacity:0, animation:"candleSparkle 1.4s ease-out " + (i * 0.22) + "s infinite" }} />
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

const HAIR_OPTIONS = ["#2d1b69","#7c2d12","#0f172a","#facc15","#dc2626","#a78bfa"];
const SKIN_OPTIONS = ["#f5c5a3","#e0a878","#c08763","#8b5a3c","#fde2d3","#5c3a24"];
const CAT_FUR_OPTIONS = [
  { fur:"#d4a0d4", label:"Lilac"   },
  { fur:"#f5e6c8", label:"Cream"   },
  { fur:"#3b2a1a", label:"Tuxedo"  },
  { fur:"#e8a76a", label:"Orange"  },
  { fur:"#9ca3af", label:"Silver"  },
  { fur:"#1f1f1f", label:"Onyx"    },
];

function CharacterEditor({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useAuth();
  const [hair, setHair] = useState(profile?.hair_color || HAIR_OPTIONS[0]);
  const [skin, setSkin] = useState(profile?.skin_color || SKIN_OPTIONS[0]);
  const [fur, setFur]   = useState(profile?.cat_fur_color || CAT_FUR_OPTIONS[0].fur);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    await updateProfile({ hair_color: hair, skin_color: skin, cat_fur_color: fur });
    setBusy(false); onClose();
  };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:70, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:"linear-gradient(180deg,#1a1228,#0e0a18)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:20, width:"100%", maxWidth:380, color:"#f1f5f9" }}>
        <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800 }}>Customize your friend</h2>
        <p style={{ margin:"0 0 14px", fontSize:12, color:"rgba(255,255,255,0.5)" }}>Pick your pixel-girl look and Mochi's coat.</p>
        <Swatches label="Hair"  values={HAIR_OPTIONS} selected={hair} onPick={setHair} />
        <Swatches label="Skin"  values={SKIN_OPTIONS} selected={skin} onPick={setSkin} />
        <Swatches label="Mochi" values={CAT_FUR_OPTIONS.map((c) => c.fur)} selected={fur} onPick={setFur} />
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={save} disabled={busy} style={{ ...btnSolid, flex:1 }}>{busy ? "Saving…" : "Save"}</button>
        </div>
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

function App() {
  const { user, profile, signOut } = useAuth();
  const [mood, setMood] = useState("focus");
  const [pose, setPose] = useState<PoseKey>("idle");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(25);
  const [sessions, setSessions] = useState(0);
  const [notif, setNotif] = useState({ text: "", id: 0 });
  const [msgIdx, setMsgIdx] = useState(0);
  const [muted, setMuted] = useState(true); // start muted; audio plays after user clicks the speaker
  const [musicStarted, setMusicStarted] = useState(false);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [candleLit, setCandleLit] = useState(true);
  const [todoOpen, setTodoOpen] = useState(false);
  const [charOpen, setCharOpen] = useState(false);
  const [todoInput, setTodoInput] = useState("");
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

  // Character colors from profile (or defaults)
  const colors: CharColors = {
    hair: profile?.hair_color || "#2d1b69",
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

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= total) {
            if (timerRef.current) clearInterval(timerRef.current);
            setRunning(false); setSessions((s) => s + 1);
            triggerPose("dance", 28, "🎉 Session done! Dance it out, friend!");
            return total;
          }
          return e + 1;
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

  // Music: only plays after user enables it (browsers block autoplay)
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio(); a.loop = true; a.volume = 0.35; a.preload = "auto";
      a.addEventListener("error", () => setMusicError("Track couldn't load — try another mood"));
      a.addEventListener("playing", () => setMusicError(null));
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (muted) { a.pause(); return; }
    if (a.src !== md.music) a.src = md.music;
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

  const startFocus  = () => { setElapsed(0); setRunning(true); setPose("work"); showNotif("🧠 Focus started, friend!"); };
  const pauseFocus  = () => { setRunning(false); setPose("idle"); };
  const resumeFocus = () => { setRunning(true); setPose("work"); };
  const resetFocus  = () => { setRunning(false); setElapsed(0); setPose("idle"); };
  const doDance = () => triggerPose("dance", 15, "💃 Dance break! Shake it out!");
  const doEat   = () => triggerPose("eat", 14, "🍜 Time to eat, friend — fuel up!");
  const doFeed  = () => triggerPose("feed", 12, "🐱 Feeding Mochi! He's so excited!");
  const doPerch = () => triggerPose("perch", 22, "🌤️ Mochi's on the window perch");
  const doPet   = () => triggerPose("pet", 14, "💜 Petting Mochi — purr engaged");
  const doCandle = () => { setCandleLit((v) => !v); triggerPose("candle", 8, candleLit ? "🌙 Candle out" : "🕯️ Candle lit — cozy ritual"); };
  const doPhone  = () => triggerPose("phone", 18, "📞 Calling a friend — you've got support");

  const msgs = MSGS[pose] || MSGS.idle;
  const curMsg = msgs[msgIdx % msgs.length];
  const displayName = profile?.display_name ? `Hi, ${profile.display_name} 💜` : "Hi, friend 💜";

  return (
    <>
      <style>{CSS}</style>
      <main className="bd-app" style={{ width:"100%", minHeight:"100vh", padding:"12px 14px 28px", background: md.bg, animation:"fadein 0.5s ease", fontFamily:"system-ui, sans-serif", transition:"background 0.5s ease", position:"relative", overflowX:"hidden" }}>
        <div className="wm" aria-hidden="true" />

        {/* Top bar */}
        <div style={{ position:"sticky", top:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 4px 10px", marginBottom:8, background:"linear-gradient(180deg," + md.bg + " 70%,transparent)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <img src="/cf-logo.png" alt="CreativeFactory.studio" style={{ width:36, height:36, objectFit:"contain", borderRadius:8, filter:"drop-shadow(0 0 6px " + accent + "88)" }} />
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.15 }}>
              <div style={{ fontWeight:800, color:"#f1f5f9", fontSize:12 }}>Body Double</div>
              <div>{displayName}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {user ? (
              <>
                <button onClick={() => setCharOpen(true)} style={topBtn(accent)}>🎨 Customize</button>
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
                  <Room mood={mood} pose={pose} accent={accent} candleLit={candleLit} />
                  <Girl pose={pose} accent={accent} colors={colors} />
                  <Cat pose={pose} accent={accent} colors={colors} />
                  <Confetti active={pose === "dance"} accent={accent} />
                  {notif.text && <Notif text={notif.text} accent={accent} id={notif.id} />}
                </div>
              </div>
              <div className="bd-msgbar" style={{ padding:"9px 18px 7px", textAlign:"center", fontSize:12, color:accent, opacity:0.88, background:"rgba(0,0,0,0.28)", letterSpacing:0.2 }}>
                {curMsg}
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
                    { label: "📞 Call a friend", fn: doPhone },
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
                      <button key={m.id} onClick={() => setMood(m.id)}
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

        {charOpen && <CharacterEditor onClose={() => setCharOpen(false)} />}
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
