import { jsPDF } from "jspdf";
import waiverImg from "../assets/Waiver.png";

// Helper to capitalize every word
const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// ✅ Bulk export function
export const exportAllPatientWaivers = (patients) => {
  patients.forEach((patient) => {
    const doc = new jsPDF("p", "mm", "a4");
    const img = new Image();
    img.src = waiverImg;

    img.onload = () => {
      doc.addImage(img, "PNG", 0, 0, 210, 297);
      doc.setFontSize(12);

      doc.text(`${patient.firstname} ${patient.lastname}`, 37, 82);
      doc.text(`${patient.birthdate}`, 42, 88);
      doc.text(capitalizeWords(patient.address), 42, 95);
      doc.text(`${patient.contact}`, 55, 101);

      doc.setFontSize(9);

      const safeName = `${patient.firstname}-${patient.lastname}`.replace(/\s+/g, "-");
      doc.save(`${safeName}-waiver.pdf`);
    };
  });
};
