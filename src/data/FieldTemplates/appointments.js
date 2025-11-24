export const fieldTemplates = {
  Appointments: [
    {
  name: "patient",
  placeholder: "Patient",
  type: "select", 
  options: [],
  required: true,
  allowCustom: true, 
},
  {
  name: "dentist",
  placeholder: "Dentist",
  type: "select", 
  options: [],
  required: true,
},
    { name: "date", placeholder: "Appointment Date", type: "futuredate", required: true },
{
  name: "time",
  placeholder: "Appointment Time",
  type: "futuretime",
  options: [
    { label: "9 AM", value: "09:00" },
    { label: "10 AM", value: "10:00" },
    { label: "11 AM", value: "11:00" },
    { label: "12 PM", value: "12:00" },
    { label: "1 PM", value: "13:00" },
    { label: "2 PM", value: "14:00" },
    { label: "3 PM", value: "15:00" },
    { label: "4 PM", value: "16:00" },
    { label: "5 PM", value: "17:00" },
    { label: "6 PM", value: "18:00" }
  ],
  required: true
},

    { name: "services", placeholder: "Service", type: "select-multiple",required: true },

  ]
};
