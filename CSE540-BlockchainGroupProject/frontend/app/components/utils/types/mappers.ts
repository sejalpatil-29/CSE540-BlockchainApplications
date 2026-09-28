// This file contains the functions to normalize the data from the backend to the frontend

import type {
  CreateRegistrationTokenResponse,
  CompanyRowSnake,
  CreateTransferResponse,
  RevokeRegistrationTokenResponse,
  RevokeRegistrationTokenWireRow,
  UpdateCompanyResponse,
  UpdateUserProfileResponse,
} from "./api-contract";
import type { CompanyModel, TransferModel } from "./models";
import type { Uuid } from "./primitives";

export function normalizeTransfer(res: CreateTransferResponse) {
  return {
    ...res,
    senderUserId: res.senderUserID,
    receivingUserId: res.receivingUserID,
  };
}

export function normalizeCompany(response: CompanyRowSnake): CompanyModel {
  return {
    companyId: String(response.company_id) as Uuid,
    companyName: response.name,
    walletAddress: response.wallet_address ?? null,
    createdAt: response.created_at,
  };
}

export function normalizeUpdateCompanyResponse(body: UpdateCompanyResponse): CompanyModel {
  const c = body.company;
  return {
    companyId: String(c.companyId) as Uuid,
    companyName: c.companyName,
    walletAddress: c.walletAddress ?? null,
  };
}

export function normalizeRevokeTokenResponse(row: unknown): RevokeRegistrationTokenResponse {
  const r = row as RevokeRegistrationTokenWireRow;
  const id = r.registration_token_id ?? r.registrationTokenId;
  return {
    registrationTokenId: (id != null ? String(id) : "") as Uuid,
    status: r.status,
  };
}

export function normalizeCreateRegistrationTokenResponse(row: unknown): CreateRegistrationTokenResponse {
  const r = row as { registrationTokenId?: unknown; registration_token_id?: unknown; registrationToken?: string };
  const id = r.registrationTokenId ?? r.registration_token_id;
  return {
    registrationTokenId: (id != null ? String(id) : "") as Uuid,
    registrationToken: r.registrationToken ?? "",
  };
}

export function normalizeUpdateUserProfileResponse(row: unknown): UpdateUserProfileResponse {
  const r = row as UpdateUserProfileResponse & {
    user?: { userId?: unknown; firstName?: string; lastName?: string; role?: "user" | "manager" };
  };
  const user = r.user ?? {};
  return {
    user: {
      userId: (user.userId != null ? String(user.userId) : "") as Uuid,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      role: user.role ?? "user",
    },
  };
}

export function normalizeTransferList(rows: unknown): TransferModel[] {
  const list = (rows as TransferModel[]) ?? [];
  return list.map((row) => ({
    ...row,
    blockchain: row.blockchain ?? {
      status: null,
    },
  }));
}
