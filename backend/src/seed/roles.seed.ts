import { ROLES } from '../modules/accounts/roles.constants';

// Re-export for compatibility with old seed.ts imports.
export { ROLES };

export const STAFF_ACCOUNTS = [
  {
    username: 'admin',
    fullName: 'Nguyen Van Quan Ly',
    email: 'admin@hotelhub.vn',
    phone: '0900000001',
    cccd: '079000000001',
    address: '1 Ly Tu Trong, Q1, HCM',
    role: 'Manager',
  },
  {
    username: 'reception1',
    fullName: 'Tran Thi Bich',
    email: 'receptionist@hotelhub.vn',
    phone: '0900000002',
    cccd: '079000000002',
    address: '2 Ly Tu Trong, Q1, HCM',
    role: 'Receptionist',
  },
  {
    username: 'housekeeper1',
    fullName: 'Le Thi Lan',
    email: 'housekeeper@hotelhub.vn',
    phone: '0900000003',
    cccd: '079000000003',
    address: '3 Ly Tu Trong, Q1, HCM',
    role: 'Cleaner',
  },
  {
    username: 'maintenance1',
    fullName: 'Pham Van Minh',
    email: 'maintenance@hotelhub.vn',
    phone: '0900000004',
    cccd: '079000000004',
    address: '4 Ly Tu Trong, Q1, HCM',
    role: 'Maintainer',
  },
  {
    username: 'staff1',
    fullName: 'Hoang Van Nam',
    email: 'staff@hotelhub.vn',
    phone: '0900000005',
    cccd: '079000000005',
    address: '5 Ly Tu Trong, Q1, HCM',
    role: 'Saler',
  },
];

export const CUSTOMER_ACCOUNTS = [
  {
    username: 'customer1',
    fullName: 'Do Thi Hong',
    email: 'customer1@hotelhub.vn',
    phone: '0900000006',
    role: 'User',
  },
  {
    username: 'customer2',
    fullName: 'Vu Thi Mai',
    email: 'customer2@hotelhub.vn',
    phone: '0900000007',
    role: 'User',
  },
];
