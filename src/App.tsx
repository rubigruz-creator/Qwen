import { useState, useEffect } from 'react';
import { Screen, Service, Master, Booking } from './types';
import {
  getServices, getMasters, getBookings, getAvailableSlots,
  addBooking, cancelBooking, saveServices, saveMasters,
  deleteBooking, generateId
} from './store';
import { startReminderCheck } from './notifications';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [services, setServices] = useState<Service[]>(getServices());
  const [masters, setMasters] = useState<Master[]>(getMasters());
  const [bookings, setBookings] = useState<Booking[]>(getBookings());
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Booking flow state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Admin state
  const [adminTab, setAdminTab] = useState<'services' | 'masters' | 'bookings'>('services');

  useEffect(() => {
    startReminderCheck();

    // PWA install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  const refreshData = () => {
    setServices(getServices());
    setMasters(getMasters());
    setBookings(getBookings());
  };

  const goHome = () => {
    setScreen('home');
    setSelectedService(null);
    setSelectedMaster(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  // ============ HOME SCREEN ============
  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="px-6 pt-12 pb-6">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💇‍♀️</div>
          <h1 className="text-3xl font-bold text-gray-800">Салон Красоты</h1>
          <p className="text-gray-500 mt-1">Ваша красота — наша забота</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setScreen('services')}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl">💅</div>
            <div className="text-left">
              <div className="font-semibold text-gray-800">Услуги</div>
              <div className="text-sm text-gray-500">Выбрать и записаться</div>
            </div>
            <div className="ml-auto text-gray-400">→</div>
          </button>

          <button
            onClick={() => setScreen('my-bookings')}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
            <div className="text-left">
              <div className="font-semibold text-gray-800">Мои записи</div>
              <div className="text-sm text-gray-500">Посмотреть и отменить</div>
            </div>
            <div className="ml-auto text-gray-400">→</div>
          </button>

          <button
            onClick={() => setScreen('master-profile')}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">👤</div>
            <div className="text-left">
              <div className="font-semibold text-gray-800">Мастера</div>
              <div className="text-sm text-gray-500">Наши специалисты</div>
            </div>
            <div className="ml-auto text-gray-400">→</div>
          </button>

          <button
            onClick={() => setScreen('admin')}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">⚙️</div>
            <div className="text-left">
              <div className="font-semibold text-gray-800">Админ-панель</div>
              <div className="text-sm text-gray-500">Управление салоном</div>
            </div>
            <div className="ml-auto text-gray-400">→</div>
          </button>
        </div>

        {/* Install PWA button */}
        {installPrompt && !isInstalled && (
          <div className="mt-6">
            <button
              onClick={handleInstall}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-4 font-semibold shadow-lg shadow-rose-200 flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              <span className="text-xl">📲</span>
              Установить на телефон
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Работает офлайн, как обычное приложение
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ============ SERVICES SCREEN ============
  const ServicesScreen = () => {
    const categories = [...new Set(services.map(s => s.category))];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="text-2xl text-gray-600">←</button>
            <h2 className="text-xl font-bold text-gray-800">Услуги</h2>
          </div>
        </div>
        <div className="px-6 py-4 space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">{cat}</h3>
              <div className="space-y-2">
                {services.filter(s => s.category === cat).map(service => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedMaster(null);
                      setSelectedDate('');
                      setSelectedTime('');
                      setScreen('booking');
                    }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-rose-200 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{service.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{service.duration} мин</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-600">{service.price} ₽</div>
                      <div className="text-xs text-rose-400 mt-1">Записаться →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============ BOOKING SCREEN (choose master, date, time) ============
  const BookingScreen = () => {
    const availableMasters = masters.filter(m =>
      selectedService ? m.serviceIds.includes(selectedService.id) : false
    );

    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00');
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    };

    const slots = selectedMaster && selectedDate && selectedService
      ? getAvailableSlots(selectedMaster.id, selectedDate, selectedService.id)
      : [];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('services')} className="text-2xl text-gray-600">←</button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Запись</h2>
              {selectedService && <p className="text-sm text-gray-500">{selectedService.name} • {selectedService.price} ₽</p>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Master selection */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Выберите мастера</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {availableMasters.map(master => (
                <button
                  key={master.id}
                  onClick={() => { setSelectedMaster(master); setSelectedTime(''); }}
                  className={`flex-shrink-0 rounded-xl p-3 border-2 transition-all ${
                    selectedMaster?.id === master.id
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-1">{master.photo}</div>
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">{master.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date selection */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Выберите дату</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                  className={`flex-shrink-0 rounded-xl px-4 py-3 border-2 text-center transition-all ${
                    selectedDate === date
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-xs text-gray-500">{formatDate(date).split(',')[0]}</div>
                  <div className="font-semibold text-gray-800">{new Date(date + 'T00:00:00').getDate()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time selection */}
          {selectedMaster && selectedDate && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Свободное время</h3>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`rounded-lg py-2 text-sm font-medium transition-all ${
                      selectedTime === slot.time
                        ? 'bg-rose-500 text-white'
                        : slot.available
                        ? 'bg-white border border-gray-200 text-gray-700 hover:border-rose-300'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continue button */}
          {selectedTime && (
            <button
              onClick={() => setScreen('booking-form')}
              className="w-full bg-rose-500 text-white rounded-xl py-4 font-semibold text-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
            >
              Далее
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============ BOOKING FORM ============
  const BookingFormScreen = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
      if (!name || !phone || !selectedService || !selectedMaster || !selectedDate || !selectedTime) return;

      const booking: Booking = {
        id: generateId(),
        serviceId: selectedService.id,
        masterId: selectedMaster.id,
        date: selectedDate,
        time: selectedTime,
        clientName: name,
        clientPhone: phone,
        comment,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      addBooking(booking);
      refreshData();
      alert('Вы успешно записаны!');
      goHome();
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('booking')} className="text-2xl text-gray-600">←</button>
            <h2 className="text-xl font-bold text-gray-800">Ваши данные</h2>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Summary */}
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
            <div className="text-sm text-gray-500 mb-2">Ваша запись:</div>
            <div className="space-y-1">
              <div className="font-medium text-gray-800">{selectedService?.name}</div>
              <div className="text-sm text-gray-600">Мастер: {selectedMaster?.name}</div>
              <div className="text-sm text-gray-600">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {selectedTime}
              </div>
              <div className="text-sm font-semibold text-rose-600">{selectedService?.price} ₽</div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Пожелания или вопросы..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!name || !phone}
              className="w-full bg-rose-500 text-white rounded-xl py-4 font-semibold text-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              Подтвердить запись
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ MY BOOKINGS ============
  const MyBookingsScreen = () => {
    const activeBookings = bookings.filter(b => b.status === 'active');
    const pastBookings = bookings.filter(b => b.status !== 'active');

    const handleCancel = (id: string) => {
      if (confirm('Отменить запись?')) {
        cancelBooking(id);
        refreshData();
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="text-2xl text-gray-600">←</button>
            <h2 className="text-xl font-bold text-gray-800">Мои записи</h2>
          </div>
        </div>

        <div className="px-6 py-4">
          {activeBookings.length === 0 && pastBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">У вас пока нет записей</p>
              <button
                onClick={() => setScreen('services')}
                className="mt-4 text-rose-500 font-medium"
              >
                Записаться →
              </button>
            </div>
          )}

          {activeBookings.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Активные</h3>
              <div className="space-y-3">
                {activeBookings.map(booking => {
                  const service = services.find(s => s.id === booking.serviceId);
                  const master = masters.find(m => m.id === booking.masterId);
                  return (
                    <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">{service?.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{master?.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })} в {booking.time}
                          </div>
                          {booking.comment && (
                            <div className="text-xs text-gray-400 mt-1 italic">"{booking.comment}"</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-rose-600">{service?.price} ₽</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="mt-3 text-sm text-red-500 font-medium hover:text-red-600"
                      >
                        ✕ Отменить запись
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Прошедшие</h3>
              <div className="space-y-3">
                {pastBookings.map(booking => {
                  const service = services.find(s => s.id === booking.serviceId);
                  const master = masters.find(m => m.id === booking.masterId);
                  return (
                    <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-100 opacity-60">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">{service?.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{master?.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {booking.time}
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                          {booking.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============ MASTER PROFILES ============
  const MasterProfileScreen = () => {
    const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

    if (selectedMasterId) {
      const master = masters.find(m => m.id === selectedMasterId);
      if (!master) return null;
      const masterServices = services.filter(s => master.serviceIds.includes(s.id));

      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white px-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedMasterId(null)} className="text-2xl text-gray-600">←</button>
              <h2 className="text-xl font-bold text-gray-800">Профиль мастера</h2>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center mb-4">
              <div className="text-6xl mb-3">{master.photo}</div>
              <h3 className="text-xl font-bold text-gray-800">{master.name}</h3>
              <p className="text-gray-500 mt-2">{master.description}</p>
              <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-gray-400">Работает</div>
                  <div className="font-medium">{master.workStart} - {master.workEnd}</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-gray-400">Услуг</div>
                  <div className="font-medium">{masterServices.length}</div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-700 mb-3">Услуги мастера</h4>
            <div className="space-y-2">
              {masterServices.map(s => (
                <div key={s.id} className="bg-white rounded-xl p-3 border border-gray-100 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.duration} мин</div>
                  </div>
                  <div className="font-semibold text-rose-600">{s.price} ₽</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="text-2xl text-gray-600">←</button>
            <h2 className="text-xl font-bold text-gray-800">Наши мастера</h2>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          {masters.map(master => (
            <div
              key={master.id}
              onClick={() => setSelectedMasterId(master.id)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-rose-200 transition-colors"
            >
              <div className="text-4xl">{master.photo}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{master.name}</div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">{master.description}</div>
                <div className="text-xs text-gray-400 mt-1">{master.workStart} - {master.workEnd}</div>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============ ADMIN PANEL ============
  const AdminScreen = () => {
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [editingMaster, setEditingMaster] = useState<Master | null>(null);
    const [showAddService, setShowAddService] = useState(false);
    const [showAddMaster, setShowAddMaster] = useState(false);

    // Service form
    const [svcName, setSvcName] = useState('');
    const [svcPrice, setSvcPrice] = useState('');
    const [svcDuration, setSvcDuration] = useState('');
    const [svcCategory, setSvcCategory] = useState('');

    // Master form
    const [mName, setMName] = useState('');
    const [mDesc, setMDesc] = useState('');
    const [mPhoto, setMPhoto] = useState('');
    const [mWorkStart, setMWorkStart] = useState('09:00');
    const [mWorkEnd, setMWorkEnd] = useState('18:00');
    const [mServiceIds, setMServiceIds] = useState<string[]>([]);

    const resetServiceForm = () => {
      setSvcName(''); setSvcPrice(''); setSvcDuration(''); setSvcCategory('');
      setEditingService(null); setShowAddService(false);
    };

    const resetMasterForm = () => {
      setMName(''); setMDesc(''); setMPhoto(''); setMWorkStart('09:00'); setMWorkEnd('18:00');
      setMServiceIds([]); setEditingMaster(null); setShowAddMaster(false);
    };

    const saveService = () => {
      if (!svcName || !svcPrice || !svcDuration || !svcCategory) return;
      const updated = [...services];
      if (editingService) {
        const idx = updated.findIndex(s => s.id === editingService.id);
        updated[idx] = { ...editingService, name: svcName, price: Number(svcPrice), duration: Number(svcDuration), category: svcCategory };
      } else {
        updated.push({ id: generateId(), name: svcName, price: Number(svcPrice), duration: Number(svcDuration), category: svcCategory });
      }
      saveServices(updated);
      refreshData();
      resetServiceForm();
    };

    const deleteService = (id: string) => {
      if (confirm('Удалить услугу?')) {
        const updated = services.filter(s => s.id !== id);
        saveServices(updated);
        refreshData();
      }
    };

    const saveMaster = () => {
      if (!mName || !mDesc) return;
      const updated = [...masters];
      if (editingMaster) {
        const idx = updated.findIndex(m => m.id === editingMaster.id);
        updated[idx] = { ...editingMaster, name: mName, description: mDesc, photo: mPhoto || '👤', workStart: mWorkStart, workEnd: mWorkEnd, serviceIds: mServiceIds };
      } else {
        updated.push({ id: generateId(), name: mName, description: mDesc, photo: mPhoto || '👤', workStart: mWorkStart, workEnd: mWorkEnd, serviceIds: mServiceIds });
      }
      saveMasters(updated);
      refreshData();
      resetMasterForm();
    };

    const deleteMaster = (id: string) => {
      if (confirm('Удалить мастера?')) {
        const updated = masters.filter(m => m.id !== id);
        saveMasters(updated);
        refreshData();
      }
    };

    const editService = (s: Service) => {
      setEditingService(s);
      setSvcName(s.name); setSvcPrice(String(s.price)); setSvcDuration(String(s.duration)); setSvcCategory(s.category);
      setShowAddService(true);
    };

    const editMaster = (m: Master) => {
      setEditingMaster(m);
      setMName(m.name); setMDesc(m.description); setMPhoto(m.photo); setMWorkStart(m.workStart); setMWorkEnd(m.workEnd); setMServiceIds(m.serviceIds);
      setShowAddMaster(true);
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="text-2xl text-gray-600">←</button>
            <h2 className="text-xl font-bold text-gray-800">Админ-панель</h2>
          </div>
          <div className="flex gap-2 mt-3">
            {(['services', 'masters', 'bookings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  adminTab === tab ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab === 'services' ? 'Услуги' : tab === 'masters' ? 'Мастера' : 'Записи'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4">
          {/* SERVICES TAB */}
          {adminTab === 'services' && (
            <div>
              <button
                onClick={() => { resetServiceForm(); setShowAddService(true); }}
                className="w-full bg-green-500 text-white rounded-xl py-3 font-medium mb-4 hover:bg-green-600 transition-colors"
              >
                + Добавить услугу
              </button>

              {showAddService && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 space-y-3">
                  <h4 className="font-semibold text-gray-700">{editingService ? 'Редактировать' : 'Новая'} услуга</h4>
                  <input value={svcName} onChange={e => setSvcName(e.target.value)} placeholder="Название" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={svcPrice} onChange={e => setSvcPrice(e.target.value)} placeholder="Цена (₽)" type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={svcDuration} onChange={e => setSvcDuration(e.target.value)} placeholder="Длительность (мин)" type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={svcCategory} onChange={e => setSvcCategory(e.target.value)} placeholder="Категория" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <div className="flex gap-2">
                    <button onClick={saveService} className="flex-1 bg-rose-500 text-white rounded-lg py-2 text-sm font-medium">Сохранить</button>
                    <button onClick={resetServiceForm} className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium">Отмена</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {services.map(s => (
                  <div key={s.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.category} • {s.duration} мин • {s.price} ₽</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editService(s)} className="text-blue-500 text-sm">✏️</button>
                      <button onClick={() => deleteService(s.id)} className="text-red-500 text-sm">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MASTERS TAB */}
          {adminTab === 'masters' && (
            <div>
              <button
                onClick={() => { resetMasterForm(); setShowAddMaster(true); }}
                className="w-full bg-green-500 text-white rounded-xl py-3 font-medium mb-4 hover:bg-green-600 transition-colors"
              >
                + Добавить мастера
              </button>

              {showAddMaster && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 space-y-3">
                  <h4 className="font-semibold text-gray-700">{editingMaster ? 'Редактировать' : 'Новый'} мастер</h4>
                  <input value={mName} onChange={e => setMName(e.target.value)} placeholder="ФИО" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <textarea value={mDesc} onChange={e => setMDesc(e.target.value)} placeholder="Описание" rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none" />
                  <input value={mPhoto} onChange={e => setMPhoto(e.target.value)} placeholder="Эмодзи (напр. 👩‍🦰)" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <div className="flex gap-2">
                    <input value={mWorkStart} onChange={e => setMWorkStart(e.target.value)} placeholder="Начало" type="time" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                    <input value={mWorkEnd} onChange={e => setMWorkEnd(e.target.value)} placeholder="Конец" type="time" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Услуги:</div>
                    <div className="flex flex-wrap gap-1">
                      {services.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setMServiceIds(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                          className={`text-xs px-2 py-1 rounded-full border ${mServiceIds.includes(s.id) ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveMaster} className="flex-1 bg-rose-500 text-white rounded-lg py-2 text-sm font-medium">Сохранить</button>
                    <button onClick={resetMasterForm} className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium">Отмена</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {masters.map(m => (
                  <div key={m.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{m.photo}</div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.workStart} - {m.workEnd} • {m.serviceIds.length} услуг</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editMaster(m)} className="text-blue-500 text-sm">✏️</button>
                      <button onClick={() => deleteMaster(m.id)} className="text-red-500 text-sm">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {adminTab === 'bookings' && (
            <div>
              <div className="space-y-2">
                {bookings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Нет записей</div>
                )}
                {bookings.slice().reverse().map(b => {
                  const service = services.find(s => s.id === b.serviceId);
                  const master = masters.find(m => m.id === b.masterId);
                  return (
                    <div key={b.id} className="bg-white rounded-xl p-3 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{service?.name}</div>
                          <div className="text-xs text-gray-500">{master?.name} • {b.date} в {b.time}</div>
                          <div className="text-xs text-gray-500">👤 {b.clientName} • 📞 {b.clientPhone}</div>
                          {b.comment && <div className="text-xs text-gray-400 italic mt-1">"{b.comment}"</div>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            b.status === 'active' ? 'bg-green-100 text-green-700' :
                            b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {b.status === 'active' ? 'Активна' : b.status === 'cancelled' ? 'Отменена' : 'Завершена'}
                          </span>
                          <button
                            onClick={() => { deleteBooking(b.id); refreshData(); }}
                            className="text-red-500 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============ RENDER ============
  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative">
      {screen === 'home' && <HomeScreen />}
      {screen === 'services' && <ServicesScreen />}
      {screen === 'booking' && <BookingScreen />}
      {screen === 'booking-form' && <BookingFormScreen />}
      {screen === 'my-bookings' && <MyBookingsScreen />}
      {screen === 'master-profile' && <MasterProfileScreen />}
      {screen === 'admin' && <AdminScreen />}
    </div>
  );
}

export default App;
