# Services Module – Tổng hợp Class Diagram & Sequence Diagrams

> Tổng hợp class diagram và sequence diagram cho **Services Module** (quản lý dịch vụ kèm theo booking: minibar, spa, ăn sáng...).

**Roles truy cập:**
- `GET /services` — Public, không cần auth.
- `POST /services`, `PATCH /services/:id`, `DELETE /services/:id` — **Manager**.
- `POST /services/request` — **User**, **Manager**, **Receptionist**.

---

## 1. Class Diagram

```mermaid
---
title: Services Module - Class Diagram
---
classDiagram
    class ServicesModule {
        <<Module>>
    }

    class ServicesController {
        <<Controller>>
        -servicesService: ServicesService
        +findAll() Promise~Service[]~
        +create(dto: CreateServiceDto) Promise~Service~
        +update(id: string, dto: UpdateServiceDto) Promise~Service~
        +remove(id: string) Promise~DeleteMessageDto~
        +requestService(req: any, dto: RequestServiceDto) Promise~RequestServiceResponseDto~
    }

    class ServicesService {
        <<Service>>
        -serviceRepo: Repository~Service~
        -bookingServiceRepo: Repository~BookingService~
        -bookingRepo: Repository~Booking~
        +findAll() Promise~Service[]~
        +create(dto: CreateServiceDto) Promise~Service~
        +update(id: string, dto: UpdateServiceDto) Promise~Service~
        +remove(id: string) Promise~DeleteMessageDto~
        +requestService(accountId: string, dto: RequestServiceDto) Promise~RequestServiceResponseDto~
    }

    class AuthGuard {
        <<Guard>>
        +canActivate(ctx: ExecutionContext) boolean
    }

    class RolesGuard {
        <<Guard>>
        -reflector: Reflector
        +canActivate(context: ExecutionContext) boolean
    }

    class Roles {
        <<Decorator>>
        +Roles(...roles: string[]) MethodDecorator
    }

    class CreateServiceDto {
        <<DTO Input>>
        +serviceName: string
        +price: number
    }

    class UpdateServiceDto {
        <<DTO Input>>
        +serviceName?: string
        +price?: number
    }

    class RequestServiceDto {
        <<DTO Input>>
        +bookingId: string
        +serviceId: string
        +quantity: number
    }

    class DeleteMessageDto {
        <<DTO Output>>
        +message: string
    }

    class RequestServiceResponseDto {
        <<DTO Output>>
        +message: string
        +totalPrice: number
    }

    class Service {
        <<Entity>>
        +serviceId: string
        +serviceName: string
        +price: number
    }

    class BookingService {
        <<Entity>>
        +bookingServiceId: string
        +bookingId: string
        +serviceId: string
        +quantity: number
    }

    ServicesModule --> ServicesController
    ServicesModule --> ServicesService
    ServicesController --> ServicesService
    ServicesController ..> AuthGuard : protects write routes
    ServicesController ..> RolesGuard : enforces roles
    ServicesController ..> Roles : declares Manager / Receptionist / User
    ServicesService ..> CreateServiceDto : consumes
    ServicesService ..> UpdateServiceDto : consumes
    ServicesService ..> RequestServiceDto : consumes
    ServicesService ..> Service : manages
    ServicesService ..> BookingService : manages
    ServicesService ..> Booking : updates totalPrice
    RolesGuard ..> Roles : resolves metadata
```

---

## 2. Sequence Diagrams

### 2.1 GET /services – Lấy danh sách dịch vụ *(public)*

```mermaid
---
title: Services - Get All Services Flow (GET /services)
---
sequenceDiagram
    autonumber
    actor Client as User Client
    participant Ctrl as ServicesController
    participant Service as ServicesService
    participant ServiceRepo as ServiceRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: GET /services (no auth required)
    Client->>Ctrl: (no body)
    activate Ctrl
    Ctrl->>Service: findAll()
    activate Service
    Service->>ServiceRepo: find()
    ServiceRepo->>DB: SELECT * FROM Services
    DB-->>ServiceRepo: rows
    ServiceRepo-->>Service: Service[]
    Service-->>Ctrl: Service[]
    deactivate Service
    Ctrl-->>Client: HTTP 200 - Service[]
    deactivate Ctrl
```

---

### 2.2 POST /services – Tạo dịch vụ mới *(Manager)*

