// utils/formatDateTime.js

export function formatDateTime(value) {
  const date = new Date(value);
  if (isNaN(date)) return value.toString();

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options).replace(",", "");
}
