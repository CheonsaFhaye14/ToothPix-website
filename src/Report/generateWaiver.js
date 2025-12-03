import { jsPDF } from "jspdf";

function generateWaiver(user) {
  const doc = new jsPDF("p", "mm", "a4"); // portrait, millimeters, A4 size

  // Add your Canva PNG as background
  const img = new Image();
  img.src = "../assets/Waiver.png"; // path to your Canva PNG

  img.onload = () => {
    doc.addImage(img, "PNG", 0, 0, 210, 297); // full A4 background

    // Overlay database values at chosen coordinates
    doc.text(user.name, 50, 100);
    doc.text(user.date, 50, 120);
    doc.text(user.signature, 50, 140);

    // Save the PDF
    doc.save("waiver.pdf");
  };
}

// Example usage
generateWaiver({ name: "Juan Dela Cruz", date: "Dec 3, 2025", signature: "Signed" });
