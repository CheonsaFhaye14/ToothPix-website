import React, { useRef, useEffect, useState } from "react";
import "./AddChoice.css";

export default function AddChoice({ choices, onSelect }) {
  const [isOpen, setIsOpen] = useState(true); // control dropdown visibility
  const containerRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div ref={containerRef} className="add-choice-container">
      <div className="add-choice-dropdown">
        {choices.map((choice) => (
          <div
            key={choice}
            className="add-choice-item"
            onClick={() => {
              onSelect(choice);
              setIsOpen(false); // close dropdown after selecting
            }}
          >
            {choice}
          </div>
        ))}
      </div>
    </div>
  );
}
