export type RecurrenceType = 'once' | 'daily' | 'weekly';

export interface ScheduledTask {
  id: string;
  title: string;
  recurrenceType: RecurrenceType;
  isActive: boolean;
  description?: string;
  priority?: string;
  daysOfWeek?: number[];
  scheduledDate?: string;
  startHour?: string;
  endHour?: string;
  lastGeneratedDate?: string;
}
