import React, { useState, useMemo } from "react";
import "./EmployeesPage.css";

const DEPARTMENTS = [
  "All Departments",
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Design",
  "Support",
];

const STATUSES = ["All Statuses", "Active", "On Leave", "Probation", "Inactive"];

export default function EmployeesPage({
  employees = [],
  onOpenAddForm,
  onEditEmployee,
  onDeleteEmployee,
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Statuses");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
  const [viewEmployee, setViewEmployee] = useState(null);

  // Filtered & Sorted Employees
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch =
          emp.name?.toLowerCase().includes(search.toLowerCase()) ||
          emp.email?.toLowerCase().includes(search.toLowerCase()) ||
          emp.phone?.includes(search) ||
          emp.department?.toLowerCase().includes(search.toLowerCase()) ||
          emp.role?.toLowerCase().includes(search.toLowerCase());

        const matchesDept =
          department === "All Departments" || emp.department === department;

        const matchesStatus =
          status === "All Statuses" ||
          (emp.status || "Active").toLowerCase() === status.toLowerCase();

        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") {
          return (a.name || "").localeCompare(b.name || "");
        }
        if (sortBy === "name-desc") {
          return (b.name || "").localeCompare(a.name || "");
        }
        if (sortBy === "salary-desc") {
          return Number(b.salary || 0) - Number(a.salary || 0);
        }
        if (sortBy === "salary-asc") {
          return Number(a.salary || 0) - Number(b.salary || 0);
        }
        if (sortBy === "newest") {
          return (b._id || "").localeCompare(a._id || "");
        }
        return 0;
      });
  }, [employees, search, department, status, sortBy]);

  // Statistics
  const totalCount = employees.length;
  const activeCount = employees.filter(
    (e) => (e.status || "Active").toLowerCase() === "active"
  ).length;
  const uniqueDepts = new Set(
    employees.map((e) => e.department).filter(Boolean)
  ).size;
  const totalPayroll = employees.reduce(
    (sum, e) => sum + Number(e.salary || 0),
    0
  );

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) {
      alert("No employees to export.");
      return;
    }

    const headers = [
      "Employee ID",
      "Name",
      "Email",
      "Phone",
      "Department",
      "Role",
      "Salary (INR)",
      "Status",
    ];

    const rows = filteredEmployees.map((e) => [
      `EMP-${e._id?.slice(-3).toUpperCase() || "N/A"}`,
      `"${e.name || ""}"`,
      `"${e.email || ""}"`,
      `"${e.phone || ""}"`,
      `"${e.department || ""}"`,
      `"${e.role || "Staff"}"`,
      e.salary || 0,
      `"${e.status || "Active"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `employees_directory_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Statuses");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    search !== "" ||
    department !== "All Departments" ||
    status !== "All Statuses" ||
    sortBy !== "name-asc";

  return (
    <div className="employees-page">
      {/* PAGE HEADER */}
      <div className="emp-page-header">
        <div className="emp-header-left">
          <div className="emp-header-badge">👥</div>
          <div>
            <h1>Employee Directory</h1>
            <p>
              Manage, search, monitor, and export organizational workforce data
            </p>
          </div>
        </div>

        <div className="emp-header-actions">
          <button
            type="button"
            className="emp-export-btn"
            onClick={handleExportCSV}
            title="Download CSV file of current employee list"
          >
            <span>📥</span> Export CSV
          </button>

          <button
            type="button"
            className="emp-add-primary-btn"
            onClick={onOpenAddForm}
          >
            <span>+</span> Add Employee
          </button>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="emp-metrics-grid">
        <div className="metric-box blue">
          <div className="metric-icon">👥</div>
          <div>
            <span className="metric-label">Total Workforce</span>
            <h3 className="metric-value">{totalCount}</h3>
            <span className="metric-sub">Registered Staff</span>
          </div>
        </div>

        <div className="metric-box green">
          <div className="metric-icon">✓</div>
          <div>
            <span className="metric-label">Active Members</span>
            <h3 className="metric-value">{activeCount}</h3>
            <span className="metric-sub">
              {totalCount > 0
                ? `${Math.round((activeCount / totalCount) * 100)}% active rate`
                : "No data"}
            </span>
          </div>
        </div>

        <div className="metric-box purple">
          <div className="metric-icon">🏢</div>
          <div>
            <span className="metric-label">Departments</span>
            <h3 className="metric-value">{uniqueDepts}</h3>
            <span className="metric-sub">Active Units</span>
          </div>
        </div>

        <div className="metric-box orange">
          <div className="metric-icon">₹</div>
          <div>
            <span className="metric-label">Monthly Payroll</span>
            <h3 className="metric-value">
              ₹{totalPayroll.toLocaleString("en-IN")}
            </h3>
            <span className="metric-sub">Total Disbursal</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="emp-toolbar-card">
        {/* SEARCH BAR */}
        <div className="emp-search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, phone, role, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="emp-filters-group">
          {/* Department Filter */}
          <div className="filter-select-wrap">
            <label>Dept:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-select-wrap">
            <label>Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="filter-select-wrap">
            <label>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="salary-desc">Salary (High → Low)</option>
              <option value="salary-asc">Salary (Low → High)</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all search filters"
            >
              <span>↺</span> Reset
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="view-toggle-wrap">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              📋 Table
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Card Grid View"
            >
              🪪 Grid
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <div className="emp-results-bar">
        <span>
          Showing <strong>{filteredEmployees.length}</strong> of{" "}
          <strong>{totalCount}</strong> employees
        </span>
      </div>

      {/* MAIN CONTENT AREA */}
      {filteredEmployees.length === 0 ? (
        <div className="emp-empty-state">
          <div className="emp-empty-icon">👥</div>
          <h3>No Employees Found</h3>
          <p>
            {hasActiveFilters
              ? "No employees match your current filter criteria. Try adjusting or clearing your filters."
              : "No employees in the database. Click '+ Add Employee' to onboard your first team member."}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="emp-empty-btn"
              onClick={handleResetFilters}
            >
              Clear Filters
            </button>
          ) : (
            <button
              type="button"
              className="emp-empty-btn"
              onClick={onOpenAddForm}
            >
              + Add First Employee
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="emp-directory-table-card">
          <div className="emp-table-container">
            <table className="emp-directory-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>ROLE & DEPT</th>
                  <th>CONTACT INFO</th>
                  <th>MONTHLY SALARY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const empStatus = emp.status || "Active";
                  const statusClass = empStatus.toLowerCase().replace(/\s+/g, "-");

                  return (
                    <tr key={emp._id}>
                      {/* Name & Avatar */}
                      <td>
                        <div
                          className="emp-profile-cell"
                          onClick={() => setViewEmployee(emp)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="emp-cell-avatar">
                            {emp.name?.charAt(0).toUpperCase() || "E"}
                          </div>
                          <div>
                            <strong className="emp-cell-name">
                              {emp.name}
                            </strong>
                            <span className="emp-cell-id">
                              EMP-{emp._id?.slice(-3).toUpperCase() || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td>
                        <div className="emp-role-cell">
                          <span className="emp-role-title">
                            {emp.role || "Staff Member"}
                          </span>
                          <span className="emp-dept-badge">
                            {emp.department || "General"}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="emp-contact-cell">
                          <span>✉️ {emp.email}</span>
                          <span>📞 {emp.phone || "N/A"}</span>
                        </div>
                      </td>

                      {/* Salary */}
                      <td>
                        <strong className="emp-salary-text">
                          ₹{Number(emp.salary || 0).toLocaleString("en-IN")}
                        </strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`emp-status-badge ${statusClass}`}>
                          <span className="status-indicator-dot"></span>
                          {empStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="emp-row-actions">
                          <button
                            type="button"
                            className="emp-icon-action view-action"
                            onClick={() => setViewEmployee(emp)}
                            title="View Profile Details"
                          >
                            👁️
                          </button>
                          <button
                            type="button"
                            className="emp-icon-action edit-action"
                            onClick={() => onEditEmployee(emp)}
                            title="Edit Employee"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="emp-icon-action delete-action"
                            onClick={() => onDeleteEmployee(emp._id)}
                            title="Delete Employee"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="emp-cards-grid">
          {filteredEmployees.map((emp) => {
            const empStatus = emp.status || "Active";
            const statusClass = empStatus.toLowerCase().replace(/\s+/g, "-");

            return (
              <div className="emp-id-card" key={emp._id}>
                <div className="emp-card-top">
                  <div className="emp-card-avatar">
                    {emp.name?.charAt(0).toUpperCase() || "E"}
                  </div>
                  <span className={`emp-status-badge ${statusClass}`}>
                    <span className="status-indicator-dot"></span>
                    {empStatus}
                  </span>
                </div>

                <div className="emp-card-details">
                  <h3 className="emp-card-name">{emp.name}</h3>
                  <span className="emp-card-role">
                    {emp.role || "Staff Member"}
                  </span>
                  <span className="emp-dept-pill">{emp.department}</span>

                  <div className="emp-card-contact-box">
                    <div>
                      <span>✉️</span>
                      <small>{emp.email}</small>
                    </div>
                    <div>
                      <span>📞</span>
                      <small>{emp.phone || "N/A"}</small>
                    </div>
                  </div>

                  <div className="emp-card-salary-box">
                    <span>Monthly Salary</span>
                    <strong>₹{Number(emp.salary || 0).toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                <div className="emp-card-actions">
                  <button
                    type="button"
                    className="card-action-btn view"
                    onClick={() => setViewEmployee(emp)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="card-action-btn edit"
                    onClick={() => onEditEmployee(emp)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="card-action-btn delete"
                    onClick={() => onDeleteEmployee(emp._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK VIEW DETAILS MODAL */}
      {viewEmployee && (
        <div
          className="emp-view-overlay"
          onMouseDown={() => setViewEmployee(null)}
        >
          <div
            className="emp-view-card"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="emp-view-header">
              <div className="emp-view-header-avatar">
                {viewEmployee.name?.charAt(0).toUpperCase() || "E"}
              </div>
              <button
                type="button"
                className="emp-view-close"
                onClick={() => setViewEmployee(null)}
              >
                ✕
              </button>
            </div>

            <div className="emp-view-body">
              <div className="emp-view-title-block">
                <h2>{viewEmployee.name}</h2>
                <span className="emp-view-role">
                  {viewEmployee.role || "Staff"}
                </span>
                <span className="emp-view-id">
                  Employee ID: EMP-{viewEmployee._id?.slice(-3).toUpperCase()}
                </span>
              </div>

              <div className="emp-view-info-grid">
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <strong className="info-value">
                    {viewEmployee.department || "General"}
                  </strong>
                </div>

                <div className="info-item">
                  <span className="info-label">Employment Status</span>
                  <strong className="info-value">
                    {viewEmployee.status || "Active"}
                  </strong>
                </div>

                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <strong className="info-value">{viewEmployee.email}</strong>
                </div>

                <div className="info-item">
                  <span className="info-label">Contact Phone</span>
                  <strong className="info-value">
                    {viewEmployee.phone || "N/A"}
                  </strong>
                </div>

                <div className="info-item">
                  <span className="info-label">Monthly Gross Salary</span>
                  <strong className="info-value salary-highlight">
                    ₹
                    {Number(viewEmployee.salary || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="info-item">
                  <span className="info-label">Annual Package (CTC)</span>
                  <strong className="info-value">
                    ₹
                    {(
                      Number(viewEmployee.salary || 0) * 12
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>

            <div className="emp-view-footer">
              <button
                type="button"
                className="emp-view-edit-btn"
                onClick={() => {
                  const emp = viewEmployee;
                  setViewEmployee(null);
                  onEditEmployee(emp);
                }}
              >
                ✏️ Edit Record
              </button>
              <button
                type="button"
                className="emp-view-close-btn"
                onClick={() => setViewEmployee(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
