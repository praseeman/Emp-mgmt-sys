import React, { useState } from "react";
import "./AddEmployeePage.css";
import {
  UserPlusIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  MapPinIcon,
  BriefcaseIcon,
  EyeIcon,
  InfoIcon,
  ArrowLeftIcon,
  AlertTriangleIcon,
  ZapIcon,
} from "../components/Icons";

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
  { value: "Probation", label: "Probation", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { value: "On Leave", label: "On Leave", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { value: "Inactive", label: "Inactive", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
];

export default function AddEmployeePage({
  adminUser,
  onAddEmployee,
  onCancel,
  onNavigateToDirectory,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "",
    salary: "",
    status: "Active",
    joinDate: new Date().toISOString().split("T")[0],
    address: "",
    emergencyContact: "",
    adminEmail: adminUser?.email || "sppraseeman@gmail.com",
    adminPhone: adminUser?.phone || "8248070608",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (status) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errs.phone = "Contact number is required";
    } else if (formData.phone.trim().length < 7) {
      errs.phone = "Enter a valid contact phone number";
    }

    if (!formData.department) errs.department = "Department is required";
    if (!formData.designation.trim()) errs.designation = "Job role / designation is required";

    if (!formData.salary || Number(formData.salary) <= 0) {
      errs.salary = "Please enter a valid monthly salary";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        designation: formData.designation.trim(),
        role: formData.designation.trim(),
        salary: Number(formData.salary),
        status: formData.status,
        joinDate: formData.joinDate,
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        adminEmail: formData.adminEmail || adminUser?.email || "sppraseeman@gmail.com",
        adminPhone: formData.adminPhone || adminUser?.phone || "8248070608",
      };

      await onAddEmployee(payload);
      setSuccessMessage(`Employee "${payload.name}" has been registered successfully!`);
      
      // Auto-navigate to directory after 1.5s
      setTimeout(() => {
        if (onNavigateToDirectory) {
          onNavigateToDirectory();
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrors({ form: err.message || "Failed to add employee" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreFillDemo = () => {
    const demoEmployees = [
      {
        name: "Karthik Subramanian",
        email: "karthik.s@ems.com",
        phone: "9840123456",
        department: "Engineering",
        designation: "Senior Full-Stack Developer",
        salary: "75000",
        address: "12, Anna Nagar West, Chennai",
        emergencyContact: "9840199999 (Father)",
      },
      {
        name: "Ananya Deshmukh",
        email: "ananya.d@ems.com",
        phone: "9167823451",
        department: "Design",
        designation: "Senior UI/UX Specialist",
        salary: "68000",
        address: "Flat 304, Green Heights, Pune",
        emergencyContact: "9167800000 (Spouse)",
      },
      {
        name: "Rohan Varma",
        email: "rohan.v@ems.com",
        phone: "9988776655",
        department: "Finance",
        designation: "Accounts & Payroll Manager",
        salary: "72000",
        address: "7A, Banjara Hills, Hyderabad",
        emergencyContact: "9988700000 (Brother)",
      },
    ];

    const pick = demoEmployees[Math.floor(Math.random() * demoEmployees.length)];
    setFormData((prev) => ({
      ...prev,
      ...pick,
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    }));
    setErrors({});
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "Engineering",
      designation: "",
      salary: "",
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
      address: "",
      emergencyContact: "",
      adminEmail: adminUser?.email || "sppraseeman@gmail.com",
      adminPhone: adminUser?.phone || "8248070608",
    });
    setErrors({});
    setSuccessMessage("");
  };

  const getInitials = (fullName) => {
    if (!fullName) return "EM";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="add-emp-page">
      {/* PAGE HEADER */}
      <div className="add-emp-header">
        <div className="add-emp-header-left">
          <div className="add-emp-header-badge">
            <UserPlusIcon width={22} height={22} />
          </div>
          <div>
            <h1>Add New Employee</h1>
            <p>Onboard and register workforce member into organization records</p>
          </div>
        </div>

        <div className="add-emp-header-actions">
          <button
            type="button"
            className="demo-fill-btn"
            onClick={handlePreFillDemo}
            title="Auto-fill sample data for quick testing"
          >
            <ZapIcon width={14} height={14} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
            Auto-Fill Sample Data
          </button>
          <button
            type="button"
            className="back-directory-btn"
            onClick={onNavigateToDirectory}
          >
            <ArrowLeftIcon width={14} height={14} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
            Back to Directory
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="add-emp-success-banner">
          <div className="success-icon">
            <CheckCircleIcon width={22} height={22} />
          </div>
          <div>
            <h3>Employee Added Successfully!</h3>
            <p>{successMessage} Redirecting to Employee Directory...</p>
          </div>
          <button
            type="button"
            className="success-view-btn"
            onClick={onNavigateToDirectory}
          >
            View in Directory →
          </button>
        </div>
      )}

      {/* ADMIN AUTHORIZER CALLOUT */}
      <div className="admin-authorizer-strip">
        <div className="admin-authorizer-left">
          <div className="admin-shield-icon">
            <ShieldIcon width={20} height={20} />
          </div>
          <div>
            <div className="authorizer-title">
              Authorized Administrator: <strong>{adminUser?.name || "Praseeman (System Admin)"}</strong>
              <span className="authorizer-pill">HR & Admin Access</span>
            </div>
            <div className="authorizer-meta">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <MailIcon width={13} height={13} /> Admin Email: <strong>{adminUser?.email || "sppraseeman@gmail.com"}</strong>
              </span>
              <span>•</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <PhoneIcon width={13} height={13} /> Admin Contact: <strong>{adminUser?.phone || "8248070608"}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="authorizer-note">
          New employee will be registered under this administrator's organization tree.
        </div>
      </div>

      {/* MAIN LAYOUT: FORM + LIVE PREVIEW */}
      <div className="add-emp-layout">
        {/* FORM CONTAINER */}
        <div className="add-emp-form-card">
          <form onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="add-emp-error-box">
                <AlertTriangleIcon width={16} height={16} style={{ marginRight: 8, flexShrink: 0 }} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* SECTION 1: Personal & Contact */}
            <div className="form-section-header">
              <span className="section-step">1</span>
              <div>
                <h2>Personal & Contact Information</h2>
                <p>Employee identification and primary contact details</p>
              </div>
            </div>

            <div className="form-grid-2">
              {/* Full Name */}
              <div className={`form-field ${errors.name ? "has-error" : ""}`}>
                <label>
                  Full Name <span className="req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon">
                    <UserIcon width={15} height={15} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    autoFocus
                  />
                </div>
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Employee Email */}
              <div className={`form-field ${errors.email ? "has-error" : ""}`}>
                <label>
                  Employee Email Address <span className="req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon">
                    <MailIcon width={15} height={15} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. rahul.sharma@company.com"
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              {/* Employee Contact Number */}
              <div className={`form-field ${errors.phone ? "has-error" : ""}`}>
                <label>
                  Contact Number (Phone) <span className="req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon">
                    <PhoneIcon width={15} height={15} />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                  />
                </div>
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              {/* Emergency Contact */}
              <div className="form-field">
                <label>Emergency Contact (Optional)</label>
                <div className="input-group">
                  <span className="input-icon">
                    <PhoneIcon width={15} height={15} />
                  </span>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="e.g. 9876500000 (Spouse/Parent)"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="form-field">
              <label>Residential Address / Location (Optional)</label>
              <div className="input-group">
                <span className="input-icon">
                  <MapPinIcon width={15} height={15} />
                </span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Flat 402, Cyber Heights, Bangalore"
                />
              </div>
            </div>

            {/* SECTION 2: Role & Department */}
            <div className="form-section-header" style={{ marginTop: "28px" }}>
              <span className="section-step">2</span>
              <div>
                <h2>Position, Department & Compensation</h2>
                <p>Organizational placement, designation, and compensation details</p>
              </div>
            </div>

            <div className="form-grid-2">
              {/* Department */}
              <div className={`form-field ${errors.department ? "has-error" : ""}`}>
                <label>
                  Department <span className="req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon">
                    <BuildingIcon width={15} height={15} />
                  </span>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept} Department
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <span className="error-text">{errors.department}</span>
                )}
              </div>

              {/* Job Designation */}
              <div className={`form-field ${errors.designation ? "has-error" : ""}`}>
                <label>
                  Job Title / Designation <span className="req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon">
                    <BriefcaseIcon width={15} height={15} />
                  </span>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                {errors.designation && (
                  <span className="error-text">{errors.designation}</span>
                )}
              </div>
            </div>

            <div className="form-grid-2">
              {/* Monthly Salary */}
              <div className={`form-field ${errors.salary ? "has-error" : ""}`}>
                <label>
                  Monthly Base Salary (₹ INR) <span className="req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon currency">₹</span>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 65000"
                    min="0"
                    step="500"
                  />
                </div>
                {errors.salary && <span className="error-text">{errors.salary}</span>}
              </div>

              {/* Joining Date */}
              <div className="form-field">
                <label>Date of Joining</label>
                <div className="input-group">
                  <span className="input-icon">
                    <CalendarIcon width={15} height={15} />
                  </span>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Employment Status Selector */}
            <div className="form-field" style={{ marginTop: "12px" }}>
              <label>Employment Status</label>
              <div className="status-pill-row">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = formData.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`status-btn-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => handleStatusChange(opt.value)}
                      style={{
                        "--color": opt.color,
                        "--bg": opt.bg,
                        "--border": opt.border,
                      }}
                    >
                      <span className="status-indicator-dot"></span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Admin & Supervisor Reference */}
            <div className="form-section-header" style={{ marginTop: "28px" }}>
              <span className="section-step">3</span>
              <div>
                <h2>Admin & Reporting Reference</h2>
                <p>Administrator email and contact number linking this employee record</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Admin Email (Authorizer)</label>
                <div className="input-group">
                  <span className="input-icon">
                    <ShieldIcon width={15} height={15} />
                  </span>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="sppraseeman@gmail.com"
                  />
                </div>
                <small className="field-hint">
                  Email of the administrator responsible for onboarding
                </small>
              </div>

              <div className="form-field">
                <label>Admin Contact Number</label>
                <div className="input-group">
                  <span className="input-icon">
                    <PhoneIcon width={15} height={15} />
                  </span>
                  <input
                    type="tel"
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleChange}
                    placeholder="8248070608"
                  />
                </div>
                <small className="field-hint">
                  Admin contact number for management records
                </small>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="form-footer-actions">
              <button
                type="button"
                className="btn-form-reset"
                onClick={handleReset}
                disabled={submitting}
              >
                Reset Form
              </button>

              <div className="right-action-group">
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={onCancel || onNavigateToDirectory}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="submit-spinner"></span>
                      Saving Employee...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon width={15} height={15} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                      <span>Add & Onboard Employee</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE DIGITAL ID CARD PREVIEW */}
        <div className="add-emp-preview-col">
          <div className="preview-sticky-wrap">
            <div className="preview-header-label">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <EyeIcon width={15} height={15} />
                Live Employee Card Preview
              </span>
              <small>Updates in real-time as you type</small>
            </div>

            {/* ID CARD */}
            <div className="employee-preview-card">
              <div className="card-top-pattern">
                <div className="card-brand-badge">EM CORPORATE ID</div>
                <span
                  className="card-status-badge"
                  style={{
                    backgroundColor:
                      STATUS_OPTIONS.find((s) => s.value === formData.status)?.bg || "#ecfdf5",
                    color:
                      STATUS_OPTIONS.find((s) => s.value === formData.status)?.color || "#10b981",
                    border: `1px solid ${
                      STATUS_OPTIONS.find((s) => s.value === formData.status)?.border || "#a7f3d0"
                    }`,
                  }}
                >
                  {formData.status}
                </span>
              </div>

              <div className="card-avatar-wrap">
                <div className="card-avatar">
                  {getInitials(formData.name)}
                </div>
                <div>
                  <h3 className="card-emp-name">
                    {formData.name.trim() || "Employee Name"}
                  </h3>
                  <p className="card-emp-role">
                    {formData.designation.trim() || "Designation / Role"}
                  </p>
                  <span className="card-dept-tag">
                    {formData.department || "Department"}
                  </span>
                </div>
              </div>

              <div className="card-divider"></div>

              <div className="card-details-list">
                <div className="card-detail-item">
                  <span className="detail-icon">
                    <MailIcon width={13} height={13} />
                  </span>
                  <div>
                    <small>Email</small>
                    <strong>{formData.email.trim() || "employee@company.com"}</strong>
                  </div>
                </div>

                <div className="card-detail-item">
                  <span className="detail-icon">
                    <PhoneIcon width={13} height={13} />
                  </span>
                  <div>
                    <small>Contact Number</small>
                    <strong>{formData.phone.trim() || "+91 98765 43210"}</strong>
                  </div>
                </div>

                <div className="card-detail-item">
                  <span className="detail-icon">₹</span>
                  <div>
                    <small>Monthly Salary</small>
                    <strong>
                      {formData.salary
                        ? `₹${Number(formData.salary).toLocaleString("en-IN")}`
                        : "₹--"}
                    </strong>
                  </div>
                </div>

                <div className="card-detail-item">
                  <span className="detail-icon">
                    <CalendarIcon width={13} height={13} />
                  </span>
                  <div>
                    <small>Join Date</small>
                    <strong>{formData.joinDate || "Today"}</strong>
                  </div>
                </div>
              </div>

              <div className="card-admin-footer">
                <div className="admin-stamp-icon">
                  <ShieldIcon width={16} height={16} />
                </div>
                <div>
                  <small>Authorizing Admin</small>
                  <strong>{formData.adminEmail || "sppraseeman@gmail.com"}</strong>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Tel: {formData.adminPhone || "8248070608"}
                  </div>
                </div>
              </div>
            </div>

            {/* HELPFUL TIPS CARD */}
            <div className="preview-tips-box">
              <h4>
                <InfoIcon width={15} height={15} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                Administrator Guidelines
              </h4>
              <ul>
                <li><strong>Admin Email & Phone:</strong> Linking admin details ensures accountability and audit tracking.</li>
                <li><strong>Instant Activation:</strong> Once added, employee credentials immediately work on the Employee Portal.</li>
                <li><strong>Export & Payroll:</strong> The new employee will immediately appear in Attendance and Payroll statements.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
