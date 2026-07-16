# Auth Module - Sequence Diagrams

Sequence diagrams mô tả luồng dữ liệu (data flow) qua các layer của Auth Module.
Mỗi file là một flow độc lập, có thể render riêng.

| File | Endpoint | Method |
|---|---|---|
| [register.mmd](register.mmd) | `POST /auth/register` | Public |
| [login.mmd](login.mmd) | `POST /auth/login` | Public |
| [refresh.mmd](refresh.mmd) | `POST /auth/refresh` | Public |
| [logout.mmd](logout.mmd) | `POST /auth/logout` | Public |
| [change-password.mmd](change-password.mmd) | `POST /auth/change-password` | Protected by `AuthGuard` |

**Participants chung:**

- `Client` — caller (FE / curl / Postman)
- `AuthController` — HTTP boundary
- `AuthGuard` — JWT verification (chỉ xuất hiện ở change-password)
- `AuthService` — orchestration
- `AccountsService` — dùng trong register
- **Models (TypeORM Repositories):** `AccountModel`, `CustomerModel`, `RefreshTokenModel` đóng vai trò truy xuất/ghi dữ liệu ở tầng application.
- `Security Utils` — bcrypt / crypto / JWT
- **Database (SQL Server):** Tầng cơ sở dữ liệu vật lý nhận câu lệnh SQL thực tế.

Xem thêm [../class.mmd](../class.mmd) cho class diagram tổng quan của module.