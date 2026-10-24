import React, { useState, useEffect, useCallback } from "react";
import Footer from "../components/Footer";
import SupportModal from "../components/SupportModal";
import SmartClock from "../components/SmartClock";
import ShareModal from "../components/ShareModal";
import NotificationCenter from "../components/NotificationCenter";
import PerformanceSection from "../components/PerformanceSection";
import ThemeModal, { ThemePickerCards } from "../components/ThemeModal";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { THEMES, getUserTheme, saveUserTheme, applyThemeToDOM } from "../themeConfig";
import {
  DashboardIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  FileTextIcon,
  AwardIcon,
  SettingsIcon,
  HelpCircleIcon,
  ShieldIcon,
  BuildingIcon,
  BriefcaseIcon,
  LockIcon,
  LogoutIcon,
  InfoIcon,
} from "../components/Icons";
import "./EmployeeDashboard.css";

const API_BASE = "http://localhost:5000/api";

export default function EmployeeDashboard({
  user,
  onLogout,
  onSwitchToAdmin,
  currentTheme: propTheme,
  onSelectTheme: propOnSelectTheme,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [empAttendanceMode, setEmpAttendanceMode] = useState("calendar");
  const [empTheme, setEmpTheme] = useState(() => propTheme || getUserTheme(user));
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    if (propTheme) setEmpTheme(propTheme);
  }, [propTheme]);

  useEffect(() => {
    const saved = propTheme || getUserTheme(user);
    setEmpTheme(saved);
    applyThemeToDOM(saved);
  }, [user]);

  const handleThemeChange = (themeId) => {
    saveUserTheme(user, themeId);
    setEmpTheme(themeId);
    if (propOnSelectTheme) {
      propOnSelectTheme(themeId);
    }
    const themeObj = THEMES.find((t) => t.id === themeId);
    showSettingsToast(`Theme switched to ${themeObj?.name || themeId}!`, "success");
  };

  const handleToggleFooter = () => {
    setShowFooter((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 80);
      }
      return next;
    });
  };

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

  // Settings & Preferences State
  const SETTINGS_STORAGE_KEY = `ems_emp_settings_${user?.email || "default"}`;
  const defaultSettings = {
    // Notification Channels
    notifyLeaveStatus: true,
    notifyPayslipIssued: true,
    notifyCheckInReminder: true,
    notifyCheckOutReminder: false,
    notifyAnnouncements: true,
    soundAlerts: true,
    // Display & Regional
    timeFormat: "12h",
    dateFormat: "DD/MM/YYYY",
    defaultTab: "overview",
    tableDensity: "comfortable",
    highContrast: false,
    // Security
    twoFactorAuth: true,
    // Privacy
    directoryPhoneVisible: false,
    onlineStatusVisible: true,
  };

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return defaultSettings;
  });

  const [settingsCategory, setSettingsCategory] = useState("all");
  const [settingsToast, setSettingsToast] = useState(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch preferences from backend on mount
  useEffect(() => {
    if (user?.email) {
      fetch(`${API_BASE}/preferences?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.preferences) {
            setSettings((prev) => ({ ...prev, ...data.preferences }));
          }
        })
        .catch(() => {});
    }
  }, [user?.email]);

  // Audio cue feedback when soundAlerts enabled
  const playSoundChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }, []);

  // Password Update Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Active Sessions State
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: "Windows 11 • Google Chrome 129",
      location: "Bangalore, India",
      ip: "192.168.1.45",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: 2,
      device: "Samsung Galaxy S24 • EMS Mobile App",
      location: "Bangalore, India",
      ip: "103.21.244.12",
      lastActive: "Today at 09:12 AM",
      isCurrent: false,
    },
    {
      id: 3,
      device: "Apple MacBook Pro • Safari 18",
      location: "Bangalore, India",
      ip: "192.168.1.88",
      lastActive: "3 days ago",
      isCurrent: false,
    },
  ]);

  // Bank Detail Update Request Modal State
  const [isBankRequestOpen, setIsBankRequestOpen] = useState(false);
  const [bankRequestForm, setBankRequestForm] = useState({
    bankName: "HDFC Bank",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    branch: "",
    reason: "",
  });

  const showSettingsToast = (message, type = "success") => {
    setSettingsToast({ message, type });
    setTimeout(() => {
      setSettingsToast(null);
    }, 3800);
  };

  const handleToggleSetting = (key) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
      return updated;
    });
    if (settings.soundAlerts) {
      playSoundChime();
    }
    showSettingsToast("Preference updated!");
  };

  const handleChangeSetting = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
      return updated;
    });
    if (settings.soundAlerts) {
      playSoundChime();
    }
    showSettingsToast("Setting updated!");
  };

  const handleSaveAllSettings = async () => {
    setIsSavingAll(true);

    // 1. Save to local storage
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Local storage save error:", e);
    }

    // 2. Play sound chime if soundAlerts is enabled
    if (settings.soundAlerts) {
      playSoundChime();
    }

    // 3. Persist to backend API
    try {
      await fetch(`${API_BASE}/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          preferences: settings,
        }),
      });
    } catch (apiErr) {
      console.warn("Backend preferences save warning:", apiErr);
    }

    setIsSavingAll(false);
    setSavedSuccess(true);
    showSettingsToast("All preferences saved successfully to your profile!");

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2800);
  };

  const handleResetSettings = () => {
    if (window.confirm("Reset all settings to corporate default values?")) {
      setSettings(defaultSettings);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
      } catch (e) {
        console.error(e);
      }
      showSettingsToast("Settings restored to company defaults.");
    }
  };

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "Enter password", color: "#94a3b8", width: "0%" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "#ef4444", width: "25%" };
      case 2:
        return { score: 2, label: "Fair", color: "#f59e0b", width: "50%" };
      case 3:
        return { score: 3, label: "Good", color: "#3b82f6", width: "75%" };
      case 4:
        return { score: 4, label: "Strong & Secure", color: "#10b981", width: "100%" };
      default:
        return { score: 1, label: "Weak", color: "#ef4444", width: "25%" };
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      setPasswordStatus({
        type: "error",
        message: "Please enter your current password (default is 'employee123' or your registered phone number).",
      });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({
        type: "error",
        message: "New password must be at least 6 characters long.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "New password and confirmation do not match. Please verify and retry.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // 1. Call Backend API
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Save to localStorage for instant client fallback and login
        try {
          const customPasswords = JSON.parse(
            localStorage.getItem("ems_custom_passwords") || "{}"
          );
          customPasswords[(user?.email || "").toLowerCase()] = newPassword;
          localStorage.setItem(
            "ems_custom_passwords",
            JSON.stringify(customPasswords)
          );

          const savedUser = JSON.parse(localStorage.getItem("ems_user") || "{}");
          savedUser.password = newPassword;
          localStorage.setItem("ems_user", JSON.stringify(savedUser));
        } catch (storageErr) {
          console.warn("Storage update error:", storageErr);
        }

        setPasswordStatus({
          type: "success",
          message:
            "Password changed successfully! You can now log in using this new password.",
        });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showSettingsToast("Password updated successfully!");
        setIsUpdatingPassword(false);
        return;
      } else {
        setPasswordStatus({
          type: "error",
          message:
            data.message ||
            "Incorrect current password. (Default is 'employee123' or your mobile number)",
        });
        setIsUpdatingPassword(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Backend API error, updating local credential store:", apiErr);
      // Fallback local save if server request fails
      try {
        const customPasswords = JSON.parse(
          localStorage.getItem("ems_custom_passwords") || "{}"
        );
        customPasswords[(user?.email || "").toLowerCase()] = newPassword;
        localStorage.setItem(
          "ems_custom_passwords",
          JSON.stringify(customPasswords)
        );

        const savedUser = JSON.parse(localStorage.getItem("ems_user") || "{}");
        savedUser.password = newPassword;
        localStorage.setItem("ems_user", JSON.stringify(savedUser));

        setPasswordStatus({
          type: "success",
          message:
            "Password updated successfully! Your new credentials are ready for login.",
        });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showSettingsToast("Password updated!");
      } catch (err) {
        setPasswordStatus({
          type: "error",
          message: "Failed to update password. Please retry.",
        });
      }
      setIsUpdatingPassword(false);
    }
  };

  const handleTerminateOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    showSettingsToast("All other remote sessions have been revoked!");
  };

  const handleExportProfileData = () => {
    const dataObj = {
      exportTimestamp: new Date().toISOString(),
      system: "Employee Management System (EMS v2.4)",
      employee: {
        id: `EMP-00${user?.id || user?._id || "2"}`,
        name: user?.name,
        email: user?.email,
        department: user?.department,
        designation: user?.designation,
        joiningDate: user?.joinDate || "2023-03-20",
        phone: profileData.phone,
        address: profileData.address,
        emergencyContact: profileData.emergencyContact,
      },
      compensationOverview: {
        baseSalary: salaryBase,
        hra,
        specialAllowance,
        grossSalary,
        pfDeduction,
        taxDeduction,
        netSalary,
      },
      currentAttendanceStatus: todayAttendance,
      preferences: settings,
    };

    const dataBlob = new Blob([JSON.stringify(dataObj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `EMS_Employee_Data_${user?.name?.replace(/\s+/g, "_") || "User"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSettingsToast("Profile data exported successfully as JSON!");
  };

  const handleBankRequestSubmit = (e) => {
    e.preventDefault();
    if (bankRequestForm.accountNumber !== bankRequestForm.confirmAccountNumber) {
      alert("Account numbers do not match! Please check.");
      return;
    }
    setIsBankRequestOpen(false);
    setBankRequestForm({
      bankName: "HDFC Bank",
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
      branch: "",
      reason: "",
    });
    showSettingsToast("Bank details change request submitted to Finance & HR Desk!");
  };

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
      <div className="emp-app-layout">
        {/* ENTERPRISE WORKSPACE SIDEBAR */}
        <EmployeeSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={onLogout}
          onOpenSupport={() => setShowSupportModal(true)}
          showFooter={showFooter}
          onToggleFooter={handleToggleFooter}
          pendingLeavesCount={leaves.filter((l) => l.status === "Pending").length}
          user={user}
        />

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
            <SmartClock theme={empTheme === "dark" ? "dark" : "employee"} format={settings.timeFormat} />

            <button
              type="button"
              className="topbar-share-btn emp-topbar-share-btn"
              onClick={() => setShowShareModal(true)}
              title="Share Workplace Portal Link or QR Code"
            >
              <span>📤</span>
              <span className="topbar-btn-text">Share</span>
            </button>

            <button
              type="button"
              className="notification"
              onClick={() => setShowNotifCenter(true)}
              title="Open Notifications & Alerts"
              aria-label="Open Notifications & Alerts"
            >
              <svg
                className="notif-bell-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notification-dot" />
            </button>

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
                  <UserIcon width={15} height={15} style={{ marginRight: 8 }} /> My Profile
                </button>
                <button
                  type="button"
                  className="emp-dropdown-item"
                  onClick={() => {
                    setActiveTab("salary");
                    setShowUserMenu(false);
                  }}
                >
                  <CreditCardIcon width={15} height={15} style={{ marginRight: 8 }} /> View Payslips
                </button>
                <button
                  type="button"
                  className="emp-dropdown-item"
                  onClick={() => {
                    setActiveTab("settings");
                    setShowUserMenu(false);
                  }}
                >
                  <SettingsIcon width={15} height={15} style={{ marginRight: 8 }} /> Settings & Preferences
                </button>
                <button
                  type="button"
                  className="emp-dropdown-item logout"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                >
                  <LogoutIcon width={15} height={15} style={{ marginRight: 8 }} /> Secure Logout
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
                      <BuildingIcon width={14} height={14} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                      Department: {user?.department || "General"}
                    </div>
                    <div className="emp-hero-meta-item">
                      <BriefcaseIcon width={14} height={14} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                      Designation: {user?.designation || "Staff Member"}
                    </div>
                    <div className="emp-hero-meta-item">
                      <UserIcon width={14} height={14} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                      ID: EMP-00{user?.id || user?._id || "2"}
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
                  <div className="emp-clock-icon">
                    <CalendarIcon width={20} height={20} />
                  </div>
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
                  <div className="emp-stat-icon-wrap blue">
                    <CalendarIcon width={18} height={18} />
                  </div>
                  <div className="emp-stat-content">
                    <span>Attendance Rate</span>
                    <h3>96.4%</h3>
                    <small>↑ Excellent this month</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap green">
                    <CreditCardIcon width={18} height={18} />
                  </div>
                  <div className="emp-stat-content">
                    <span>Net Take-Home Pay</span>
                    <h3>₹{netSalary.toLocaleString("en-IN")}</h3>
                    <small>Monthly payroll</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap amber">
                    <FileTextIcon width={18} height={18} />
                  </div>
                  <div className="emp-stat-content">
                    <span>Leave Balance</span>
                    <h3>12 Days</h3>
                    <small>Casual & Sick remaining</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap purple">
                    <CalendarIcon width={18} height={18} />
                  </div>
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
                    <h2>Recent Leave Applications</h2>
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
                  <h3>Employment Details</h3>
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
                    <h3 style={{ margin: 0 }}>Contact & Personal Information</h3>
                    <button
                      type="button"
                      className="emp-primary-btn"
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                      onClick={() => setIsEditingContact(!isEditingContact)}
                    >
                      {isEditingContact ? "Cancel Edit" : "Edit Contact"}
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
              {/* Top View Selector Strip */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>My Attendance & Time Logs</h2>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>Inspect punch timestamps, work hours, and calendar compliance</p>
                </div>
                <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setEmpAttendanceMode("calendar")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: empAttendanceMode === "calendar" ? "#0f172a" : "transparent",
                      color: empAttendanceMode === "calendar" ? "#ffffff" : "#64748b",
                      fontWeight: "600",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Monthly Calendar View
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmpAttendanceMode("punch")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: empAttendanceMode === "punch" ? "#0f172a" : "transparent",
                      color: empAttendanceMode === "punch" ? "#ffffff" : "#64748b",
                      fontWeight: "600",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Punch In/Out & Daily Log
                  </button>
                </div>
              </div>

              {empAttendanceMode === "calendar" ? (
                <AttendanceCalendar
                  attendanceRecords={attendanceHistory}
                  leaves={leaves}
                  currentUser={user}
                  isAdmin={false}
                />
              ) : (
                <>
                  {/* Check-In Card */}
                  <div className="emp-checkin-card">
                <div className="emp-checkin-left">
                  <div className="emp-clock-icon">
                    <CalendarIcon width={20} height={20} />
                  </div>
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
                  <div className="emp-stat-icon-wrap green">
                    <CalendarIcon width={18} height={18} />
                  </div>
                  <div className="emp-stat-content">
                    <span>Days Present</span>
                    <h3>20 Days</h3>
                    <small>Out of 22 working days</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap amber">
                    <CalendarIcon width={18} height={18} />
                  </div>
                  <div className="emp-stat-content">
                    <span>Late Arrivals</span>
                    <h3>1 Day</h3>
                    <small>Within grace period</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap purple">
                    <FileTextIcon width={18} height={18} />
                  </div>
                  <div className="emp-stat-content">
                    <span>Approved Leaves</span>
                    <h3>1 Day</h3>
                    <small>Casual Leave</small>
                  </div>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-icon-wrap blue">
                    <CalendarIcon width={18} height={18} />
                  </div>
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
                        <h2>October 2026 Attendance Log</h2>
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
                    <h2>Payslip History</h2>
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
                    <h2>Leave Request History</h2>
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

          {/* ================= TAB: PERFORMANCE & OKRS ================= */}
          {activeTab === "performance" && (
            <PerformanceSection
              user={user}
              role="employee"
              onTriggerToast={(msg, type) => showSettingsToast(msg, type)}
            />
          )}

          {/* ================= TAB 6: SETTINGS & PREFERENCES ================= */}
          {activeTab === "settings" && (
            <div className="emp-settings-section">
              {/* TOP HERO BANNER */}
              <div className="emp-settings-header-banner">
                <div className="emp-settings-header-info">
                  <div className="emp-settings-badge">
                    System & Security Preferences
                  </div>
                  <h1>Settings & Account Control</h1>
                  <p>
                    Manage authentication credentials, notification alerts, regional display formats, and direct deposit payroll details.
                  </p>
                </div>

                <div className="emp-settings-header-actions">
                  <button
                    type="button"
                    className="emp-settings-btn-secondary"
                    onClick={handleExportProfileData}
                    title="Export all your personal profile, attendance & settings records as JSON"
                  >
                    Export My Data
                  </button>
                  <button
                    type="button"
                    className={`emp-settings-btn-primary ${savedSuccess ? "saved" : ""}`}
                    onClick={handleSaveAllSettings}
                    disabled={isSavingAll}
                  >
                    {savedSuccess ? (
                      <>
                        <span>✓</span> Saved!
                      </>
                    ) : isSavingAll ? (
                      <>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save All Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* FLOATING TOAST NOTIFICATION */}
              {settingsToast && (
                <div className={`emp-settings-toast ${settingsToast.type}`}>
                  <span className="toast-icon">
                    {settingsToast.type === "success" ? "✓" : "!"}
                  </span>
                  <span className="toast-text">{settingsToast.message}</span>
                </div>
              )}

              {/* CATEGORY NAV PILLS */}
              <div className="emp-settings-category-bar">
                <button
                  type="button"
                  className={`emp-category-pill ${settingsCategory === "all" ? "active" : ""}`}
                  onClick={() => setSettingsCategory("all")}
                >
                  All Settings
                </button>
                <button
                  type="button"
                  className={`emp-category-pill ${settingsCategory === "security" ? "active" : ""}`}
                  onClick={() => setSettingsCategory("security")}
                >
                  Security & Login
                </button>
                <button
                  type="button"
                  className={`emp-category-pill ${settingsCategory === "notifications" ? "active" : ""}`}
                  onClick={() => setSettingsCategory("notifications")}
                >
                  Notifications
                </button>
                <button
                  type="button"
                  className={`emp-category-pill ${settingsCategory === "display" ? "active" : ""}`}
                  onClick={() => setSettingsCategory("display")}
                >
                  Display & Formats
                </button>
                <button
                  type="button"
                  className={`emp-category-pill ${settingsCategory === "payroll" ? "active" : ""}`}
                  onClick={() => setSettingsCategory("payroll")}
                >
                  Direct Deposit & Bank
                </button>
                <button
                  type="button"
                  className={`emp-category-pill ${settingsCategory === "privacy" ? "active" : ""}`}
                  onClick={() => setSettingsCategory("privacy")}
                >
                  Privacy & Compliance
                </button>
              </div>

              {/* SETTINGS CONTENT GRID */}
              <div className="emp-settings-grid">
                {/* 1. SECURITY & PASSWORD */}
                {(settingsCategory === "all" || settingsCategory === "security") && (
                  <div className="emp-settings-card">
                    <div className="emp-settings-card-head">
                      <div className="emp-settings-icon-wrap lock">
                        <LockIcon width={18} height={18} />
                      </div>
                      <div>
                        <h3>Account Security & Password</h3>
                        <p>Update your authentication password and monitor active device logins</p>
                      </div>
                    </div>

                    <div className="emp-settings-card-body">
                      {/* Password status alert */}
                      {passwordStatus && (
                        <div className={`emp-password-alert ${passwordStatus.type}`}>
                          <span>{passwordStatus.type === "success" ? "✓" : "!"}</span>
                          <span>{passwordStatus.message}</span>
                        </div>
                      )}

                      <form onSubmit={handlePasswordSubmit} className="emp-password-form">
                        <div className="emp-dash-form-group">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <label style={{ margin: 0, fontWeight: "600" }}>Current Password</label>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                              Default: <strong style={{ color: "#2563eb", background: "#eff6ff", padding: "1px 6px", borderRadius: "4px" }}>employee123</strong>
                            </span>
                          </div>
                          <div className="emp-password-input-wrap">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              placeholder="Enter current password (default: employee123)"
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                              }
                              autoComplete="current-password"
                              required
                            />
                            <button
                              type="button"
                              className="emp-pwd-toggle-btn"
                              style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}
                              onClick={() =>
                                setShowPasswords((p) => ({ ...p, current: !p.current }))
                              }
                            >
                              {showPasswords.current ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>

                        <div className="emp-dash-form-row">
                          <div className="emp-dash-form-group">
                            <label>New Password</label>
                            <div className="emp-password-input-wrap">
                              <input
                                type={showPasswords.new ? "text" : "password"}
                                placeholder="Min. 6 characters"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                }
                                autoComplete="new-password"
                                required
                              />
                              <button
                                type="button"
                                className="emp-pwd-toggle-btn"
                                style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}
                                onClick={() =>
                                  setShowPasswords((p) => ({ ...p, new: !p.new }))
                                }
                              >
                                {showPasswords.new ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>

                          <div className="emp-dash-form-group">
                            <label>Confirm New Password</label>
                            <div className="emp-password-input-wrap">
                              <input
                                type={showPasswords.confirm ? "text" : "password"}
                                placeholder="Re-type new password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                }
                                autoComplete="new-password"
                                required
                              />
                              <button
                                type="button"
                                className="emp-pwd-toggle-btn"
                                style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}
                                onClick={() =>
                                  setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                                }
                              >
                                {showPasswords.confirm ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Password strength meter */}
                        {passwordForm.newPassword && (
                          <div className="emp-password-meter">
                            <div className="emp-meter-label">
                              <span>Password Strength:</span>
                              <strong style={{ color: calculatePasswordStrength(passwordForm.newPassword).color }}>
                                {calculatePasswordStrength(passwordForm.newPassword).label}
                              </strong>
                            </div>
                            <div className="emp-meter-track">
                              <div
                                className="emp-meter-bar"
                                style={{
                                  width: calculatePasswordStrength(passwordForm.newPassword).width,
                                  backgroundColor: calculatePasswordStrength(passwordForm.newPassword).color,
                                }}
                              ></div>
                            </div>
                            <div className="emp-pwd-req-list">
                              <span className={passwordForm.newPassword.length >= 6 ? "met" : ""}>
                                {passwordForm.newPassword.length >= 6 ? "✓" : "○"} 6+ chars
                              </span>
                              <span className={/[A-Z]/.test(passwordForm.newPassword) ? "met" : ""}>
                                {/[A-Z]/.test(passwordForm.newPassword) ? "✓" : "○"} Uppercase
                              </span>
                              <span className={/[0-9]/.test(passwordForm.newPassword) ? "met" : ""}>
                                {/[0-9]/.test(passwordForm.newPassword) ? "✓" : "○"} Number
                              </span>
                              <span className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "met" : ""}>
                                {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "✓" : "○"} Symbol
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="emp-password-actions">
                          <button
                            type="submit"
                            className="emp-save-btn"
                            disabled={isUpdatingPassword}
                            style={{
                              opacity: isUpdatingPassword ? 0.75 : 1,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              cursor: isUpdatingPassword ? "not-allowed" : "pointer",
                            }}
                          >
                            {isUpdatingPassword ? (
                              <>
                                <span>⏳</span>
                                <span>Updating Credentials...</span>
                              </>
                            ) : (
                              <>
                                <span>🔒</span>
                                <span>Update Credentials</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      {/* 2FA Section */}
                      <div className="emp-settings-divider"></div>
                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <div className="emp-toggle-title">
                            <h4>Two-Factor Authentication (2FA)</h4>
                            <span className="emp-status-chip verified">
                              {settings.twoFactorAuth ? "Shielded" : "Optional"}
                            </span>
                          </div>
                          <p>
                            Protect your employee portal by requiring OTP code verification when signing in on a new browser or IP address.
                          </p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.twoFactorAuth}
                            onChange={() => handleToggleSetting("twoFactorAuth")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      {/* Active Sessions List */}
                      <div className="emp-settings-divider"></div>
                      <div className="emp-sessions-header">
                        <div>
                          <h4>Active Connected Sessions</h4>
                          <p>Devices currently authenticated to your employee profile</p>
                        </div>
                        {activeSessions.length > 1 && (
                          <button
                            type="button"
                            className="emp-terminate-btn"
                            onClick={handleTerminateOtherSessions}
                          >
                            Terminate Other Sessions
                          </button>
                        )}
                      </div>

                      <div className="emp-sessions-list">
                        {activeSessions.map((session) => (
                          <div key={session.id} className="emp-session-item">
                            <div className="session-icon">
                              {session.device.includes("Phone") ? "📱" : "💻"}
                            </div>
                            <div className="session-info">
                              <strong>
                                {session.device}{" "}
                                {session.isCurrent && (
                                  <span className="current-badge">Current Device</span>
                                )}
                              </strong>
                              <small>
                                {session.location} • IP: {session.ip} •{" "}
                                <span className={session.isCurrent ? "text-success" : ""}>
                                  {session.lastActive}
                                </span>
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. NOTIFICATIONS & ALERTS */}
                {(settingsCategory === "all" || settingsCategory === "notifications") && (
                  <div className="emp-settings-card">
                    <div className="emp-settings-card-head">
                      <div className="emp-settings-icon-wrap bell">🔔</div>
                      <div>
                        <h3>Notifications & Communication</h3>
                        <p>Configure automated reminders and email notifications</p>
                      </div>
                    </div>

                    <div className="emp-settings-card-body">
                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <div className="emp-toggle-title">
                            <h4>Leave Request Status Alerts</h4>
                            <span className="emp-tag-rec">Recommended</span>
                          </div>
                          <p>Instant notification via email when HR or Manager approves or denies your leave</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.notifyLeaveStatus}
                            onChange={() => handleToggleSetting("notifyLeaveStatus")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <div className="emp-toggle-title">
                            <h4>Monthly Payslip Generation</h4>
                            <span className="emp-tag-rec">Recommended</span>
                          </div>
                          <p>Receive an alert the moment your verified monthly salary statement is generated</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.notifyPayslipIssued}
                            onChange={() => handleToggleSetting("notifyPayslipIssued")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <h4>Morning Check-In Reminder (08:45 AM)</h4>
                          <p>Daily notification to punch in if you have not registered attendance by 08:45 AM</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.notifyCheckInReminder}
                            onChange={() => handleToggleSetting("notifyCheckInReminder")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <h4>Evening Check-Out Reminder (06:00 PM)</h4>
                          <p>Reminder to punch out at the end of the scheduled workday</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.notifyCheckOutReminder}
                            onChange={() => handleToggleSetting("notifyCheckOutReminder")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <h4>Company Broadcasts & Announcements</h4>
                          <p>Official corporate notices, town-hall invites, and holiday calendars</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.notifyAnnouncements}
                            onChange={() => handleToggleSetting("notifyAnnouncements")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <h4>Dashboard Audio Cues</h4>
                          <p>Subtle chime sounds when attendance punches and leave actions complete</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.soundAlerts}
                            onChange={() => handleToggleSetting("soundAlerts")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DISPLAY & LOCALIZATION */}
                {(settingsCategory === "all" || settingsCategory === "display") && (
                  <div className="emp-settings-card">
                    <div className="emp-settings-card-head">
                      <div className="emp-settings-icon-wrap palette">🎨</div>
                      <div>
                        <h3>Display & Regional Preferences</h3>
                        <p>Format clock display, dates, tables, and default starting views</p>
                      </div>
                    </div>

                    <div className="emp-settings-card-body">
                      {/* Personal Workspace Theme Selector */}
                      <div
                        className="emp-setting-field-row"
                        style={{
                          flexDirection: "column",
                          alignItems: "stretch",
                          gap: "14px",
                          borderBottom: "1px solid var(--theme-card-border, #e2e8f0)",
                          paddingBottom: "22px",
                          marginBottom: "18px",
                        }}
                      >
                        <div className="field-desc">
                          <h4>Personal Workspace Theme</h4>
                          <p>Select your favorite corporate color palette. Your selection is automatically remembered every time you log in.</p>
                        </div>
                        <ThemePickerCards
                          currentTheme={empTheme}
                          onSelectTheme={handleThemeChange}
                          user={user}
                        />
                      </div>

                      {/* Time format */}
                      <div className="emp-setting-field-row">
                        <div className="field-desc">
                          <h4>Time Display Format</h4>
                          <p>Select your preferred clock representation across dashboard headers</p>
                        </div>
                        <div className="emp-radio-pills">
                          <button
                            type="button"
                            className={`emp-pill-btn ${settings.timeFormat === "12h" ? "active" : ""}`}
                            onClick={() => handleChangeSetting("timeFormat", "12h")}
                          >
                            12-Hour (09:45 AM)
                          </button>
                          <button
                            type="button"
                            className={`emp-pill-btn ${settings.timeFormat === "24h" ? "active" : ""}`}
                            onClick={() => handleChangeSetting("timeFormat", "24h")}
                          >
                            24-Hour (09:45)
                          </button>
                        </div>
                      </div>

                      {/* Date format */}
                      <div className="emp-setting-field-row">
                        <div className="field-desc">
                          <h4>Date Format</h4>
                          <p>Preferred calendar date formatting for attendance logs and payslips</p>
                        </div>
                        <select
                          className="emp-settings-select"
                          value={settings.dateFormat}
                          onChange={(e) => handleChangeSetting("dateFormat", e.target.value)}
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 12/10/2026)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/12/2026)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                        </select>
                      </div>

                      {/* Default Tab */}
                      <div className="emp-setting-field-row">
                        <div className="field-desc">
                          <h4>Default Starting Screen</h4>
                          <p>Which portal screen loads automatically upon signing in</p>
                        </div>
                        <select
                          className="emp-settings-select"
                          value={settings.defaultTab}
                          onChange={(e) => handleChangeSetting("defaultTab", e.target.value)}
                        >
                          <option value="overview">Dashboard Overview</option>
                          <option value="attendance">My Attendance Ledger</option>
                          <option value="salary">Salary & Payslips</option>
                          <option value="leaves">Leave Applications</option>
                          <option value="profile">My Profile</option>
                        </select>
                      </div>

                      {/* Table density */}
                      <div className="emp-setting-field-row">
                        <div className="field-desc">
                          <h4>Table Row Density</h4>
                          <p>Vertical spacing in attendance records and payslip tables</p>
                        </div>
                        <div className="emp-radio-pills">
                          <button
                            type="button"
                            className={`emp-pill-btn ${settings.tableDensity === "comfortable" ? "active" : ""}`}
                            onClick={() => handleChangeSetting("tableDensity", "comfortable")}
                          >
                            Comfortable
                          </button>
                          <button
                            type="button"
                            className={`emp-pill-btn ${settings.tableDensity === "compact" ? "active" : ""}`}
                            onClick={() => handleChangeSetting("tableDensity", "compact")}
                          >
                            Compact
                          </button>
                        </div>
                      </div>

                      {/* High Contrast Mode */}
                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <h4>High-Contrast Readability Mode</h4>
                          <p>Increases visual contrast for borders, typography, and status chips</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.highContrast}
                            onChange={() => handleToggleSetting("highContrast")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DIRECT DEPOSIT & PAYROLL */}
                {(settingsCategory === "all" || settingsCategory === "payroll") && (
                  <div className="emp-settings-card">
                    <div className="emp-settings-card-head">
                      <div className="emp-settings-icon-wrap bank">
                        <CreditCardIcon width={18} height={18} />
                      </div>
                      <div>
                        <h3>Direct Deposit & Bank Information</h3>
                        <p>Verified banking account on file with payroll finance</p>
                      </div>
                    </div>

                    <div className="emp-settings-card-body">
                      <div className="emp-bank-verified-box">
                        <div className="emp-bank-header">
                          <div className="bank-logo-badge">HDFC Bank</div>
                          <div className="bank-verified-pill">✓ Verified by Finance</div>
                        </div>

                        <div className="emp-bank-grid">
                          <div className="bank-item">
                            <span>Bank Name</span>
                            <strong>HDFC Bank Ltd.</strong>
                          </div>
                          <div className="bank-item">
                            <span>Account Number</span>
                            <strong>•••• •••• •••• 4892</strong>
                          </div>
                          <div className="bank-item">
                            <span>IFSC Code</span>
                            <strong>HDFC0001234</strong>
                          </div>
                          <div className="bank-item">
                            <span>Branch Location</span>
                            <strong>Tech City SEZ, Bangalore</strong>
                          </div>
                          <div className="bank-item">
                            <span>Account Category</span>
                            <strong>Corporate Salary Account</strong>
                          </div>
                          <div className="bank-item">
                            <span>Tax PAN ID</span>
                            <strong>ABCDE••••F (Linked)</strong>
                          </div>
                          <div className="bank-item">
                            <span>Provident Fund (UAN)</span>
                            <strong>1009 •••• 8221</strong>
                          </div>
                          <div className="bank-item">
                            <span>Disbursement Cycle</span>
                            <strong>Monthly (Last Working Day)</strong>
                          </div>
                        </div>
                      </div>

                      <div className="emp-bank-note">
                        <span className="note-icon">
                          <InfoIcon width={16} height={16} />
                        </span>
                        <span>
                          Direct deposit banking changes require verification by the Corporate Payroll & Accounts department. To update your salary disbursement account, submit a formal request below with a cancelled cheque copy.
                        </span>
                      </div>

                      <div className="emp-bank-actions">
                        <button
                          type="button"
                          className="emp-primary-btn"
                          onClick={() => setIsBankRequestOpen(true)}
                        >
                          Request Bank Details Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PRIVACY & COMPLIANCE */}
                {(settingsCategory === "all" || settingsCategory === "privacy") && (
                  <div className="emp-settings-card">
                    <div className="emp-settings-card-head">
                      <div className="emp-settings-icon-wrap shield">
                        <ShieldIcon width={18} height={18} />
                      </div>
                      <div>
                        <h3>Privacy, Data & Compliance</h3>
                        <p>Directory visibility controls and self-service data exports</p>
                      </div>
                    </div>

                    <div className="emp-settings-card-body">
                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <h4>Display Phone in Employee Directory</h4>
                          <p>Allow colleagues in your department to view your contact number in the organization roster</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.directoryPhoneVisible}
                            onChange={() => handleToggleSetting("directoryPhoneVisible")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      <div className="emp-setting-row-toggle">
                        <div className="emp-toggle-info">
                          <h4>Broadcast Live Punch Status</h4>
                          <p>Show a green dot indicator next to your name indicating you are currently checked-in</p>
                        </div>
                        <label className="emp-switch">
                          <input
                            type="checkbox"
                            checked={settings.onlineStatusVisible}
                            onChange={() => handleToggleSetting("onlineStatusVisible")}
                          />
                          <span className="emp-slider"></span>
                        </label>
                      </div>

                      <div className="emp-settings-divider"></div>

                      <div className="emp-data-export-box">
                        <div className="export-text">
                          <h4>Personal Record Portability (GDPR / ISO)</h4>
                          <p>
                            Download a copy of your personal employee records, compensation breakdown, attendance stamps, and system preferences in machine-readable JSON format.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="emp-download-btn"
                          onClick={handleExportProfileData}
                        >
                          Export Record (JSON)
                        </button>
                      </div>

                      <div className="emp-compliance-footer">
                        <div className="compliance-item">
                          <span>Encryption</span>
                          <strong>AES-256 GCM</strong>
                        </div>
                        <div className="compliance-item">
                          <span>Compliance</span>
                          <strong>ISO 27001 Certified</strong>
                        </div>
                        <div className="compliance-item">
                          <span>Access Level</span>
                          <strong>Employee Restricted</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM ACTIONS BAR */}
              <div className="emp-settings-bottom-bar">
                <button
                  type="button"
                  className="emp-reset-defaults-btn"
                  onClick={handleResetSettings}
                >
                  ↺ Restore Corporate Defaults
                </button>

                <div className="emp-bottom-right-btns">
                  <button
                    type="button"
                    className={`emp-primary-btn ${savedSuccess ? "saved-success-btn" : ""}`}
                    onClick={handleSaveAllSettings}
                    disabled={isSavingAll}
                    style={{
                      background: savedSuccess ? "linear-gradient(135deg, #10b981, #059669)" : undefined,
                      transition: "all 0.3s ease",
                      minWidth: "190px",
                    }}
                  >
                    {savedSuccess ? (
                      <>
                        <span>✓</span> Saved All Preferences!
                      </>
                    ) : isSavingAll ? (
                      <>
                        <span>⏳</span> Saving Preferences...
                      </>
                    ) : (
                      <>
                        <span>💾</span> Save All Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ENTERPRISE EMPLOYEE FOOTER - FULL WIDTH OF MAIN VIEWPORT, ZERO GAPS */}
        {showFooter && (
          <Footer
            role="employee"
            user={user}
            onNavigate={(tabId) => setActiveTab(tabId)}
            onOpenLeaveModal={() => setIsApplyLeaveOpen(true)}
            onOpenSupport={() => setShowSupportModal(true)}
            onClose={() => setShowFooter(false)}
          />
        )}
      </main>
    </div>

      {/* FLOATING FOOTER TOGGLE (Subtle, non-overlapping enterprise button) */}
      <button
        type="button"
        className={`floating-footer-toggle-btn ${showFooter ? "active" : ""}`}
        onClick={() => setShowFooter((prev) => !prev)}
        title={showFooter ? "Hide Corporate Footer" : "Show Corporate Footer"}
        aria-label="Toggle Footer"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 15h18" />
        </svg>
        <span>{showFooter ? "Hide Footer" : "Footer"}</span>
      </button>

    {/* NOTIFICATION CENTER DRAWER */}
    <NotificationCenter
      user={user}
      role="employee"
      isOpen={showNotifCenter}
      onClose={() => setShowNotifCenter(false)}
      onNavigate={(tab) => setActiveTab(tab)}
      onTriggerToast={(msg, type) => showSettingsToast(msg, type)}
    />

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
                Print / Download Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BANK ACCOUNT UPDATE MODAL ================= */}
      {isBankRequestOpen && (
        <div className="emp-modal-overlay" onClick={() => setIsBankRequestOpen(false)}>
          <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <h2>Request Direct Deposit Account Update</h2>
              <button
                type="button"
                className="emp-modal-close"
                onClick={() => setIsBankRequestOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBankRequestSubmit}>
              <div className="emp-modal-body">
                <div className="emp-modal-notice">
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    <InfoIcon width={16} height={16} />
                  </span>
                  <span>
                    Account change requests are reviewed by Finance within 24-48 business hours. Next salary disbursement will reflect changes once verified.
                  </span>
                </div>

                <div className="emp-dash-form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India, ICICI Bank, Axis Bank"
                    value={bankRequestForm.bankName}
                    onChange={(e) =>
                      setBankRequestForm({ ...bankRequestForm, bankName: e.target.value })
                    }
                  />
                </div>

                <div className="emp-dash-form-row">
                  <div className="emp-dash-form-group">
                    <label>New Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full bank account number"
                      value={bankRequestForm.accountNumber}
                      onChange={(e) =>
                        setBankRequestForm({
                          ...bankRequestForm,
                          accountNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="emp-dash-form-group">
                    <label>Confirm Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="Re-enter bank account number"
                      value={bankRequestForm.confirmAccountNumber}
                      onChange={(e) =>
                        setBankRequestForm({
                          ...bankRequestForm,
                          confirmAccountNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="emp-dash-form-row">
                  <div className="emp-dash-form-group">
                    <label>IFSC Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN0001234"
                      value={bankRequestForm.ifsc}
                      onChange={(e) =>
                        setBankRequestForm({
                          ...bankRequestForm,
                          ifsc: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>

                  <div className="emp-dash-form-group">
                    <label>Branch City / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Koramangala, Bangalore"
                      value={bankRequestForm.branch}
                      onChange={(e) =>
                        setBankRequestForm({
                          ...bankRequestForm,
                          branch: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="emp-dash-form-group">
                  <label>Reason for Updating Account *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Migrated salary account to new branch, opened fresh zero-balance account..."
                    value={bankRequestForm.reason}
                    onChange={(e) =>
                      setBankRequestForm({
                        ...bankRequestForm,
                        reason: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </div>

              <div className="emp-modal-footer">
                <button
                  type="button"
                  className="emp-cancel-btn"
                  onClick={() => setIsBankRequestOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-primary-btn">
                  Submit to HR & Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HR SUPPORT MODAL */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        user={user}
      />

      {/* SHARE WORKPLACE MODAL */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        portalType="employee"
        user={user}
        activeTab={activeTab}
      />

      {/* THEME CUSTOMIZATION MODAL */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={empTheme}
        onSelectTheme={handleThemeChange}
        user={user}
      />
    </div>
  );
}
