import { useState, useRef, useEffect } from "react";     
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import "./CustomDate.css";

export default function CustomDate({ value, onChange, placeholder, name }) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const [selectedDate, setSelectedDate] = useState(value || "");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [view, setView] = useState("days"); // "days" | "months" | "years"

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const years = Array.from({ length: 100 }, (_, i) => today.getFullYear() - i);
  const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const containerRef = useRef(null);

  useEffect(() => {
  setSelectedDate(value || "");
}, [value]);

  const handleDayClick = (day) => {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    setSelectedDate(formatted);
    onChange && onChange({ target: { name, value: formatted } });
    setShowCalendar(false);
  };

  const handleMonthClick = (monthIndex) => {
    setCurrentMonth(monthIndex);
    setView("days");
  };

  const handleYearClick = (year) => {
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
    if (!d) return <div key={`empty-${idx}`}></div>; // empty slot
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const isToday = formatted === todayStr;
    return (
      <div
        key={`day-${d}-${idx}`} // unique key
        onClick={() => handleDayClick(d)}
        className={`day ${selectedDate === formatted ? "selected" : ""} ${isToday ? "today" : ""}`}
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
              {monthNames.map((m, idx) => (
                <div key={m} onClick={() => handleMonthClick(idx)} className={`month ${idx === currentMonth ? "selected" : ""}`}>
                  {m}
                </div>
              ))}
            </div>
          )}

          {/* Years View */}
          {view === "years" && (
            <div className="years-grid">
              {years.map(y => (
                <div key={y} onClick={() => handleYearClick(y)} className={`year ${y === currentYear ? "selected" : ""}`}>
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
