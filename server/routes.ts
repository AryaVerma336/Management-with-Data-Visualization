import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertSupplierSchema, insertAutomationTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Products Endpoints ---
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      const existingProduct = await storage.getProductBySku(validatedData.sku);
      if (existingProduct) {
        return res.status(400).json({ error: "Product with this SKU already exists" });
      }

      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (req.body.sku && req.body.sku !== product.sku) {
        const existingProduct = await storage.getProductBySku(req.body.sku);
        if (existingProduct) {
          return res.status(400).json({ error: "Product with this SKU already exists" });
        }
      }

      const updatedProduct = await storage.updateProduct(req.params.id, req.body);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // --- Orders Endpoints ---
  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create order" });
      }
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "Status is required" });

      const updated = await storage.updateOrderStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: "Order not found" });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // --- Suppliers Endpoints ---
  app.get("/api/suppliers", async (_req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create supplier" });
      }
    }
  });

  // --- Automation Tasks Endpoints ---
  app.get("/api/tasks", async (_req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automation tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertAutomationTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create task" });
      }
    }
  });

  app.post("/api/tasks/:id/run", async (req, res) => {
    try {
      const result = await storage.runTask(req.params.id);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to run task" });
      }
    }
  });

  app.patch("/api/tasks/:id/toggle", async (req, res) => {
    try {
      const updated = await storage.toggleTaskStatus(req.params.id);
      if (!updated) return res.status(404).json({ error: "Task not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle task" });
    }
  });

  // --- Notifications Endpoints ---
  app.get("/api/notifications", async (_req, res) => {
    try {
      const notifs = await storage.getNotifications();
      res.json(notifs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const success = await storage.markNotificationRead(req.params.id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  // --- Audit & Activity Logs ---
  app.get("/api/activities", async (_req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // --- Analytics Overview ---
  app.get("/api/analytics/overview", async (_req, res) => {
    try {
      const overview = await storage.getAnalyticsOverview();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics overview" });
    }
  });

  // --- Predictive Forecasting ---
  app.get("/api/analytics/forecasting", async (_req, res) => {
    try {
      const forecasting = await storage.getForecastingData();
      res.json(forecasting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forecasting data" });
    }
  });

  // --- Data Export Generator ---
  app.get("/api/export/:type", async (req, res) => {
    try {
      const type = req.params.type; // products, orders, tasks
      const format = (req.query.format as "csv" | "json") || "csv";
      
      const content = await storage.exportData(type, format);
      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename=${type}_export.json`);
      } else {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=${type}_export.csv`);
      }
      res.send(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
