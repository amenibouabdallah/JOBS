export interface Jobs {
  id: number;
  title: string;
  description?: string;
  startDate: Date;
  subscriptionDeadline?: Date;
  payStart: Date;
  payDeadline: Date;
  firstPayDeadline: Date;
  PayAmount?: number;
  firstPayAmount?: number;
  secondPayAmount?: number;
  nbrParticipants: number;
  isActive: boolean;
  hotelId?: number;
}
