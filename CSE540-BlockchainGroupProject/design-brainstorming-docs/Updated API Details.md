# Honest Harvest API Documentation

**Base URL:** `http://localhost:8080`

All endpoints accept and return JSON.

---

## Session Token

All authenticated endpoints require the JWT Session Token in the headers as: `Authorization: Bearer <your_token>`.

### Behavior
- JWT is validated on every request (signature + expiration)
- Payload is decoded and injected into request context
- Used for:
  - Authorization (role checks)
  - Data scoping (company isolation)

**Internal Contents**
```json
{
  "userId": "uuid",
  "companyId": "uuid",
  "role": "user | manager",
  "iat": number,
  "exp": number
}
```

---

## 1. Users & Authentication

---

### Create Registration Token
Creates a registration token that allows a new user to join a company. Only managers can generate tokens.

* **Endpoint:** `POST /auth/registration-tokens`
* **Auth Required:** Yes (Manager)


#### Internal Behavior
- Validates caller role is `manager`
- Validates email format
- Generates secure random token
- Stores token in registration_tokens table with:
  - email
  - role
  - companyId
  - status = `pending`
- Invalidates "pending" registration tokens previously assigned to the target email
- Optional: sends invitation email

**Request**
Authorization: Bearer <sessionToken>
```json
{
  "userEmail": string,
  "role": "user | manager"
}
```

**Response (201)**
```json
{
  "registrationTokenId": "uuid",
  "registrationToken": string
}
```

---

### Revoke Registration Token
Invalidates a registration token so it can no longer be used.

* **Endpoint:** `POST /auth/registration-tokens/:id/revoke`
* **Auth Required:** Yes (Manager)

#### Internal Behavior
- Validates manager role
- Ensures registration token exists and is not already used
- Updates status → revoked

**Request**
Authorization: Bearer <sessionToken>

**Response (200)**
```json
{
  "registrationTokenId": "uuid",
  "status": "revoked"
}
```

---

### Get Registration Token List
Retrieves all registration tokens for a company.

* **Endpoint:** `GET /auth/registration-tokens/token-list`
* **Auth Required:** Yes (Manager)

#### Internal Behavior
- Returns all token data by companyId

**Request**
Authorization: Bearer <sessionToken>

**Response (200)**
```json
[
  {
    "tokenId": "uuid",
    "registrationToken": string,
    "userId": "uuid",
    "email": string,
    "companyId": "uuid",
    "companyName": string,
    "role": "user | manager",
    "status": "pending | used | revoked",
    "createdAt": string,
    "createdById": "uuid",
    "createdByName": string
  }
]
```

---

### Get Registration Token
Returns information tied to a registration token for pre-filling user registration.

* **Endpoint:** `POST /auth/registration-tokens/token`
* **Auth Required:** No

#### Internal Behavior
- Validates token exists and is pending
- Ensures token not expired
- Returns data to user 

**Request**
```json
{
	"registrationToken": string
}
```

**Response (200)**
```json
{
  "tokenId": "uuid",
  "registrationToken": string,
  "userId": "uuid",
  "email": string,
  "companyId": "uuid",
  "companyName": string,
  "role": "user | manager",
  "status": "pending | used | revoked",
  "createdAt": string,
  "createdById": "uuid",
  "createdByName": string
}
```

---

### Register User
Consumes a registration token and creates a new user account.

* **Endpoint:** `POST /auth/register`
* **Auth Required:** No

#### Internal Behavior
- Validates registration token
- Hashes password securely (bcrypt or similar)
- Creates user linked to company
- Assigns role from token
- Marks token as used

**Request**
```json
{
  "registrationToken": string,
  "password": string,
  "firstName": string,
  "lastName": string
}
```

**Response (201)**
```json
{
  "message": "Registration successful."
}
```

---

### User Login
Authenticates user credentials and returns a session token.

* **Endpoint:** `POST /auth/login`
* **Auth Required:** No

#### Internal Behavior
- Verifies credentials
- Generates JWT with:
  - userId
  - companyId
  - role
- Responds with JWT and user details

**Request**
```json
{
  "email": string,
  "password": string
}
```

**Response (200)**
```json
{
  "sessionToken": "<JWT Token>",
  "expiresIn": number,
  "user": {
    "userId": "uuid",
    "firstName": string,
    "lastName": string,
    "email": string,
    "role": "user | manager"
  },
  "company": {
    "companyId": "uuid",
    "companyName": string,
    "walletAddress": string
  }
}
```

---

### Update User Profile
Updates a user's basic profile information.

* **Endpoint:** `PATCH /users/:userId`
* **Auth Required:** Yes

#### Internal Behavior
- Validates ownership or permissions
- Sanitizes inputs
- Updates DB record
- Returns updated user

**Request**
Authorization: Bearer <sessionToken>
```json
{
  "firstName": string,
  "lastName": string
}
```

**Response (200)**
```json
{
  "user": {
    "userId": "uuid",
    "firstName": string,
    "lastName": string,
    "role": "user | manager"
  }
}
```

---

## 3. Core Supply Chain & Transfers

---

### Register a New Batch
Creates a new product batch, records ownership under the authenticated company, and initiates a corresponding blockchain transaction via a smart contract.

* **Endpoint:** `POST /batches`
* **Auth Required:** Yes

