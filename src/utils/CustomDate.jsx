import { useState, useRef, useEffect } from "react";     
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import "./CustomDate.css";

export default function CustomDate({ value, onChange, placeholder, name, minDate, maxDate }) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const min = minDate ? new Date(new Date(minDate).setHours(0,0,0,0)) : null;
  const max = maxDate ? new Date(new Date(maxDate).setHours(23,59,59,999)) : null;

  const initialDate = value ? new Date(value) : today;
  const [selectedDate, setSelectedDate] = useState(value || "");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [view, setView] = useState("days"); // "days" | "months" | "years"

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const years = Array.from({ length: 200 }, (_, i) => today.getFullYear() - 100 + i); // wider range

  const containerRef = useRef(null);

  useEffect(() => {
    setSelectedDate(value || "");
  }, [value]);

  const handleDayClick = (day) => {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const selected = new Date(formatted);
    if ((min && selected < min) || (max && selected > max)) return;
    setSelectedDate(formatted);
    onChange && onChange({ name, value: formatted });
    setShowCalendar(false);
  };

  const handleMonthClick = (monthIndex) => {
    const firstOfMonth = new Date(currentYear, monthIndex, 1);
    if ((min && firstOfMonth < new Date(min.getFullYear(), min.getMonth(), 1)) ||
        (max && firstOfMonth > new Date(max.getFullYear(), max.getMonth(), 1))) return;

    setCurrentMonth(monthIndex);
    setView("days");
  };

  const handleYearClick = (year) => {
    if ((min && year < min.getFullYear()) || (max && year > max.getFullYear())) return;
    setCurrentYear(year);
    setView("months");
  };

  // Days for current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const offset = (firstDayOfWeek + 6) % 7; // Monday = 0
  const daysArray = [
    ...Array.from({ length: offset }).map(() => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-date-container" ref={containerRef}>
      <input
        type="text"
        value={selectedDate}
        placeholder=" "
        readOnly
        className="floating-input"
        onClick={() => setShowCalendar(prev => !prev)}
      />
      <label className={`floating-label ${selectedDate ? "has-value" : ""}`}>
        {placeholder}
      </label>
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className="calendar-icon"
        onClick={() => setShowCalendar(prev => !prev)}
      />

      {showCalendar && (
        <div className="calendar-popup">
          {/* Header */}
          <div className="calendar-header">
            {view === "days" && <span onClick={() => setView("months")}>{monthNames[currentMonth]} {currentYear}</span>}
            {view === "months" && <span onClick={() => setView("years")}>{currentYear}</span>}
            {view === "years" && <span>{currentYear}</span>}
          </div>

          {/* Days View */}
          {view === "days" && (
            <>
              <div className="weekdays">
                {weekdays.map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="days-grid">
                {daysArray.map((d, idx) => {
                  if (!d) return <div key={`empty-${idx}`}></div>;
                  const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const dayDate = new Date(formatted);
                  const disabled = (min && dayDate < min) || (max && dayDate > max);
                  const isToday = formatted === todayStr;

                  return (
                    <div
                      key={`day-${d}-${idx}`}
                      onClick={() => !disabled && handleDayClick(d)}
                      className={`day ${selectedDate === formatted ? "selected" : ""} ${isToday ? "today" : ""} ${disabled ? "disabled" : ""}`}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Months View */}
          {view === "months" && (
            <div className="months-grid">
              {monthNames.map((m, idx) => {
                const firstOfMonth = new Date(currentYear, idx, 1);
                const disabled = (min && firstOfMonth < new Date(min.getFullYear(), min.getMonth(), 1)) ||
                                 (max && firstOfMonth > new Date(max.getFullYear(), max.getMonth(), 1));
                return (
                  <div
                    key={m}
                    onClick={() => !disabled && handleMonthClick(idx)}
                    className={`month ${idx === currentMonth ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                  >
                    {m}
                  </div>
                );
              })}
            </div>
          )}

         {/* Years View */}
{view === "years" && (
  <div className="years-grid">
    {years
      .filter(y => (!min || y >= min.getFullYear()) && (!max || y <= max.getFullYear()))
      .map(y => (
        <div
          key={y}
          onClick={() => handleYearClick(y)}
          className={`year ${y === currentYear ? "selected" : ""}`}
        >
          {y}
        </div>
      ))}
  </div>
)}

        </div>
      )}
    </div>
  );
}
