import React, { useState, useEffect } from "react";
import CustomSelect from "../../utils/Select/CustomSelect.jsx"; 
import FloatingInput from "../../utils/InputForm.jsx";           
import FloatingTextArea from "../../utils/FloatingTextArea.jsx"; 

export default function InstallmentModal({ 
  open, 
  services = [], // array of { name, price, allow_installment, installment_times, paid_amount }
  onConfirm, 
  onClose,
  appointmentDate
}) {
  const [selectedMonths, setSelectedMonths] = useState({}); 

useEffect(() => {
  if (!open) return; // only initialize when modal opens

  const initialSelection = {};
  services.forEach((svc) => {
    if (svc.allow_installment) {
      initialSelection[svc.name] = 1; // default 1 month
    }
  });
  setSelectedMonths(initialSelection);
}, [open, services]); // run whenever modal opens or services change



  if (!open) return null;

  const today = new Date();
  const baseDate = new Date(appointmentDate);
  const validBaseDate = isNaN(baseDate.getTime()) ? today : baseDate;

  const calculateTotal = () => {
    return services.reduce((sum, svc) => {
      if (svc.allow_installment) {
        const months = selectedMonths[svc.name] || 0;
        const monthlyPrice = svc.price / svc.installment_times;
        return sum + (monthlyPrice * months);
      } else {
        return sum + svc.price;
      }
    }, 0);
  };

  // ✅ Instead of returning all due dates, return only the last one based on months selected
  const getDueDate = (months) => {
    if (!months) return "";
    const due = new Date(validBaseDate);
    due.setMonth(due.getMonth() + (months - 1)); // last selected month
    return due.toISOString().split("T")[0];
  };

  // 👇 Build combined summary string
  const combinedSummary = services.map((svc) => {
    if (svc.allow_installment) {
      return `${svc.name}: ₱${(svc.price / svc.installment_times).toFixed(2)} × ${svc.installment_times} months`;
    } else {
      return `${svc.name}: ₱${svc.price.toFixed(2)}`;
    }
  }).join("\n");

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-title">Payment</h2>
        <div className="modal-body">

          {/* ✅ Combined services overview */}
          <FloatingTextArea
            name="services-summary"
            value={combinedSummary}
            placeholder="Services"
            readOnly
            rows={services.length}
          />

          {/* Keep installment controls per service */}
          {services.map((svc) => {
            const monthsSelected = selectedMonths[svc.name];
            const dueDate = svc.allow_installment ? getDueDate(monthsSelected) : "";

            return (
              <div key={svc.name} className="service-row">
                {svc.allow_installment && (
                  <>
                    <CustomSelect
                      name={svc.name}
                      placeholder="Select months to pay"
                      options={Array.from({ length: svc.installment_times }, (_, i) => ({
                        label: `${i + 1} month${i + 1 > 1 ? "s" : ""}`,
                        value: i + 1
                      }))}
                      value={monthsSelected || ""}
                      onChange={(e) =>
                        setSelectedMonths({
                          ...selectedMonths,
                          [svc.name]: parseInt(e.target.value, 10),
                        })
                      }
                    />

                    {dueDate && (
                      <FloatingInput
                        name={`${svc.name}-due`}
                        value={dueDate}
                        placeholder="Due Date"
                        readOnly
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}

          <FloatingInput
            name="total"
            value={`₱${calculateTotal().toFixed(2)}`}
            placeholder="Total to pay now"
            readOnly
          />

          <div className="modal-buttons">
            <button
              className="btn-submit"
              onClick={() => onConfirm(selectedMonths, calculateTotal())}
            >
              Confirm
            </button>
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
