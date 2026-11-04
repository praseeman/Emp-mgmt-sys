import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import ReportExportMenu, { exportAllReportsToExcel, exportAllReportsToPdf } from "./components/ReportExportMenu";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import SupportModal from "./components/SupportModal";
import EmployeesPage from "./pages/EmployeesPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminLogin from "./pages/AdminLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import SmartClock from "./components/SmartClock";
import ShareModal from "./components/ShareModal";
import NotificationCenter from "./components/NotificationCenter";
import AttendanceCalendar from "./components/AttendanceCalendar";
import PerformanceSection from "./components/PerformanceSection";
import ThemeModal, { ThemePickerCards } from "./components/ThemeModal";
import { THEMES, getUserTheme, saveUserTheme, applyThemeToDOM } from "./themeConfig";
import {
  DashboardIcon,
  UsersIcon,
  UserPlusIcon,
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  AwardIcon,
  BuildingIcon,
  BarChartIcon,
  SettingsIcon,
  ShieldIcon,
  SearchIcon,
  ShareIcon,
  UserIcon,
  InfoIcon,
} from "./components/Icons";
import "./App.css";

const API_BASE = "http://localhost:5000/api";
const API_URL = `${API_BASE}/employees`;

const NAV_ITEMS = [
  { id: "Dashboard", label: "Dashboard", IconComponent: DashboardIcon },
  { id: "Employees", label: "Employees", IconComponent: UsersIcon },
  { id: "AddEmployee", label: "Add Employee", IconComponent: UserPlusIcon },
  { id: "Attendance", label: "Attendance", IconComponent: CalendarIcon },
  { id: "LeaveRequests", label: "Leave Requests", IconComponent: FileTextIcon },
  { id: "Payroll", label: "Payroll", IconComponent: CreditCardIcon },
  { id: "Performance", label: "Performance & OKRs", IconComponent: AwardIcon },
  { id: "Departments", label: "Departments", IconComponent: BuildingIcon },
  { id: "Reports", label: "Reports", IconComponent: BarChartIcon },
  { id: "Settings", label: "Settings", IconComponent: SettingsIcon },
];

const INITIAL_FALLBACK_EMPLOYEES = [
  {
    _id: "1",
    name: "Praseeman",
    email: "sppraseeman@gmail.com",
    phone: "8248070608",
    department: "HR",
    role: "admin",
    designation: "Administrator & HR Manager",
    salary: 65000,
    status: "Active",
    joinDate: "2023-01-15",
  },
  {
    _id: "2",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    department: "Engineering",
    role: "employee",
    designation: "Senior Software Engineer",
    salary: 85000,
    status: "Active",
    joinDate: "2023-03-20",
    address: "B-402, Cyber Heights, Bangalore",
    emergencyContact: "9876500000 (Father)",
  },
  {
    _id: "3",
    name: "Priya Patel",
    email: "priya@gmail.com",
    phone: "9123456780",
    department: "Design",
    role: "employee",
    designation: "Lead UI/UX Designer",
    salary: 62000,
    status: "Active",
    joinDate: "2023-06-10",
    address: "Flat 12, Green Glen Layout, Bangalore",
    emergencyContact: "9123400000 (Spouse)",
  },
  {
    _id: "4",
    name: "Amit Verma",
    email: "amit.verma@ems.com",
    phone: "9345678901",
    department: "Finance",
    role: "employee",
    designation: "Senior Financial Analyst",
    salary: 58000,
    status: "Active",
    joinDate: "2022-11-01",
  },
];

const getInitialAuthPage = () => {
  try {
    const path = (window.location.pathname || "").toLowerCase();
    const search = (window.location.search || "").toLowerCase();
    const hash = (window.location.hash || "").toLowerCase();
    if (
      path.includes("admin") ||
      search.includes("portal=admin") ||
      search.includes("role=admin") ||
      hash === "#admin"
    ) {
      return "admin";
    }
    return "employee";
  } catch {
    return "employee";
  }
};

