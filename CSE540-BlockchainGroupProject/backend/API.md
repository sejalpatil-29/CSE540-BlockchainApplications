# 🌾 Honest Harvest API Documentation

**Base URL:** `http://localhost:8080`

All endpoints accept and return JSON. For authenticated routes, pass the JWT as `"sessionToken"` in the body or `Authorization: Bearer <token>` in the headers. Identity is strictly derived from the validated token.

---

## 🏢 0. Utility, Admin & Company Management

### Create a Company

Creates a new organization in the supply chain network.

- **Endpoint:** `POST /company`
- **Auth Required:** No

**Request**

```json
{
  "name": "string"
}
```

**Response (201)**

```json
{
  "company_id": "uuid",
  "name": "string",
  "wallet_address": "0xABC123...",
  "created_at": "timestamp"
}
```

### Get Company Details

Fetches public details for a specific company.

- **Endpoint:** `GET /company/:companyId`
- **Auth Required:** No

**Response (200)**

```json
{
  "company_id": "uuid",
  "name": "string",
  "wallet_address": "0xABC123...",
  "created_at": "timestamp"
}
```

### Get All Companies

Retrieves a list of all registered companies.

- **Endpoint:** `GET /companies`
- **Auth Required:** No

**Response (200)**

```json
[
  {
    "company_id": "uuid",
    "name": "string",
    "wallet_address": "0xABC123...",
    "created_at": "timestamp"
  }
]
```

### Update Company Profile

Updates the name of the company (Managers only, limited to their own company).

- **Endpoint:** `PATCH /companies/:companyId`
- **Auth Required:** Yes (Manager)

**Request**

```json
{
  "name": "New Company Name"
}
```

**Response (200)**

```json
{
  "message": "Company profile updated successfully.",
  "company": {
    "companyId": "uuid",
    "companyName": "New Company Name",
    "walletAddress": "0xABC123..."
  }
}
```

### Super Admin: Create Manager Token

Bypasses manual SQL to instantly generate a manager registration token for a specific company (Internal Staff API).

- **Endpoint:** `POST /auth/admin/manager-token`
- **Auth Required:** No

**Request**

```json
{
  "companyId": "uuid",
  "userEmail": "admin@example.com"
}
```

**Response (201)**

```json
{
  "registrationTokenId": "uuid",
  "registrationToken": "hex-string"
}
```

### System Health Check

- **Endpoint:** `GET /`
- **Auth Required:** No

**Response (200)**

```text
The Honest Harvest API is running!
```

---

## 🔐 1. Users & Authentication

### Create Registration Token

Creates a secure token allowing a new user to join the manager's company.

- **Endpoint:** `POST /auth/registration-tokens`
- **Auth Required:** Yes (Manager)

**Request**

```json
{
  "userEmail": "new@example.com",
  "role": "user" 
}
```

*(Role can be "user" or "manager")*

**Response (201)**

```json
{
  "registrationTokenId": "uuid",
  "registrationToken": "hex-string"
}
```

### Revoke Registration Token

Invalidates a pending token.

- **Endpoint:** `POST /auth/registration-tokens/:id/revoke`
- **Auth Required:** Yes (Manager)

**Response (200)**

```json
{
  "registration_token_id": "uuid",
  "status": "revoked"
}
```

### Get Registration Token List

Retrieves all registration tokens for the manager's company.

- **Endpoint:** `GET /auth/registration-tokens/token-list`
- **Auth Required:** Yes (Manager)

**Response (200)**

```json
[
  {
    "tokenId": "uuid",
    "registrationToken": "hex-string",
    "email": "user@example.com",
    "companyId": "uuid",
    "companyName": "string",
    "role": "user",
    "status": "pending",
    "createdAt": "timestamp",
    "createdById": "uuid",
    "createdByName": "string"
  }
]
```

### Get Registration Token Details

Public lookup to pre-fill registration forms.

- **Endpoint:** `POST /auth/registration-tokens/token`
- **Auth Required:** No

**Request**

```json
{
  "registrationToken": "hex-string"
}
```

**Response (200)**

```json
{
  "tokenId": "uuid",
  "registrationToken": "hex-string",
  "email": "user@example.com",
  "companyId": "uuid",
  "companyName": "string",
  "role": "user",
  "status": "pending",
  "createdAt": "timestamp",
  "createdById": "uuid",
  "createdByName": "string"
}
```

### Register User

Consumes a pending token to create a user account.

- **Endpoint:** `POST /auth/register`
- **Auth Required:** No

**Request**

