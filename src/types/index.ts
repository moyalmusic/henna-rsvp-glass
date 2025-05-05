
export interface Guest {
  id: string;
  name: string;
  phone: string;
  group: string;
  attending: boolean | null;
  numberOfGuests: number;
  answered: boolean;
}

export type AttendanceStatus = 'attending' | 'notAttending' | 'notAnswered';

export interface AppSettings {
  confirmationImage?: string;
  whatsappTemplate: string;
  groups: string[];
}
