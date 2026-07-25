export type UserRole = 'ADMIN' | 'MEMBER';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: LeadStatus;
  assignedTo: User | null;
  priority: LeadPriority;
  tags: string[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  leadId: string;
  userId: User;
  message: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  leadId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
