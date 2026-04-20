// src/components/MLBadge.jsx
// Small floating button showing all 6 ML models live status.
// Add to App.jsx — does NOT change any existing code.

import { useState } from "react";

const MODEL_META = {
  uvProtection:     { name: "UV Protection",      icon: "☀️" },
  hydrationAlert:   { name: "Hydration Alert",    icon: "💧" },
  roadSurface:      { name: "Road Surface",       icon: "🛣️" },
  windAlert:        { name: "Wind Alert",         icon: "💨" },
  windChillWarning: { name: "Wind Chill",         icon: "🥶" },
  outdoorPoor:      { name: "Outdoor Conditions", icon: "🌿" },
};

function getStatus(key, val) {
  if (!val) return { label: "—", active: false };
  if (key === "uvProtection")  return { label: val.label === "none" ? "No risk" : val.label, active: val.label !== "none" };
  if (key === "roadSurface")   return { label: val.label, active: val.label !== "dry" };
  return { label: val.triggered ? "Alert" : "Clear", active: val.triggered };
}

export default function MLBadge({ mlInsights }) {
  const [open, setOpen] = useState(false);

  const activeCount = mlInsights
    ? Object.entries(mlInsights).filter(([k, v]) => getStatus(k, v).active).length
    : 0;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 99,
          border: "1px solid rgba(167,139,250,0.3)",
          background: "rgba(167,139,250,0.1)",
          color: "var(--violet)",
          fontFamily: "var(--font-d)", fontSize: 12, fontWeight: 700,
          cursor: "pointer", backdropFilter: "blur(8px)",
          transition: "all 0.18s", whiteSpace: "nowrap",
        }}
      >
        🤖 6 AI Models
        {activeCount > 0 && (
          <span style={{
            background: "#f87171", color: "#fff", borderRadius: 99,
            fontSize: 10, fontWeight: 800, padding: "1px 6px", marginLeft: 2,
          }}>
            {activeCount} alert{activeCount > 1 ? "s" : ""}
          </span>
        )}
        <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 999,
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
          borderRadius: 16, border: "1px solid rgba(167,139,250,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          padding: "14px", minWidth: 240, animation: "fadeUp 0.18s ease",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 2,
            textTransform: "uppercase", color: "#b89880",
            marginBottom: 10, fontFamily: "var(--font-d)",
          }}>
            AI Models Running Now
          </div>

          {mlInsights
            ? Object.entries(mlInsights).map(([key, val]) => {
                const meta = MODEL_META[key];
                const status = getStatus(key, val);
                return (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{meta.icon}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#413025", fontFamily: "var(--font-d)" }}>
                      {meta.name}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: status.active ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.15)",
                      color: status.active ? "#ef4444" : "#16a34a",
                    }}>
                      {status.label}
                    </span>
                  </div>
                );
              })
            : <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Loading models…</div>
          }

          <div style={{
            marginTop: 10, fontSize: 10, color: "#b89880",
            fontStyle: "italic", textAlign: "center", fontFamily: "var(--font-s)",
          }}>
            6 Gradient Boosting models · 43,440 observations · client-side
          </div>
        </div>
      )}
    </div>
  );
}