```json
{
  "registrationToken": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Response (201)**

```json
{
  "message": "Registration successful."
}
```

### User Login

Authenticates credentials (email is case-insensitive) and returns the JWT.

- **Endpoint:** `POST /auth/login`
- **Auth Required:** No

**Request**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response (200)**

```json
{
  "sessionToken": "jwt-string",
  "expiresIn": "24 hours",
  "user": {
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "user@example.com",
    "role": "manager"
  },
  "company": {
    "companyId": "uuid",
    "companyName": "string",
    "walletAddress": "0xABC123..."
  }
}
```

### User Logout

Ends a user session (client-side token deletion).

- **Endpoint:** `POST /auth/logout`
- **Auth Required:** Yes

**Response (200)**

```json
{
  "message": "Logged out successfully"
}
```

### Update User Profile

Updates basic profile information (self-edit only).

- **Endpoint:** `PATCH /users/:userId`
- **Auth Required:** Yes

**Request**

```json
{
  "firstName": "NewFirst",
  "lastName": "NewLast"
}
```

**Response (200)**

```json
{
  "user": {
    "userId": "uuid",
    "firstName": "NewFirst",
    "lastName": "NewLast",
    "role": "user"
  }
}
```

---

## 📦 2. Core Supply Chain (Batches)

### Register a New Batch

Introduces a product lot and prepares blockchain interaction.

- **Endpoint:** `POST /batches`
- **Auth Required:** Yes

**Request**

```json
{
  "batchName": "string",
  "batchDescription": "string",
  "sourceBatchIds": ["uuid1", "uuid2"]
}
```

**Response (201)**

```json
{
  "batchId": "uuid",
  "batchName": "string",
  "batchDescription": "string",
  "createdAt": "timestamp",
  "blockchain": {
    "transactionId": "tx-hash-string",
    "status": "confirmed",
    "dataHash": "hash-string"
  }
}
```

### Get Batch List

Retrieves all batches owned by the authenticated user's company.

- **Endpoint:** `GET /batches`
- **Auth Required:** Yes

**Response (200)**

```json
[
  {
    "batchId": "uuid",
    "batchName": "string",
    "batchDescription": "string",
    "createdAt": "timestamp",
    "registeringCompanyId": "uuid",
    "registeringCompanyName": "string",
    "registeringUserId": "uuid",
    "registeringUserName": "string",
    "sourceBatchIds": ["uuid", "uuid"],
    "blockchain": {
      "transactionId": "tx-id",
      "status": "confirmed",
      "dataHash": "hash"
    }
  }
]
```

### Get Batch Details

Public lookup for a specific batch.

- **Endpoint:** `GET /batches/:batchId`
- **Auth Required:** No

**Response (200)**

```json
{
  "batchId": "uuid",
  "batchName": "string",
  "batchDescription": "string",
  "createdAt": "timestamp",
  "registeringCompanyId": "uuid",
  "registeringCompanyName": "string",
  "registeringUserId": "uuid",
  "registeringUserName": "string",
  "sourceBatchIds": ["uuid", "uuid"],
  "blockchain": {
    "transactionId": "tx-id",
    "status": "confirmed",
    "dataHash": "hash"
  }
}
```

---

## 🚚 3. Transfers

### Initiate Transfer

Creates a pending request to move a batch. Locks the batch.

- **Endpoint:** `POST /transfers`
- **Auth Required:** Yes (Sender)

**Request**

```json
{
  "batchId": "uuid",
  "toCompanyId": "uuid",
  "receivingUserId": "uuid"
}
```

**Response (201)**

```json
{
  "transferId": "uuid",
  "batchId": "uuid",
  "fromCompanyId": "uuid",
  "toCompanyId": "uuid",
  "senderUserId": "uuid",
  "receivingUserId": "uuid",
  "createdAt": "timestamp",
  "status": "pending"
}
```

### Get Transfer List

Fetches transfers involving the authenticated user's company.

- **Endpoint:** `GET /transfers`
- **Auth Required:** Yes

**Response (200)**

```json
[
  {
    "transferId": "uuid",
    "batchId": "uuid",
    "batchName": "string",
    "fromCompanyId": "uuid",
    "fromCompanyName": "string",
    "toCompanyId": "uuid",
    "toCompanyName": "string",
    "senderUserId": "uuid",
    "senderUserName": "string",
    "receivingUserId": "uuid",
    "receivingUserName": "string",
    "status": "pending",
    "createdAt": "timestamp"
  }
]
```

### Complete Transfer

Finalizes transfer, shifts ownership, triggers smart contract.

- **Endpoint:** `POST /transfers/:transferId/complete`
- **Auth Required:** Yes (Receiver)

**Response (200)**

```json
{
  "message": "Accepted Transfer."
}
```

### Reject Transfer

Declines transfer, unlocking the batch for the sender.

- **Endpoint:** `POST /transfers/:transferId/reject`
- **Auth Required:** Yes (Receiver)

**Response (200)**

```json
{
  "message": "Rejected Transfer."
}
```

---

## 🗺️ API Architecture Flow

```mermaid
graph LR
    classDef endpoint fill:#2b3a42,stroke:#5c8397,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef db fill:#fdfd96,stroke:#ffb347,stroke-width:2px,color:#333,shape:cylinder;

    DB_COMP[(Companies DB)]:::db
    DB_USER[(Users/Tokens DB)]:::db
    DB_CHAIN[(Supply Chain DB)]:::db

    subgraph Company_Management [🏢 Companies & System]
        direction LR
        C_API["POST /company<br>GET /company/:id<br>GET /companies<br>PATCH /companies/:companyId<br>GET / (Health Check)"]:::endpoint --> DB_COMP
    end

    subgraph Token_Management [🔑 Token Management]
        direction LR
        T_API["POST /auth/registration-tokens<br>POST .../:id/revoke<br>GET .../token-list<br>POST /auth/admin/manager-token"]:::endpoint --> DB_USER
    end

    subgraph User_Auth [🔐 Users & Authentication]
        direction LR
        U_API["POST /auth/register<br>POST /auth/login<br>POST /auth/logout<br>PATCH /users/:userId<br>POST .../token (Lookup)"]:::endpoint --> DB_USER
    end

    subgraph Supply_Chain [📦 Batches]
        direction LR
        B_API["POST /batches<br>GET /batches<br>GET /batches/:batchId"]:::endpoint --> DB_CHAIN
    end

    subgraph Transfer_Flow [🚚 Transfers]
        direction LR
        TR_API["POST /transfers<br>GET /transfers<br>POST .../:id/complete<br>POST .../:id/reject"]:::endpoint --> DB_CHAIN
    end
```