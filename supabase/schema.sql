-- ============================================================
-- BookEase — Schema do banco de dados
-- Execute este arquivo no SQL Editor do Supabase Studio
-- ============================================================

-- Extensão necessária para a constraint de exclusão de sobreposição
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- TABELAS
-- ============================================================

-- Empresas cadastradas no sistema
CREATE TABLE IF NOT EXISTS businesses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid REFERENCES auth.users NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_businesses_owner     ON businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug      ON businesses (slug);
CREATE INDEX IF NOT EXISTS idx_services_business    ON services (business_id);
CREATE INDEX IF NOT EXISTS idx_professionals_business ON professionals (business_id);
CREATE INDEX IF NOT EXISTS idx_availability_prof    ON availability (professional_id);
CREATE INDEX IF NOT EXISTS idx_customers_business   ON customers (business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments (business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON appointments (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_prof    ON appointments (professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status  ON appointments (status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability        ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNÇÃO AUXILIAR — retorna os IDs das empresas do usuário logado
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_business_ids()
RETURNS uuid[] LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT ARRAY(SELECT id FROM businesses WHERE owner_id = auth.uid())
$$;

-- ============================================================
-- POLÍTICAS — businesses
-- ============================================================

CREATE POLICY "Dono vê sua empresa"
  ON businesses FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Dono cria sua empresa"
  ON businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Dono edita sua empresa"
  ON businesses FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Dono deleta sua empresa"
  ON businesses FOR DELETE
  USING (owner_id = auth.uid());

-- Acesso público por slug (página de agendamento)
CREATE POLICY "Público lê empresa por slug"
  ON businesses FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- POLÍTICAS — services
-- ============================================================

CREATE POLICY "Dono gerencia serviços"
  ON services FOR ALL
  USING (business_id = ANY(get_user_business_ids()))
  WITH CHECK (business_id = ANY(get_user_business_ids()));

CREATE POLICY "Público lê serviços ativos"
  ON services FOR SELECT
  TO anon
  USING (is_active = true);

-- ============================================================
-- POLÍTICAS — professionals
-- ============================================================

CREATE POLICY "Dono gerencia profissionais"
  ON professionals FOR ALL
  USING (business_id = ANY(get_user_business_ids()))
  WITH CHECK (business_id = ANY(get_user_business_ids()));

CREATE POLICY "Público lê profissionais ativos"
  ON professionals FOR SELECT
  TO anon
  USING (is_active = true);

-- ============================================================
-- POLÍTICAS — professional_services
-- ============================================================

CREATE POLICY "Dono gerencia vínculo profissional-serviço"
  ON professional_services FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM professionals
      WHERE business_id = ANY(get_user_business_ids())
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM professionals
      WHERE business_id = ANY(get_user_business_ids())
    )
  );

CREATE POLICY "Público lê vínculos profissional-serviço"
  ON professional_services FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- POLÍTICAS — availability
-- ============================================================

CREATE POLICY "Dono gerencia disponibilidade"
  ON availability FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM professionals
      WHERE business_id = ANY(get_user_business_ids())
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM professionals
      WHERE business_id = ANY(get_user_business_ids())
    )
  );

CREATE POLICY "Público lê disponibilidade"
  ON availability FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- POLÍTICAS — customers
-- ============================================================

CREATE POLICY "Dono vê clientes da sua empresa"
  ON customers FOR SELECT
  USING (business_id = ANY(get_user_business_ids()));

CREATE POLICY "Dono edita clientes da sua empresa"
  ON customers FOR UPDATE
  USING (business_id = ANY(get_user_business_ids()));

-- Qualquer pessoa pode criar um cliente ao agendar (página pública)
CREATE POLICY "Público cria cliente"
  ON customers FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================
-- POLÍTICAS — appointments
-- ============================================================

CREATE POLICY "Dono vê agendamentos da sua empresa"
  ON appointments FOR SELECT
  USING (business_id = ANY(get_user_business_ids()));

CREATE POLICY "Dono atualiza agendamentos da sua empresa"
  ON appointments FOR UPDATE
  USING (business_id = ANY(get_user_business_ids()));

CREATE POLICY "Dono deleta agendamentos da sua empresa"
  ON appointments FOR DELETE
  USING (business_id = ANY(get_user_business_ids()));

-- Qualquer pessoa pode criar agendamento (página pública)
CREATE POLICY "Público cria agendamento"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

-- Público pode ler horários ocupados (para mostrar slots disponíveis)
CREATE POLICY "Público lê agendamentos para verificar disponibilidade"
  ON appointments FOR SELECT
  TO anon
  USING (status NOT IN ('canceled'));

-- ============================================================
-- TRIGGER — cria registro em businesses ao criar novo usuário
-- (opcional: descomentar se quiser auto-setup no primeiro login)
-- ============================================================

-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   -- O usuário precisará configurar o nome/slug depois
--   RETURN new;
-- END;
-- $$;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
