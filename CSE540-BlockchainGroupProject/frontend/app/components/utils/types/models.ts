// THis files contains all basic object models for the frontend to use

import type {
  BatchBlockchainStatus,
  ISODateString,
  RegistrationTokenStatus,
  Role,
  TransferBlockchainInfo,
  TransferLifecycleStatus,
  Uuid,
} from "./primitives";

export interface UserModel {
  userId: Uuid;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface CompanyModel {
  companyId: Uuid;
  companyName: string;
  walletAddress: string | null;
  createdAt?: ISODateString;
}

export interface RegistrationTokenModel {
  tokenId: Uuid;
  registrationToken: string;
  email: string;
  companyId: Uuid;
  companyName: string;
  role: Role;
  status: RegistrationTokenStatus;
  createdAt: ISODateString;
  createdById: Uuid | null;
  createdByName: string | null;
}

export interface BatchModel {
  batchId: Uuid;
  batchName: string;
  batchDescription: string;
  createdAt: ISODateString;
  registeringCompanyId: Uuid;
  registeringCompanyName: string;
  registeringUserId: Uuid;
  registeringUserName: string;
  currentCompanyId?: Uuid;
  currentCompanyName?: string;
  varifiedDataOnChain?: boolean;
  sourceBatchIds?: Uuid[];
  blockchain: {
    blockchainBatchId: number | null;
    transactionId: string | null;
    status: BatchBlockchainStatus;
    dataHash: string | null;
  };
}

export interface TransferModel {
  transferId: Uuid;
  batchId: Uuid;
  batchName: string;
  fromCompanyId: Uuid;
  fromCompanyName: string;
  toCompanyId: Uuid;
  toCompanyName: string;
  senderUserId: Uuid;
  senderUserName: string;
  receivingUserId: Uuid | null;
  receivingUserName: string | null;
  varifiedTransferOnChain?: boolean;
  status: TransferLifecycleStatus;
  blockchain: TransferBlockchainInfo;
  createdAt: ISODateString;
}

/** Minimal fields embedded in batch QR codes (keeps payload small). */
export interface BatchQrModel {
  batchId: Uuid;
  batchName: string;
  batchDescription: string | null;
  currentCompanyName?: string;
  blockchainStatus: BatchBlockchainStatus;
}

export interface RecipientQrModel {
  userId: Uuid;
  firstName: string | null;
  lastName: string | null;
  companyId: Uuid;
  companyName: string;
  walletAddress: string | null;
}

export interface TransferQrPayload {
  batch: BatchQrModel;
  recipient: RecipientQrModel;
}
