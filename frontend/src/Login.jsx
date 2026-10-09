import { useState } from "react";

// Fallback users for local client authentication if backend is starting
const LOCAL_USERS = [
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
  {
    email: "rahul@gmail.com",
    password: "employee123",
    role: "employee",
    name: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    salary: 85000,
    phone: "9876543210",
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
  },
];

export default function Login({ onLogin }) {
  const [activePortal, setActivePortal] = useState("admin"); // 'admin' | 'employee'
  const [email, setEmail] = useState("sppraseeman@gmail.com");
  const [password, setPassword] = useState("praseeman123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Switch tabs and pre-fill helpful credentials
  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setError("");
    if (portal === "admin") {
      setEmail("sppraseeman@gmail.com");
      setPassword("praseeman123");
    } else {
      setEmail("rahul@gmail.com");
      setPassword("employee123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt Backend Auth
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        setLoading(false);
        onLogin(data.user);
        return;
      }
    } catch (err) {
      console.warn("Backend auth unavailable, trying local fallback", err);
    }

    // 2. Fallback to Local Auth Check
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const matched = LOCAL_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === password
      );

      if (matched) {
        setLoading(false);
        onLogin(matched);
      } else {
        setError("Invalid email or password. Please check your credentials.");
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemo = (demoUser) => {
    setError("");
    onLogin(demoUser);
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "480px" }}>
        {/* Brand */}
        <div className="login-brand">
          <div className="logo-box">EM</div>
          <div className="login-brand-text">
            <h2>EMPLOYEE</h2>
            <p>Management System</p>
          </div>
        </div>

        {/* Portal Switcher Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            background: "#f1f5f9",
            padding: "5px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        >
          <button
            type="button"
            id="admin-tab-btn"
            onClick={() => handlePortalSwitch("admin")}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "9px",
              background: activePortal === "admin" ? "#ffffff" : "transparent",
              color: activePortal === "admin" ? "#1e293b" : "#64748b",
              fontWeight: "700",
              fontSize: "13px",
              boxShadow:
                activePortal === "admin"
                  ? "0 2px 8px rgba(0,0,0,0.08)"
                  : "none",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            🛡️ Admin Portal
          </button>

          <button
            type="button"
            id="employee-tab-btn"
            onClick={() => handlePortalSwitch("employee")}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "9px",
              background: activePortal === "employee" ? "#ffffff" : "transparent",
              color: activePortal === "employee" ? "#1e293b" : "#64748b",
              fontWeight: "700",
              fontSize: "13px",
              boxShadow:
                activePortal === "employee"
                  ? "0 2px 8px rgba(0,0,0,0.08)"
                  : "none",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            👤 Employee Portal
          </button>
        </div>

        {/* Dynamic Heading */}
        <div className="login-heading">
          <h1>{activePortal === "admin" ? "Administrator Sign In" : "Employee Sign In"}</h1>
          <p>
            {activePortal === "admin"
              ? "Access administrative controls, departments, attendance & payroll"
              : "Access your profile, daily attendance, payslips & leave requests"}
          </p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <div className="login-input-wrap">
              <span className="field-icon">✉</span>
              <input
                id="email"
                type="email"
                placeholder={
                  activePortal === "admin"
                    ? "admin@ems.com"
                    : "employee@ems.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <span className="field-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
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
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="login-row">
            <label className="login-remember">
              <input type="checkbox" defaultChecked />
              Remember me
            </label>
            <span
              style={{ fontSize: "12px", color: "#64748b" }}
            >
              Role: <strong>{activePortal.toUpperCase()}</strong>
            </span>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : `Sign In as ${activePortal === "admin" ? "Admin" : "Employee"}`}
          </button>
        </form>

        {/* Quick Demo Logins Section */}
        <div style={{ marginTop: "24px" }}>
          <div className="login-divider">⚡ 1-Click Demo Login</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginTop: "12px",
            }}
          >
            <button
              type="button"
              id="demo-admin-btn"
              onClick={() =>
                handleQuickDemo({
                  id: "1",
                  email: "sppraseeman@gmail.com",
                  role: "admin",
                  name: "Praseeman",
                  department: "HR",
                  designation: "Administrator & HR Manager",
                  salary: 65000,
                  phone: "8248070608",
                })
              }
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                cursor: "pointer",
                textAlign: "left",
                transition: "0.2s",
              }}
            >
              <strong style={{ fontSize: "12px", color: "#1e293b" }}>
                🛡️ Admin: Praseeman
              </strong>
              <small style={{ fontSize: "11px", color: "#64748b" }}>
                Full System Admin
              </small>
            </button>

            <button
              type="button"
              id="demo-employee-btn"
              onClick={() =>
                handleQuickDemo({
                  id: "2",
                  email: "rahul@gmail.com",
                  role: "employee",
                  name: "Rahul Sharma",
                  department: "Engineering",
                  designation: "Senior Software Engineer",
                  salary: 85000,
                  phone: "9876543210",
                  joinDate: "2023-03-20",
                })
              }
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                cursor: "pointer",
                textAlign: "left",
                transition: "0.2s",
              }}
            >
              <strong style={{ fontSize: "12px", color: "#1e293b" }}>
                👤 Employee: Rahul
              </strong>
              <small style={{ fontSize: "11px", color: "#64748b" }}>
                Engineering Staff
              </small>
            </button>
          </div>

          <div style={{ marginTop: "10px" }}>
            <button
              type="button"
              id="demo-employee-designer-btn"
              onClick={() =>
                handleQuickDemo({
                  id: "3",
                  email: "priya@gmail.com",
                  role: "employee",
                  name: "Priya Patel",
                  department: "Design",
                  designation: "Lead UI/UX Designer",
                  salary: 62000,
                  phone: "9123456780",
                  joinDate: "2023-06-10",
                })
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              <span style={{ fontSize: "12px", color: "#334155", fontWeight: "600" }}>
                🎨 Demo Employee: Priya Patel (Design)
              </span>
              <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600" }}>
                Sign In →
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <p style={{ margin: "14px 0 0", fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>
            🔒 <strong>Role-Based Access Control Active:</strong> Employee accounts cannot access the Administrator Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}