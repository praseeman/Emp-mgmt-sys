import React, { useEffect, useState } from "react";
import "./Employee.css";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Design",
  "Support",
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
  { value: "On Leave", label: "On Leave", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { value: "Probation", label: "Probation", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { value: "Inactive", label: "Inactive", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
];

function EmployeeForm({
  addEmployee,
  updateEmployee,
  editEmployee,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    salary: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fill form when editing
  useEffect(() => {
    if (editEmployee) {
      setFormData({
        name: editEmployee.name || "",
        email: editEmployee.email || "",
        phone: editEmployee.phone || "",
        department: editEmployee.department || "",
        role: editEmployee.role || "",
        salary: editEmployee.salary ? String(editEmployee.salary) : "",
        status: editEmployee.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "",
        role: "",
        salary: "",
        status: "Active",
      });
    }
    setErrors({});
  }, [editEmployee]);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (status) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.department) newErrors.department = "Please select a department";
    if (!formData.salary || Number(formData.salary) <= 0) {
      newErrors.salary = "Please enter a valid salary";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        salary: Number(formData.salary),
        role: formData.role.trim() || "Staff",
      };

      if (editEmployee) {
        await updateEmployee(payload);
      } else {
        await addEmployee(payload);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setLoading(false);
    }
  };

  // Close form
  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      salary: "",
      status: "Active",
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="emp-modal-overlay" onMouseDown={handleCancel}>
      <div className="emp-modal-card" onMouseDown={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="emp-modal-header">
          <div className="emp-modal-header-left">
            <div className={`emp-modal-icon-badge ${editEmployee ? "edit-badge" : "add-badge"}`}>
              {editEmployee ? "✏️" : "👤"}
            </div>
            <div>
              <h2>{editEmployee ? "Edit Employee Profile" : "Add New Employee"}</h2>
              <p>
                {editEmployee
                  ? "Update workforce record and employee information below"
                  : "Fill in the required information to onboard a new employee"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="emp-modal-close-btn"
            onClick={handleCancel}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form className="emp-modern-form" onSubmit={handleSubmit}>
          {/* ROW 1: Full Name & Email */}
          <div className="emp-form-row">
            <div className={`emp-form-group ${errors.name ? "has-error" : ""}`}>
              <label>
                Full Name <span className="req-star">*</span>
              </label>
              <div className="emp-input-wrapper">
                <span className="emp-input-icon">👤</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Praseeman S"
                  autoFocus
                />
              </div>
              {errors.name && <span className="emp-field-error">{errors.name}</span>}
            </div>

            <div className={`emp-form-group ${errors.email ? "has-error" : ""}`}>
              <label>
                Email Address <span className="req-star">*</span>
              </label>
              <div className="emp-input-wrapper">
                <span className="emp-input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. praseeman@company.com"
                />
              </div>
              {errors.email && <span className="emp-field-error">{errors.email}</span>}
            </div>
          </div>

          {/* ROW 2: Phone & Department */}
          <div className="emp-form-row">
            <div className={`emp-form-group ${errors.phone ? "has-error" : ""}`}>
              <label>
                Phone Number <span className="req-star">*</span>
              </label>
              <div className="emp-input-wrapper">
                <span className="emp-input-icon">📞</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              {errors.phone && <span className="emp-field-error">{errors.phone}</span>}
            </div>

            <div className={`emp-form-group ${errors.department ? "has-error" : ""}`}>
              <label>
                Department <span className="req-star">*</span>
              </label>
              <div className="emp-input-wrapper">
                <span className="emp-input-icon">🏢</span>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department...</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <span className="emp-select-caret">▾</span>
              </div>
              {errors.department && (
                <span className="emp-field-error">{errors.department}</span>
              )}
            </div>
          </div>

          {/* ROW 3: Designation & Salary */}
          <div className="emp-form-row">
            <div className="emp-form-group">
              <label>
                Designation / Role
              </label>
              <div className="emp-input-wrapper">
                <span className="emp-input-icon">💼</span>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
            </div>

            <div className={`emp-form-group ${errors.salary ? "has-error" : ""}`}>
              <label>
                Monthly Salary <span className="req-star">*</span>
              </label>
              <div className="emp-input-wrapper">
                <span className="emp-input-icon emp-currency-icon">₹</span>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. 50,000"
                  min="0"
                  step="500"
                />
              </div>
              {errors.salary && <span className="emp-field-error">{errors.salary}</span>}
            </div>
          </div>

          {/* ROW 4: Status Selector */}
          <div className="emp-status-section">
            <label className="emp-status-label">Employment Status</label>
            <div className="emp-status-pill-group">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = formData.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`emp-status-pill ${isSelected ? "selected" : ""}`}
                    onClick={() => handleStatusChange(opt.value)}
                    style={{
                      "--pill-color": opt.color,
                      "--pill-bg": opt.bg,
                      "--pill-border": opt.border,
                    }}
                  >
                    <span className="emp-status-dot"></span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="emp-modal-footer">
            <div className="emp-form-hint">
              <span className="hint-icon">ℹ️</span> All fields with <span className="req-star">*</span> are required
            </div>

            <div className="emp-modal-btns">
              <button
                type="button"
                className="emp-btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="emp-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="emp-spinner"></span>
                    Saving Record...
                  </>
                ) : editEmployee ? (
                  <>
                    <span>✓</span> Update Employee
                  </>
                ) : (
                  <>
                    <span>+</span> Add Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;