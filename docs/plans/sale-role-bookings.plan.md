# Plan: Bổ sung chức năng quản lý booking cho role SALE (Saler)

## Tổng quan
- Bổ sung một controller mới (`SaleBookingsController`) cho phép nhân viên **Saler** (tên trong hệ thống hiện tại) tạo booking hộ khách kèm ảnh bill, sửa booking có upload ảnh minh chứng yêu cầu đổi, soft delete khi tạo nhầm, và hủy booking để tính phí phạt.
- Tận dụng toàn bộ logic Version, walk-in customer upsert, transaction và logging đã có để giữ đồng nhất domain.
- Không phát sinh thư viện mới. Upload ảnh dùng chuỗi `Base64` hoặc URL thông qua JSON body (khớp với cách `ChecklistLog.EvidenceImage`, `MaintenanceProve.FinishImage` đang lưu).

## Bounded contexts & workspace bị ảnh hưởng
- Backend: `modules/bookings`, `modules/staff`, `modules/accounts`, `modules/database` (synchronize tự sinh cột mới).
- Frontend: `frontend/app/admin/bookings/**`, `frontend/lib/admin-api.ts`, `frontend/lib/auth-context.tsx` (Saler đã được redirect vào `/admin` sẵn).
- Docs: cập nhật `docs/API_DOCS.md` nếu file còn được dùng.

## Phân tích codebase hiện tại (file:line quan trọng)

### Backend – Bookings
- `backend/src/modules/bookings/bookings.controller.ts:10-95` – `BookingsController` đã có nhóm route admin (`@Roles('Manager', 'Receptionist', 'Saler')` cho `GET /admin`, `GET /admin/:id`, `POST /admin/:id/checkout`) và nhóm route User (`POST /`, `PUT /:id`, `POST /:id/cancel`).
- `backend/src/modules/bookings/bookings.service.ts:54-124` – `createBookingForCustomer()` là hàm insert Booking + Version 1 + Details trong một transaction, được tái sử dụng bởi `create()` (User) và `createWalkIn()` (Receptionist). **Tận dụng lại để tạo booking hộ khách cho Saler**.
- `backend/src/modules/bookings/bookings.service.ts:242-298` – `update()` của User tạo version mới, `cancel()` chỉ set `Status = 'Cancelled'`. Logic này tái sử dụng được; chỉ cần thêm nhận `RequestEvidenceImage` và áp dụng cho Saler.
- `backend/src/modules/bookings/entities/booking.entity.ts:46-47` – đã có cột `IsDeleted BIT` cho phép soft delete; nhưng chưa thấy code nào set giá trị này. Hiện `findAll`/`findAllForStaff` chưa filter theo `IsDeleted`.

### Backend – Entities / Fields sẵn có
- `backend/src/modules/bookings/entities/booking-version.entity.ts:65-71` – **đã có sẵn** cột `RequestEvidenceImage NVARCHAR(MAX) NULL`. Không cần thêm cột này.
- `backend/src/modules/bookings/entities/booking.entity.ts` – **CHƯA CÓ** `EvidenceImage`. Cần thêm cột mới `EvidenceImage NVARCHAR(MAX) NULL`.
- `backend/src/modules/housekeeping/entities/checklist-log.entity.ts:30-31` và `backend/src/modules/maintenance/entities/maintenance-prove.entity.ts:23-27` – pattern lưu `EvidenceImage` / `FinishImage` dưới dạng chuỗi (`NVARCHAR(MAX)`) đã được sử dụng; áp dụng tương tự.

### Backend – Auth/Role
- `backend/src/modules/accounts/roles.constants.ts:1` – `ROLES = ['Manager', 'Receptionist', 'Saler', 'Cleaner', 'Maintainer', 'User']`. Role nhân viên bán hàng tên là `Saler`.
- `backend/src/modules/auth/auth.guard.ts:13-26` – `AuthGuard` xác thực JWT, gắn `request.user = { sub, username, role }`.
- `backend/src/modules/auth/guards/roles.guard.ts:14-28` – `RolesGuard` đọc metadata `@Roles(...)` từ method/class và so khớp `user.role`.
- `backend/src/seed/roles.seed.ts:43-51` – account `staff1` đã được seed với `role: 'Saler'`.

