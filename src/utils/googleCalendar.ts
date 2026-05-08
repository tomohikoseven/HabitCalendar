/**
 * Google Calendar API Utility and Calendar Grid Logic
 */

export interface DailyStudyTime {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface CalendarDay {
  date: string;
  minutes: number;
  level: number;
}

export interface MonthLabel {
  name: string;
  weekIndex: number;
}

/**
 * Fetches and aggregates study time from Google Calendar
 */
export async function fetchStudyTime(
  apiKey: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<Record<string, number>> {
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.append('key', apiKey);
  url.searchParams.append('timeMin', timeMin);
  url.searchParams.append('timeMax', timeMax);
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Google Calendar API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const items = data.items || [];
  const studyTimeByDay: Record<string, number> = {};

  for (const item of items) {
    const start = item.start?.dateTime || item.start?.date;
    const end = item.end?.dateTime || item.end?.date;
    
    if (!start || !end) continue;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    const dateKey = startDate.toISOString().split('T')[0];
    studyTimeByDay[dateKey] = (studyTimeByDay[dateKey] || 0) + durationMinutes;
  }

  return studyTimeByDay;
}

/**
 * Determines the contribution level (0-4) based on minutes
 */
export function getStudyLevel(minutes: number): number {
  if (minutes >= 240) return 4;
  if (minutes >= 120) return 3;
  if (minutes >= 60) return 2;
  if (minutes >= 30) return 1;
  return 0;
}

/**
 * Generates data for the calendar grid
 */
export function generateCalendarData(year: number, studyData: Record<string, number>) {
  const days: CalendarDay[] = [];
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year}-12-31T23:59:59Z`);

  // Align start to the previous Sunday
  const current = new Date(startDate);
  while (current.getUTCDay() !== 0) {
    current.setUTCDate(current.getUTCDate() - 1);
  }

  const limitDate = new Date(endDate);
  let safetyCounter = 0;

  while (current <= limitDate && safetyCounter < 400) {
    const dateStr = current.toISOString().split('T')[0];
    const mins = studyData[dateStr] || 0;
    days.push({
      date: dateStr,
      minutes: mins,
      level: getStudyLevel(mins)
    });
    current.setUTCDate(current.getUTCDate() + 1);
    safetyCounter++;
  }

  return days;
}

/**
 * Generates month labels with their week positions
 */
export function generateMonthLabels(year: number, days: CalendarDay[]): MonthLabel[] {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels: MonthLabel[] = [];
  let currentMonth = -1;

  days.forEach((day, index) => {
    const dateObj = new Date(day.date);
    const month = dateObj.getUTCMonth();
    const dateYear = dateObj.getUTCFullYear();
    const weekIndex = Math.floor(index / 7) + 1;

    if (dateYear === year && month !== currentMonth) {
      labels.push({ name: monthNames[month], weekIndex });
      currentMonth = month;
    }
  });

  return labels;
}

/**
 * Formats minutes into "X時間Y分" or "Y分"
 */
export function formatStudyTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}時間${m}分` : `${m}分`;
}
