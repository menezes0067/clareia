CREATE TABLE clinics (
    id                VARCHAR(64)  PRIMARY KEY,
    name              VARCHAR(80)  NOT NULL,
    address           VARCHAR(255) NOT NULL,
    cnpj              VARCHAR(18)  NOT NULL UNIQUE,
    phone             VARCHAR(20)  NOT NULL,
    email             VARCHAR(160) NOT NULL,
    owner_dentist_id  VARCHAR(64)  NOT NULL UNIQUE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE dentists (
    id                VARCHAR(64)  PRIMARY KEY,
    clinic_id         VARCHAR(64)  NOT NULL REFERENCES clinics(id),
    name              VARCHAR(80)  NOT NULL,
    email             VARCHAR(160) NOT NULL UNIQUE,
    password_hash     VARCHAR(120) NOT NULL,
    phone             VARCHAR(20)  NOT NULL,
    cro               VARCHAR(24)  NOT NULL,
    specialty         VARCHAR(120) NOT NULL,
    role              VARCHAR(16)  NOT NULL CHECK (role IN ('owner', 'dentist')),
    status            VARCHAR(16)  NOT NULL CHECK (status IN ('active', 'inactive')),
    tone              VARCHAR(16)  NOT NULL CHECK (tone IN ('teal', 'sky', 'mint', 'sand', 'rose')),
    bio               VARCHAR(400),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_dentists_clinic_id ON dentists (clinic_id);

CREATE TABLE patients (
    id                VARCHAR(64)  PRIMARY KEY,
    clinic_id         VARCHAR(64)  NOT NULL REFERENCES clinics(id),
    dentist_id        VARCHAR(64)  NOT NULL REFERENCES dentists(id),
    name              VARCHAR(80)  NOT NULL,
    email             VARCHAR(160) NOT NULL,
    phone             VARCHAR(20)  NOT NULL,
    birth_date        DATE         NOT NULL,
    notes             VARCHAR(1200) NOT NULL DEFAULT '',
    status            VARCHAR(16)  NOT NULL CHECK (status IN ('active', 'archived')),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_patients_clinic_email UNIQUE (clinic_id, email)
);

CREATE INDEX idx_patients_clinic_dentist ON patients (clinic_id, dentist_id);

CREATE TABLE appointments (
    id                VARCHAR(64)  PRIMARY KEY,
    clinic_id         VARCHAR(64)  NOT NULL REFERENCES clinics(id),
    dentist_id        VARCHAR(64)  NOT NULL REFERENCES dentists(id),
    patient_id        VARCHAR(64)  NOT NULL REFERENCES patients(id),
    date              DATE         NOT NULL,
    start_time        VARCHAR(5)   NOT NULL,
    duration_minutes  INTEGER      NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 240),
    type              VARCHAR(24)  NOT NULL CHECK (type IN (
                          'evaluation', 'cleaning', 'return', 'root_canal',
                          'orthodontics', 'implant', 'whitening', 'urgency'
                      )),
    status            VARCHAR(16)  NOT NULL CHECK (status IN (
                          'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
                      )),
    notes             VARCHAR(800),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_appointments_clinic_dentist_date ON appointments (clinic_id, dentist_id, date);
CREATE INDEX idx_appointments_clinic_patient_date ON appointments (clinic_id, patient_id, date);
