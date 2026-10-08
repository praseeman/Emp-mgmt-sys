import { useState } from "react";

// 🔒 ONLY these users can log in
const VALID_USERS = [
  {
    email: "sppraseeman@gmail.com",   // 👈 unga email
    password: "praseeman123",          // 👈 unga password (maathikonga)
    role: "admin",
    name: "Praseeman",
  },
  {
    email: "admin@ems.com",
    password: "admin",
    role: "admin",
    name: "Admin",
  },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // ---- Validation ----
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // ---- Auth check ----
    setTimeout(() => {
      const matched = VALID_USERS.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );

      if (matched) {
        onLogin({
          email: matched.email,
          role: matched.role,
          name: matched.name,
        });
      } else {
        setError("Invalid email or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo-box">EM</div>
          <div className="login-brand-text">
            <h2>EMPLOYEE</h2>
            <p>Management System</p>
          </div>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to continue to your dashboard</p>
        </div>

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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
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
            <a href="#forgot" className="login-forgot">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="login-divider">or</div>

          <button
            type="button"
            className="login-google"
            onClick={() =>
              onLogin({
                email: "sppraseeman@gmail.com",
                role: "admin",
                name: "Praseeman",
              })
            }
          >
            <span>🌐</span>
            Continue with Google (Demo Sign In)
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <a href="#register">Create one</a>
          <p style={{ marginTop: "10px", fontSize: "12px", color: "#64748b" }}>
            🔑 Demo: <strong>sppraseeman@gmail.com</strong> / <strong>praseeman123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}