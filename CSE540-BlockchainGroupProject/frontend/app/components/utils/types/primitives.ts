// This file contains the basic types for the frontend to use

export type Uuid = string;

export type ISODateString = string;

export type Role = "user" | "manager";

export type RegistrationTokenStatus = "pending" | "used" | "revoked";

export type BatchBlockchainStatus = "pending" | "confirmed" | "failed";

export type TransferLifecycleStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed";

export type TransferBlockchainStatus =
  | "pending approval"
  | "approved"
  | "rejected"
  | "transfer complete"
  | "transfer failed";

export interface BatchBlockchainInfo {
  blockchainBatchId?: number | null;
  transactionId: string | null;
  status: BatchBlockchainStatus;
  dataHash?: string | null;
}

export interface TransferBlockchainInfo {
  status?: TransferBlockchainStatus | null;
  dataHash?: string | null;
}

export interface JwtPayload {
  userId: Uuid;
  companyId: Uuid;
  role: Role;
  iat?: number;
  exp?: number;
}
