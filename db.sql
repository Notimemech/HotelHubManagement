IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HotelHubManagement')
BEGIN
    CREATE DATABASE HotelHubManagement;
END
GO

-- ============================================================================
-- HotelHubManagement - Canonical Database Schema
-- ============================================================================
-- Source of truth for the DEPLOYED PostgreSQL schema.
-- Aligned with srae.sql at the repository root.
-- Mirrors backend/src/modules/**/entities/*.entity.ts (TypeORM).
--
-- Naming convention:
--   - PascalCase identifiers throughout (XxxId, XxxName, XxxDate).
--   - Plural table names (Customers, Rooms, Bookings, ...).
--   - FK columns named after the referenced PK (CustomerId, TypeID, VersionId).
--
-- Bounded contexts represented:
--   1. Identity            : Accounts, Roles, AccountRoles
--   2. Customer Management : Customers, CustomerBankAccounts
--   3. Staff               : StaffInfo
--   4. Room Catalogue      : RoomTypes, Rooms
--   5. Booking Lifecycle   : Bookings, BookingVersions, BookingDetails
--   6. Payment Settlement  : Payments
--   7. Ancillary Services  : Services, BookingServices
--   8. Housekeeping        : ChecklistTemplates, ChecklistLogs
--   9. Maintenance         : IssueReports, MaintenanceProves
-- ============================================================================

USE HotelHubManagement;
GO

-- ----------------------------------------------------------------------------
-- 1. Identity
-- ----------------------------------------------------------------------------
CREATE TABLE Accounts (
    AccountId   INT IDENTITY(1,1) PRIMARY KEY,
    Username    VARCHAR(50) UNIQUE NOT NULL,
    Password    VARCHAR(255)      NOT NULL,
    IsActive    BIT DEFAULT 1,
    CreatedAt   DATETIME DEFAULT GETDATE()
);

CREATE TABLE Roles (
    RoleId      INT IDENTITY(1,1) PRIMARY KEY,
    RoleName    NVARCHAR(50)  NOT NULL,   -- User | Manager | Saler | Receptionist | Cleaner | Maintainer
    Description NVARCHAR(255)
);

CREATE TABLE AccountRoles (
    AccountId   INT NOT NULL,
    RoleId      INT NOT NULL,
    PRIMARY KEY (AccountId, RoleId),
    FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId),
    FOREIGN KEY (RoleId)    REFERENCES Roles(RoleId)
);

-- ----------------------------------------------------------------------------
-- 2. Customer Management
-- ----------------------------------------------------------------------------
CREATE TABLE Customers (
    CustomerId  INT IDENTITY(1,1) PRIMARY KEY,
    AccountId   INT UNIQUE NOT NULL,
    FullName    NVARCHAR(100) NOT NULL,
    Email       NVARCHAR(100) UNIQUE,
    Phone       VARCHAR(20)   UNIQUE,
    Avatar      NVARCHAR(255),
    CreatedAt   DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId)
);

CREATE TABLE CustomerBankAccounts (
    BankId             INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId         INT NOT NULL,
    BankName           NVARCHAR(100),
    AccountNumber      VARCHAR(20),
    AccountHolderName  NVARCHAR(100),
    IsDefault          BIT DEFAULT 0,
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);

-- ----------------------------------------------------------------------------
-- 3. Staff
-- ----------------------------------------------------------------------------
CREATE TABLE StaffInfo (
    StaffId     INT IDENTITY(1,1) PRIMARY KEY,
    AccountId   INT UNIQUE NOT NULL,
    CCCD        VARCHAR(20) UNIQUE NOT NULL,
    FullName    NVARCHAR(100) NOT NULL,
    BirthDate   DATE,
    Phone       VARCHAR(15),
    Address     NVARCHAR(255),
    FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId)
);

-- ----------------------------------------------------------------------------
-- 4. Room Catalogue
-- ----------------------------------------------------------------------------
CREATE TABLE RoomTypes (
    TypeID      INT IDENTITY(1,1) PRIMARY KEY,
    TypeName    NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX),
    Price       DECIMAL(18,2) NOT NULL,
    MaxGuests   INT NOT NULL
);

CREATE TABLE Rooms (
    RoomID      INT IDENTITY(1,1) PRIMARY KEY,
    RoomCode    VARCHAR(10) UNIQUE NOT NULL,
    TypeID      INT NOT NULL,
    Floor       INT,
    Status      VARCHAR(20) NOT NULL
                  CHECK (Status IN ('Available', 'Occupied', 'Maintenance')),
    FOREIGN KEY (TypeID) REFERENCES RoomTypes(TypeID)
);

-- ----------------------------------------------------------------------------
-- 5. Booking Lifecycle
-- ----------------------------------------------------------------------------
CREATE TABLE Bookings (
    BookingId      INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId     INT NOT NULL,
    CurrentVersion INT DEFAULT 1,
    TotalPrice     DECIMAL(18,2) DEFAULT 0,
    Status         VARCHAR(20) NOT NULL
                     CHECK (Status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    IsDeleted      BIT DEFAULT 0,
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);

CREATE TABLE BookingVersions (
    VersionId               INT IDENTITY(1,1) PRIMARY KEY,
    BookingId               INT NOT NULL,
    VersionNumber           INT NOT NULL,
    TotalAmountAtThisVersion DECIMAL(18,2) NOT NULL,
    StaffInCharge           INT,
    ChangeReason            NVARCHAR(MAX),
    RequestEvidenceImage    NVARCHAR(MAX),
    CreatedAt               DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BookingId)     REFERENCES Bookings(BookingId),
    FOREIGN KEY (StaffInCharge) REFERENCES StaffInfo(StaffId)
);

CREATE TABLE BookingDetails (
    BookingDetailId INT IDENTITY(1,1) PRIMARY KEY,
    VersionId       INT NOT NULL,
    RoomID          INT NOT NULL,
    Price           DECIMAL(18,2) NOT NULL,
    Nights          INT NOT NULL,
    FOREIGN KEY (VersionId) REFERENCES BookingVersions(VersionId),
    FOREIGN KEY (RoomID)    REFERENCES Rooms(RoomID)
);

-- ----------------------------------------------------------------------------
-- 6. Payment Settlement
-- ----------------------------------------------------------------------------
CREATE TABLE Payments (
    PaymentId             INT IDENTITY(1,1) PRIMARY KEY,
    VersionId             INT NOT NULL,
    BookingId             INT NOT NULL,
    Amount                DECIMAL(18,2) NOT NULL,             -- negative => refund
    Method                VARCHAR(20) NOT NULL
                            CHECK (Method IN ('Cash', 'Visa', 'Momo', 'VNPay')),
    Status                VARCHAR(20) NOT NULL DEFAULT 'Pending'
                            CHECK (Status IN ('Pending', 'Paid', 'Failed')),
    ExternalTransactionID VARCHAR(100),
    PaidAt                DATETIME,
    FOREIGN KEY (VersionId) REFERENCES BookingVersions(VersionId),
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)
);

-- ----------------------------------------------------------------------------
-- 7. Ancillary Services
-- ----------------------------------------------------------------------------
CREATE TABLE Services (
    ServiceId   INT IDENTITY(1,1) PRIMARY KEY,
    ServiceName NVARCHAR(100) NOT NULL,
    Price       DECIMAL(18,2) NOT NULL
);

CREATE TABLE BookingServices (
    BookingServiceId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId        INT NOT NULL,
    ServiceId        INT NOT NULL,
    Quantity         INT NOT NULL,
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);

-- ----------------------------------------------------------------------------
-- 8. Housekeeping
-- ----------------------------------------------------------------------------
CREATE TABLE ChecklistTemplates (
    TemplateId   INT IDENTITY(1,1) PRIMARY KEY,
    TemplateType NVARCHAR(50),
    ItemName     NVARCHAR(255) NOT NULL,
    Description  NVARCHAR(MAX)
);

CREATE TABLE ChecklistLogs (
    LogId         INT IDENTITY(1,1) PRIMARY KEY,
    RoomID        INT NOT NULL,
    StaffId       INT NOT NULL,
    TemplateType  NVARCHAR(50),
    LogTime       DATETIME DEFAULT GETDATE(),
    EvidenceImage NVARCHAR(MAX),
    Notes         NVARCHAR(MAX),
    FOREIGN KEY (RoomID)  REFERENCES Rooms(RoomID),
    FOREIGN KEY (StaffId) REFERENCES StaffInfo(StaffId)
);

-- ----------------------------------------------------------------------------
-- 9. Maintenance
-- ----------------------------------------------------------------------------
CREATE TABLE IssueReports (
    IssueId     INT IDENTITY(1,1) PRIMARY KEY,
    RoomID      INT NOT NULL,
    ReporterId  INT NOT NULL,
    Description NVARCHAR(MAX),
    IssueImage  NVARCHAR(MAX),
    Status      NVARCHAR(50) DEFAULT 'Pending',
    CreatedAt   DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RoomID)     REFERENCES Rooms(RoomID),
    FOREIGN KEY (ReporterId) REFERENCES StaffInfo(StaffId)
);

CREATE TABLE MaintenanceProves (
    ProveId      INT IDENTITY(1,1) PRIMARY KEY,
    IssueId      INT NOT NULL,
    MaintainerId INT NOT NULL,
    FinishImage  NVARCHAR(MAX),
    FinishVideo  NVARCHAR(MAX),
    ResolvedAt   DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IssueId)      REFERENCES IssueReports(IssueId),
    FOREIGN KEY (MaintainerId) REFERENCES StaffInfo(StaffId)
);
GO

-- ============================================================================
-- Seed data (mirrors srae.sql sample)
-- ============================================================================
INSERT INTO Roles (RoleName) VALUES
    ('User'), ('Manager'), ('Saler'), ('Receptionist'), ('Cleaner'), ('Maintainer');

INSERT INTO Accounts (Username, Password) VALUES
    ('admin','123'), ('sale1','123'), ('recep1','123'),
    ('clean1','123'), ('maint1','123'), ('cus1','123');

INSERT INTO AccountRoles (AccountId, RoleId)
    SELECT AccountId, 2 FROM Accounts WHERE Username = 'admin'
    UNION ALL SELECT AccountId, 3 FROM Accounts WHERE Username = 'sale1'
    UNION ALL SELECT AccountId, 4 FROM Accounts WHERE Username = 'recep1'
    UNION ALL SELECT AccountId, 5 FROM Accounts WHERE Username = 'clean1'
    UNION ALL SELECT AccountId, 6 FROM Accounts WHERE Username = 'maint1'
    UNION ALL SELECT AccountId, 1 FROM Accounts WHERE Username = 'cus1';

INSERT INTO Customers (AccountId, FullName, Phone)
    SELECT AccountId, N'Nguyễn Khách Hàng', '0900000006' FROM Accounts WHERE Username = 'cus1';

INSERT INTO StaffInfo (AccountId, CCCD, FullName, Phone)
    SELECT AccountId, '222', N'Trần Sale',    '092' FROM Accounts WHERE Username = 'sale1'
    UNION ALL SELECT AccountId, '333', N'Lê Lễ Tân', '093' FROM Accounts WHERE Username = 'recep1'
    UNION ALL SELECT AccountId, '444', N'Phạm Dọn', '094' FROM Accounts WHERE Username = 'clean1'
    UNION ALL SELECT AccountId, '555', N'Hoàng Thợ', '095' FROM Accounts WHERE Username = 'maint1';

INSERT INTO CustomerBankAccounts (CustomerId, BankName, AccountNumber, AccountHolderName)
    SELECT CustomerId, 'Vietcombank', '001100123456', N'NGUYEN KHACH HANG' FROM Customers;

INSERT INTO RoomTypes (TypeName, Price, MaxGuests) VALUES (N'Single', 500000, 2), (N'VIP', 1500000, 4);

INSERT INTO Rooms (RoomCode, TypeID, Floor, Status) VALUES
    ('101', 1, 1, 'Available'),
    ('202', 1, 2, 'Occupied'),
    ('302', 2, 3, 'Maintenance');

INSERT INTO Bookings (CustomerId, CurrentVersion, TotalPrice, Status)
    SELECT CustomerId, 1, 500000, 'Confirmed' FROM Customers;

INSERT INTO BookingVersions (BookingId, VersionNumber, TotalAmountAtThisVersion, StaffInCharge, ChangeReason)
    SELECT TOP 1 BookingId, 1, 500000,
           (SELECT StaffId FROM StaffInfo WHERE FullName = N'Trần Sale'),
           N'Đặt phòng qua App'
    FROM Bookings;

DECLARE @V1 INT = (SELECT TOP 1 VersionId FROM BookingVersions ORDER BY VersionId DESC);
INSERT INTO BookingDetails (VersionId, RoomID, Price, Nights)
    SELECT @V1, RoomID, 500000, 1 FROM Rooms WHERE RoomCode = '101';

INSERT INTO Payments (VersionId, BookingId, Amount, Method, Status, ExternalTransactionID)
    SELECT @V1, BookingId, 500000, 'VNPay', 'Paid', 'VNP123456789' FROM Bookings;

INSERT INTO ChecklistTemplates (TemplateType, ItemName) VALUES
    ('Checkin',  N'Kiểm tra vòi nước'),
    ('Checkout', N'Kiểm tra mini bar');

INSERT INTO ChecklistLogs (RoomID, StaffId, TemplateType, EvidenceImage)
    SELECT r.RoomID, s.StaffId, 'CleaningStandard', 'clean_ok.jpg'
    FROM Rooms r, StaffInfo s WHERE r.RoomCode = '202' AND s.FullName = N'Phạm Dọn';

INSERT INTO IssueReports (RoomID, ReporterId, Description, Status)
    SELECT r.RoomID, s.StaffId, N'Hỏng điều hòa', 'Pending'
    FROM Rooms r, StaffInfo s WHERE r.RoomCode = '302' AND s.FullName = N'Phạm Dọn';

INSERT INTO MaintenanceProves (IssueId, MaintainerId, FinishImage)
    SELECT TOP 1 i.IssueId, s.StaffId, 'fixed_ac.jpg'
    FROM IssueReports i, StaffInfo s WHERE s.FullName = N'Hoàng Thợ'
    ORDER BY i.IssueId DESC;
GO