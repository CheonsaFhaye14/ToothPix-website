// utils/formatDateTime.js

/**
 * Formats a given date/time string or Date object to Philippine Time (PHT)
 * Output format: MM/DD/YYYY hh:mm AM/PM
 * @param {string | Date} value
 * @returns {string}
 */
export function formatDateTime(value) {
  const date = new Date(value);
  if (isNaN(date)) return value.toString();

  // Convert to UTC first
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;

  // Add 8 hours to get Philippine Time (UTC+8)
  const phTime = new Date(utcTime + 8 * 60 * 60 * 1000);

  // Extract formatted components
  const month = String(phTime.getMonth() + 1).padStart(2, "0");
  const day = String(phTime.getDate()).padStart(2, "0");
  const year = phTime.getFullYear();

  let hours = phTime.getHours();
  const minutes = String(phTime.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  if (hours === 0) hours = 12; // handle 12 AM/PM

  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}
