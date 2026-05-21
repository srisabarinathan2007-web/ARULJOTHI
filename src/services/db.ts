import Dexie, { Table } from 'dexie';
import { Vehicle, TaxRecord, BillingRecord } from '../types';

export class ArulJothiDB extends Dexie {
  vehicles!: Table<Vehicle>;
  taxRecords!: Table<TaxRecord>;
  billingRecords!: Table<BillingRecord>;

  constructor() {
    super('ArulJothiDB');
    this.version(1).stores({
      vehicles: 'id, plateNumber, ownerName, phoneNumber',
      taxRecords: 'id, plateNumber, ownerName, paidDate',
      billingRecords: 'id, date, vehicleNumber, customerName'
    });
  }
}

export const db = new ArulJothiDB();