### Backend – Module khác
- `backend/src/modules/staff/staff.service.ts:100-102` – `findByAccountId(accountId)` đã có sẵn, dùng để resolve StaffInfo từ accountId (cần thiết cho `StaffInChargeId` của Version khi Saler sửa).
- `backend/src/modules/database/database.module.ts:11-19` – `synchronize: true`, không cần migration script. Tuy nhiên cần thêm một bước kiểm tra cột `EvidenceImage` tồn tại trong DB khi chạy synchronize lần đầu (TypeORM sẽ tự động thêm).
- `backend/src/common/interceptor/logging.interceptor.ts:14-43` – LoggingInterceptor đã chạy global, không cần thêm log riêng.

### Frontend
- `frontend/lib/auth-context.tsx:71-77` – Sau login, role `Saler` đã được redirect đến `/admin`.
- `frontend/app/admin/components/Sidebar.tsx:15-23` – Sidebar đã có mục "Đặt phòng" cho `Saler`; không cần thêm menu.
- `frontend/app/admin/bookings/page.tsx:25-156` – Trang danh sách booking có `WalkInModal` (Modal tạo booking walk-in cho Receptionist). Có thể tái sử dụng pattern Modal này cho form Saler.
- `frontend/app/admin/bookings/[id]/page.tsx:51-63, 73-74` – Trang chi tiết booking đã có nút Checkout với `confirm()`. Pattern `confirm()` + `await apiRequest()` + `alert()` được dùng cho action nguy hiểm.
- `frontend/lib/admin-api.ts:192-213` – `listBookings`, `walkInBooking`, `getBooking`, `checkoutBooking`. Cần thêm các hàm mới: `createSaleBooking`, `updateSaleBooking`, `softDeleteBooking`, `cancelBookingForStaff`.

## Thiết kế kiến trúc

### Routing
- Tạo controller mới `backend/src/modules/bookings/sale-bookings.controller.ts` với prefix `sale/bookings`, chỉ dành cho `@Roles('Saler')`. Lý do: tách bạch phân quyền Saler (không chung với Manager/Receptionist), không phình `BookingsController`.
- Path cuối cùng khi gọi: `POST /sale/bookings`, `PUT /sale/bookings/:id`, `DELETE /sale/bookings/:id`, `PATCH /sale/bookings/:id/cancel`. Frontend gọi qua `NEXT_PUBLIC_API_URL/sale/bookings/...` (đã có sẵn trong `lib/api.ts`).
- Đăng ký controller trong `backend/src/modules/bookings/bookings.module.ts` (`controllers: [BookingsController, SaleBookingsController]`). Không cần module mới, không cần service mới (tái sử dụng `BookingsService`).

### Authorization
- Tất cả route của Saler phải có `@Roles('Saler')` (chỉ Saler, không gộp Manager/Receptionist vì nghiệp vụ khác nhau: Manager/Receptionist dùng walk-in, Saler dùng "create hộ khách có bill").
- Class-level `@UseGuards(AuthGuard, RolesGuard)`.

### Service Logic (bổ sung vào `BookingsService`)

#### `createForSaler(accountId, dto)` – tạo booking hộ khách
- Tái sử dụng flow của `createWalkIn()` nhưng thay vì tạo customer mới, Saler nhập `customerFullName/customerPhone/customerEmail/customerCccd` để chọn/tạo customer (giống walk-in).
- Cho phép `evidenceImage?: string` (Base64/URL), lưu vào `Bookings.EvidenceImage`.
- Gọi lại `createBookingForCustomer(customerId, dto, { staffInChargeId, changeReason: 'Saler booking' })`.

#### `updateForSaler(accountId, bookingId, dto)` – sửa booking có evidence
- Validate `requestEvidenceImage` là bắt buộc (string, không rỗng, độ dài tối đa 10MB khi là Base64 ước lượng).
- Resolve `staffInChargeId` từ accountId (dùng `staffService.findByAccountId`).
- Tái sử dụng logic version mới của `update()`, lưu thêm `requestEvidenceImage` và `changeReason = 'Saler cập nhật theo yêu cầu khách'`.
- Nếu booking đã soft delete (`IsDeleted = 1`) → 404.
- Nếu status là `Cancelled` hoặc `Completed` → 400 (giữ nguyên rule cũ).

