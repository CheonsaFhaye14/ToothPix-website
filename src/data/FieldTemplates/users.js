const baseFields = [ 
  { name: "profile_image", placeholder: "Profile Picture", type: "picture" },
  { name: "firstname", placeholder: "First Name", required: true },
  { name: "lastname", placeholder: "Last Name", required: true },
  { name: "username", placeholder: "Username", required: true },
  { name: "email", placeholder: "Email", type: "email", required: true },
  { name: "password", placeholder: "Password", type: "password", required: true },
];

const genderField = { 
  name: "gender", 
  placeholder: "Gender", 
  type: "select", 
  options: [
    { label: "Female", value: "female" },
    { label: "Male", value: "male" }
  ], 
  required: true 
};

// Allow free input for allergies
const allergiesField = {
  name: "allergies",
  placeholder: "Allergies",
  type: "select-multiple",
  options: [
    { label: "Peanuts", value: "peanuts" },
    { label: "Dairy", value: "dairy" },
    { label: "Gluten", value: "gluten" },
    { label: "Seafood", value: "seafood" },
    { label: "Eggs", value: "eggs" },
    { label: "Soy", value: "soy" }
  ],
  allowCustom: true // <-- enable free input
};

// Allow free input for medical history
const medicalHistoryField = {
  name: "medicalhistory",
  placeholder: "Medical History",
  type: "select-multiple",
  options: [
    { label: "Diabetes", value: "diabetes" },
    { label: "Hypertension", value: "hypertension" },
    { label: "Asthma", value: "asthma" },
    { label: "Heart Disease", value: "heart_disease" }
  ],
  allowCustom: true // <-- enable free input
};

export const fieldTemplates = {
  Admin: [...baseFields],
  Patient: [
    ...baseFields,
    { name: "birthdate", placeholder: "Birthday", type: "pastdate", required: true },
    genderField,
    { name: "address", placeholder: "Address", required: true },
    { name: "contact", placeholder: "Contact", required: true },
    allergiesField,
    medicalHistoryField,
  ],
  Dentist: [
    ...baseFields,
    { name: "birthdate", placeholder: "Birthday", type: "pastdate", required: true },
    genderField,
    { name: "address", placeholder: "Address", required: true },
    { name: "contact", placeholder: "Contact", required: true },
  ],
};
