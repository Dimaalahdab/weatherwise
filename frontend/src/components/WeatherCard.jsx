// src/components/WeatherCard.jsx
import { describeWeather } from "../utils/weatherHelpers";

export default function WeatherCard({ current, theme }) {
  const { text, emoji } = describeWeather(current.weathercode);
  return (
    <div className="wcard" style={{ background: theme.bg, boxShadow: `0 4px 24px ${theme.accent}44` }}>
      <div className="wcard-title">Weather Summary</div>
      <div className="wcard-main">
        <div className="wicon" style={{ fontSize: "7rem" }}>{emoji}</div>
        <div>
          <div className="wtemp">{Math.round(current.temperature_2m)}°C</div>
          <div
            className="wcond glass"
            style={{
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.condColor})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {text}
          </div>
          <div className="wdesc">
            Feels like {Math.round(current.apparent_temperature ?? current.temperature_2m)}°
          </div>
        </div>
      </div>
    </div>
  );
}