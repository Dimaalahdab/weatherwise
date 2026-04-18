// src/components/ReschedulePanel.jsx
import { useState } from "react";
import { getForecastAtHour } from "../services/weather";
import { formatTime } from "../utils/weatherHelpers";
import { EMOJIS } from "../data/emojiMap";

const DEFAULT_TASKS = [
  { id: 1, label: "Evening Run",   time: "6:00 PM", hour: 18, icon: "🏃", conflict: true,  conflictReason: "Rain expected during your run",       fix: "Daytime is more suitable" },
  { id: 2, label: "Walk the Dog",  time: "5:00 PM", hour: 17, icon: "🐕", conflict: false, conflictReason: null, fix: "" },
  { id: 3, label: "Outdoor Lunch", time: "1:00 PM", hour: 13, icon: "🍱", conflict: false, conflictReason: null, fix: "" },
  { id: 4, label: "Grocery Run",   time: "7:00 PM", hour: 19, icon: "🛒", conflict: false, conflictReason: null, fix: "" },
  { id: 5, label: "Dinner Out",    time: "7:30 PM", hour: 19, icon: "🍽️", conflict: true,  conflictReason: "Wind conditions worsen in the evening", fix: "Avoid later hours" },
];

const STATIC_INSIGHTS = [
  { icon: "💧", body: "Stay hydrated — warm day, drink extra water" },
  { icon: "⏰", body: "Best productivity time is 2–5 PM" },
];

/* ── Single task item ── */
function RescheduleItem({ item, onResolve, onDelete, toast }) {
  const [open, setOpen]       = useState(false);
  const [done, setDone]       = useState(false);
  const [editing, setEditing] = useState(false);
  const [newTime, setNewTime] = useState("");
  const stop = (e, fn) => { e.stopPropagation(); fn(); };

  return (
    <div
      className={`titem ${item.conflict && !done ? "conflict" : ""} ${done ? "done" : ""}`}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="trow">
        <div className={`temoji ${item.conflict && !done ? "conflict" : ""}`}>{item.icon}</div>
        <div style={{ flex: 1 }}>
          <div className={`tname ${done ? "done" : ""}`}>{item.label}</div>
          <div className="ttime">⏳ {item.time}</div>
          {item.conflict && !done && item.conflictReason && (
            <div style={{ fontSize: 11, color: "#f87171", marginTop: 2, fontStyle: "italic" }}>
              ⚠️ {item.conflictReason}
            </div>
          )}
        </div>
        {item.conflict && !done && <div className="tbadge">⚠️ Conflict</div>}
      </div>

      {open && !done && (
        <div className="texpand">
          {item.fix && <div className="thint">💡 {item.fix}</div>}
          <div className="tbtns">
            {item.conflict && (
              <>
                <button className="tbtn later" onClick={(e) => stop(e, () => setEditing(true))}>
                  Reschedule
                </button>
                {editing && (
                  <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="time" value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      style={{ padding: "6px", borderRadius: "8px", border: "1px solid #ccc", marginRight: "6px" }}
                    />
                    <button className="tbtn move" onClick={(e) => stop(e, () => {
                      if (!newTime) return;
                      onResolve(item.id, newTime);
                      setEditing(false);
                    })}>Save</button>
                  </div>
                )}
              </>
            )}
            <button className="tbtn doneb" onClick={(e) => stop(e, () => { setDone(true); setOpen(false); toast("Done!"); })}>
              Done
            </button>
            <button className="tbtn delete" onClick={(e) => stop(e, () => onDelete(item.id))}>
              🗑 Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Panel ── */
export default function ReschedulePanel({ toast, lat, lon }) {
  const [items, setItems]     = useState(DEFAULT_TASKS);
  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [type, setType]         = useState("outdoor");
  const [adding, setAdding]     = useState(false);

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast("Task deleted");
  };

  const resolve = (id, t) => {
    setItems((prev) =>
      prev.map((i) => i.id !== id ? i : { ...i, conflict: false, conflictReason: null, time: formatTime(t) })
    );
    toast("Rescheduled successfully");
  };

  const addPlan = async () => {
    if (!newLabel || !newTime) { toast("Please enter activity and time"); return; }
    setAdding(true);

    const [h] = newTime.split(":").map(Number);
    let conflict = false, conflictReason = null, fix = "";

    if (type === "outdoor") {
      try {
        const forecast = await getForecastAtHour(lat, lon, h);
        if (forecast) {
          const reasons = [];
          if (forecast.precipitation_probability > 50) reasons.push(`${forecast.precipitation_probability}% rain`);
          if (forecast.weathercode >= 95) reasons.push("thunderstorm");
          if (forecast.windspeed > 40)    reasons.push("strong winds");
          if (reasons.length > 0) {
            conflict = true;
            conflictReason = reasons.join(" & ") + " expected at this hour";
            fix = "Consider rescheduling to a better time window";
          }
        }
      } catch (e) { console.warn("Forecast check failed", e); }
    }

    const newItem = {
      id: Date.now(), label: newLabel,
      time: formatTime(newTime), hour: h,
      icon: EMOJIS[newLabel.toLowerCase()] || (type === "outdoor" ? "🌳" : "🏠"),
      type, conflict, conflictReason, fix,
    };

    setItems((prev) => [...prev, newItem]);
    if (conflict) toast(`⚠️ ${conflictReason}`);
    else toast("Plan added ✅");

    setNewLabel(""); setNewTime(""); setType("outdoor"); setShowForm(false); setAdding(false);
  };

  return (
    <aside className="rpanel">
      <div className="task-title">Reschedule Alerts</div>

      {items.map((i) => (
        <RescheduleItem key={i.id} item={i} onResolve={resolve} onDelete={deleteItem} toast={toast} />
      ))}

      {showForm ? (
        <div className="inline-add" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <input
            type="text" placeholder="Activity name (e.g. Evening Run)"
            value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <input
            type="time" value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button className={`type-btn ${type === "indoor" ? "active" : ""}`} onClick={() => setType("indoor")}>🏠 Indoor</button>
            <button className={`type-btn ${type === "outdoor" ? "active" : ""}`} onClick={() => setType("outdoor")}>🌳 Outdoor</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="confirm-btn" style={{ flex: 1, opacity: adding ? 0.6 : 1 }} onClick={addPlan} disabled={adding}>
              {adding ? "Checking weather…" : "✔ Add Plan"}
            </button>
            <button className="tbtn doneb" onClick={() => { setShowForm(false); setNewLabel(""); setNewTime(""); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="addbtn" onClick={() => setShowForm(true)}>＋ Add Plan</button>
      )}

      <hr className="idivider" />
      <div className="insight-title">Insights</div>
      {STATIC_INSIGHTS.map((i, idx) => (
        <div key={idx} className="icard">
          <div className="iico">{i.icon}</div>
          <div className="itxt">{i.body}</div>
        </div>
      ))}
    </aside>
  );
}