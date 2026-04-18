// src/App.jsx  — WeatherWise (refactored into components)
import { useState, useEffect } from "react";
import "./App.css";

// ── Services ──────────────────────────────────────────────────────────────
import {
  getWeather,
  getMLPredictionAll,
  getUserLocation,
  getCityName,
} from "./services/weather";

// ── Components ────────────────────────────────────────────────────────────
import Toast           from "./components/Toast";
import WeatherCard     from "./components/WeatherCard";
import SmartSuggestions from "./components/SmartSuggestions";
import ReschedulePanel from "./components/ReschedulePanel";
import CitySearch      from "./components/CitySearch";

// ── Utils ─────────────────────────────────────────────────────────────────
import { getWeatherTheme, getGreeting, formatDate } from "./utils/weatherHelpers";

/* ── APP ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [toast, setToast]       = useState(null);
  const [weather, setWeather]   = useState(null);
  const [theme, setTheme]       = useState(null);
  const [greeting, setGreeting] = useState("");
  const [mlPred, setMlPred]     = useState(null);
  const [mlError, setMlError]   = useState(false);

  // Location state
  const [lat, setLat]           = useState(null);
  const [lon, setLon]           = useState(null);
  const [cityName, setCityName] = useState("");
  const [locating, setLocating] = useState(true);  // true while getting GPS

  // ── On mount: try to get user's GPS location ────────────────────────────
  useEffect(() => {
    getUserLocation()
      .then(async ({ lat, lon }) => {
        setLat(lat);
        setLon(lon);
        const name = await getCityName(lat, lon);
        setCityName(name);
      })
      .catch(() => {
        // GPS denied or unavailable → fall back to Istanbul
        setLat(41.01);
        setLon(28.97);
        setCityName("Istanbul");
      })
      .finally(() => setLocating(false));
  }, []);

  // ── When lat/lon changes: fetch weather + ML ───────────────────────────
  useEffect(() => {
    if (lat === null || lon === null) return;

    setWeather(null);
    setTheme(null);
    setMlPred(null);
    setMlError(false);

    getWeather(lat, lon).then((data) => {
      setWeather(data);
      setTheme(getWeatherTheme(data.current.weathercode));
      const hour = new Date(data.current.time).getHours();
      setGreeting(getGreeting(hour));
    });

    getMLPredictionAll(lat, lon)
      .then(setMlPred)
      .catch(() => setMlError(true));
  }, [lat, lon]);

  // ── City search handler (called by CitySearch component) ───────────────
  const handleCityChange = ({ lat, lon, cityName }) => {
    setLat(lat);
    setLon(lon);
    setCityName(cityName);
    setToast(`Showing weather for ${cityName}`);
  };

  // ── Loading screen ────────────────────────────────────────────────────
  if (locating || !weather || !theme) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", fontFamily: "var(--font-d)", fontSize: 16, color: "#b89880",
      }}>
        {locating ? "📍 Getting your location…" : "🌤️ Loading weather…"}
      </div>
    );
  }

  return (
    <>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      <div className="app-shell">
        <main className="main-content">

          {/* ── Header row: greeting + date + city + search ── */}
          <div className="greet-row">
            <div className="greet-container">
              <div className="greet-name">{greeting} 👋</div>
              {/* City name shown next to the date */}
              <div className="greet-date">
                {formatDate(weather.current.time)}
                {cityName && (
                  <span className="greet-city"> · 📍 {cityName}</span>
                )}
              </div>
            </div>
            <CitySearch onCityChange={handleCityChange} toast={setToast} />
          </div>

          <WeatherCard current={weather.current} theme={theme} />
          <SmartSuggestions mlPrediction={mlPred} weather={weather} />
        </main>

        <ReschedulePanel toast={setToast} lat={lat} lon={lon} />
      </div>
    </>
  );
}