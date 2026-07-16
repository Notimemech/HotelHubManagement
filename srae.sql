USE master;
GO

-- 1. Xóa Database nếu đã tồn tại
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'HotelManagementDB')
BEGIN
    ALTER DATABASE HotelManagementDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HotelManagementDB;
END
GO

-- 2. Tạo mới Database
CREATE DATABASE HotelManagementDB;
GO

USE HotelManagementDB;
GO

-------------------------------------------------------
-- PHẦN 1: TẠO BẢNG (SCHEMA)
-------------------------------------------------------

-- 1. Bảng Role
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL, 
    Description NVARCHAR(255)
);

-- 2. Bảng Account
CREATE TABLE Accounts (
    AccountID INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    IsActive BIT DEFAULT 1
);

-- 3. Bảng trung gian Account_Role
CREATE TABLE AccountRoles (
    AccountID INT FOREIGN KEY REFERENCES Accounts(AccountID),
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID),
    PRIMARY KEY (AccountID, RoleID)
);

-- 4. Thông tin nhân viên
CREATE TABLE StaffInfo (
    StaffID INT PRIMARY KEY IDENTITY(1,1),
    AccountID INT UNIQUE FOREIGN KEY REFERENCES Accounts(AccountID),
    CCCD VARCHAR(20) UNIQUE NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    BirthDate DATE,
    Phone VARCHAR(15),
    Address NVARCHAR(255)
);

-- 5. Tài khoản ngân hàng của khách (Để nhận refund)
CREATE TABLE CustomerBankAccounts (
    BankID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT FOREIGN KEY REFERENCES Accounts(AccountID),
    BankName NVARCHAR(100), 
    AccountNumber VARCHAR(20),
    AccountHolderName NVARCHAR(100),
    IsDefault BIT DEFAULT 0
);

-- 6. Loại phòng
CREATE TABLE RoomTypes (
    TypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(50) NOT NULL,
    PricePerDay DECIMAL(18, 2) NOT NULL,
    Description NVARCHAR(MAX)
);

-- 7. Phòng
CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY IDENTITY(1,1),
    RoomCode VARCHAR(10) UNIQUE NOT NULL,
    TypeID INT FOREIGN KEY REFERENCES RoomTypes(TypeID),
    Floor INT,             -- Tầng
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Available', 'Occupied', 'Maintenance'))
);

-- 8. Booking (Header tổng)
CREATE TABLE Bookings (
    BookingID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT FOREIGN KEY REFERENCES Accounts(AccountID),
    CurrentVersion INT DEFAULT 1,
    TotalPrice DECIMAL(18, 2) DEFAULT 0,
    BookingStatus NVARCHAR(50), -- Pending, Confirmed, Cancelled, Completed
    IsDeleted BIT DEFAULT 0     -- Soft delete cho Sale
);

-- 9. Booking Version (Lưu vết thay đổi)
CREATE TABLE BookingVersions (
    VersionID INT PRIMARY KEY IDENTITY(1,1),
    BookingID INT FOREIGN KEY REFERENCES Bookings(BookingID),
    VersionNumber INT NOT NULL,
    TotalAmountAtThisVersion DECIMAL(18, 2) NOT NULL,
    StaffInCharge INT FOREIGN KEY REFERENCES StaffInfo(StaffID),
    ChangeReason NVARCHAR(MAX),
    RequestEvidenceImage NVARCHAR(MAX), -- Bằng chứng yêu cầu thay đổi (Ảnh chụp tin nhắn/yêu cầu)
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 10. Booking Details
CREATE TABLE BookingDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    VersionID INT FOREIGN KEY REFERENCES BookingVersions(VersionID),
    RoomTypeID INT FOREIGN KEY REFERENCES RoomTypes(TypeID),
    Quantity INT NOT NULL,
    FromDate DATETIME NOT NULL,
    ToDate DATETIME NOT NULL,
    PriceAtBooking DECIMAL(18,2)
);

