import React from "react";
import "./Employee.css";

function EmployeeList({
  employees,
  setEditEmployee,
  deleteEmployee,
}) {
  if (employees.length === 0) {
    return (
      <div className="empty-employees">
        <div className="empty-icon">👥</div>
        <h3>No Employees Found</h3>
        <p>Add an employee to see them here.</p>
      </div>
    );
  }

  return (
    <div className="employee-table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th>EMPLOYEE</th>
            <th>CONTACT</th>
            <th>DEPARTMENT</th>
            <th>SALARY</th>
            <th>STATUS</th>
            <th>ACTION</th>
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
                      EMP-{employee._id?.slice(-3).toUpperCase()}
                    </span>
                  </div>
                </div>
              </td>

              {/* CONTACT */}
              <td>
                <div className="contact-info">
                  <span>✉️ {employee.email}</span>
                  <span>📞 {employee.phone}</span>
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
                <strong className="salary-text">
                  ₹{Number(employee.salary || 0).toLocaleString("en-IN")}
                </strong>
              </td>

              {/* STATUS */}
              <td>
                <span className="status-badge">
                  <span className="status-dot"></span>
                  {employee.status || "Active"}
                </span>
              </td>

              {/* ACTION */}
              <td>
                <div className="employee-actions">

                  {/* EDIT BUTTON */}
                  <button
                    type="button"
                    className="action-btn edit-action"
                    onClick={() => setEditEmployee(employee)}
                    title="Edit Employee"
                  >
                    <span className="action-icon">✏️</span>
                    <span className="action-text">Edit</span>
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    className="action-btn delete-action"
                    onClick={() => deleteEmployee(employee._id)}
                    title="Delete Employee"
                  >
                    <span className="action-icon">🗑️</span>
                    <span className="action-text">Delete</span>
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