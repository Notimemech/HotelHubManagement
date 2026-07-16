export const ROLES = [
  { roleName: 'Admin', description: 'System administrator' },
  { roleName: 'Receptionist', description: 'Front-desk / booking' },
  { roleName: 'Staff', description: 'General hotel staff' },
  { roleName: 'Housekeeper', description: 'Cleaning & checklist' },
  { roleName: 'Maintenance', description: 'Maintenance & issue handling' },
  { roleName: 'User', description: 'Default customer role' },
];

export const STAFF_ACCOUNTS = [
  {
    username: 'admin',
    fullName: 'Nguyen Van Admin',
    email: 'admin@hotelhub.vn',
    phone: '0900000001',
    cccd: '079000000001',
    address: '1 Ly Tu Trong, Q1, HCM',
    role: 'Admin',
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
    role: 'Housekeeper',
  },
  {
    username: 'maintenance1',
    fullName: 'Pham Van Minh',
    email: 'maintenance@hotelhub.vn',
    phone: '0900000004',
    cccd: '079000000004',
    address: '4 Ly Tu Trong, Q1, HCM',
    role: 'Maintenance',
  },
  {
    username: 'staff1',
    fullName: 'Hoang Van Nam',
    email: 'staff@hotelhub.vn',
    phone: '0900000005',
    cccd: '079000000005',
    address: '5 Ly Tu Trong, Q1, HCM',
    role: 'Staff',
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
