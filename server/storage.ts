import {
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Supplier, type InsertSupplier,
  type AutomationTask, type InsertAutomationTask,
  type Notification,
  type ActivityLog
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Suppliers
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Automation Tasks
  getAllTasks(): Promise<AutomationTask[]>;
  getTask(id: string): Promise<AutomationTask | undefined>;
  createTask(task: InsertAutomationTask): Promise<AutomationTask>;
  toggleTaskStatus(id: string): Promise<AutomationTask | undefined>;
  runTask(id: string): Promise<{ success: boolean; message: string; task: AutomationTask }>;

  // Notifications
  getNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<boolean>;

  // Activity Logs
  getActivityLogs(): Promise<ActivityLog[]>;
  logActivity(action: string, entity: string, details: string, user?: string): Promise<ActivityLog>;

  // Analytics & Exports
  getAnalyticsOverview(): Promise<AnalyticsOverview>;
  getForecastingData(): Promise<ForecastingData>;
  exportData(entityType: string, format: "csv" | "json"): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private suppliers: Map<string, Supplier>;
  private tasks: Map<string, AutomationTask>;
  private notifications: Notification[];
  private activityLogs: ActivityLog[];

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.suppliers = new Map();
    this.tasks = new Map();
    this.notifications = [];
    this.activityLogs = [];

    this.seedAllData();
  }

  private seedAllData() {
    // 1. Seed Suppliers
    const sampleSuppliers: InsertSupplier[] = [
      { name: "TechCore Global Ltd.", contactPerson: "Sarah Jenkins", email: "s.jenkins@techcore.io", phone: "+1 (555) 234-5678", category: "Electronics", rating: "4.9", leadTimeDays: 3, status: "Active" },
      { name: "ErgoComfort Furniture", contactPerson: "Michael Vance", email: "mvance@ergocomfort.com", phone: "+1 (555) 876-5432", category: "Furniture", rating: "4.7", leadTimeDays: 7, status: "Active" },
      { name: "Urban Threads Supply", contactPerson: "Elena Rostova", email: "elena@urbanthreads.net", phone: "+44 20 7946 0912", category: "Clothing", rating: "4.5", leadTimeDays: 5, status: "Active" },
      { name: "Artisan Roast & Co.", contactPerson: "David Miller", email: "david@artisanroast.com", phone: "+1 (555) 345-6789", category: "Food & Beverage", rating: "4.8", leadTimeDays: 2, status: "Active" },
      { name: "Apex Athletics Gear", contactPerson: "Chris Redfield", email: "orders@apexgear.org", phone: "+1 (555) 654-9870", category: "Sports", rating: "4.6", leadTimeDays: 4, status: "Active" },
      { name: "Precision Stationery", contactPerson: "Amanda Liu", email: "amanda@precisionpaper.cn", phone: "+86 21 6123 4567", category: "Books & Office", rating: "4.4", leadTimeDays: 6, status: "Active" },
    ];

    sampleSuppliers.forEach(sup => {
      const id = randomUUID();
      const supplier: Supplier = {
        id,
        name: sup.name,
        contactPerson: sup.contactPerson,
        email: sup.email,
        phone: sup.phone,
        category: sup.category,
        rating: sup.rating ?? "4.8",
        leadTimeDays: sup.leadTimeDays ?? 5,
        status: sup.status ?? "Active"
      };
      this.suppliers.set(id, supplier);
    });

    // 2. Seed Products
    const sampleProducts: InsertProduct[] = [
      { name: "ProBook X1 Enterprise Laptop", sku: "ELEC-101", category: "Electronics", price: "1499.99", cost: "980.00", stock: 38, minStock: 10, maxStock: 100, supplier: "TechCore Global Ltd.", rating: "4.9", description: "16-inch M3 Ultra laptop with 32GB RAM & 1TB SSD", status: "active" },
      { name: "Ergonomic Wireless Pro Mouse", sku: "ELEC-102", category: "Electronics", price: "49.99", cost: "21.50", stock: 8, minStock: 15, maxStock: 150, supplier: "TechCore Global Ltd.", rating: "4.7", description: "Multi-device Bluetooth mouse with hyper-scroll wheel", status: "active" },
      { name: "4K UltraWide Curved Monitor 34\"", sku: "ELEC-103", category: "Electronics", price: "799.99", cost: "490.00", stock: 14, minStock: 5, maxStock: 50, supplier: "TechCore Global Ltd.", rating: "4.8", description: "144Hz IPS Ultrawide HDR monitor for productivity", status: "active" },
      { name: "Active Noise-Canceling Headset", sku: "ELEC-104", category: "Electronics", price: "229.99", cost: "115.00", stock: 0, minStock: 12, maxStock: 80, supplier: "TechCore Global Ltd.", rating: "4.6", description: "Wireless over-ear headset with 40-hour battery life", status: "active" },
      { name: "ErgoDesk Pro Standing Desk", sku: "FURN-201", category: "Furniture", price: "599.99", cost: "340.00", stock: 19, minStock: 8, maxStock: 40, supplier: "ErgoComfort Furniture", rating: "4.8", description: "Dual-motor electric height-adjustable desk with memory presets", status: "active" },
      { name: "Mesh Executive Ergonomic Chair", sku: "FURN-202", category: "Furniture", price: "349.99", cost: "190.00", stock: 24, minStock: 10, maxStock: 60, supplier: "ErgoComfort Furniture", rating: "4.7", description: "3D Lumbar support breathable mesh office chair", status: "active" },
      { name: "Acoustic Desk Partition Panel", sku: "FURN-203", category: "Furniture", price: "89.99", cost: "38.00", stock: 45, minStock: 15, maxStock: 100, supplier: "ErgoComfort Furniture", rating: "4.4", description: "Sound-absorbing desk privacy screen 120cm", status: "active" },
      { name: "Organic Cotton Polo Shirt", sku: "CLOT-301", category: "Clothing", price: "34.99", cost: "12.00", stock: 85, minStock: 25, maxStock: 200, supplier: "Urban Threads Supply", rating: "4.5", description: "Breathable eco-friendly corporate polo shirt", status: "active" },
      { name: "Waterproof Tech Backpack 25L", sku: "CLOT-302", category: "Clothing", price: "89.99", cost: "36.00", stock: 6, minStock: 10, maxStock: 80, supplier: "Urban Threads Supply", rating: "4.9", description: "Anti-theft padded laptop backpack with USB charging port", status: "active" },
      { name: "Single-Origin Specialty Beans 1kg", sku: "FOOD-401", category: "Food & Beverage", price: "28.99", cost: "11.20", stock: 42, minStock: 20, maxStock: 120, supplier: "Artisan Roast & Co.", rating: "4.9", description: "Freshly roasted Ethiopian Yirgacheffe coffee beans", status: "active" },
      { name: "Cold Brew Espresso Machine", sku: "FOOD-402", category: "Food & Beverage", price: "189.99", cost: "95.00", stock: 11, minStock: 5, maxStock: 30, supplier: "Artisan Roast & Co.", rating: "4.6", description: "Commercial-grade compact espresso maker", status: "active" },
      { name: "Smart Fitness Watch Tracker", sku: "SPORT-501", category: "Sports", price: "129.99", cost: "62.00", stock: 29, minStock: 12, maxStock: 90, supplier: "Apex Athletics Gear", rating: "4.7", description: "GPS heart rate sleep tracking waterproof smartwatch", status: "active" },
      { name: "High-Density Yoga & Exercise Mat", sku: "SPORT-502", category: "Sports", price: "39.99", cost: "15.00", stock: 3, minStock: 15, maxStock: 75, supplier: "Apex Athletics Gear", rating: "4.5", description: "Extra thick non-slip eco TPE fitness mat with strap", status: "active" },
      { name: "Executive Leather Journal Notebook", sku: "BOOK-601", category: "Books & Office", price: "24.99", cost: "8.50", stock: 95, minStock: 30, maxStock: 300, supplier: "Precision Stationery", rating: "4.8", description: "240-page thick acid-free paper journal with pen holder", status: "active" },
      { name: "Aluminum Dual Monitor Arm", sku: "FURN-204", category: "Furniture", price: "119.99", cost: "52.00", stock: 16, minStock: 8, maxStock: 50, supplier: "ErgoComfort Furniture", rating: "4.6", description: "Full-motion gas spring desk mount for screens up to 32\"", status: "active" },
    ];

    sampleProducts.forEach(prod => {
      const id = randomUUID();
      const product: Product = {
        id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        price: prod.price,
        cost: prod.cost ?? "0.00",
        stock: prod.stock ?? 0,
        minStock: prod.minStock ?? 10,
        maxStock: prod.maxStock ?? 100,
        supplier: prod.supplier ?? "Global Logistics Co.",
        rating: prod.rating ?? "4.5",
        description: prod.description ?? null,
        status: prod.status ?? "active"
      };
      this.products.set(id, product);
    });

    // 3. Seed Orders (12 Months of Data)
    const months = [
      "2025-10", "2025-11", "2025-12",
      "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"
    ];

    const customers = [
      { name: "Acme Corporation", email: "procurement@acme.com", region: "North America" },
      { name: "Nexus Global Tech", email: "orders@nexus.io", region: "Europe" },
      { name: "Apex Solutions", email: "info@apexsolutions.org", region: "Asia Pacific" },
      { name: "Horizon Enterprises", email: "purchasing@horizon.com", region: "North America" },
      { name: "Vanguard Retail", email: "supply@vanguard.de", region: "Europe" },
      { name: "Starlight Digital", email: "finance@starlight.co.uk", region: "Europe" },
      { name: "Pacifica Dynamics", email: "ops@pacifica.jp", region: "Asia Pacific" },
      { name: "LatAm Innovations", email: "compras@latamtech.br", region: "Latin America" },
      { name: "EMEA Trading Co.", email: "trade@emea.ae", region: "EMEA" },
    ];

    const statuses = ["delivered", "delivered", "delivered", "shipped", "processing", "pending", "cancelled"];
    const paymentMethods = ["Credit Card", "Bank Transfer", "PayPal", "Corporate Invoice"];

    let orderCount = 1001;
    months.forEach((monthStr, mIndex) => {
      const ordersPerMonth = 8 + (mIndex % 5) * 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < ordersPerMonth; i++) {
        const day = String(Math.floor(Math.random() * 26) + 1).padStart(2, "0");
        const cust = customers[Math.floor(Math.random() * customers.length)];
        const status = (mIndex < 10) ? "delivered" : statuses[Math.floor(Math.random() * statuses.length)];
        const amount = Math.floor(150 + Math.random() * 3500);
        const items = Math.floor(1 + Math.random() * 8);

        const order: Order = {
          id: randomUUID(),
          orderNumber: `ORD-${orderCount++}`,
          customerName: cust.name,
          customerEmail: cust.email,
          status,
          totalAmount: amount.toFixed(2),
          itemsCount: items,
          date: `${monthStr}-${day}`,
          region: cust.region,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        };
        this.orders.set(order.id, order);
      }
    });

    // 4. Seed Automation Tasks
    const sampleTasks: InsertAutomationTask[] = [
      {
        name: "Automated File & Directory Cleanup Script",
        description: "Scans temp export directories, archives logs older than 30 days, and re-organizes data downloads.",
        type: "file_organizer",
        schedule: "Daily at 02:00 UTC",
        status: "active",
        lastRun: "2026-09-05 02:00:00",
        executionCount: 142,
        lastStatus: "success",
      },
      {
        name: "Low-Stock Email Alert Dispatcher",
        description: "Monitors products below minStock threshold and automatically dispatches reorder emails to suppliers.",
        type: "email_alert",
        schedule: "Every 4 Hours",
        status: "active",
        lastRun: "2026-09-05 20:00:00",
        executionCount: 840,
        lastStatus: "success",
      },
      {
        name: "Executive Daily Revenue Report Engine",
        description: "Generates aggregated sales summary PDF and delivers via automated notification webhook to management.",
        type: "report_generator",
        schedule: "Daily at 08:00 UTC",
        status: "active",
        lastRun: "2026-09-05 08:00:00",
        executionCount: 210,
        lastStatus: "success",
      },
      {
        name: "Multi-Channel Price & Stock Sync Pipeline",
        description: "Synchronizes inventory quantities and active price tiers across connected e-commerce endpoints.",
        type: "inventory_sync",
        schedule: "Every 30 Minutes",
        status: "active",
        lastRun: "2026-09-05 22:30:00",
        executionCount: 4320,
        lastStatus: "success",
      },
      {
        name: "Database Backup & Audit Trail Archiver",
        description: "Executes automated snapshot of system state and compresses historical audit logs into cold storage.",
        type: "file_organizer",
        schedule: "Weekly on Sunday 00:00",
        status: "active",
        lastRun: "2026-08-31 00:00:00",
        executionCount: 52,
        lastStatus: "success",
      },
      {
        name: "Supplier Lead-Time Anomaly Detector",
        description: "Analyzes order fulfillment delays and flags underperforming suppliers in the dashboard.",
        type: "email_alert",
        schedule: "Daily at 12:00 UTC",
        status: "paused",
        lastRun: "2026-09-04 12:00:00",
        executionCount: 98,
        lastStatus: "success",
      },
    ];

    sampleTasks.forEach(taskItem => {
      const id = randomUUID();
      const task: AutomationTask = {
        id,
        name: taskItem.name,
        description: taskItem.description,
        type: taskItem.type,
        schedule: taskItem.schedule,
        status: taskItem.status ?? "active",
        lastRun: taskItem.lastRun ?? null,
        executionCount: taskItem.executionCount ?? 0,
        lastStatus: taskItem.lastStatus ?? "success"
      };
      this.tasks.set(id, task);
    });

    // 5. System Notifications
    this.notifications = [
      { id: randomUUID(), title: "Low Stock Warning", message: "Active Noise-Canceling Headset (ELEC-104) is out of stock!", type: "error", read: false, timestamp: "10 mins ago" },
      { id: randomUUID(), title: "Low Stock Warning", message: "High-Density Yoga Mat (SPORT-502) is down to 3 units (Min: 15).", type: "warning", read: false, timestamp: "25 mins ago" },
      { id: randomUUID(), title: "Automation Success", message: "Automated File & Directory Cleanup script executed clean. 42MB freed.", type: "success", read: false, timestamp: "1 hour ago" },
      { id: randomUUID(), title: "Large Order Received", message: "Acme Corporation placed order ORD-1094 for $3,450.00", type: "info", read: true, timestamp: "2 hours ago" },
      { id: randomUUID(), title: "System Update", message: "Data Visualization Engine updated to v2.5 with Predictive Forecasting models.", type: "info", read: true, timestamp: "1 day ago" },
    ];

    // 6. Activity Logs
    this.activityLogs = [
      { id: randomUUID(), user: "Admin", action: "TRIGGER_TASK", entity: "Automation", details: "Manually triggered Low-Stock Email Alert Dispatcher", timestamp: "5 mins ago" },
      { id: randomUUID(), user: "Admin", action: "UPDATE_PRODUCT", entity: "Inventory", details: "Updated stock level for ProBook X1 Enterprise Laptop (SKU: ELEC-101) to 38", timestamp: "45 mins ago" },
      { id: randomUUID(), user: "System", action: "CREATE_ORDER", entity: "Sales", details: "Processed new order ORD-1094 for Acme Corporation ($3,450.00)", timestamp: "2 hours ago" },
      { id: randomUUID(), user: "Admin", action: "ADD_PRODUCT", entity: "Inventory", details: "Added new product 'Executive Leather Journal Notebook' (SKU: BOOK-601)", timestamp: "4 hours ago" },
      { id: randomUUID(), user: "System", action: "EXECUTE_SCRIPT", entity: "Automation", details: "Completed file organizing script; archived 14 temp report files", timestamp: "5 hours ago" },
      { id: randomUUID(), user: "Admin", action: "UPDATE_SUPPLIER", entity: "Suppliers", details: "Updated lead time metrics for TechCore Global Ltd. to 3 days", timestamp: "1 day ago" },
    ];
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, role: "admin", name: insertUser.username, avatar: null };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.sku === sku);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      id,
      name: insertProduct.name,
      sku: insertProduct.sku,
      category: insertProduct.category,
      price: insertProduct.price,
      cost: insertProduct.cost ?? "0.00",
      stock: insertProduct.stock ?? 0,
      minStock: insertProduct.minStock ?? 10,
      maxStock: insertProduct.maxStock ?? 100,
      supplier: insertProduct.supplier ?? "Global Logistics Co.",
      rating: insertProduct.rating ?? "4.5",
      description: insertProduct.description ?? null,
      status: insertProduct.status ?? "active",
    };
    this.products.set(id, product);

    this.logActivity("ADD_PRODUCT", "Inventory", `Created product '${product.name}' (SKU: ${product.sku})`);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct: Product = {
      ...product,
      ...updates,
      cost: updates.cost ?? product.cost,
      stock: updates.stock ?? product.stock,
      minStock: updates.minStock ?? product.minStock,
      maxStock: updates.maxStock ?? product.maxStock,
      supplier: updates.supplier ?? product.supplier,
      rating: updates.rating ?? product.rating,
      status: updates.status ?? product.status,
    };
    this.products.set(id, updatedProduct);

    this.logActivity("UPDATE_PRODUCT", "Inventory", `Updated product '${updatedProduct.name}' (SKU: ${updatedProduct.sku})`);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = this.products.get(id);
    if (product) {
      this.logActivity("DELETE_PRODUCT", "Inventory", `Deleted product '${product.name}' (SKU: ${product.sku})`);
    }
    return this.products.delete(id);
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      id,
      orderNumber: insertOrder.orderNumber,
      customerName: insertOrder.customerName,
      customerEmail: insertOrder.customerEmail,
      status: insertOrder.status ?? "pending",
      totalAmount: insertOrder.totalAmount,
      itemsCount: insertOrder.itemsCount ?? 1,
      date: insertOrder.date,
      region: insertOrder.region ?? "North America",
      paymentMethod: insertOrder.paymentMethod ?? "Credit Card",
    };
    this.orders.set(id, order);

    this.logActivity("CREATE_ORDER", "Sales", `Created order ${order.orderNumber} for ${order.customerName} ($${order.totalAmount})`);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updated = { ...order, status };
    this.orders.set(id, updated);
    this.logActivity("UPDATE_ORDER_STATUS", "Sales", `Changed order ${order.orderNumber} status to '${status}'`);
    return updated;
  }

  // Supplier methods
  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      id,
      name: insertSupplier.name,
      contactPerson: insertSupplier.contactPerson,
      email: insertSupplier.email,
      phone: insertSupplier.phone,
      category: insertSupplier.category,
      rating: insertSupplier.rating ?? "4.8",
      leadTimeDays: insertSupplier.leadTimeDays ?? 5,
      status: insertSupplier.status ?? "Active",
    };
    this.suppliers.set(id, supplier);
    this.logActivity("ADD_SUPPLIER", "Suppliers", `Added supplier '${supplier.name}'`);
    return supplier;
  }

  // Automation Task methods
  async getAllTasks(): Promise<AutomationTask[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<AutomationTask | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertAutomationTask): Promise<AutomationTask> {
    const id = randomUUID();
    const task: AutomationTask = {
      id,
      name: insertTask.name,
      description: insertTask.description,
      type: insertTask.type,
      schedule: insertTask.schedule,
      status: insertTask.status ?? "active",
      lastRun: null,
      executionCount: 0,
      lastStatus: "success"
    };
    this.tasks.set(id, task);
    this.logActivity("CREATE_TASK", "Automation", `Created automation workflow '${task.name}'`);
    return task;
  }

  async toggleTaskStatus(id: string): Promise<AutomationTask | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const newStatus = task.status === "active" ? "paused" : "active";
    const updated = { ...task, status: newStatus };
    this.tasks.set(id, updated);
    this.logActivity("TOGGLE_TASK", "Automation", `Set workflow '${task.name}' status to ${newStatus}`);
    return updated;
  }

  async runTask(id: string): Promise<{ success: boolean; message: string; task: AutomationTask }> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const updatedTask: AutomationTask = {
      ...task,
      lastRun: now,
      executionCount: task.executionCount + 1,
      lastStatus: "success"
    };
    this.tasks.set(id, updatedTask);

    let resultMsg = "";
    if (task.type === "file_organizer") {
      resultMsg = "File & Folder script executed: Cleaned 18 temp files and organized downloads directory.";
    } else if (task.type === "email_alert") {
      resultMsg = "Email notification system dispatched 2 reorder alerts to suppliers.";
    } else if (task.type === "report_generator") {
      resultMsg = "Daily executive analytics PDF report compiled and delivered successfully.";
    } else {
      resultMsg = "Multi-channel inventory and pricing synchronization completed across 4 nodes.";
    }

    this.logActivity("RUN_TASK", "Automation", `Executed task '${task.name}': ${resultMsg}`);
    this.notifications.unshift({
      id: randomUUID(),
      title: `Automation Executed: ${task.name}`,
      message: resultMsg,
      type: "success",
      read: false,
      timestamp: "Just now"
    });

    return { success: true, message: resultMsg, task: updatedTask };
  }

  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return this.notifications;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  // Activity Log methods
  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.activityLogs;
  }

  async logActivity(action: string, entity: string, details: string, user: string = "Admin"): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: randomUUID(),
      user,
      action,
      entity,
      details,
      timestamp: "Just now"
    };
    this.activityLogs.unshift(log);
    if (this.activityLogs.length > 50) this.activityLogs.pop();
    return log;
  }

  // Analytics Overview Data Engine
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const allProducts = Array.from(this.products.values());
    const allOrders = Array.from(this.orders.values());

    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const totalProducts = allProducts.length;
    const lowStockCount = allProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStockCount = allProducts.filter(p => p.stock === 0).length;
    const totalInventoryValue = allProducts.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0);
    const activeTasks = Array.from(this.tasks.values()).filter(t => t.status === "active").length;

    // Monthly aggregation
    const monthMap: Record<string, { revenue: number; orders: number; profit: number }> = {};
    const months = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];
    
    months.forEach(m => {
      monthMap[m] = { revenue: 0, orders: 0, profit: 0 };
    });

    allOrders.forEach(o => {
      const mKey = o.date.slice(0, 7);
      if (monthMap[mKey]) {
        const amt = parseFloat(o.totalAmount);
        monthMap[mKey].revenue += amt;
        monthMap[mKey].orders += 1;
        monthMap[mKey].profit += amt * 0.38;
      }
    });

    const monthlyRevenue = Object.entries(monthMap).map(([mKey, val]) => {
      const [year, month] = mKey.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
      return {
        month: monthLabel,
        revenue: Math.round(val.revenue),
        orders: val.orders,
        profit: Math.round(val.profit),
      };
    });

    // Category distribution
    const categories = Array.from(new Set(allProducts.map(p => p.category)));
    const categoryDistribution = categories.map(cat => {
      const catProducts = allProducts.filter(p => p.category === cat);
      return {
        category: cat,
        count: catProducts.length,
        value: catProducts.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0),
      };
    });

    // Regional breakdown
    const regionMap: Record<string, number> = {};
    allOrders.forEach(o => {
      regionMap[o.region] = (regionMap[o.region] || 0) + parseFloat(o.totalAmount);
    });

    const regionalSales = Object.entries(regionMap).map(([region, revenue]) => ({
      region,
      revenue: Math.round(revenue),
      percentage: Math.round((revenue / totalRevenue) * 100),
    }));

    return {
      totalRevenue: Math.round(totalRevenue),
      revenueGrowth: 14.8,
      totalOrders: allOrders.length,
      ordersGrowth: 12.3,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue: Math.round(totalInventoryValue),
      activeTasks,
      monthlyRevenue,
      categoryDistribution,
      regionalSales,
      recentActivities: this.activityLogs.slice(0, 5),
    };
  }

  // Predictive Forecasting Analytics Engine
  async getForecastingData(): Promise<ForecastingData> {
    const overview = await this.getAnalyticsOverview();
    const historical = overview.monthlyRevenue.map(m => ({
      date: m.month,
      actualRevenue: m.revenue
    }));

    const lastRevenue = historical[historical.length - 1]?.actualRevenue || 30000;

    const predictions = [
      { date: "Oct 26", predictedRevenue: Math.round(lastRevenue * 1.08), lowerBound: Math.round(lastRevenue * 1.02), upperBound: Math.round(lastRevenue * 1.15) },
      { date: "Nov 26", predictedRevenue: Math.round(lastRevenue * 1.16), lowerBound: Math.round(lastRevenue * 1.08), upperBound: Math.round(lastRevenue * 1.25) },
      { date: "Dec 26", predictedRevenue: Math.round(lastRevenue * 1.28), lowerBound: Math.round(lastRevenue * 1.18), upperBound: Math.round(lastRevenue * 1.40) },
    ];

    return { historical, predictions };
  }

  // CSV / JSON Export Generator
  async exportData(entityType: string, format: "csv" | "json"): Promise<string> {
    if (entityType === "products") {
      const products = await this.getAllProducts();
      if (format === "json") return JSON.stringify(products, null, 2);
      
      const header = "ID,Name,SKU,Category,Price,Cost,Stock,MinStock,MaxStock,Supplier,Rating,Status\n";
      const rows = products.map(p => `"${p.id}","${p.name}","${p.sku}","${p.category}",${p.price},${p.cost},${p.stock},${p.minStock},${p.maxStock},"${p.supplier}",${p.rating},"${p.status}"`).join("\n");
      return header + rows;
    } else if (entityType === "orders") {
      const orders = await this.getAllOrders();
      if (format === "json") return JSON.stringify(orders, null, 2);

      const header = "ID,OrderNumber,CustomerName,CustomerEmail,Status,TotalAmount,ItemsCount,Date,Region,PaymentMethod\n";
      const rows = orders.map(o => `"${o.id}","${o.orderNumber}","${o.customerName}","${o.customerEmail}","${o.status}",${o.totalAmount},${o.itemsCount},"${o.date}","${o.region}","${o.paymentMethod}"`).join("\n");
      return header + rows;
    } else {
      const tasks = await this.getAllTasks();
      if (format === "json") return JSON.stringify(tasks, null, 2);

      const header = "ID,Name,Type,Schedule,Status,ExecutionCount,LastRun,LastStatus\n";
      const rows = tasks.map(t => `"${t.id}","${t.name}","${t.type}","${t.schedule}","${t.status}",${t.executionCount},"${t.lastRun || ''}","${t.lastStatus}"`).join("\n");
      return header + rows;
    }
  }
}

export const storage = new MemStorage();
