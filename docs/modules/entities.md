# Entity Documentation

Class-diagram-style documentation for every entity in `backend/src/modules/**/entities/*.entity.ts`.

Legend:
- Visibility: `Public (+)` or `Private (-)`
- Type: data type
- Purpose: short responsibility / meaning

Navigation (16 entities):
- accounts: `Account`
- auth: `RefreshToken`
- bookings: `Booking`, `BookingVersion`, `BookingDetail`
- customers: `Customer`, `CustomerBankAccount`
- housekeeping: `ChecklistTemplate`, `ChecklistLog`
- maintenance: `IssueReport`, `MaintenanceProve`
- payments: `Payment`
- rooms: `RoomType`, `Room`
- services: `Service`, `BookingService` (already documented in [services-staff-dashboard.md](./services-staff-dashboard.md))
- staff: `StaffInfo` (already documented in [services-staff-dashboard.md](./services-staff-dashboard.md))

---

## 1. `Account` — table `Accounts` (module `accounts`)

| No | Name | Description |
|----|------|-------------|
| 10 | Account | Authentication principal. Represents a user that can log into the system; doubles as the anchor for either a `Customer` or a `StaffInfo`. |

**Attributes**

| No | Attribute | Visibility | Type             | Purpose |
|----|-----------|------------|------------------|---------|
| 01 | accountId   | Private (-)| UUID PK                | Unique identifier. |
| 02 | username    | Private (-)| varchar(50) unique     | Login handle. |
| 03 | password    | Private (-)| varchar(255)           | bcrypt hash of the password. |
| 04 | isActive    | Private (-)| bit default 1          | Whether the account can log in. |
| 05 | createdAt   | Private (-)| datetime auto          | Creation timestamp. |
| 06 | role        | Private (-)| nvarchar(50) default 'User' | Authorization role (`User` / `Manager` / `Saler` / `Receptionist` / `Cleaner` / `Maintainer`). |
| 07 | customer    | Private (-)| Customer?              | Navigation: 1-1 link when this account belongs to a customer. |
| 08 | staff       | Private (-)| StaffInfo?             | Navigation: 1-1 link when this account belongs to a staff member. |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 2. `RefreshToken` — table `RefreshTokens` (module `auth`)

| No | Name | Description |
|----|------|-------------|
| 11 | RefreshToken | Persistent refresh-token record. Stores a one-way hash of the issued JWT refresh token, linked to its owning account. |

**Attributes**

| No | Attribute | Visibility | Type              | Purpose |
|----|-----------|------------|-------------------|---------|
| 01 | id             | Private (-)| UUID PK              | Unique identifier. |
| 02 | accountId      | Private (-)| UUID indexed FK      | Owner of the refresh token. |
| 03 | tokenHash      | Private (-)| varchar(255) unique  | bcrypt hash of the refresh-token string. |
| 04 | expiresAt      | Private (-)| datetime             | Absolute expiry timestamp. |
| 05 | createdAt      | Private (-)| datetime auto        | Creation timestamp. |
| 06 | account        | Private (-)| Account?             | Navigation: many-to-one to `Account` (cascade delete). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 3. `Booking` — table `Bookings` (module `bookings`)

| No | Name | Description |
|----|------|-------------|
| 12 | Booking | Aggregate root of the booking bounded context. A booking has many `BookingVersion` snapshots and accumulates payments and requested services. |

**Attributes**

