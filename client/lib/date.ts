/**
 * Helper: Formats a Date object or string into 'YYYY-MM-DDTHH:mm'
 * This format is required for 'datetime-local' input elements.
 */
export const formatDate = (dateInput: string | Date): string => {
  // Ensure input is converted to a Date object
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  // Adjust to local timezone offset and return formatted string (up to minutes)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
