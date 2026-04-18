// src/components/SmartSuggestions.jsx
import { clothingLabel } from "../services/weather";
import {
  getExtraAdvice,
  getWeatherAlert,
  filterActivitiesByWeather,
  shouldBringUmbrella,
} from "../utils/weatherHelpers";

const CLOTHING_EMOJI = {
  heavy_winter_coat_gloves_hat:      "🧤",
  winter_coat_scarf_gloves:          "🧣",
  warm_jacket_layers:                "🧥",
  light_jacket_or_sweater:           "👕",
  long_sleeves_light_layer:          "👔",
  t_shirt_comfortable:               "👕",
  light_breathable_clothing:         "🩱",
  very_light_clothing_stay_hydrated: "😎",
};

export default function SmartSuggestions({ mlPrediction, weather }) {
  const weatherCode = weather?.current?.weathercode ?? 0;
  const alert       = getWeatherAlert(weather);
  const extra       = getExtraAdvice(weather, mlPrediction);

  // ── ML-powered path ──────────────────────────────────────────────────────
  if (mlPrediction && mlPrediction.activity_suggestions?.length > 0) {

    // FIX: filter/re-rank activities based on ACTUAL weather conditions
    const filteredActivities = filterActivitiesByWeather(
      mlPrediction.activity_suggestions,
      weatherCode
    );

    const suggestions = [
      // Card 1 — Clothing (from ML)
      {
        icon:  CLOTHING_EMOJI[mlPrediction.clothing_recommendation] ?? "👕",
        text:  clothingLabel(mlPrediction.clothing_recommendation),
        tag:   "Now",
        color: "violet",
      },
      // Card 2 — Umbrella / sun / hydration
      // FIX: uses shouldBringUmbrella() which checks BOTH ML + actual weather code
      {
        icon:  extra.icon,
        text:  extra.text,
        tag:   extra.tag,
        color: extra.color,
      },
      // Card 3 — Top 3 activities (weather-adjusted)
      {
        icon:       filteredActivities[0]?.emoji ?? "🏃",
        text:       "Best activities now",
        tag:        "Best now",
        color:      "green",
        activities: filteredActivities,
      },
      // Card 4 — Weather alert
      {
        icon:    alert?.icon  ?? "✅",
        text:    alert?.title ?? "Weather looks stable",
        body:    alert?.body  ?? "No significant changes expected",
        tag:     alert?.tag   ?? "All clear",
        color:   alert?.color ?? "green",
        isAlert: true,
      },
    ];

    return (
      <div>
        <div className="smart-title">Smart Suggestions</div>
        <div className="sgrid">
          {suggestions.map((s, i) => (
            <div key={i} className={`scard ${s.color}`}>
              <div className="sicon">{s.icon}</div>
              <div className="stxt">{s.text}</div>

              {/* Card 3 — activity list */}
              {s.activities && (
                <div style={{ margin: "8px 0 10px" }}>
                  {s.activities.map((a, ai) => (
                    <div
                      key={ai}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "4px 0",
                        borderBottom: ai < s.activities.length - 1
                          ? "1px solid rgba(52,211,153,0.12)" : "none",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{a.emoji}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        fontFamily: "var(--font-d)", color: "var(--text)", flex: 1,
                      }}>
                        {a.label}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: "var(--green)",
                        background: "rgba(52,211,153,0.12)",
                        borderRadius: 99, padding: "2px 7px",
                      }}>
                        {Math.round(Math.min(a.confidence, 1) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Card 4 — alert body */}
              {s.isAlert && s.body && (
                <div style={{
                  fontSize: 12, color: "var(--text2)", fontStyle: "italic",
                  lineHeight: 1.5, margin: "6px 0 10px",
                  fontFamily: "var(--font-s)",
                }}>
                  {s.body}
                </div>
              )}

              <span className={`stag ${s.color}`}>{s.tag}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Fallback when ML is offline ──────────────────────────────────────────
  const fallback = [
    { icon: "🧥", text: "Light jacket for this evening", tag: "6 PM+", color: "violet" },
    { icon: "☔", text: "Umbrella if out after 5 PM",   tag: "After 5", color: "blue"  },
    { icon: "🚶", text: "Perfect for a walk right now", tag: "Now",    color: "green"  },
    { icon: "🌿", text: "Low pollen today",             tag: "All day", color: "amber" },
  ];
  return (
    <div>
      <div className="smart-title">Smart Suggestions</div>
      <div className="sgrid">
        {fallback.map((s, i) => (
          <div key={i} className={`scard ${s.color}`}>
            <div className="sicon">{s.icon}</div>
            <div className="stxt">{s.text}</div>
            <span className={`stag ${s.color}`}>{s.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}