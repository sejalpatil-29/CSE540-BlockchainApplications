# Supply chain map

Lineage answers “what batches went into this one?” Transfers answer “who held this batch over time?” Same product can have both: flour and sugar batches each have transfer history; the cake batch is a new row and gets its own lineage links to those inputs.

Don’t record transfers inside `batch_lineage`. Transfer rows already cover custody.

## Table suggestions

`batch_lineage` — one row per input edge (cake ← flour is one row, cake ← sugar is another).

```sql
CREATE TABLE batch_lineage (
  lineage_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  derived_batch_id  uuid NOT NULL REFERENCES batches (batch_id) ON DELETE RESTRICT,
  source_batch_id   uuid NOT NULL REFERENCES batches (batch_id) ON DELETE RESTRICT,
  created_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid NULL REFERENCES users (user_id),

  CONSTRAINT batch_lineage_no_self CHECK (derived_batch_id <> source_batch_id),
  CONSTRAINT batch_lineage_one_edge_per_pair UNIQUE (derived_batch_id, source_batch_id)
);

CREATE INDEX batch_lineage_derived_idx ON batch_lineage (derived_batch_id);
CREATE INDEX batch_lineage_source_idx ON batch_lineage (source_batch_id);
```

If you delete batches rarely, `ON DELETE RESTRICT` keeps orphaned edges from disappearing quietly. Use `CASCADE` only if you’re sure a batch delete should wipe its lineage.

`batches` — if `company_id` is always “current owner” and changes when a transfer completes, the original registrar company is easy to lose in the API. Add a column that’s set once at insert and never updated by transfers:

```sql
ALTER TABLE batches
  ADD COLUMN registering_company_id uuid REFERENCES companies (company_id);

-- backfill: set from current company_id where null, then enforce NOT NULL on new rows in app or DB
```

Change `POST /batches` (or your insert path) so `registering_company_id` and `company_id` both get the creator’s company on day one.

## Building the graph

Start from the batch you care about (the “current” batch). Walk `batch_lineage` upstream only: for each batch, load rows where it is the `derived_batch_id`, collect `source_batch_id`s, repeat until there are no new parents. That closure is the full provenance back to root inputs. Don’t walk downstream; if you hit a cycle, stop and error or log it.

Pull `transfers` for every batch id in that set (including the starting batch), sorted by time. Layout-wise you can tell the story left-to-right or top-to-bottom from earliest inputs toward the current batch; the data model doesn’t care.

Lineage edges stay ingredient → product; custody stays per-node.

## APIs

**History (single endpoint)** — everything the map needs in one response:

- `**GET /batches/:batchId/supply-chain`** — Auth rules are your call (public slice vs logged-in vs same-company). Handler: upstream-only lineage closure from `:batchId`, then load all `transfers` for every batch id in that set. Response should include at least:
  - `batches` — one object per id (e.g. id, name, `companyId`, `registeringCompanyId` if you have it, blockchain summary).
  - `lineageEdges` — `{ sourceBatchId, derivedBatchId }` for every edge inside that closure.
  - `transfersByBatchId` — object keyed by batch id; each value is that batch’s transfer rows in chronological order.

No separate lineage or per-batch transfer routes unless you change your mind later; the UI builds provenance + custody from this payload only.

**Writing lineage (batch create)**

Extend `**POST /batches`** with optional `sourceBatchIds` / `components`, or use a dedicated `**POST /batches/derived`**. That path creates the new `batches` row and is the only normal place you insert `batch_lineage` rows.

The server does **not** infer lineage from transfers or from walking the graph. The client (or whoever calls the API) lists the existing batch ids that are inputs. For each id you accept, insert one row: `derived_batch_id` = new batch, `source_batch_id` = that input. Run your usual checks (rows exist, no self-reference, ownership rules, cycle sanity if you want).

If the request has **no** source batches—field omitted, or an empty array—you only insert the batch. **No** `batch_lineage` rows. That batch is a root for provenance until you decide to support editing lineage later (most setups don’t).

Transfers stay separate: completing a transfer never adds lineage; it only affects custody of one batch id.