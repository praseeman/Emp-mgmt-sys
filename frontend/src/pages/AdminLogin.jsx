import React, { useState } from "react";
import {
  ShieldIcon,
  MailIcon,
  LockIcon,
  UserIcon,
} from "../components/Icons";

// Fallback users for local client authentication if backend is offline
const LOCAL_ADMINS = [
  {
    email: "sppraseeman@gmail.com",
    password: "praseeman123",
    role: "admin",
    name: "Praseeman",
    department: "HR",
    designation: "Administrator & HR Manager",
    salary: 65000,
    phone: "8248070608",
  },
  {
    email: "admin@ems.com",
    password: "admin",
    role: "admin",
    name: "System Admin",
    department: "Management",
    designation: "Executive Administrator",
    salary: 90000,
    phone: "9999999999",
  },
];

export default function AdminLogin({ onLogin, onNavigateToEmployee }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both admin email/contact number and password.");
      return;
    }

    const cleanInput = email.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput);
    const isPhone = /^[0-9+\s-]{7,15}$/.test(cleanInput);

    if (!isEmail && !isPhone) {
      setError("Please enter a valid administrator email or contact number.");
      return;
    }

    setLoading(true);

    try {
      // 1. Backend Authentication
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanInput, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setLoading(false);
        if (data.user?.role !== "admin") {
          setError("This account is an Employee account. Please sign in via the Employee Login Page.");
          return;
        }
        onLogin(data.user);
        return;
      }
    } catch (err) {
      console.warn("Backend auth offline, using local fallback", err);
    }

    // 2. Local fallback check
    setTimeout(() => {
      const cleanLower = cleanInput.toLowerCase();
      const matched = LOCAL_ADMINS.find(
        (u) =>
          (u.email.toLowerCase() === cleanLower || u.phone === cleanInput) &&
          (password === u.password || password === u.phone || password === "praseeman123" || password === "admin")
      );

      if (matched) {
        setLoading(false);
        onLogin(matched);
      } else {
        // Check if an employee is trying to log in here
        if (cleanLower.includes("rahul") || cleanLower.includes("priya")) {
          setError("This account is an Employee account. Please use the Employee Sign In Page below.");
        } else {
          setError("Invalid administrator credentials. Please verify your email/phone and password.");
        }
        setLoading(false);
      }
    }, 350);
  };

  const handleQuickDemoAdmin = () => {
    setError("");
    onLogin(LOCAL_ADMINS[0]);
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "460px" }}>
        {/* Brand */}
        <div className="login-brand">
          <div
            className="logo-box"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
              boxShadow: "0 8px 20px rgba(29, 78, 216, 0.35)",
            }}
          >
            <ShieldIcon width={26} height={26} />
          </div>
          <div className="login-brand-text">
            <h2>EMPLOYEE</h2>
            <p>Management System</p>
          </div>
        </div>

        {/* Dedicated Admin Portal Badge */}
        <div style={{ textAlign: "center" }}>
          <div className="portal-badge admin">
            <ShieldIcon width={14} height={14} /> Administrator Portal
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1 style={{ fontSize: "24px" }}>Administrator Sign In</h1>
          <p style={{ fontSize: "13px" }}>
            Sign in with enterprise administrative credentials to manage organization, staff, and payroll.
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="admin-email">Admin Email or Contact Number</label>
            <div className="login-input-wrap">
              <span className="field-icon">
                <MailIcon width={14} height={14} />
              </span>
              <input
                id="admin-email"
                type="text"
                placeholder="admin@ems.com or contact number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="login-input-wrap">
              <span className="field-icon">
                <LockIcon width={14} height={14} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
                style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-row">
            <label className="login-remember">
              <input type="checkbox" defaultChecked />
              Remember this device
            </label>
            <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: "600" }}>
              Secure Admin Auth
            </span>
          </div>

          <button
            type="submit"
            id="admin-submit-btn"
            className="login-submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            }}
          >
            {loading ? "Authenticating Administrator..." : "Sign In to Admin Portal →"}
          </button>
        </form>


        {/* Quick Demo Option for Admin */}
        <div style={{ marginTop: "14px" }}>
          <button
            type="button"
            id="demo-admin-quick-btn"
            onClick={handleQuickDemoAdmin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#1e293b",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldIcon width={14} height={14} />
              <strong style={{ fontSize: "12px" }}>1-Click Admin Demo Login</strong>
            </div>
            <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>Sign In →</span>
          </button>
        </div>

        {/* Navigation to Employee Login Page */}
        <div className="login-portal-switch-card">
          <div className="switch-text">
            <span>Are you a company employee?</span>
            <p>Employees have a dedicated portal to view attendance, salary slips, and apply for leaves.</p>
          </div>
          <button
            type="button"
            id="switch-to-employee-page-btn"
            onClick={onNavigateToEmployee}
            className="portal-switch-action-btn"
          >
            <UserIcon width={14} height={14} /> Go to Employee Sign In Page →
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p style={{ margin: "14px 0 0", fontSize: "11px", color: "#64748b", lineHeight: "1.4", textAlign: "center" }}>
            🔒 <strong>Administrator Access Only:</strong> Authorized personnel only. All access attempts are logged.
          </p>
        </div>
      </div>

    </div>
  );
}
