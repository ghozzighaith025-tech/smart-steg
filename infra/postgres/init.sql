-- GridDNA AI — Database Initialization
-- PostgreSQL 16 + TimescaleDB

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- ============================================================
-- CORE ENTITIES
-- ============================================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'operator', 'technician', 'viewer');
CREATE TYPE asset_type AS ENUM ('transformer', 'motor', 'panel', 'meter', 'hvac', 'generator', 'other');
CREATE TYPE device_status AS ENUM ('online', 'offline', 'maintenance', 'error');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE site_type AS ENUM ('factory', 'building', 'utility', 'hotel', 'hospital', 'other');

CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    plan        VARCHAR(50) NOT NULL DEFAULT 'starter',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    role            user_role NOT NULL DEFAULT 'viewer',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sites (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    type        site_type NOT NULL DEFAULT 'factory',
    address     TEXT,
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    timezone    VARCHAR(50) DEFAULT 'Africa/Tunis',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    type            asset_type NOT NULL DEFAULT 'other',
    manufacturer    VARCHAR(255),
    model           VARCHAR(255),
    serial_number   VARCHAR(255),
    install_date    DATE,
    rated_power_kw  DOUBLE PRECISION,
    metadata        JSONB DEFAULT '{}',
    health_score    DOUBLE PRECISION DEFAULT 100.0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    serial          VARCHAR(100) NOT NULL UNIQUE,
    firmware_version VARCHAR(50),
    hardware_version VARCHAR(50) DEFAULT 'G1',
    status          device_status NOT NULL DEFAULT 'offline',
    last_seen_at    TIMESTAMPTZ,
    mqtt_topic      VARCHAR(255),
    config          JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TIME-SERIES TELEMETRY (TimescaleDB Hypertable)
-- ============================================================

CREATE TABLE telemetry (
    time            TIMESTAMPTZ NOT NULL,
    device_id       UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    voltage         DOUBLE PRECISION,
    current         DOUBLE PRECISION,
    power           DOUBLE PRECISION,
    energy          DOUBLE PRECISION,
    frequency       DOUBLE PRECISION,
    power_factor    DOUBLE PRECISION,
    temperature     DOUBLE PRECISION,
    humidity        DOUBLE PRECISION,
    vibration_rms   DOUBLE PRECISION,
    raw_payload     JSONB
);

SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE);

CREATE INDEX idx_telemetry_device_time ON telemetry (device_id, time DESC);

-- ============================================================
-- ALERTS & AI PREDICTIONS
-- ============================================================

CREATE TABLE alerts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    device_id           UUID REFERENCES devices(id) ON DELETE SET NULL,
    severity            alert_severity NOT NULL DEFAULT 'warning',
    type                VARCHAR(100) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    message             TEXT,
    anomaly_score       DOUBLE PRECISION,
    shap_explanation    JSONB,
    acknowledged        BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by     UUID REFERENCES users(id),
    acknowledged_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE predictions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    model_version   VARCHAR(50) NOT NULL,
    rul_days        DOUBLE PRECISION,
    failure_prob    DOUBLE PRECISION,
    health_trend    VARCHAR(50),
    features        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE maintenance_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    assigned_to     UUID REFERENCES users(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    priority        INTEGER NOT NULL DEFAULT 2,
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    due_date        TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_sites_org ON sites(org_id);
CREATE INDEX idx_assets_site ON assets(site_id);
CREATE INDEX idx_devices_asset ON devices(asset_id);
CREATE INDEX idx_alerts_asset ON alerts(asset_id, created_at DESC);
CREATE INDEX idx_predictions_asset ON predictions(asset_id, created_at DESC);

-- ============================================================
-- SEED DATA (Demo Organization)
-- ============================================================

INSERT INTO organizations (id, name, slug, plan)
VALUES ('a0000000-0000-0000-0000-000000000001', 'GridDNA Demo Corp', 'griddna-demo', 'professional');

-- Password: GridDNA2026! (bcrypt hash generated at runtime by backend seed)
-- Placeholder hash for admin@griddna.ai — backend seed script will upsert
INSERT INTO users (id, org_id, email, password_hash, first_name, last_name, role)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'admin@griddna.ai',
    '$2b$10$rQZ8K8K8K8K8K8K8K8K8Ku8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    'Admin',
    'GridDNA',
    'owner'
);

INSERT INTO sites (id, org_id, name, type, address, latitude, longitude)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Tunis Industrial Plant',
    'factory',
    'Zone Industrielle, Tunis, Tunisia',
    36.8065,
    10.1815
);

INSERT INTO assets (id, site_id, name, type, manufacturer, rated_power_kw, health_score)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Main Distribution Panel', 'panel', 'Schneider Electric', 500, 92.5),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Compressor Motor M1', 'motor', 'ABB', 75, 78.3),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'HVAC Unit A', 'hvac', 'Daikin', 30, 95.0);

INSERT INTO devices (id, asset_id, serial, firmware_version, status, mqtt_topic)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'G1-001-DEMO', '0.1.0', 'offline', 'griddna/demo/G1-001-DEMO/telemetry'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'G1-002-DEMO', '0.1.0', 'offline', 'griddna/demo/G1-002-DEMO/telemetry');

-- Retention policy: 90 days raw telemetry
SELECT add_retention_policy('telemetry', INTERVAL '90 days', if_not_exists => TRUE);
