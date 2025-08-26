export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;           // UUID
  name: string;
  frequency: Frequency;
  createdAt: string;    // ISO date
  completions: string[];// ISO dates
  streak: number;
  points: number;
}
