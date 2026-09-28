// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

/*
    Honest Harvest - SupplyChainContract

    Purpose:
    Tracks supply-chain batches on-chain using minimal verification data.

    Stored on-chain:
    - unique item ID
    - current owner address (company wallet)
    - hash of off-chain batch metadata
    - existence flag

    Stored off-chain:
    - batch name, description
    - company/user IDs
    - transfer workflow records
    - transaction status
    - files, documents, certificates

    Design philosophy:
    - Keep contract simple and verifiable
    - Backend handles business logic
    - Blockchain acts as integrity + ownership layer
*/

contract SupplyChainContract {

    struct Item {
        uint256 itemID;
        address owner;
        bytes32 dataHash;
        bool exists;
    }

    uint256 public currentID = 1;

    mapping(uint256 => Item) private items;

    // Optional: prevent duplicate metadata hashes
    mapping(bytes32 => bool) private registeredDataHashes;

    // Events for backend indexing
    event ItemRegistered(
        uint256 indexed itemID,
        address indexed owner,
        bytes32 dataHash
    );

    event OwnershipTransferred(
        address indexed from,
        address indexed to,
        bytes32 transferHash
    );

    event ItemDataHashUpdated(
        uint256 indexed itemID,
        bytes32 indexed oldDataHash,
        bytes32 indexed newDataHash
    );

    struct TransferProof {
        address from;
        address to;
        bytes32 transferHash;
    }

    mapping(uint256 => TransferProof[]) private transferData;

    modifier itemExists(uint256 itemID) {
        require(items[itemID].exists, "Item does not exist");
        _;
    }

    modifier onlyOwner(uint256 itemID) {
        require(items[itemID].owner == msg.sender, "Caller is not current owner");
        _;
    }

    /*
        Register a new batch/item.

        Workflow:
        - backend validates user/company
        - backend computes canonical dataHash
        - transaction signed by company wallet
    */
    function registerItem(bytes32 dataHash) external returns (uint256) {
        require(dataHash != bytes32(0), "dataHash cannot be empty");
        require(!registeredDataHashes[dataHash], "dataHash already registered");

        uint256 newID = currentID;

        items[newID] = Item({
            itemID: newID,
            owner: msg.sender,
            dataHash: dataHash,
            exists: true
        });

        registeredDataHashes[dataHash] = true;

        emit ItemRegistered(newID, msg.sender, dataHash);

        currentID++;
        return newID;
    }

    /*
        Transfer ownership to another company wallet.
    */
    function transferOwnership(
        uint256 itemID,
        address newOwner,
        bytes32 transferHash
    ) external itemExists(itemID) onlyOwner(itemID) {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != items[itemID].owner, "Already owner");
        require(transferHash != bytes32(0), "Invalid transfer hash");

        address previousOwner = items[itemID].owner;
        items[itemID].owner = newOwner;

        transferData[itemID].push(
            TransferProof(previousOwner, newOwner, transferHash)
        );
        emit OwnershipTransferred(previousOwner, newOwner, transferHash);
    }

    /*
        Update metadata hash when off-chain data changes.

        Only current owner can update.
    */
    function updateItemDataHash(
        uint256 itemID,
        bytes32 newDataHash
    ) external itemExists(itemID) onlyOwner(itemID) {
        require(newDataHash != bytes32(0), "Invalid hash");

        bytes32 oldDataHash = items[itemID].dataHash;
        require(newDataHash != oldDataHash, "Hash unchanged");
        require(!registeredDataHashes[newDataHash], "Hash already used");

        // Update hash tracking
        registeredDataHashes[oldDataHash] = false;
        registeredDataHashes[newDataHash] = true;

        items[itemID].dataHash = newDataHash;

        emit ItemDataHashUpdated(itemID, oldDataHash, newDataHash);
    }

    /*
        Get full item record.
    */
    function getItem(
        uint256 itemID
    )
        external
        view
        itemExists(itemID)
        returns (
            uint256 returnedItemID,
            address owner,
            bytes32 dataHash
        )
    {
        Item memory item = items[itemID];
        return (item.itemID, item.owner, item.dataHash);
    }

    /*
        Get current owner.
    */
    function getItemOwner(
        uint256 itemID
    ) external view itemExists(itemID) returns (address) {
        return items[itemID].owner;
    }

    /*
        Get current data hash.
    */
    function getItemDataHash(
        uint256 itemID
    ) external view itemExists(itemID) returns (bytes32) {
        return items[itemID].dataHash;
    }

    // GEt transfer data hash for a batch ID at a given index
    function getTransferDataHash(
        uint256 itemID
    ) external view itemExists(itemID) returns (bytes32[] memory) {
        TransferProof[] storage proofs = transferData[itemID];

        bytes32[] memory hashes = new bytes32[](proofs.length);

        for (uint256 i = 0; i < proofs.length; i++) {
            hashes[i] = proofs[i].transferHash;
        }

        return hashes;
    }

    /*
        Check if item exists.
    */
    function itemExistsOnChain(uint256 itemID) external view returns (bool) {
        return items[itemID].exists;
    }

    /*
        Check if a hash is already registered.
        Useful for backend pre-validation.
    */
    function isDataHashRegistered(bytes32 dataHash) external view returns (bool) {
        return registeredDataHashes[dataHash];
    }
}