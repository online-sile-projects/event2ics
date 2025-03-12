/**
 * Generate ICS file content from event data
 * @param {Object} eventData - Event information
 * @returns {string} - ICS file content
 */
function generateICS(eventData) {
  // Create a unique identifier for the event
  const uuid = generateUUID();
  
  // Format dates for ICS (remove colons and hyphens)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  };
  
  const startDate = formatDate(eventData.start);
  const endDate = formatDate(eventData.end);
  const now = formatDate(new Date());
  
  // Build ICS content
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event2ICS//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uuid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escape(eventData.title)}`,
  ].join('\r\n');
  
  // Add location if available
  if (eventData.location) {
    icsContent += `\r\nLOCATION:${escape(eventData.location)}`;
  }
  
  // Add description if available
  if (eventData.description) {
    icsContent += `\r\nDESCRIPTION:${escape(eventData.description)}`;
  }
  
  // Complete the ICS content
  icsContent += '\r\nEND:VEVENT\r\nEND:VCALENDAR';
  
  return icsContent;
}

/**
 * Generate a UUID for the event
 * @returns {string} - UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Escape special characters in ICS fields
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escape(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
