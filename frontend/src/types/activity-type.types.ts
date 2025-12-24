export enum Day {
  J_1 = 'J_1',
  J_2 = 'J_2',
}

export interface ActivityType {
  id: number;
  name: string;
  description: string | null;
  earliestTime?: Date;
  latestTime?: Date;
  day: Day;
}