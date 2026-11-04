/**
 * Node script to compile and write Employee_Management_System_Project_Report.pdf
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { buildProjectReportDoc } from "../src/utils/generateProjectReportPdf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("Generating Comprehensive Project Report PDF...");
  const doc = buildProjectReportDoc(jsPDF, autoTable);
  const pdfBytes = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfBytes);

  // Save in project root directory
  const rootOutputDir = path.resolve(__dirname, "../../");
  const rootOutputFile = path.join(rootOutputDir, "Employee_Management_System_Project_Report.pdf");
  fs.writeFileSync(rootOutputFile, buffer);

  console.log(`Successfully generated Project Report PDF at: ${rootOutputFile}`);
  console.log(`Total Pages: ${doc.internal.getNumberOfPages()}`);
  console.log(`File Size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

run().catch((err) => {
  console.error("Error generating Project Report PDF:", err);
  process.exit(1);
});
