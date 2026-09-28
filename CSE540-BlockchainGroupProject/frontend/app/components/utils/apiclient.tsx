import type {
    BatchListResponse,
    CompanyRowSnake,
    CreateBatchRequest,
    CreateBatchResponse,
    CreateCompanyAdminTokenRequest,
    CreateRegistrationTokenRequest,
    CreateRegistrationTokenResponse,
    CreateTransferRequest,
    CreateTransferResponse,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterUserRequest,
    RevokeRegistrationTokenResponse,
    SupplyChainHistoryResponse,
    UpdateCompanyRequest,
    UpdateCompanyResponse,
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
} from "./types/api-contract";
import type { Uuid } from "./types/primitives";
import {
    normalizeCreateRegistrationTokenResponse,
    normalizeRevokeTokenResponse,
    normalizeCompany,
    normalizeTransferList,
    normalizeUpdateCompanyResponse,
    normalizeUpdateUserProfileResponse,
} from "./types/mappers";
import type { BatchModel, CompanyModel, RegistrationTokenModel, TransferModel } from "./types/models";

const API = "http://localhost:8080";

export const RegistrationTokenAPI = {
    // Create a new registration token for a user
    generateToken: async (sessionToken: string, request: CreateRegistrationTokenRequest): Promise<CreateRegistrationTokenResponse> => {
        const response = await fetch(`${API}/auth/registration-tokens`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Failed to generate registration token");

        return normalizeCreateRegistrationTokenResponse(await response.json());
    },

    // Revoke a registration token
    revokeToken: async (sessionToken: string, tokenId: Uuid): Promise<RevokeRegistrationTokenResponse> => {
        const response = await fetch(`${API}/auth/registration-tokens/${tokenId}/revoke`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to revoke registration token");

        return normalizeRevokeTokenResponse(await response.json());
    },

    // Get the values of a registration token
    getTokenValues: async (token: string): Promise<RegistrationTokenModel> => {
        const response = await fetch(`${API}/auth/registration-tokens/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationToken: token }),
        });

        if (!response.ok) throw new Error("Could not verify registration code.");
        
        return response.json();
    },

    // Get the values of a registration token
    getTokenListDev: async (companyId: string): Promise<RegistrationTokenModel[]> => {
        const response = await fetch(`${API}/auth/registration-tokens/token-list-dev/${companyId}`, {
            method: "GET"
        });

        if (!response.ok) throw new Error("Could not fetch registration tokens.");
        
        return response.json();
    },

    // Get the list of registration tokens for a company
    getTokenList: async (sessionToken: string): Promise<RegistrationTokenModel[]> => {
        const response = await fetch(`${API}/auth/registration-tokens/token-list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to fetch registration token list");

        return (await response.json()) as RegistrationTokenModel[];
    },

    // Consume a registration token to create a new user
    consumeToken: async (request: RegisterUserRequest): Promise<MessageResponse> => {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Registration failed.");
        return response.json();
    },

    // Create a new company
    createCompany: async (companyName: string): Promise<CompanyModel> => {
        const response = await fetch(`${API}/company`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: companyName}),
        });

        if (!response.ok) throw new Error("Could not create a new company");

        const row = await response.json();
        return normalizeCompany(row as CompanyRowSnake);
    },

    // Get the list of all companies
    getAllCompanies: async (): Promise<CompanyModel[]> => {
        const response = await fetch(`${API}/companies`, {
            method: "GET",
        });

        if (!response.ok) throw new Error("Could not retreive company list");
        
        const rows = (await response.json()) as CompanyRowSnake[];
        return rows.map((row) => normalizeCompany(row));
    },
    
    // Create a new company admin token
    createCompanyAdminToken: async (request: CreateCompanyAdminTokenRequest): Promise<CreateRegistrationTokenResponse> => {
        const response = await fetch(`${API}/auth/admin/manager-token`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Could not create a new company");

        return normalizeCreateRegistrationTokenResponse(await response.json());
    },
    
};

export const AuthAPI = {
    // Login a user
    login: async (request: LoginRequest): Promise<LoginResponse> => {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Login failed");

        return response.json();
    },
};

export const UserAPI = {
    // Update a user's profile
    updateProfile: async (sessionToken: string, userId: Uuid, body: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> => {
        const response = await fetch(`${API}/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error("Profile update failed");
        return normalizeUpdateUserProfileResponse(await response.json());
    },
};

export const CompanyAPI = {
    // Update a company's profile - NOT YET IMPLEMENTED ON THE BACKEND
    updateCompany: async (
        sessionToken: string,
        companyId: Uuid,
        body: UpdateCompanyRequest
    ): Promise<CompanyModel> => {
        const response = await fetch(`${API}/companies/${companyId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) throw new Error("Company update failed");

        const data = await response.json();
        return normalizeUpdateCompanyResponse(data);
    },
};

export const BatchAPI = {
    // Register a new batch
    registerBatch: async (sessionToken: string, request: CreateBatchRequest): Promise<CreateBatchResponse> => {
        const response = await fetch(`${API}/batches`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("Failed to register batch");

        return response.json();
    },

    // Get the list of all batches
    getBatchList: async (sessionToken: string): Promise<BatchListResponse> => {
        const response = await fetch(`${API}/batches`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to fetch batch list");

        return response.json();

    },

    // Get a batch by its ID
    getBatchById: async (id: Uuid): Promise<BatchModel> => {
        const response = await fetch(`${API}/batches/${id}`, {
            method: "GET"
        });

        if (!response.ok) throw new Error("Failed to fetch batch list");

        return response.json();

    },

    // Get the supply chain history of a batch
    getSupplyChainHistory: async (id: Uuid): Promise<SupplyChainHistoryResponse> => {
        const response = await fetch(`${API}/batchhistory/${id}`, {
            method: "GET",
        });

        if (!response.ok) throw new Error("Failed to fetch supply chain history");

        return response.json();
    },
};

export const TransferBatchAPI = {
    // Initiate a new transfer
    initiateTransfer: async (sessionToken: string, request: CreateTransferRequest): Promise<CreateTransferResponse> => {
        const response = await fetch(`${API}/transfers`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${sessionToken}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) throw new Error("Failed to initiate transfer");

        return response.json();
    },

    // Get the list of all transfers
    getTransferList: async (sessionToken: string): Promise<TransferModel[]> => {
        const response = await fetch(`${API}/transfers`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        }); 

        if (!response.ok) throw new Error("Failed to fetch transfer list");

        return normalizeTransferList(await response.json());
    },

    // Accept a transfer
    acceptTransfer: async (sessionToken: string, transferId: Uuid): Promise<MessageResponse> => {
        const response = await fetch(`${API}/transfers/${transferId}/complete`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to accept transfer");
        
        return response.json();
    },

    // Reject a transfer
    rejectTransfer: async (sessionToken: string, transferId: Uuid): Promise<MessageResponse> => {
        const response = await fetch(`${API}/transfers/${transferId}/reject`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sessionToken}`
            },
        });

        if (!response.ok) throw new Error("Failed to reject transfer");
        
        return response.json();
    },
};