#### `softDelete(accountId, bookingId)` – xóa mềm
- Find booking không filter `IsDeleted` để cho phép revert (nhưng revert không nằm trong sprint này).
- Nếu `IsDeleted = 1` → 400 "Booking đã bị xóa trước đó".
- Nếu status `Completed` → 400 "Không thể xóa booking đã hoàn thành" (giữ tính toàn vẹn lịch sử).
- Set `IsDeleted = 1` + lưu audit: `deletedAt`, `deletedBy` (nếu thêm cột).
- Lưu ý: theo yêu cầu chỉ cần set `IsDeleted = 1`; audit `deletedAt/deletedBy` đưa vào out-of-scope để giữ diff nhỏ.

#### `cancelForSaler(accountId, bookingId)` – hủy booking
- Khác với `cancel()` User: cho phép Saler hủy **bất kỳ** booking nào (không giới hạn customer), giữ record để tính phí phạt.
- Nếu đã `Cancelled` → 400 "Booking đã được hủy trước đó".
- Nếu `Completed` → 400 "Không thể hủy booking đã hoàn thành".
- Set `Status = 'Cancelled'`.
- Trả về message + `status: 'Cancelled'`.

### Soft Delete áp dụng vào query
- Bổ sung `IsDeleted = 0` vào:
  - `findAll()` User (Customer): `where: { customerId, isDeleted: false }`.
  - `findOne()` User: thêm `isDeleted: false`.
  - `findAllForStaff()` Staff: `qb.andWhere('b.IsDeleted = 0')`.
  - `findOneForStaff()` Staff: thêm `where: { bookingId, isDeleted: false }`.
- Không cần thay đổi `checkout()` (checkout cần thiết khi khách rời phòng).

### File Upload Strategy
- Theo pattern hiện tại của dự án: **không có multer**, không có disk storage. Mọi `EvidenceImage` / `RequestEvidenceImage` được lưu dưới dạng chuỗi (`NVARCHAR(MAX)`).
- 2 phương án gửi ảnh từ frontend:
  1. URL (nếu FE đã upload lên dịch vụ lưu trữ khác).
  2. Base64 string (nếu muốn đơn giản).
- Validation: `IsString()`, `@MaxLength(13_500_000)` để tránh payload quá lớn (ước lượng ~10MB Base64). Nếu là URL, có thể bỏ qua kiểm tra định dạng vì đơn giản.
- Phương án chốt: cho phép cả URL lẫn Base64 (chỉ check string và độ dài). FE sẽ quyết định cách upload thực tế.

## Database schema changes

### Bảng `Bookings`
- Thêm cột `EvidenceImage NVARCHAR(MAX) NULL` (lưu ảnh bill khách đưa cho Saler).
- Không thêm `DeletedAt/DeletedBy` để giữ diff nhỏ.

### Bảng `BookingVersions`
- Đã có sẵn `RequestEvidenceImage NVARCHAR(MAX) NULL`. Không cần thay đổi.

### Bảng `Accounts`
- Không thay đổi. Saler account đã có sẵn (`staff1` seed).

## API Endpoints chi tiết

### 1. `POST /sale/bookings` – Tạo booking hộ khách
- Roles: `Saler`
- Request body (`CreateSaleBookingDto`):
  ```typescript
  {
    customerFullName: string;     // required, 1..100
    customerPhone: string;        // required, 1..20
    customerEmail?: string;       // optional, email
    customerCccd?: string;        // optional
    checkIn: string;              // ISO date
    checkOut: string;             // ISO date
    adults: number;               // int >= 1
    children: number;             // int >= 0
    roomIds: string[];            // UUID[]
    specialRequest?: string;
    evidenceImage?: string;       // optional Base64 hoặc URL, max 13_500_000 chars
  }
  ```
