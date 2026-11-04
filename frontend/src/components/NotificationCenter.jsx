import React, { useState, useEffect, useCallback } from "react";
import "./NotificationCenter.css";

const API_BASE = "http://localhost:5000/api";

const NOTIFICATION_ICONS = {
  leave: "📝",
  attendance: "⏰",
  payroll: "💳",
  announcement: "📢",
  performance: "🎯",
  system: "⚙️",
};

export default function NotificationCenter({
  user,
  role = "employee",
  isOpen,
  onClose,
  onNavigate,
  onTriggerToast,
}) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
    type: "announcement",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const email = user?.email || "";
      const empId = user?.id || user?._id || "";
      const res = await fetch(
        `${API_BASE}/notifications?role=${role}&email=${encodeURIComponent(
          email
        )}&employeeId=${encodeURIComponent(empId)}`
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.warn("Could not fetch notifications from backend:", err);
    }
  }, [user, role]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: user?.email }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  // Admin Broadcast Announcement
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastData.title.trim() || !broadcastData.message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientRole: "all",
          recipientEmail: "all",
          type: broadcastData.type,
          title: broadcastData.title,
          message: broadcastData.message,
          linkTab: "overview",
        }),
      });

      if (res.ok) {
        const newNotif = await res.json();
        setNotifications((prev) => [newNotif, ...prev]);
        setBroadcastData({ title: "", message: "", type: "announcement" });
        setShowBroadcastForm(false);
        if (onTriggerToast) {
          onTriggerToast("Announcement broadcasted to all employees successfully!", "success");
        }
      }
    } catch (err) {
      console.error("Error broadcasting:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      handleMarkAsRead(notif._id);
    }
    if (notif.linkTab && onNavigate) {
      onNavigate(notif.linkTab);
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "leaves") return n.type === "leave";
    if (filter === "attendance") return n.type === "attendance";
    if (filter === "payroll") return n.type === "payroll";
    if (filter === "announcement") return n.type === "announcement";
    return true;
  });

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (!isOpen) return null;

  return (
    <div className="notif-center-backdrop" onClick={onClose}>
      <div className="notif-center-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-left">
            <span className="notif-bell-icon">🔔</span>
            <div>
              <h3>Notifications & Alerts</h3>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="notif-header-right">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-read-btn"
                onClick={handleMarkAllRead}
              >
                ✓ Mark all read
              </button>
            )}
            <button
              type="button"
              className="notif-close-btn"
              onClick={onClose}
              title="Close notifications"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Admin Broadcast Toggle */}
        {role === "admin" && (
          <div className="notif-admin-strip">
            <button
              type="button"
              className="notif-broadcast-toggle-btn"
              onClick={() => setShowBroadcastForm((prev) => !prev)}
            >
              <span>📢</span>
              <span>{showBroadcastForm ? "Cancel Announcement" : "+ Broadcast Company Announcement"}</span>
            </button>
          </div>
        )}

        {/* Broadcast Form (Admin) */}
        {showBroadcastForm && role === "admin" && (
          <form className="notif-broadcast-form" onSubmit={handleBroadcastSubmit}>
            <h4>Send Live Broadcast Announcement</h4>
            <input
              type="text"
              placeholder="Announcement Title (e.g. Townhall Meeting, Policy Update)"
              value={broadcastData.title}
              onChange={(e) =>
                setBroadcastData({ ...broadcastData, title: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Announcement message details for all employees..."
              rows={3}
              value={broadcastData.message}
              onChange={(e) =>
                setBroadcastData({ ...broadcastData, message: e.target.value })
              }
              required
            />
            <div className="notif-broadcast-actions">
              <select
                value={broadcastData.type}
                onChange={(e) =>
                  setBroadcastData({ ...broadcastData, type: e.target.value })
                }
              >
                <option value="announcement">📢 General Announcement</option>
                <option value="attendance">⏰ Attendance Notice</option>
                <option value="payroll">💳 Payroll Notice</option>
                <option value="leave">📝 HR / Leave Notice</option>
              </select>
              <button
                type="submit"
                className="notif-broadcast-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send to All Employees ➔"}
              </button>
            </div>
          </form>
        )}

        {/* Filter Tabs */}
        <div className="notif-filter-tabs">
          <button
            type="button"
            className={`notif-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            className={`notif-filter-btn ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            className={`notif-filter-btn ${filter === "leaves" ? "active" : ""}`}
            onClick={() => setFilter("leaves")}
          >
            Leaves
          </button>
          <button
            type="button"
            className={`notif-filter-btn ${filter === "attendance" ? "active" : ""}`}
            onClick={() => setFilter("attendance")}
          >
            Attendance
          </button>
          <button
            type="button"
            className={`notif-filter-btn ${filter === "payroll" ? "active" : ""}`}
            onClick={() => setFilter("payroll")}
          >
            Payroll
          </button>
          <button
            type="button"
            className={`notif-filter-btn ${filter === "announcement" ? "active" : ""}`}
            onClick={() => setFilter("announcement")}
          >
            Announcements
          </button>
        </div>

        {/* Notifications List */}
        <div className="notif-list-wrap">
          {filteredNotifications.length === 0 ? (
            <div className="notif-empty-state">
              <span className="notif-empty-icon">📭</span>
              <h4>No notifications to display</h4>
              <p>You have no notifications under the "{filter}" category.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const icon = NOTIFICATION_ICONS[notif.type] || "🔔";
              return (
                <div
                  key={notif._id}
                  className={`notif-card ${notif.read ? "read" : "unread"}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={`notif-icon-bubble ${notif.type || "general"}`}>
                    {icon}
                  </div>
                  <div className="notif-content">
                    <div className="notif-title-row">
                      <h4 className="notif-item-title">{notif.title}</h4>
                      <span className="notif-time">{formatTimeAgo(notif.timestamp)}</span>
                    </div>
                    <p className="notif-item-desc">{notif.message}</p>
                    <div className="notif-footer-row">
                      <span className={`notif-type-tag ${notif.type || "general"}`}>
                        {notif.type?.toUpperCase() || "UPDATE"}
                      </span>
                      {!notif.read && (
                        <button
                          type="button"
                          className="notif-btn-mark"
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  {!notif.read && <div className="notif-unread-dot" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
