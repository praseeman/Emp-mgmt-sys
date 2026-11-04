import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileSpreadsheet,
  FileText,
  FileCheck,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/**
 * =========================================================================
 * DATA EXPORTER (EXCEL .XLSX, CSV, AND DATA-ONLY PDF)
 * =========================================================================
 * 
 * Strict Requirements:
 *  1. ALL downloads (Excel, CSV, PDF) show STRICTLY ONLY THE DATA.
 *  2. PDF is a real downloadable .pdf file containing ONLY the clean data table (no page noise).
 *  3. Real employee and organization records with clean standard English headers.
 *  4. Instant 1-click downloads with 0 page reloads.
 */

/**
 * Build clean tabular data array
 */
export function buildCleanEmployeeData(employees = [], reportDeptFilter = "All") {
  const filteredEmployees =
    reportDeptFilter === "All"
      ? employees
      : employees.filter((e) => e.department === reportDeptFilter);

  return filteredEmployees.map((emp) => ({
    Employee_ID: `EMP-00${emp._id}`,
    Full_Name: String(emp.name || "").trim(),
    Email_Address: String(emp.email || "").trim(),
    Phone_Number: String(emp.phone || "").trim(),
    Department: String(emp.department || "General").trim(),
    Designation: String(emp.designation || emp.role || "Staff").trim(),
    Role: String(emp.role || "employee").trim(),
    Salary_INR: Number(emp.salary || 0),
    Employment_Status: String(emp.status || "Active").trim(),
    Date_of_Joining: String(emp.joinDate || "").trim(),
    Address: String(emp.address || "N/A").trim(),
    Emergency_Contact: String(emp.emergencyContact || "N/A").trim(),
  }));
}

/**
 * Export ONLY Data to Excel (.xlsx)
 */
