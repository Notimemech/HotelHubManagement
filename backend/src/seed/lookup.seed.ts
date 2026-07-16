export const ROOM_TYPES = [
  { typeName: 'Standard Single', price: 500000, maxGuests: 1, description: 'Comfortable room for one person with standard amenities' },
  { typeName: 'Standard Double', price: 800000, maxGuests: 2, description: 'Perfect room for couples or two friends' },
  { typeName: 'Deluxe Double', price: 1200000, maxGuests: 2, description: 'Spacious room with a beautiful city view and premium services' },
  { typeName: 'Deluxe Twin', price: 1300000, maxGuests: 2, description: 'Spacious room with two single beds and modern decor' },
  { typeName: 'Suite', price: 2200000, maxGuests: 4, description: 'Luxurious suite with separate living and sleeping areas' },
  { typeName: 'Presidential', price: 5000000, maxGuests: 6, description: 'The peak of luxury and space, suitable for families or VIPs' },
];

export const ROOMS = [
  // Standard Single (101, 102, 103)
  { roomCode: '101', floor: 1, status: 'Available', typeName: 'Standard Single' },
  { roomCode: '102', floor: 1, status: 'Available', typeName: 'Standard Single' },
  { roomCode: '103', floor: 1, status: 'Available', typeName: 'Standard Single' },

  // Standard Double (201, 202, 203)
  { roomCode: '201', floor: 2, status: 'Available', typeName: 'Standard Double' },
  { roomCode: '202', floor: 2, status: 'Available', typeName: 'Standard Double' },
  { roomCode: '203', floor: 2, status: 'Available', typeName: 'Standard Double' },

  // Deluxe Double (301, 302, 303)
  { roomCode: '301', floor: 3, status: 'Available', typeName: 'Deluxe Double' },
  { roomCode: '302', floor: 3, status: 'Available', typeName: 'Deluxe Double' },
  { roomCode: '303', floor: 3, status: 'Available', typeName: 'Deluxe Double' },

  // Deluxe Twin (401, 402, 403)
  { roomCode: '401', floor: 4, status: 'Available', typeName: 'Deluxe Twin' },
  { roomCode: '402', floor: 4, status: 'Available', typeName: 'Deluxe Twin' },
  { roomCode: '403', floor: 4, status: 'Available', typeName: 'Deluxe Twin' },

  // Suite (501, 502, 503)
  { roomCode: '501', floor: 5, status: 'Available', typeName: 'Suite' },
  { roomCode: '502', floor: 5, status: 'Available', typeName: 'Suite' },
  { roomCode: '503', floor: 5, status: 'Available', typeName: 'Suite' },

  // Presidential (601, 602)
  { roomCode: '601', floor: 6, status: 'Available', typeName: 'Presidential' },
  { roomCode: '602', floor: 6, status: 'Available', typeName: 'Presidential' },
];

export const SERVICES = [
  { serviceName: 'Breakfast buffet', price: 150000 },
  { serviceName: 'Airport pickup', price: 350000 },
  { serviceName: 'Laundry (per kg)', price: 50000 },
  { serviceName: 'Spa 60min', price: 600000 },
  { serviceName: 'Gym day pass', price: 100000 },
  { serviceName: 'Late checkout (2h)', price: 200000 },
  { serviceName: 'Extra bed', price: 250000 },
  { serviceName: 'Room service meal', price: 180000 },
  { serviceName: 'Minibar refill', price: 120000 },
  { serviceName: 'City tour 4h', price: 450000 },
];

export const CHECKLIST_TEMPLATES = [
  {
    itemName: 'Housekeeping full clean',
    templateType: 'Housekeeping',
    description: 'Replace towels, restock toiletries, vacuum, sanitize bathroom, change sheets',
  },
  {
    itemName: 'Maintenance safety check',
    templateType: 'Maintenance',
    description: 'Inspect smoke detector, sprinklers, electrical outlets, water pressure',
  },
];
