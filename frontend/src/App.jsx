import { useEffect, useState, useCallback, useRef } from "react";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import SupportModal from "./components/SupportModal";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Login from "./Login";
import "./App.css";

const API_BASE = "http://localhost:5000/api";
const API_URL = `${API_BASE}/employees`;

const NAV_ITEMS = [
  { id: "Dashboard", label: "Dashboard", icon: "⌂" },
  { id: "Employees", label: "Employees", icon: "👥" },
  { id: "Attendance", label: "Attendance", icon: "📅" },
  { id: "LeaveRequests", label: "Leave Requests", icon: "📝" },
  { id: "Payroll", label: "Payroll", icon: "💳" },
  { id: "Departments", label: "Departments", icon: "🏢" },
  { id: "Reports", label: "Reports", icon: "📊" },
  { id: "Settings", label: "Settings", icon: "⚙" },
];

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

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem("ems_user", JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("ems_user");
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Not logged in -> Show Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Role-Based Routing
  // Admin Login -> Redirect to Admin Dashboard
  if (user.role === "admin") {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Employee Login -> Redirect to Employee Dashboard
  if (user.role === "employee") {
    return <EmployeeDashboard user={user} onLogout={handleLogout} />;
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
        <div className="access-shield-icon">🛡️</div>
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
function AdminDashboard({ user, onLogout }) {
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

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [editEmployee, setEditEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [showForm, setShowForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [settingsModal, setSettingsModal] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [adminPayslipEmployee, setAdminPayslipEmployee] = useState(null);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [customDepartments, setCustomDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");

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
    setEditEmployee(null);
    setShowForm(true);
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add employee");

      await getEmployees();
      await getPayroll();
      handleCloseForm();
      setActivePage("Employees");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert(error.message || "Unable to add employee.");
    }
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

  // Search filter
  const filteredEmployees = employees.filter((employee) =>
    employee.name?.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="employee-title-icon">👥</div>
          <div>
            <h2>Employee Management</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <button type="button" className="add-btn" onClick={handleOpenAddForm}>
          + Add Employee
        </button>
      </div>

      <div className="employee-search">
        <div className="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search employee by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="filter-btn"
          onClick={() => setActivePage("Employees")}
        >
          ⚙ View Advanced Filters
        </button>
      </div>

      <EmployeeList
        employees={filteredEmployees}
        setEditEmployee={handleEditEmployee}
        deleteEmployee={deleteEmployee}
      />
    </section>
  );

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-box">EM</div>
          <div>
            <h2>EMPLOYEE</h2>
            <p>Management System</p>
          </div>
        </div>

        <div
          style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#a5b4fc",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "18px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>🛡️</span> Administrator Portal
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((nav) => (
            <button
              key={nav.id}
              type="button"
              className={`nav-item ${activePage === nav.id ? "active" : ""}`}
              onClick={() => handlePageChange(nav.id)}
            >
              <span>{nav.icon}</span>
              {nav.label}
              {nav.id === "LeaveRequests" && pendingLeavesCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#f59e0b",
                    color: "white",
                    padding: "2px 7px",
                    borderRadius: "10px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {pendingLeavesCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="help-box">
          <div className="help-icon">💡</div>
          <h3>Need Help?</h3>
          <p>Contact support for assistance.</p>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            style={{ cursor: "pointer" }}
          >
            Contact Support
          </button>
        </div>

        <div className="sidebar-footer">
          <p>© 2026 Employee Management</p>
          <span>v2.0.0 • Admin</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="top-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActivePage("Employees");
              }}
            />
          </div>

          <div className="admin-section">
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🛡️ Super Admin
            </span>

            <div
              className="notification"
              onClick={() => setSettingsModal("notifications")}
              style={{ cursor: "pointer" }}
              title="Notifications"
            >
              🔔<span></span>
            </div>

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
                    <span className="menu-icon">⚙</span>
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
                <h1>Administrator Dashboard</h1>
                <p>Real-time analytics, organizational metrics, and quick management controls</p>
              </div>

              <div className="stats-grid">
                <div
                  className="stat-card blue"
                  style={{ cursor: "pointer" }}
                  onClick={() => setActivePage("Employees")}
                >
                  <div className="stat-icon">👥</div>
                  <div>
                    <p>Total Employees</p>
                    <h2>{totalEmployees}</h2>
                    <span>Click to manage employees →</span>
                  </div>
                </div>

                <div
                  className="stat-card purple"
                  style={{ cursor: "pointer" }}
                  onClick={() => setActivePage("Departments")}
                >
                  <div className="stat-icon">🏢</div>
                  <div>
                    <p>Departments</p>
                    <h2>{departmentCount}</h2>
                    <span>Click to view departments →</span>
                  </div>
                </div>

                <div
                  className="stat-card green"
                  style={{ cursor: "pointer" }}
                  onClick={() => setActivePage("Payroll")}
                >
                  <div className="stat-icon">₹</div>
                  <div>
                    <p>Monthly Payroll</p>
                    <h2>₹{totalSalary.toLocaleString("en-IN")}</h2>
                    <span>Click to manage payroll →</span>
                  </div>
                </div>

                <div
                  className="stat-card orange"
                  style={{ cursor: "pointer" }}
                  onClick={() => setActivePage("LeaveRequests")}
                >
                  <div className="stat-icon">📝</div>
                  <div>
                    <p>Pending Leaves</p>
                    <h2>{pendingLeavesCount}</h2>
                    <span>Review leave requests →</span>
                  </div>
                </div>
              </div>

              {renderEmployeeSection("View, add, edit and manage organization staff")}

              {/* REPORTS BOX */}
              <section className="dashboard-reports">
                <div className="reports-header">
                  <div>
                    <h2>Reports & Analytics</h2>
                    <p>Quick overview of your organizational performance and health</p>
                  </div>
                  <button
                    className="view-reports-btn"
                    onClick={() => setActivePage("Reports")}
                  >
                    View Full Reports →
                  </button>
                </div>

                <div className="report-box-grid">
                  <div className="report-box employee-report">
                    <div className="report-box-icon">👥</div>
                    <div className="report-box-content">
                      <span>Total Employees</span>
                      <h3>{totalEmployees}</h3>
                      <small>Registered organization members</small>
                    </div>
                  </div>

                  <div className="report-box department-report">
                    <div className="report-box-icon">🏢</div>
                    <div className="report-box-content">
                      <span>Departments</span>
                      <h3>{departmentCount}</h3>
                      <small>Operational departments</small>
                    </div>
                  </div>

                  <div className="report-box salary-report">
                    <div className="report-box-icon">₹</div>
                    <div className="report-box-content">
                      <span>Monthly Payroll</span>
                      <h3>₹{totalSalary.toLocaleString("en-IN")}</h3>
                      <small>Total base salary expenditure</small>
                    </div>
                  </div>

                  <div className="report-box status-report">
                    <div className="report-box-icon">✓</div>
                    <div className="report-box-content">
                      <span>Active Staff</span>
                      <h3>{activeEmployees}</h3>
                      <small>Currently active employees</small>
                    </div>
                  </div>
                </div>
              </section>
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

          {/* ================= 3. ATTENDANCE ================= */}
          {activePage === "Attendance" && (
            <>
              <div className="page-heading">
                <h1>Attendance Management</h1>
                <p>Monitor real-time employee check-ins, punctuality, and attendance status</p>
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

          {/* ================= 7. REPORTS ================= */}
          {activePage === "Reports" && (
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
                    <h1>Organizational Reports & Analytics</h1>
                    <p>Comprehensive breakdown of headcount, payroll distribution and attendance</p>
                  </div>
                  <button
                    type="button"
                    className="emp-primary-btn"
                    onClick={() => window.print()}
                  >
                    🖨 Print / Export Report
                  </button>
                </div>
              </div>

              <div className="reports-grid">
                <div className="report-card">
                  <span>👥</span>
                  <h2>{totalEmployees}</h2>
                  <p>Total Headcount</p>
                </div>

                <div className="report-card">
                  <span>🏢</span>
                  <h2>{departmentCount}</h2>
                  <p>Active Departments</p>
                </div>

                <div className="report-card">
                  <span>₹</span>
                  <h2>₹{totalSalary.toLocaleString("en-IN")}</h2>
                  <p>Monthly Payroll</p>
                </div>

                <div className="report-card">
                  <span>✓</span>
                  <h2>{activeEmployees}</h2>
                  <p>Active Employees</p>
                </div>
              </div>

              <div className="report-table">
                <h2>Consolidated Staff Report</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Salary (INR)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp._id}>
                        <td><strong>{emp.name}</strong></td>
                        <td>{emp.email}</td>
                        <td>{emp.phone || "--"}</td>
                        <td>{emp.department}</td>
                        <td>{emp.designation || "Staff"}</td>
                        <td>₹{Number(emp.salary || 0).toLocaleString("en-IN")}</td>
                        <td>
                          <span className="status-badge present">
                            {emp.status || "Active"}
                          </span>
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
                <p>Manage system preferences and administrator account</p>
              </div>

              <div className="settings-card">
                <div className="settings-header">
                  <div>
                    <h2>Application Settings</h2>
                    <p>Configure system preferences and administrator security</p>
                  </div>
                  <div className="settings-icon">⚙</div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-row-icon employee-setting">👥</div>
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
                    <div className="setting-row-icon notification-setting">🔔</div>
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
                    <div className="setting-row-icon account-setting">👤</div>
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
      </main>

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
                    <div className="manage-icon">👥</div>
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
    </div>
  );
}

export default App;