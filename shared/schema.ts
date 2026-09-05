import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products Table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(10),
  maxStock: integer("max_stock").notNull().default(100),
  supplier: text("supplier").notNull().default("Global Logistics Co."),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  description: text("description"),
  status: text("status").notNull().default("active"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  name: text("name").notNull().default("Admin User"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Orders Table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  itemsCount: integer("items_count").notNull().default(1),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  region: text("region").notNull().default("North America"), // North America, Europe, Asia Pacific, Latin America, EMEA
  paymentMethod: text("payment_method").notNull().default("Credit Card"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Suppliers Table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("4.8"),
  leadTimeDays: integer("lead_time_days").notNull().default(5),
  status: text("status").notNull().default("Active"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Automation Tasks Table
export const automationTasks = pgTable("automation_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // file_organizer, email_alert, inventory_sync, report_generator
  schedule: text("schedule").notNull(), // e.g. Daily at 00:00, Every 2 hours
  status: text("status").notNull().default("active"), // active, paused
  lastRun: text("last_run"),
  executionCount: integer("execution_count").notNull().default(0),
  lastStatus: text("last_status").notNull().default("success"), // success, failed, running
});

export const insertAutomationTaskSchema = createInsertSchema(automationTasks).omit({
  id: true,
});

export type InsertAutomationTask = z.infer<typeof insertAutomationTaskSchema>;
export type AutomationTask = typeof automationTasks.$inferSelect;

// System Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, warning, success, error
  read: boolean("read").notNull().default(false),
  timestamp: text("timestamp").notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// Audit & Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user: text("user").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  details: text("details").notNull(),
  timestamp: text("timestamp").notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;

// Shared Analytics DTOs
export interface AnalyticsOverview {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  activeTasks: number;
  monthlyRevenue: { month: string; revenue: number; orders: number; profit: number }[];
  categoryDistribution: { category: string; count: number; value: number }[];
  regionalSales: { region: string; revenue: number; percentage: number }[];
  recentActivities: ActivityLog[];
}

export interface ForecastingData {
  historical: { date: string; actualRevenue: number }[];
  predictions: { date: string; predictedRevenue: number; lowerBound: number; upperBound: number }[];
}
