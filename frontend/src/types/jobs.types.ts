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
  fullPayQrCode?: string;
  firstPayQrCode?: string;
  secondPayQrCode?: string;
  nbrParticipants: number;
  isActive: boolean;
  hotelId?: number;
}
