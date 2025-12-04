import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import EditModal from "../AddModal/EditModal.jsx"; 
import ShowInfoModal from "../ShowInfoModal/ShowInfoModal.jsx"; // your info modal
import "./calendar.css";
import { formatDateTime } from "../../utils/formatDateTime.jsx"; 

export default function AppointmentCalendar({ appointments = [], table = "Table", onDelete, onEdit }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      extendedProps: info.event.extendedProps,
    });
  };

// 1️⃣ Add completed to your status colors
const statusColors = {
  pending: "#ffb7b7ff",
  rescheduled: "#ffd27f",
  approved: "#7fffd4",
  cancelled: "#b0b0b0",
  completed: "#a0e7a0", // green for completed
};

const borderColors = {
  pending: "#ff2600",
  rescheduled: "#ff9d00",
  approved: "#00ff1e",
  cancelled: "#000000",
  completed: "#008000", // dark green border
};


const eventsWithStyles = appointments.map((a) => {
  const formattedTime = new Date(a.start).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    ...a,
    title: `${formattedTime} ${a.extendedProps.patient || "No Patient"}`,
    start: new Date(a.start).toISOString(),
    end: new Date(a.end).toISOString(),
    backgroundColor: statusColors[a.extendedProps.status] || "#ccc",
    borderColor: borderColors[a.extendedProps.status] || "#808080",
    textColor: "#000",
    extendedProps: {
      ...a.extendedProps,   // ✅ keep everything you attached earlier
      time: formattedTime,  // add formatted time
    },
  };
});





  const handleEditSubmit = (updatedData) => {
    console.log("Updated Event:", updatedData);
    setIsEditing(false);
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-wrapper">
      
      <div className="calendar-card">
<div className="calendar-legend">
  <h4>Event Status Colors</h4>
  <ul>
    <li>
      <span className="legend-color" style={{ backgroundColor: statusColors.pending }}></span>
      Pending
    </li>
    <li>
      <span className="legend-color" style={{ backgroundColor: statusColors.rescheduled }}></span>
      Rescheduled
    </li>
    <li>
      <span className="legend-color" style={{ backgroundColor: statusColors.approved }}></span>
      Approved
    </li>
    <li>
      <span className="legend-color" style={{ backgroundColor: statusColors.cancelled }}></span>
      Cancelled
    </li>
    <li>
  <span className="legend-color" style={{ backgroundColor: statusColors.completed }}></span>
  Completed
</li>

  </ul>
</div>


   <FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  events={eventsWithStyles}
  eventClick={handleEventClick}
  height="auto"
  eventDisplay="block"
  displayEventTime={false}
  dayCellClassNames={(arg) => {
    if (arg.isToday) {
      return ["custom-today"];
    }
    return [];
  }}
/>

      </div>

      {/* Show info modal */}
{selectedEvent && !isEditing && (
  <ShowInfoModal
    row={{
      ...selectedEvent.extendedProps,
      id: selectedEvent.id,
      date: formatDateTime(selectedEvent.start),
    }}
    onClose={() => setSelectedEvent(null)}
    fields={[
      { key: "patient", label: "Patient" },
      { key: "dentist", label: "Dentist" },
            { key: "date", label: "Appointment Date" },
      { key: "services", label: "Services" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Notes" },
            { key: "treatment_notes", label: "Notes" },
         { key: "created_at", label: "Date Created" },

    ]}
  >
    {/* Extra footer buttons */}
    <button
      className="btn-edit"
      onClick={() => {
        if (onEdit) {
          onEdit(selectedEvent); // call parent handler
        } else {
          setIsEditing(true); // fallback to local edit modal
        }
      }}
    >
      ✏️ Edit
    </button>

    <button
      className="btn-delete"
      onClick={() => {
        if (onDelete) {
          onDelete(selectedEvent.id); // call parent handler
        }
        setSelectedEvent(null);
      }}
    >
      🗑️ Delete
    </button>
  </ShowInfoModal>
)}


      {/* Show edit modal */}
      {isEditing && selectedEvent && (
        <EditModal
          datatype="appointment"
          selected={{
            ...selectedEvent.extendedProps,
            id: selectedEvent.id,
            date: selectedEvent.start,
          }}
          fields={{
            appointment: [
              { name: "patient", type: "text", placeholder: "Patient Name", required: true },
              { name: "services", type: "text", placeholder: "Services" },
{ name: "status", type: "select", placeholder: "Status", options: ["pending", "rescheduled", "approved", "cancelled", "completed"] },
              { name: "notes", type: "text", placeholder: "Notes" },
              { name: "date", type: "date", placeholder: "Date" },
              { name: "time", type: "text", placeholder: "Time" },
            ],
          }}
          choices={["appointment"]}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
