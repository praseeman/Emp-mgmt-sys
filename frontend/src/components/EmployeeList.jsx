import React from "react";
import { UsersIcon } from "./Icons";
import "./Employee.css";

function EmployeeList({
  employees,
  setEditEmployee,
  deleteEmployee,
  onViewEmployee,
}) {
  if (employees.length === 0) {
    return (
      <div className="empty-employees">
        <div className="empty-icon">
          <UsersIcon width={28} height={28} />
        </div>
        <h3>No Employees Found</h3>
        <p>No employee records matched your active search or filters.</p>
      </div>
    );
  }

  return (
    <div className="employee-table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Contact</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              {/* EMPLOYEE */}
              <td>
                <div className="employee-info">
                  <div className="employee-avatar">
                    {employee.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="employee-name">
                    <strong>{employee.name}</strong>
                    <span>
                      EMP-{employee._id?.slice(-4).toUpperCase()}
                    </span>
                  </div>
                </div>
              </td>

              {/* CONTACT */}
              <td>
                <div className="contact-info">
                  <div className="contact-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-svg-icon">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <span>{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="contact-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-svg-icon">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{employee.phone}</span>
                    </div>
                  )}
                </div>
              </td>

              {/* DEPARTMENT */}
              <td>
                <span className="department-badge">
                  {employee.department}
                </span>
              </td>

              {/* SALARY */}
              <td>
                <span className="salary-text">
                  ₹{Number(employee.salary || 0).toLocaleString("en-IN")}
                </span>
              </td>

              {/* STATUS */}
              <td>
                <span className={`status-badge status-${(employee.status || "active").toLowerCase().replace(" ", "-")}`}>
                  <span className="status-dot"></span>
                  {employee.status || "Active"}
                </span>
              </td>

              {/* ACTION */}
              <td>
                <div className="employee-actions">
                  {/* VIEW BUTTON */}
                  {onViewEmployee && (
                    <button
                      type="button"
                      className="action-btn view-action"
                      onClick={() => onViewEmployee(employee)}
                      title="View Complete Employee Profile"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <span>View</span>
                    </button>
                  )}

                  {/* EDIT BUTTON */}
                  <button
                    type="button"
                    className="action-btn edit-action"
                    onClick={() => setEditEmployee(employee)}
                    title="Edit Employee Details"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                    <span>Edit</span>
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    className="action-btn delete-action"
                    onClick={() => deleteEmployee(employee._id)}
                    title="Delete Employee"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="employee-count">
        Showing <strong>{employees.length}</strong>{" "}
        {employees.length === 1 ? "employee" : "employees"}
      </div>
    </div>
  );
}

export default EmployeeList;