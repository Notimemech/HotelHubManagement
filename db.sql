CREATE DATABASE HotelHubManagement;
GO

USE HotelHubManagement;
GO

CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE,
    Phone VARCHAR(20) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Avatar NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE RoomTypes (
    RoomTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(18,2) NOT NULL,
    MaxGuests INT NOT NULL
);

CREATE TABLE Rooms (
    RoomId INT IDENTITY(1,1) PRIMARY KEY,
    RoomNumber VARCHAR(20) UNIQUE NOT NULL,
    RoomTypeId INT NOT NULL,
    Floor INT,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Available', 'Occupied', 'Maintenance')),
    FOREIGN KEY (RoomTypeId) REFERENCES RoomTypes(RoomTypeId)
);

CREATE TABLE Bookings (
    BookingId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    BookingDate DATETIME DEFAULT GETDATE(),
    CheckIn DATE NOT NULL,
    CheckOut DATE NOT NULL,
    Adults INT NOT NULL,
    Children INT NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    SpecialRequest NVARCHAR(MAX),
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);

CREATE TABLE BookingDetails (
    BookingDetailId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL,
    RoomId INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Nights INT NOT NULL,
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId)
);

CREATE TABLE Payments (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Method VARCHAR(20) NOT NULL CHECK (Method IN ('Cash', 'Visa', 'Momo', 'VNPay')),
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Paid', 'Failed')),
    PaidAt DATETIME,
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)
);

CREATE TABLE Services (
    ServiceId INT IDENTITY(1,1) PRIMARY KEY,
    ServiceName NVARCHAR(100) NOT NULL,
    Price DECIMAL(18,2) NOT NULL
);

CREATE TABLE BookingServices (
    BookingServiceId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL,
    ServiceId INT NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);