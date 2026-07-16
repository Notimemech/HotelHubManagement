// Business seed data: bookings, payments, booking services, housekeeping logs,
// maintenance issue reports and proves. References lookups via plain string
// keys (roomCode, serviceName, username, cccd, templateType) so seed.ts can
// resolve them to real ids at runtime.

export type BookingSeed = {
  customerUsername: string; // CUSTOMER_ACCOUNTS.username
  // First version (always created).
  version: {
    staffUsername?: string; // STAFF_ACCOUNTS.username (reception)
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    adults: number;
    children: number;
    specialRequest?: string;
    roomCodes: string[]; // ROOMS.roomCode
    serviceItems?: { serviceName: string; quantity: number }[];
    payment: { amount: number; method: string; status: string };
  };
  bookingStatus: string;
};

export const BOOKINGS: BookingSeed[] = [
  {
    customerUsername: 'customer1',
    version: {
      staffUsername: 'reception1',
      checkIn: '2026-07-10',
      checkOut: '2026-07-13',
      adults: 2,
      children: 0,
      specialRequest: 'High floor please',
      roomCodes: ['301', '302'],
      serviceItems: [{ serviceName: 'Breakfast buffet', quantity: 3 }],
      payment: { amount: 7200000, method: 'VNPay', status: 'Paid' },
    },
    bookingStatus: 'Confirmed',
  },
  {
    customerUsername: 'customer2',
    version: {
      staffUsername: 'reception1',
      checkIn: '2026-07-15',
      checkOut: '2026-07-17',
      adults: 1,
      children: 0,
      roomCodes: ['101'],
      serviceItems: [
        { serviceName: 'Airport pickup', quantity: 1 },
        { serviceName: 'Spa 60min', quantity: 1 },
      ],
      payment: { amount: 1950000, method: 'Cash', status: 'Paid' },
    },
    bookingStatus: 'CheckedIn',
  },
  {
    customerUsername: 'customer1',
    version: {
      staffUsername: 'staff1',
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
      adults: 2,
      children: 1,
      specialRequest: 'Extra bed for child',
      roomCodes: ['501'],
      serviceItems: [
        { serviceName: 'Extra bed', quantity: 1 },
        { serviceName: 'City tour 4h', quantity: 2 },
      ],
      payment: { amount: 10700000, method: 'CreditCard', status: 'Pending' },
    },
    bookingStatus: 'Pending',
  },
];

export const CHECKLIST_LOGS = [
  {
    roomCode: '101',
    staffUsername: 'housekeeper1',
    templateType: 'Housekeeping',
    notes: 'Full clean after checkout',
  },
  {
    roomCode: '301',
    staffUsername: 'housekeeper1',
    templateType: 'Housekeeping',
    notes: 'Daily refresh, restocked toiletries',
  },
  {
    roomCode: '501',
    staffUsername: 'housekeeper1',
    templateType: 'Maintenance',
    notes: 'Smoke detector battery replaced',
  },
];

export const ISSUE_REPORTS = [
  {
    roomCode: '202',
    reporterUsername: 'housekeeper1',
    description: 'Leaking faucet in bathroom sink',
    status: 'Pending',
  },
  {
    roomCode: '402',
    reporterUsername: 'reception1',
    description: 'Air conditioning not cooling properly',
    status: 'InProgress',
    resolved: {
      maintainerUsername: 'maintenance1',
      finishImage: 'https://example.com/proofs/ac-fixed.jpg',
      finishVideo: 'https://example.com/proofs/ac-fixed.mp4',
    },
  },
];