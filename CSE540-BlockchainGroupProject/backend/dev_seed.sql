BEGIN;


INSERT INTO companies (company_id, name, wallet_address) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001', 'Honest Harvest Demo Co', '0x1111111111111111111111111111111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002', 'Riverbend Mill',           '0x2222222222222222222222222222222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003', 'Sunrise Bakery',           '0x3333333333333333333333333333333333333333')
ON CONFLICT (company_id) DO UPDATE SET
  name = EXCLUDED.name,
  wallet_address = EXCLUDED.wallet_address;

-- Users (password for every row below: pass — bcrypt cost 10)
INSERT INTO users (user_id, email, password_hash, first_name, last_name, role, company_id) VALUES
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001',
    '1@dev.local',
    '$2b$10$NcZ/VD.u17OOaQNFwAEdfumrTqVLyic9q6ZxCg6e8MGN5HJ52k79u',
    'Seed',
    'Honest',
    'manager',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0002',
    '2@dev.local',
    '$2b$10$NcZ/VD.u17OOaQNFwAEdfumrTqVLyic9q6ZxCg6e8MGN5HJ52k79u',
    'Seed',
    'Riverbend',
    'manager',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0003',
    '3@dev.local',
    '$2b$10$NcZ/VD.u17OOaQNFwAEdfumrTqVLyic9q6ZxCg6e8MGN5HJ52k79u',
    'Seed',
    'Sunrise',
    'manager',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0004',
    'dev@dev.local',
    '$2b$10$NcZ/VD.u17OOaQNFwAEdfumrTqVLyic9q6ZxCg6e8MGN5HJ52k79u',
    'Dev',
    'User',
    'manager',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001'
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id;

-- Batches
INSERT INTO batches (batch_id, batch_name, batch_description, company_id, created_by, blockchain_status) VALUES
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccc0001',
    'Fixture — Organic Flour',
    'Seed batch for supply-chain demos',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001',
    'confirmed'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccc0002',
    'Fixture — Cane Sugar',
    'Seed batch for supply-chain demos',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0002',
    'confirmed'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccc0003',
    'Fixture — Cake Mix',
    'Derived from flour + sugar (fixture)',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0003',
    'pending'
  )
ON CONFLICT (batch_id) DO UPDATE SET
  batch_name = EXCLUDED.batch_name,
  batch_description = EXCLUDED.batch_description,
  company_id = EXCLUDED.company_id,
  created_by = EXCLUDED.created_by,
  blockchain_status = EXCLUDED.blockchain_status;

INSERT INTO batch_lineage (new_batch_id, source_batch_id) VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccc0003', 'cccccccc-cccc-4ccc-8ccc-cccccccc0001'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccc0003', 'cccccccc-cccc-4ccc-8ccc-cccccccc0002')
ON CONFLICT (new_batch_id, source_batch_id) DO NOTHING;

INSERT INTO transfers (
  transfer_id,
  batch_id,
  from_company_id,
  to_company_id,
  sender_user_id,
  receiving_user_id,
  status
) VALUES (
  'dddddddd-dddd-4ddd-8ddd-dddddddd0001',
  'cccccccc-cccc-4ccc-8ccc-cccccccc0001',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0004',
  'pending'
)
ON CONFLICT (transfer_id) DO UPDATE SET
  batch_id = EXCLUDED.batch_id,
  from_company_id = EXCLUDED.from_company_id,
  to_company_id = EXCLUDED.to_company_id,
  sender_user_id = EXCLUDED.sender_user_id,
  receiving_user_id = EXCLUDED.receiving_user_id,
  status = EXCLUDED.status;

COMMIT;
