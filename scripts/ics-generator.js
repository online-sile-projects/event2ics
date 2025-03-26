// ICS Generator Module
// Converts extracted event data into ICS format for calendar integration

class IcsGenerator {
  constructor() {
    // ICS file header and footer
    this.header = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//event2ics//Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';
    this.footer = 'END:VCALENDAR';
  }

  // Format text for ICS (handle line breaks, special characters, etc.)
  formatIcsValue(value) {
    if (!value) return '';
    return value
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\\/g, '\\\\');
  }

  // Parse date and time strings into a Date object
  parseDateTime(dateStr, timeStr) {
    let date = new Date();
    
    // Parse date if provided
    if (dateStr) {
      // Try different date formats
      const dateParts = dateStr.match(/(\d{1,4})[-\/\.](\d{1,2})[-\/\.](\d{1,4})/);
      if (dateParts) {
        // Determine year, month, day based on format
        let year, month, day;
        
        // Check if first part is year (2023) or day (31)
        if (dateParts[1].length === 4) {
          year = parseInt(dateParts[1]);
          month = parseInt(dateParts[2]) - 1;  // Month is 0-indexed in JS Date
          day = parseInt(dateParts[3]);
        } else {
          day = parseInt(dateParts[1]);
          month = parseInt(dateParts[2]) - 1;
          year = parseInt(dateParts[3]);
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
        }
        
        date.setFullYear(year, month, day);
      }
    }
    
    // Parse time if provided
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*([ap]\.?m\.?)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2] || '0');
        const isPM = timeMatch[3] && timeMatch[3].toLowerCase().startsWith('p');
        
        // Adjust hours for PM
        if (isPM && hours < 12) {
          hours += 12;
        } else if (!isPM && hours === 12) {
          hours = 0;  // 12 AM is 0 in 24-hour format
        }
        
        date.setHours(hours, minutes, 0, 0);
      }
    }
    
    return date;
  }

  // Format date for ICS
  formatIcsDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Generate ICS content from event data
  generateICS(eventData) {
    if (!eventData) {
      throw new Error('Event data is required');
    }
    
    const startDate = this.parseDateTime(eventData.date, eventData.time);
    
    // Default end date is 1 hour after start
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    // Generate a unique ID for the event
    const uid = 'event-' + Date.now() + '@event2ics';
    
    // Build the event
    let event = 'BEGIN:VEVENT\r\n';
    event += `UID:${uid}\r\n`;
    event += `DTSTAMP:${this.formatIcsDate(new Date())}\r\n`;
    event += `DTSTART:${this.formatIcsDate(startDate)}\r\n`;
    event += `DTEND:${this.formatIcsDate(endDate)}\r\n`;
    event += `SUMMARY:${this.formatIcsValue(eventData.title)}\r\n`;
    
    // Add location if available
    if (eventData.location) {
      event += `LOCATION:${this.formatIcsValue(eventData.location)}\r\n`;
    }
    
    // Add description if available
    if (eventData.description) {
      event += `DESCRIPTION:${this.formatIcsValue(eventData.description)}\r\n`;
    }
    
    event += 'END:VEVENT\r\n';
    
    // Combine header, event, and footer
    return this.header + event + this.footer;
  }

  // Create and download the ICS file
  downloadICS(eventData, filename = 'event.ics') {
    try {
      const icsContent = this.generateICS(eventData);
      
      // Create blob and download
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error generating ICS file:', error);
      return false;
    }
  }
}

// Create a global instance
const icsGenerator = new IcsGenerator();