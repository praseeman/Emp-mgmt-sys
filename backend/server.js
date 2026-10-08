const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// In-memory employee array
let employees = [
  {
    _id: "1",
    name: "Praseeman",
    email: "sppraseeman@gmail.com",
    phone: "8248070608",
    department: "HR",
    salary: 35000,
  },
];

// GET All Employees
app.get("/api/employees", (req, res) => {
  res.status(200).json(employees);
});

// POST New Employee (Creating Data)
app.post("/api/employees", (req, res) => {
  try {
    const { name, email, phone, department, salary } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    const newEmployee = {
      _id: Date.now().toString(),
      name,
      email,
      phone,
      department,
      salary: Number(salary),
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});