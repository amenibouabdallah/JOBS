export interface Salle {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  type: 'CONFERENCE_ROOM' | 'MEETING_ROOM' | 'WORKSHOP_ROOM' | 'AMPHITHEATER' | 'AUDITORIUM' | 'PANEL_ROOM' | 'OTHER';
}
