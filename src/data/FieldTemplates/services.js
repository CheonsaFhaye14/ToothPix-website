export const fieldTemplates = {
  Services: [
    { name: "name", placeholder: "Service Name", type: "text", required: true },
    { name: "description", placeholder: "Description", type: "textarea" },
    { name: "price", placeholder: "Price", type: "number", required: true },
{
  name: "category",
  placeholder: "Category",
  type: "select", // could be "select-multiple" if using CustomSelectMultiple
  options: [], // initial categories
  required: true,
  allowCustom: true, // ✅ allow the user to type a new category
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
      placeholder: "Installment Count", 
      type: "number",
      showIf: (form) => form.allow_installment === true,
      requiredIf: (form) => form.allow_installment === true,
    },
    { 
      name: "installment_interval", 
      placeholder: "Installment Interval",
      type: "select",
      options: ["weekly", "monthly", "custom"],
      showIf: (form) => form.allow_installment === true,
      requiredIf: (form) => form.allow_installment === true
    },
    {
      name: "custom_interval_days",
      placeholder: "Custom Interval (days)",
      type: "number",
      showIf: (form) => 
        form.allow_installment === true && form.installment_interval === "custom",
      requiredIf: (form) => 
        form.allow_installment === true && form.installment_interval === "custom"
    },
  ]
};