| No | Attribute        | Visibility | Type                | Purpose |
|----|------------------|------------|---------------------|---------|
| 01 | bookingId        | Private (-)| UUID PK             | Unique identifier. |
| 02 | customerId       | Private (-)| UUID FK             | FK to the customer who placed the booking. |
| 03 | bookingDate      | Private (-)| datetime auto       | Date the booking was created. |
| 04 | currentVersion   | Private (-)| int default 1       | Pointer to the latest `BookingVersion.versionNumber`. |
| 05 | totalPrice       | Private (-)| decimal(18,2) default 0 | Latest authoritative booking total (sums into total). |
| 06 | status           | Private (-)| varchar(20) default 'Pending' | Lifecycle status (`Pending` / `Confirmed` / `Cancelled` / etc.). |
| 07 | isDeleted        | Private (-)| bit default 0       | Soft-delete flag. |
| 08 | evidenceImage    | Private (-)| nvarchar(MAX) nullable | Walk-in counter booking evidence (e.g. ID photo URL). |
| 09 | customer         | Private (-)| Customer            | Navigation to the customer. |
| 10 | versions         | Private (-)| BookingVersion[]    | History of snapshots (1 → N). |
| 11 | payments         | Private (-)| Payment[]           | Payments linked to this booking (1 → N). |
| 12 | services         | Private (-)| BookingService[]    | Requested services (1 → N). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed aggregate root; no custom business methods. |

---

## 4. `BookingVersion` — table `BookingVersions` (module `bookings`)

| No | Name | Description |
|----|------|-------------|
| 13 | BookingVersion | Immutable snapshot of a booking. Each change (dates, guests, special requests, total) creates a new version row instead of mutating the original. |

**Attributes**

| No | Attribute                | Visibility | Type                  | Purpose |
|----|--------------------------|------------|-----------------------|---------|
| 01 | versionId                | Private (-)| UUID PK               | Unique identifier. |
| 02 | bookingId                | Private (-)| UUID FK               | FK to the parent booking. |
| 03 | versionNumber            | Private (-)| int                   | Monotonically increasing version number within the booking. |
| 04 | checkIn                  | Private (-)| date nullable         | Snapshot of the check-in date at this version. |
| 05 | checkOut                 | Private (-)| date nullable         | Snapshot of the check-out date. |
| 06 | adults                   | Private (-)| int nullable          | Snapshot of the number of adults. |
| 07 | children                 | Private (-)| int nullable          | Snapshot of the number of children. |
| 08 | specialRequest           | Private (-)| nvarchar(MAX) nullable| Snapshot of any special requests. |
| 09 | totalAmountAtThisVersion | Private (-)| decimal(18,2)         | Subtotal recorded when this snapshot was created (room amounts). |
| 10 | staffInChargeId          | Private (-)| UUID nullable FK      | Optional FK to staff handling this version. |
| 11 | changeReason             | Private (-)| nvarchar(MAX) nullable| Free-text reason for creating this version. |
| 12 | requestEvidenceImage     | Private (-)| nvarchar(MAX) nullable| Evidence attached to a change request. |
| 13 | createdAt                | Private (-)| datetime auto         | When this snapshot was produced. |
| 14 | booking                  | Private (-)| Booking               | Navigation to parent booking (cascade delete). |
| 15 | staffInCharge            | Private (-)| StaffInfo?            | Navigation to assigned staff (optional). |
| 16 | details                  | Private (-)| BookingDetail[]       | Room lines in this version (1 → N). |
| 17 | payments                 | Private (-)| Payment[]             | Payments settled against this version (1 → N). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 5. `BookingDetail` — table `BookingDetails` (module `bookings`)

| No | Name | Description |
|----|------|-------------|
| 14 | BookingDetail | Room line within a `BookingVersion`. Records which room was booked at this version, its price, and length of stay. |

**Attributes**

| No | Attribute        | Visibility | Type            | Purpose |
|----|------------------|------------|-----------------|---------|
| 01 | bookingDetailId  | Private (-)| UUID PK         | Unique identifier. |
| 02 | versionId        | Private (-)| UUID FK         | FK to the parent `BookingVersion`. |
| 03 | roomId           | Private (-)| UUID FK         | FK to the reserved `Room`. |
| 04 | price            | Private (-)| decimal(18,2)   | Price captured for this room at this version. |
| 05 | nights           | Private (-)| int             | Number of nights for this room line. |
| 06 | version          | Private (-)| BookingVersion  | Navigation to parent version (cascade delete). |
| 07 | room             | Private (-)| Room            | Navigation to the reserved room. |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 6. `Customer` — table `Customers` (module `customers`)

| No | Name | Description |
|----|------|-------------|
| 15 | Customer | Customer profile. Linked 1-1 to an `Account`; owns many `Booking` rows and stores one or more `CustomerBankAccount` records. |

