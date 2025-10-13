import { type User, type InsertUser, type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Laptop Pro 15",
        sku: "ELEC-001",
        category: "Electronics",
        price: "1299.99",
        stock: 45,
        minStock: 10,
        description: "High-performance laptop with 15-inch display",
      },
      {
        name: "Wireless Mouse",
        sku: "ELEC-002",
        category: "Electronics",
        price: "29.99",
        stock: 8,
        minStock: 15,
        description: "Ergonomic wireless mouse",
      },
      {
        name: "Office Chair",
        sku: "FURN-001",
        category: "Furniture",
        price: "249.99",
        stock: 22,
        minStock: 5,
        description: "Comfortable ergonomic office chair",
      },
      {
        name: "Cotton T-Shirt",
        sku: "CLOT-001",
        category: "Clothing",
        price: "19.99",
        stock: 0,
        minStock: 20,
        description: "100% cotton casual t-shirt",
      },
      {
        name: "Bluetooth Speaker",
        sku: "ELEC-003",
        category: "Electronics",
        price: "79.99",
        stock: 35,
        minStock: 10,
        description: "Portable bluetooth speaker with 12-hour battery",
      },
      {
        name: "Coffee Beans 1kg",
        sku: "FOOD-001",
        category: "Food & Beverage",
        price: "24.99",
        stock: 12,
        minStock: 15,
        description: "Premium arabica coffee beans",
      },
      {
        name: "Desk Lamp LED",
        sku: "FURN-002",
        category: "Furniture",
        price: "39.99",
        stock: 18,
        minStock: 8,
        description: "Adjustable LED desk lamp",
      },
      {
        name: "Running Shoes",
        sku: "SPORT-001",
        category: "Sports",
        price: "89.99",
        stock: 6,
        minStock: 12,
        description: "Lightweight running shoes for all terrains",
      },
      {
        name: "Hardcover Notebook",
        sku: "BOOK-001",
        category: "Books",
        price: "14.99",
        stock: 50,
        minStock: 20,
        description: "Premium hardcover notebook 200 pages",
      },
      {
        name: "Yoga Mat",
        sku: "SPORT-002",
        category: "Sports",
        price: "34.99",
        stock: 28,
        minStock: 10,
        description: "Non-slip yoga mat with carrying strap",
      },
    ];

    sampleProducts.forEach(product => {
      const id = randomUUID();
      this.products.set(id, { ...product, id });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.sku === sku,
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