#### Internal Behavior
- Validates session token
- Validates input fields
- Generates unique batchId
- Stores batch with ownership tied to company
- Computes dataHash from metadata
- Calls smart contract: registerItem(dataHash)
- sets the status to pending while the transaction works
- Async worker:
  - monitors confirmation
  - Blockchain Contract assigns the batchId as the in the same index as the apps ID
  - updates status (confirmed or failed)

#### Hashed Data Structure
```json
{
  "batchId": "<uuid>",
  "batchName": string,
  "batchDescription": string,
  "derivedBatches": [
    "<uuid>",
    "<uuid>"
  ],
  "companyId": "<uuid>",
  "createdAt": string
}
```

**Request**
Authorization: Bearer <sessionToken>
```json
{
  "batchName": string,
  "batchDescription": string
}
```

**Response (201)**
```json
{
  "batchId": "uuid",
  "batchName": string,
  "batchDescription": string,
  "createdAt": string,
  "blockchain": {
    "transactionId": "uuid",
    "status": "pending | confirmed | failed"
  }
}
```

---

### Get Batch List
Retrieves all batches owned by the authenticated company.

* **Endpoint:** `GET /batches`
* **Auth Required:** Yes

#### Internal Behavior
- Queries batches by companyId
- Includes blockchain metadata

**Request**
Authorization: Bearer <sessionToken>

**Response (200)**
```json
[
	{
	  "batchId": "uuid",
	  "batchName": string,
	  "batchDescription": string,
	  "createdAt": string,
	  "registeringCompanyId": "uuid",
	  "registeringCompanyName": string,
	  "registeringUserId": "uuid",
	  "registeringUserName": string,
	  "blockchain": {
      "transactionId": "uuid",
      "status": "pending | confirmed | failed",
      "dataHash": string
	  }
	}
]
```

---

### Get Batch Details
Retrieves detailed information for a specific batch.

* **Endpoint:** `GET /batches/:batchId`
* **Auth Required:** No

#### Internal Behavior
- Validates access permissions
- Fetches batch + blockchain info

**Response (200)**
```json
{
  "batchId": "uuid",
  "batchName": string,
  "batchDescription": string,
  "createdAt": string,
  "registeringCompanyId": "uuid",
  "registeringCompanyName": string,
  "registeringUserId": "uuid",
  "registeringUserName": string,
  "blockchain": {
    "transactionId": "uuid",
    "status": "pending | confirmed | failed",
    "dataHash": string
  }
}
```

---

### Initiate Transfer
Creates a pending transfer request to move a batch to another company.
The receiving user provides their companyID and their userID. 
the userID is used for destination filtering, but anyone in the company can accept/reject.

* **Endpoint:** `POST /transfers`
* **Auth Required:** Yes

#### Internal Behavior
- Validates ownership of batch
- Ensures batch not already in transfer
- Validates destination company and user
- Creates transfer record:
  - status = pending

#### Hashed Data Structure
```json
{
  "transferId:: "<uuid>",
  "batchId": "uuid",
  "fromCompanyId": "uuid",
  "toCompanyId": "uuid",
  "createdAt": string
}
```
**Request**
Authorization: Bearer <sessionToken>
```json
{
  "batchId": "uuid",
  "toCompanyId": "uuid",
  "receivingUserID": "uuid"
}
```

**Response (201)**
```json
{
  "transferId": "uuid",
  "batchId": "uuid",
  "fromCompanyId": "uuid",
  "toCompanyId": "uuid",
  "senderUserID": "uuid",
  "receivingUserID": "uuid",
  "createdAt": string,
  "status": "pending approval | approved | rejected | transfer complete | transfer failed"
}
```

---

### Get Transfer List
Retrieves transfers where the authenticated user's company is the sender or receiver.

* **Endpoint:** `GET /transfers`
* **Auth Required:** Yes

#### Internal Behavior
- Fetches transfers where either the sender or receiver match the user's company.
- Returns transfer list

**Request**
Authorization: Bearer <sessionToken>

**Response (200)**
```json
[
  {
    "transferId": "uuid",
    "batchId": "uuid",
    "batchName": string,
    "fromCompanyName": string,
    "toCompanyName": string,
    "senderUserId": "uuid",
    "senderUserName": string,
    "receivingUserId": "uuid",
    "receivingUserName": string,
    "status": "pending approval | approved | rejected | transfer complete | transfer failed",
    "createdAt": string
  }
]
```

---

### Complete Transfer
Finalizes a transfer and updates ownership. This initiates a Smart Contract Call to start a transfer of ownership.

* **Endpoint:** `POST /transfers/:transferId/complete`
* **Auth Required:** Yes

#### Internal Behavior
- Validated Session Token
- Validates transfer exists and is pending
- Verifies receiving company authorization
- Calls smart contract:
  - transferOwnership(itemID, newOwner)
- Updates batch owner in DB
- Updates transfer status → pending_blockchain
- Async confirmation of blockchain success

**Request**
Authorization: Bearer <sessionToken>

**Response (200)**
```json
{
  "message": "Accepted Transfer."
}
```

---

### Reject Transfer
Rejects a transfer.

* **Endpoint:** `POST /transfers/:transferId/reject`
* **Auth Required:** Yes

#### Internal Behavior
- Validates transfer belongs to receiving company
- Updates status → rejected
- Unlocks batch for future transfers

**Request**
Authorization: Bearer <sessionToken>

**Response (200)**
```json
{
  "message": "Rejected Transfer."
}
```

---

## Notes

- All identity is derived strictly from the sessionToken
- Never trust userId or companyId from client input
- Always enforce role-based access from token
- Token must be validated on every required request