**Attributes**

| No | Attribute  | Visibility | Type                        | Purpose |
|----|------------|------------|-----------------------------|---------|
| 01 | customerId | Private (-)| UUID PK                     | Unique identifier. |
| 02 | accountId  | Private (-)| UUID unique FK              | 1-1 link to `Accounts.AccountId`. |
| 03 | fullName   | Private (-)| nvarchar(100)               | Display name. |
| 04 | email      | Private (-)| nvarchar(100) unique nullable | Email address. |
| 05 | phone      | Private (-)| varchar(20) unique nullable | Phone number. |
| 06 | avatar     | Private (-)| nvarchar(255) nullable      | Avatar image URL or path. |
| 07 | createdAt  | Private (-)| datetime auto               | When the customer registered. |
| 08 | account    | Private (-)| Account                     | Navigation to the linked account. |
| 09 | bookings   | Private (-)| Booking[]                   | This customer's bookings (1 → N). |
| 10 | bankAccounts | Private (-)| CustomerBankAccount[]      | Bank accounts stored for refunds (1 → N). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 7. `CustomerBankAccount` — table `CustomerBankAccounts` (module `customers`)

| No | Name | Description |
|----|------|-------------|
| 16 | CustomerBankAccount | Bank account stored for a customer (used for refunds). A customer may have multiple records; one may be marked default. |

**Attributes**

| No | Attribute          | Visibility | Type                | Purpose |
|----|--------------------|------------|---------------------|---------|
| 01 | bankId             | Private (-)| UUID PK             | Unique identifier. |
| 02 | customerId         | Private (-)| UUID FK             | Owner customer. |
| 03 | bankName           | Private (-)| nvarchar(100) nullable | Bank name. |
| 04 | accountNumber      | Private (-)| varchar(20) nullable | Account number. |
| 05 | accountHolderName  | Private (-)| nvarchar(100) nullable | Account holder name. |
| 06 | isDefault          | Private (-)| bit default 0       | Whether this is the customer's default refund account. |
| 07 | customer           | Private (-)| Customer            | Navigation to the owning customer. |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 8. `ChecklistTemplate` — table `ChecklistTemplates` (module `housekeeping`)

| No | Name | Description |
|----|------|-------------|
| 17 | ChecklistTemplate | Reusable housekeeping checklist definition (e.g. "Daily cleaning", "Deep clean"). A template aggregates many `ChecklistLog` records. |

**Attributes**

| No | Attribute     | Visibility | Type                          | Purpose |
|----|---------------|------------|-------------------------------|---------|
| 01 | templateId    | Private (-)| UUID PK                       | Unique identifier. |
| 02 | templateType  | Private (-)| nvarchar(50) unique nullable  | Natural key used in join with `ChecklistLog.TemplateType`. |
| 03 | itemName      | Private (-)| nvarchar(255)                 | Display name of the checklist. |
| 04 | description   | Private (-)| nvarchar(MAX) nullable        | Free-text description of what the checklist covers. |
| 05 | logs          | Private (-)| ChecklistLog[]                | Logs produced from this template (1 → N). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 9. `ChecklistLog` — table `ChecklistLogs` (module `housekeeping`)

| No | Name | Description |
|----|------|-------------|
| 18 | ChecklistLog | A single completion record produced when a staff member finished a checklist on a room. |

**Attributes**

| No | Attribute      | Visibility | Type                       | Purpose |
|----|----------------|------------|----------------------------|---------|
| 01 | logId          | Private (-)| UUID PK                    | Unique identifier. |
| 02 | roomId         | Private (-)| UUID FK                    | Room being cleaned. |
| 03 | staffId        | Private (-)| UUID FK                    | Staff who performed the work. |
| 04 | templateType   | Private (-)| nvarchar(50) nullable      | Natural key of the template used (joins on `ChecklistTemplate.templateType`). |
| 05 | logTime        | Private (-)| datetime auto              | When the log was created. |
| 06 | evidenceImage  | Private (-)| nvarchar(MAX) nullable     | Optional photo evidence. |
| 07 | notes          | Private (-)| nvarchar(MAX) nullable     | Free-text notes. |
| 08 | room           | Private (-)| Room?                      | Navigation to the room. |
| 09 | staff          | Private (-)| StaffInfo?                 | Navigation to the staff. |
| 10 | template       | Private (-)| ChecklistTemplate?         | Navigation to the template (joined by `templateType`). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 10. `IssueReport` — table `IssueReports` (module `maintenance`)

