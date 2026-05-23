CREATE TABLE Customer (
    customer_id        SERIAL PRIMARY KEY,

    first_name         VARCHAR(50) NOT NULL,
    last_name          VARCHAR(50) NOT NULL,

    gender             VARCHAR(10),

    date_of_birth      DATE,

    phone_number       VARCHAR(20) UNIQUE NOT NULL,
    email              VARCHAR(100) UNIQUE,

    nationality        VARCHAR(50),

    identity_number    VARCHAR(30) UNIQUE NOT NULL,

    address            TEXT,

    customer_type      VARCHAR(20) DEFAULT 'NORMAL',

    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Customer (
    first_name,
    last_name,
    gender,
    date_of_birth,
    phone_number,
    email,
    nationality,
    identity_number,
    address,
    customer_type
)
VALUES
(
    'John',
    'Doe',
    'Male',
    '1998-05-12',
    '0901234567',
    'john.doe@gmail.com',
    'American',
    'P123456789',
    'New York, USA',
    'VIP'
),

(
    'Emma',
    'Smith',
    'Female',
    '2001-11-03',
    '0912345678',
    'emma.smith@gmail.com',
    'British',
    'B987654321',
    'London, UK',
    'NORMAL'
),

(
    'Nguyen',
    'Minh Anh',
    'Female',
    '2002-07-19',
    '0988123123',
    'minhanh@gmail.com',
    'Vietnamese',
    '001204567890',
    'Ha Noi, Viet Nam',
    'MEMBER'
),

(
    'Tran',
    'Quoc Bao',
    'Male',
    '1995-09-28',
    '0977666555',
    'quocbao@gmail.com',
    'Vietnamese',
    '001198765432',
    'Da Nang, Viet Nam',
    'VIP'
),

(
    'Sophia',
    'Wilson',
    'Female',
    '1999-01-15',
    '0933444555',
    'sophia.wilson@gmail.com',
    'Canadian',
    'C556677889',
    'Toronto, Canada',
    'NORMAL'
);