export interface Vehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  phoneNumber: string;
  fcExpiry?: string;
  permitExpiry?: string;
  insuranceExpiry?: string;
  nationalPermitExpiry?: string;
  pollutionExpiry?: string;
  taxExpiry?: string;
  greenTaxExpiry?: string;
  createdAt?: string;
  lastReminderSent?: string;
  lastSync?: string;
}

export interface TaxRecord {
  id: string;
  plateNumber: string;
  ownerName: string;
  phoneNumber: string;
  taxType: string;
  taxAmount: string;
  gt: string;
  information: string;
  paidDate: string;
  inDate: string;
  taxExpiry: string;
  taxPeriod: string;
  createdAt: string;
}

export interface BillingRecord {
  id: string;
  date: string;
  customerName: string;
  phoneNumber: string;
  vehicleNumber: string;
  serviceDescription: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  createdAt: string;
}
