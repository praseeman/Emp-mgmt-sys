import React, { useState, useEffect, useCallback } from "react";
import "./EmployeeDashboard.css";

const API_BASE = "http://localhost:5000/api";

export default function EmployeeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Profile Edit State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: user?.phone || "9876543210",
    address: user?.address || "Flat 402, Cyber Heights, Bangalore",
    emergencyContact: user?.emergencyContact || "9876500000 (Family)",
  });

  // Attendance State
  const [todayAttendance, setTodayAttendance] = useState({
    checkedIn: false,
    checkInTime: null,
    checkedOut: false,
    checkOutTime: null,
    status: "Not Marked",
  });

  const [attendanceHistory, setAttendanceHistory] = useState([
    {
      date: "2026-10-09",
      day: "Today",
      checkIn: "09:10 AM",
      checkOut: "--",
      hours: "In Progress",
      status: "Present",
    },
    {
      date: "2026-10-08",
      day: "Thursday",
      checkIn: "08:55 AM",
      checkOut: "06:05 PM",
      hours: "9.1 hrs",
      status: "Present",
    },
    {
      date: "2026-10-07",
      day: "Wednesday",
      checkIn: "09:02 AM",
      checkOut: "06:15 PM",
      hours: "9.2 hrs",
      status: "Present",
    },
    {
      date: "2026-10-06",
      day: "Tuesday",
      checkIn: "09:35 AM",
      checkOut: "06:30 PM",
      hours: "8.9 hrs",
      status: "Late",
    },
    {
      date: "2026-10-05",
      day: "Monday",
      checkIn: "08:58 AM",
      checkOut: "06:00 PM",
      hours: "9.0 hrs",
      status: "Present",
    },
    {
      date: "2026-10-02",
      day: "Friday",
      checkIn: "--",
      checkOut: "--",
      hours: "0 hrs",
      status: "Holiday",
    },
  ]);

  // Leave State
  const [leaves, setLeaves] = useState([]);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  // Payslip Modal State
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Digital Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch leaves from API
  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/leaves?email=${encodeURIComponent(user?.email || "")}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (e) {
      console.error("Error fetching employee leaves:", e);
    }
  }, [user?.email]);

  // Fetch attendance from API
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance?employeeId=${user?.id || user?._id || "2"}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const todayStr = new Date().toISOString().split("T")[0];
          const todayRec = data.find((r) => r.date === todayStr);
          if (todayRec) {
            setTodayAttendance({
              checkedIn: !!todayRec.checkIn && todayRec.checkIn !== "--",
              checkInTime: todayRec.checkIn,
              checkedOut: !!todayRec.checkOut && todayRec.checkOut !== "--",
              checkOutTime: todayRec.checkOut,
              status: todayRec.status,
            });
          }
        }
      }
    } catch (e) {
      console.error("Error fetching attendance:", e);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaves();
    fetchAttendance();
  }, [fetchLeaves, fetchAttendance]);

  // Handlers for Check-in & Check-out
  const handleCheckIn = async () => {
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setTodayAttendance({
      checkedIn: true,
      checkInTime: timeStr,
      checkedOut: false,
      checkOutTime: null,
      status: "Present",
    });

    setAttendanceHistory((prev) => [
      {
        date: new Date().toISOString().split("T")[0],
        day: "Today",
        checkIn: timeStr,
        checkOut: "--",
        hours: "In Progress",
        status: "Present",
      },
      ...prev.filter((p) => p.day !== "Today"),
    ]);

    try {
      await fetch(`${API_BASE}/attendance/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user?.id || user?._id || "2",
          employeeName: user?.name || "Employee",
          department: user?.department || "General",
        }),
      });
    } catch (e) {
      console.error("Attendance API check-in error:", e);
    }
  };

  const handleCheckOut = async () => {
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setTodayAttendance((prev) => ({
      ...prev,
      checkedOut: true,
      checkOutTime: timeStr,
    }));

    setAttendanceHistory((prev) =>
      prev.map((item) =>
        item.day === "Today"
          ? { ...item, checkOut: timeStr, hours: "8.5 hrs" }
          : item
      )
    );

    try {
      await fetch(`${API_BASE}/attendance/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user?.id || user?._id || "2",
        }),
      });
    } catch (e) {
      console.error("Attendance API check-out error:", e);
    }
  };

  // Submit Leave Request
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      alert("Please fill in all leave details.");
      return;
    }

    const start = new Date(leaveForm.fromDate);
    const end = new Date(leaveForm.toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq = {
      _id: `leave-${Date.now()}`,
      employeeId: user?.id || user?._id || "2",
      employeeName: user?.name || "Employee",
      employeeEmail: user?.email || "",
      department: user?.department || "General",
      leaveType: leaveForm.leaveType,
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      days: diffDays > 0 ? diffDays : 1,
      reason: leaveForm.reason,
      status: "Pending",
      appliedAt: new Date().toISOString().split("T")[0],
    };

    // Optimistic UI update
    setLeaves((prev) => [newReq, ...prev]);
    setIsApplyLeaveOpen(false);
    setLeaveForm({
      leaveType: "Casual Leave",
      fromDate: "",
      toDate: "",
      reason: "",
    });

    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReq),
      });
      if (res.ok) {
        alert("Leave application submitted successfully! Pending Admin approval.");
        fetchLeaves();
      }
    } catch (e) {
      console.error("Error submitting leave:", e);
    }
  };

  // Save Contact Info
  const handleSaveContact = (e) => {
    e.preventDefault();
    setIsEditingContact(false);
    alert("Personal contact details updated successfully!");
  };

  // Derived Salary Breakdown
  const salaryBase = Number(user?.salary || 65000);
  const hra = Math.round(salaryBase * 0.4);
  const specialAllowance = Math.round(salaryBase * 0.1);
  const grossSalary = salaryBase + hra + specialAllowance;
  const pfDeduction = Math.round(salaryBase * 0.12);
  const taxDeduction = Math.round(salaryBase * 0.05);
  const totalDeductions = pfDeduction + taxDeduction;
  const netSalary = grossSalary - totalDeductions;

  // Past Payslips List
  const pastPayslips = [
    {
      month: "September 2026",
      gross: grossSalary,
      deductions: totalDeductions,
      net: netSalary,
      status: "Paid",
      payDate: "30 Sep 2026",
    },
    {
      month: "August 2026",
      gross: grossSalary,
      deductions: totalDeductions,
      net: netSalary,
      status: "Paid",
      payDate: "31 Aug 2026",
    },
    {
      month: "July 2026",
      gross: grossSalary,
      deductions: totalDeductions,
      net: netSalary,
      status: "Paid",
      payDate: "31 Jul 2026",
    },
  ];

  return (
    <div className="emp-dashboard-app">
      {/* SIDEBAR */}
      <aside className="emp-sidebar">
        <div className="logo-section">
          <div className="emp-logo-box">EM</div>
          <div className="emp-logo-text">
            <h2>EMPLOYEE</h2>
            <p>Management System</p>
          </div>
        </div>

        <div className="emp-portal-badge">
          <span>●</span> Employee Workspace
        </div>

        <nav className="emp-sidebar-nav">
          <button
            type="button"
            className={`emp-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span>⌂</span> Dashboard Overview
          </button>

          <button
            type="button"
            className={`emp-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span>👤</span> My Profile
          </button>

          <button
            type="button"
            className={`emp-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <span>📅</span> My Attendance
          </button>

          <button
            type="button"
            className={`emp-nav-item ${activeTab === "salary" ? "active" : ""}`}
            onClick={() => setActiveTab("salary")}
          >
            <span>💳</span> Salary & Payslips
          </button>

          <button
            type="button"
            className={`emp-nav-item ${activeTab === "leaves" ? "active" : ""}`}
            onClick={() => setActiveTab("leaves")}
          >
            <span>📝</span> Leave Requests
          </button>
        </nav>

        {/* Sidebar User Card */}
        <div className="emp-sidebar-user">
          <div className="emp-sidebar-avatar">
            {user?.name ? user.name[0].toUpperCase() : "E"}
          </div>
          <div className="emp-sidebar-info">
            <strong>{user?.name || "Employee"}</strong>
            <small>{user?.email || "emp@ems.com"}</small>
          </div>
          <button
            type="button"
            className="emp-logout-icon-btn"
            onClick={onLogout}
            title="Log Out Securely"
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="emp-main">
        {/* TOPBAR */}
        <header className="emp-topbar">
          <div className="emp-topbar-left">
            <div className="emp-topbar-greeting">
              <h2>Welcome back, {user?.name || "Staff Member"}! 👋</h2>
              <p>Role: {user?.designation || "Employee"} • {user?.department || "General"}</p>
            </div>
          </div>

          <div className="emp-topbar-right">
            <div className="emp-live-clock">
              <span className="clock-dot"></span>
              {currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              • {currentTime.toLocaleTimeString("en-US")}
            </div>

            <span className="emp-role-tag">Employee Access</span>

            <div
              className="emp-user-menu-btn"
              onClick={() => setShowUserMenu((s) => !s)}
            >
              <div className="emp-user-avatar-small">
                {user?.name ? user.name[0].toUpperCase() : "E"}
              </div>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                {user?.name?.split(" ")[0] || "Account"}
              </span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>▼</span>
            </div>

            {showUserMenu && (
              <div
                className="emp-dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="emp-dropdown-header">
                  <strong>{user?.name || "Employee"}</strong>
                  <small>{user?.email}</small>
                </div>
                <button
                  type="button"
                  className="emp-dropdown-item"
                  onClick={() => {
                    setActiveTab("profile");
                    setShowUserMenu(false);
                  }}
                >
                  <span>👤</span> My Profile
                </button>
                <button
                  type="button"
                  className="emp-dropdown-item"
                  onClick={() => {
                    setActiveTab("salary");
                    setShowUserMenu(false);
                  }}
                >
                  <span>💳</span> View Payslips
                </button>
                <button
                  type="button"
                  className="emp-dropdown-item logout"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                >
                  <span>⏻</span> Secure Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT TABS */}
        <div className="emp-content">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              {/* HERO BANNER */}
              <div className="emp-hero-banner">
                <div className="emp-hero-info">
                  <h1>Good day, {user?.name || "Employee"}!</h1>
                  <p>Here is your daily workspace snapshot and pending tasks.</p>
                  <div className="emp-hero-meta">
                    <div className="emp-hero-meta-item">
                      <span>🏢</span> Department: {user?.department || "General"}
                    </div>
                    <div className="emp-hero-meta-item">
                      <span>💼</span> Designation: {user?.designation || "Staff Member"}
                    </div>
                    <div className="emp-hero-meta-item">
                      <span>🆔</span> ID: EMP-00{user?.id || user?._id || "2"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="emp-primary-btn"
                  style={{ background: "white", color: "#2563eb", fontWeight: "700" }}
                  onClick={() => setIsApplyLeaveOpen(true)}
                >
                  + Apply for Leave
                </button>
              </div>

              {/* LIVE CHECK-IN / CHECK-OUT CARD */}
              <div className="emp-checkin-card">
                <div className="emp-checkin-left">
                  <div className="emp-clock-icon">⏰</div>
                  <div className="emp-checkin-text">
                    <h3>Today's Attendance Status</h3>
                    <p>
                      {todayAttendance.checkedIn
                        ? `Checked in at ${todayAttendance.checkInTime} ${
                            todayAttendance.checkedOut
                              ? `• Checked out at ${todayAttendance.checkOutTime}`
                              : "(Working)"
                          }`
                        : "You have not marked attendance yet for today."}
                    </p>
                  </div>
                </div>

                <div className="emp-checkin-right">
                  {!todayAttendance.checkedIn ? (
                    <button
                      type="button"
                      className="emp-checkin-btn"
                      onClick={handleCheckIn}
                    >
                      <span>✓</span> Check In Now
                    </button>
                  ) : !todayAttendance.checkedOut ? (
                    <button
                      type="button"
                      className="emp-checkout-btn"
                      onClick={handleCheckOut}
                    >
                      <span>➔</span> Check Out
                    </button>
                  ) : (
                    <span className="emp-badge present" style={{ padding: "8px 16px", fontSize: "13px" }}>
                      ✓ Day Complete (Checked Out)
                    </span>
                  )}
                </div>
              </div>

              {/* STATS GRID */}
              <div className="emp-stats-grid">
                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap blue">📅</div>
                  <div className="emp-stat-content">
                    <span>Attendance Rate</span>
                    <h3>96.4%</h3>
                    <small>↑ Excellent this month</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap green">💳</div>
                  <div className="emp-stat-content">
                    <span>Net Take-Home Pay</span>
                    <h3>₹{netSalary.toLocaleString("en-IN")}</h3>
                    <small>Monthly payroll</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap amber">📝</div>
                  <div className="emp-stat-content">
                    <span>Leave Balance</span>
                    <h3>12 Days</h3>
                    <small>Casual & Sick remaining</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap purple">⏱</div>
                  <div className="emp-stat-content">
                    <span>Hours Worked</span>
                    <h3>154.5 hrs</h3>
                    <small>Standard 40h/week</small>
                  </div>
                </div>
              </div>

              {/* RECENT LEAVE REQUESTS */}
              <div className="emp-card">
                <div className="emp-card-header">
                  <div>
                    <h2><span>📝</span> Recent Leave Applications</h2>
                    <p>Track the approval status of your recent leave requests</p>
                  </div>
                  <button
                    type="button"
                    className="emp-primary-btn"
                    onClick={() => setIsApplyLeaveOpen(true)}
                  >
                    + Apply Leave
                  </button>
                </div>

                {leaves.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "20px" }}>
                    No leave requests found. You can submit one using the Apply Leave button.
                  </p>
                ) : (
                  <table className="emp-table">
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.slice(0, 4).map((leave) => (
                        <tr key={leave._id}>
                          <td><strong>{leave.leaveType}</strong></td>
                          <td>{leave.fromDate}</td>
                          <td>{leave.toDate}</td>
                          <td>{leave.days} day(s)</td>
                          <td>{leave.reason}</td>
                          <td>
                            <span className={`emp-badge ${leave.status?.toLowerCase()}`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ================= TAB 2: PROFILE ================= */}
          {activeTab === "profile" && (
            <div className="emp-profile-grid">
              {/* Left ID Card Badge */}
              <div className="emp-id-badge-card">
                <div className="avatar-large">
                  {user?.name ? user.name[0].toUpperCase() : "E"}
                </div>
                <h2>{user?.name || "Staff Member"}</h2>
                <p className="designation">{user?.designation || "Software Engineer"}</p>
                <div className="id-pill">EMP-00{user?.id || user?._id || "2"}</div>

                <div className="emp-id-details-list">
                  <div className="emp-id-detail-item">
                    <span>Department:</span>
                    <strong>{user?.department || "Engineering"}</strong>
                  </div>
                  <div className="emp-id-detail-item">
                    <span>Work Email:</span>
                    <strong>{user?.email}</strong>
                  </div>
                  <div className="emp-id-detail-item">
                    <span>Joining Date:</span>
                    <strong>{user?.joinDate || "2023-03-20"}</strong>
                  </div>
                  <div className="emp-id-detail-item">
                    <span>Status:</span>
                    <strong style={{ color: "#10b981" }}>Active Staff</strong>
                  </div>
                  <div className="emp-id-detail-item">
                    <span>Work Shift:</span>
                    <strong>General (09:00 - 18:00)</strong>
                  </div>
                </div>
              </div>

              {/* Right Profile Details */}
              <div className="emp-profile-details">
                {/* Official Information */}
                <div className="emp-info-section">
                  <h3><span>🏢</span> Employment Details</h3>
                  <div className="emp-info-grid">
                    <div className="emp-info-field">
                      <label>Full Name</label>
                      <p>{user?.name || "Employee"}</p>
                    </div>
                    <div className="emp-info-field">
                      <label>Employee ID</label>
                      <p>EMP-00{user?.id || user?._id || "2"}</p>
                    </div>
                    <div className="emp-info-field">
                      <label>Department</label>
                      <p>{user?.department || "Engineering"}</p>
                    </div>
                    <div className="emp-info-field">
                      <label>Designation</label>
                      <p>{user?.designation || "Staff Member"}</p>
                    </div>
                    <div className="emp-info-field">
                      <label>Reporting Manager</label>
                      <p>Praseeman (HR Lead)</p>
                    </div>
                    <div className="emp-info-field">
                      <label>Employment Type</label>
                      <p>Full-Time Permanent</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Personal Information */}
                <div className="emp-info-section">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0 }}><span>📞</span> Contact & Personal Information</h3>
                    <button
                      type="button"
                      className="emp-primary-btn"
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                      onClick={() => setIsEditingContact(!isEditingContact)}
                    >
                      {isEditingContact ? "Cancel Edit" : "✎ Edit Contact"}
                    </button>
                  </div>

                  {!isEditingContact ? (
                    <div className="emp-info-grid">
                      <div className="emp-info-field">
                        <label>Phone Number</label>
                        <p>{profileData.phone}</p>
                      </div>
                      <div className="emp-info-field">
                        <label>Official Email</label>
                        <p>{user?.email}</p>
                      </div>
                      <div className="emp-info-field">
                        <label>Residential Address</label>
                        <p>{profileData.address}</p>
                      </div>
                      <div className="emp-info-field">
                        <label>Emergency Contact</label>
                        <p>{profileData.emergencyContact}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveContact}>
                      <div className="emp-info-grid">
                        <div className="emp-dash-form-group">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({ ...profileData, phone: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="emp-dash-form-group">
                          <label>Emergency Contact</label>
                          <input
                            type="text"
                            value={profileData.emergencyContact}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                emergencyContact: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="emp-dash-form-group" style={{ gridColumn: "span 2" }}>
                          <label>Residential Address</label>
                          <input
                            type="text"
                            value={profileData.address}
                            onChange={(e) =>
                              setProfileData({ ...profileData, address: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="emp-primary-btn"
                        style={{ marginTop: "12px" }}
                      >
                        Save Contact Changes
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ATTENDANCE ================= */}
          {activeTab === "attendance" && (
            <>
              {/* Check-In Card */}
              <div className="emp-checkin-card">
                <div className="emp-checkin-left">
                  <div className="emp-clock-icon">🕒</div>
                  <div className="emp-checkin-text">
                    <h3>Daily Punch Clock</h3>
                    <p>
                      {todayAttendance.checkedIn
                        ? `Punched In at ${todayAttendance.checkInTime} ${
                            todayAttendance.checkedOut
                              ? `• Punched Out at ${todayAttendance.checkOutTime}`
                              : "(Session in progress)"
                          }`
                        : "Click below to register today's attendance"}
                    </p>
                  </div>
                </div>

                <div className="emp-checkin-right">
                  {!todayAttendance.checkedIn ? (
                    <button
                      type="button"
                      className="emp-checkin-btn"
                      onClick={handleCheckIn}
                    >
                      <span>✓</span> Punch In
                    </button>
                  ) : !todayAttendance.checkedOut ? (
                    <button
                      type="button"
                      className="emp-checkout-btn"
                      onClick={handleCheckOut}
                    >
                      <span>➔</span> Punch Out
                    </button>
                  ) : (
                    <span className="emp-badge present" style={{ padding: "8px 16px", fontSize: "13px" }}>
                      ✓ Completed Today
                    </span>
                  )}
                </div>
              </div>

              {/* Attendance Statistics */}
              <div className="emp-stats-grid">
                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap green">✓</div>
                  <div className="emp-stat-content">
                    <span>Days Present</span>
                    <h3>20 Days</h3>
                    <small>Out of 22 working days</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap amber">⏱</div>
                  <div className="emp-stat-content">
                    <span>Late Arrivals</span>
                    <h3>1 Day</h3>
                    <small>Within grace period</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap purple">📝</div>
                  <div className="emp-stat-content">
                    <span>Approved Leaves</span>
                    <h3>1 Day</h3>
                    <small>Casual Leave</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap blue">⏱</div>
                  <div className="emp-stat-content">
                    <span>Avg Daily Hours</span>
                    <h3>8.8 hrs</h3>
                    <small>Standard: 8.0 hrs</small>
                  </div>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="emp-card">
                <div className="emp-card-header">
                  <div>
                    <h2><span>📅</span> October 2026 Attendance Log</h2>
                    <p>Daily breakdown of check-in, check-out, and active hours</p>
                  </div>
                </div>

                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours Worked</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.date}</strong></td>
                        <td>{item.day}</td>
                        <td>{item.checkIn}</td>
                        <td>{item.checkOut}</td>
                        <td>{item.hours}</td>
                        <td>
                          <span className={`emp-badge ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= TAB 4: SALARY & PAYSLIPS ================= */}
          {activeTab === "salary" && (
            <>
              {/* Overview Cards */}
              <div className="emp-salary-overview">
                <div className="emp-salary-card-highlight">
                  <div>
                    <span>Current Month Take-Home Pay</span>
                    <h2>₹{netSalary.toLocaleString("en-IN")}</h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "13px" }}>
                      Gross: ₹{grossSalary.toLocaleString("en-IN")} • Deductions: ₹{totalDeductions.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{
                      background: "white",
                      color: "#059669",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      cursor: "pointer",
                      marginTop: "16px",
                      alignSelf: "flex-start",
                    }}
                    onClick={() =>
                      setSelectedPayslip({
                        month: "October 2026",
                        gross: grossSalary,
                        deductions: totalDeductions,
                        net: netSalary,
                        status: "Paid",
                        payDate: "31 Oct 2026",
                      })
                    }
                  >
                    📄 View October Payslip
                  </button>
                </div>

                <div className="emp-card" style={{ margin: 0 }}>
                  <div className="emp-card-header" style={{ marginBottom: "12px", paddingBottom: "8px" }}>
                    <h2 style={{ fontSize: "16px" }}>Salary Breakdown Details</h2>
                  </div>
                  <div className="emp-breakdown-table">
                    <div className="emp-breakdown-row">
                      <span>Basic Salary</span>
                      <strong>₹{salaryBase.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="emp-breakdown-row">
                      <span>House Rent Allowance (HRA)</span>
                      <strong>₹{hra.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="emp-breakdown-row">
                      <span>Special Allowances</span>
                      <strong>₹{specialAllowance.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="emp-breakdown-row">
                      <span>Provident Fund (PF) Deduction</span>
                      <strong style={{ color: "#ef4444" }}>-₹{pfDeduction.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="emp-breakdown-row">
                      <span>Income Tax (TDS)</span>
                      <strong style={{ color: "#ef4444" }}>-₹{taxDeduction.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="emp-breakdown-row total">
                      <span>Net Salary (Take Home)</span>
                      <span style={{ color: "#059669" }}>₹{netSalary.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Payslips Table */}
              <div className="emp-card">
                <div className="emp-card-header">
                  <div>
                    <h2><span>💳</span> Payslip History</h2>
                    <p>Review and download verified monthly compensation statements</p>
                  </div>
                </div>

                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Pay Period</th>
                      <th>Gross Pay</th>
                      <th>Deductions</th>
                      <th>Net Take-Home</th>
                      <th>Pay Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastPayslips.map((ps, idx) => (
                      <tr key={idx}>
                        <td><strong>{ps.month}</strong></td>
                        <td>₹{ps.gross.toLocaleString("en-IN")}</td>
                        <td style={{ color: "#ef4444" }}>-₹{ps.deductions.toLocaleString("en-IN")}</td>
                        <td><strong style={{ color: "#059669" }}>₹{ps.net.toLocaleString("en-IN")}</strong></td>
                        <td>{ps.payDate}</td>
                        <td><span className="emp-badge paid">{ps.status}</span></td>
                        <td>
                          <button
                            type="button"
                            className="emp-primary-btn"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => setSelectedPayslip(ps)}
                          >
                            👁 View Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= TAB 5: LEAVE REQUESTS ================= */}
          {activeTab === "leaves" && (
            <>
              {/* Leave Balance Cards */}
              <div className="emp-stats-grid">
                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap blue">🏖</div>
                  <div className="emp-stat-content">
                    <span>Casual Leave</span>
                    <h3>8 / 12</h3>
                    <small>Days remaining</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap amber">🏥</div>
                  <div className="emp-stat-content">
                    <span>Sick Leave</span>
                    <h3>5 / 7</h3>
                    <small>Days remaining</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap green">✈</div>
                  <div className="emp-stat-content">
                    <span>Annual Leave</span>
                    <h3>12 / 15</h3>
                    <small>Days remaining</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap purple">📌</div>
                  <div className="emp-stat-content">
                    <span>Total Available</span>
                    <h3>25 Days</h3>
                    <small>Annual entitlement</small>
                  </div>
                </div>
              </div>

              {/* Leave Requests Table */}
              <div className="emp-card">
                <div className="emp-card-header">
                  <div>
                    <h2><span>📝</span> Leave Request History</h2>
                    <p>Track approval status from Admin for all your applied leaves</p>
                  </div>
                  <button
                    type="button"
                    className="emp-primary-btn"
                    onClick={() => setIsApplyLeaveOpen(true)}
                  >
                    + Apply for Leave
                  </button>
                </div>

                {leaves.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
                    No leave requests found. Click "+ Apply for Leave" to submit your application.
                  </p>
                ) : (
                  <table className="emp-table">
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Applied On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((l) => (
                        <tr key={l._id}>
                          <td><strong>{l.leaveType}</strong></td>
                          <td>{l.fromDate}</td>
                          <td>{l.toDate}</td>
                          <td>{l.days} day(s)</td>
                          <td>{l.reason}</td>
                          <td>{l.appliedAt || "2026-10-09"}</td>
                          <td>
                            <span className={`emp-badge ${l.status?.toLowerCase()}`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ================= APPLY FOR LEAVE MODAL ================= */}
      {isApplyLeaveOpen && (
        <div className="emp-modal-overlay" onClick={() => setIsApplyLeaveOpen(false)}>
          <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <h2>Apply for Leave</h2>
              <button
                type="button"
                className="emp-modal-close"
                onClick={() => setIsApplyLeaveOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div className="emp-modal-body">
                <div className="emp-dash-form-group">
                  <label>Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                    }
                  >
                    <option value="Casual Leave">Casual Leave (CL)</option>
                    <option value="Sick Leave">Sick Leave (SL)</option>
                    <option value="Annual Leave">Annual / Vacation Leave (AL)</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>

                <div className="emp-dash-form-row">
                  <div className="emp-dash-form-group">
                    <label>From Date</label>
                    <input
                      type="date"
                      value={leaveForm.fromDate}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, fromDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="emp-dash-form-group">
                    <label>To Date</label>
                    <input
                      type="date"
                      value={leaveForm.toDate}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, toDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="emp-dash-form-group">
                  <label>Reason for Leave</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a brief explanation for your leave application..."
                    value={leaveForm.reason}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, reason: e.target.value })
                    }
                    required
                  ></textarea>
                </div>
              </div>

              <div className="emp-modal-footer">
                <button
                  type="button"
                  className="emp-cancel-btn"
                  onClick={() => setIsApplyLeaveOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-primary-btn">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PAYSLIP VIEW MODAL ================= */}
      {selectedPayslip && (
        <div className="emp-modal-overlay" onClick={() => setSelectedPayslip(null)}>
          <div
            className="emp-modal payslip-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="emp-modal-header">
              <h2>Official Salary Statement</h2>
              <button
                type="button"
                className="emp-modal-close"
                onClick={() => setSelectedPayslip(null)}
              >
                ×
              </button>
            </div>

            <div className="emp-modal-body">
              <div className="payslip-sheet">
                {/* Header */}
                <div className="payslip-company-header">
                  <div>
                    <h1>EMPLOYEE MANAGEMENT SYSTEM</h1>
                    <p>Corporate Headquarters • Tech City, Bangalore, India</p>
                  </div>
                  <div className="payslip-tag">PAYSLIP</div>
                </div>

                {/* Employee Meta */}
                <div className="payslip-emp-meta">
                  <div className="payslip-meta-col">
                    <p>Employee Name: <strong>{user?.name}</strong></p>
                    <p>Employee ID: <strong>EMP-00{user?.id || user?._id || "2"}</strong></p>
                    <p>Department: <strong>{user?.department || "Engineering"}</strong></p>
                  </div>
                  <div className="payslip-meta-col">
                    <p>Designation: <strong>{user?.designation || "Staff Member"}</strong></p>
                    <p>Pay Period: <strong>{selectedPayslip.month}</strong></p>
                    <p>Payment Mode: <strong>Bank Direct Deposit</strong></p>
                  </div>
                </div>

                {/* Split Earnings and Deductions */}
                <div className="payslip-tables-split">
                  <div className="payslip-col-box">
                    <h4>EARNINGS (₹)</h4>
                    <div className="payslip-row-item">
                      <span>Basic Salary</span>
                      <strong>₹{salaryBase.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item">
                      <span>House Rent Allowance (HRA)</span>
                      <strong>₹{hra.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item">
                      <span>Special Allowance</span>
                      <strong>₹{specialAllowance.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item" style={{ background: "#f8fafc", fontWeight: "700" }}>
                      <span>Gross Earnings</span>
                      <strong>₹{grossSalary.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  <div className="payslip-col-box">
                    <h4>DEDUCTIONS (₹)</h4>
                    <div className="payslip-row-item">
                      <span>Provident Fund (PF)</span>
                      <strong>₹{pfDeduction.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item">
                      <span>Income Tax (TDS)</span>
                      <strong>₹{taxDeduction.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item">
                      <span>Professional Tax (PT)</span>
                      <strong>₹200</strong>
                    </div>
                    <div className="payslip-row-item" style={{ background: "#f8fafc", fontWeight: "700" }}>
                      <span>Total Deductions</span>
                      <strong style={{ color: "#ef4444" }}>₹{totalDeductions.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>

                {/* Net Pay Box */}
                <div className="payslip-total-box">
                  <h3>Net Take-Home Salary:</h3>
                  <div className="net-value">₹{netSalary.toLocaleString("en-IN")}</div>
                </div>

                <div className="payslip-in-words">
                  Amount in words: Indian Rupees {netSalary.toLocaleString("en-IN")} Only
                </div>

                {/* Signatures */}
                <div className="payslip-signatures">
                  <div className="payslip-sign-line">Employee Signature</div>
                  <div className="payslip-sign-line">Authorized Signatory (HR)</div>
                </div>
              </div>
            </div>

            <div className="emp-modal-footer">
              <button
                type="button"
                className="emp-cancel-btn"
                onClick={() => setSelectedPayslip(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="emp-primary-btn"
                onClick={() => window.print()}
              >
                🖨 Print / Download Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
