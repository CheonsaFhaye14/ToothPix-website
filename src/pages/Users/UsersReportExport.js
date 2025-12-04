import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { formatDateTime } from "../../utils/formatDateTime.jsx";
import "../../design/fullreport.css";

export default function UsersReportExport({ users }) {
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

  const handleDownloadPDF = () => {
    if (!sortedUsers.length) {
      alert("No user data available to export.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Users Report", 14, 15);

    const headers = [[
      "ID", "Username", "Email", "User Type", "Firstname", "Lastname",
      "Birthdate", "Contact", "Address", "Gender", "Allergies",
      "Medical History", "Date Created"
    ]];

    const data = sortedUsers.map(user => [
      safeValue(user.idusers, false, true),
      safeValue(user.username, false, true),
      safeValue(user.email, false, true),
      safeValue(user.usertype, true, true),
      safeValue(user.firstname, true, true),
      safeValue(user.lastname, true, true),
      user.birthdate || "—", // leave as-is
      safeValue(user.contact, false, true),
      safeValue(user.address, true, true),
      safeValue(user.gender, true, true),
      safeValue(user.allergies, true, true),
      safeValue(user.medicalhistory, true, true),
      user.created_at ? formatDateTime(user.created_at) : "—"
    ]);

    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("users_report.pdf");
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
        onClick={handleDownloadPDF}
        className="btn-pdf"
        disabled={!sortedUsers.length}
      >
        Export PDF
      </button>
    </div>
  );
}
