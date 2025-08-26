export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;           // UUID
  name: string;
  frequency: Frequency;
  createdAt: string;    // ISO date
  completions: string[];// ISO dates
  // For weekly habits: how many days per calendar week are required to count as a completion
  weeklyTarget?: number;
  streak: number;
  points: number;
}
