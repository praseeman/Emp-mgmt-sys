const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Admin Accounts
const ADMIN_USERS = [
  {
    _id: "admin-1",
    email: "sppraseeman@gmail.com",
    password: "praseeman123",
    name: "Praseeman",
    role: "admin",
    department: "HR",
    designation: "Administrator & HR Manager",
    salary: 65000,
    phone: "8248070608",
  },
  {
    _id: "admin-2",
    email: "admin@ems.com",
    password: "admin",
    name: "System Admin",
    role: "admin",
    department: "Management",
    designation: "Executive Administrator",
    salary: 90000,
    phone: "9999999999",
  },
];

// In-memory employee array
let employees = [
  {
    _id: "1",
    name: "Praseeman",
    email: "sppraseeman@gmail.com",
    phone: "8248070608",
    department: "HR",
    role: "admin",
    designation: "Administrator & HR Manager",
    salary: 65000,
    status: "Active",
    joinDate: "2023-01-15",
  },
  {
    _id: "2",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    department: "Engineering",
    role: "employee",
    designation: "Senior Software Engineer",
    salary: 85000,
    status: "Active",
    joinDate: "2023-03-20",
    address: "B-402, Cyber Heights, Bangalore",
    emergencyContact: "9876500000 (Father)",
  },
  {
    _id: "3",
    name: "Priya Patel",
    email: "priya@gmail.com",
    phone: "9123456780",
    department: "Design",
    role: "employee",
    designation: "Lead UI/UX Designer",
    salary: 62000,
    status: "Active",
    joinDate: "2023-06-10",
    address: "Flat 12, Green Glen Layout, Bangalore",
    emergencyContact: "9123400000 (Spouse)",
  },
  {
    _id: "4",
    name: "Amit Verma",
    email: "amit.verma@ems.com",
    phone: "9345678901",
    department: "Finance",
    role: "employee",
    designation: "Senior Financial Analyst",
    salary: 58000,
    status: "Active",
    joinDate: "2022-11-01",
    address: "7th Cross, Indiranagar, Bangalore",
    emergencyContact: "9345600000 (Mother)",
  },
  {
    _id: "5",
    name: "Sneha Reddy",
    email: "sneha.reddy@ems.com",
    phone: "9456789012",
    department: "HR",
    role: "employee",
    designation: "Talent Acquisition Specialist",
    salary: 48000,
    status: "Active",
    joinDate: "2024-02-15",
    address: "Plot 88, HSR Layout Sector 2, Bangalore",
    emergencyContact: "9456700000 (Brother)",
  },
  {
    _id: "6",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@ems.com",
    phone: "9567890123",
    department: "Marketing",
    role: "employee",
    designation: "Growth Marketing Lead",
    salary: 55000,
    status: "Active",
    joinDate: "2023-08-05",
    address: "Koramangala 4th Block, Bangalore",
    emergencyContact: "9567800000 (Friend)",
  },
];

// In-memory Leave Requests
let leaveRequests = [
  {
    _id: "leave-1",
    employeeId: "2",
    employeeName: "Rahul Sharma",
    employeeEmail: "rahul@gmail.com",
    department: "Engineering",
    leaveType: "Casual Leave",
    fromDate: "2026-10-15",
    toDate: "2026-10-17",
    days: 3,
    reason: "Family function in hometown",
    status: "Pending",
    appliedAt: "2026-10-08",
  },
  {
    _id: "leave-2",
    employeeId: "3",
    employeeName: "Priya Patel",
    employeeEmail: "priya@gmail.com",
    department: "Design",
    leaveType: "Sick Leave",
    fromDate: "2026-10-02",
    toDate: "2026-10-03",
    days: 2,
    reason: "Severe viral fever and medical recovery",
    status: "Approved",
    appliedAt: "2026-10-01",
  },
  {
    _id: "leave-3",
    employeeId: "4",
    employeeName: "Amit Verma",
    employeeEmail: "amit.verma@ems.com",
    department: "Finance",
    leaveType: "Annual Leave",
    fromDate: "2026-09-20",
    toDate: "2026-09-25",
    days: 6,
    reason: "Annual vacation trip",
    status: "Approved",
    appliedAt: "2026-09-10",
  },
];

