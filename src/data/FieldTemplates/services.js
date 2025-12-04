export const fieldTemplates = {
  Services: [
    { name: "name", placeholder: "Service Name", type: "text", required: true },
    { name: "description", placeholder: "Description", type: "textarea" },
    { name: "price", placeholder: "Price", type: "number", required: true },
    {
      name: "category",
      placeholder: "Category",
      type: "select",
      options: [], // will be populated dynamically
      required: true,
      allowCustom: true, // ✅ allow typing a new category
    },
    { 
      name: "allow_installment", 
      placeholder: "Installment", 
      type: "select",  
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false }
      ],
      required: true
    },
    { 
      name: "installment_times", 
      placeholder: "Installment Duration", 
      type: "select",   // ✅ change to select
      options: [
        { label: "3 months", value: 3 },
        { label: "6 months", value: 6 },
        { label: "12 months", value: 12 }
      ],
      showIf: (form) => form.allow_installment === true,
      requiredIf: (form) => form.allow_installment === true,
    },
  ]
};
