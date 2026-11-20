import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __mamareePool?: Pool;
  __mamareeSchema?: Promise<void>;
};

function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function databaseConfigured() {
  return databaseUrl() !== "";
}

// The pool is created lazily so `next build` works before a database is connected.
export const pool =
  globalForDb.__mamareePool ??
  new Pool({ connectionString: databaseUrl() || undefined, max: 4, connectionTimeoutMillis: 8000 });
globalForDb.__mamareePool = pool;

export const db = drizzle(pool);

const SCHEMA_SQL = `
DO $$ BEGIN CREATE TYPE delivery_zone AS ENUM ('asaba', 'okpanam'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE delivery_status AS ENUM ('requested', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE delivery_service AS ENUM ('same-day', 'business', 'errands'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS deliveries (
  id serial PRIMARY KEY,
  reference varchar(20) NOT NULL UNIQUE,
  service delivery_service NOT NULL,
  sender_name varchar(80) NOT NULL,
  phone varchar(24) NOT NULL,
  pickup_zone delivery_zone NOT NULL,
  pickup_address varchar(180) NOT NULL,
  dropoff_zone delivery_zone NOT NULL,
  dropoff_address varchar(180) NOT NULL,
  parcel varchar(240) NOT NULL,
  estimated_rate integer NOT NULL,
  status delivery_status NOT NULL DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deliveries_created_at_idx ON deliveries (created_at);
CREATE TABLE IF NOT EXISTS delivery_events (
  id serial PRIMARY KEY,
  delivery_id integer NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status delivery_status NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS delivery_events_delivery_id_idx ON delivery_events (delivery_id);
CREATE TABLE IF NOT EXISTS business_enquiries (
  id serial PRIMARY KEY,
  contact_name varchar(80) NOT NULL,
  business_name varchar(100) NOT NULL,
  phone varchar(24) NOT NULL,
  volume varchar(40) NOT NULL,
  message varchar(600) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS business_enquiries_created_at_idx ON business_enquiries (created_at);
`;

/** Creates the tables on first use (idempotent), so no separate migration step is needed. */
export function ensureSchema(): Promise<void> {
  if (!databaseConfigured()) return Promise.reject(new Error("DATABASE_URL is not set"));
  if (!globalForDb.__mamareeSchema) {
    globalForDb.__mamareeSchema = pool.query(SCHEMA_SQL).then(
      () => undefined,
      async () => {
        // A concurrent first request can race on CREATE; one retry settles it.
        await pool.query(SCHEMA_SQL);
      },
    );
    globalForDb.__mamareeSchema.catch(() => { globalForDb.__mamareeSchema = undefined; });
  }
  return globalForDb.__mamareeSchema;
}
