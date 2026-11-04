import React, { useState, useEffect } from "react";
import { GoogleLogoIcon, ShieldIcon, UserIcon } from "./Icons";
import "./GoogleAuthModal.css";

// Known fallback employee accounts with Gmail in EMS
const REGISTERED_GMAIL_ACCOUNTS = [
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    role: "employee",
    designation: "Senior Software Engineer",
    department: "Engineering",
    phone: "9876543210",
    salary: 85000,
    joinDate: "2023-03-20",
  },
  {
    name: "Priya Patel",
    email: "priya@gmail.com",
    role: "employee",
    designation: "Lead UI/UX Designer",
    department: "Design",
    phone: "9123456780",
    salary: 62000,
    joinDate: "2023-06-10",
  },
];

const ADMIN_GMAILS = ["sppraseeman@gmail.com", "admin@ems.com"];

export default function GoogleAuthModal({
  isOpen = false,
  onClose = () => {},
  onLogin = () => {},
  expectedRole = "employee",
  onRoleRedirect = null,
}) {
  const [customEmail, setCustomEmail] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAuthenticateWithGmail = async (targetEmail) => {
    setError("");
    setLoading(true);

    const cleanEmail = targetEmail.trim().toLowerCase();

    // Check if user is attempting to sign in with an Administrator email
    if (ADMIN_GMAILS.includes(cleanEmail)) {
      setLoading(false);
      setError(
        "Gmail login is exclusively for employee workspace access. Administrators must sign in using enterprise credentials on the Administrator Sign In page."
      );
      return;
    }

    try {
      // 1. Try Backend Google OAuth Verification
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoading(false);
        const user = data.user;

        if (user.role === "admin") {
          setError(
            "Gmail login is exclusively for employee workspace access. Administrators must sign in on the Administrator Sign In page."
          );
          return;
        }

        onLogin(user);
        onClose();
        return;
      } else {
        // Backend returned error (e.g. 403 or 404)
        setLoading(false);
        setError(
          data.message ||
            `No registered employee account found with Gmail "${cleanEmail}". Only existing employees can sign in with Gmail.`
        );
        return;
      }
    } catch (err) {
      console.warn("Backend auth offline, checking local registry", err);
    }

    // 2. Offline / Local Fallback Check
    setTimeout(() => {
      setLoading(false);

      if (ADMIN_GMAILS.includes(cleanEmail)) {
        setError(
          "Gmail login is exclusively for employee workspace access. Administrators must sign in using enterprise credentials on the Administrator Sign In page."
        );
        return;
      }

      const matched = REGISTERED_GMAIL_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === cleanEmail
      );

      if (matched) {
        onLogin(matched);
        onClose();
      } else {
        setError(
          `No registered employee account found with Gmail "${cleanEmail}". Only existing employees can sign in with Gmail.`
        );
      }
    }, 300);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) {
      setError("Please enter your Gmail address.");
      return;
    }
    if (!customEmail.includes("@")) {
      setError("Please enter a valid Gmail address (e.g. yourname@gmail.com).");
      return;
    }
    handleAuthenticateWithGmail(customEmail);
  };

  return (
    <div className="google-auth-overlay" onClick={onClose}>
      <div
        className="google-auth-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-auth-title"
      >
        {/* Close Button */}
        <button
          type="button"
          className="google-auth-close"
          onClick={onClose}
          aria-label="Close Google Sign-In"
        >
          ✕
        </button>

        {/* Header */}
        <div className="google-auth-header">
          <div className="google-auth-logo">
            <GoogleLogoIcon width={36} height={36} />
          </div>
          <h2 id="google-auth-title" className="google-auth-title">
            Employee Sign In with Google
          </h2>
          <p className="google-auth-subtitle">
            Choose your registered employee Gmail account to continue to{" "}
            <strong>Employee Workspace</strong>
          </p>
        </div>

        {/* Registered Account Chooser List */}
        <div className="google-account-list">
          {REGISTERED_GMAIL_ACCOUNTS.map((account) => {
            return (
              <button
                key={account.email}
                type="button"
                className="google-account-item"
                disabled={loading}
                onClick={() => handleAuthenticateWithGmail(account.email)}
              >
                <div className="google-account-left">
                  <div
                    className="google-avatar"
                    style={{
                      background: "linear-gradient(135deg, #059669, #10b981)",
                    }}
                  >
                    {account.name.charAt(0)}
                  </div>
                  <div className="google-account-meta">
                    <span className="google-account-name">{account.name}</span>
                    <span className="google-account-email">{account.email}</span>
                  </div>
                </div>

                <span className="google-role-badge employee">
                  Employee
                </span>
              </button>
            );
          })}
        </div>

        {/* Option to enter another Gmail */}
        <div className="google-manual-entry">
          {!showManual ? (
            <button
              type="button"
              className="google-manual-toggle"
              onClick={() => setShowManual(true)}
            >
              <span>+ Use another Employee Gmail account</span>
            </button>
          ) : (
            <form onSubmit={handleManualSubmit}>
              <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "6px" }}>
                Enter your registered employee Gmail address:
              </div>
              <div className="google-manual-form">
                <input
                  type="email"
                  className="google-manual-input"
                  placeholder="employee@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="google-manual-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="google-auth-error">
            <span>⚠</span>
            <div>
              <span>{error}</span>
              {onRoleRedirect && error.includes("Administrator") && (
                <div style={{ marginTop: "6px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRoleRedirect();
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#1d4ed8",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Switch to Administrator Sign In Page now →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="google-auth-footer">
          🔒 <strong>Employee Portal Only:</strong> Google sign-in is restricted exclusively to active employees. Administrators must use enterprise credentials.
        </div>
      </div>
    </div>
  );
}
