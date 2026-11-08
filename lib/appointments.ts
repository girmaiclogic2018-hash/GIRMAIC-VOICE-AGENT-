import { AppointmentRecord } from './types';

export const INITIAL_TEST_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt-201',
    callerName: 'Dawit Tadesse',
    callerPhone: '+251912345678',
    appointmentDate: '2026-11-12',
    appointmentTime: '10:30 AM',
    serviceCategory: 'AI Voice Service Integration',
    notes: 'Autonomous Phone Call Booking: Discussing automated IVR setup for regional logistics center.',
    timestamp: '2026-11-08T09:15:00.000Z',
    status: 'Confirmed',
    autoBooked: true,
  },
  {
    id: 'apt-202',
    callerName: 'Helen Mengistu',
    callerPhone: '+251988776655',
    appointmentDate: '2026-11-14',
    appointmentTime: '02:00 PM',
    serviceCategory: 'Technology Trading Consultation',
    notes: 'Autonomous Voice Booking: Consultation regarding hardware technology procurement.',
    timestamp: '2026-11-08T11:45:00.000Z',
    status: 'Confirmed',
    autoBooked: true,
  },
];