- Response: `{ message: 'Saler booking created', bookingId, customerId, isNewCustomer }`
- Errors: 400 (validation), 403 (không phải Saler), 404 (room không tồn tại).

### 2. `PUT /sale/bookings/:id` – Sửa booking có evidence
- Roles: `Saler`
- Request body (`UpdateSaleBookingDto`):
  ```typescript
  {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    roomIds?: string[];           // nếu đổi phòng, cần truyền lại
    specialRequest?: string;
    requestEvidenceImage: string; // REQUIRED, 1..13_500_000
    changeReason?: string;
  }
  ```
- Response: `{ message: 'Booking updated by Saler', versionNumber, bookingId }`
- Errors: 400 (validation hoặc trạng thái không cho phép), 404 (booking không tồn tại hoặc đã soft delete).

### 3. `DELETE /sale/bookings/:id` – Soft delete
- Roles: `Saler`
- Request body: empty
- Response: `{ message: 'Booking soft-deleted', bookingId }`
- Errors: 400 (đã xóa, hoặc đã Completed), 404 (không tồn tại).

### 4. `PATCH /sale/bookings/:id/cancel` – Hủy booking
- Roles: `Saler`
- Request body: empty
- Response: `{ message: 'Booking cancelled', bookingId, status: 'Cancelled' }`
- Errors: 400 (đã hủy/đã hoàn thành), 404.

### Validation rules (skill `strict-validation`)
- Tất cả DTO dùng `class-validator` (`@IsString`, `@IsUUID`, `@IsInt`, `@Min`, `@MaxLength`, `@IsOptional`).
- FE phải validate trước khi gọi API (cùng rule backend):
  - `customerPhone` khớp regex `/^[0-9+\-\s]{8,20}$/`.
  - `customerEmail` khớp email regex.
  - `checkIn < checkOut`, `checkIn >= today` (chỉ áp dụng khi tạo mới).
  - `adults >= 1`, `children >= 0`.
  - `roomIds.length >= 1`, mỗi phần tử là UUID v4.
  - `evidenceImage`/`requestEvidenceImage` không rỗng, dưới 13.5M ký tự.

## Danh sách file cần tạo/sửa

### Backend – Tạo mới
- [ ] `backend/src/modules/bookings/sale-bookings.controller.ts` – Controller mới, mount `SaleBookingsController`.
- [ ] `backend/src/modules/bookings/dto/create-sale-booking.dto.ts` – DTO tạo booking (extends `CreateWalkInBookingDto` + `evidenceImage`).
- [ ] `backend/src/modules/bookings/dto/update-sale-booking.dto.ts` – DTO sửa booking (extends `CreateBookingDto` partial + `requestEvidenceImage` required).

### Backend – Sửa
- [ ] `backend/src/modules/bookings/bookings.entity.ts` – Thêm cột `EvidenceImage` cho Booking.
- [ ] `backend/src/modules/bookings/bookings.service.ts` – Thêm 4 method: `createForSaler`, `updateForSaler`, `softDelete`, `cancelForSaler`. Bổ sung filter `IsDeleted = 0` vào `findAll`, `findOne`, `findAllForStaff`, `findOneForStaff`.
- [ ] `backend/src/modules/bookings/bookings.module.ts` – Đăng ký `SaleBookingsController`.
- [ ] `backend/src/seed/seed.ts` – Không cần sửa (synchronize tự thêm cột).

### Frontend – Sửa
- [ ] `frontend/lib/admin-api.ts` – Thêm `createSaleBooking`, `updateSaleBooking`, `softDeleteBooking`, `cancelBookingForStaff`; thêm types `CreateSaleBookingDto`, `UpdateSaleBookingDto`.
- [ ] `frontend/app/admin/bookings/page.tsx` – Thêm nút "Tạo booking hộ khách" mở `SaleBookingModal` (form có upload ảnh, dùng `<input type="file" accept="image/*">` + FileReader đọc Base64).
- [ ] `frontend/app/admin/bookings/[id]/page.tsx` – Thêm 3 nút action khi `user.role === 'Saler'`: Sửa (mở `SaleEditModal` với input file), Hủy, Xóa mềm. Validate trước khi gọi API.

