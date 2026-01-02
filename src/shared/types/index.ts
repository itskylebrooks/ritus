export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string; // UUID
  name: string;
  frequency: Frequency;
  createdAt: string; // ISO date
  completions: string[]; // ISO dates
  archived?: boolean; // hide from default views when true
  mode?: 'build' | 'break'; // 'build' = do the habit, 'break' = avoid the habit
  // For weekly habits: how many days per calendar week are required to count as a completion
  weeklyTarget?: number;
  // For monthly habits: how many times per calendar month are required to count as a completion
  monthlyTarget?: number;
  streak: number;
  points: number;
}
