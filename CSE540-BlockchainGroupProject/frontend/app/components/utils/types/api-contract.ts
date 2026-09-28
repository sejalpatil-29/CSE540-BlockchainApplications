// This file contains the API object types for the frontend to use

import type {
  BatchBlockchainStatus,
  ISODateString,
  Role,
  TransferLifecycleStatus,
  Uuid,
} from "./primitives";
import type { BatchModel, CompanyModel, TransferModel, UserModel } from "./models";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  sessionToken: string;
  expiresIn: string | number;
  user: UserModel;
  company: CompanyModel;
}

export interface CreateRegistrationTokenRequest {
  userEmail: string;
  role: Role;
}

export interface CreateRegistrationTokenResponse {
  registrationTokenId: Uuid;
  registrationToken: string;
}

export interface RegisterUserRequest {
  registrationToken: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateCompanyAdminTokenRequest {
  companyId: Uuid;
  userEmail: string;
}

export interface RevokeRegistrationTokenWireRow {
  registration_token_id?: string | number;
  registrationTokenId?: string | number;
  status: string;
}

export interface RevokeRegistrationTokenResponse {
  registrationTokenId: Uuid;
  status: string;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateUserProfileResponse {
  user: Pick<UserModel, "userId" | "firstName" | "lastName" | "role">;
}

export interface CompanyRowSnake {
  company_id: Uuid;
  name: string;
  wallet_address: string | null;
  created_at: ISODateString;
}

export interface UpdateCompanyResponse {
  message: string;
  company: Pick<CompanyModel, "companyId" | "companyName" | "walletAddress">;
}

export interface CreateCompanyRequest {
  name: string;
}

export interface UpdateCompanyRequest {
  name: string;
  walletAddress: string | null;
}

export interface CreateBatchRequest {
  batchName: string;
  batchDescription: string;
  sourceBatchIds: Uuid[];
}

export interface CreateBatchResponse {
  batchId: Uuid;
  batchName: string;
  batchDescription: string;
  createdAt: ISODateString;
  blockchain: {
    blockchainBatchId: number | null;
    transactionId: string | null;
    status: BatchBlockchainStatus;
  };
}

export type BatchListResponse = BatchModel[];
export type BatchDetailResponse = BatchModel;

export interface CreateTransferRequest {
  batchId: Uuid;
  toCompanyId: Uuid;
  receivingUserID: Uuid;
}

export interface CreateTransferResponse {
  transferId: Uuid;
  batchId: Uuid;
  fromCompanyId: Uuid;
  toCompanyId: Uuid;
  senderUserID: Uuid;
  receivingUserID: Uuid;
  createdAt: ISODateString;
  status: TransferLifecycleStatus;
  blockchain: {
    status?: BatchBlockchainStatus;
    dataHash: string | null;
  };
}

export type TransferListResponse = TransferModel[];

export interface MessageResponse {
  message: string;
}

export interface LineageEdge {
  sourceBatchId: Uuid;
  derivedBatchId: Uuid;
}

export interface SupplyChainHistoryResponse {
  batches: BatchModel[];
  lineageEdges: LineageEdge[];
  transfers: TransferModel[];
}