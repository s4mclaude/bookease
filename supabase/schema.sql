-- ============================================================
-- BookEase — Schema do banco de dados (Neon PostgreSQL)
-- Execute este arquivo no SQL Editor do Neon Console
-- neon.tech → seu projeto → SQL Editor
-- ============================================================

-- Extensão necessária para a constraint de exclusão de sobreposição
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- TABELAS
-- ============================================================

-- Donos de empresas (gerenciado pelo Auth.js)
CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,
  password    text NOT NULL,
  name        text,
  created_at  timestamptz DEFAULT now()
);

-- Empresas cadastradas no sistema
CREATE TABLE IF NOT EXISTS businesses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid REFERENCES users ON DELETE CASCADE NOT NULL,
  name         text NOT NULL,
  slug         text UNIQUE NOT NULL,
  type         text CHECK (type IN ('clinic', 'barbershop', 'salon')),
  phone        text,
  email        text,
  address      text,
  logo_url     text,
  created_at   timestamptz DEFAULT now()
);

-- Serviços oferecidos pela empresa
CREATE TABLE IF NOT EXISTS services (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  name              text NOT NULL,
  description       text,
  price             numeric(10, 2),
  duration_minutes  int NOT NULL CHECK (duration_minutes > 0),
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- Profissionais da empresa
CREATE TABLE IF NOT EXISTS professionals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  name         text NOT NULL,
  role         text,
  photo_url    text,
  is_active    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

-- Relação N:N — quais serviços cada profissional realiza
CREATE TABLE IF NOT EXISTS professional_services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  uuid REFERENCES professionals ON DELETE CASCADE NOT NULL,
  service_id       uuid REFERENCES services ON DELETE CASCADE NOT NULL,
  UNIQUE (professional_id, service_id)
);

-- Disponibilidade semanal de cada profissional
-- day_of_week: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
CREATE TABLE IF NOT EXISTS availability (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  uuid REFERENCES professionals ON DELETE CASCADE NOT NULL,
  day_of_week      int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  is_available     boolean DEFAULT true,
  CHECK (end_time > start_time)
);

-- Clientes que fizeram agendamentos (sem conta no sistema)
CREATE TABLE IF NOT EXISTS customers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  name         text NOT NULL,
  whatsapp     text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  customer_id      uuid REFERENCES customers ON DELETE CASCADE NOT NULL,
  professional_id  uuid REFERENCES professionals ON DELETE CASCADE NOT NULL,
  service_id       uuid REFERENCES services ON DELETE CASCADE NOT NULL,
  scheduled_date   date NOT NULL,
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
  notes            text,
  created_at       timestamptz DEFAULT now(),
  CHECK (end_time > start_time),

  -- Impede dois agendamentos sobrepostos para o mesmo profissional no mesmo dia
  CONSTRAINT no_overlap EXCLUDE USING gist (
    professional_id WITH =,
    tsrange(
      (scheduled_date + start_time)::timestamp,
      (scheduled_date + end_time)::timestamp,
      '[)'
    ) WITH &&
  )
);

-- ============================================================
-- ÍNDICES (performance nas consultas mais comuns)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email             ON users (email);
CREATE INDEX IF NOT EXISTS idx_businesses_owner        ON businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug         ON businesses (slug);
CREATE INDEX IF NOT EXISTS idx_services_business       ON services (business_id);
CREATE INDEX IF NOT EXISTS idx_professionals_business  ON professionals (business_id);
CREATE INDEX IF NOT EXISTS idx_availability_prof       ON availability (professional_id);
CREATE INDEX IF NOT EXISTS idx_customers_business      ON customers (business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business   ON appointments (business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date       ON appointments (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_prof       ON appointments (professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status     ON appointments (status);
