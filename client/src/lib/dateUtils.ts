/**
 * Format a date string to display format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}

/**
 * Get the current date as a formatted string
 */
export function getCurrentDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  return now.toLocaleDateString("en-US", options);
}

/**
 * Format time to readable format (HH:MM)
 */
export function formatTimeToDisplayTime(time: string): string {
  // Assuming time is in 24h format like "14:30" or "09:00"
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHour}:${minutes} ${period}`;
}

/**
 * Calculate duration between two time strings
 */
export function calculateDuration(startTime: string, endTime: string): string {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  
  let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  
  // Handle if end time is on the next day
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
  }
  return `${minutes}m`;
}

/**
 * Format hours and minutes from total minutes
 */
export function formatHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
  }
  return `${minutes}m`;
}

/**
 * Get days left until a date
 */
export function getDaysLeft(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Format due date to display format
 */
export function formatDueDate(dueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  if (due.getTime() === today.getTime()) {
    return "Today";
  } else if (due.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return due.toLocaleDateString("en-US", options);
  }
}

/**
 * Get start and end dates for the current week
 */
export function getCurrentWeekDates(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Set to start of the week (Sunday)
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - dayOfWeek);
  startDate.setHours(0, 0, 0, 0);
  
  // Set to end of the week (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

/**
 * Get start and end dates for the current month
 */
export function getCurrentMonthDates(): { start: string; end: string } {
  const now = new Date();
  
  // Set to start of the month
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Set to end of the month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

/**
 * Get the day name from a date
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
