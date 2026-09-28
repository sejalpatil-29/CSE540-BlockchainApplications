-- 1. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    wallet_address TEXT,
    encrypted_private_key TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK (role IN ('user', 'manager')) NOT NULL,
    company_id UUID REFERENCES companies(company_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Registration Tokens Table
CREATE TABLE IF NOT EXISTS registration_tokens (
    registration_token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    company_id UUID REFERENCES companies(company_id),
    role TEXT CHECK (role IN ('user', 'manager')),
    status TEXT CHECK (status IN ('pending', 'used', 'revoked')) DEFAULT 'pending',
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP
);

-- 4. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blockchain_batch_id BIGINT UNIQUE,
    registering_company_id UUID REFERENCES companies(company_id),
    created_by UUID REFERENCES users(user_id),
    current_company_id UUID REFERENCES companies(company_id),
    batch_name TEXT NOT NULL,
    batch_description TEXT, 
    created_at TIMESTAMP DEFAULT NOW(),
    blockchain_tx_id TEXT,
    blockchain_status TEXT CHECK (blockchain_status IN ('pending', 'confirmed', 'failed')),
    data_hash TEXT
);

-- 5. Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    transfer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES batches(batch_id),
    from_company_id UUID REFERENCES companies(company_id),
    to_company_id UUID REFERENCES companies(company_id),
    sender_user_id UUID REFERENCES users(user_id),
    receiving_user_id UUID REFERENCES users(user_id),
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
    data_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    blockchain_tx_id TEXT,
    --blockchain_status TEXT CHECK (blockchain_status IN ('pending', 'confirmed', 'failed'))
    blockchain_status TEXT CHECK (blockchain_status IN ('pending approval', 'approved', 'rejected', 'transfer complete', 'transfer failed'))
);

CREATE TABLE IF NOT EXISTS batch_lineage (
    lineage_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    new_batch_id      uuid NOT NULL REFERENCES batches (batch_id) ON DELETE RESTRICT,
    source_batch_id   uuid NOT NULL REFERENCES batches (batch_id) ON DELETE RESTRICT,
    created_at        TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT batch_lineage_no_self CHECK (new_batch_id <> source_batch_id),
    CONSTRAINT batch_lineage_one_edge_per_pair UNIQUE (new_batch_id, source_batch_id)
);