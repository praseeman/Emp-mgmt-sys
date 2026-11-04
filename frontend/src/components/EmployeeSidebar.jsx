import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  CalendarCheck2,
  FileText,
  CreditCard,
  Target,
  Settings,
  LogOut,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";
import "./Sidebar.css";

/**
 * =========================================================================
 * ENTERPRISE EMPLOYEE WORKSPACE PORTAL - LEFT SIDEBAR NAVIGATION
 * =========================================================================
 *
 * Professional corporate architecture matching the Admin Sidebar:
 *  - Fixed 260px desktop width with crisp solid border-r (#E5E7EB) and solid #FFFFFF background
 *  - Flipkart Corporate Blue (#2874F0) active tab with 4px left bar & light blue tint (#EBF2FF)
 *  - Categorized menu groups: OVERVIEW, WORKSPACE, PREFERENCES
 *  - Small, high-contrast red pill notification on "Leave Requests"
 *  - Sleek Quick Support Card & Page Footer Toggle
 *  - Pinned profile footer with employee avatar, title, settings & sign out
 *  - Full responsive mobile drawer (<1024px) with backdrop overlay
 */

const MENU_SECTIONS = [
  {
    id: "overview",
    title: "OVERVIEW",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "profile", label: "My Profile", icon: User },
    ],
  },
  {
    id: "workspace",
    title: "WORKSPACE",
    items: [
      { id: "attendance", label: "Attendance", icon: CalendarCheck2 },
      { id: "salary", label: "Salary & Payslips", icon: CreditCard },
      {
        id: "leaves",
        label: "Leave Requests",
        icon: FileText,
        badgeKey: "leaves",
      },
      { id: "performance", label: "Performance & OKRs", icon: Target },
    ],
  },
  {
    id: "preferences",
    title: "PREFERENCES",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function EmployeeSidebar({
  activeTab = "overview",
  onSelectTab = () => {},
  onLogout = () => {},
  onOpenSupport = () => {},
  showFooter = false,
  onToggleFooter,
  pendingLeavesCount = 0,
  user = {
    name: "Employee",
    designation: "Staff Member",
    email: "emp@ems.com",
    department: "Engineering",
  },
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (id) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  const handleSupportClick = () => {
    if (onOpenSupport) {
      onOpenSupport();
    }
    setMobileOpen(false);
  };

  const renderContent = () => (
    <>
      {/* =========================================================================
          TOP HEADER: MINIMAL LOGO & BRAND NAME
          ========================================================================= */}
      <div className="ems-sidebar-header">
        <div className="ems-logo-badge" title="Employee Portal Workspace">
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

        <div className="ems-brand-info">
          <div className="ems-brand-title">
            <span className="ems-brand-title-bold">Employee</span>
            <span className="ems-brand-title-regular">Portal</span>
          </div>
          <span className="ems-brand-subtitle">Workspace EMS</span>
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
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              const badgeNum =
                item.badgeKey === "leaves" ? Number(pendingLeavesCount || 0) : 0;

              return (
                <div key={item.id} className="ems-nav-item-wrap">
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`ems-nav-item ${isActive ? "active" : ""}`}
                  >
                    <span className="ems-nav-icon">
                      <Icon size={18} strokeWidth={2} />
                    </span>

                    <span className="ems-nav-label">{item.label}</span>

                    {badgeNum > 0 ? (
                      <span className="ems-nav-badge">{badgeNum}</span>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* =========================================================================
          QUICK SUPPORT CARD & FOOTER TOGGLE
          ========================================================================= */}
      <div className="ems-sidebar-extra">
        <div className="ems-help-card">
          <div className="ems-help-card-icon">
            <HelpCircle size={17} strokeWidth={2.2} />
          </div>
          <div className="ems-help-card-body">
            <span className="ems-help-card-title">Need HR Support?</span>
            <span className="ems-help-card-desc">Leaves, payslips & queries</span>
          </div>
          <button
            type="button"
            className="ems-help-card-btn"
            onClick={handleSupportClick}
            title="Contact HR Support Desk"
          >
            Contact
          </button>
        </div>

        {onToggleFooter && (
          <button
            type="button"
            className={`ems-footer-toggle-item ${showFooter ? "active" : ""}`}
            onClick={onToggleFooter}
            title="Toggle page footer visibility"
          >
            <span className="ems-footer-toggle-icon">📑</span>
            <span className="ems-footer-toggle-text">
              {showFooter ? "Hide Page Footer" : "Show Page Footer"}
            </span>
            <span className="ems-footer-toggle-arrow">{showFooter ? "▲" : "▼"}</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          BOTTOM PROFILE & UTILITY SNIPPET
          ========================================================================= */}
      <div className="ems-sidebar-footer">
        <div className="ems-profile-left">
          <div className="ems-profile-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "E"}
          </div>
          <div className="ems-profile-meta">
            <span className="ems-profile-name">
              {user?.name || "Employee"}
            </span>
            <span className="ems-profile-role">
              {user?.designation || user?.department || "Staff Member"}
            </span>
          </div>
        </div>

        <div className="ems-profile-actions">
          <button
            type="button"
            onClick={() => handleNavClick("settings")}
            className="ems-icon-action-btn"
            title="Settings & Preferences"
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