-- 11. Payments (Giao dịch tài chính)
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    VersionID INT FOREIGN KEY REFERENCES BookingVersions(VersionID),
    BookingID INT FOREIGN KEY REFERENCES Bookings(BookingID),
    Amount DECIMAL(18, 2) NOT NULL,             -- Số âm nếu là Refund
    PaymentType NVARCHAR(50),                   -- VNPay, Cash, Transfer, Refund
    ExternalTransactionID VARCHAR(100),         -- Mã GD từ VNPay/Ngân hàng
    PaymentStatus NVARCHAR(50) DEFAULT 'Success', -- Pending, Success, Refunded, Failed
    RefundBankID INT FOREIGN KEY REFERENCES CustomerBankAccounts(BankID), -- Ngân hàng nhận tiền hoàn
    EvidenceImage NVARCHAR(MAX),                -- Ảnh bill thủ công
    Note NVARCHAR(MAX),
    PaymentDate DATETIME DEFAULT GETDATE(),
    StaffID INT FOREIGN KEY REFERENCES StaffInfo(StaffID) -- Người xác nhận (nếu làm thủ công)
);

-- 12. Checklist Template
CREATE TABLE ChecklistTemplates (
    TemplateID INT PRIMARY KEY IDENTITY(1,1),
    TemplateType NVARCHAR(50), 
    ItemName NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX)
);

-- 13. Checklist Log
CREATE TABLE ChecklistLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    RoomID INT FOREIGN KEY REFERENCES Rooms(RoomID),
    StaffID INT FOREIGN KEY REFERENCES StaffInfo(StaffID),
    TemplateType NVARCHAR(50), 
    LogTime DATETIME DEFAULT GETDATE(),
    EvidenceImage NVARCHAR(MAX),
    Notes NVARCHAR(MAX)
);

