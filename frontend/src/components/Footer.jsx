import React, { useState, useEffect } from "react";
import {
  ShieldIcon,
  HelpCircleIcon,
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  LockIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "./Icons";
import "./Footer.css";

const LEGAL_DOCS = {
  privacy: {
    title: "Privacy & Data Protection Policy",
    subtitle: "Enterprise compliance with workplace data protection standards",
    sections: [
      {
        heading: "1. Information Collected",
        text: "The Employee Management System maintains organizational identity records including employee names, designations, corporate email addresses, department affiliations, check-in timestamps, and compensation details strictly for internal payroll and workforce administration.",
      },
      {
        heading: "2. Data Protection & Encryption",
        text: "All employee records, salary slips, and attendance data are protected using standard encryption protocols in transit and at rest. Access permissions are partitioned using Role-Based Access Control (RBAC).",
      },
      {
        heading: "3. Retention & Authorized Access",
        text: "Only designated Human Resource administrators and authorized corporate officers hold privileges to inspect organization-wide compensation profiles and modify employee registry records.",
      },
    ],
  },
  terms: {
    title: "Terms of Employment & Platform Usage",
    subtitle: "Internal software usage guidelines and workplace standards",
    sections: [
      {
        heading: "1. Authorized Enterprise Use",
        text: "This platform is intended exclusively for verified corporate employees and administrators. Account credentials must remain confidential and must never be shared.",
      },
      {
        heading: "2. Attendance Integrity",
        text: "Check-in logs and attendance timestamps submitted via the employee workspace reflect official operational attendance records. Automated or proxy check-in attempts violate workforce integrity policies.",
      },
      {
        heading: "3. Administrative Governance",
        text: "Management reserves the right to audit leave records, payroll computations, and employee permissions in compliance with standard corporate compliance protocols.",
      },
    ],
  },
  conduct: {
    title: "HR Code of Conduct & Workplace Guidelines",
    subtitle: "Professional standards and organizational collaboration",
    sections: [
      {
        heading: "1. Professional Conduct",
        text: "All team members are expected to maintain a collaborative, professional, and respectful environment free from harassment, discrimination, or bias across all corporate departments.",
      },
      {
        heading: "2. Leave Protocols",
        text: "Staff members must submit planned leave requests in advance through the employee portal. Unplanned sick leaves should be documented and submitted promptly.",
      },
      {
        heading: "3. Support & Escalations",
        text: "Workplace inquiries or discrepancies can be addressed through the internal HR Helpdesk or directly escalated to Department Heads.",
      },
    ],
  },
  security: {
    title: "IT Security Architecture & Compliance",
    subtitle: "System security standards, access isolation, and audit readiness",
    sections: [
      {
        heading: "1. Session Isolation",
        text: "Employee sessions are authenticated and isolated from privileged administrative endpoints. Session tokens auto-expire upon inactivity.",
      },
      {
        heading: "2. Audit Logs & System Transparency",
        text: "All record updates—including employee additions, salary adjustments, leave approvals, and role updates—are logged with timestamps for administrative auditing.",
      },
      {
        heading: "3. Database Persistence",
        text: "Database records are persisted with continuous integrity checks ensuring reliable operational uptime and data protection.",
      },
    ],
  },
};

export default function Footer({
  role = "admin",
  user,
  onNavigate,
  onOpenSupport,
  onOpenAddEmployee,
  onOpenLeaveModal,
  onClose,
}) {
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);
  const isAdmin = role === "admin";

  const handleNavClick = (pageId) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <footer className="ems-footer">
      {/* ---------- TOP STATUS & COLLAPSE BAR ---------- */}
      <div className="ems-footer-ticker">
        <div className="ems-footer-ticker-left">
          <div className="ems-status-pill">
            <span className="ems-status-dot"></span>
            <span>SYSTEM OPERATIONAL</span>
          </div>
          <span className="ems-ticker-divider">|</span>
          <span className="ems-ticker-text">
            EMS Enterprise Workforce Platform • v2.4.0
          </span>
        </div>

        <div className="ems-footer-ticker-right">
          <button
            type="button"
            className="ems-footer-btn-secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Scroll to top of page"
          >
            <span>↑</span> Top
          </button>

          {onClose && (
            <button
              type="button"
              className="ems-footer-btn-toggle"
              onClick={onClose}
              title="Collapse / Hide Footer"
            >
              <span>✕</span> Close Footer
            </button>
          )}
        </div>
      </div>

      {/* ---------- MAIN MULTI-COLUMN CONTENT ---------- */}
      <div className="ems-footer-main">
        {/* Column 1: Organization Overview */}
        <div className="ems-footer-col">
          <div className="ems-footer-brand-row">
            <div className="ems-footer-logo-badge">EM</div>
            <div>
              <h3 className="ems-footer-title">Employee Management System</h3>
              <p className="ems-footer-subtitle">Corporate Human Resources Platform</p>
            </div>
          </div>

          <p className="ems-footer-desc">
            Centralized platform for workforce administration, attendance verification,
            leave lifecycle management, and transparent payroll processing.
          </p>

          <div className="ems-footer-contact-list">
            <div className="ems-contact-row">
              <MailIcon width={14} height={14} />
              <span>hr-support@company.internal</span>
            </div>
            <div className="ems-contact-row">
              <PhoneIcon width={14} height={14} />
              <span>+91 (800) 456-7890 (HR Operations)</span>
            </div>
            <div className="ems-contact-row">
              <BuildingIcon width={14} height={14} />
              <span>Corporate Headquarters • Tech Park, Bangalore</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Navigation */}
        <div className="ems-footer-col">
          <h4 className="ems-footer-heading">Quick Navigation</h4>
          <ul className="ems-footer-links">
            {isAdmin ? (
              <>
                <li>
                  <button type="button" onClick={() => handleNavClick("Dashboard")}>
                    Dashboard Overview
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("Employees")}>
                    Employee Directory
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("Attendance")}>
                    Attendance Management
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("LeaveRequests")}>
                    Leave Approvals
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("Payroll")}>
                    Payroll Distribution
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("Reports")}>
                    Analytics & Reports
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("Settings")}>
                    System Settings
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button type="button" onClick={() => handleNavClick("overview")}>
                    Personal Dashboard
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("profile")}>
                    Profile Details
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("attendance")}>
                    Attendance Roster
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("salary")}>
                    Salary & Payslips
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("leaves")}>
                    Leave Applications
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("performance")}>
                    Performance Goals & OKRs
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick("settings")}>
                    Account Preferences
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Column 3: Corporate Policies & Compliance */}
        <div className="ems-footer-col">
          <h4 className="ems-footer-heading">Compliance & Policy</h4>
          <ul className="ems-footer-links">
            <li>
              <button type="button" onClick={() => setActiveLegalDoc("privacy")}>
                Data Protection & Privacy
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveLegalDoc("terms")}>
                Platform Terms of Usage
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveLegalDoc("conduct")}>
                HR Workplace Guidelines
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveLegalDoc("security")}>
                IT Security & Access Controls
              </button>
            </li>
            {onOpenSupport && (
              <li>
                <button type="button" onClick={onOpenSupport} className="ems-highlight-link">
                  Open Support Ticket
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Column 4: Active Session Details */}
        <div className="ems-footer-col">
          <h4 className="ems-footer-heading">Active Session</h4>
          <div className="ems-session-card">
            <div className="ems-session-user">
              <div className="ems-session-avatar">
                {user?.name ? user.name[0].toUpperCase() : isAdmin ? "A" : "E"}
              </div>
              <div className="ems-session-info">
                <strong>{user?.name || (isAdmin ? "Administrator" : "Employee")}</strong>
                <small>{user?.email || "user@company.internal"}</small>
              </div>
            </div>

            <div className="ems-session-rows">
              <div className="ems-session-row">
                <span>Access Level</span>
                <strong>{isAdmin ? "Administrator" : "Standard Employee"}</strong>
              </div>
              <div className="ems-session-row">
                <span>Department</span>
                <strong>{user?.department || (isAdmin ? "Administration" : "General")}</strong>
              </div>
              <div className="ems-session-row">
                <span>Connection</span>
                <span className="ems-secure-badge">
                  <CheckCircleIcon width={12} height={12} /> Encrypted Session
                </span>
              </div>
            </div>

            <div className="ems-session-actions">
              <button
                type="button"
                className="ems-session-btn"
                onClick={() => window.print()}
              >
                Print View
              </button>
              {onOpenSupport && (
                <button
                  type="button"
                  className="ems-session-btn primary"
                  onClick={onOpenSupport}
                >
                  Contact HR
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM COPYRIGHT BAR ---------- */}
      <div className="ems-footer-bottom">
        <p>© 2026 Employee Management System. All rights reserved.</p>
        <div className="ems-footer-bottom-links">
          <button type="button" onClick={() => setActiveLegalDoc("privacy")}>Privacy</button>
          <span>•</span>
          <button type="button" onClick={() => setActiveLegalDoc("terms")}>Terms</button>
          <span>•</span>
          <button type="button" onClick={() => setActiveLegalDoc("security")}>Security</button>
        </div>
      </div>

      {/* ---------- LEGAL & POLICY MODAL ---------- */}
      {activeLegalDoc && LEGAL_DOCS[activeLegalDoc] && (
        <div className="ems-legal-overlay" onClick={() => setActiveLegalDoc(null)}>
          <div className="ems-legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ems-legal-modal-head">
              <div>
                <h2>{LEGAL_DOCS[activeLegalDoc].title}</h2>
                <p>{LEGAL_DOCS[activeLegalDoc].subtitle}</p>
              </div>
              <button
                type="button"
                className="ems-legal-close-btn"
                onClick={() => setActiveLegalDoc(null)}
              >
                ✕
              </button>
            </div>

            <div className="ems-legal-modal-body">
              {LEGAL_DOCS[activeLegalDoc].sections.map((sec, idx) => (
                <div key={idx} className="ems-legal-section">
                  <h3>{sec.heading}</h3>
                  <p>{sec.text}</p>
                </div>
              ))}
            </div>

            <div className="ems-legal-modal-foot">
              <button
                type="button"
                className="ems-legal-confirm-btn"
                onClick={() => setActiveLegalDoc(null)}
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
