// Enterprise Multi-Theme Configuration for Employee & Admin
export const THEMES = [
  {
    id: "blue",
    name: "Professional Blue",
    tagline: "Classic Enterprise",
    badge: "Default",
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    gradient: "linear-gradient(135deg, #2563eb, #1e40af)",
    accent: "#3b82f6",
    bg: "#f4f6fb",
    sidebarBg: "#101a2f",
    cardBg: "#ffffff",
    colors: ["#2563eb", "#3b82f6", "#101a2f", "#f4f6fb"],
    description: "Crisp corporate layout with deep navy sidebar, royal blue accents and white cards.",
    isDark: false,
    icon: "💼",
  },
  {
    id: "purple",
    name: "Modern Purple",
    tagline: "Creative & Luxury",
    badge: "Popular",
    primary: "#7c3aed",
    primaryDark: "#6d28d9",
    gradient: "linear-gradient(135deg, #7c3aed, #5b21b6)",
    accent: "#a855f7",
    bg: "#faf5ff",
    sidebarBg: "#1b1035",
    cardBg: "#ffffff",
    colors: ["#7c3aed", "#a855f7", "#1b1035", "#faf5ff"],
    description: "Sleek dark purple sidebar with royal violet accents, clean white cards and modern typography.",
    isDark: false,
    icon: "👑",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    tagline: "Fresh Botanical",
    badge: "Eco Focus",
    primary: "#059669",
    primaryDark: "#047857",
    gradient: "linear-gradient(135deg, #059669, #064e3b)",
    accent: "#10b981",
    bg: "#f0fdf4",
    sidebarBg: "#06251f",
    cardBg: "#ffffff",
    colors: ["#059669", "#10b981", "#06251f", "#f0fdf4"],
    description: "Invigorating mint & deep pine emerald tones providing clean clarity and balanced contrast.",
    isDark: false,
    icon: "🌿",
  },
  {
    id: "dark",
    name: "Dark Mode",
    tagline: "Futuristic Stealth",
    badge: "Night Owl",
    primary: "#38bdf8",
    primaryDark: "#0284c7",
    gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
    accent: "#818cf8",
    bg: "#0b0f19",
    sidebarBg: "#070b14",
    cardBg: "#111827",
    colors: ["#38bdf8", "#818cf8", "#111827", "#0b0f19"],
    description: "True deep obsidian dark mode with glowing azure accents and reduced eye strain.",
    isDark: true,
    icon: "🌙",
  },
  {
    id: "minimal",
    name: "Light Minimal",
    tagline: "Clean Simplicity",
    badge: "Monochrome",
    primary: "#0f172a",
    primaryDark: "#020617",
    gradient: "linear-gradient(135deg, #1e293b, #0f172a)",
    accent: "#475569",
    bg: "#f8fafc",
    sidebarBg: "#1e293b",
    cardBg: "#ffffff",
    colors: ["#0f172a", "#475569", "#1e293b", "#f8fafc"],
    description: "Distraction-free high-legibility minimalist palette with crisp slate contours.",
    isDark: false,
    icon: "⚪",
  },
];

export const DEFAULT_THEME_ID = "purple"; // Dark purple sidebar matching visual design reference

/**
 * Returns storage key tailored to specific user email and role
 */
export function getStorageKey(user) {
  if (!user) return "ems_active_theme";
  const role = user.role || "user";
  const email = (user.email || "default").toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `ems_theme_${role}_${email}`;
}

/**
 * Normalize legacy theme IDs
 */
function normalizeThemeId(themeId) {
  if (themeId === "indigo") return "blue";
  if (themeId === "amber") return "purple";
  if (THEMES.some((t) => t.id === themeId)) return themeId;
  return DEFAULT_THEME_ID;
}

/**
 * Reads preferred theme for a user with hierarchical fallback
 */
export function getUserTheme(user) {
  try {
    if (user) {
      const specificKey = getStorageKey(user);
      const savedSpecific = localStorage.getItem(specificKey);
      if (savedSpecific) {
        return normalizeThemeId(savedSpecific);
      }

      // Check role fallback
      const roleKey = `ems_theme_${user.role || "user"}`;
      const savedRole = localStorage.getItem(roleKey);
      if (savedRole) {
        return normalizeThemeId(savedRole);
      }
    }

    // Global fallback
    const globalSaved = localStorage.getItem("ems_active_theme");
    if (globalSaved) {
      return normalizeThemeId(globalSaved);
    }
  } catch (e) {
    console.error("Error reading user theme:", e);
  }
  return DEFAULT_THEME_ID;
}

/**
 * Directly applies data-theme attribute to DOM root elements
 */
export function applyThemeToDOM(themeId) {
  const validTheme = normalizeThemeId(themeId);
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", validTheme);
    if (document.body) {
      document.body.setAttribute("data-theme", validTheme);
    }
  }
  return validTheme;
}

/**
 * Persists theme for specific user in localStorage and applies it to DOM
 */
export function saveUserTheme(user, themeId) {
  const validTheme = applyThemeToDOM(themeId);
  try {
    if (user) {
      const specificKey = getStorageKey(user);
      localStorage.setItem(specificKey, validTheme);
      localStorage.setItem(`ems_theme_${user.role || "user"}`, validTheme);

      // Attempt to sync to backend preferences if available
      if (user.email) {
        fetch("http://localhost:5000/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            preferences: { theme: validTheme },
          }),
        }).catch(() => {});
      }
    }
    localStorage.setItem("ems_active_theme", validTheme);
  } catch (e) {
    console.error("Error saving user theme:", e);
  }
  return validTheme;
}
