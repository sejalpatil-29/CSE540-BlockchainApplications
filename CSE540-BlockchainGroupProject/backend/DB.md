# 🗄️ Honest Harvest Database Documentation

This document outlines the PostgreSQL database schema for the Honest Harvest supply chain platform. 

All tables use `gen_random_uuid()` as the default primary key generation method to ensure global uniqueness and prevent ID-guessing across the API.

---

## 1. `companies`
Stores the overarching organizations that interact within the supply chain.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `company_id` | `UUID` | **PRIMARY KEY** | Auto-generated UUID. |
| `name` | `TEXT` | `NOT NULL` | The public name of the company. |
| `wallet_address` | `TEXT` | `NULL` | The Ethereum wallet address for smart contract interactions. |
| `encrypted_private_key` | `TEXT` | `NULL` | AES-256-GCM JSON (iv, ciphertext, tag) for the company signing key; not returned by API. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record creation timestamp. |

---

## 2. `users`
Stores authenticated employee accounts tied to specific companies.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | **PRIMARY KEY** | Auto-generated UUID. |
| `email` | `TEXT` | `UNIQUE`, `NOT NULL` | User's login email (case-insensitive in API). |
| `password_hash` | `TEXT` | `NOT NULL` | Bcrypt hashed password. |
| `first_name` | `TEXT` | `NULL` | User's first name. |
| `last_name` | `TEXT` | `NULL` | User's last name. |
| `role` | `TEXT` | `NOT NULL`, `CHECK` | Must be either `'user'` or `'manager'`. |
| `company_id` | `UUID` | **FOREIGN KEY** | References `companies(company_id)`. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record creation timestamp. |

---

## 3. `registration_tokens`
Secure invite system allowing managers (or super-admins) to invite new employees.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `registration_token_id` | `UUID` | **PRIMARY KEY** | Auto-generated UUID. |
| `token` | `TEXT` | `UNIQUE`, `NOT NULL` | Secure hex-string generated via crypto. |
| `email` | `TEXT` | `NOT NULL` | The email address this token is assigned to. |
| `company_id` | `UUID` | **FOREIGN KEY** | References `companies(company_id)`. |
| `role` | `TEXT` | `CHECK` | Role to assign upon registration (`'user'`, `'manager'`). |
| `status` | `TEXT` | `DEFAULT 'pending'` | Must be `'pending'`, `'used'`, or `'revoked'`. |
| `created_by` | `UUID` | **FOREIGN KEY** | References `users(user_id)` (Null for super-admin). |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Token creation timestamp. |
| `used_at` | `TIMESTAMP` | `NULL` | Timestamp of when the user registered. |

---

## 4. `batches`
Represents physical product lots registered on the system and the blockchain.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `batch_id` | `UUID` | **PRIMARY KEY** | Auto-generated internal UUID. |
| `blockchain_batch_id` | `BIGINT` | `UNIQUE`, `NULL` | The ID assigned by the Smart Contract. |
| `batch_name` | `TEXT` | `NOT NULL` | Human-readable product name. |
| `batch_description`| `TEXT` | `NULL` | Details about the batch contents. |
| `registering_company_id` | `UUID` | **FOREIGN KEY** | Company that registered the batch `companies(company_id)`. |
| `current_company_id` | `UUID` | **FOREIGN KEY** | Company that currently holds the batch `companies(company_id)`. |
| `created_by` | `UUID` | **FOREIGN KEY** | The user who originally minted it `users(user_id)`. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record creation timestamp. |
| `blockchain_tx_id`| `TEXT` | `NULL` | Transaction hash from Ethereum. |
| `blockchain_status`| `TEXT` | `CHECK` | Must be `'pending'`, `'confirmed'`, or `'failed'`. |
| `data_hash` | `TEXT` | `NULL` | Hashed payload verified on-chain. |

---

## 5. `transfers`
Tracks the lifecycle of a batch moving from one company to another.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `transfer_id` | `UUID` | **PRIMARY KEY** | Auto-generated UUID. |
| `batch_id` | `UUID` | **FOREIGN KEY** | References `batches(batch_id)`. |
| `from_company_id` | `UUID` | **FOREIGN KEY** | References `companies(company_id)`. |
| `to_company_id` | `UUID` | **FOREIGN KEY** | References `companies(company_id)`. |
| `sender_user_id` | `UUID` | **FOREIGN KEY** | References `users(user_id)`. |
| `receiving_user_id`| `UUID` | **FOREIGN KEY** | References `users(user_id)`. |
| `status` | `TEXT` | `DEFAULT 'pending'` | Web2 Status: `'pending'`, `'accepted'`, `'rejected'`, `'completed'`. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Transfer request timestamp. |
| `completed_at` | `TIMESTAMP` | `NULL` | Transfer completion timestamp. |
| `blockchain_tx_id`| `TEXT` | `NULL` | Transaction hash from Ethereum. |
| `blockchain_status`| `TEXT` | `CHECK` | Web3 Status: `'pending approval'`, `'approved'`, `'rejected'`, `'transfer complete'`, `'transfer failed'`. |

---

## 🧭 Initialization

The database is fully containerized. To initialize the schema from scratch, the `init.sql` file is automatically executed when building the Docker environment.

```bash
# Wipes old volumes and builds a fresh database with the defined schema
docker-compose down -v
docker-compose up -d --build

```

---

# 🗄️ Honest Harvest Database Architecture

This document outlines the core PostgreSQL database schema for the Honest Harvest supply chain system.

## 🗺️ Entity-Relationship Diagram

This diagram maps how SQL tables are linked together via Primary Keys (PK) and Foreign Keys (FK).

```mermaid
erDiagram
    COMPANIES ||--o{ USERS : "employs"
    COMPANIES ||--o{ REGISTRATION_TOKENS : "issues"
    COMPANIES ||--o{ BATCHES : "registered / holds"
    COMPANIES ||--o{ TRANSFERS : "sends/receives"
    
    USERS ||--o{ REGISTRATION_TOKENS : "created by"
    USERS ||--o{ BATCHES : "registered by"
    USERS ||--o{ TRANSFERS : "initiated/accepted by"

    BATCHES ||--o{ TRANSFERS : "undergoes"

    COMPANIES {
        UUID company_id PK
        TEXT name
        TEXT wallet_address
        TIMESTAMP created_at
    }

    USERS {
        UUID user_id PK
        TEXT email UK
        TEXT password_hash
        TEXT first_name
        TEXT last_name
        TEXT role
        UUID company_id FK
    }

    REGISTRATION_TOKENS {
        UUID registration_token_id PK
        TEXT token UK
        TEXT email
        UUID company_id FK
        TEXT role
        TEXT status
        UUID created_by FK
    }

    BATCHES {
        UUID batch_id PK
        BIGINT blockchain_batch_id UK
        TEXT batch_name
        UUID registering_company_id FK
        UUID current_company_id FK
        UUID created_by FK
        TEXT blockchain_status
    }

    TRANSFERS {
        UUID transfer_id PK
        UUID batch_id FK
        UUID from_company_id FK
        UUID to_company_id FK
        TEXT status
        TEXT blockchain_status
    }