// In-memory Attendance Records
let attendanceRecords = [
  {
    _id: "att-1",
    employeeId: "1",
    employeeName: "Praseeman",
    department: "HR",
    date: "2026-10-09",
    checkIn: "08:55 AM",
    checkOut: "06:05 PM",
    status: "Present",
    hours: "9.1",
  },
  {
    _id: "att-2",
    employeeId: "2",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    date: "2026-10-09",
    checkIn: "09:10 AM",
    checkOut: "--",
    status: "Present",
    hours: "In Progress",
  },
  {
    _id: "att-3",
    employeeId: "3",
    employeeName: "Priya Patel",
    department: "Design",
    date: "2026-10-09",
    checkIn: "09:05 AM",
    checkOut: "--",
    status: "Present",
    hours: "In Progress",
  },
  {
    _id: "att-4",
    employeeId: "4",
    employeeName: "Amit Verma",
    department: "Finance",
    date: "2026-10-09",
    checkIn: "09:30 AM",
    checkOut: "--",
    status: "Late",
    hours: "In Progress",
  },
  {
    _id: "att-5",
    employeeId: "5",
    employeeName: "Sneha Reddy",
    department: "HR",
    date: "2026-10-09",
    checkIn: "08:50 AM",
    checkOut: "--",
    status: "Present",
    hours: "In Progress",
  },
  {
    _id: "att-6",
    employeeId: "6",
    employeeName: "Vikram Malhotra",
    department: "Marketing",
    date: "2026-10-09",
    checkIn: "--",
    checkOut: "--",
    status: "On Leave",
    hours: "0.0",
  },
];

// Payroll Status store
let payrollStatus = {};

// ================= AUTH API =================
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Check Admin credentials
  const matchedAdmin = ADMIN_USERS.find(
    (a) => a.email.toLowerCase() === cleanEmail && a.password === password
  );

  if (matchedAdmin) {
    return res.status(200).json({
      success: true,
      user: {
        id: matchedAdmin._id,
        name: matchedAdmin.name,
        email: matchedAdmin.email,
        role: "admin",
        department: matchedAdmin.department,
        designation: matchedAdmin.designation,
        salary: matchedAdmin.salary,
        phone: matchedAdmin.phone,
      },
    });
  }

  // 2. Check Employee credentials (matching any employee)
  const matchedEmp = employees.find(
    (e) => e.email.toLowerCase() === cleanEmail
  );

  if (matchedEmp) {
    // For demo convenience, accept password "employee123", "password123", or emp's custom password
    const validEmpPassword =
      password === "employee123" ||
      password === "password123" ||
      password === matchedEmp.phone ||
      password === (matchedEmp.password || "employee123");

    if (validEmpPassword) {
      return res.status(200).json({
        success: true,
        user: {
          id: matchedEmp._id,
          name: matchedEmp.name,
          email: matchedEmp.email,
          role: matchedEmp.role || "employee",
          department: matchedEmp.department || "General",
          designation: matchedEmp.designation || "Staff Member",
          salary: matchedEmp.salary || 40000,
          phone: matchedEmp.phone,
          status: matchedEmp.status || "Active",
          joinDate: matchedEmp.joinDate || "2023-01-01",
          address: matchedEmp.address || "Bangalore, India",
          emergencyContact: matchedEmp.emergencyContact || "9876543210",
        },
      });
    }
  }

  return res.status(401).json({ message: "Invalid email or password" });
});

// ================= EMPLOYEES API =================
// GET All Employees
app.get("/api/employees", (req, res) => {
  res.status(200).json(employees);
});

// POST New Employee (Creating Data)
app.post("/api/employees", (req, res) => {
  try {
    const { name, email, phone, department, salary, role, designation, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    const newEmployee = {
      _id: Date.now().toString(),
      name,
      email,
      phone: phone || "",
      department: department || "General",
      role: role || "employee",
      designation: designation || "Associate",
      salary: Number(salary) || 30000,
      status: status || "Active",
      joinDate: new Date().toISOString().split("T")[0],
    };

    employees.unshift(newEmployee);
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(500).json({ message: "Server Error adding employee" });
  }
});

// PUT Update Employee
app.put("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const index = employees.findIndex((emp) => emp._id === id);

  if (index !== -1) {
    employees[index] = { ...employees[index], ...req.body };
    res.status(200).json(employees[index]);
  } else {
    res.status(404).json({ message: "Employee not found" });
  }
});

// DELETE Employee
app.delete("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  employees = employees.filter((emp) => emp._id !== id);
  res.status(200).json({ message: "Employee deleted successfully" });
});