/* ==================================================
   ROLE-BASED ROOT COMPONENT
================================================== */
function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ems_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authPage, setAuthPage] = useState(getInitialAuthPage);
  const [initialAdminPage, setInitialAdminPage] = useState("Dashboard");
  const [currentTheme, setCurrentTheme] = useState(() => getUserTheme(user));

  useEffect(() => {
    const active = getUserTheme(user);
    setCurrentTheme(active);
    applyThemeToDOM(active);
  }, [user]);

  // Sync auth page when user uses browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setAuthPage(getInitialAuthPage());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateAuthPage = (page) => {
    setAuthPage(page);
    const targetUrl = page === "admin" ? "/admin-login" : "/employee-login";
    try {
      window.history.pushState({ authPage: page }, "", targetUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTheme = (themeId) => {
    saveUserTheme(user, themeId);
    setCurrentTheme(themeId);
  };

  const handleLogin = (userData, targetPage = "Dashboard") => {
    setUser(userData);
    if (targetPage) {
      setInitialAdminPage(targetPage);
    }
    try {
      localStorage.setItem("ems_user", JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    const lastRole = user?.role;
    setUser(null);
    setInitialAdminPage("Dashboard");
    try {
      localStorage.removeItem("ems_user");
    } catch (e) {
      console.error(e);
    }
    if (lastRole === "admin") {
      navigateAuthPage("admin");
    } else {
      navigateAuthPage("employee");
    }
  };

  const handleSwitchToEmployee = () => {
    const demoEmp = {
      id: "2",
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      role: "employee",
      department: "Engineering",
      designation: "Senior Software Engineer",
      salary: 85000,
      phone: "9876543210",
      joinDate: "2023-03-20",
    };
    handleLogin(demoEmp);
  };

  const handleSwitchToAdmin = () => {
    const demoAdmin = {
      id: "1",
      email: "sppraseeman@gmail.com",
      role: "admin",
      name: "Praseeman",
      department: "HR",
      designation: "Administrator & HR Manager",
      salary: 65000,
      phone: "8248070608",
    };
    handleLogin(demoAdmin);
  };

  // 1. Not logged in -> Show Separate Login Page (Admin or Employee)
  if (!user) {
    if (authPage === "admin") {
      return (
        <AdminLogin
          onLogin={handleLogin}
          onNavigateToEmployee={() => navigateAuthPage("employee")}
        />
      );
    }
    return (
      <EmployeeLogin
        onLogin={handleLogin}
        onNavigateToAdmin={() => navigateAuthPage("admin")}
      />
    );
  }

  // 2. Role-Based Routing
  // Admin Login -> Redirect to Admin Dashboard
  if (user.role === "admin") {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
        initialPage={initialAdminPage}
        onSwitchToEmployee={handleSwitchToEmployee}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />
    );
  }

  // Employee Login -> Redirect to Employee Dashboard
  if (user.role === "employee") {
    return (
      <EmployeeDashboard
        user={user}
        onLogout={handleLogout}
        onSwitchToAdmin={handleSwitchToAdmin}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />
    );
  }

  // Unauthorized / Role Tampered fallback
  return (
    <AccessDenied
      user={user}
      onBack={() => setUser({ ...user, role: "employee" })}
      onLogout={handleLogout}
    />
  );
}

/* ==================================================
   ACCESS DENIED / RBAC GUARD COMPONENT
================================================== */
function AccessDenied({ user, onBack, onLogout }) {
  return (
    <div className="access-denied-wrap">
      <div className="access-denied-card">
        <div className="access-shield-icon">
          <ShieldIcon width={28} height={28} />
        </div>
        <h1>Access Restricted</h1>
        <p>
          You are signed in as <strong>{user?.name || user?.email}</strong> with role:{" "}
          <span style={{ textTransform: "capitalize", fontWeight: "700" }}>{user?.role}</span>.
          <br /><br />
          Administrative privileges are required to access this portal. Staff employees are not authorized to view the Admin Dashboard.
        </p>
        <div className="access-denied-actions">
          <button type="button" className="emp-primary-btn" onClick={onBack}>
            Return to Employee Dashboard
          </button>
          <button type="button" className="emp-cancel-btn" onClick={onLogout}>
            Sign Out Securely
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================
   ADMIN DASHBOARD COMPONENT
================================================== */
function AdminDashboard({
  user,
  onLogout,
  initialPage = "Dashboard",
  onSwitchToEmployee,
  currentTheme = "indigo",
  onSelectTheme,
}) {
  // Strict role verification check inside component
  if (user?.role !== "admin") {
    return (
      <AccessDenied
        user={user}
        onBack={() => window.location.reload()}
        onLogout={onLogout}
      />
    );
  }

  const [employees, setEmployees] = useState(INITIAL_FALLBACK_EMPLOYEES);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [editEmployee, setEditEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState(initialPage);
  const [showForm, setShowForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [settingsModal, setSettingsModal] = useState(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [adminPayslipEmployee, setAdminPayslipEmployee] = useState(null);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [customDepartments, setCustomDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [showFooter, setShowFooter] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [adminToast, setAdminToast] = useState(null);
  const [attendanceViewMode, setAttendanceViewMode] = useState("calendar");
  const [viewEmployeeProfile, setViewEmployeeProfile] = useState(null);
  const [reportDeptFilter, setReportDeptFilter] = useState("All");
  const [reportTimeframe, setReportTimeframe] = useState("October 2026");

  const showToast = (message, type = "success") => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 4000);
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

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const userMenuRef = useRef(null);

  // 1. Fetch Employees
  const getEmployees = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, []);

  // 2. Fetch Leaves
  const getLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/leaves`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  }, []);

  // 3. Fetch Attendance
  const getAttendance = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  }, []);

  // 4. Fetch Payroll
  const getPayroll = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/payroll`);
      if (res.ok) {
        const data = await res.json();
        setPayroll(data);
      }
    } catch (error) {
      console.error("Error fetching payroll:", error);
    }
  }, []);

  useEffect(() => {
    getEmployees();
    getLeaves();
    getAttendance();
    getPayroll();
  }, [getEmployees, getLeaves, getAttendance, getPayroll]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Employee Form Handlers
  const handleOpenAddForm = () => {
    setActivePage("AddEmployee");
  };

  const handleEditEmployee = (employee) => {
    setEditEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditEmployee(null);
  };

  // Add Employee
  const addEmployee = async (employee) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (response.ok) {
        const data = await response.json();
        await getEmployees();
        await getPayroll();
        handleCloseForm();
        return data;
      }
    } catch (error) {
      console.warn("Backend API unavailable, saving to local state:", error);
    }

    // Local fallback when backend is offline
    const fallbackEmp = {
      _id: Date.now().toString(),
      ...employee,
      joinDate: employee.joinDate || new Date().toISOString().split("T")[0],
      status: employee.status || "Active",
    };
    setEmployees((prev) => [fallbackEmp, ...prev]);
    handleCloseForm();
    return fallbackEmp;
  };

  // Update Employee
  const updateEmployee = async (employee) => {
    try {
      if (!editEmployee?._id) return;

      const response = await fetch(`${API_URL}/${editEmployee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update employee");

      await getEmployees();
      await getPayroll();
      handleCloseForm();
    } catch (error) {
      console.error("Error updating employee:", error);
      alert(error.message || "Unable to update employee.");
    }
  };

  // Delete Employee
  const deleteEmployee = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete employee");

      await getEmployees();
      await getPayroll();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.message || "Unable to delete employee.");
    }
  };

  // Leave Approval / Rejection Handlers
  const handleLeaveDecision = async (leaveId, decision) => {
    // Optimistic UI update
    setLeaves((prev) =>
      prev.map((l) => (l._id === leaveId ? { ...l, status: decision } : l))
    );

    try {
      const res = await fetch(`${API_BASE}/leaves/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision }),
      });
      if (!res.ok) throw new Error("Failed to update leave status");
    } catch (e) {
      console.error("Error updating leave:", e);
      getLeaves();
    }
  };

  // Mark Payroll Paid
  const handleMarkPayrollPaid = async (empId) => {
    setPayroll((prev) =>
      prev.map((p) => (p.employeeId === empId ? { ...p, status: "Paid" } : p))
    );

    try {
      await fetch(`${API_BASE}/payroll/${empId}/pay`, { method: "PUT" });
      alert("Payroll marked as Paid successfully!");
    } catch (e) {
      console.error("Error processing payroll pay:", e);
    }
  };

  // Mark Attendance by Admin
  const handleUpdateAttendanceStatus = async (recordId, newStatus) => {
    setAttendance((prev) =>
      prev.map((a) => (a._id === recordId ? { ...a, status: newStatus } : a))
    );

    try {
      await fetch(`${API_BASE}/attendance/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Error updating attendance status:", e);
    }
  };

  // Add Department
  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setCustomDepartments((prev) => [...prev, newDeptName.trim()]);
    setNewDeptName("");
    setShowAddDeptModal(false);
    alert(`Department "${newDeptName.trim()}" added successfully!`);
  };

  // Active filters count
  const activeFiltersCount =
    (filterDept !== "All" ? 1 : 0) + (filterStatus !== "All" ? 1 : 0);

  // Search & Multi-criteria filter
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase()) ||
      employee.department?.toLowerCase().includes(search.toLowerCase()) ||
      employee.phone?.includes(search);
    const matchesDept = filterDept === "All" || employee.department === filterDept;
    const matchesStatus =
      filterStatus === "All" || (employee.status || "Active") === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Derived Dashboard Stats
  const totalEmployees = employees.length;
  const allDepartments = [
    ...new Set([
      ...employees.map((emp) => emp.department).filter(Boolean),
      ...customDepartments,
    ]),
  ];
  const departmentCount = allDepartments.length;

  const totalSalary = employees.reduce(
    (total, emp) => total + Number(emp.salary || 0),
    0
  );

  const activeEmployees = employees.filter(
    (emp) => emp.status === "Active" || emp.status === undefined
  ).length;

  const pendingLeavesCount = leaves.filter((l) => l.status === "Pending").length;

  const handlePageChange = (page) => {
    setActivePage(page);
    if (page !== "Employees") {
      setSearch("");
    }
    if (page.startsWith("Reports") && page !== "Reports") {
      const targetMap = {
        ReportsGrowth: "report-growth",
        ReportsDept: "report-dept",
        ReportsAttendance: "report-attendance",
        ReportsLeave: "report-leave",
        ReportsRegistry: "report-registry",
      };
      const targetId = targetMap[page];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
            el.style.boxShadow = "0 0 0 3px rgba(40, 116, 240, 0.4)";
            el.style.borderColor = "#2874F0";
            setTimeout(() => {
              el.style.boxShadow = "";
              el.style.borderColor = "";
            }, 1800);
          }
        }, 100);
      }
    }
  };

  // Combined Comprehensive Dataset (Employees + Payroll + Attendance) - Strictly English
  const combinedCsvData = useMemo(() => {
    return employees.map((emp) => {
      // Find matching payroll
      const empPayroll =
        payroll.find(
          (p) => String(p.employeeId) === String(emp._id) || p.name === emp.name
        ) || {};

      // Find matching attendance
      const empAttendance =
        attendance.find(
          (a) => String(a.employeeId) === String(emp._id) || a.employeeName === emp.name
        ) || {};

      const baseSalary = Number(empPayroll.baseSalary || emp.salary || 0);
      const hraAllowance = Number(empPayroll.hra || Math.round(baseSalary * 0.4));
      const otherAllowances = Number(empPayroll.allowances || Math.round(baseSalary * 0.15));
      const totalDeductions = Number(
        empPayroll.pf && empPayroll.tax
          ? empPayroll.pf + empPayroll.tax
          : Math.round(baseSalary * 0.12)
      );
      const netSalary = Number(
        empPayroll.netSalary || baseSalary + hraAllowance + otherAllowances - totalDeductions
      );

      return {
        Employee_ID: `EMP-00${emp._id}`,
        Employee_Name: String(emp.name || "Unknown").trim(),
        Official_Email: String(emp.email || "").trim(),
        Contact_Phone: String(emp.phone || "").trim(),
        Department: String(emp.department || "General").trim(),
        Designation: String(emp.designation || emp.role || "Staff").trim(),
        Employment_Status: String(emp.status || "Active").trim(),
        Date_of_Joining: String(emp.joinDate || "2023-01-15").trim(),
        Base_Salary_INR: baseSalary,
        HRA_Allowance_INR: hraAllowance,
        Other_Allowances_INR: otherAllowances,
        Total_Deductions_INR: totalDeductions,
        Net_Salary_INR: netSalary,
        Payroll_Payment_Status: String(empPayroll.status || (emp.salary ? "Paid" : "Pending")),
        Attendance_Date: String(empAttendance.date || new Date().toISOString().split("T")[0]),
        Check_In_Time: String(empAttendance.checkIn || "09:00 AM"),
        Check_Out_Time: String(empAttendance.checkOut || "06:00 PM"),
        Attendance_Status: String(empAttendance.status || "Present"),
      };
    });
  }, [employees, payroll, attendance]);

  // One-click Clean Data Download (Excel .xlsx, CSV, PDF)
  const handleDownloadReport = (format = "xlsx") => {
    if (format === "pdf") {
      exportAllReportsToPdf({
        employees,
        reportDeptFilter,
        onToast: showToast,
      });
      return;
    }

    if (format === "xlsx" || format === "excel") {
      exportAllReportsToExcel({
        employees,
        payroll,
        attendance,
        reportDeptFilter,
        onToast: showToast,
      });
      return;
    }

    if (!combinedCsvData || combinedCsvData.length === 0) {
      showToast("No report data available to export.", "error");
      return;
    }

    const headers = Object.keys(combinedCsvData[0]);
    const rows = combinedCsvData.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `EMS_All_Reports_Combined_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Combined CSV report downloaded successfully!", "success");
  };

  // Secure Logout
  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout?.();
  };

  // Reusable Employee Card
  const renderEmployeeSection = (subtitle) => (
    <section className="employee-card">
      <div className="employee-card-header">
        <div className="employee-title">
          <div className="employee-title-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <h2>Staff Directory</h2>
            <p>{subtitle || "Manage team members, roles, departments, and payroll details"}</p>
          </div>
        </div>
        <button type="button" className="add-btn" onClick={handleOpenAddForm}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Employee</span>
        </button>
      </div>

      <div className="employee-search">
        <div className="search-box">
          <span className="search-icon-svg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search employee by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          className={`filter-btn ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
          title="Toggle advanced filtering options"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          <span>Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
          <span
            className="filter-chevron"
            style={{
              transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            ▾
          </span>
        </button>

        <button
          type="button"
          className="directory-shortcut-btn"
          onClick={() => setActivePage("Employees")}
          title="Open full employees directory with all controls"
        >
          <span>Full Directory</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      {showFilters && (
        <div className="dashboard-filter-drawer">
          <div className="filter-drawer-header">
            <div className="filter-drawer-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span>Refine Directory by Department & Status</span>
            </div>
            {(filterDept !== "All" || filterStatus !== "All" || search) && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => {
                  setFilterDept("All");
                  setFilterStatus("All");
                  setSearch("");
                }}
              >
                Reset Filters ✕
              </button>
            )}
          </div>

          <div className="filter-drawer-grid">
            <div className="filter-drawer-col">
              <label>Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="All">All Departments ({employees.length})</option>
                {allDepartments.map((dept) => {
                  const count = employees.filter((e) => e.department === dept).length;
                  return (
                    <option key={dept} value={dept}>
                      {dept} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="filter-drawer-col">
              <label>Employment Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="filter-drawer-col">
              <label>Quick Action</label>
              <button
                type="button"
                className="filter-full-directory-btn"
                onClick={() => setActivePage("Employees")}
              >
                <span>Open Full Directory Page</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <EmployeeList
        employees={filteredEmployees}
        setEditEmployee={handleEditEmployee}
        deleteEmployee={deleteEmployee}
        onViewEmployee={setViewEmployeeProfile}
      />
    </section>
  );

  return (
    <div className="app">
      <div className="app-layout">
        {/* FLOATING SIDEBAR NAVIGATION */}
        <Sidebar
          activeItem={activePage}
          onSelectItem={handlePageChange}
          onLogout={handleLogout}
          onOpenSettings={() => setSettingsModal("profile")}
          onDownloadReport={handleDownloadReport}
          pendingLeavesCount={pendingLeavesCount}
          adminUser={user}
        />

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="top-search">
            <SearchIcon width={15} height={15} className="search-svg-icon" />
            <input
              type="text"
              placeholder="Search employees by name, email, or department..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActivePage("Employees");
              }}
            />
          </div>

          <div className="admin-section">
            <SmartClock theme={currentTheme === "dark" ? "dark" : "admin"} />

            <button
              type="button"
              className="topbar-share-btn"
              onClick={() => setShowShareModal(true)}
              title="Share Workplace Portal Link or QR Code"
            >
              <ShareIcon width={14} height={14} />
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
              className="admin-dropdown-wrap"
              ref={userMenuRef}
              onClick={() => setShowUserMenu((s) => !s)}
            >
              <div className="admin-avatar">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>

              <div className="admin-info">
                <strong>{user?.name || "Administrator"}</strong>
                <small>System Admin</small>
              </div>

              <div className="arrow">▼</div>

              {showUserMenu && (
                <div
                  className="user-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="user-menu-header">
                    <div className="user-menu-avatar">
                      {user?.name ? user.name[0].toUpperCase() : "A"}
                    </div>
                    <div>
                      <strong>{user?.name || "Admin"}</strong>
                      <small>{user?.email}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="user-menu-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      setActivePage("Settings");
                    }}
                  >
                    <span className="menu-icon">
                      <SettingsIcon width={14} height={14} />
                    </span>
                    Settings
                  </button>


                  <button
                    type="button"
                    id="admin-logout-btn"
                    className="user-menu-item logout"
                    onClick={handleLogout}
                  >
                    <span className="menu-icon">⏻</span>
                    Log Out Securely
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="content">
          {/* ================= 1. DASHBOARD OVERVIEW ================= */}
          {activePage === "Dashboard" && (
            <>
              <div className="page-heading">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h1>Administrator Overview</h1>
                    <p>Real-time metrics, workforce directory, and operational performance</p>
                  </div>
                  <ReportExportMenu
                    employees={employees}
                    payroll={payroll}
                    attendance={attendance}
                    reportDeptFilter="All"
                    onToast={showToast}
                    buttonLabel="Download Data"
                  />
                </div>
              </div>

              <div className="stats-grid">
                {/* 1. Total Employees */}
                <div
                  className="stat-card"
                  onClick={() => setActivePage("Employees")}
                  title="View workforce directory"
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Total Employees</span>
                    <div className="stat-icon-wrap blue">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                  </div>
                  <h2>{totalEmployees}</h2>
                  <div className="stat-trend">
                    <span>Registered headcount</span>
                  </div>
                </div>

                {/* 2. Active Employees */}
                <div
                  className="stat-card"
                  onClick={() => setActivePage("Employees")}
                  title="View active workforce"
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Active Employees</span>
                    <div className="stat-icon-wrap" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                  </div>
                  <h2>{activeEmployees}</h2>
                  <div className="stat-trend highlight-green">
                    <span>● {totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 100}% workforce active</span>
                  </div>
                </div>

                {/* 3. Total Departments */}
                <div
                  className="stat-card"
                  onClick={() => setActivePage("Departments")}
                  title="View all departments"
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Total Departments</span>
                    <div className="stat-icon-wrap purple">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                        <path d="M9 22v-4h6v4"/>
                        <path d="M8 6h.01"/>
                        <path d="M16 6h.01"/>
                        <path d="M12 6h.01"/>
                      </svg>
                    </div>
                  </div>
                  <h2>{departmentCount}</h2>
                  <div className="stat-trend">
                    <span>Operational departments</span>
                  </div>
                </div>

                {/* 4. Monthly Payroll */}
                <div
                  className="stat-card"
                  onClick={() => setActivePage("Payroll")}
                  title="Manage payroll"
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Monthly Payroll</span>
                    <div className="stat-icon-wrap green">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="5" rx="2"/>
                        <line x1="2" x2="22" y1="10" y2="10"/>
                      </svg>
                    </div>
                  </div>
                  <h2>₹{totalSalary.toLocaleString("en-IN")}</h2>
                  <div className="stat-trend">
                    <span>Base expenditure</span>
                  </div>
                </div>

                {/* 5. Pending Leave Requests */}
                <div
                  className="stat-card"
                  onClick={() => setActivePage("LeaveRequests")}
                  title="Review leave requests"
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Pending Leaves</span>
                    <div className="stat-icon-wrap orange">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 2v4"/>
                        <path d="M16 2v4"/>
                        <rect width="18" height="18" x="3" y="4" rx="2"/>
                        <path d="M3 10h18"/>
                      </svg>
                    </div>
                  </div>
                  <h2>{pendingLeavesCount}</h2>
                  <div className={`stat-trend ${pendingLeavesCount > 0 ? "highlight-amber" : "highlight-green"}`}>
                    <span>{pendingLeavesCount > 0 ? "● Action required" : "✓ All caught up"}</span>
                  </div>
                </div>
              </div>

              {renderEmployeeSection("View, add, edit and manage organization staff")}
            </>
          )}

          {/* ================= 2. EMPLOYEES ================= */}
          {activePage === "Employees" && (
            <EmployeesPage
              employees={employees}
              onOpenAddForm={handleOpenAddForm}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={deleteEmployee}
            />
          )}

          {/* ================= ADD EMPLOYEE PAGE ================= */}
          {activePage === "AddEmployee" && (
            <AddEmployeePage
              adminUser={user}
              onAddEmployee={addEmployee}
              onCancel={() => setActivePage("Employees")}
              onNavigateToDirectory={() => setActivePage("Employees")}
            />
          )}

          {/* ================= 3. ATTENDANCE ================= */}
          {activePage === "Attendance" && (
            <>
              <div className="page-heading">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h1>Attendance Management</h1>
                    <p>Monitor real-time employee check-ins, monthly calendar roster, and punctuality analytics</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setAttendanceViewMode("calendar")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: attendanceViewMode === "calendar" ? "#0f172a" : "transparent",
                        color: attendanceViewMode === "calendar" ? "#ffffff" : "#64748b",
                        fontWeight: "600",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      📅 Monthly Calendar Roster
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceViewMode("table")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: attendanceViewMode === "table" ? "#0f172a" : "transparent",
                        color: attendanceViewMode === "table" ? "#ffffff" : "#64748b",
                        fontWeight: "600",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      📋 Live Check-In Table
                    </button>
                  </div>
                </div>
              </div>

              {attendanceViewMode === "calendar" ? (
                <AttendanceCalendar
                  attendanceRecords={attendance}
                  leaves={leaves}
                  currentUser={user}
                  isAdmin={true}
                  allEmployees={employees}
                  onUpdateStatus={(dateKey, newStatus) => {
                    showToast(`Updated attendance for ${dateKey} to ${newStatus}`);
                  }}
                />
              ) : (
                <div className="report-table">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>Today's Live Check-Ins (October 9, 2026)</h2>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      Total Logged: <strong>{attendance.length} Records</strong>
                    </span>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((rec) => (
                        <tr key={rec._id}>
                          <td><strong>{rec.employeeName}</strong></td>
                          <td>{rec.department || "General"}</td>
                          <td>{rec.checkIn || "--"}</td>
                          <td>{rec.checkOut || "--"}</td>
                          <td>
                            <span
                              className={`status-badge ${rec.status?.toLowerCase().replace(" ", "-")}`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={rec.status}
                              onChange={(e) =>
                                handleUpdateAttendanceStatus(rec._id, e.target.value)
                              }
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Present">Present</option>
                              <option value="Late">Late</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ================= 4. LEAVE REQUESTS ================= */}
          {activePage === "LeaveRequests" && (
            <>
              <div className="page-heading">
                <h1>Leave Request Management</h1>
                <p>Review, approve, and reject employee leave applications in real time</p>
              </div>

              <div className="report-table">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h2 style={{ margin: 0 }}>Employee Leave Applications</h2>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span
                      style={{
                        background: "#fffbeb",
                        color: "#b45309",
                        border: "1px solid #fde68a",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Pending: {leaves.filter((l) => l.status === "Pending").length}
                    </span>
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "#047857",
                        border: "1px solid #a7f3d0",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Approved: {leaves.filter((l) => l.status === "Approved").length}
                    </span>
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => {
                      const isPending = leave.status === "Pending";
                      return (
                        <tr key={leave._id}>
                          <td><strong>{leave.employeeName}</strong></td>
                          <td>{leave.department}</td>
                          <td>{leave.leaveType}</td>
                          <td>
                            {leave.fromDate} → {leave.toDate}
                          </td>
                          <td>{leave.days} Day(s)</td>
                          <td style={{ maxWidth: "200px" }}>{leave.reason}</td>
                          <td>
                            <span
                              className={`status-badge ${leave.status?.toLowerCase()}`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            {isPending ? (
                              <div className="leave-actions">
                                <button
                                  type="button"
                                  className="icon-btn approve-btn"
                                  title="Approve Leave"
                                  onClick={() =>
                                    handleLeaveDecision(leave._id, "Approved")
                                  }
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  className="icon-btn reject-btn"
                                  title="Reject Leave"
                                  onClick={() =>
                                    handleLeaveDecision(leave._id, "Rejected")
                                  }
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  fontWeight: "600",
                                }}
                              >
                                {leave.status === "Approved" ? "✓ Approved" : "✕ Rejected"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= 5. PAYROLL ================= */}
          {activePage === "Payroll" && (
            <>
              <div className="page-heading">
                <h1>Payroll Management</h1>
                <p>Calculate salaries, review deductions, process monthly disbursements and generate payslips</p>
              </div>

              <div className="report-table">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h2 style={{ margin: 0 }}>Monthly Payroll Summary (October 2026)</h2>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#10b981" }}>
                    Total Outflow: ₹{totalSalary.toLocaleString("en-IN")}
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Base Salary</th>
                      <th>HRA (40%)</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.map((pay) => {
                      return (
                        <tr key={pay.employeeId}>
                          <td><strong>{pay.name}</strong></td>
                          <td>{pay.department}</td>
                          <td>₹{pay.baseSalary?.toLocaleString("en-IN")}</td>
                          <td>₹{pay.hra?.toLocaleString("en-IN")}</td>
                          <td>₹{pay.allowances?.toLocaleString("en-IN")}</td>
                          <td style={{ color: "#ef4444" }}>
                            -₹{(pay.pf + pay.tax)?.toLocaleString("en-IN")}
                          </td>
                          <td>
                            <strong style={{ color: "#059669" }}>
                              ₹{pay.netSalary?.toLocaleString("en-IN")}
                            </strong>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                pay.status === "Paid" ? "present" : "pending"
                              }`}
                            >
                              {pay.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {pay.status !== "Paid" && (
                                <button
                                  type="button"
                                  className="emp-primary-btn"
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    background: "#10b981",
                                  }}
                                  onClick={() =>
                                    handleMarkPayrollPaid(pay.employeeId)
                                  }
                                >
                                  Mark Paid
                                </button>
                              )}
                              <button
                                type="button"
                                className="emp-primary-btn"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={() => setAdminPayslipEmployee(pay)}
                              >
                                View Slip
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= PERFORMANCE & OKRS ================= */}
          {activePage === "Performance" && (
            <PerformanceSection
              user={user}
              role="admin"
              allEmployees={employees}
              onTriggerToast={showToast}
            />
          )}

          {/* ================= 6. DEPARTMENTS ================= */}
          {activePage === "Departments" && (
            <>
              <div className="page-heading">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h1>Department Management</h1>
                    <p>Organize organizational units, track headcount and department allocation</p>
                  </div>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => setShowAddDeptModal(true)}
                  >
                    + Add Department
                  </button>
                </div>
              </div>

              <div className="department-grid">
                {allDepartments.map((dept) => {
                  const deptEmployees = employees.filter(
                    (emp) => emp.department === dept
                  );
                  const count = deptEmployees.length;
                  const deptPayroll = deptEmployees.reduce(
                    (acc, curr) => acc + Number(curr.salary || 0),
                    0
                  );

                  return (
                    <div className="department-card" key={dept}>
                      <div className="department-icon">🏢</div>
                      <h2>{dept}</h2>
                      <p style={{ fontWeight: "700", color: "#1e293b", margin: "6px 0" }}>
                        {count} Staff Member{count === 1 ? "" : "s"}
                      </p>
                      <small style={{ color: "#64748b" }}>
                        Monthly Allocation: ₹{deptPayroll.toLocaleString("en-IN")}
                      </small>
                      <div style={{ marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#3b82f6", fontWeight: "600" }}>
                          {count > 0
                            ? deptEmployees.map((e) => e.name).slice(0, 2).join(", ") +
                              (count > 2 ? ` +${count - 2} more` : "")
                            : "No members assigned"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ================= 7. REPORTS & ANALYTICS ================= */}
          {(activePage === "Reports" || activePage.startsWith("Reports")) && (
            <>
              <div className="page-heading">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h1>Executive Reports & Workforce Analytics</h1>
                    <p>Live business intelligence, attendance patterns, headcount trajectory, and payroll metrics</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <ReportExportMenu
                      employees={employees}
                      payroll={payroll}
                      attendance={attendance}
                      reportDeptFilter={reportDeptFilter}
                      onToast={showToast}
                      buttonLabel="Download Data"
                    />
                  </div>
                </div>
              </div>

              {/* FILTER CONTROLS BAR */}
              <div className="reports-filter-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--theme-card-bg, #ffffff)", border: "1px solid var(--theme-card-border, #e2e8f0)", padding: "14px 20px", borderRadius: "14px", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Department:</span>
                    <select
                      value={reportDeptFilter}
                      onChange={(e) => setReportDeptFilter(e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#f8fafc", fontWeight: "600" }}
                    >
                      <option value="All">All Departments ({employees.length})</option>
                      {allDepartments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Time Period:</span>
                    <select
                      value={reportTimeframe}
                      onChange={(e) => setReportTimeframe(e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#f8fafc", fontWeight: "600" }}
                    >
                      <option value="October 2026">October 2026 (Current Month)</option>
                      <option value="Q3 2026">Quarter 3 (Jul - Sep 2026)</option>
                      <option value="Year-to-Date 2026">Year to Date (Fiscal 2026)</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  <span>Data synchronized with corporate database</span>
                </div>
              </div>

              {/* KPI CARDS */}
              <div className="reports-grid" style={{ marginBottom: "24px" }}>
                <div className="report-card">
                  <span>
                    <UsersIcon width={18} height={18} />
                  </span>
                  <h2>{reportDeptFilter === "All" ? totalEmployees : employees.filter((e) => e.department === reportDeptFilter).length}</h2>
                  <p>Filtered Staff Headcount</p>
                  <small style={{ color: "#059669", fontWeight: "600" }}>● {activeEmployees} active members</small>
                </div>

                <div className="report-card">
                  <span>
                    <BuildingIcon width={18} height={18} />
                  </span>
                  <h2>{reportDeptFilter === "All" ? departmentCount : 1}</h2>
                  <p>{reportDeptFilter === "All" ? "Active Departments" : "Selected Unit"}</p>
                  <small style={{ color: "#64748b" }}>Operational coverage</small>
                </div>

                <div className="report-card">
                  <span>₹</span>
                  <h2>
                    ₹{((reportDeptFilter === "All" ? employees : employees.filter((e) => e.department === reportDeptFilter)).reduce((acc, curr) => acc + Number(curr.salary || 0), 0)).toLocaleString("en-IN")}
                  </h2>
                  <p>Monthly Payroll Allocation</p>
                  <small style={{ color: "#3b82f6", fontWeight: "600" }}>₹{Math.round(totalSalary / (totalEmployees || 1)).toLocaleString("en-IN")} avg salary</small>
                </div>

                <div className="report-card">
                  <span>✓</span>
                  <h2>94.8%</h2>
                  <p>Punctuality & Attendance</p>
                  <small style={{ color: "#059669", fontWeight: "600" }}>Top quartile compliance</small>
                </div>
              </div>

              {/* INTERACTIVE CHARTS ROW 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                {/* 1. Monthly Employee Growth Area Chart */}
                <div id="report-growth" style={{ background: "var(--theme-card-bg, #ffffff)", border: "1px solid var(--theme-card-border, #e2e8f0)", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", scrollMarginTop: "80px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "var(--theme-text-primary, #0f172a)" }}>Monthly Workforce Growth</h3>
                      <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#64748b" }}>Registered staff trajectory over past 6 months</p>
                    </div>
                    <span style={{ background: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                      +200% H1 Growth
                    </span>
                  </div>

                  <svg viewBox="0 0 460 170" style={{ width: "100%", height: "170px" }}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="440" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="40" y1="60" x2="440" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="40" y1="100" x2="440" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="40" y1="140" x2="440" y2="140" stroke="#e2e8f0" />

                    {/* Area Polygon */}
                    <polygon points="50,140 50,115 125,95 200,80 275,65 350,45 425,30 425,140" fill="url(#growthGrad)" />
                    {/* Line */}
                    <polyline points="50,115 125,95 200,80 275,65 350,45 425,30" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

                    {/* Nodes and values */}
                    {[
                      { x: 50, y: 115, val: 2, m: "May" },
                      { x: 125, y: 95, val: 3, m: "Jun" },
                      { x: 200, y: 80, val: 4, m: "Jul" },
                      { x: 275, y: 65, val: 5, m: "Aug" },
                      { x: 350, y: 45, val: 6, m: "Sep" },
                      { x: 425, y: 30, val: employees.length, m: "Oct" },
                    ].map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                        <text x={pt.x} y={pt.y - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#4f46e5">
                          {pt.val}
                        </text>
                        <text x={pt.x} y="155" textAnchor="middle" fontSize="10" fill="#64748b">
                          {pt.m}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* 2. Department-wise Distribution */}
                <div id="report-dept" style={{ background: "var(--theme-card-bg, #ffffff)", border: "1px solid var(--theme-card-border, #e2e8f0)", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", scrollMarginTop: "80px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "var(--theme-text-primary, #0f172a)" }}>Department Distribution & Headcount</h3>
                      <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#64748b" }}>Staff distribution across business units</p>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                      {allDepartments.length} Total Units
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {allDepartments.map((dept, idx) => {
                      const count = employees.filter((e) => e.department === dept).length;
                      const pct = Math.round((count / (totalEmployees || 1)) * 100);
                      const colors = ["#4f46e5", "#059669", "#7c3aed", "#ea580c", "#0ea5e9", "#e11d48"];
                      const color = colors[idx % colors.length];

                      return (
                        <div key={dept}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                            <span style={{ fontWeight: "600", color: "#1e293b" }}>{dept}</span>
                            <span style={{ color: "#64748b" }}>{count} member{count === 1 ? "" : "s"} ({pct}%)</span>
                          </div>
                          <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* INTERACTIVE CHARTS ROW 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                {/* 3. Attendance & Punctuality Trends */}
                <div id="report-attendance" style={{ background: "var(--theme-card-bg, #ffffff)", border: "1px solid var(--theme-card-border, #e2e8f0)", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", scrollMarginTop: "80px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "var(--theme-text-primary, #0f172a)" }}>Weekly Attendance Trends</h3>
                      <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#64748b" }}>Punctuality and on-time punch rates (Mon - Fri)</p>
                    </div>
                    <span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                      95.2% Avg Rate
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: "150px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                    {[
                      { day: "Mon", rate: 96, onTime: 5, late: 1 },
                      { day: "Tue", rate: 94, onTime: 5, late: 0 },
                      { day: "Wed", rate: 98, onTime: 6, late: 1 },
                      { day: "Thu", rate: 95, onTime: 5, late: 0 },
                      { day: "Fri", rate: 92, onTime: 4, late: 1 },
                    ].map((bar) => (
                      <div key={bar.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981" }}>{bar.rate}%</span>
                        <div style={{ width: "32px", height: `${bar.rate}px`, background: "linear-gradient(180deg, #10b981 0%, #059669 100%)", borderRadius: "6px 6px 0 0", boxShadow: "0 2px 6px rgba(16,185,129,0.2)" }} />
                        <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "12px", fontSize: "11px", color: "#64748b" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "2px" }}></span> On-Time Check-In (Grace ≤ 15 min)
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "8px", height: "8px", background: "#f59e0b", borderRadius: "2px" }}></span> Late Arrivals (Within limit)
                    </span>
                  </div>
                </div>

                {/* 4. Leave Statistics & Distribution */}
                <div id="report-leave" style={{ background: "var(--theme-card-bg, #ffffff)", border: "1px solid var(--theme-card-border, #e2e8f0)", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", scrollMarginTop: "80px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "var(--theme-text-primary, #0f172a)" }}>Leave Approvals & Statistics</h3>
                      <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#64748b" }}>Breakdown of leave requests across organization</p>
                    </div>
                    <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                      {pendingLeavesCount} Pending Review
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "20px", color: "#059669" }}>
                        {leaves.filter((l) => l.status === "Approved").length}
                      </h4>
                      <span style={{ fontSize: "11px", color: "#065f46", fontWeight: "600" }}>Approved</span>
                    </div>

                    <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "20px", color: "#d97706" }}>
                        {pendingLeavesCount}
                      </h4>
                      <span style={{ fontSize: "11px", color: "#92400e", fontWeight: "600" }}>Pending Action</span>
                    </div>

                    <div style={{ background: "#fef2f2", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "20px", color: "#dc2626" }}>
                        {leaves.filter((l) => l.status === "Rejected").length}
                      </h4>
                      <span style={{ fontSize: "11px", color: "#991b1b", fontWeight: "600" }}>Rejected</span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Common Leave Categories:</label>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                      <span style={{ background: "#f1f5f9", color: "#334155", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>Casual Leave: 58%</span>
                      <span style={{ background: "#f1f5f9", color: "#334155", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>Sick Leave: 27%</span>
                      <span style={{ background: "#f1f5f9", color: "#334155", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>Annual Leave: 15%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILED WORKFORCE CONSOLIDATED TABLE */}
              <div id="report-registry" className="report-table" style={{ background: "var(--theme-card-bg, #ffffff)", border: "1px solid var(--theme-card-border, #e2e8f0)", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", scrollMarginTop: "80px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "17px" }}>Consolidated Staff Registry</h2>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                      Showing staff records filtered by {reportDeptFilter === "All" ? "all departments" : reportDeptFilter}
                    </p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#4f46e5" }}>
                    {reportDeptFilter === "All" ? employees.length : employees.filter((e) => e.department === reportDeptFilter).length} matching records
                  </span>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Salary (INR)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportDeptFilter === "All" ? employees : employees.filter((e) => e.department === reportDeptFilter)).map((emp) => (
                      <tr key={emp._id}>
                        <td>
                          <strong>{emp.name}</strong>
                          <small style={{ display: "block", color: "#64748b" }}>EMP-00{emp._id}</small>
                        </td>
                        <td>{emp.email}</td>
                        <td>{emp.phone || "--"}</td>
                        <td><span className="department-badge">{emp.department}</span></td>
                        <td>{emp.designation || "Staff"}</td>
                        <td><strong>₹{Number(emp.salary || 0).toLocaleString("en-IN")}</strong></td>
                        <td>
                          <span className={`status-badge status-${(emp.status || "active").toLowerCase().replace(" ", "-")}`}>
                            ● {emp.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="action-btn view-action"
                            onClick={() => setViewEmployeeProfile(emp)}
                            title="View Complete Profile"
                          >
                            <span>👁 Profile</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= 8. SETTINGS ================= */}
          {activePage === "Settings" && (
            <>
              <div className="page-heading">
                <h1>Settings</h1>
                <p>Manage system preferences, workspace appearance, and administrator account</p>
              </div>

              {/* DYNAMIC THEME SELECTOR CARD */}
              <div className="theme-settings-container">
                <div className="theme-settings-head">
                  <div className="theme-settings-icon">
                    <SettingsIcon width={18} height={18} />
                  </div>
                  <div>
                    <h3>Workspace Theme & Visual Style</h3>
                    <p>Customize the workspace interface colors. Your selection is automatically remembered for your administrator account.</p>
                  </div>
                </div>
                <ThemePickerCards
                  currentTheme={currentTheme}
                  onSelectTheme={(tId) => {
                    if (onSelectTheme) onSelectTheme(tId);
                    showToast(`Admin theme set to ${THEMES.find((t) => t.id === tId)?.name || tId}!`, "success");
                  }}
                  user={user}
                />
              </div>

              <div className="settings-card">
                <div className="settings-header">
                  <div>
                    <h2>Application Settings</h2>
                    <p>Configure system preferences and administrator security</p>
                  </div>
                  <div className="settings-icon">
                    <SettingsIcon width={18} height={18} />
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-row-icon employee-setting">
                      <UsersIcon width={18} height={18} />
                    </div>
                    <div>
                      <h3>Employee Management</h3>
                      <p>Manage employee records, roles and permissions</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="setting-btn"
                    onClick={() => setSettingsModal("manage")}
                  >
                    Manage
                  </button>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-row-icon notification-setting">
                      <InfoIcon width={18} height={18} />
                    </div>
                    <div>
                      <h3>Notifications</h3>
                      <p>Configure alerts for leave requests and check-ins</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="setting-btn"
                    onClick={() => setSettingsModal("notifications")}
                  >
                    Configure
                  </button>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-row-icon account-setting">
                      <UserIcon width={18} height={18} />
                    </div>
                    <div>
                      <h3>Administrator Account</h3>
                      <p>Manage super administrator credentials and access</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className="setting-btn"
                      onClick={() => setSettingsModal("account")}
                    >
                      Account
                    </button>
                    <button
                      type="button"
                      className="logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ENTERPRISE ADMIN FOOTER - FULL WIDTH OF MAIN VIEWPORT, ZERO GAPS */}
        {showFooter && (
          <Footer
            role="admin"
            user={user}
            onNavigate={handlePageChange}
            onOpenSupport={() => setShowHelpModal(true)}
            onOpenAddEmployee={handleOpenAddForm}
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
      role="admin"
      isOpen={showNotifCenter}
      onClose={() => setShowNotifCenter(false)}
      onNavigate={handlePageChange}
      onTriggerToast={showToast}
    />

    {/* TOAST BANNER */}
    {adminToast && (
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 100000,
          background: "#0f172a",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "14px",
          fontWeight: "600",
          border: "1px solid #3b82f6",
          animation: "notifFade 0.2s ease",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <InfoIcon width={16} height={16} />
        </span>
        <span>{adminToast.message}</span>
      </div>
    )}

      {/* ================= EMPLOYEE FORM MODAL ================= */}
      {showForm && (
        <EmployeeForm
          addEmployee={addEmployee}
          updateEmployee={updateEmployee}
          editEmployee={editEmployee}
          setEditEmployee={setEditEmployee}
          onClose={handleCloseForm}
        />
      )}

      {/* ================= ADD DEPARTMENT MODAL ================= */}
      {showAddDeptModal && (
        <div
          className="settings-modal-overlay"
          onClick={() => setShowAddDeptModal(false)}
        >
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2>Add New Department</h2>
              <button
                className="settings-modal-close"
                onClick={() => setShowAddDeptModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddDepartment}>
              <div className="settings-modal-body">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                  Department Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Quality Assurance..."
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #d9e0ea",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div className="settings-modal-footer">
                <button
                  type="button"
                  className="cancel-settings-btn"
                  onClick={() => setShowAddDeptModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="open-employees-btn">
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADMIN PAYSLIP VIEW MODAL ================= */}
      {adminPayslipEmployee && (
        <div
          className="emp-modal-overlay"
          onClick={() => setAdminPayslipEmployee(null)}
        >
          <div
            className="emp-modal payslip-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="emp-modal-header">
              <h2>Official Salary Statement</h2>
              <button
                type="button"
                className="emp-modal-close"
                onClick={() => setAdminPayslipEmployee(null)}
              >
                ×
              </button>
            </div>

            <div className="emp-modal-body">
              <div className="payslip-sheet">
                <div className="payslip-company-header">
                  <div>
                    <h1>EMPLOYEE MANAGEMENT SYSTEM</h1>
                    <p>Corporate Headquarters • Tech City, Bangalore, India</p>
                  </div>
                  <div className="payslip-tag">PAYSLIP</div>
                </div>

                <div className="payslip-emp-meta">
                  <div className="payslip-meta-col">
                    <p>Employee Name: <strong>{adminPayslipEmployee.name}</strong></p>
                    <p>Employee ID: <strong>EMP-00{adminPayslipEmployee.employeeId}</strong></p>
                    <p>Department: <strong>{adminPayslipEmployee.department}</strong></p>
                  </div>
                  <div className="payslip-meta-col">
                    <p>Pay Period: <strong>{adminPayslipEmployee.month || "October 2026"}</strong></p>
                    <p>Payment Mode: <strong>Bank Direct Deposit</strong></p>
                    <p>Status: <strong style={{ color: "#059669" }}>{adminPayslipEmployee.status}</strong></p>
                  </div>
                </div>

                <div className="payslip-tables-split">
                  <div className="payslip-col-box">
                    <h4>EARNINGS (₹)</h4>
                    <div className="payslip-row-item">
                      <span>Base Salary</span>
                      <strong>₹{adminPayslipEmployee.baseSalary?.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item">
                      <span>House Rent Allowance (HRA)</span>
                      <strong>₹{adminPayslipEmployee.hra?.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item">
                      <span>Allowances</span>
                      <strong>₹{adminPayslipEmployee.allowances?.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  <div className="payslip-col-box">
                    <h4>DEDUCTIONS (₹)</h4>
                    <div className="payslip-row-item">
                      <span>Provident Fund (PF)</span>
                      <strong>₹{adminPayslipEmployee.pf?.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="payslip-row-item">
                      <span>Income Tax (TDS)</span>
                      <strong>₹{adminPayslipEmployee.tax?.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>

                <div className="payslip-total-box">
                  <h3>Net Take-Home Salary:</h3>
                  <div className="net-value">
                    ₹{adminPayslipEmployee.netSalary?.toLocaleString("en-IN")}
                  </div>
                </div>

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
                onClick={() => setAdminPayslipEmployee(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="emp-primary-btn"
                onClick={() => window.print()}
              >
                🖨 Print Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW EMPLOYEE PROFILE MODAL ================= */}
      {viewEmployeeProfile && (
        <div
          className="emp-modal-overlay"
          onClick={() => setViewEmployeeProfile(null)}
        >
          <div
            className="emp-modal emp-profile-view-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px", width: "94%" }}
          >
            <div className="emp-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <UserIcon width={20} height={20} />
                <h2 style={{ margin: 0 }}>Employee Profile Dossier</h2>
              </div>
              <button
                type="button"
                className="emp-modal-close"
                onClick={() => setViewEmployeeProfile(null)}
              >
                ×
              </button>
            </div>

            <div className="emp-modal-body" style={{ padding: "20px 24px" }}>
              {/* Profile Card Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  padding: "16px",
                  background: "linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.05))",
                  borderRadius: "14px",
                  border: "1px solid rgba(124, 58, 237, 0.15)",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "700",
                    boxShadow: "0 8px 16px rgba(79, 70, 229, 0.25)",
                  }}
                >
                  {viewEmployeeProfile.name?.charAt(0)?.toUpperCase() || "E"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "700", color: "#1e293b" }}>
                      {viewEmployeeProfile.name}
                    </h3>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background:
                          viewEmployeeProfile.status === "Inactive" ? "#fef2f2" : "#ecfdf5",
                        color:
                          viewEmployeeProfile.status === "Inactive" ? "#dc2626" : "#059669",
                        border:
                          viewEmployeeProfile.status === "Inactive"
                            ? "1px solid #fecaca"
                            : "1px solid #a7f3d0",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background:
                            viewEmployeeProfile.status === "Inactive" ? "#dc2626" : "#059669",
                        }}
                      />
                      {viewEmployeeProfile.status || "Active"}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
                    {viewEmployeeProfile.designation || "Staff Specialist"} • {viewEmployeeProfile.department || "General"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                    EMP Code: EMP-00{viewEmployeeProfile.id || viewEmployeeProfile._id?.slice(-4) || "01"}
                  </p>
                </div>
              </div>

              {/* Grid of details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                    Official Email
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "3px", wordBreak: "break-all" }}>
                    {viewEmployeeProfile.email || "—"}
                  </div>
                </div>

                <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                    Contact Phone
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "3px" }}>
                    {viewEmployeeProfile.phone || "+91 98765 43210"}
                  </div>
                </div>

                <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                    Department
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "3px" }}>
                    {viewEmployeeProfile.department || "Engineering"}
                  </div>
                </div>

                <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                    Date of Joining
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "3px" }}>
                    {viewEmployeeProfile.dateOfJoining || "2024-01-15"}
                  </div>
                </div>
              </div>

              {/* Compensation Box */}
              <div
                style={{
                  padding: "16px",
                  background: "#f0fdf4",
                  borderRadius: "12px",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600" }}>Monthly Gross Compensation</span>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#15803d", marginTop: "2px" }}>
                    ₹{Number(viewEmployeeProfile.salary || 65000).toLocaleString("en-IN")}
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const sal = Number(viewEmployeeProfile.salary || 65000);
                    setAdminPayslipEmployee({
                      ...viewEmployeeProfile,
                      baseSalary: Math.round(sal * 0.7),
                      hra: Math.round(sal * 0.2),
                      allowances: Math.round(sal * 0.1),
                      pf: Math.round(sal * 0.05),
                      tax: Math.round(sal * 0.05),
                      netSalary: Math.round(sal * 0.9),
                    });
                    setViewEmployeeProfile(null);
                  }}
                >
                  📄 View Payslip
                </button>
              </div>
            </div>

            <div className="emp-modal-footer">
              <button
                type="button"
                className="emp-cancel-btn"
                onClick={() => setViewEmployeeProfile(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="emp-primary-btn"
                onClick={() => {
                  handleEditEmployee(viewEmployeeProfile);
                  setViewEmployeeProfile(null);
                }}
              >
                Edit Employee Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SETTINGS MODALS ================= */}
      {settingsModal && (
        <div
          className="settings-modal-overlay"
          onClick={() => setSettingsModal(null)}
        >
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            {settingsModal === "manage" && (
              <>
                <div className="settings-modal-header">
                  <div>
                    <h2>Employee Management</h2>
                    <p>Quick shortcuts for employee operations</p>
                  </div>
                  <button
                    className="settings-modal-close"
                    onClick={() => setSettingsModal(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="settings-modal-body">
                  <div
                    className="manage-option"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSettingsModal(null);
                      setActivePage("Employees");
                    }}
                  >
                    <div className="manage-icon">
                      <UsersIcon width={18} height={18} />
                    </div>
                    <div>
                      <h3>Manage Employees</h3>
                      <p>View, search, edit, or delete existing employees</p>
                    </div>
                  </div>
                  <div
                    className="manage-option"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSettingsModal(null);
                      handleOpenAddForm();
                    }}
                  >
                    <div className="manage-icon">➕</div>
                    <div>
                      <h3>Add New Employee</h3>
                      <p>Register a new staff member to the organization</p>
                    </div>
                  </div>
                </div>
                <div className="settings-modal-footer">
                  <button
                    className="cancel-settings-btn"
                    onClick={() => setSettingsModal(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {settingsModal === "notifications" && (
              <>
                <div className="settings-modal-header">
                  <div>
                    <h2>Notification Settings</h2>
                    <p>Configure system notifications</p>
                  </div>
                  <button
                    className="settings-modal-close"
                    onClick={() => setSettingsModal(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="settings-modal-body">
                  <div className="notification-option">
                    <div>
                      <h3>Employee Notifications</h3>
                      <p>Receive notifications about employee activities</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="notification-option">
                    <div>
                      <h3>Leave Notifications</h3>
                      <p>Receive alerts when staff apply for leave</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="settings-modal-footer">
                  <button
                    className="cancel-settings-btn"
                    onClick={() => setSettingsModal(null)}
                  >
                    Close
                  </button>
                  <button
                    className="open-employees-btn"
                    onClick={() => {
                      alert("Notification settings saved!");
                      setSettingsModal(null);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}

            {settingsModal === "account" && (
              <>
                <div className="settings-modal-header">
                  <div>
                    <h2>Administrator Account</h2>
                    <p>Manage administrator details</p>
                  </div>
                  <button
                    className="settings-modal-close"
                    onClick={() => setSettingsModal(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="settings-modal-body">
                  <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "#eef2ff",
                        color: "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "20px",
                      }}
                    >
                      {user?.name ? user.name[0].toUpperCase() : "A"}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px" }}>{user?.name || "Administrator"}</h3>
                      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Role: Super Admin</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#475569", fontWeight: "600", marginBottom: "4px" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || "admin@ems.com"}
                        readOnly
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#475569", fontWeight: "600", marginBottom: "4px" }}>
                        Role
                      </label>
                      <input
                        type="text"
                        value="Super Administrator"
                        readOnly
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="settings-modal-footer">
                  <button
                    className="cancel-settings-btn"
                    onClick={() => setSettingsModal(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      <SupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        user={user}
      />

      {/* SHARE WORKPLACE MODAL */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        portalType="admin"
        user={user}
        activeTab={activePage}
      />

      {/* THEME CUSTOMIZATION MODAL */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={currentTheme}
        onSelectTheme={(tId) => {
          if (onSelectTheme) onSelectTheme(tId);
          showToast(`Theme updated to ${THEMES.find((t) => t.id === tId)?.name || tId}!`, "success");
        }}
        user={user}
      />
    </div>
  );
}

export default App;