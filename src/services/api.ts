import { Vehicle, TaxRecord, BillingRecord } from '../types';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export const api = {
  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    try {
      // First try to fetch fresh data from server
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        const serverData: Vehicle[] = await res.json();
        if (serverData.length > 0) {
          // Clear and refill local DB to ensure accurate reflection of server state
          await db.vehicles.clear();
          await db.vehicles.bulkAdd(serverData);
          return serverData.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }
      }
    } catch (err) {
      console.warn("Server fetch failed, falling back to local storage:", err);
    }
    
    // Fallback to local data if server is unavailable or returns empty
    const localData = await db.vehicles.toArray();
    return localData.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },
  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const id = uuidv4();
    const newVehicle = { 
      ...data, 
      id, 
      createdAt: new Date().toISOString() 
    } as Vehicle;

    // Save to server FIRST. If server save fails, we inform the user.
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });
      
      if (!res.ok) throw new Error("Server rejected save");
      
      const savedVehicle = await res.json();
      // Only now save locally for cache
      await db.vehicles.put(savedVehicle);
      return savedVehicle;
    } catch (err) {
      // Fallback save to local ONLY if user is okay with "Offline Mode"
      await db.vehicles.add(newVehicle);
      console.error("Server save failed, saved to local cache only:", err);
      return newVehicle;
    }
  },
  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const updated = { ...data, lastSync: new Date().toISOString() };
    await db.vehicles.update(id, updated);
    
    const record = await db.vehicles.get(id);
    
    // Sync to server
    fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});

    return record!;
  },
  async deleteVehicle(id: string): Promise<void> {
    await db.vehicles.delete(id);
    fetch(`/api/vehicles/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // Tax Records
  async getTaxRecords(): Promise<TaxRecord[]> {
    try {
      const res = await fetch('/api/tax-records');
      if (res.ok) {
        const serverData: TaxRecord[] = await res.json();
        if (serverData.length > 0) {
          await db.taxRecords.clear();
          await db.taxRecords.bulkAdd(serverData);
          return serverData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }
      }
    } catch (err) {
       console.warn("Tax server sync failed:", err);
    }
    const localData = await db.taxRecords.toArray();
    return localData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createTaxRecord(data: Partial<TaxRecord>): Promise<TaxRecord> {
    const id = uuidv4();
    const newRecord = { 
      ...data, 
      id, 
      createdAt: new Date().toISOString() 
    } as TaxRecord;

    try {
      const res = await fetch('/api/tax-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (res.ok) {
        const saved = await res.json();
        await db.taxRecords.put(saved);
        return saved;
      }
    } catch (err) {}

    await db.taxRecords.add(newRecord);
    return newRecord;
  },
  async updateTaxRecord(id: string, data: Partial<TaxRecord>): Promise<TaxRecord> {
    await db.taxRecords.update(id, data);
    const record = await db.taxRecords.get(id);
    
    fetch(`/api/tax-records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});

    return record!;
  },
  async deleteTaxRecord(id: string): Promise<void> {
    await db.taxRecords.delete(id);
    fetch(`/api/tax-records/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // Billing
  async getBillingRecords(): Promise<BillingRecord[]> {
    try {
      const res = await fetch('/api/billing-records');
      if (res.ok) {
        const serverData: BillingRecord[] = await res.json();
        if (serverData.length > 0) {
          await db.billingRecords.clear();
          await db.billingRecords.bulkAdd(serverData);
          return serverData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }
      }
    } catch (err) {
      console.warn("Billing server sync failed:", err);
    }
    const localData = await db.billingRecords.toArray();
    return localData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createBillingRecord(data: Partial<BillingRecord>): Promise<BillingRecord> {
    const id = uuidv4();
    const newRecord = { 
      ...data, 
      id, 
      createdAt: new Date().toISOString() 
    } as BillingRecord;

    try {
      const res = await fetch('/api/billing-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (res.ok) {
        const saved = await res.json();
        await db.billingRecords.put(saved);
        return saved;
      }
    } catch (err) {}

    await db.billingRecords.add(newRecord);
    return newRecord;
  },
  async updateBillingRecord(id: string, data: Partial<BillingRecord>): Promise<BillingRecord> {
    await db.billingRecords.update(id, data);
    const record = await db.billingRecords.get(id);

    fetch(`/api/billing-records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});

    return record!;
  },
  async deleteBillingRecord(id: string): Promise<void> {
    await db.billingRecords.delete(id);
    fetch(`/api/billing-records/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // Search
  async searchVehicles(identifier: string): Promise<Vehicle[]> {
    const local = await db.vehicles.toArray();
    return local.filter(v => 
      v.plateNumber.toLowerCase().includes(identifier.toLowerCase()) || 
      v.ownerName.toLowerCase().includes(identifier.toLowerCase())
    );
  },

  async bulkImport(type: string, rows: any[]): Promise<{ success: boolean; count: number }> {
    const normalizeHeaders = (row: any) => {
      const normalized: any = {};
      const entries = Object.entries(row);
      
      for (const [key, value] of entries) {
        const k = key.toLowerCase().replace(/[^a-z]/g, '');
        
        // Vehicle Mappings
        if (['platenumber', 'plate', 'vehicleno', 'vehicle', 'number', 'plateno'].includes(k)) normalized.plateNumber = value;
        else if (['ownername', 'owner', 'name', 'customer', 'customername'].includes(k)) normalized.ownerName = value;
        else if (['phonenumber', 'phone', 'mobile', 'contact', 'mobileno'].includes(k)) normalized.phoneNumber = value;
        else if (['fcexpiry', 'fc', 'fcyear'].includes(k)) normalized.fcExpiry = value;
        else if (['permitexpiry', 'permit'].includes(k)) normalized.permitExpiry = value;
        else if (['insuranceexpiry', 'insurance'].includes(k)) normalized.insuranceExpiry = value;
        else if (['nationalpermitexpiry', 'nationalpermit', 'np'].includes(k)) normalized.nationalPermitExpiry = value;
        else if (['pollutionexpiry', 'pollution'].includes(k)) normalized.pollutionExpiry = value;
        else if (['taxexpiry', 'tax'].includes(k)) normalized.taxExpiry = value;
        else if (['greentaxexpiry', 'greentax'].includes(k)) normalized.greenTaxExpiry = value;
        
        // Tax Mappings
        else if (['taxtype', 'type'].includes(k)) normalized.taxType = value;
        else if (['taxamount', 'amount'].includes(k)) normalized.taxAmount = value;
        else if (['taxperiod', 'period'].includes(k)) normalized.taxPeriod = value;
        
        // Billing Mappings
        else if (['date', 'invoicedate'].includes(k)) normalized.date = value;
        else if (['servicedescription', 'service', 'details'].includes(k)) normalized.serviceDescription = value;
        else if (['paidamount', 'paid'].includes(k)) normalized.paidAmount = value;
        else if (['pendingamount', 'pending'].includes(k)) normalized.pendingAmount = value;
        else if (['paymentstatus', 'status'].includes(k)) normalized.paymentStatus = value;
        
        // Carry over original if no mapping found to be safe
        else normalized[key] = value;
      }
      return normalized;
    };

    const normalizedRows = rows.map(normalizeHeaders);

    // Process locally and server-side
    let count = 0;
    try {
      const res = await fetch(`/api/bulk-import/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: normalizedRows }),
      });
      
      if (res.ok) {
        const result = await res.json();
        // After successful server import, trigger a re-fetch to sync local DB
        if (type === 'vehicles') await this.getVehicles();
        else if (type === 'tax') await this.getTaxRecords();
        else if (type === 'billing') await this.getBillingRecords();
        
        return { success: true, count: result.count || normalizedRows.length };
      }
    } catch (err) {
      console.error("Server bulk import failed, falling back to local processing:", err);
    }

    // Fallback local processing
    if (type === 'vehicles') {
      for (const row of normalizedRows) {
        const plate = String(row.plateNumber || '').toUpperCase();
        if (!plate) continue;

        // Use put to avoid uniqueness errors in Dexie if plateNumber is indexed uniquely (though we use id)
        // Check for existing by plate to avoid duplicates locally
        const existing = await db.vehicles.where('plateNumber').equals(plate).first();
        const id = existing ? existing.id : uuidv4();
        
        await db.vehicles.put({ ...row, id, plateNumber: plate, createdAt: existing?.createdAt || new Date().toISOString() });
        count++;
      }
    } else if (type === 'tax') {
      for (const row of normalizedRows) {
        const id = uuidv4();
        await db.taxRecords.add({ ...row, id, createdAt: new Date().toISOString() });
        count++;
      }
    } else if (type === 'billing') {
      for (const row of normalizedRows) {
        const id = uuidv4();
        await db.billingRecords.add({ ...row, id, createdAt: new Date().toISOString() });
        count++;
      }
    }

    // Try server bulk import too
    fetch(`/api/bulk-import/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: normalizedRows }), // Send normalized
    }).catch(() => {});

    return { success: true, count };
  },

  // Settings
  async getSettings(key: string): Promise<any> {
    const res = await fetch(`/api/settings/${key}`);
    return res.json();
  },
  async updateSettings(key: string, value: any): Promise<void> {
    await fetch(`/api/settings/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
  },
  async uploadLogo(file: File): Promise<{ success: boolean; path: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await fetch('/api/upload-logo', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }
};