| No | Name | Description |
|----|------|-------------|
| 19 | IssueReport | A maintenance issue raised against a specific room. Tracks lifecycle via `Status` and accumulates `MaintenanceProve` evidence. |

**Attributes**

| No | Attribute   | Visibility | Type                      | Purpose |
|----|-------------|------------|---------------------------|---------|
| 01 | issueId     | Private (-)| UUID PK                   | Unique identifier. |
| 02 | roomId      | Private (-)| UUID FK                   | The room that has the issue. |
| 03 | reporterId  | Private (-)| UUID FK                   | Staff who reported the issue. |
| 04 | description | Private (-)| nvarchar(MAX) nullable    | Free-text description. |
| 05 | issueImage  | Private (-)| nvarchar(MAX) nullable    | Optional photo of the issue. |
| 06 | status      | Private (-)| nvarchar(50) default 'Pending' | Lifecycle state (`Pending` / `InProgress` / `Resolved`). |
| 07 | createdAt   | Private (-)| datetime auto             | When the issue was reported. |
| 08 | room        | Private (-)| Room                      | Navigation to the room. |
| 09 | reporter    | Private (-)| StaffInfo                 | Navigation to the reporting staff. |
| 10 | proves      | Private (-)| MaintenanceProve[]        | Maintenance evidence attached (1 → N). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 11. `MaintenanceProve` — table `MaintenanceProves` (module `maintenance`)

| No | Name | Description |
|----|------|-------------|
| 20 | MaintenanceProve | Evidence that a staff member fixed a reported `IssueReport`. Each prove records who did the work and when. |

**Attributes**

| No | Attribute     | Visibility | Type                     | Purpose |
|----|---------------|------------|--------------------------|---------|
| 01 | proveId       | Private (-)| UUID PK                  | Unique identifier. |
| 02 | issueId       | Private (-)| UUID FK                  | Issue that was resolved. |
| 03 | maintainerId  | Private (-)| UUID FK                  | Staff who fixed the issue. |
| 04 | finishImage   | Private (-)| nvarchar(MAX) nullable   | Photo evidence after completion. |
| 05 | finishVideo   | Private (-)| nvarchar(MAX) nullable   | Optional video evidence. |
| 06 | resolvedAt    | Private (-)| datetime auto            | When the issue was resolved. |
| 07 | issue         | Private (-)| IssueReport              | Navigation to the issue. |
| 08 | maintainer    | Private (-)| StaffInfo                | Navigation to the maintainer. |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 12. `Payment` — table `Payments` (module `payments`)

| No | Name | Description |
|----|------|-------------|
| 21 | Payment | A single payment record against a `BookingVersion`. A booking may have multiple payments (deposits, refunds), all linked to a specific version. |

**Attributes**

| No | Attribute               | Visibility | Type                            | Purpose |
|----|-------------------------|------------|---------------------------------|---------|
| 01 | paymentId               | Private (-)| UUID PK                         | Unique identifier. |
| 02 | versionId               | Private (-)| UUID FK                         | Version this payment settles. |
| 03 | bookingId               | Private (-)| UUID FK                         | Denormalised booking reference for reporting. |
| 04 | amount                  | Private (-)| decimal(18,2)                   | Paid amount. |
| 05 | method                  | Private (-)| varchar(20)                     | Payment method (e.g. `Cash` / `Bank` / `Card`). |
| 06 | status                  | Private (-)| varchar(20) default 'Pending'   | Lifecycle (`Pending` / `Paid` / `Refunded` / `Failed`). |
| 07 | externalTransactionId   | Private (-)| varchar(100) nullable           | Provider-side transaction reference. |
| 08 | paidAt                  | Private (-)| datetime nullable               | When the payment was settled. |
| 09 | version                 | Private (-)| BookingVersion                  | Navigation to the version. |
| 10 | booking                 | Private (-)| Booking                         | Navigation to the booking. |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 13. `RoomType` — table `RoomTypes` (module `rooms`)