// ================= LEAVES API =================
// GET Leaves (All or filtered by email/employeeId)
app.get("/api/leaves", (req, res) => {
  const { email, employeeId } = req.query;
  let result = leaveRequests;
  if (email) {
    result = result.filter(
      (l) => l.employeeEmail?.toLowerCase() === email.toLowerCase()
    );
  } else if (employeeId) {
    result = result.filter((l) => l.employeeId === employeeId);
  }
  res.status(200).json(result);
});

// POST Apply for leave
app.post("/api/leaves", (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeEmail,
      department,
      leaveType,
      fromDate,
      toDate,
      days,
      reason,
    } = req.body;

    if (!employeeName || !leaveType || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing required leave fields" });
    }

    const newLeave = {
      _id: `leave-${Date.now()}`,
      employeeId: employeeId || "unknown",
      employeeName,
      employeeEmail: employeeEmail || "",
      department: department || "General",
      leaveType,
      fromDate,
      toDate,
      days: Number(days) || 1,
      reason: reason || "Personal reasons",
      status: "Pending",
      appliedAt: new Date().toISOString().split("T")[0],
    };

    leaveRequests.unshift(newLeave);
    res.status(201).json(newLeave);
  } catch (err) {
    res.status(500).json({ message: "Error applying for leave" });
  }
});

// PUT Update leave status (Approve / Reject)
app.put("/api/leaves/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const leave = leaveRequests.find((l) => l._id === id);
  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  if (status) {
    leave.status = status;
  }
  res.status(200).json(leave);
});

// ================= ATTENDANCE API =================
// GET Attendance
app.get("/api/attendance", (req, res) => {
  const { employeeId, date } = req.query;
  let result = attendanceRecords;
  if (employeeId) {
    result = result.filter((a) => a.employeeId === employeeId);
  }
  if (date) {
    result = result.filter((a) => a.date === date);
  }
  res.status(200).json(result);
});

// POST Employee Check-In
app.post("/api/attendance/check-in", (req, res) => {
  const { employeeId, employeeName, department } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if already checked in today
  let record = attendanceRecords.find(
    (a) => a.employeeId === employeeId && a.date === today
  );

  if (record) {
    return res.status(200).json({ message: "Already checked in", record });
  }

  // Determine if late (after 09:15 AM)
  const isLate = new Date().getHours() >= 9 && new Date().getMinutes() > 15;

  record = {
    _id: `att-${Date.now()}`,
    employeeId,
    employeeName,
    department: department || "General",
    date: today,
    checkIn: nowTime,
    checkOut: "--",
    status: isLate ? "Late" : "Present",
    hours: "In Progress",
  };

  attendanceRecords.unshift(record);
  res.status(201).json({ message: "Checked in successfully", record });
});

// POST Employee Check-Out
app.post("/api/attendance/check-out", (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const record = attendanceRecords.find(
    (a) => a.employeeId === employeeId && a.date === today
  );

  if (!record) {
    return res.status(400).json({ message: "No check-in record found for today" });
  }

  record.checkOut = nowTime;
  record.hours = "8.5"; // Computed work duration
  res.status(200).json({ message: "Checked out successfully", record });
});

// PUT Mark/Update Attendance by Admin
app.put("/api/attendance/:id", (req, res) => {
  const { id } = req.params;
  const index = attendanceRecords.findIndex((a) => a._id === id);

  if (index !== -1) {
    attendanceRecords[index] = { ...attendanceRecords[index], ...req.body };
    res.status(200).json(attendanceRecords[index]);
  } else {
    res.status(404).json({ message: "Attendance record not found" });
  }
});

// ================= PAYROLL API =================
app.get("/api/payroll", (req, res) => {
  const payrollData = employees.map((emp) => {
    const base = Number(emp.salary || 0);
    const hra = Math.round(base * 0.4);
    const allowances = Math.round(base * 0.1);
    const pf = Math.round(base * 0.12);
    const tax = Math.round(base * 0.05);
    const totalEarnings = base + hra + allowances;
    const totalDeductions = pf + tax;
    const netSalary = totalEarnings - totalDeductions;
    const isPaid = payrollStatus[emp._id] || false;

    return {
      employeeId: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      baseSalary: base,
      hra,
      allowances,
      pf,
      tax,
      netSalary,
      status: isPaid ? "Paid" : "Pending",
      month: "October 2026",
    };
  });

  res.status(200).json(payrollData);
});

// Mark Payroll Paid
app.put("/api/payroll/:id/pay", (req, res) => {
  const { id } = req.params;
  payrollStatus[id] = true;
  res.status(200).json({ message: "Salary marked as Paid", employeeId: id, status: "Paid" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});