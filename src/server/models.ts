/**
 * CampusConnect - MongoDB Mongoose Schemas & Models
 * Defines schemas for Customer, ServiceProvider, and Admin entities with role constraints,
 * verification statuses, and index validations.
 */

export interface ICustomerSchema {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProviderSchema {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'provider';
  serviceCategory: 'Electrician' | 'Plumber' | 'Laptop Repair' | 'Home Cleaning' | 'Tutor' | 'Laundry' | 'Carpenter';
  serviceArea: string;
  experienceYears: number;
  avatarUrl: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminSchema {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  department: string;
  avatarUrl?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const MONGOOSE_SCHEMA_DEFINITIONS = `
import mongoose, { Schema } from 'mongoose';

// 1. Customer Schema
export const CustomerSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer'], default: 'customer' },
  avatarUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// 2. Service Provider Schema
export const ProviderSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  businessName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['provider'], default: 'provider' },
  serviceCategory: {
    type: String,
    enum: ['Electrician', 'Plumber', 'Laptop Repair', 'Home Cleaning', 'Tutor', 'Laundry', 'Carpenter'],
    required: true
  },
  serviceArea: { type: String, required: true },
  experienceYears: { type: Number, required: true, min: 0 },
  avatarUrl: { type: String, default: '' },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationNotes: { type: String },
  rating: { type: Number, default: 0.0 },
  completedJobs: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 399 }
}, { timestamps: true });

// 3. Admin Schema
export const AdminSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
  department: { type: String, default: 'Platform Operations' },
  avatarUrl: { type: String, default: '' },
  lastLogin: { type: Date }
}, { timestamps: true });
`;