-- 14. Report Issue
CREATE TABLE IssueReports (
    IssueID INT PRIMARY KEY IDENTITY(1,1),
    RoomID INT FOREIGN KEY REFERENCES Rooms(RoomID),
    ReporterID INT FOREIGN KEY REFERENCES StaffInfo(StaffID),
    Description NVARCHAR(MAX),
    IssueImage NVARCHAR(MAX),
    Status NVARCHAR(50) DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 15. Maintain Prove
CREATE TABLE MaintenanceProves (
    ProveID INT PRIMARY KEY IDENTITY(1,1),
    IssueID INT FOREIGN KEY REFERENCES IssueReports(IssueID),
    MaintainerID INT FOREIGN KEY REFERENCES StaffInfo(StaffID),
    FinishImage NVARCHAR(MAX),
    FinishVideo NVARCHAR(MAX),
    ResolvedAt DATETIME DEFAULT GETDATE()
);
GO

-------------------------------------------------------
-- PHẦN 2: DỮ LIỆU MẪU (SỬA LẠI ID CHO CHÍNH XÁC)
-------------------------------------------------------

-- 1. Roles & Accounts
INSERT INTO Roles (RoleName) VALUES ('Manager'), ('Saler'), ('Receptionist'), ('Cleaner'), ('Maintainer'), ('User');
INSERT INTO Accounts (Username, Password) VALUES ('admin','123'), ('sale1','123'), ('recep1','123'), ('clean1','123'), ('maint1','123'), ('cus1','123');
INSERT INTO AccountRoles (AccountID, RoleID) VALUES (1,1), (2,2), (3,3), (4,4), (5,5), (6,6);

-- 2. StaffInfo (ID sẽ tự tăng 1, 2, 3, 4)
INSERT INTO StaffInfo (AccountID, CCCD, FullName, Phone) VALUES 
(2, '222', N'Trần Sale', '092'),   -- StaffID: 1
(3, '333', N'Lê Lễ Tân', '093'),  -- StaffID: 2
(4, '444', N'Phạm Dọn', '094'),   -- StaffID: 3
(5, '555', N'Hoàng Thợ', '095');  -- StaffID: 4

-- 3. Customer Bank
INSERT INTO CustomerBankAccounts (CustomerID, BankName, AccountNumber, AccountHolderName) 
VALUES (6, 'Vietcombank', '001100123456', 'NGUYEN KHACH HANG');

-- 4. RoomTypes & Rooms
INSERT INTO RoomTypes (TypeName, PricePerDay) VALUES (N'Single', 500000), (N'VIP', 1500000);
INSERT INTO Rooms (RoomCode, TypeID, Floor, Status) VALUES 
('101', 1, 1, 'Available'), 
('302', 2, 3, 'Maintenance'), 
('202', 1, 2, 'Occupied');

-- 5. KỊCH BẢN BOOKING
INSERT INTO Bookings (CustomerID, CurrentVersion, TotalPrice, BookingStatus) VALUES (6, 1, 500000, 'Confirmed');

-- Lấy StaffID của Trần Sale (StaffID = 1)
DECLARE @SaleID INT = (SELECT StaffID FROM StaffInfo WHERE FullName = N'Trần Sale');

INSERT INTO BookingVersions (BookingID, VersionNumber, TotalAmountAtThisVersion, StaffInCharge, ChangeReason) 
VALUES (1, 1, 500000, @SaleID, N'Đặt phòng qua App');

DECLARE @V1 INT = (SELECT VersionID FROM BookingVersions WHERE BookingID = 1 AND VersionNumber = 1);
INSERT INTO BookingDetails (VersionID, RoomTypeID, Quantity, FromDate, ToDate, PriceAtBooking) VALUES (@V1, 1, 1, '2024-06-20', '2024-06-21', 500000);
INSERT INTO Payments (VersionID, BookingID, Amount, PaymentType, ExternalTransactionID, PaymentStatus) 
VALUES (@V1, 1, 500000, 'VNPay', 'VNP123456789', 'Success');

-- Version 2: Update
UPDATE Bookings SET CurrentVersion = 2, TotalPrice = 1500000 WHERE BookingID = 1;
INSERT INTO BookingVersions (BookingID, VersionNumber, TotalAmountAtThisVersion, StaffInCharge, ChangeReason, RequestEvidenceImage) 
VALUES (1, 2, 1500000, @SaleID, N'Khách đổi sang phòng VIP', 'zalo_chat_evidence.jpg');

DECLARE @V2 INT = (SELECT VersionID FROM BookingVersions WHERE BookingID = 1 AND VersionNumber = 2);
INSERT INTO BookingDetails (VersionID, RoomTypeID, Quantity, FromDate, ToDate, PriceAtBooking) VALUES (@V2, 2, 1, '2024-06-20', '2024-06-21', 1500000);
INSERT INTO Payments (VersionID, BookingID, Amount, PaymentType, Note) 
VALUES (@V2, 1, 1000000, 'Cash', N'Thu thêm chênh lệch nâng cấp phòng');

-- 6. Checklist & Issue (Sửa lại ID nhân viên)
INSERT INTO ChecklistTemplates (TemplateType, ItemName) VALUES ('Checkin', N'Kiểm tra vòi nước'), ('Checkout', N'Kiểm tra mini bar');

-- Lấy ID của nhân viên dọn dẹp và thợ bảo trì
DECLARE @CleanerID INT = (SELECT StaffID FROM StaffInfo WHERE FullName = N'Phạm Dọn');
DECLARE @MaintID INT = (SELECT StaffID FROM StaffInfo WHERE FullName = N'Hoàng Thợ');

INSERT INTO ChecklistLogs (RoomID, StaffID, TemplateType, EvidenceImage) 
VALUES ((SELECT RoomID FROM Rooms WHERE RoomCode = '202'), @CleanerID, 'CleaningStandard', 'clean_ok.jpg');

INSERT INTO IssueReports (RoomID, ReporterID, Description, Status) 
VALUES ((SELECT RoomID FROM Rooms WHERE RoomCode = '302'), @CleanerID, N'Hỏng điều hòa', 'Pending');

-- FIX LỖI TẠI ĐÂY: Dùng @MaintID thay vì số 5
INSERT INTO MaintenanceProves (IssueID, MaintainerID, FinishImage) 
VALUES ((SELECT TOP 1 IssueID FROM IssueReports ORDER BY IssueID DESC), @MaintID, 'fixed_ac.jpg');

GO