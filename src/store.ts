import { Service, Master, Booking } from './types';

const SERVICES_KEY = 'salon_services';
const MASTERS_KEY = 'salon_masters';
const BOOKINGS_KEY = 'salon_bookings';

const defaultServices: Service[] = [
  { id: 's1', name: 'Стрижка женская', price: 1500, duration: 60, category: 'Стрижки' },
  { id: 's2', name: 'Стрижка мужская', price: 800, duration: 30, category: 'Стрижки' },
  { id: 's3', name: 'Окрашивание', price: 3500, duration: 120, category: 'Окрашивание' },
  { id: 's4', name: 'Мелирование', price: 4000, duration: 150, category: 'Окрашивание' },
  { id: 's5', name: 'Маникюр', price: 1200, duration: 60, category: 'Ногти' },
  { id: 's6', name: 'Педикюр', price: 1800, duration: 90, category: 'Ногти' },
  { id: 's7', name: 'Гель-лак', price: 1500, duration: 60, category: 'Ногти' },
  { id: 's8', name: 'Укладка', price: 1000, duration: 45, category: 'Укладка' },
  { id: 's9', name: 'Уход за лицом', price: 2500, duration: 60, category: 'Косметология' },
  { id: 's10', name: 'Массаж лица', price: 2000, duration: 45, category: 'Косметология' },
];

const defaultMasters: Master[] = [
  {
    id: 'm1',
    name: 'Анна Петрова',
    description: 'Стилист с опытом 8 лет. Специализируюсь на женских стрижках и окрашивании.',
    photo: '👩‍🦰',
    workStart: '09:00',
    workEnd: '18:00',
    serviceIds: ['s1', 's3', 's4', 's8'],
  },
  {
    id: 'm2',
    name: 'Елена Сидорова',
    description: 'Мастер маникюра и педикюра. Работаю с гель-лаком и наращиванием.',
    photo: '💅',
    workStart: '10:00',
    workEnd: '19:00',
    serviceIds: ['s5', 's6', 's7'],
  },
  {
    id: 'm3',
    name: 'Мария Козлова',
    description: 'Косметолог-эстетист. Провожу уходовые процедуры и массажи.',
    photo: '🧖‍♀️',
    workStart: '09:00',
    workEnd: '17:00',
    serviceIds: ['s9', 's10'],
  },
  {
    id: 'm4',
    name: 'Дмитрий Волков',
    description: 'Барбер с опытом 5 лет. Мужские стрижки, оформление бороды.',
    photo: '💈',
    workStart: '10:00',
    workEnd: '20:00',
    serviceIds: ['s2'],
  },
];

export function getServices(): Service[] {
  const data = localStorage.getItem(SERVICES_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(defaultServices));
  return defaultServices;
}

export function saveServices(services: Service[]) {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

export function getMasters(): Master[] {
  const data = localStorage.getItem(MASTERS_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(MASTERS_KEY, JSON.stringify(defaultMasters));
  return defaultMasters;
}

export function saveMasters(masters: Master[]) {
  localStorage.setItem(MASTERS_KEY, JSON.stringify(masters));
}

export function getBookings(): Booking[] {
  const data = localStorage.getItem(BOOKINGS_KEY);
  if (data) return JSON.parse(data);
  return [];
}

export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function addBooking(booking: Booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

export function cancelBooking(id: string) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    bookings[idx].status = 'cancelled';
    saveBookings(bookings);
  }
}

export function deleteBooking(id: string) {
  const bookings = getBookings().filter(b => b.id !== id);
  saveBookings(bookings);
}

export function getAvailableSlots(masterId: string, date: string, serviceId: string): { time: string; available: boolean }[] {
  const masters = getMasters();
  const master = masters.find(m => m.id === masterId);
  if (!master) return [];

  const services = getServices();
  const service = services.find(s => s.id === serviceId);
  if (!service) return [];

  const bookings = getBookings().filter(
    b => b.masterId === masterId && b.date === date && b.status === 'active'
  );

  const slots: { time: string; available: boolean }[] = [];
  const [startH, startM] = master.workStart.split(':').map(Number);
  const [endH, endM] = master.workEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + service.duration <= endMinutes; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

    const slotEnd = m + service.duration;
    const isBooked = bookings.some(b => {
      const [bH, bM] = b.time.split(':').map(Number);
      const bStart = bH * 60 + bM;
      const bService = services.find(s => s.id === b.serviceId);
      const bEnd = bStart + (bService?.duration || 30);
      return m < bEnd && slotEnd > bStart;
    });

    slots.push({ time: timeStr, available: !isBooked });
  }

  return slots;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
