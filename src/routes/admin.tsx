import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · Body Double" }, { name: "robots", content: "noindex" }] }),
});

type Event = { id: string; user_id: string | null; event_type: string; event_data: any; created_at: string };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!isAdmin) return;
    (async () => {
      setBusy(true);
      try {
        const { data: ev, error } = await supabase
          .from("analytics_events").select("*")
          .order("created_at", { ascending: false }).limit(500);
        if (error) throw error;
        setEvents((ev as any) || []);
        const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
        setUserCount(count ?? null);
      } catch (e: any) { setErr(e.message || "Failed to load"); }
      setBusy(false);
    })();
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <Shell><p style={muted}>Loading…</p></Shell>;
  if (!user) return null;
  if (!isAdmin) return (
    <Shell>
      <h1 style={h1}>Admin only</h1>
      <p style={muted}>You don't have admin access. If this is your account, ask the project owner to grant the admin role.</p>
      <Link to="/" style={link}>← Back home</Link>
    </Shell>
  );

  // Aggregations
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const eventsByType: Record<string, number> = {};
  const eventsByDay: Record<string, number> = {};
  let last24h = 0, last7d = 0;
  const activeUsers24h = new Set<string>();
  const activeUsers7d = new Set<string>();
  for (const e of events) {
    eventsByType[e.event_type] = (eventsByType[e.event_type] || 0) + 1;
    const ts = new Date(e.created_at).getTime();
    const dkey = new Date(e.created_at).toISOString().slice(0, 10);
    eventsByDay[dkey] = (eventsByDay[dkey] || 0) + 1;
    if (now - ts < day) { last24h++; if (e.user_id) activeUsers24h.add(e.user_id); }
    if (now - ts < 7 * day) { last7d++; if (e.user_id) activeUsers7d.add(e.user_id); }
  }
  const dayKeys = Object.keys(eventsByDay).sort().slice(-14);

  return (
    <Shell>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h1 style={h1}>Admin · Analytics</h1>
        <Link to="/" style={link}>← App</Link>
      </div>
      {busy && <p style={muted}>Loading…</p>}
      {err && <p style={{ ...muted, color:"#fca5a5" }}>{err}</p>}

      <section style={grid}>
        <Card label="Total users" value={userCount ?? "—"} />
        <Card label="Events (24h)" value={last24h} />
        <Card label="Events (7d)" value={last7d} />
        <Card label="Active users (24h)" value={activeUsers24h.size} />
        <Card label="Active users (7d)" value={activeUsers7d.size} />
        <Card label="Total events" value={events.length} />
      </section>

      <h2 style={h2}>Events by type</h2>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:22 }}>
        {Object.entries(eventsByType).sort((a, b) => b[1] - a[1]).map(([t, n]) => (
          <span key={t} style={chip}>{t} <strong style={{ color:"#a78bfa", marginLeft:6 }}>{n}</strong></span>
        ))}
        {Object.keys(eventsByType).length === 0 && <span style={muted}>No events yet.</span>}
      </div>

      <h2 style={h2}>Events per day (last 14)</h2>
      <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:120, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.1)", marginBottom:22 }}>
        {dayKeys.map((d) => {
          const n = eventsByDay[d];
          const max = Math.max(...dayKeys.map((k) => eventsByDay[k]), 1);
          return (
            <div key={d} title={d + ": " + n} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:"100%", height: (n / max) * 96 + "px", background:"linear-gradient(180deg,#a78bfa,#7c3aed)", borderRadius:"3px 3px 0 0", minHeight:2 }} />
              <span style={{ fontSize:8, color:"rgba(255,255,255,0.4)" }}>{d.slice(5)}</span>
            </div>
          );
        })}
        {dayKeys.length === 0 && <span style={muted}>No data yet.</span>}
      </div>

      <h2 style={h2}>Recent events</h2>
      <div style={{ maxHeight:400, overflow:"auto", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ background:"rgba(255,255,255,0.04)" }}>
            <th style={th}>When</th><th style={th}>Type</th><th style={th}>User</th><th style={th}>Data</th>
          </tr></thead>
          <tbody>
            {events.slice(0, 100).map((e) => (
              <tr key={e.id} style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <td style={td}>{new Date(e.created_at).toLocaleString()}</td>
                <td style={td}><span style={chip}>{e.event_type}</span></td>
                <td style={{ ...td, fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.5)" }}>{e.user_id?.slice(0, 8) || "—"}</td>
                <td style={{ ...td, fontFamily:"monospace", fontSize:10, maxWidth:240, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{JSON.stringify(e.event_data)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main style={{ minHeight:"100vh", background:"#0e0a18", color:"#f1f5f9", padding:"24px 18px", fontFamily:"system-ui, sans-serif" }}>
    <div style={{ maxWidth:980, margin:"0 auto" }}>{children}</div>
  </main>;
}
function Card({ label, value }: { label: string; value: any }) {
  return <div style={{ padding:14, borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
    <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"rgba(255,255,255,0.5)" }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:800, marginTop:4 }}>{value}</div>
  </div>;
}
const h1: React.CSSProperties = { margin:0, fontSize:22, fontWeight:800 };
const h2: React.CSSProperties = { margin:"22px 0 10px", fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.7)", letterSpacing:0.5 };
const muted: React.CSSProperties = { color:"rgba(255,255,255,0.55)", fontSize:13 };
const link: React.CSSProperties = { color:"#a78bfa", fontSize:13, textDecoration:"none" };
const grid: React.CSSProperties = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:8 };
const chip: React.CSSProperties = { display:"inline-block", padding:"3px 10px", borderRadius:99, background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.3)", fontSize:11, color:"#e0d6ff" };
const th: React.CSSProperties = { textAlign:"left", padding:"8px 10px", fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"rgba(255,255,255,0.5)" };
const td: React.CSSProperties = { padding:"6px 10px", verticalAlign:"top" };
