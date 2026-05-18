import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in · Body Double" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) nav({ to: "/" }); }, [loading, user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/" });
    } catch (e: any) { setErr(e.message || "Something went wrong"); }
    finally { setBusy(false); }
  };

  const google = async () => {
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setErr((r.error as any).message || "Google sign-in failed");
  };

  return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"linear-gradient(135deg,#0c0820 0%,#1a1025 50%,#0f0f1f 100%)", color:"#f1f5f9", fontFamily:"system-ui, sans-serif" }}>
      <div style={{ width:"100%", maxWidth:380, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:28, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <img src="/cf-logo.png" alt="" style={{ width:72, height:72, objectFit:"contain", filter:"drop-shadow(0 0 12px rgba(167,139,250,0.4))" }} />
          <h1 style={{ fontSize:22, fontWeight:800, margin:"10px 0 4px" }}>Welcome, friend 💜</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", margin:0 }}>{mode === "signin" ? "Sign in to keep your pixel pal." : "Create an account — we'll set up your character."}</p>
        </div>
        <button onClick={google} disabled={busy}
          style={{ width:"100%", padding:"11px", borderRadius:12, border:"1px solid rgba(255,255,255,0.18)", background:"#fff", color:"#1a1a1a", fontWeight:700, fontSize:14, cursor:"pointer", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>🅖</span> Continue with Google
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"4px 0 14px", color:"rgba(255,255,255,0.3)", fontSize:11 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }} /> or <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }} />
        </div>
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)"
              style={inputStyle} />
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ chars)" minLength={6} style={inputStyle} />
          {err && <div style={{ color:"#f87171", fontSize:12 }}>{err}</div>}
          <button type="submit" disabled={busy}
            style={{ padding:"11px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#a78bfa,#7c3aed)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", marginTop:4 }}>
            {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:"rgba(255,255,255,0.5)" }}>
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontWeight:700 }}>
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:18 }}>
          <Link to="/" style={{ color:"rgba(255,255,255,0.4)", fontSize:11, textDecoration:"none" }}>← continue as guest</Link>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding:"11px 13px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(255,255,255,0.05)", color:"#f1f5f9", fontSize:14, outline:"none",
};
