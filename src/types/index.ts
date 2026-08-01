export type Appointment = {
  id: string;
  date: string;
  clientId: string;
  serviceId: string;
  userId?: string;
  staffId?: string;
  companyId?: string;
  status: string;
  price?: number;
  client?: { name: string; phone?: string };
  service?: { name: string; price: number };
};

export type Client = {
  id: string;
  companyId?: string;
  name: string;
  phone?: string;
  email?: string;
};

export type Service = {
  id: string;
  companyId?: string;
  name: string;
  price: number;
  cost?: number;
  duration?: number;
};

export type Staff = {
  id: string;
  companyId?: string;
  name: string;
  commissionRate: number;
  customHours?: Record<string, any>;
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type CashRegister = {
  id: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  initialValue: number;
  finalValue?: number;
  operatorId: string;
};

export type Transaction = {
  id: string;
  type: 'INFLOW' | 'OUTFLOW';
  amount: number;
  paymentMethod: 'PIX' | 'CREDIT' | 'DEBIT' | 'CASH';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  appointmentId?: string;
  expenseId?: string;
  cashRegisterId?: string;
  createdAt: string;
};

export type CashSummary = {
  pix: number;
  credit: number;
  debit: number;
  cash: number;
  totalInflow: number;
  totalOutflow: number;
  net: number;
  openRegister: boolean;
};

export type Commission = {
  id: string;
  staffId: string;
  appointmentId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  createdAt: string;
};

export type AutomationJob = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  scheduledFor: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
};

