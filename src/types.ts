export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;           // UUID
  name: string;
  frequency: Frequency;
  createdAt: string;    // ISO date
  completions: string[];// ISO dates
  archived?: boolean;   // hide from default views when true
  mode?: 'build' | 'break'; // 'build' = do the habit, 'break' = avoid the habit
  // For weekly habits: how many days per calendar week are required to count as a completion
  weeklyTarget?: number;
  streak: number;
  points: number;
}
