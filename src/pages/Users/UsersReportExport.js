import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { formatDateTime } from "../../utils/formatDateTime.jsx";
import "../../design/fullreport.css";
import formBackground from '../../assets/formbackground.png'; // ✅ import background


export default function UsersReportExport({ users }) {
  console.log(users)
  const sortedUsers = [...users].sort((a, b) => a.idusers - b.idusers);

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const safeValue = (val, capitalize = false, forPDF = false) => {
    if (!val || val === "null" || val === "undefined") return forPDF ? "—" : "";
    const clean = String(val).trim();
    return capitalize ? capitalizeWords(clean) : clean;
  };

  const handleDownloadCSV = () => {
    if (!sortedUsers.length) {
      alert("No user data available to export.");
      return;
    }

    const filteredUsers = sortedUsers.map(user => ({
      ID: safeValue(user.idusers),
      Username: safeValue(user.username),
      Email: safeValue(user.email),
      "User Type": safeValue(user.usertype, true),
      Firstname: safeValue(user.firstname, true),
      Lastname: safeValue(user.lastname, true),
      Birthdate: user.birthdate || "", // leave as-is
      Contact: safeValue(user.contact),
      Address: safeValue(user.address, true),
      Gender: safeValue(user.gender, true),
      Allergies: safeValue(user.allergies, true),
      "Medical History": safeValue(user.medicalhistory, true),
      "Date Created": user.created_at ? formatDateTime(user.created_at) : "",
    }));

    const csv = Papa.unparse(filteredUsers, { quotes: false });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users_report.csv");
  };

const handleDownloadUserPDF = async () => {
  if (!Array.isArray(sortedUsers) || sortedUsers.length === 0) {
    alert("No user data available to export.");
    return;
  }

  const doc = new jsPDF("portrait");
  const bgImg = new Image();
  bgImg.src = formBackground;

  const capitalizeWords = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper to load an image from URL and return when ready
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  bgImg.onload = async () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      doc.addImage(bgImg, "PNG", 0, 0, pageWidth, pageHeight);
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("User Report", pageWidth / 2, 23, { align: "center" });
      doc.setTextColor(0, 0, 0);
    };

    for (let index = 0; index < sortedUsers.length; index++) {
      const user = sortedUsers[index];
      if (index > 0) doc.addPage();
      addHeader();

      const topMargin = 40;
      const bottomMargin = 30;
      const availableHeight = pageHeight - topMargin - bottomMargin;

      let y = topMargin;
      const lineSpacing = 14;

      // Draw box
      doc.setDrawColor(0);
      doc.rect(14, topMargin, pageWidth - 28, availableHeight);

      // Full name
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const fullName = capitalizeWords(
        `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Unknown"
      );
      doc.text(`Name: ${fullName}`, 18, y + 8);
      y += 18;

      // Username
      if (user.username) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.text(`Username: ${capitalizeWords(user.username)}`, 18, y + 6);
        y += 16;
      }

      // Profile picture on right side
      if (user.profile_image) {
        try {
          const profileImg = await loadImage(user.profile_image);
          const imgSize = 40;
          doc.addImage(profileImg, "JPEG", pageWidth - imgSize - 20, topMargin + 10, imgSize, imgSize);
        } catch (err) {
          console.error("Error loading profile image:", err);
        }
      }

      // Fields
      const fields = [
        ["ID", user.idusers],
        ["Email", user.email],
        ["User Type", user.usertype],
        ["Firstname", user.firstname],
        ["Lastname", user.lastname],
        ["Birthdate", user.birthdate],
        ["Contact", user.contact],
        ["Address", user.address],
        ["Gender", user.gender],
        ["Allergies", user.allergies],
        ["Medical History", user.medicalhistory],
        ["Date Created", user.created_at ? formatDateTime(user.created_at) : ""],
      ].filter(([label, value]) => value != null && String(value).trim() !== "");

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      fields.forEach(([label, value]) => {
        const formattedValue = (typeof value === "string" && isNaN(value))
          ? capitalizeWords(value)
          : value;
        doc.text(`${label}: ${formattedValue}`, 24, y);
        doc.line(22, y + 2, pageWidth - 22, y + 2);
        y += lineSpacing;
      });

      while (y < pageHeight - bottomMargin - 10) {
        doc.text(" ", 24, y);
        y += lineSpacing;
      }
    }

    doc.save("users_report.pdf");
  };
};



  return (
    <div className="mb-3" style={{ display: "flex", gap: "12px" }}>
      <button
        onClick={handleDownloadCSV}
        className="btn-csv"
        disabled={!sortedUsers.length}
      >
        Export CSV
      </button>
      <button
        onClick={handleDownloadUserPDF}
        className="btn-pdf"
        disabled={!sortedUsers.length}
      >
        Export PDF
      </button>
    </div>
  );
}
