import React from "react";
import { THEMES } from "../themeConfig";
import { SettingsIcon, UserIcon } from "./Icons";

/**
 * Reusable Theme Picker Grid of Cards
 */
export function ThemePickerCards({ currentTheme, onSelectTheme, user }) {
  return (
    <div className="theme-cards-grid">
      {THEMES.map((theme) => {
        const isActive = currentTheme === theme.id;
        return (
          <div
            key={theme.id}
            className={`theme-picker-card ${isActive ? "active" : ""}`}
            style={{
              "--card-accent": theme.primary,
              "--card-glow": theme.accent,
              "--card-soft-bg": theme.bg,
            }}
            onClick={() => onSelectTheme(theme.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectTheme(theme.id);
              }
            }}
          >
            {/* 1. Mini Simulated UI Preview */}
            <div
              className="theme-mini-preview"
              style={{
                backgroundColor: theme.bg,
                borderColor: isActive ? theme.primary : "rgba(0,0,0,0.08)",
              }}
            >
              {/* Mini Sidebar */}
              <div
                className="theme-mini-sidebar"
                style={{ backgroundColor: theme.sidebarBg }}
              >
                <div
                  className="theme-mini-nav-dot active"
                  style={{
                    background: theme.gradient,
                  }}
                />
                <div className="theme-mini-nav-dot" />
                <div className="theme-mini-nav-dot" />
              </div>

              {/* Mini Content Area */}
              <div className="theme-mini-content">
                <div
                  className="theme-mini-header-bar"
                  style={{
                    borderBottom: `2px solid ${theme.primary}`,
                  }}
                />
                <div
                  className="theme-mini-card-box"
                  style={{
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.colors[1]}33`,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="theme-mini-btn-pill"
                    style={{ background: theme.gradient }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Color Swatches Strip */}
            <div className="theme-swatches-strip">
              {theme.colors.map((c, idx) => (
                <span
                  key={idx}
                  className="theme-swatch-circle"
                  style={{ backgroundColor: c }}
                  title={`Swatch: ${c}`}
                />
              ))}
            </div>

            {/* 3. Title & Badge */}
            <div className="theme-card-info-wrap">
              <h4>{theme.name}</h4>
              <span
                className="theme-card-badge"
                style={{
                  backgroundColor: `${theme.primary}18`,
                  color: theme.primary,
                  border: `1px solid ${theme.primary}33`,
                }}
              >
                {theme.badge}
              </span>
            </div>

            {/* 4. Description */}
            <p className="theme-card-desc">{theme.description}</p>

            {/* 5. Active / Select Action */}
            <div className="theme-card-active-indicator">
              {isActive ? (
                <>
                  <span>✓</span> Active Theme
                </>
              ) : (
                <>Select & Apply</>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interactive Popup Modal for Fast Theme Customization
 */
export default function ThemeModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  user,
}) {
  if (!isOpen) return null;

  const currentThemeObj =
    THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  const roleLabel =
    user?.role === "admin"
      ? "Super Administrator"
      : user?.role === "employee"
      ? "Staff Employee"
      : "User";

  return (
    <div className="theme-modal-overlay" onClick={onClose}>
      <div
        className="theme-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* MODAL HEADER */}
        <div className="theme-modal-header">
          <div className="theme-modal-title-wrap">
            <div className="theme-modal-icon-badge">
              <SettingsIcon width={20} height={20} />
            </div>
            <div>
              <h2>Customize Portal Appearance</h2>
              <p>
                Choose from 5 professionally designed corporate palettes and dark mode
              </p>
            </div>
          </div>
          <button
            type="button"
            className="theme-modal-close-btn"
            onClick={onClose}
            title="Close theme switcher"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="theme-modal-body">
          {/* USER CONTEXT BANNER */}
          <div className="theme-user-target-banner">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <UserIcon width={14} height={14} />
              <strong>{user?.name || user?.email || "Current User"}</strong> (
              {roleLabel})
            </div>
            <div>
              Active: <strong>{currentThemeObj.name}</strong> • Auto-saved to your profile
            </div>
          </div>

          {/* THEME CARDS GRID */}
          <ThemePickerCards
            currentTheme={currentTheme}
            onSelectTheme={onSelectTheme}
            user={user}
          />
        </div>

        {/* MODAL FOOTER */}
        <div className="theme-modal-footer">
          <p>
            Themes are saved per account. Both Admin and Employees can choose their own look anytime.
          </p>
          <button
            type="button"
            className="theme-modal-done-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