```mermaid
---
title: Services - Create Service Flow (POST /services)
---
sequenceDiagram
    autonumber
    actor Client as Manager Client
    participant Ctrl as ServicesController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as ServicesService
    participant ServiceRepo as ServiceRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: POST /services (with Bearer Token, role=Manager)
    Client->>Ctrl: CreateServiceDto (serviceName, price)
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard->>Guard: Verify JWT & attach user to request
    alt JWT invalid / expired
        Guard-->>Client: Throw UnauthorizedException
    else JWT valid
        Guard-->>Ctrl: return true
    end

    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve metadata @Roles('Manager')
    alt Not Manager
        RGuard-->>Client: Throw ForbiddenException
    else Manager
        RGuard-->>Ctrl: return true
    end

    Ctrl->>Service: create(dto)
    activate Service
    Service->>ServiceRepo: create(dto)
    Service->>ServiceRepo: save(new Service)
    ServiceRepo->>DB: INSERT INTO Services (ServiceName, Price) ...
    DB-->>ServiceRepo: persisted Service
    ServiceRepo-->>Service: Service Entity
    Service-->>Ctrl: Service Entity
    deactivate Service

    Ctrl-->>Client: HTTP 201 - Service Entity
    deactivate Ctrl
```

---

### 2.3 PATCH /services/:id – Cập nhật dịch vụ *(Manager)*

```mermaid
---
title: Services - Update Service Flow (PATCH /services/:id)
---
sequenceDiagram
    autonumber
    actor Client as Manager Client
    participant Ctrl as ServicesController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as ServicesService
    participant ServiceRepo as ServiceRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: PATCH /services/:id (with Bearer Token, role=Manager)
    Client->>Ctrl: UpdateServiceDto (serviceName?, price?) + path :id
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard-->>Ctrl: return true (JWT verified)
    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve @Roles('Manager')
    alt Not Manager
        RGuard-->>Client: Throw ForbiddenException
    end
    RGuard-->>Ctrl: return true

    Ctrl->>Service: update(id, dto)
    activate Service
    Service->>ServiceRepo: findOne({ where: { serviceId: id } })
    ServiceRepo->>DB: SELECT * FROM Services WHERE ServiceId = ?
    DB-->>ServiceRepo: row / null
    ServiceRepo-->>Service: Service / null
    opt Service not found
        Service-->>Client: Throw NotFoundException
    end

    Note over Service: Apply partial field updates from dto via Object.assign

    Service->>ServiceRepo: save(service)
    ServiceRepo->>DB: UPDATE Services SET ServiceName=?, Price=? WHERE ServiceId = ?
    DB-->>ServiceRepo: updated row
    ServiceRepo-->>Service: Updated Service
    Service-->>Ctrl: Updated Service
    deactivate Service

    Ctrl-->>Client: HTTP 200 - Updated Service
    deactivate Ctrl
```

---

### 2.4 DELETE /services/:id – Xóa dịch vụ *(Manager)*

```mermaid
---
title: Services - Delete Service Flow (DELETE /services/:id)
---
sequenceDiagram
    autonumber
    actor Client as Manager Client
    participant Ctrl as ServicesController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as ServicesService
    participant ServiceRepo as ServiceRepo (TypeORM)
    participant BookingServiceRepo as BookingServiceRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: DELETE /services/:id (with Bearer Token, role=Manager)
    Client->>Ctrl: path :id (serviceId)
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard-->>Ctrl: return true (JWT verified)
    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve @Roles('Manager')
    alt Not Manager
        RGuard-->>Client: Throw ForbiddenException
    end
    RGuard-->>Ctrl: return true

    Ctrl->>Service: remove(id)
    activate Service
    Service->>ServiceRepo: findOne({ where: { serviceId: id } })
    ServiceRepo->>DB: SELECT * FROM Services WHERE ServiceId = ?
    DB-->>ServiceRepo: row / null
    ServiceRepo-->>Service: Service / null
    opt Service not found
        Service-->>Client: Throw NotFoundException
    end

    Service->>BookingServiceRepo: count({ where: { serviceId: id } })
    BookingServiceRepo->>DB: SELECT COUNT(*) FROM BookingServices WHERE ServiceId = ?
    DB-->>BookingServiceRepo: refCount
    BookingServiceRepo-->>Service: refCount
    alt refCount > 0
        Service-->>Client: Throw ConflictException (Cannot delete, N booking reference(s) exist)
    end

    Service->>ServiceRepo: remove(svc)
    ServiceRepo->>DB: DELETE FROM Services WHERE ServiceId = ?
    DB-->>ServiceRepo: ok

    Service-->>Ctrl: { message: 'Service deleted' }
    deactivate Service

    Ctrl-->>Client: HTTP 200 - { message: 'Service deleted' }
    deactivate Ctrl
```

