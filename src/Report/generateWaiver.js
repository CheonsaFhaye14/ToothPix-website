import { useState } from "react";
import { jsPDF } from "jspdf";
import waiverImg from "../assets/Waiver.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function WaiverButton({ patient }) {
  const [loading, setLoading] = useState(false);

  // ✅ Helper to capitalize every word
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const generateWaiver = (patient) => {
    setLoading(true);

    const doc = new jsPDF("p", "mm", "a4");
    const img = new Image();
    img.src = waiverImg;

    img.onload = () => {
      doc.addImage(img, "PNG", 0, 0, 210, 297);

      doc.setFontSize(12);

      // Overlay patient details at chosen coordinates
      doc.text(`${patient.name}`, 37, 82);
      doc.text(`${patient.birthday}`, 42, 88);

      // ✅ Capitalize every word in address
      doc.text(capitalizeWords(patient.address), 42, 95);

      doc.text(`${patient.phone}`, 55, 101);

      doc.setFontSize(9);

      const safeName = patient.name.replace(/\s+/g, "-");
      doc.save(`${safeName}-waiver.pdf`);

      setLoading(false);
    };

    img.onerror = () => {
      console.error("Failed to load waiver image");
      setLoading(false);
    };
  };

  return (
    <button
      className="btn-pdf"
      onClick={() => generateWaiver(patient)}
      disabled={loading}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} spin />
      ) : (
        "Download Patient Waiver"
      )}
    </button>
  );
}
