# Smart Contract (Batch & Ownership)

## Register Item
Registers a new batch on the blockchain and establishes its initial ownership.

This function creates a permanent on-chain record representing a batch in the system.
It assigns a unique identifier, records the creator as the owner, and stores a hash
of the batch’s off-chain data for integrity verification.

Function: registerItem
Access: Public (Externally Callable)

Inputs:
- itemID (uint256): batchId from backend
- dataHash (bytes32): Hash of batch metadata

Returns:
- itemID (uint256): Blockchain identifier

Behavior:
- Uses the batchId provided by the backend to assign the key in the on-chain map
- Assigns msg.sender as owner
- Stores dataHash

Stored On-Chain:
- itemID
- owner
- dataHash

Emits:
- ItemRegistered(itemID, owner, dataHash)


## Transfer Ownership
Finalizes the transfer of a batch to a new owner.

Function: transferOwnership
Access: Current Owner Only

Inputs:
- itemID (uint256)
- newOwner (address)

Behavior:
- Verifies caller is owner
- Verifies newOwner is valid
- Updates ownership

Emits:
- OwnershipTransferred(itemID, from, to)


## Get Item
Retrieves the on-chain record for a batch.

Function: getItem
Access: Public (Read Only)

Inputs:
- itemID (uint256)

Returns:
- itemID
- owner
- dataHash

Behavior:
- Returns stored data for verification


# Notes

* The blockchain stores only **essential verification data** (ownership + data hash)
* All descriptive data (names, descriptions, files) is stored off-chain
* The `dataHash` allows any system to verify that off-chain data has not been altered
* Events provide a complete audit trail of creation and ownership changes