### Frontend – Tạo mới
- [ ] `frontend/app/admin/bookings/_components/SaleBookingModal.tsx` (client component) – Form tạo booking (fullName, phone, email, cccd, checkIn/Out, adults/children, roomIds, specialRequest, evidenceImage).
- [ ] `frontend/app/admin/bookings/_components/SaleEditModal.tsx` – Form sửa booking (pre-fill dữ liệu version mới nhất, yêu cầu upload evidence).

### Docs
- [ ] `docs/API_DOCS.md` – Bổ sung 4 endpoint mới (request/response, role yêu cầu).
- [ ] `docs/plans/sale-role-bookings.plan.md` – File plan này (đã tạo).

## Rules cần tuân thủ
- **R1 – Repository convention**: giữ nguyên pattern NestJS module, không tạo DTO inline trong service.
- **R2 – Logging Interceptor**: đã có global, không cần log riêng.
- **R3 – DTO validation**: dùng `class-validator` đầy đủ decorators; FE validate match trước khi POST/PUT.
- **R4 – Soft delete convention**: hiện tại cột `IsDeleted` đã có sẵn (chưa dùng). Plan này bổ sung usage đầu tiên. Không thêm cột audit `DeletedAt/DeletedBy` trong sprint này.
- **R5 – Version logic**: tái sử dụng `createBookingForCustomer()` và logic `nextVersion` trong `update()`. Không refactor.
- **R6 – Frontend phân quyền UI**: Sidebar đã hiển thị mục cho Saler; cần check `user.role === 'Saler'` trong trang chi tiết booking để ẩn/hiện nút action.
- **R7 – Không thêm thư viện mới**: tận dụng `class-validator`, không cần multer, không cần sharp.

## Thứ tự triển khai

1. **Bước 1 – Database**: thêm cột `EvidenceImage` vào `booking.entity.ts`. Chạy server để TypeORM `synchronize` tự thêm cột. Không cần migration script.
2. **Bước 2 – Service**: bổ sung 4 method trong `BookingsService` + filter `IsDeleted`. Viết test tối thiểu (assert-based self-check theo nguyên tắc repo) nếu cần.
3. **Bước 3 – DTO**: tạo `CreateSaleBookingDto` và `UpdateSaleBookingDto` với validation đầy đủ.
4. **Bước 4 – Controller mới**: tạo `SaleBookingsController`, đăng ký vào `BookingsModule`. Class-level `@UseGuards(AuthGuard, RolesGuard)`.
5. **Bước 5 – Test backend**: chạy `npm run start:dev` rồi gọi thử 4 endpoint qua `curl`/Postman với token Saler (account `staff1`, password `123456`).
6. **Bước 6 – Frontend API**: thêm 4 hàm vào `admin-api.ts`.
7. **Bước 7 – Frontend UI**: thêm nút "Tạo booking hộ khách" vào `bookings/page.tsx` + modal tương ứng. Thêm 3 nút Sửa/Hủy/Xóa mềm vào `[id]/page.tsx`.
8. **Bước 8 – Docs**: cập nhật `docs/API_DOCS.md`.

## Tiêu chí kiểm thử (cho Auditor)

### Backend
- [ ] Saler tạo được booking hộ khách với `evidenceImage` → DB lưu cột `EvidenceImage` và Version 1 có `StaffInChargeId = staff1`.
- [ ] Saler sửa booking **không** truyền `requestEvidenceImage` → 400 BadRequest.
- [ ] Saler sửa booking truyền `requestEvidenceImage` → tạo Version mới với `RequestEvidenceImage` lưu đúng.
- [ ] Saler soft delete booking → `IsDeleted = 1`; các API `GET /bookings`, `GET /bookings/admin` không trả về booking đó.
- [ ] Saler cancel booking → `Status = 'Cancelled'`; record vẫn còn để tính phí phạt.
- [ ] Customer/User thử gọi endpoint Saler → 403 Forbidden.
- [ ] Manager/Receptionist thử gọi `POST /sale/bookings` → 403 Forbidden.