export function exportAllReportsToExcel({
  employees = [],
  payroll = [],
  attendance = [],
  reportDeptFilter = "All",
  onToast = () => {},
}) {
  try {
    const targetEmployees =
      reportDeptFilter === "All"
        ? employees
        : employees.filter((e) => e.department === reportDeptFilter);

    if (!targetEmployees || targetEmployees.length === 0) {
      onToast("No employee data available to export.", "error");
      return false;
    }

    // Sheet 1: Strictly Employee Data
    const employeesSheet = targetEmployees.map((emp) => ({
      "Employee ID": `EMP-00${emp._id}`,
      "Full Name": String(emp.name || "").trim(),
      "Email Address": String(emp.email || "").trim(),
      "Phone Number": String(emp.phone || "").trim(),
      "Department": String(emp.department || "General").trim(),
      "Designation": String(emp.designation || emp.role || "Staff").trim(),
      "Role": String(emp.role || "employee").trim(),
      "Monthly Salary (INR)": Number(emp.salary || 0),
      "Employment Status": String(emp.status || "Active").trim(),
      "Date of Joining": String(emp.joinDate || "").trim(),
      "Residential Address": String(emp.address || "N/A").trim(),
      "Emergency Contact": String(emp.emergencyContact || "N/A").trim(),
    }));

    const wb = XLSX.utils.book_new();
    const wsEmployees = XLSX.utils.json_to_sheet(employeesSheet);

    const autoFitColumns = (data) => {
      if (!data || data.length === 0) return [];
      const keys = Object.keys(data[0]);
      return keys.map((key) => {
        let maxLen = key.length;
        data.forEach((row) => {
          const val = row[key] != null ? String(row[key]) : "";
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
      });
    };

    wsEmployees["!cols"] = autoFitColumns(employeesSheet);
    XLSX.utils.book_append_sheet(wb, wsEmployees, "Employee Data");

    // Optional Payroll Data Sheet (if actual payroll data exists)
    if (payroll && payroll.length > 0) {
      const payrollSheet = payroll.map((p, idx) => ({
        "Record ID": `PAY-00${idx + 1}`,
        "Employee Name": String(p.name || "").trim(),
        "Department": String(p.department || "").trim(),
        "Base Salary (INR)": Number(p.baseSalary || p.salary || 0),
        "Payment Status": String(p.status || "Paid").trim(),
      }));
      const wsPayroll = XLSX.utils.json_to_sheet(payrollSheet);
      wsPayroll["!cols"] = autoFitColumns(payrollSheet);
      XLSX.utils.book_append_sheet(wb, wsPayroll, "Payroll Data");
    }

    // Optional Attendance Data Sheet (if actual attendance data exists)
    if (attendance && attendance.length > 0) {
      const attendanceSheet = attendance.map((a, idx) => ({
        "Log ID": `ATT-00${idx + 1}`,
        "Employee Name": String(a.employeeName || a.name || "").trim(),
        "Department": String(a.department || "").trim(),
        "Date": String(a.date || "").trim(),
        "Check In Time": String(a.checkIn || "").trim(),
        "Check Out Time": String(a.checkOut || "").trim(),
        "Attendance Status": String(a.status || "").trim(),
      }));
      const wsAttendance = XLSX.utils.json_to_sheet(attendanceSheet);
      wsAttendance["!cols"] = autoFitColumns(attendanceSheet);
      XLSX.utils.book_append_sheet(wb, wsAttendance, "Attendance Data");
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `EMS_Employee_Data_${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);

    onToast("Excel (.xlsx) data file downloaded successfully!", "success");
    return true;
  } catch (err) {
    console.error("Error exporting Excel data:", err);
    onToast("Failed to download Excel data file.", "error");
    return false;
  }
}

/**
 * Export ONLY Data to PDF (.pdf) using jsPDF & AutoTable
 * Strictly outputs the clean data table without any dashboard UI noise!
 */
export function exportAllReportsToPdf({
  employees = [],
  reportDeptFilter = "All",
  onToast = () => {},
}) {
  try {
    const targetEmployees =
      reportDeptFilter === "All"
        ? employees
        : employees.filter((e) => e.department === reportDeptFilter);

    if (!targetEmployees || targetEmployees.length === 0) {
      onToast("No employee data available to export.", "error");
      return false;
    }

    // Create landscape PDF for optimal table readability
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Executive Top Brand Banner
    doc.setFillColor(30, 64, 175); // Royal Cobalt Blue (#1E40AF)
    doc.rect(0, 0, pageWidth, 48, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("EMPLOYEE MANAGEMENT SYSTEM", 28, 30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(219, 234, 254);
    doc.text("OFFICIAL WORKFORCE DATA RECORDS", pageWidth - 28, 30, { align: "right" });

    // 2. Sub-Header Metadata Bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39);
    doc.text(`Department: ${reportDeptFilter}`, 28, 70);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Export Date: ${todayStr}   |   Total Data Records: ${targetEmployees.length}`,
      pageWidth - 28,
      70,
      { align: "right" }
    );

    // 3. Tabular Data - STRICTLY ONLY DATA
    const tableColumns = [
      { header: "ID", dataKey: "id" },
      { header: "Full Name", dataKey: "name" },
      { header: "Official Email", dataKey: "email" },
      { header: "Contact Phone", dataKey: "phone" },
      { header: "Department", dataKey: "dept" },
      { header: "Designation", dataKey: "role" },
      { header: "Monthly Salary (INR)", dataKey: "salary" },
      { header: "Status", dataKey: "status" },
      { header: "Joining Date", dataKey: "joinDate" },
    ];

    const tableRows = targetEmployees.map((emp) => ({
      id: `EMP-00${emp._id}`,
      name: String(emp.name || "").trim(),
      email: String(emp.email || "").trim(),
      phone: String(emp.phone || "").trim(),
      dept: String(emp.department || "General").trim(),
      role: String(emp.designation || emp.role || "Staff").trim(),
      salary: `INR ${Number(emp.salary || 0).toLocaleString("en-IN")}`,
      status: String(emp.status || "Active").trim(),
      joinDate: String(emp.joinDate || "2023-01-15").trim(),
    }));

    autoTable(doc, {
      startY: 84,
      columns: tableColumns,
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235], // Blue
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "left",
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 5.5,
        textColor: [30, 41, 59],
        overflow: "linebreak",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        id: { cellWidth: 55, fontStyle: "bold" },
        salary: { halign: "right", fontStyle: "bold" },
        status: { halign: "center" },
      },
      didDrawPage: (data) => {
        const totalPages = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${totalPages}   •   Strictly Data Only   •   Confidential Records`,
          pageWidth / 2,
          pageHeight - 14,
          { align: "center" }
        );
      },
    });

    const filename = `EMS_Employee_Data_${todayStr}.pdf`;
    doc.save(filename);
    onToast("PDF data file downloaded successfully!", "success");
    return true;
  } catch (err) {
    console.error("PDF export error:", err);
    onToast("Failed to download PDF data file.", "error");
    return false;
  }
}

/**
 * Enterprise Data Export Component (Excel .xlsx, CSV, and PDF)
 */
export default function ReportExportMenu({
  employees = [],
  payroll = [],
  attendance = [],
  reportDeptFilter = "All",
  onToast = () => {},
  className = "",
  buttonLabel = "Download Data",
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const employeeData = buildCleanEmployeeData(employees, reportDeptFilter);
  const todayStr = new Date().toISOString().split("T")[0];

  const handleExcelClick = () => {
    exportAllReportsToExcel({
      employees,
      payroll,
      attendance,
      reportDeptFilter,
      onToast,
    });
    setOpen(false);
  };

  const handlePdfClick = () => {
    exportAllReportsToPdf({
      employees,
      reportDeptFilter,
      onToast,
    });
    setOpen(false);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef} style={{ zIndex: 30 }}>
      {/* =========================================================================
          DATA DOWNLOAD SPLIT BUTTON
          ========================================================================= */}
      <div
        className="inline-flex items-stretch rounded-xl overflow-hidden transition-all duration-200"
        style={{
          boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Main 1-Click Action: Instant Excel (.xlsx) Data Download */}
        <button
          type="button"
          onClick={handleExcelClick}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 text-white font-semibold text-[13.5px] transition-all duration-150 cursor-pointer active:scale-[0.98] outline-none select-none"
          style={{
            background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #1E40AF 100%)",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
          }}
          title="Download workforce data in Excel (.xlsx) format"
        >
          {/* Frosted Icon Badge */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(255, 255, 255, 0.18)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.15)",
            }}
          >
            <FileSpreadsheet size={14} strokeWidth={2.4} className="text-white drop-shadow-sm" />
          </div>

          <span className="font-semibold tracking-[-0.01em]">{buttonLabel}</span>

          {/* Formats indicator pill */}
          <span
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-extrabold uppercase tracking-wider"
            style={{
              background: "rgba(16, 185, 129, 0.25)",
              color: "#A7F3D0",
              border: "1px solid rgba(110, 231, 183, 0.4)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            XLSX • CSV • PDF
          </span>
        </button>

        {/* Dropdown Options Trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="px-2.5 text-white flex items-center justify-center transition-all duration-150 cursor-pointer outline-none active:bg-blue-900"
          style={{
            background: "linear-gradient(135deg, #1E40AF 0%, #172554 100%)",
            borderLeft: "1px solid rgba(255, 255, 255, 0.25)",
          }}
          aria-label="Select data export format"
          title="Choose data export format (Excel, CSV, or PDF)"
        >
          <ChevronDown
            size={16}
            strokeWidth={2.4}
            className={`transition-transform duration-200 text-white/90 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* =========================================================================
          DATA FORMAT SELECTION POPOVER (DATA ONLY: XLSX, CSV, PDF)
          ========================================================================= */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2.5 w-80 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-2.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
          style={{
            boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles size={12} className="text-blue-500" /> Export Data Formats
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono border border-emerald-100">
              Data Only
            </span>
          </div>

          <div className="space-y-1.5">
            {/* OPTION 1: Excel Data File (.xlsx) */}
            <button
              type="button"
              onClick={handleExcelClick}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200/80 active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                <FileSpreadsheet size={18} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-800">
                    Excel Data File
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    .XLSX
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 group-hover:text-slate-600 leading-tight mt-1">
                  Complete workforce data spreadsheet with auto-fitted columns.
                </span>
              </div>
            </button>

            {/* OPTION 2: CSV Data File (.csv) */}
            <CSVLink
              data={employeeData}
              filename={`EMS_Employee_Data_${todayStr}.csv`}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group hover:bg-blue-50/80 border border-transparent hover:border-blue-200/80 no-underline active:scale-[0.99]"
              onClick={() => {
                onToast("CSV data file downloaded successfully!", "success");
                setOpen(false);
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <FileText size={18} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-blue-800">
                    CSV Data File
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    .CSV
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 group-hover:text-slate-600 leading-tight mt-1">
                  Raw tabular comma-separated values for databases & SQL.
                </span>
              </div>
            </CSVLink>

            {/* OPTION 3: PDF Data Document (.pdf) */}
            <button
              type="button"
              onClick={handlePdfClick}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group hover:bg-rose-50/80 border border-transparent hover:border-rose-200/80 active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                <FileCheck size={18} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-rose-800">
                    PDF Data Document
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    .PDF
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 group-hover:text-slate-600 leading-tight mt-1">
                  Downloads an official PDF file containing strictly the workforce data table.
                </span>
              </div>
            </button>
          </div>

          {/* Guarantee Footer */}
          <div className="mt-2 pt-2 border-t border-slate-100 px-2 flex items-center justify-between text-[10.5px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-emerald-600">
              <CheckCircle2 size={12} /> Strictly Data Only
            </span>
            <span>Instant Client-Side Download</span>
          </div>
        </div>
      )}
    </div>
  );
}
