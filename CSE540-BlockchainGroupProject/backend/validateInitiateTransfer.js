class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function getReceivingUserId(body) {
    return body.receivingUserId ?? body.receivingUserID ?? null;
}

async function assertCanInitiateTransfer({
    db,
    ethers,
    rpcUrl,
    contractAddress,
    contractABI,
    batchId,
    toCompanyId,
    recvId,
    companyId,
}) {
    if (!batchId || !toCompanyId) {
        throw new HttpError(400, 'batchId and toCompanyId are required.');
    }

    const batchQuery = await db.query(
        'SELECT current_company_id, blockchain_batch_id FROM batches WHERE batch_id = $1',
        [batchId]
    );
    if (batchQuery.rowCount === 0) {
        throw new HttpError(404, 'Batch not found.');
    }
    const batchRow = batchQuery.rows[0];
    if (batchRow.current_company_id !== companyId) {
        throw new HttpError(403, 'Unauthorized: Your company does not currently hold this batch.');
    }
    if (batchRow.blockchain_batch_id == null) {
        throw new HttpError(400, 'Batch is not linked to an on-chain item (missing blockchain_batch_id).');
    }
    if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
        throw new HttpError(503, 'Smart contract is not configured on the server.');
    }

    const { rows: holderRows } = await db.query(
        'SELECT wallet_address FROM companies WHERE company_id = $1',
        [companyId]
    );
    const holderWallet = holderRows[0]?.wallet_address;
    if (!holderWallet) {
        throw new HttpError(400, 'Your company has no wallet address on file.');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const readContract = new ethers.Contract(contractAddress, contractABI, provider);
    const itemId = BigInt(batchRow.blockchain_batch_id);

    const onChainExists = await readContract.itemExistsOnChain(itemId);
    if (!onChainExists) {
        throw new HttpError(
            400,
            `On-chain item ${batchRow.blockchain_batch_id} does not exist at the configured contract.`
        );
    }

    const ownerOnChain = await readContract.getItemOwner(itemId);
    const holderAddr = ethers.getAddress(holderWallet);
    if (ownerOnChain.toLowerCase() !== holderAddr.toLowerCase()) {
        throw new HttpError(
            403,
            'On-chain owner does not match your company wallet; database and chain may be out of sync.'
        );
    }

    const inflight = await db.query(
        `SELECT 1 FROM transfers WHERE batch_id = $1 AND status IN ('pending', 'accepted')`,
        [batchId]
    );
    if (inflight.rowCount > 0) {
        throw new HttpError(409, 'This batch already has a transfer in progress.');
    }

    if (recvId) {
        const receivingUser = await db.query(
            'SELECT 1 FROM users WHERE user_id = $1 AND company_id = $2',
            [recvId, toCompanyId]
        );
        if (receivingUser.rowCount === 0) {
            throw new HttpError(400, 'Receiving user must belong to the destination company.');
        }
    }
}

module.exports = {
    HttpError,
    getReceivingUserId,
    assertCanInitiateTransfer,
};
