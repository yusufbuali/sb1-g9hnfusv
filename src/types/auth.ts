import { Database } from './supabase';

export type UserRole = 'admin' | 'registration' | 'forensics' | 'forensics_head';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Person {
  name: string;
  cprNo: string;
  passportNo: string;
  gender: string;
  nationality: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'completed';
  priority: 'normal' | 'urgent';
  createdAt: string;
  assignedTo?: string;
  department?: string;
  personName?: string;
  receivedDate?: string;
  persons?: Person[];
}