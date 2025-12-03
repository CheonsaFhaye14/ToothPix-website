import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import '../../design/fullreport.css';

export default function UsersReportExport({ users }) {
  // Sort by idusers first
  const sortedUsers = [...users].sort((a, b) => a.idusers - b.idusers);

  const handleDownloadCSV = () => {
    const filteredUsers = sortedUsers.map(user => ({
      idusers: user.idusers,
      username: user.username,
      email: user.email,
      usertype: user.usertype,
      firstname: user.firstname,
      lastname: user.lastname,
      birthdate: user.birthdate,
      contact: user.contact,
      address: user.address,
      gender: user.gender,
      allergies: user.allergies,
      medicalhistory: user.medicalhistory
    }));

    const csv = Papa.unparse(filteredUsers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users_report.csv');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' }); // landscape for wide table
    doc.setFontSize(14);
    doc.text('Users Report', 14, 15);

    const headers = [[
      'ID',
      'Username',
      'Email',
      'User Type',
      'Firstname',
      'Lastname',
      'Birthdate',
      'Contact',
      'Address',
      'Gender',
      'Allergies',
      'Medical History'
    ]];

    const data = sortedUsers.map(user => [
      user.idusers,
      user.username,
      user.email,
      user.usertype,
      user.firstname,
      user.lastname,
      user.birthdate,
      user.contact,
      user.address,
      user.gender,
      user.allergies,
      user.medicalhistory
    ]);

    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    doc.save('users_report.pdf');
  };

return (
  <div className="mb-3" style={{ display: 'flex', gap: '12px' }}>
    <button onClick={handleDownloadCSV} className="btn-csv">
      Export CSV
    </button>
    <button onClick={handleDownloadPDF} className="btn-pdf">
      Export PDF
    </button>
  </div>
);

}
