# Saler – Tổng hợp Class Diagram & Sequence Diagrams

> Tập hợp toàn bộ class diagram và sequence diagram cho các chức năng của **Saler** (role nhân viên bán hàng).  
> Saler có quyền truy cập `/staff` (xem/sửa profile cá nhân) và `/sale/bookings` (quản lý booking hộ khách).

---

## 1. Class Diagram

## 3. Sequence Diagrams – Sale Bookings (Chức năng chính của Saler)

### 3.1 POST /sale/bookings – Tạo booking hộ khách

```mermaid
---
title: Sale Bookings - Create Booking Flow (POST /sale/bookings)
---
sequenceDiagram
    autonumber
    actor Client as Saler Client
    participant Ctrl as SaleBookingsController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as BookingsService
    participant StaffSvc as StaffService
    participant CustomerRepo as CustomerRepo (TypeORM)
    participant BookingRepo as BookingRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: POST /sale/bookings (with Bearer Token, role=Saler)
    Client->>Ctrl: CreateSaleBookingDto (customerFullName, customerPhone, checkIn, checkOut, roomIds, evidenceImage?)
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard->>Guard: Verify JWT & attach user (sub = accountId)
    Guard-->>Ctrl: return true
    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve @Roles('Saler')
    alt Not Saler
        RGuard-->>Client: HTTP 403 Forbidden
    end
    RGuard-->>Ctrl: return true

    Ctrl->>Service: createForSaler(req.user.sub, dto)
    activate Service

    Service->>StaffSvc: findByAccountId(accountId)
    StaffSvc->>DB: SELECT * FROM StaffInfo WHERE AccountId = ?
    DB-->>StaffSvc: StaffInfo / null
    StaffSvc-->>Service: staffInChargeId

    Service->>CustomerRepo: findOne({ phone: dto.customerPhone })
    CustomerRepo->>DB: SELECT * FROM Customers WHERE Phone = ?
    DB-->>CustomerRepo: Customer / null
    alt Customer not found
        Service->>CustomerRepo: save(new Customer)
        CustomerRepo->>DB: INSERT INTO Customers ...
        DB-->>CustomerRepo: new Customer
    end
    CustomerRepo-->>Service: customerId

    Note over Service, DB: Run inside Transaction (dataSource.transaction)

    Service->>BookingRepo: save(new Booking + EvidenceImage)
    BookingRepo->>DB: INSERT INTO Bookings (CustomerId, EvidenceImage, ...) ...
    DB-->>BookingRepo: Booking Entity

    Service->>DB: INSERT INTO BookingVersions (VersionNumber=1, StaffInChargeId, ChangeReason='Saler booking', ...)
    Service->>DB: INSERT INTO BookingDetails (RoomId, ...) per roomId

    Service-->>Ctrl: { bookingId, customerId, isNewCustomer }
    deactivate Service

    Ctrl-->>Client: HTTP 201 - { message: 'Saler booking created', bookingId, customerId, isNewCustomer }
    deactivate Ctrl
```

---

### 3.2 PUT /sale/bookings/:id – Sửa booking (kèm evidence)

```mermaid
---
title: Sale Bookings - Update Booking Flow (PUT /sale/bookings/:id)
---
sequenceDiagram
    autonumber
    actor Client as Saler Client
    participant Ctrl as SaleBookingsController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as BookingsService
    participant StaffSvc as StaffService
    participant BookingRepo as BookingRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: PUT /sale/bookings/:id (with Bearer Token)
    Client->>Ctrl: UpdateSaleBookingDto (requestEvidenceImage [required], checkIn?, checkOut?, roomIds?, ...)
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard-->>Ctrl: return true (JWT verified)
    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve @Roles('Saler')
    alt Not Saler
        RGuard-->>Client: HTTP 403 Forbidden
    end
    RGuard-->>Ctrl: return true

    Ctrl->>Service: updateForSaler(req.user.sub, id, dto)
    activate Service

    alt requestEvidenceImage is empty/missing
        Service-->>Client: HTTP 400 BadRequest (evidence required)
    end

    Service->>StaffSvc: findByAccountId(accountId)
    StaffSvc-->>Service: staffInChargeId

    Service->>BookingRepo: findOne({ where: { bookingId: id } })
    BookingRepo->>DB: SELECT * FROM Bookings WHERE BookingId = ?
    DB-->>BookingRepo: Booking / null
    alt Booking not found or isDeleted = 1
        Service-->>Client: HTTP 404 NotFound
    end
    alt Status is 'Cancelled' or 'Completed'
        Service-->>Client: HTTP 400 BadRequest (cannot update)
    end

    Note over Service, DB: Run inside Transaction

    Service->>DB: INSERT INTO BookingVersions (nextVersion, StaffInChargeId, RequestEvidenceImage, ChangeReason, ...)
    Service->>DB: UPDATE Bookings SET CurrentVersion = nextVersion WHERE BookingId = ?

    Service-->>Ctrl: { bookingId, versionNumber }
    deactivate Service

    Ctrl-->>Client: HTTP 200 - { message: 'Booking updated by Saler', versionNumber, bookingId }
    deactivate Ctrl
```