---

### 2.5 POST /services/request – Khách yêu cầu dịch vụ cho booking *(User/Manager/Receptionist)*

```mermaid
---
title: Services - Request Service Flow (POST /services/request)
---
sequenceDiagram
    autonumber
    actor Client as User/Manager/Receptionist Client
    participant Ctrl as ServicesController
    participant Guard as AuthGuard
    participant RGuard as RolesGuard
    participant Service as ServicesService
    participant BookingRepo as BookingRepo (TypeORM)
    participant ServiceRepo as ServiceRepo (TypeORM)
    participant BookingServiceRepo as BookingServiceRepo (TypeORM)
    participant DB as Database (SQL Server)

    note right of Client: POST /services/request (with Bearer Token, role in [User, Manager, Receptionist])
    Client->>Ctrl: RequestServiceDto (bookingId, serviceId, quantity)
    activate Ctrl
    Ctrl->>Guard: canActivate(context)
    Guard->>Guard: Verify JWT & attach user (sub = accountId) to request
    alt JWT invalid / expired
        Guard-->>Client: Throw UnauthorizedException
    else JWT valid
        Guard-->>Ctrl: return true
    end

    Ctrl->>RGuard: canActivate(context)
    RGuard->>RGuard: Resolve @Roles('User', 'Manager', 'Receptionist')
    alt Role not allowed
        RGuard-->>Client: Throw ForbiddenException
    end
    RGuard-->>Ctrl: return true

    Ctrl->>Service: requestService(req.user.sub, dto)
    activate Service

    Service->>BookingRepo: findOne({ where: { bookingId }, relations: { customer: true } })
    BookingRepo->>DB: SELECT b.*, c.AccountId FROM Bookings b JOIN Customers c ON b.CustomerId = c.CustomerId WHERE b.BookingId = ?
    DB-->>BookingRepo: Booking with customer / null
    BookingRepo-->>Service: Booking / null

    alt Booking not found OR booking.customer.accountId !== accountId
        Service-->>Client: Throw NotFoundException (Booking not found)
    end

    Service->>ServiceRepo: findOne({ where: { serviceId: dto.serviceId } })
    ServiceRepo->>DB: SELECT * FROM Services WHERE ServiceId = ?
    DB-->>ServiceRepo: row / null
    ServiceRepo-->>Service: Service / null
    opt Service not found
        Service-->>Client: Throw NotFoundException (Service not found)
    end

    Service->>BookingServiceRepo: create({ bookingId, serviceId, quantity })
    Service->>BookingServiceRepo: save(bookingService)
    BookingServiceRepo->>DB: INSERT INTO BookingServices (BookingId, ServiceId, Quantity) ...
    DB-->>BookingServiceRepo: persisted BookingService
    BookingServiceRepo-->>Service: BookingService Entity

    Note over Service, BookingRepo: Update booking totalPrice = totalPrice + service.price * quantity

    Service->>BookingRepo: save(booking with new totalPrice)
    BookingRepo->>DB: UPDATE Bookings SET TotalPrice = ? WHERE BookingId = ?
    DB-->>BookingRepo: ok

    Service-->>Ctrl: { message: 'Service requested successfully', totalPrice }
    deactivate Service

    Ctrl-->>Client: HTTP 201 - { message, totalPrice }
    deactivate Ctrl
```

---

## 3. Tóm tắt API

| Method | Endpoint | Roles | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/services` | Public | Lấy tất cả dịch vụ |
| `POST` | `/services` | Manager | Tạo dịch vụ mới |
| `PATCH` | `/services/:id` | Manager | Cập nhật dịch vụ (partial) |
| `DELETE` | `/services/:id` | Manager | Xóa dịch vụ (chặn nếu đang được booking tham chiếu) |
| `POST` | `/services/request` | User, Manager, Receptionist | Khách yêu cầu dịch vụ cho booking (ownership check) |

---

## 4. Notes quan trọng

- **Ownership check ở `requestService`**: `User` chỉ được request service cho booking thuộc customer của mình (`booking.customer.accountId === req.user.sub`). Manager/Receptionist bypass vì role đã cho phép.
- **Delete có ràng buộc**: `DELETE /services/:id` từ chối nếu `BookingServices` còn tham chiếu service này → tránh mất dữ liệu lịch sử.
- **Cập nhật `totalPrice`**: Mỗi lần `requestService` thành công, `Bookings.TotalPrice` được cộng dồn `service.price * quantity`. Không thực hiện transaction vì các bước tuần tự + FK đảm bảo.
