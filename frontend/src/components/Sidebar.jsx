import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  FileText,
  CreditCard,
  Target,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import "./Sidebar.css";

/**
 * =========================================================================
 * ENTERPRISE EMPLOYEE MANAGEMENT SYSTEM (EMS) - LEFT SIDEBAR NAVIGATION
 * =========================================================================
 *
 * Professional corporate architecture inspired by Flipkart, Stripe & Shopify:
 *  - Fixed 260px desktop width with crisp solid border-r (#E5E7EB) and solid #FFFFFF background
 *  - Flipkart Corporate Blue (#2874F0) active tab with 4px left bar & light blue tint (#EBF2FF)
 *  - Detailed Reports Navigation: Tree structure with direct one-click report download
 *  - Categorized menu groups: OVERVIEW, MANAGE, ORGANIZATION
 *  - Small, high-contrast red pill notification on "Leave Requests"
 *  - Pinned profile footer with admin avatar, title, settings & sign out
 */

const MENU_SECTIONS = [
  {
    id: "overview",
    title: "OVERVIEW",
    items: [
      { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "manage",
    title: "MANAGE",
    items: [
      { id: "Employees", label: "Employees", icon: Users },
      { id: "Attendance", label: "Attendance", icon: CalendarCheck2 },
      {
        id: "LeaveRequests",
        label: "Leave Requests",
        icon: FileText,
        badge: "1",
      },
      { id: "Payroll", label: "Payroll", icon: CreditCard },
      {
        id: "Performance",
        label: "Performance & OKRs",
        icon: Target,
      },
    ],
  },
  {
    id: "organization",
    title: "ORGANIZATION",
    items: [
      { id: "Departments", label: "Departments", icon: Building2 },
      {
        id: "Reports",
        label: "Reports",
        icon: BarChart3,
        subItems: [
          { id: "Reports", label: "Overview & KPIs" },
          { id: "ReportsGrowth", label: "Workforce Growth" },
          { id: "ReportsDept", label: "Dept Breakdown" },
          { id: "ReportsAttendance", label: "Attendance Trends" },
          { id: "ReportsLeave", label: "Leave Statistics" },
          { id: "ReportsRegistry", label: "Staff Registry" },
          {
            id: "DownloadReportXLSX",
            label: "Download Excel (.xlsx)",
            icon: FileSpreadsheet,
            isAction: true,
            actionType: "xlsx",
          },
          {
            id: "DownloadReportCSV",
            label: "Download CSV (.csv)",
            icon: Download,
            isAction: true,
            actionType: "csv",
          },
          {
            id: "DownloadReportPDF",
            label: "Download PDF (.pdf)",
            icon: FileText,
            isAction: true,
            actionType: "pdf",
          },
        ],
      },
    ],
  },
];

export default function Sidebar({
  activeItem = "Dashboard",
  onSelectItem = () => {},
  onLogout = () => {},
  onOpenSettings,
  onDownloadReport,
  pendingLeavesCount = 0,
  adminUser = {
    name: "Praseeman",
    role: "System Administrator",
    email: "sppraseeman@gmail.com",
  },
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(true);

  // Auto-expand reports tree if active item is inside reports
  useEffect(() => {
    if (activeItem.startsWith("Reports")) {
      setReportsExpanded(true);
    }
  }, [activeItem]);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (id) => {
    onSelectItem(id);
    setMobileOpen(false);
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      onSelectItem("Settings");
    }
    setMobileOpen(false);
  };

  const handleActionClick = (actionType) => {
    if (onDownloadReport) {
      onDownloadReport(actionType);
    }
    setMobileOpen(false);
  };

  const renderContent = () => (
    <>
      {/* =========================================================================
          TOP HEADER: MINIMAL LOGO & BRAND NAME
          ========================================================================= */}
      <div className="ems-sidebar-header">
        {/* Flipkart Blue Minimal Monogram */}
        <div className="ems-logo-badge" title="EMS Portal">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>

        {/* Brand Name Typography */}
        <div className="ems-brand-info">
          <div className="ems-brand-title">
            <span className="ems-brand-title-bold">Employee</span>
            <span className="ems-brand-title-regular">Management</span>
          </div>
          <span className="ems-brand-subtitle">Enterprise EMS</span>
        </div>
      </div>

      {/* =========================================================================
          NAVIGATION MENU CORE
          ========================================================================= */}
      <nav className="ems-sidebar-nav">
        {MENU_SECTIONS.map((section) => (
          <div key={section.id} className="ems-nav-group">
            {/* Group Label */}
            <div className="ems-nav-group-title">{section.title}</div>

            {/* Menu Items */}
            {section.items.map((item) => {
              const isReportsItem = item.id === "Reports";
              const isDirectActive = activeItem === item.id;
              const isParentActive = isReportsItem && activeItem.startsWith("Reports");
              const isTopLevelActive = isDirectActive || (isParentActive && !reportsExpanded);
              const Icon = item.icon;
              const badgeNum =
                item.id === "LeaveRequests"
                  ? Number(pendingLeavesCount)
                  : Number(item.badge || 0);

              return (
                <div key={item.id} className="ems-nav-item-wrap">
                  {/* Top-Level Menu Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isReportsItem) {
                        setReportsExpanded(!reportsExpanded);
                        handleNavClick("Reports");
                      } else {
                        handleNavClick(item.id);
                      }
                    }}
                    className={`ems-nav-item ${isTopLevelActive ? "active" : ""}`}
                  >
                    {/* Clean Outline Icon (18px) */}
                    <span className="ems-nav-icon">
                      <Icon size={18} strokeWidth={2} />
                    </span>

                    {/* Menu Label */}
                    <span className="ems-nav-label">{item.label}</span>

                    {/* Notification Badge */}
                    {badgeNum > 0 ? (
                      <span className="ems-nav-badge">{badgeNum}</span>
                    ) : null}

                    {/* Chevron for expandable sub-items */}
                    {isReportsItem && (
                      <span
                        className="ems-chevron-wrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportsExpanded(!reportsExpanded);
                        }}
                      >
                        {reportsExpanded ? (
                          <ChevronDown size={15} strokeWidth={2} />
                        ) : (
                          <ChevronRight size={15} strokeWidth={2} />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Reports Sub-Menu Details */}
                  {isReportsItem && reportsExpanded && item.subItems && (
                    <div className="ems-nav-sub-menu">
                      {item.subItems.map((sub) => {
                        const isSubActive = activeItem === sub.id;

                        if (sub.isAction) {
                          const ActionIcon = sub.icon;
                          const isPdf = sub.actionType === "pdf";
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleActionClick(sub.actionType)}
                              className={`ems-nav-sub-item action-btn ${
                                sub.actionType === "xlsx"
                                  ? "excel"
                                  : isPdf
                                  ? "pdf"
                                  : "csv"
                              }`}
                              title={sub.label}
                            >
                              <ActionIcon size={13} strokeWidth={2.2} />
                              <span>{sub.label}</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleNavClick(sub.id)}
                            className={`ems-nav-sub-item ${
                              isSubActive ? "active" : ""
                            }`}
                          >
                            <span className="ems-sub-dot" />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* =========================================================================
          BOTTOM PROFILE & UTILITY SNIPPET
          ========================================================================= */}
      <div className="ems-sidebar-footer">
        {/* User Profile Info */}
        <div className="ems-profile-left">
          <div className="ems-profile-avatar">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="ems-profile-meta">
            <span className="ems-profile-name">
              {adminUser?.name || "Praseeman"}
            </span>
            <span className="ems-profile-role">
              {adminUser?.role || "System Administrator"}
            </span>
          </div>
        </div>

        {/* Action Icons: Settings & Sign Out */}
        <div className="ems-profile-actions">
          <button
            type="button"
            onClick={handleSettingsClick}
            className="ems-icon-action-btn"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={16} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="ems-icon-action-btn logout"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON (< 1024PX) */}
      <div className="lg:hidden fixed top-3.5 left-3.5 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-[6px] bg-white text-[#111827] border border-[#E5E7EB] shadow-xs hover:bg-[#F3F4F6] transition-colors active:scale-95 cursor-pointer"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#111827]/40 z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE SLIDE-OVER DRAWER */}
      <div
        className={`lg:hidden ems-sidebar-container mobile-drawer z-50 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderContent()}
      </div>

      {/* DESKTOP FIXED SIDEBAR */}
      <aside className="ems-sidebar-container desktop-only">
        {renderContent()}
      </aside>
    </>
  );
}
