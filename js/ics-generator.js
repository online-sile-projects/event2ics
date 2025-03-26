export function generateICS(eventInfo) {
    const now = new Date().toISOString().replace(/[-:.]/g, '');
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//event2ics//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${now}-${Math.random().toString(36).substr(2, 9)}
DTSTAMP:${now}
DTSTART:${eventInfo.startDate}
DTEND:${eventInfo.endDate}
SUMMARY:${eventInfo.title}
LOCATION:${eventInfo.location}
DESCRIPTION:${eventInfo.description}
END:VEVENT
END:VCALENDAR`;
}

export function downloadICS(icsContent) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}