---

### 3.3 DELETE /sale/bookings/:id – Soft delete booking

```mermaid
---
title: Sale Bookings - Soft Delete Flow (DELETE /sale/bookings/:id)
---
sequenceDiagram
    autonumber
    actor Client as Saler Client
    participant Ctrl as SaleBookingsController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as BookingsService
    participant BookingRepo as BookingRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: DELETE /sale/bookings/:id (with Bearer Token)
    Client->>Ctrl: path :id (bookingId)
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard-->>Ctrl: return true (JWT verified)
    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve @Roles('Saler')
    alt Not Saler
        RGuard-->>Client: HTTP 403 Forbidden
    end
    RGuard-->>Ctrl: return true

    Ctrl->>Service: softDelete(req.user.sub, id)
    activate Service

    Service->>BookingRepo: findOne({ where: { bookingId: id } })
    BookingRepo->>DB: SELECT * FROM Bookings WHERE BookingId = ?
    DB-->>BookingRepo: Booking / null
    alt Booking not found
        Service-->>Client: HTTP 404 NotFound
    end
    alt isDeleted = 1 already
        Service-->>Client: HTTP 400 BadRequest (Booking đã bị xóa trước đó)
    end
    alt Status = 'Completed'
        Service-->>Client: HTTP 400 BadRequest (Không thể xóa booking đã hoàn thành)
    end

    Service->>BookingRepo: update({ bookingId }, { isDeleted: true })
    BookingRepo->>DB: UPDATE Bookings SET IsDeleted = 1 WHERE BookingId = ?
    DB-->>BookingRepo: ok

    Service-->>Ctrl: { bookingId }
    deactivate Service

    Ctrl-->>Client: HTTP 200 - { message: 'Booking soft-deleted', bookingId }
    deactivate Ctrl
```

---

### 3.4 PATCH /sale/bookings/:id/cancel – Hủy booking

```mermaid
---
title: Sale Bookings - Cancel Booking Flow (PATCH /sale/bookings/:id/cancel)
---
sequenceDiagram
    autonumber
    actor Client as Saler Client
    participant Ctrl as SaleBookingsController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as BookingsService
    participant BookingRepo as BookingRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: PATCH /sale/bookings/:id/cancel (with Bearer Token)
    Client->>Ctrl: path :id (bookingId)
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard-->>Ctrl: return true (JWT verified)
    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve @Roles('Saler')
    alt Not Saler
        RGuard-->>Client: HTTP 403 Forbidden
    end
    RGuard-->>Ctrl: return true

    Ctrl->>Service: cancelForSaler(req.user.sub, id)
    activate Service

    Service->>BookingRepo: findOne({ where: { bookingId: id } })
    BookingRepo->>DB: SELECT * FROM Bookings WHERE BookingId = ?
    DB-->>BookingRepo: Booking / null
    alt Booking not found
        Service-->>Client: HTTP 404 NotFound
    end
    alt Status = 'Cancelled' already
        Service-->>Client: HTTP 400 BadRequest (Booking đã được hủy trước đó)
    end
    alt Status = 'Completed'
        Service-->>Client: HTTP 400 BadRequest (Không thể hủy booking đã hoàn thành)
    end

    Service->>BookingRepo: update({ bookingId }, { status: 'Cancelled' })
    BookingRepo->>DB: UPDATE Bookings SET Status = 'Cancelled' WHERE BookingId = ?
    DB-->>BookingRepo: ok

    Note over Service: Record kept for penalty fee calculation

    Service-->>Ctrl: { bookingId, status: 'Cancelled' }
    deactivate Service

    Ctrl-->>Client: HTTP 200 - { message: 'Booking cancelled', bookingId, status: 'Cancelled' }
    deactivate Ctrl
```

---

## 4. Tóm tắt API Saler

| Method   | Endpoint                    | Mô tả                                  |
| -------- | --------------------------- | -------------------------------------- |
| `GET`    | `/staff/me`                 | Xem profile cá nhân                    |
| `PATCH`  | `/staff/me`                 | Cập nhật profile cá nhân               |
| `POST`   | `/sale/bookings`            | Tạo booking hộ khách (có ảnh bill)     |
| `PUT`    | `/sale/bookings/:id`        | Sửa booking (bắt buộc upload evidence) |
| `DELETE` | `/sale/bookings/:id`        | Soft delete booking tạo nhầm           |
| `PATCH`  | `/sale/bookings/:id/cancel` | Hủy booking (giữ record tính phí phạt) |
