import React, { useState } from "react";
import GoogleAuthModal from "../components/GoogleAuthModal";
import {
  UserIcon,
  MailIcon,
  LockIcon,
  GoogleLogoIcon,
} from "../components/Icons";

// Fallback employees for local client authentication if backend is offline
const LOCAL_EMPLOYEES = [
  {
    email: "rahul@gmail.com",
    password: "employee123",
    role: "employee",
    name: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    salary: 85000,
    phone: "9876543210",
    joinDate: "2023-03-20",
  },
  {
    email: "priya@gmail.com",
    password: "employee123",
    role: "employee",
    name: "Priya Patel",
    department: "Design",
    designation: "Lead UI/UX Designer",
    salary: 62000,
    phone: "9123456780",
    joinDate: "2023-06-10",
  },
];

export default function EmployeeLogin({ onLogin, onNavigateToAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your employee email or contact number and password.");
      return;
    }

    const cleanInput = email.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput);
    const isPhone = /^[0-9+\s-]{7,15}$/.test(cleanInput);

    if (!isEmail && !isPhone) {
      setError("Please enter a valid employee email address or contact number.");
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
        if (data.user?.role === "admin") {
          setError("This account has Administrator privileges. Please sign in via the Administrator Login Page.");
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
      let customPasswords = {};
      try {
        customPasswords = JSON.parse(localStorage.getItem("ems_custom_passwords") || "{}");
      } catch (e) {}
      const savedCustomPwd = customPasswords[cleanLower];

      const matched = LOCAL_EMPLOYEES.find(
        (u) =>
          (u.email.toLowerCase() === cleanLower || u.phone === cleanInput) &&
          (
            (savedCustomPwd && password === savedCustomPwd) ||
            password === u.password ||
            password === u.phone ||
            password === "employee123" ||
            password === "password123"
          )
      );

      if (matched) {
        setLoading(false);
        onLogin(matched);
      } else {
        if (cleanLower.includes("praseeman") || cleanLower.includes("admin@")) {
          setError("This account is an Administrator account. Please sign in via the Administrator Login Portal.");
        } else {
          setError("Invalid employee credentials. Please verify your email/phone and password.");
        }
        setLoading(false);
      }
    }, 350);
  };

  const handleQuickDemoEmployee = (index = 0) => {
    setError("");
    onLogin(LOCAL_EMPLOYEES[index]);
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "460px" }}>
        {/* Brand */}
        <div className="login-brand">
          <div
            className="logo-box"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 8px 20px rgba(16, 185, 129, 0.35)",
            }}
          >
            <UserIcon width={26} height={26} />
          </div>
          <div className="login-brand-text">
            <h2>EMPLOYEE</h2>
            <p>Management System</p>
          </div>
        </div>

        {/* Dedicated Employee Portal Badge */}
        <div style={{ textAlign: "center" }}>
          <div className="portal-badge employee">
            <UserIcon width={14} height={14} /> Employee Workspace Portal
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1 style={{ fontSize: "24px" }}>Employee Sign In</h1>
          <p style={{ fontSize: "13px" }}>
            Sign in with your staff account to access your attendance calendar, salary slips, and leaves.
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
            <label htmlFor="emp-email">Employee Email or Contact Number</label>
            <div className="login-input-wrap">
              <span className="field-icon">
                <MailIcon width={14} height={14} />
              </span>
              <input
                id="emp-email"
                type="text"
                placeholder="employee@ems.com or contact number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="emp-password">Password</label>
            <div className="login-input-wrap">
              <span className="field-icon">
                <LockIcon width={14} height={14} />
              </span>
              <input
                id="emp-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
            <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
              Staff Workspace
            </span>
          </div>

          <button
            type="submit"
            id="employee-submit-btn"
            className="login-submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #059669, #047857)",
              boxShadow: "0 10px 24px rgba(5, 150, 105, 0.3)",
            }}
          >
            {loading ? "Authenticating Staff..." : "Sign In to Employee Portal →"}
          </button>
        </form>

        {/* Google / Gmail Sign In Option */}
        <div style={{ marginTop: "18px" }}>
          <div className="login-divider">or continue with</div>
          <button
            type="button"
            id="emp-google-signin-btn"
            className="login-google"
            style={{ width: "100%", marginTop: "10px", cursor: "pointer" }}
            onClick={() => setShowGoogleModal(true)}
          >
            <GoogleLogoIcon width={18} height={18} />
            <span>Sign in with Google (Gmail)</span>
          </button>
        </div>

        {/* Quick Demo Options for Employee */}
        <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button
            type="button"
            id="demo-emp-quick-btn-1"
            onClick={() => handleQuickDemoEmployee(0)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#1e293b",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserIcon width={12} height={12} />
              <strong style={{ fontSize: "11.5px" }}>Engineering Demo</strong>
            </div>
            <span style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>→</span>
          </button>

          <button
            type="button"
            id="demo-emp-quick-btn-2"
            onClick={() => handleQuickDemoEmployee(1)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#1e293b",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserIcon width={12} height={12} />
              <strong style={{ fontSize: "11.5px" }}>Design Demo</strong>
            </div>
            <span style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>→</span>
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p style={{ margin: "14px 0 0", fontSize: "11px", color: "#64748b", lineHeight: "1.4", textAlign: "center" }}>
            👤 <strong>Employee Workspace:</strong> Personal access only. Need help? Contact your company HR team.
          </p>
        </div>
      </div>

      {/* Google / Gmail Auth Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onLogin={onLogin}
        expectedRole="employee"
        onRoleRedirect={onNavigateToAdmin}
      />
    </div>
  );
}
