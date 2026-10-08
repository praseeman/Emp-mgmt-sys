import { useEffect, useState, useCallback, useRef } from "react";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import Login from "./Login";
import "./App.css";

const API_URL = "http://localhost:5000/api/employees";

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

  // ---------- Login Gate ----------
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // ---------- Logged-in App ----------
  return <DashboardApp user={user} onLogout={handleLogout} />;
}

/* ==================================================
   DASHBOARD
================================================== */
function DashboardApp({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [showForm, setShowForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [settingsModal, setSettingsModal] = useState(null);

  // Ref for closing the dropdown on outside click
  const userMenuRef = useRef(null);

  // Fetch employees list
  const getEmployees = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, []);

  useEffect(() => {
    getEmployees();
  }, [getEmployees]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form Handlers
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

  // API Actions
  const addEmployee = async (employee) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add employee");
      }

      await getEmployees();
      handleCloseForm();
      setActivePage("Employees");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert(
        error.message || "Unable to add employee. Please check your backend."
      );
    }
  };

  const updateEmployee = async (employee) => {
    try {
      if (!editEmployee?._id) {
        console.error("Employee ID not found");
        return;
      }

      const response = await fetch(`${API_URL}/${editEmployee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update employee");
      }

      await getEmployees();
      handleCloseForm();
    } catch (error) {
      console.error("Error updating employee:", error);
      alert(error.message || "Unable to update employee.");
    }
  };

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
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete employee");
      }

      await getEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.message || "Unable to delete employee.");
    }
  };

  // Search filter
  const filteredEmployees = employees.filter((employee) =>
    employee.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Derived Dashboard Stats
  const totalEmployees = employees.length;

  const departments = [
    ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
  ];

  const departmentCount = departments.length;

  const totalSalary = employees.reduce(
    (total, emp) => total + Number(emp.salary || 0),
    0
  );

  const activeEmployees = employees.filter(
    (emp) => emp.status === "Active" || emp.status === undefined
  ).length;

  // Navigation
  const handlePageChange = (page) => {
    setActivePage(page);
    if (page !== "Employees") {
      setSearch("");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout?.();
  };

  // Reusable Employee Card Component
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
        <button type="button" className="filter-btn">
          ⚙ Filter
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
            </button>
          ))}
        </nav>

        <div className="help-box">
          <div className="help-icon">💡</div>
          <h3>Need Help?</h3>
          <p>Contact support for assistance.</p>
          <button type="button">Contact Support</button>
        </div>

        <div className="sidebar-footer">
          <p>© 2026 Employee Management</p>
          <span>v1.0.0</span>
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
                {user?.email ? user.email[0].toUpperCase() : "A"}
              </div>

              <div className="admin-info">
                <strong>
                  {user?.email ? user.email.split("@")[0] : "Admin"}
                </strong>
                <small>
                  {user?.role === "admin" ? "Administrator" : "User"}
                </small>
              </div>

              <div className="arrow">▼</div>

              {showUserMenu && (
                <div
                  className="user-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="user-menu-header">
                    <div className="user-menu-avatar">
                      {user?.email ? user.email[0].toUpperCase() : "A"}
                    </div>
                    <div>
                      <strong>
                        {user?.email ? user.email.split("@")[0] : "Admin"}
                      </strong>
                      <small>{user?.email || "admin@ems.com"}</small>
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
                    className="user-menu-item logout"
                    onClick={handleLogout}
                  >
                    <span className="menu-icon">⏻</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="content">
          {/* DASHBOARD */}
          {activePage === "Dashboard" && (
            <>
              <div className="page-heading">
                <h1>Dashboard</h1>
                <p>Manage and monitor your employees</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">👥</div>
                  <div>
                    <p>Total Employees</p>
                    <h2>{totalEmployees}</h2>
                    <span>↑ 12% from last month</span>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-icon">🏢</div>
                  <div>
                    <p>Departments</p>
                    <h2>{departmentCount}</h2>
                    <span>Active departments</span>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-icon">₹</div>
                  <div>
                    <p>Total Salary</p>
                    <h2>₹{totalSalary.toLocaleString("en-IN")}</h2>
                    <span>Monthly payroll</span>
                  </div>
                </div>

                <div className="stat-card orange">
                  <div className="stat-icon">✓</div>
                  <div>
                    <p>Active Employees</p>
                    <h2>{activeEmployees}</h2>
                    <span>Active employees</span>
                  </div>
                </div>
              </div>

              {renderEmployeeSection(
                "View, add, edit and manage your employees"
              )}

              {/* REPORTS BOX */}
              <section className="dashboard-reports">
                <div className="reports-header">
                  <div>
                    <h2>Reports & Analytics</h2>
                    <p>Quick overview of your employee data</p>
                  </div>

                  <button
                    className="view-reports-btn"
                    onClick={() => setActivePage("Reports")}
                  >
                    View Reports →
                  </button>
                </div>

                <div className="report-box-grid">
                  {/* Employee Report */}
                  <div className="report-box employee-report">
                    <div className="report-box-icon">👥</div>
                    <div className="report-box-content">
                      <span>Total Employees</span>
                      <h3>{totalEmployees}</h3>
                      <small>Employees in organization</small>
                    </div>
                  </div>

                  {/* Department Report */}
                  <div className="report-box department-report">
                    <div className="report-box-icon">🏢</div>
                    <div className="report-box-content">
                      <span>Departments</span>
                      <h3>{departmentCount}</h3>
                      <small>Active departments</small>
                    </div>
                  </div>

                  {/* Salary Report */}
                  <div className="report-box salary-report">
                    <div className="report-box-icon">₹</div>
                    <div className="report-box-content">
                      <span>Monthly Payroll</span>
                      <h3>₹{totalSalary.toLocaleString("en-IN")}</h3>
                      <small>Total monthly salary</small>
                    </div>
                  </div>

                  {/* Status Report */}
                  <div className="report-box status-report">
                    <div className="report-box-icon">✓</div>
                    <div className="report-box-content">
                      <span>Active Employees</span>
                      <h3>{activeEmployees}</h3>
                      <small>Currently active</small>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* EMPLOYEES */}
          {activePage === "Employees" && (
            <>
              <div className="page-heading">
                <h1>Employees</h1>
                <p>Manage all employees in your organization</p>
              </div>

              {renderEmployeeSection("Add, edit and delete employees")}
            </>
          )}

          {/* ATTENDANCE */}
          {activePage === "Attendance" && (
            <>
              <div className="page-heading">
                <h1>Attendance Management</h1>
                <p>Track daily employee attendance and check-ins</p>
              </div>

              <div className="report-table">
                <h2>Today's Attendance</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.name}</td>
                        <td>{emp.department || "N/A"}</td>
                        <td>09:00 AM</td>
                        <td>06:00 PM</td>
                        <td>
                          <span className="status-badge present">
                            Present
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* LEAVE REQUESTS */}
          {activePage === "LeaveRequests" && (
            <>
              <div className="page-heading">
                <h1>Leave Request Management</h1>
                <p>Review and manage employee leave applications</p>
              </div>

              <div className="report-table">
                <h2>Pending Leave Requests</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => {
                      const status = emp.leaveStatus || "Pending";

                      return (
                        <tr key={emp._id}>
                          <td>{emp.name}</td>
                          <td>Casual Leave</td>
                          <td>2026-10-10</td>
                          <td>2026-10-12</td>
                          <td>
                            <span
                              className={`status-badge ${status.toLowerCase()}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td>
                            {status === "Pending" ? (
                              <div className="leave-actions">
                                <button
                                  type="button"
                                  className="icon-btn approve-btn"
                                  title="Approve"
                                  onClick={() => {
                                    setEmployees((prev) =>
                                      prev.map((e) =>
                                        e._id === emp._id
                                          ? {
                                              ...e,
                                              leaveStatus: "Approved",
                                            }
                                          : e
                                      )
                                    );
                                  }}
                                >
                                  ✓
                                </button>

                                <button
                                  type="button"
                                  className="icon-btn reject-btn"
                                  title="Reject"
                                  onClick={() => {
                                    setEmployees((prev) =>
                                      prev.map((e) =>
                                        e._id === emp._id
                                          ? {
                                              ...e,
                                              leaveStatus: "Rejected",
                                            }
                                          : e
                                      )
                                    );
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: "13px",
                                  color: "#6b7280",
                                }}
                              >
                                Completed
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

          {/* PAYROLL */}
          {activePage === "Payroll" && (
            <>
              <div className="page-heading">
                <h1>Payroll Management</h1>
                <p>Calculate salaries, allowances, and issue payslips</p>
              </div>

              <div className="report-table">
                <h2>Monthly Payroll Summary</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Base Salary</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => {
                      const base = Number(emp.salary || 0);
                      const allowances = base * 0.1;
                      const deductions = base * 0.05;
                      const netSalary = base + allowances - deductions;

                      return (
                        <tr key={emp._id}>
                          <td>{emp.name}</td>
                          <td>₹{base.toLocaleString("en-IN")}</td>
                          <td>₹{allowances.toLocaleString("en-IN")}</td>
                          <td>₹{deductions.toLocaleString("en-IN")}</td>
                          <td>
                            <strong>
                              ₹{netSalary.toLocaleString("en-IN")}
                            </strong>
                          </td>
                          <td>
                            <span className="status-badge processed">
                              Paid
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* DEPARTMENTS */}
          {activePage === "Departments" && (
            <>
              <div className="page-heading">
                <h1>Departments</h1>
                <p>View employee departments</p>
              </div>

              <div className="department-grid">
                {departments.length === 0 ? (
                  <div className="empty-page">
                    <div>🏢</div>
                    <h2>No Departments Found</h2>
                    <p>Add employees with departments to see them here.</p>
                  </div>
                ) : (
                  departments.map((dept) => {
                    const count = employees.filter(
                      (emp) => emp.department === dept
                    ).length;

                    return (
                      <div className="department-card" key={dept}>
                        <div className="department-icon">🏢</div>
                        <h2>{dept}</h2>
                        <p>{count} Employees</p>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* REPORTS */}
          {activePage === "Reports" && (
            <>
              <div className="page-heading">
                <h1>Reports</h1>
                <p>Employee management reports</p>
              </div>

              <div className="reports-grid">
                <div className="report-card">
                  <span>👥</span>
                  <h2>{totalEmployees}</h2>
                  <p>Total Employees</p>
                </div>

                <div className="report-card">
                  <span>🏢</span>
                  <h2>{departmentCount}</h2>
                  <p>Total Departments</p>
                </div>

                <div className="report-card">
                  <span>₹</span>
                  <h2>₹{totalSalary.toLocaleString("en-IN")}</h2>
                  <p>Monthly Salary</p>
                </div>

                <div className="report-card">
                  <span>✓</span>
                  <h2>{activeEmployees}</h2>
                  <p>Active Employees</p>
                </div>
              </div>

              <div className="report-table">
                <h2>Employee Report</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>
                          ₹{Number(emp.salary || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* SETTINGS */}
          {activePage === "Settings" && (
            <>
              <div className="page-heading">
                <h1>Settings</h1>
                <p>Manage your application settings</p>
              </div>

              <div className="settings-card">
                <div className="settings-header">
                  <div>
                    <h2>Application Settings</h2>
                    <p>Configure system preferences and administrator account</p>
                  </div>
                  <div className="settings-icon">⚙</div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-row-icon employee-setting">👥</div>
                    <div>
                      <h3>Employee Management</h3>
                      <p>Manage employee information and records</p>
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
                      <p>Configure system notifications</p>
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
                      <h3>Account</h3>
                      <p>Manage administrator account</p>
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

      {/* FORM MODAL */}
      {showForm && (
        <EmployeeForm
          addEmployee={addEmployee}
          updateEmployee={updateEmployee}
          editEmployee={editEmployee}
          setEditEmployee={setEditEmployee}
          onClose={handleCloseForm}
        />
      )}

      {/* SETTINGS MODAL */}
      {settingsModal && (
        <div
          className="settings-modal-overlay"
          onClick={() => setSettingsModal(null)}
        >
          <div
            className="settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MANAGE OPTIONS */}
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

                  <div
                    className="manage-option"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSettingsModal(null);
                      setActivePage("Departments");
                    }}
                  >
                    <div className="manage-icon">🏢</div>
                    <div>
                      <h3>Department Structure</h3>
                      <p>Review organization departments and headcount</p>
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
                  <button
                    className="open-employees-btn"
                    onClick={() => {
                      setSettingsModal(null);
                      setActivePage("Employees");
                    }}
                  >
                    Go to Employees
                  </button>
                </div>
              </>
            )}

            {/* NOTIFICATIONS */}
            {settingsModal === "notifications" && (
              <>
                <div className="settings-modal-header">
                  <div>
                    <h2>Notification Settings</h2>
                    <p>Configure your system notifications</p>
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
                      <p>Receive notifications for leave requests</p>
                    </div>

                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-option">
                    <div>
                      <h3>Payroll Notifications</h3>
                      <p>Receive monthly payroll notifications</p>
                    </div>

                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-modal-footer">
                  <button
                    className="cancel-settings-btn"
                    onClick={() => setSettingsModal(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="open-employees-btn"
                    onClick={() => {
                      alert("Notification preferences saved successfully!");
                      setSettingsModal(null);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}

            {/* ACCOUNT */}
            {settingsModal === "account" && (
              <>
                <div className="settings-modal-header">
                  <div>
                    <h2>Administrator Account</h2>
                    <p>Manage your administrator account</p>
                  </div>

                  <button
                    className="settings-modal-close"
                    onClick={() => setSettingsModal(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="settings-modal-body">
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#eef2ff", color: "#5363e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "20px" }}>
                      {user?.name ? user.name[0].toUpperCase() : "A"}
                    </div>

                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "#17213b" }}>{user?.name || "Administrator"}</h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#718096" }}>{user?.role === "admin" ? "Super Admin" : "User"}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || "Administrator"}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d9e0ea", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>Email Address</label>
                      <input
                        type="email"
                        defaultValue={user?.email || "admin@ems.com"}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d9e0ea", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>Role</label>
                      <input
                        type="text"
                        value={user?.role === "admin" ? "Administrator" : "Staff"}
                        readOnly
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-modal-footer">
                  <button
                    className="cancel-settings-btn"
                    onClick={() => setSettingsModal(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="open-employees-btn"
                    onClick={() => {
                      alert("Account details updated successfully!");
                      setSettingsModal(null);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;