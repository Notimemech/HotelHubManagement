# Hotel Hub Management API Documentation

Base URL: `http://localhost:3000`

## 1. Auth & Customer APIs
- **[POST]** `/auth/register` - Create a new customer account
- **[POST]** `/auth/login` - Authenticate using email/phone and password (Returns `access_token`)
- **[POST]** `/auth/logout` - End user session
- **[POST]** `/auth/change-password` - Change account password (Requires Auth)
- **[GET]** `/customers/profile` - Access personal info (Requires Auth)
- **[PUT]** `/customers/profile` - Modify personal info (Requires Auth)

## 2. Hotel & Rooms APIs
- **[GET]** `/hotel/info` - View hotel general information
- **[GET]** `/rooms` - View all rooms
- **[GET]** `/rooms/:id` - View specific room details
- **[POST]** `/rooms` - Create a new room (`{ RoomNumber, RoomTypeId, Floor, Status }`)
- **[PATCH]** `/rooms/:id` - Update room information (`{ RoomNumber, RoomTypeId, Floor, Status }`)
- **[DELETE]** `/rooms/:id` - Delete a room
- **[GET]** `/rooms/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=2` - Check available rooms

## 3. Booking APIs (Requires Auth)
- **[POST]** `/bookings` - Reserve one or more rooms (`{ CheckIn, CheckOut, Adults, Children, RoomIds, SpecialRequest }`)
- **[GET]** `/bookings` - View booking history for the current user
- **[GET]** `/bookings/:id` - View detailed info of a specific booking
- **[PUT]** `/bookings/:id` - Modify booking details (Adults, Children, SpecialRequest)
- **[POST]** `/bookings/:id/cancel` - Cancel a booking

## 4. Payment APIs (Requires Auth)
- **[POST]** `/payments` - Complete payment for a reservation (`{ BookingId, Amount, Method }`)
- **[GET]** `/payments/history` - Review past payment transactions

## 5. Additional Services APIs
- **[GET]** `/services` - List all available services (e.g. Breakfast, Spa, Laundry)
- **[POST]** `/services/request` - Request extra service for a booking (`{ BookingId, ServiceId, Quantity }`) (Requires Auth)

> **Note on Authentication**: APIs marked as (Requires Auth) require an Authorization header: `Authorization: Bearer <access_token>`
