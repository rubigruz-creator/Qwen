export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // в минутах
  category: string;
}

export interface Master {
  id: string;
  name: string;
  description: string;
  photo: string;
  workStart: string; // "09:00"
  workEnd: string;   // "18:00"
  serviceIds: string[]; // какие услуги оказывает
}

export interface Booking {
  id: string;
  serviceId: string;
  masterId: string;
  date: string; // "2024-01-15"
  time: string; // "10:00"
  clientName: string;
  clientPhone: string;
  comment: string;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type Screen = 'home' | 'services' | 'booking' | 'my-bookings' | 'master-profile' | 'admin' | 'booking-form';