| No | Name | Description |
|----|------|-------------|
| 22 | RoomType | Catalogue entry describing a room category (e.g. `Deluxe`, `Suite`). Holds base price and capacity; groups many `Room` rows. |

**Attributes**

| No | Attribute   | Visibility | Type                       | Purpose |
|----|-------------|------------|----------------------------|---------|
| 01 | typeId      | Private (-)| UUID PK                    | Unique identifier. |
| 02 | typeName    | Private (-)| nvarchar(50)               | Display name. |
| 03 | description | Private (-)| nvarchar(MAX) nullable     | Marketing / customer description. |
| 04 | price       | Private (-)| decimal(18,2)              | Base nightly price. |
| 05 | maxGuests   | Private (-)| int default 2              | Maximum guests allowed. |
| 06 | rooms       | Private (-)| Room[]                     | Physical rooms of this type (1 → N). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## 14. `Room` — table `Rooms` (module `rooms`)

| No | Name | Description |
|----|------|-------------|
| 23 | Room | A physical room belonging to a `RoomType`. Tracks per-room lifecycle (`Available` / `Occupied` / `Maintenance`) via `Status`. |

**Attributes**

| No | Attribute   | Visibility | Type              | Purpose |
|----|-------------|------------|-------------------|---------|
| 01 | roomId      | Private (-)| UUID PK           | Unique identifier. |
| 02 | roomCode    | Private (-)| varchar(10) unique| Human-friendly code (e.g. `A101`). |
| 03 | typeId      | Private (-)| UUID FK           | FK to the parent `RoomType`. |
| 04 | floor       | Private (-)| int nullable      | Floor number for UI grouping. |
| 05 | status      | Private (-)| varchar(20)       | Room state (`Available` / `Occupied` / `Maintenance` / `Cleaning`). |
| 06 | roomType    | Private (-)| RoomType          | Navigation to the room type. |
| 07 | bookingDetails | Private (-)| BookingDetail[] | Bookings referencing this room (1 → N). |
| 08 | checklistLogs | Private (-)| ChecklistLog[] | Housekeeping logs for this room (1 → N). |
| 09 | issueReports | Private (-)| IssueReport[]   | Maintenance issues raised against this room (1 → N). |

**Methods / Operations**

| No | Method | Visibility | Return | Purpose |
|----|--------|------------|--------|---------|
| -- | --     | --         | --     | TypeORM-managed entity; no custom business methods. |

---

## Already documented (see `services-staff-dashboard.md`)

- Module `services`: `Service` (#24), `BookingService` (#25)
- Module `staff`: `StaffInfo` (#26)

---

## Cross-entity relationships (overview)

| Parent | Cardinality | Child |
|--------|-------------|-------|
| `Account`        | 1 ↔ 1  | `Customer`, `StaffInfo` |
| `Account`        | 1 → N  | `RefreshToken` |
| `Customer`       | 1 → N  | `Booking`, `CustomerBankAccount` |
| `Booking`        | 1 → N  | `BookingVersion`, `Payment`, `BookingService` |
| `BookingVersion` | 1 → N  | `BookingDetail`, `Payment` |
| `RoomType`       | 1 → N  | `Room` |
| `Room`           | 1 → N  | `BookingDetail`, `ChecklistLog`, `IssueReport` |
| `StaffInfo`      | 1 → N  | `BookingVersion` (staffInCharge), `ChecklistLog`, `IssueReport` (reporter), `MaintenanceProve` (maintainer) |
| `IssueReport`    | 1 → N  | `MaintenanceProve` |
| `ChecklistTemplate` | 1 → N (via `templateType` natural key) | `ChecklistLog` |
| `Service`        | 1 → N  | `BookingService` |
