import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = new Database('database.db');

  // Multer config for logo upload
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/');
    },
    filename: (req, file, cb) => {
      cb(null, 'logo.png'); // Always overwrite the main logo
    }
  });
  const upload = multer({ storage });

  // Initialize Database
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      plateNumber TEXT UNIQUE,
      ownerName TEXT,
      phoneNumber TEXT,
      fcExpiry TEXT,
      permitExpiry TEXT,
      insuranceExpiry TEXT,
      nationalPermitExpiry TEXT,
      pollutionExpiry TEXT,
      taxExpiry TEXT,
      greenTaxExpiry TEXT,
      lastReminderSent TEXT,
      lastSync TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS tax_records (
      id TEXT PRIMARY KEY,
      plateNumber TEXT,
      ownerName TEXT,
      phoneNumber TEXT,
      taxType TEXT,
      taxAmount TEXT,
      gt TEXT,
      information TEXT,
      paidDate TEXT,
      inDate TEXT,
      taxExpiry TEXT,
      taxPeriod TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS billing_records (
      id TEXT PRIMARY KEY,
      date TEXT,
      customerName TEXT,
      phoneNumber TEXT,
      vehicleNumber TEXT,
      serviceDescription TEXT,
      amount REAL,
      paidAmount REAL,
      pendingAmount REAL,
      paymentStatus TEXT,
      paymentMode TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration: Add missing columns if they don't exist
  const migration = () => {
    try {
      const tableInfo = (name: string) => db.prepare(`PRAGMA table_info(${name})`).all() as any[];
      
      // Vehicles migrations
      const vehicleCols = tableInfo('vehicles').map(c => c.name);
      const newVehicleCols = ['pollutionExpiry', 'taxExpiry', 'greenTaxExpiry'];
      newVehicleCols.forEach(col => {
        if (!vehicleCols.includes(col)) {
          db.exec(`ALTER TABLE vehicles ADD COLUMN ${col} TEXT;`);
        }
      });

      // Tax records migrations
      const taxCols = tableInfo('tax_records').map(c => c.name);
      const newTaxCols = ['inDate', 'paidDate', 'taxPeriod'];
      newTaxCols.forEach(col => {
        if (!taxCols.includes(col)) {
          db.exec(`ALTER TABLE tax_records ADD COLUMN ${col} TEXT;`);
        }
      });

      // Billing records migrations
      const billingCols = tableInfo('billing_records').map(c => c.name);
      if (!billingCols.includes('phoneNumber')) {
        db.exec(`ALTER TABLE billing_records ADD COLUMN phoneNumber TEXT;`);
      }
    } catch (err) {
      console.error("Migration error (non-fatal):", err);
    }
  };
  migration();

  app.use(express.json());

  // Disable caching for API routes
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });

  // API Routes
  
  // Vehicles
  app.get('/api/vehicles', (req, res) => {
    const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY createdAt DESC').all();
    res.json(vehicles);
  });

  app.post('/api/vehicles', (req, res) => {
    const { plateNumber, ownerName, phoneNumber, ...rest } = req.body;
    const cleanedPlate = String(plateNumber || '').toUpperCase();
    
    // Find existing to reuse ID if possible (avoids unique constraint error)
    const existing = db.prepare('SELECT id FROM vehicles WHERE plateNumber = ?').get(cleanedPlate) as any;
    const id = existing ? existing.id : uuidv4();
    const createdAt = existing ? existing.createdAt : new Date().toISOString();
    const updatedAt = new Date().toISOString();
    
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO vehicles (id, plateNumber, ownerName, phoneNumber, fcExpiry, permitExpiry, insuranceExpiry, nationalPermitExpiry, pollutionExpiry, taxExpiry, greenTaxExpiry, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, cleanedPlate, ownerName, phoneNumber, rest.fcExpiry, rest.permitExpiry, rest.insuranceExpiry, rest.nationalPermitExpiry, rest.pollutionExpiry, rest.taxExpiry, rest.greenTaxExpiry, createdAt, updatedAt);
      res.status(201).json({ id, plateNumber: cleanedPlate, ownerName, phoneNumber, ...rest, createdAt, updatedAt });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const updatedAt = new Date().toISOString();

    const old = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id) as any;
    if (!old) return res.status(404).json({ error: 'Not found' });

    const merged = { ...old, ...req.body };

    try {
      const stmt = db.prepare(`
        UPDATE vehicles 
        SET plateNumber = ?, ownerName = ?, phoneNumber = ?, fcExpiry = ?, permitExpiry = ?, insuranceExpiry = ?, nationalPermitExpiry = ?, pollutionExpiry = ?, taxExpiry = ?, greenTaxExpiry = ?, updatedAt = ?
        WHERE id = ?
      `);
      stmt.run(
        merged.plateNumber, 
        merged.ownerName, 
        merged.phoneNumber, 
        merged.fcExpiry, 
        merged.permitExpiry, 
        merged.insuranceExpiry, 
        merged.nationalPermitExpiry, 
        merged.pollutionExpiry, 
        merged.taxExpiry, 
        merged.greenTaxExpiry, 
        updatedAt, 
        id
      );
      res.json({ ...merged, updatedAt });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
    res.status(204).send();
  });

  // Tax Records
  app.get('/api/tax-records', (req, res) => {
    const records = db.prepare('SELECT * FROM tax_records ORDER BY createdAt DESC').all();
    res.json(records);
  });

  app.post('/api/tax-records', (req, res) => {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const { plateNumber, ownerName, phoneNumber, taxType, taxAmount, gt, information, paidDate, inDate, taxExpiry, taxPeriod } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO tax_records (id, plateNumber, ownerName, phoneNumber, taxType, taxAmount, gt, information, paidDate, inDate, taxExpiry, taxPeriod, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, plateNumber, ownerName, phoneNumber, taxType, taxAmount, gt, information, paidDate, inDate, taxExpiry, taxPeriod, createdAt, createdAt);
    res.status(201).json({ id, ...req.body, createdAt });
  });

  app.put('/api/tax-records/:id', (req, res) => {
    const { id } = req.params;
    const updatedAt = new Date().toISOString();
    
    // Fetch existing record to merge
    const old = db.prepare('SELECT * FROM tax_records WHERE id = ?').get(id) as any;
    if (!old) return res.status(404).json({ error: 'Not found' });

    const merged = { ...old, ...req.body };

    const stmt = db.prepare(`
      UPDATE tax_records 
      SET plateNumber = ?, ownerName = ?, phoneNumber = ?, taxType = ?, taxAmount = ?, gt = ?, information = ?, paidDate = ?, inDate = ?, taxExpiry = ?, taxPeriod = ?, updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.plateNumber, 
      merged.ownerName, 
      merged.phoneNumber, 
      merged.taxType, 
      merged.taxAmount, 
      merged.gt, 
      merged.information, 
      merged.paidDate, 
      merged.inDate, 
      merged.taxExpiry, 
      merged.taxPeriod, 
      updatedAt, 
      id
    );
    res.json({ id, ...merged, updatedAt });
  });

  app.delete('/api/tax-records/:id', (req, res) => {
    db.prepare('DELETE FROM tax_records WHERE id = ?').run(req.params.id);
    res.status(204).send();
  });

  // Billing
  app.get('/api/billing-records', (req, res) => {
    const records = db.prepare('SELECT * FROM billing_records ORDER BY createdAt DESC').all();
    res.json(records);
  });

  app.post('/api/billing-records', (req, res) => {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const { date, customerName, phoneNumber, vehicleNumber, serviceDescription, amount, paidAmount, pendingAmount, paymentStatus, paymentMode } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO billing_records (id, date, customerName, phoneNumber, vehicleNumber, serviceDescription, amount, paidAmount, pendingAmount, paymentStatus, paymentMode, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, date, customerName, phoneNumber, vehicleNumber, serviceDescription, amount, paidAmount, pendingAmount, paymentStatus, paymentMode, createdAt, createdAt);
    res.status(201).json({ id, ...req.body, createdAt });
  });

  app.put('/api/billing-records/:id', (req, res) => {
    const { id } = req.params;
    const updatedAt = new Date().toISOString();

    const old = db.prepare('SELECT * FROM billing_records WHERE id = ?').get(id) as any;
    if (!old) return res.status(404).json({ error: 'Not found' });

    const merged = { ...old, ...req.body };

    const stmt = db.prepare(`
      UPDATE billing_records 
      SET date = ?, customerName = ?, phoneNumber = ?, vehicleNumber = ?, serviceDescription = ?, amount = ?, paidAmount = ?, pendingAmount = ?, paymentStatus = ?, paymentMode = ?, updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.date, 
      merged.customerName, 
      merged.phoneNumber, 
      merged.vehicleNumber, 
      merged.serviceDescription, 
      merged.amount, 
      merged.paidAmount, 
      merged.pendingAmount, 
      merged.paymentStatus, 
      merged.paymentMode, 
      updatedAt, 
      id
    );
    res.json({ ...merged, updatedAt });
  });

  app.delete('/api/billing-records/:id', (req, res) => {
    db.prepare('DELETE FROM billing_records WHERE id = ?').run(req.params.id);
    res.status(204).send();
  });

  app.get('/api/search/:identifier', (req, res) => {
    const { identifier } = req.params;
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE plateNumber = ?').get(identifier);
    res.json(vehicle ? [vehicle] : []);
  });

  // Bulk Import
  app.post('/api/bulk-import/:type', (req, res) => {
    const { type } = req.params;
    const { rows } = req.body;
    const createdAt = new Date().toISOString();
    
    const insert = db.transaction((records) => {
      if (type === 'vehicles') {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO vehicles (
            id, plateNumber, ownerName, phoneNumber, fcExpiry, 
            insuranceExpiry, permitExpiry, nationalPermitExpiry, 
            pollutionExpiry, taxExpiry, greenTaxExpiry, createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of records) {
          const plate = String(row.plateNumber || '').toUpperCase();
          if (!plate) continue;
          
          const existing = db.prepare('SELECT id, createdAt FROM vehicles WHERE plateNumber = ?').get(plate) as any;
          const id = existing ? existing.id : uuidv4();
          const created = existing ? existing.createdAt : createdAt;
          
          stmt.run(
            id, plate, row.ownerName, String(row.phoneNumber || ''), 
            row.fcExpiry, row.insuranceExpiry, row.permitExpiry, 
            row.nationalPermitExpiry, row.pollutionExpiry, row.taxExpiry, 
            row.greenTaxExpiry, created, createdAt
          );
        }
      } else if (type === 'tax') {
        const stmt = db.prepare(`
          INSERT INTO tax_records (
            id, plateNumber, ownerName, phoneNumber, taxType, 
            taxAmount, gt, information, paidDate, inDate, 
            taxExpiry, taxPeriod, createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of records) {
          stmt.run(
            uuidv4(), String(row.plateNumber || '').toUpperCase(), row.ownerName, 
            row.phoneNumber, row.taxType, row.taxAmount, row.gt, 
            row.information, row.paidDate, row.inDate, row.taxExpiry, 
            row.taxPeriod, createdAt, createdAt
          );
        }
      } else if (type === 'billing') {
        const stmt = db.prepare(`
          INSERT INTO billing_records (
            id, date, customerName, phoneNumber, vehicleNumber, 
            serviceDescription, amount, paidAmount, pendingAmount, 
            paymentStatus, paymentMode, createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of records) {
          stmt.run(
            uuidv4(), row.date, row.customerName, row.phoneNumber, 
            String(row.vehicleNumber || '').toUpperCase(), row.serviceDescription, 
            Number(row.amount) || 0, Number(row.paidAmount) || 0, 
            Number(row.pendingAmount) || 0, row.paymentStatus || 'Pending', 
            row.paymentMode, createdAt, createdAt
          );
        }
      }
    });

    insert(rows);
    res.json({ success: true, count: rows.length });
  });

  // Settings
  app.get('/api/settings/:key', (req, res) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key) as any;
    res.json(row ? JSON.parse(row.value) : null);
  });

  app.post('/api/settings/:key', (req, res) => {
    const value = JSON.stringify(req.body);
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(req.params.key, value);
    res.json({ success: true });
  });

  app.post('/api/upload-logo', upload.single('logo'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ success: true, path: '/logo.png' });
  });

  // Serve static files from public
  app.use(express.static('public'));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Manual SQL Terminal Active at http://localhost:${PORT}`);
  });
}

startServer();
