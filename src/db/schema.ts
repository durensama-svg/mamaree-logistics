import { index, integer, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { SERVICES, STATUSES, ZONES } from "../lib/logistics";

export const deliveryZone = pgEnum("delivery_zone", ZONES);
export const deliveryStatus = pgEnum("delivery_status", STATUSES);
export const deliveryService = pgEnum("delivery_service", SERVICES);

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 20 }).notNull().unique(),
  service: deliveryService("service").notNull(),
  senderName: varchar("sender_name", { length: 80 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  pickupZone: deliveryZone("pickup_zone").notNull(),
  pickupAddress: varchar("pickup_address", { length: 180 }).notNull(),
  dropoffZone: deliveryZone("dropoff_zone").notNull(),
  dropoffAddress: varchar("dropoff_address", { length: 180 }).notNull(),
  parcel: varchar("parcel", { length: 240 }).notNull(),
  estimatedRate: integer("estimated_rate").notNull(),
  status: deliveryStatus("status").notNull().default("requested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("deliveries_created_at_idx").on(table.createdAt)]);

export const deliveryEvents = pgTable("delivery_events", {
  id: serial("id").primaryKey(),
  deliveryId: integer("delivery_id").notNull().references(() => deliveries.id, { onDelete: "cascade" }),
  status: deliveryStatus("status").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("delivery_events_delivery_id_idx").on(table.deliveryId)]);

export const businessEnquiries = pgTable("business_enquiries", {
  id: serial("id").primaryKey(),
  contactName: varchar("contact_name", { length: 80 }).notNull(),
  businessName: varchar("business_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  volume: varchar("volume", { length: 40 }).notNull(),
  message: varchar("message", { length: 600 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("business_enquiries_created_at_idx").on(table.createdAt)]);
