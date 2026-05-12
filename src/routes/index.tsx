import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    meta: [
      { title: "Body Double · Focus with Yulia & Mochi" },
      { name: "description", content: "A cozy ADHD body-doubling companion with a pixel girl, her cat Mochi, focus timer, and dance/eat/feed breaks." },
    ],
  }),
});

const MOODS = [
  { id: "focus", label: "Focus", bg: "#0c160c", sky: "#07100a", accent: "#4ade80", desc: "Deep work 🌿",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "chill", label: "Chill", bg: "#0e0e1e", sky: "#080812", accent: "#818cf8", desc: "Easy flow 🌙",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "storm", label: "Storm", bg: "#0b1018", sky: "#070c10", accent: "#60a5fa", desc: "Power ⚡",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id: "cozy",  label: "Cozy",  bg: "#180f08", sky: "#100800", accent: "#fb923c", desc: "Warm 🕯️",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
];

type PoseKey = "idle" | "work" | "dance" | "eat" | "feed" | "perch" | "pet" | "candle";

const MSGS: Record<PoseKey, string[]> = {
  idle:   ["Hey Yulia! Ready when you are ✨","I'm right here with you 💜","Take your time, I'm not going anywhere 🌸"],
  work:   ["We're locked in together! 💪","You're doing so well 🧠","Stay in flow, I've got you ✨","One thing at a time 🌟"],
  dance:  ["BREAK TIME!! Shake it out!! 🎉","You earned this, dance it out! 💃","Mochi is vibing too 🐱🎵"],
  eat:    ["Fuel up! You need this 🍜","Don't skip it — we're eating together! 🥣","Nourish that ADHD brain 🌸"],
  feed:   ["Mochi is SO happy right now 🐱","Look at her go!! 🥰","She was waiting patiently 💜"],
  perch:  ["Mochi found her sunny spot 🌤️","Window watch mode activated 🐱","She's bird-watching, shhh 🍃"],
  pet:    ["Pets pets pets 💜","Mochi is purring so loud 🐱✨","Soft kitty, warm kitty 🌸"],
  candle: ["Candle lit — cozy mode on 🕯️","Tiny ritual, big calm ✨","Soft glow, soft brain 💛"],
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
@keyframes flame      { 0%,100%{transform:translateX(-50%) scaleY(1) scaleX(1);opacity:1} 50%{transform:translateX(-50%) scaleY(1.15) scaleX(0.88);opacity:0.92} }
@keyframes petArm     { 0%,100%{transform:rotate(70deg) translateY(4px)} 50%{transform:rotate(85deg) translateY(8px)} }
@keyframes purrPaw    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }
@keyframes perchBreathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.92)} }
@keyframes dripDali   { 0%,100%{transform:translateY(0) scaleY(1)} 50%{transform:translateY(2px) scaleY(1.1)} }
.bd-app button { font-family:inherit; }
`;

function Girl({ pose, accent }: { pose: string; accent: string }) {
  const skin = "#f5c5a3", hair = "#2d1b69", pants = "#374151";
  const isDancing = pose === "dance", isEating = pose === "eat";
  const isFeeding = pose === "feed",  isWorking = pose === "work";
  const isPetting = pose === "pet",   isCandle = pose === "candle";
  const btm = isDancing ? "22%" : "15%";
  const lean = isPetting ? "rotate(-14deg) translateX(-78%)" : "translateX(-82%)";
  return (
    <div style={{ position:"absolute", bottom:btm, left:"50%", transform:lean, transformOrigin:"bottom center", width:38, zIndex:5, transition:"bottom 0.55s cubic-bezier(0.34,1.56,0.64,1), transform 0.4s ease", animation: isDancing ? "girlSway 0.55s ease-in-out infinite" : "none" }}>
      <div style={{ position:"absolute", top:0, left:2, width:34, height:20, background:hair, borderRadius:"50% 50% 0 0", zIndex:0 }} />
      <div style={{ position:"absolute", top:2, left:5, width:28, height:24, background:skin, borderRadius:"45% 45% 40% 40%", zIndex:2, animation: isDancing ? "headDance 0.55s ease-in-out infinite" : isWorking ? "headbob 2s ease-in-out infinite" : "breathe 3.5s ease-in-out infinite" }}>
        <div style={{ position:"absolute", top:9, left:5, width:5, height:5, background:"#1e1b4b", borderRadius:"50%", animation:"gblink 4.5s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:9, left:7, width:2, height:2, background:"white", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:9, right:5, width:5, height:5, background:"#1e1b4b", borderRadius:"50%", animation:"gblink 4.5s ease-in-out 0.4s infinite" }} />
        <div style={{ position:"absolute", top:9, right:7, width:2, height:2, background:"white", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:5, left:"50%", transform:"translateX(-50%)", width:8, height:3, borderBottom:"2px solid #c87941", borderLeft:"1px solid #c87941", borderRight:"1px solid #c87941", borderRadius:"0 0 4px 4px", animation: isEating ? "chew 0.9s ease-in-out infinite" : "none" }} />
        <div style={{ position:"absolute", bottom:7, left:2, width:6, height:3, background:"rgba(255,130,100,0.32)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:7, right:2, width:6, height:3, background:"rgba(255,130,100,0.32)", borderRadius:"50%" }} />
      </div>
      <div style={{ position:"absolute", top:2, left:3, width:14, height:10, background:hair, borderRadius:"50% 30% 40% 50%", zIndex:3 }} />
      <div style={{ position:"absolute", top:1, left:16, width:9, height:7, background:hair, borderRadius:"30% 50% 50% 30%", zIndex:3 }} />
      <div style={{ position:"absolute", top:4, right:0, width:8, height:16, background:hair, borderRadius:"40% 60% 60% 40%", zIndex:1, transformOrigin:"top center", animation: isDancing ? "ponyDance 0.4s ease-in-out infinite" : "ponyIdle 3s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top: isDancing ? 30 : 26, left: isDancing ? -5 : 0, width:6, height: isPetting ? 18 : 16, background:skin, borderRadius:4, zIndex:1, transformOrigin: isDancing || isPetting ? "top center" : "top center", animation: isDancing ? "waveL 0.52s ease-in-out infinite" : isFeeding ? "reachL 1.4s ease-in-out infinite" : isPetting ? "petArm 1.2s ease-in-out infinite" : isWorking ? "typeL 0.38s ease-in-out infinite" : "none", transition:"top 0.4s ease,left 0.4s ease" }} />
      <div style={{ position:"absolute", top:24, left:4, width:30, height:20, background: accent + "cc", borderRadius:"20% 20% 10% 10%", zIndex:2, animation:"breathe 3s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top: isDancing ? 30 : 26, right: isDancing ? -5 : 0, width:6, height: isEating ? 18 : isCandle ? 18 : 16, background:skin, borderRadius:4, zIndex:1, transformOrigin: isDancing || isEating || isCandle ? "bottom center" : "top center", animation: isDancing ? "waveR 0.52s ease-in-out 0.26s infinite" : isEating ? "eatArm 1.1s ease-in-out infinite" : isCandle ? "reachL 1.6s ease-in-out infinite" : isWorking ? "typeR 0.38s ease-in-out 0.19s infinite" : "none", transition:"top 0.4s ease,right 0.4s ease" }} />
      {isEating && <div style={{ position:"absolute", top:26, right:0, width:2, height:14, background:"#9ca3af", borderRadius:1, transformOrigin:"bottom center", animation:"eatArm 1.1s ease-in-out infinite", zIndex:6 }} />}
      <div style={{ position:"absolute", top:42, left:4, width:30, height: isDancing ? 18 : 13, background:pants, borderRadius:"0 0 8px 8px", zIndex:2, transition:"height 0.4s ease" }} />
      {isDancing && <>
        <div style={{ position:"absolute", top:58, left:4, width:12, height:16, background:pants, borderRadius:"0 0 5px 5px", transformOrigin:"top center", animation:"kickL 0.55s ease-in-out infinite", zIndex:2 }} />
        <div style={{ position:"absolute", top:58, right:4, width:12, height:16, background:pants, borderRadius:"0 0 5px 5px", transformOrigin:"top center", animation:"kickR 0.55s ease-in-out 0.27s infinite", zIndex:2 }} />
      </>}
      <div style={{ position:"absolute", bottom:0, left:3, width:13, height:5, background:"#111", borderRadius:"40% 40% 50% 50%", zIndex:3 }} />
      <div style={{ position:"absolute", bottom:0, right:3, width:13, height:5, background:"#111", borderRadius:"40% 40% 50% 50%", zIndex:3 }} />
      {isEating && (
        <div style={{ position:"absolute", top:49, left:10, width:22, height:7, background:"#f8fafc", borderRadius:"50%", border:"1.5px solid #e2e8f0", zIndex:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:16, height:4, borderRadius:"50%", background:"#fde68a" }} />
        </div>
      )}
      {isFeeding && (
        <div style={{ position:"absolute", bottom:-18, left:-16, zIndex:4 }}>
          <div style={{ width:24, height:10, background:"#7c3aed", borderRadius:"0 0 12px 12px", border:"2px solid #5b21b6", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:2, left:3, right:3, height:5, background:"rgba(255,200,80,0.7)", borderRadius:4 }} />
          </div>
          <div style={{ position:"absolute", top:-1, left:-1, width:26, height:5, background:"#8b5cf6", borderRadius:"50%" }} />
        </div>
      )}
    </div>
  );
}

function Cat({ pose, accent }: { pose: string; accent: string }) {
  const fur = "#d4a0d4", dark = "#9b6b9b";
  const isDancing = pose === "dance", isFeeding = pose === "feed";
  const isPerch = pose === "perch", isPet = pose === "pet";
  // position overrides for special poses
  const posStyle: React.CSSProperties = isPerch
    ? { top:"15.5%", left:"50%", transform:"translateX(-50%)", bottom:"auto" }
    : isPet
    ? { bottom:"15%", left:"32%" }
    : { bottom: isDancing || isFeeding ? "18%" : "26%", left:"18%" };
  const anim = isDancing ? "catDance 0.8s ease-in-out infinite"
    : isFeeding ? "catEatBob 0.9s ease-in-out infinite"
    : isPerch ? "perchBreathe 3.4s ease-in-out infinite"
    : isPet ? "purrPaw 0.5s ease-in-out infinite"
    : "catwalk 8s ease-in-out 1s infinite";
  return (
    <div style={{ position:"absolute", width:32, height:28, zIndex:6, transition:"bottom 0.5s ease, top 0.5s ease, left 0.5s ease", animation: anim, ...posStyle }}>
      <div style={{ position:"absolute", top:0, left:3, width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderBottom:"9px solid " + fur }} />
      <div style={{ position:"absolute", top:0, right:3, width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderBottom:"9px solid " + fur }} />
      <div style={{ position:"absolute", top:2, left:5, width:0, height:0, borderLeft:"3px solid transparent", borderRight:"3px solid transparent", borderBottom:"5px solid " + dark + "55" }} />
      <div style={{ position:"absolute", top:2, right:5, width:0, height:0, borderLeft:"3px solid transparent", borderRight:"3px solid transparent", borderBottom:"5px solid " + dark + "55" }} />
      <div style={{ position:"absolute", top:5, left:2, width:28, height:18, background:fur, borderRadius:"50% 50% 40% 40%" }}>
        <div style={{ position:"absolute", top:5, left:5, width:5, height:5, background:accent, borderRadius:"50%", boxShadow:"0 0 4px " + accent, animation:"catblink 3.8s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:5, right:5, width:5, height:5, background:accent, borderRadius:"50%", boxShadow:"0 0 4px " + accent, animation:"catblink 3.8s ease-in-out 0.6s infinite" }} />
        <div style={{ position:"absolute", top:6, left:7, width:2, height:4, background:"#0a0a0a", borderRadius:1 }} />
        <div style={{ position:"absolute", top:6, right:7, width:2, height:4, background:"#0a0a0a", borderRadius:1 }} />
        <div style={{ position:"absolute", bottom:5, left:"50%", transform:"translateX(-50%)", width:4, height:3, background:"#f9a8d4", borderRadius:"40% 40% 50% 50%" }} />
        <div style={{ position:"absolute", top:8, left:-9, width:11, height:1, background:dark + "77", borderRadius:1 }} />
        <div style={{ position:"absolute", top:11, left:-9, width:11, height:1, background:dark + "77", borderRadius:1 }} />
        <div style={{ position:"absolute", top:8, right:-9, width:11, height:1, background:dark + "77", borderRadius:1 }} />
        <div style={{ position:"absolute", top:11, right:-9, width:11, height:1, background:dark + "77", borderRadius:1 }} />
      </div>
      <div style={{ position:"absolute", top:18, left:4, width:24, height:10, background:fur, borderRadius:"30% 30% 50% 50%" }} />
      <div style={{ position:"absolute", top:14, right:-10, width:11, height:7, borderTop:"3px solid " + fur, borderRight:"3px solid " + fur, borderRadius:"0 50% 50% 0", transformOrigin:"left center", animation: isDancing ? "tailFast 0.3s ease-in-out infinite" : "tailWag 2s ease-in-out infinite" }} />
      <div style={{ position:"absolute", bottom:0, left:4, width:8, height:5, background:fur, borderRadius:"50% 50% 40% 40%" }} />
      <div style={{ position:"absolute", bottom:0, right:4, width:8, height:5, background:fur, borderRadius:"50% 50% 40% 40%" }} />
    </div>
  );
}

function Room({ mood, pose, accent, candleLit }: { mood: string; pose: string; accent: string; candleLit: boolean }) {
  const md = MOODS.find((m) => m.id === mood) || MOODS[0];
  const raining = mood === "storm", isWorking = pose === "work", isDancing = pose === "dance";
  return (
    <>
      <div style={{ position:"absolute", inset:0, background:md.sky }} />
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{ position:"absolute", top:(8 + Math.sin(i * 1.8) * 28 + 22) + "%", left:(i * 4.9 % 92) + "%", width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 2 : 1, borderRadius:"50%", background: i % 7 === 0 ? accent : "#fff", opacity: 0.2 + (i % 3) * 0.14, animation: "startwink " + (2.4 + (i % 4) * 0.65) + "s ease-in-out " + (i * 0.3) + "s infinite" }} />
      ))}
      {raining && Array.from({ length: 24 }, (_, i) => (
        <div key={i} style={{ position:"absolute", top:0, left:(i * 4.2 % 100) + "%", width:1, height:10, background:"rgba(147,197,253,0.3)", animation:"raindrop " + (0.5 + (i % 5) * 0.07) + "s linear " + (i * 0.08) + "s infinite" }} />
      ))}
      <div style={{ position:"absolute", top:"7%", right:"14%", width:18, height:18, borderRadius:"50%", background:"#fef9c3", boxShadow:"0 0 10px rgba(254,249,195,0.5)", opacity: raining ? 0.2 : 0.82 }} />
      <div style={{ position:"absolute", top:"5%", left:"50%", transform:"translateX(-50%)", width:90, height:74, border:"3px solid #4b3b2a", borderRadius:4, overflow:"hidden", boxShadow:"inset 0 0 16px rgba(0,0,0,0.6)" }}>
        <div style={{ position:"absolute", inset:0, background: md.sky + "dd" }} />
        {raining && Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{ position:"absolute", top:0, left:(i * 14) + "%", width:1, height:8, background:"rgba(147,197,253,0.4)", animation:"raindrop " + (0.44 + i * 0.06) + "s linear " + (i * 0.07) + "s infinite" }} />
        ))}
        <div style={{ position:"absolute", top:0, left:"50%", width:2, height:"100%", background:"#4b3b2a" }} />
        <div style={{ position:"absolute", top:"50%", left:0, width:"100%", height:2, background:"#4b3b2a" }} />
        <div style={{ position:"absolute", top:0, left:0, width:14, height:"100%", background:"linear-gradient(to right,rgba(124,58,237,0.15),transparent)" }} />
        <div style={{ position:"absolute", top:0, right:0, width:14, height:"100%", background:"linear-gradient(to left,rgba(124,58,237,0.15),transparent)" }} />
      </div>
      {/* Window perch shelf — wooden ledge below window for Mochi */}
      <div style={{ position:"absolute", top:"calc(5% + 74px - 2px)", left:"50%", transform:"translateX(-50%)", width:104, height:6, background:"#6b4a2a", borderRadius:"2px 2px 1px 1px", boxShadow:"0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)", zIndex:3 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:"#8a6438" }} />
        {/* tiny cushion on perch */}
        <div style={{ position:"absolute", top:-3, left:"50%", transform:"translateX(-50%)", width:38, height:4, background: accent + "44", borderRadius:3, border:"1px solid " + accent + "55" }} />
      </div>
      {/* Salvador Dali — Persistence of Memory homage (melting clock) */}
      <div style={{ position:"absolute", top:"16%", left:"6%", width:30, height:26, background:"#2a1a0d", border:"2px solid #6b4a2a", borderRadius:2, boxShadow:"0 3px 8px rgba(0,0,0,0.55), inset 0 0 6px rgba(0,0,0,0.6)", zIndex:1, overflow:"hidden" }}>
        {/* surreal sky */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,#d4a574 0%,#c97f4a 45%,#3a2418 70%,#1a0f08 100%)" }} />
        {/* distant horizon line */}
        <div style={{ position:"absolute", top:"55%", left:0, right:0, height:1, background:"rgba(0,0,0,0.4)" }} />
        {/* melting clock draped over branch */}
        <div style={{ position:"absolute", top:7, left:5, width:14, height:8, background:"#e8c97a", borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%", boxShadow:"inset 0 -2px 0 rgba(0,0,0,0.25)", transform:"rotate(-8deg)" }}>
          <div style={{ position:"absolute", top:1.5, left:5, width:1, height:3, background:"#1a0f08" }} />
          <div style={{ position:"absolute", top:3, left:5, width:3, height:1, background:"#1a0f08" }} />
        </div>
        {/* drip */}
        <div style={{ position:"absolute", top:13, left:9, width:3, height:6, background:"#e8c97a", borderRadius:"40% 40% 50% 50%", transformOrigin:"top center", animation:"dripDali 3.4s ease-in-out infinite" }} />
        {/* second smaller clock on a cube */}
        <div style={{ position:"absolute", top:14, right:4, width:5, height:5, background:"#b3994a", borderRadius:"50%", transform:"rotate(20deg)" }} />
        <div style={{ position:"absolute", top:18, right:4, width:5, height:3, background:"#3a2418" }} />
        {/* signature corner */}
        <div style={{ position:"absolute", bottom:1, right:2, fontSize:4, color:"rgba(232,201,122,0.55)", fontStyle:"italic", letterSpacing:0.3 }}>Dalí</div>
      </div>
      <div style={{ position:"absolute", top:"38%", left:"70%" }}>
        <div style={{ width:6, height:10, background:"#92400e", borderRadius:"2px 2px 0 0", marginLeft:3 }} />
        <div style={{ width:15, height:13, borderRadius:"60% 60% 40% 40%", background:"#166534", marginTop:-5 }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#15803d", marginTop:-5, marginLeft:3 }} />
      </div>
      <div style={{ position:"absolute", top:"18%", right:"7%", width:34, height:64, background:"#3b2a1a", borderRadius:3, overflow:"hidden" }}>
        {["#dc2626","#2563eb","#059669","#d97706","#7c3aed","#ec4899"].map((c, i) => (
          <div key={i} style={{ position:"absolute", bottom: 3 + i * 10, left:3, width: 3 + (i % 3) * 2, height:8, background:c, borderRadius:"1px 1px 0 0" }} />
        ))}
      </div>
      <div style={{ position:"absolute", top:"2.5%", left:"5%", right:"5%", height:2 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"rgba(255,255,255,0.1)", borderRadius:1 }} />
        {Array.from({ length: 11 }, (_, i) => {
          const cs = [accent, "#fbbf24", "#f472b6", "#34d399"];
          return <div key={i} style={{ position:"absolute", top:1, left:(i * 9.5) + "%", width:5, height:5, borderRadius:"50%", background:cs[i % 4], boxShadow:"0 0 5px " + cs[i % 4], animation:"flicker " + (2.4 + i * 0.3) + "s ease-in-out " + (i * 0.22) + "s infinite" }} />;
        })}
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"28%", background:"#1c1208" }} />
      <div style={{ position:"absolute", bottom:"28%", left:0, right:0, height:2, background:"rgba(0,0,0,0.3)" }} />
      <div style={{ position:"absolute", bottom:"24%", left:"9%", right:"9%", height:17, background:"#4b3b2a", borderRadius:"3px 3px 0 0", boxShadow:"0 4px 16px rgba(0,0,0,0.5)" }} />
      <div style={{ position:"absolute", bottom:"24%", left:"9%", right:"9%", height:3, background:"#5c4a35", borderRadius:"3px 3px 0 0" }} />
      {/* Money tree (pachira) on left side of desk */}
      <div style={{ position:"absolute", bottom:"calc(24% + 16px)", left:"14%", width:18, height:22, zIndex:3 }}>
        {/* terracotta pot */}
        <div style={{ position:"absolute", bottom:0, left:2, width:14, height:8, background:"linear-gradient(to bottom,#b45309,#7c2d12)", borderRadius:"1px 1px 3px 3px", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.15)" }} />
        <div style={{ position:"absolute", bottom:7, left:1, width:16, height:2, background:"#92400e", borderRadius:1 }} />
        {/* braided trunk */}
        <div style={{ position:"absolute", bottom:8, left:8, width:2, height:6, background:"#3f2410", borderRadius:1 }} />
        <div style={{ position:"absolute", bottom:8, left:8, width:2, height:6, background:"#5a3418", borderRadius:1, transform:"skewX(-15deg)" }} />
        {/* lush canopy */}
        <div style={{ position:"absolute", bottom:11, left:0, width:9, height:9, background:"#15803d", borderRadius:"60% 50% 50% 60%" }} />
        <div style={{ position:"absolute", bottom:12, left:6, width:11, height:10, background:"#16a34a", borderRadius:"50% 60% 55% 50%" }} />
        <div style={{ position:"absolute", bottom:15, left:3, width:9, height:8, background:"#22c55e", borderRadius:"50% 60% 50% 60%" }} />
        <div style={{ position:"absolute", bottom:14, left:10, width:6, height:6, background:"#166534", borderRadius:"50%" }} />
        {/* lucky red ribbon */}
        <div style={{ position:"absolute", bottom:8, left:6, width:6, height:1.5, background:"#dc2626", borderRadius:1 }} />
      </div>
      {/* Candle on right side of desk */}
      <div style={{ position:"absolute", bottom:"calc(24% + 16px)", right:"16%", width:12, height:20, zIndex:3 }}>
        {/* saucer */}
        <div style={{ position:"absolute", bottom:0, left:0, width:12, height:2, background:"#1f1f1f", borderRadius:"50%" }} />
        {/* candle body */}
        <div style={{ position:"absolute", bottom:1, left:2, width:8, height:12, background:"linear-gradient(to right,#f5e6c8,#d9c08a,#f5e6c8)", borderRadius:"1px 1px 0 0", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.4), inset -1px 0 0 rgba(0,0,0,0.18)" }} />
        {/* melted top */}
        <div style={{ position:"absolute", bottom:13, left:2, width:8, height:2, background:"#e8d4a0", borderRadius:"50%" }} />
        {/* wick */}
        <div style={{ position:"absolute", bottom:13, left:5.5, width:1, height: candleLit ? 1.5 : 3, background:"#1a1a1a" }} />
        {/* flame */}
        {candleLit && (
          <>
            <div style={{ position:"absolute", bottom:14, left:"50%", width:4, height:7, background:"radial-gradient(ellipse at center bottom,#fff4a3 10%,#fbbf24 50%,#f97316 85%)", borderRadius:"50% 50% 40% 40% / 70% 70% 30% 30%", transformOrigin:"bottom center", animation:"flame 0.32s ease-in-out infinite", boxShadow:"0 0 8px #fbbf24cc, 0 0 16px #f9731688" }} />
            <div style={{ position:"absolute", bottom:13, left:"50%", transform:"translateX(-50%)", width:14, height:14, background:"radial-gradient(circle,#fbbf2433 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
          </>
        )}
      </div>
      <div style={{ position:"absolute", bottom:0, left:"13%", width:8, height:"25%", background:"#3b2a1a", borderRadius:"0 0 3px 3px" }} />
      <div style={{ position:"absolute", bottom:0, right:"13%", width:8, height:"25%", background:"#3b2a1a", borderRadius:"0 0 3px 3px" }} />
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
      <div style={{ position:"absolute", bottom:"37.5%", right:"21%" }}>
        <div style={{ width:11, height:11, background:"#7c3aed", borderRadius:"20% 20% 30% 30%", border:"1.5px solid #5b21b6", position:"relative" }}>
          <div style={{ position:"absolute", top:2, right:-3, width:4, height:6, border:"1.5px solid #5b21b6", borderLeft:"none", borderRadius:"0 4px 4px 0" }} />
        </div>
        <div style={{ position:"absolute", top:-7, left:2, fontSize:7, color:"rgba(255,255,255,0.3)", animation:"floatnote 2.2s ease-out infinite" }}>~</div>
        <div style={{ position:"absolute", top:-7, right:1, fontSize:7, color:"rgba(255,255,255,0.2)", animation:"floatnote 2.2s ease-out 0.9s infinite" }}>~</div>
      </div>
      <div style={{ position:"absolute", bottom:"13%", left:"50%", transform:"translateX(-62%)", width:44 }}>
        <div style={{ width:"100%", height:14, background:"#1e3a5f", borderRadius:"4px 4px 0 0" }} />
        <div style={{ width:"100%", height:8, background:"#1e3a5f", borderRadius:3, marginTop:1 }} />
        <div style={{ display:"flex", justifyContent:"space-between", padding:"0 8px" }}>
          <div style={{ width:7, height:22, background:"#374151", borderRadius:"0 0 3px 3px" }} />
          <div style={{ width:7, height:22, background:"#374151", borderRadius:"0 0 3px 3px" }} />
        </div>
      </div>
      <div style={{ position:"absolute", bottom:"1%", left:"18%", right:"18%", height:7, background: accent + "15", borderRadius:4, border:"1px solid " + accent + "22" }} />
      {isDancing && ["♪","♫","♩"].map((n, i) => (
        <div key={i} style={{ position:"absolute", top:"45%", left:(22 + i * 12) + "%", fontSize:13, color:accent, opacity:0, animation:"floatnote 2s ease-out " + (i * 0.75) + "s infinite" }}>{n}</div>
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

function App() {
  const [mood, setMood] = useState("focus");
  const [pose, setPose] = useState<PoseKey>("idle");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(25);
  const [sessions, setSessions] = useState(0);
  const [notif, setNotif] = useState({ text: "", id: 0 });
  const [msgIdx, setMsgIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const candleAudioRef = useRef<{ ctx: AudioContext; gain: GainNode; stop: () => void } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const poseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runningRef = useRef(running);
  runningRef.current = running;

  const md = MOODS.find((m) => m.id === mood) || MOODS[0];
  const accent = md.accent, total = duration * 60, isDone = elapsed >= total && total > 0;

  const showNotif = (text: string) => setNotif((n) => ({ text, id: n.id + 1 }));

  const triggerPose = (p: PoseKey, sec: number, msg: string) => {
    if (poseRef.current) clearTimeout(poseRef.current);
    setPose(p);
    showNotif(msg);
    poseRef.current = setTimeout(() => {
      setPose(runningRef.current ? "work" : "idle");
    }, sec * 1000);
  };

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= total) {
            if (timerRef.current) clearInterval(timerRef.current);
            setRunning(false);
            setSessions((s) => s + 1);
            triggerPose("dance", 28, "🎉 Session done! Dance it out!");
            return total;
          }
          return e + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, total]);

  useEffect(() => {
    msgRef.current = setInterval(() => setMsgIdx((i) => i + 1), 28000);
    return () => {
      if (msgRef.current) clearInterval(msgRef.current);
    };
  }, []);

  // Background music: loops per-vibe, auto-plays on mood change after first user gesture
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.loop = true;
      a.volume = 0.35;
      a.preload = "auto";
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (muted) { a.pause(); return; }
    if (a.src !== md.music) {
      a.src = md.music;
    }
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => { /* autoplay blocked until gesture */ });
    return () => { /* keep playing across re-renders */ };
  }, [mood, muted, md.music]);

  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);

  // Candle flicker sound (synthesized — gentle whoosh + crackle while lit)
  useEffect(() => {
    if (!candleLit || muted) {
      candleAudioRef.current?.stop();
      candleAudioRef.current = null;
      return;
    }
    if (candleAudioRef.current) return;
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx: AudioContext = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.0;
      master.connect(ctx.destination);
      // whoosh on light
      const whoosh = ctx.createBufferSource();
      const wb = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      const wd = wb.getChannelData(0);
      for (let i = 0; i < wd.length; i++) wd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
      whoosh.buffer = wb;
      const wf = ctx.createBiquadFilter(); wf.type = "lowpass"; wf.frequency.value = 900;
      const wg = ctx.createGain(); wg.gain.value = 0.25;
      whoosh.connect(wf).connect(wg).connect(master);
      whoosh.start();
      // sustained crackle (filtered pink-ish noise w/ random gain bumps)
      const noise = ctx.createBufferSource();
      const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const nd = nb.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;
      noise.buffer = nb; noise.loop = true;
      const nf = ctx.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 1400; nf.Q.value = 0.8;
      const ng = ctx.createGain(); ng.gain.value = 0.05;
      noise.connect(nf).connect(ng).connect(master);
      noise.start();
      // fade in
      master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.4);
      // random flicker LFO via setInterval
      const flick = setInterval(() => {
        ng.gain.setTargetAtTime(0.03 + Math.random() * 0.07, ctx.currentTime, 0.08);
      }, 180);
      candleAudioRef.current = {
        ctx, gain: master,
        stop: () => { clearInterval(flick); try { noise.stop(); } catch {} ctx.close(); },
      };
    } catch { /* audio unavailable */ }
  }, [candleLit, muted]);

  useEffect(() => () => { candleAudioRef.current?.stop(); }, []);

  const startFocus  = () => { setElapsed(0); setRunning(true); setPose("work"); showNotif("🧠 Focus started! We've got this!"); };
  const pauseFocus  = () => { setRunning(false); setPose("idle"); };
  const resumeFocus = () => { setRunning(true); setPose("work"); };
  const resetFocus  = () => { setRunning(false); setElapsed(0); setPose("idle"); };
  const doDance = () => triggerPose("dance", 15, "💃 Dance break! Shake it out!");
  const doEat   = () => triggerPose("eat", 14, "🍜 Time to eat — fuel up!");
  const doFeed   = () => triggerPose("feed", 12, "🐱 Feeding Mochi! She's so excited!");
  const doPerch  = () => triggerPose("perch", 22, "🌤️ Mochi's on the window perch");
  const doPet    = () => triggerPose("pet", 14, "💜 Petting Mochi — purr engaged");
  const doCandle = () => { setCandleLit((v) => !v); triggerPose("candle", 8, candleLit ? "🌙 Candle out" : "🕯️ Candle lit — cozy ritual"); };

  const msgs = MSGS[pose] || MSGS.idle;
  const curMsg = msgs[msgIdx % msgs.length];

  return (
    <>
      <style>{CSS}</style>
      <main className="bd-app" style={{ width:"100%", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 14px 28px", background: md.bg, animation:"fadein 0.5s ease", fontFamily:"system-ui, sans-serif", transition:"background 0.5s ease" }}>
        <div style={{ width:"100%", maxWidth:380 }}>
          <header style={{ textAlign:"center", marginBottom:10 }}>
            <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:accent, opacity:0.6, marginBottom:3 }}>body doubling mode</div>
            <h1 style={{ fontSize:19, fontWeight:800, color:"#f1f5f9", letterSpacing:-0.5, margin:0 }}>We're working together 💜</h1>
          </header>

          <div style={{ position:"relative", width:"100%", paddingTop:"60%", borderRadius:"20px 20px 0 0", overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)", borderBottom:"none", boxShadow:"0 -4px 24px rgba(0,0,0,0.5)" }}>
            <div style={{ position:"absolute", inset:0 }}>
              <Room mood={mood} pose={pose} accent={accent} candleLit={candleLit} />
              <Girl pose={pose} accent={accent} />
              <Cat pose={pose} accent={accent} />
              <Confetti active={pose === "dance"} accent={accent} />
              {notif.text && <Notif text={notif.text} accent={accent} id={notif.id} />}
            </div>
          </div>

          <div style={{ padding:"9px 18px 7px", textAlign:"center", fontSize:12, color:accent, opacity:0.88, background:"rgba(0,0,0,0.28)", letterSpacing:0.2 }}>
            {curMsg}
          </div>

          <div style={{ background:"rgba(255,255,255,0.038)", border:"1px solid rgba(255,255,255,0.07)", borderTop:"none", borderRadius:"0 0 20px 20px", padding:"14px 16px 18px", boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:14 }}>
              <TimerRing elapsed={elapsed} duration={duration} accent={accent} />
              <div style={{ display:"flex", flexDirection:"column", gap:7, flex:1 }}>
                {!running && !isDone && (
                  <div style={{ display:"flex", gap:5 }}>
                    {[15, 25, 45, 60].map((d) => (
                      <button key={d} onClick={() => { setDuration(d); setElapsed(0); }}
                        style={{ flex:1, padding:"4px 0", borderRadius:8, border:"1px solid", fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.18s ease", borderColor: duration === d ? accent : "rgba(255,255,255,0.1)", background: duration === d ? accent + "20" : "transparent", color: duration === d ? accent : "rgba(255,255,255,0.3)" }}>
                        {d}m
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", textAlign:"center" }}>
                  {sessions > 0 ? "🎯 " + sessions + " session" + (sessions !== 1 ? "s" : "") + " done!" : "Start your first session!"}
                </div>
                {!isDone ? (
                  <button onClick={running ? pauseFocus : elapsed > 0 ? resumeFocus : startFocus}
                    style={{ padding:"10px 0", borderRadius:12, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg," + accent + "," + accent + "88)", color:"#fff", boxShadow:"0 4px 14px " + accent + "44", transition:"all 0.18s ease" }}>
                    {running ? "⏸ Pause" : elapsed > 0 ? "▶ Resume" : "▶ Start Focus"}
                  </button>
                ) : (
                  <button onClick={resetFocus}
                    style={{ padding:"10px 0", borderRadius:12, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg," + accent + "," + accent + "88)", color:"#fff" }}>
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
              ].map((btn) => (
                <button key={btn.label} onClick={btn.fn}
                  style={{ padding:"9px 4px", borderRadius:11, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.6)", fontSize:10.5, fontWeight:600, cursor:"pointer", lineHeight:1.3, transition:"all 0.2s ease" }}>
                  {btn.label}
                </button>
              ))}
            </div>

            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:11 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:2, color:"rgba(255,255,255,0.22)", flex:1, textAlign:"center", paddingLeft:24 }}>vibe + music</div>
                <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute music" : "Mute music"}
                  style={{ width:24, height:24, borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.45)", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {muted ? "🔇" : "🔊"}
                </button>
              </div>
              <div style={{ display:"flex", gap:5 }}>
                {MOODS.map((m) => (
                  <button key={m.id} onClick={() => setMood(m.id)}
                    style={{ flex:1, padding:"7px 3px", borderRadius:10, border:"1px solid", fontSize:10, fontWeight:600, cursor:"pointer", transition:"all 0.2s ease", textAlign:"center", borderColor: mood === m.id ? m.accent : "rgba(255,255,255,0.07)", background: mood === m.id ? m.accent + "18" : "rgba(255,255,255,0.02)", color: mood === m.id ? m.accent : "rgba(255,255,255,0.28)" }}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:7 }}>{md.desc}</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
