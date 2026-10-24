import React, { useState, useEffect } from "react";
import "./SmartClock.css";

export default function SmartClock({
  theme = "employee", // 'employee' | 'admin' | 'dark'
  showLive = true,
  className = "",
  format, // '12h' | '24h'
}) {
  const [now, setNow] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(format ? format === "24h" : false);

  useEffect(() => {
    if (format) {
      setIs24Hour(format === "24h");
    }
  }, [format]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Date Components
  const weekdayShort = now.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = now.getDate();
  const monthShort = now.toLocaleDateString("en-US", { month: "short" });
  const yearNumber = now.getFullYear();

  // Format Time Components
  const rawHours = now.getHours();
  const hours12 = rawHours % 12 || 12;
  const hoursDisplay = is24Hour
    ? String(rawHours).padStart(2, "0")
    : String(hours12).padStart(2, "0");
  const minutesDisplay = String(now.getMinutes()).padStart(2, "0");
  const secondsDisplay = String(now.getSeconds()).padStart(2, "0");
  const ampm = rawHours >= 12 ? "PM" : "AM";

  const handleToggleFormat = () => {
    setIs24Hour((prev) => !prev);
  };

  return (
    <div
      className={`smart-clock-widget theme-${theme} ${className}`}
      onClick={handleToggleFormat}
      title="Click to toggle 12-hour / 24-hour mode"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleToggleFormat();
      }}
    >
      {/* 1. DATE SECTION */}
      <div className="smart-clock-date-sec">
        <div className="smart-calendar-icon-box">📅</div>
        <div className="smart-date-text-wrap">
          <span className="smart-weekday-tag">{weekdayShort}</span>
          <span className="smart-date-main">
            {dayNumber} {monthShort}
          </span>
          <span className="smart-date-year">{yearNumber}</span>
        </div>
      </div>

      {/* 2. GLOWING DIVIDER */}
      <div className="smart-clock-divider"></div>

      {/* 3. DIGITAL TIME SECTION */}
      <div className="smart-clock-time-sec">
        {showLive && (
          <div className="smart-live-indicator">
            <span className="smart-pulse-dot"></span>
            <span>LIVE</span>
          </div>
        )}

        <div className="smart-time-display">
          <span>{hoursDisplay}</span>
          <span className="smart-time-colon">:</span>
          <span>{minutesDisplay}</span>
        </div>

        <span className="smart-seconds-pill">:{secondsDisplay}</span>

        {!is24Hour && <span className="smart-ampm-tag">{ampm}</span>}

        <span className="smart-tz-tag">IST</span>
      </div>

      {/* HOVER TOOLTIP */}
      <div className="smart-clock-tooltip">
        Click to switch to {is24Hour ? "12-hour" : "24-hour"} time
      </div>
    </div>
  );
}
