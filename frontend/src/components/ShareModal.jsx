import React, { useState, useEffect } from "react";
import "./ShareModal.css";

export default function ShareModal({
  isOpen,
  onClose,
  portalType = "employee", // 'admin' | 'employee'
  user,
  activeTab = "",
}) {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("direct"); // 'direct' | 'activeTab'
  const [qrLoaded, setQrLoaded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAdmin = portalType === "admin";
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  
  // Compute shareable URLs
  const baseUrl = `${origin}${currentPath}`;
  const tabParam = activeTab ? `?tab=${encodeURIComponent(activeTab)}` : "";
  const shareUrl = selectedFormat === "activeTab" && activeTab ? `${baseUrl}${tabParam}` : baseUrl;

  const portalTitle = isAdmin
    ? "EMS • Corporate Admin Management Console"
    : "EMS • Employee Self-Service Workspace";

  const portalDescription = isAdmin
    ? `Access the Employee Management System Administrator Console (Shared by ${user?.name || "Administrator"}).`
    : `Access your Employee Portal for attendance punches, salary payslips, and leave requests (Shared by ${user?.name || "Staff Member"}).`;

  const copyToClipboard = async (textToCopy, label = "Link copied to clipboard!") => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const tempInput = document.createElement("input");
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      setShareFeedback({ type: "success", message: label });
      setTimeout(() => {
        setCopied(false);
        setShareFeedback(null);
      }, 3000);
    } catch (err) {
      console.error("Clipboard error:", err);
      setShareFeedback({ type: "error", message: "Failed to copy. Please manually select the link." });
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  // Native Device Share (Web Share API)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: portalTitle,
          text: portalDescription,
          url: shareUrl,
        });
        setShareFeedback({ type: "success", message: "Shared successfully via device!" });
        setTimeout(() => setShareFeedback(null), 3000);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Share cancelled or failed:", err);
        }
      }
    } else {
      copyToClipboard(shareUrl, "Link copied! Share API not available on this browser.");
    }
  };

  // Quick Channel Handlers
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`${portalTitle} - Workplace Portal Access`);
    const body = encodeURIComponent(
      `Hello,\n\nHere is the access link to the ${portalTitle}:\n${shareUrl}\n\nShared by: ${user?.name || "EMS User"} (${isAdmin ? "Admin" : "Employee"})\nDepartment: ${user?.department || "Corporate"}\n\nNote: Please log in with your authorized corporate credentials.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `*${portalTitle}*\n${portalDescription}\n\n👉 Access Portal: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  const handleCopySlackSnippet = () => {
    const snippet = `:office: *${portalTitle}*\n*Access Link:* <${shareUrl}>\n*Shared by:* ${user?.name || "Staff"} (${isAdmin ? "Administrator" : "Employee"}) - ${user?.department || "Corporate"}\n_Please authenticate with authorized credentials._`;
    copyToClipboard(snippet, "Slack / Teams formatted message copied to clipboard!");
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}&margin=8`;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="share-modal-header">
          <div className="share-header-left">
            <div className={`share-icon-bubble ${isAdmin ? "admin" : "employee"}`}>
              <span>📤</span>
            </div>
            <div>
              <h2>Share Workplace Portal</h2>
              <p>
                {isAdmin
                  ? "Share administrator console link or invite team leads"
                  : "Share employee workspace link with colleagues & devices"}
              </p>
            </div>
          </div>
          <button type="button" className="share-close-btn" onClick={onClose} title="Close dialog">
            ✕
          </button>
        </div>

        {/* FEEDBACK TOAST */}
        {shareFeedback && (
          <div className={`share-feedback-toast ${shareFeedback.type}`}>
            <span>{shareFeedback.type === "success" ? "✓" : "⚠️"}</span>
            <span>{shareFeedback.message}</span>
          </div>
        )}

        <div className="share-modal-body">
          {/* PORTAL PREVIEW CARD */}
          <div className="share-portal-preview-card">
            <div className="preview-brand-tag">
              <span className={`role-badge ${isAdmin ? "admin" : "employee"}`}>
                {isAdmin ? "🛡️ Admin Console" : "👤 Employee Workspace"}
              </span>
              <span className="live-status-pill">
                <span className="live-pulse"></span> Active
              </span>
            </div>

            <div className="preview-main">
              <h3>{portalTitle}</h3>
              <p>{portalDescription}</p>
              <div className="preview-meta">
                <span>👤 Shared by: <strong>{user?.name || "User"}</strong></span>
                <span>🏢 Dept: <strong>{user?.department || "Corporate"}</strong></span>
              </div>
            </div>
          </div>

          {/* LINK OPTION SELECTOR (If activeTab exists) */}
          {activeTab && (
            <div className="share-format-selector">
              <label>Select Link Type:</label>
              <div className="share-format-pills">
                <button
                  type="button"
                  className={`format-pill ${selectedFormat === "direct" ? "active" : ""}`}
                  onClick={() => setSelectedFormat("direct")}
                >
                  🔗 Main Portal Link
                </button>
                <button
                  type="button"
                  className={`format-pill ${selectedFormat === "activeTab" ? "active" : ""}`}
                  onClick={() => setSelectedFormat("activeTab")}
                >
                  📑 Current Tab ({activeTab})
                </button>
              </div>
            </div>
          )}

          {/* 1-CLICK COPY INPUT BOX */}
          <div className="share-copy-box">
            <label>Shareable Portal Link</label>
            <div className="share-input-group">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="share-url-input"
              />
              <button
                type="button"
                className={`share-copy-btn ${copied ? "copied" : ""}`}
                onClick={() => copyToClipboard(shareUrl, "Portal link copied to clipboard!")}
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* QUICK SHARING CHANNELS */}
          <div className="share-channels-section">
            <label>Quick Share Channels</label>
            <div className="share-channels-grid">
              {/* Native Mobile/Device Share */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  type="button"
                  className="share-channel-btn device-share"
                  onClick={handleNativeShare}
                >
                  <span className="channel-icon">📱</span>
                  <div className="channel-text">
                    <strong>Device Apps</strong>
                    <small>Share via system sheet</small>
                  </div>
                </button>
              )}

              {/* WhatsApp */}
              <button
                type="button"
                className="share-channel-btn whatsapp"
                onClick={handleShareWhatsApp}
              >
                <span className="channel-icon">💬</span>
                <div className="channel-text">
                  <strong>WhatsApp</strong>
                  <small>Share message</small>
                </div>
              </button>

              {/* Email */}
              <button
                type="button"
                className="share-channel-btn email"
                onClick={handleShareEmail}
              >
                <span className="channel-icon">📧</span>
                <div className="channel-text">
                  <strong>Email</strong>
                  <small>Send formal invitation</small>
                </div>
              </button>

              {/* Slack / Teams */}
              <button
                type="button"
                className="share-channel-btn slack"
                onClick={handleCopySlackSnippet}
              >
                <span className="channel-icon">💼</span>
                <div className="channel-text">
                  <strong>Slack / Teams</strong>
                  <small>Copy formatted card</small>
                </div>
              </button>
            </div>
          </div>

          {/* MOBILE QR CODE SECTION */}
          <div className="share-qr-section">
            <div className="qr-info">
              <h4>📱 Scan with Mobile Phone</h4>
              <p>
                Point your phone camera to instantly open and bookmark this workplace portal on your mobile device.
              </p>
              <div className="qr-security-badge">
                <span>🔒</span> Corporate SSO / Credentials Required
              </div>
            </div>

            <div className="qr-code-box">
              <img
                src={qrApiUrl}
                alt="Workplace Portal QR Code"
                className="qr-img"
                onLoad={() => setQrLoaded(true)}
                onError={(e) => {
                  // Fallback if offline
                  e.target.style.display = "none";
                }}
              />
              {!qrLoaded && (
                <div className="qr-placeholder">
                  <span className="qr-fallback-icon">🏁</span>
                  <small>QR Code</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="share-modal-footer">
          <div className="share-footer-note">
            <span>🛡️</span> All portal links enforce authenticated session encryption.
          </div>
          <button type="button" className="share-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