### Frontend
- [ ] Saler đăng nhập → vào `/admin/bookings`, thấy nút "Tạo booking hộ khách".
- [ ] Bấm nút → mở modal với input file ảnh + form đầy đủ.
- [ ] Submit form không chọn ảnh vẫn cho phép (ảnh là optional khi tạo).
- [ ] Vào chi tiết booking → thấy 3 nút: Sửa (yêu cầu upload ảnh), Hủy, Xóa mềm.
- [ ] Bấm "Sửa" mà không upload ảnh → báo lỗi client-side, không gọi API.
- [ ] Sau soft delete → booking biến mất khỏi danh sách.
- [ ] Manager/Receptionist không thấy nút Sửa/Hủy/Xóa mềm của Saler (giữ nguyên Checkout).

### Smoke test nhanh (1 file test e2e)
- [ ] `backend/test/sale-bookings.e2e-spec.ts` – Jest e2e: login Saler → POST /sale/bookings → PUT /sale/bookings/:id (with evidence) → PATCH /sale/bookings/:id/cancel → DELETE /sale/bookings/:id. Verify DB state.

## Risks & edge cases

1. **Audit trail**: soft delete không lưu `deletedAt/deletedBy` → khó truy vết ai xóa. Mitigation: bổ sung cột nếu Auditor yêu cầu, hoặc dùng log qua `LoggingInterceptor` (đã capture accountId từ JWT). Đưa vào out-of-scope cho sprint này.
2. **Kích thước ảnh Base64**: 13.5MB string có thể làm payload request chậm. Mitigation: FE resize ảnh trước khi upload (dùng `<canvas>` resize xuống max width 1280px).
3. **Race condition khi 2 Saler cùng sửa**: vẫn xảy ra (không có optimistic locking). Mitigation: chấp nhận, vì case hiếm. Nếu cần thêm `@Version()` column → out-of-scope.
4. **Saler sửa booking của Customer khác**: hiện tại Saler được phép sửa bất kỳ booking nào. Cần đảm bảo không lộ dữ liệu nhạy cảm. Booking chỉ chứa thông tin ngày/phòng/tổng tiền → an toàn.
5. **Soft delete + checkout**: nếu booking đã soft delete, Receptionist không thể checkout → đã filter `IsDeleted = 0` trong `findAllForStaff` nên tránh được. Nhưng nếu Receptionist truy cập thẳng `/bookings/admin/:id` qua URL trực tiếp vẫn thấy (vì `findOneForStaff` chưa filter) → cần bổ sung `where: { bookingId, isDeleted: false }` trong `findOneForStaff` (đã đưa vào bước Service).
6. **`ChangeReason` tiếng Việt**: không có rule i18n. Giữ tiếng Việt trong seed cũ, dùng `'Saler cập nhật theo yêu cầu khách'` cho change reason.
7. **Thiếu saler trong admin filter**: hiện `Sidebar` hiển thị "Đặt phòng" cho Saler (đã OK). Nếu Saler không thấy nút → check `user.role === 'Saler'` đã được gán trong JWT (đúng theo `seed.ts` line 50).

## Out of scope (không làm trong sprint này)
- Không tạo `deletedAt`, `deletedBy`, `cancelledBy`, `cancelledAt` cột audit (giữ diff nhỏ; LoggingInterceptor đã có log accountId).
- Không tạo route GET list booking đã soft-delete (`/sale/bookings/deleted`) – không có yêu cầu restore.
- Không thêm cột `PenaltyFee` cho cancel – đề bài nói "tính phí phạt nếu có" nhưng không yêu cầu lưu, có thể tính sau từ `Payments`.
- Không refactor `BookingsController` thành sub-controller theo module.
- Không thêm multer / disk storage upload. Dùng Base64/URL string theo pattern sẵn có.
- Không tạo file test E2E cho toàn bộ luồng – chỉ smoke test 1 file.

## Tóm tắt
- **File mới**: 5 (3 backend DTO/controller + 2 frontend components).
- **File sửa**: 5 (3 backend, 2 frontend, 1 docs).
- **Cột DB mới**: 1 (`Bookings.EvidenceImage`). Cột `BookingVersions.RequestEvidenceImage` đã có sẵn.
- **Không thêm dependency mới**, không thay đổi global config.