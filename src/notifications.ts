import { Booking } from './types';
import { getServices, getMasters } from './store';

const NOTIFICATIONS_KEY = 'salon_notifications';

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function checkReminders() {
  const bookings = JSON.parse(localStorage.getItem('salon_bookings') || '[]') as Booking[];
  const now = new Date();
  const services = getServices();
  const masters = getMasters();

  bookings.forEach(booking => {
    if (booking.status !== 'active') return;

    const bookingDate = new Date(`${booking.date}T${booking.time}:00`);
    const diffMs = bookingDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 0 && diffHours <= 2 && diffHours > 1.9) {
      const notified = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      if (!notified.includes(booking.id)) {
        const service = services.find(s => s.id === booking.serviceId);
        const master = masters.find(m => m.id === booking.masterId);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Напоминание: Салон Красоты', {
            body: `Через 2 часа: ${service?.name} у мастера ${master?.name} в ${booking.time}`,
            icon: '💇',
          });
        }

        notified.push(booking.id);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notified));
      }
    }
  });
}

export function startReminderCheck() {
  requestNotificationPermission();
  checkReminders();
  setInterval(checkReminders, 60000); // проверять каждую минуту
}
