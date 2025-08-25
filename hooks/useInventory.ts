import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Product, Transaction, ProductType } from '../types.ts';
import initSqlJs, { Database } from 'sql.js';

interface InventoryContextType {
  products: Product[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Transaction;
  loading: boolean;
  loadingMessage: string;
  db: Database | null;
  dbFileName: string | null;
  loadDbFromFile: (file: File) => Promise<void>;
  createNewDb: () => Promise<void>;
  exportDb: () => Uint8Array | null;
  disconnectDb: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'posErpProducts';
const TRANSACTIONS_STORAGE_KEY = 'posErpTransactions';

const initialProducts: Product[] = [
  { id: 'prod-1', name: 'กาแฟเอสเปรสโซ่', price: 55, stock: 100, sku: 'SKU001', description: 'ช็อตกาแฟเข้มข้นสกัดจากเมล็ดกาแฟคุณภาพดี', imageUrl: 'https://source.unsplash.com/400x400/?espresso,coffee', type: ProductType.SERVICE, category: 'เครื่องดื่มร้อน' },
  { id: 'prod-2', name: 'คาปูชิโน่', price: 65, stock: 80, sku: 'SKU002', description: 'กาแฟผสมนมและฟองนมเนียนนุ่ม รสชาติกลมกล่อม', imageUrl: 'https://source.unsplash.com/400x400/?cappuccino', type: ProductType.SERVICE, category: 'เครื่องดื่มร้อน' },
  { id: 'prod-3', name: 'ครัวซองต์เนยสด', price: 75, stock: 50, sku: 'SKU003', description: 'ครัวซองต์อบใหม่หอมกรุ่น ทำจากเนยแท้', imageUrl: 'https://source.unsplash.com/400x400/?croissant', type: ProductType.INVENTORY, category: 'เบเกอรี่' },
  { id: 'prod-4', name: 'น้ำส้มคั้นสด', price: 60, stock: 45, sku: 'SKU004', description: 'สดชื่นด้วยน้ำส้มคั้นสด 100% ไม่ผสมน้ำตาล', imageUrl: 'https://source.unsplash.com/400x400/?orange_juice', type: ProductType.SERVICE, category: 'เครื่องดื่มเย็น' },
  { id: 'prod-5', name: 'ชามะนาว', price: 50, stock: 90, sku: 'SKU005', description: 'ชาไทยรสเข้มข้นผสมผสานกับความเปรี้ยวของมะนาว', imageUrl: 'https://source.unsplash.com/400x400/?lemon_tea', type: ProductType.SERVICE, category: 'เครื่องดื่มเย็น' },
  { id: 'prod-6', name: 'บราวนี่ช็อคโกแลต', price: 80, stock: 30, sku: 'SKU006', description: 'บราวนี่เนื้อหนึบ เข้มข้นด้วยดาร์กช็อกโกแลต', imageUrl: 'https://source.unsplash.com/400x400/?chocolate_brownie', type: ProductType.INVENTORY, category: 'เบเกอรี่' },
];


export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('กำลังโหลดข้อมูล...');
  
  const [db, setDb] = useState<Database | null>(null);
  const [dbFileName, setDbFileName] = useState<string | null>(null);
  const [SQL, setSQL] = useState<any>(null);

  useEffect(() => {
    initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    })
      .then(sql => {
        console.log("sql.js loaded successfully");
        setSQL(sql);
      })
      .catch(err => console.error("Failed to load sql.js", err));
  }, []);

  const loadDataFromDb = useCallback((database: Database) => {
    try {
        const productsStmt = database.prepare("SELECT * FROM products");
        const loadedProducts: Product[] = [];
        while (productsStmt.step()) {
            const row = productsStmt.getAsObject();
            loadedProducts.push({
                id: row.id as string,
                name: row.name as string,
                price: row.price as number,
                stock: row.stock as number,
                sku: row.sku as string,
                description: row.description as string,
                imageUrl: row.imageUrl as string,
                type: row.type as ProductType,
                category: row.category as string,
            });
        }
        productsStmt.free();
        setProducts(loadedProducts);

        const transactionsStmt = database.prepare("SELECT * FROM transactions");
        const loadedTransactions: Transaction[] = [];
        while (transactionsStmt.step()) {
            const row = transactionsStmt.getAsObject();
            loadedTransactions.push({
                id: row.id as string,
                items: JSON.parse(row.items as string),
                total: row.total as number,
                tax: row.tax as number,
                subtotal: row.subtotal as number,
                date: row.date as string,
            });
        }
        transactionsStmt.free();
        setTransactions(loadedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        console.log("Successfully loaded data from database.");
    } catch (e) {
        console.error("Failed to load data from database tables.", e);
        alert("Error reading from database. Ensure it has 'products' and 'transactions' tables with the correct structure.");
    }
  }, []);

  useEffect(() => {
    if (db || !SQL) return;

    const initializeData = () => {
      setLoading(true);
      try {
        const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

        if (storedProducts && storedTransactions) {
          setLoadingMessage('กำลังโหลดข้อมูลที่บันทึกไว้...');
          setProducts(JSON.parse(storedProducts));
          setTransactions(JSON.parse(storedTransactions));
        } else {
          setLoadingMessage('กำลังตั้งค่าแอปพลิเคชันเป็นครั้งแรก...');
          setProducts(initialProducts);
          setTransactions([]);
        }
      } catch (error) {
        console.error("Failed to load or initialize data from local storage.", error);
        setProducts(initialProducts);
        setTransactions([]);
      } finally {
        setLoading(false);
        setLoadingMessage('');
      }
    };
    
    initializeData();
  }, [db, SQL]);

  const loadDbFromFile = useCallback(async (file: File) => {
    if (!SQL) {
        alert("SQL.js is not loaded yet. Please wait and try again.");
        return;
    }
    setLoading(true);
    setLoadingMessage(`กำลังโหลดฐานข้อมูล: ${file.name}...`);
    try {
        const fileBuffer = await file.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(fileBuffer));
        if (db) db.close();
        setDb(database);
        setDbFileName(file.name);
        loadDataFromDb(database);
    } catch (e) {
        console.error("Failed to load database file", e);
        alert("ไม่สามารถโหลดไฟล์ฐานข้อมูลได้ เป็นไฟล์ SQLite ที่ถูกต้องหรือไม่?");
        setDb(null);
        setDbFileName(null);
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  }, [SQL, loadDataFromDb, db]);
  
  const createNewDb = useCallback(async () => {
    if (!SQL) {
        alert("SQL.js is not loaded yet. Please wait and try again.");
        return;
    }
    setLoading(true);
    setLoadingMessage('กำลังสร้างฐานข้อมูลใหม่...');
    try {
        if(db) db.close();
        const newDb = new SQL.Database();

        newDb.exec(`
            CREATE TABLE products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL,
                sku TEXT,
                description TEXT,
                imageUrl TEXT,
                type TEXT NOT NULL,
                category TEXT NOT NULL
            );
            CREATE TABLE transactions (
                id TEXT PRIMARY KEY,
                items TEXT NOT NULL,
                total REAL NOT NULL,
                tax REAL NOT NULL,
                subtotal REAL NOT NULL,
                date TEXT NOT NULL
            );
        `);

        const stmt = newDb.prepare("INSERT INTO products (id, name, price, stock, sku, description, imageUrl, type, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        initialProducts.forEach(p => {
            stmt.run([p.id, p.name, p.price, p.stock, p.sku, p.description, p.imageUrl, p.type, p.category]);
        });
        stmt.free();

        setDb(newDb);
        setDbFileName('pos-data.db');
        loadDataFromDb(newDb);
        console.log("Successfully created and connected to a new database.");
    } catch (e) {
        console.error("Failed to create new database", e);
        alert("ไม่สามารถสร้างฐานข้อมูลใหม่ได้");
        if (db) db.close();
        setDb(null);
        setDbFileName(null);
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  }, [SQL, loadDataFromDb, db]);

  const exportDb = useCallback(() => {
    if (!db) return null;
    return db.export();
  }, [db]);

  const disconnectDb = useCallback(() => {
    if (db) {
        db.close();
    }
    setDb(null);
    setDbFileName(null);
    window.location.reload();
  }, [db]);

  useEffect(() => {
    if (!loading && !db) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, loading, db]);

  useEffect(() => {
    if (!loading && !db) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, loading, db]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
    
    if (db) {
      try {
        db.run("INSERT INTO products (id, name, price, stock, sku, description, imageUrl, type, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
          newProduct.id, newProduct.name, newProduct.price, newProduct.stock, newProduct.sku, newProduct.description, newProduct.imageUrl, newProduct.type, newProduct.category
        ]);
      } catch (e) {
        console.error("DB Error on addProduct:", e);
        alert("Failed to save new product to the database."); return;
      }
    }
    setProducts(prev => [...prev, newProduct]);
  }, [db]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    if (db) {
      try {
        db.run("UPDATE products SET name = ?, price = ?, stock = ?, sku = ?, description = ?, imageUrl = ?, type = ?, category = ? WHERE id = ?", [
          updatedProduct.name, updatedProduct.price, updatedProduct.stock, updatedProduct.sku, updatedProduct.description, updatedProduct.imageUrl, updatedProduct.type, updatedProduct.category, updatedProduct.id
        ]);
      } catch (e) {
        console.error("DB Error on updateProduct:", e);
        alert("Failed to update product in the database."); return;
      }
    }
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
  }, [db]);
  
  const deleteProduct = useCallback((productId: string) => {
    if (db) {
      try {
        db.run("DELETE FROM products WHERE id = ?", [productId]);
      } catch(e) {
        console.error("DB Error on deleteProduct:", e);
        alert("Failed to delete product from the database."); return;
      }
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, [db]);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'date'>): Transaction => {
    const newTransaction: Transaction = {
      ...transactionData, id: `txn-${Date.now()}`, date: new Date().toISOString(),
    };
    
    if (db) {
      try {
        db.exec("BEGIN TRANSACTION;");
        db.run("INSERT INTO transactions (id, items, total, tax, subtotal, date) VALUES (?, ?, ?, ?, ?, ?)", [
            newTransaction.id, JSON.stringify(newTransaction.items), newTransaction.total, newTransaction.tax, newTransaction.subtotal, newTransaction.date
        ]);
        newTransaction.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product && product.type === ProductType.INVENTORY) {
              db.run("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.productId]);
            }
        });
        db.exec("COMMIT;");
      } catch(e) {
          console.error("DB Error on addTransaction:", e);
          db.exec("ROLLBACK;");
          alert("Failed to save transaction to the database.");
          return transactionData as Transaction;
      }
    }

    setTransactions(prev => [newTransaction, ...prev]);
    setProducts(prevProducts => {
      const itemsToUpdate = new Map(newTransaction.items.map(i => [i.productId, i.quantity]));
      return prevProducts.map(p => {
        const quantityToDecrement = itemsToUpdate.get(p.id);
        if (p.type === ProductType.INVENTORY && typeof quantityToDecrement === 'number') {
          return { ...p, stock: p.stock - quantityToDecrement };
        }
        return p;
      });
    });
    return newTransaction;
  }, [db, products]);

  const contextValue = useMemo(() => ({
    products, transactions, addProduct, updateProduct, deleteProduct, addTransaction, loading, loadingMessage,
    db, dbFileName, loadDbFromFile, exportDb, disconnectDb, createNewDb
  }), [products, transactions, addProduct, updateProduct, deleteProduct, addTransaction, loading, loadingMessage, db, dbFileName, loadDbFromFile, exportDb, disconnectDb, createNewDb]);

  return React.createElement(InventoryContext.Provider, { value: contextValue }, children);
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};