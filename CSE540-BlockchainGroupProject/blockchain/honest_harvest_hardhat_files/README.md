# Honest Harvest Hardhat Starter Files

This folder contains three ready-to-use files for integrating the Honest Harvest Solidity contract with Hardhat and ethers.js.

## Files

- `hardhat.config.js`
- `scripts/deploy.js`
- `src/contractConnector.js`

## Expected Contract

These files assume your Solidity contract is named:

```solidity
contract SupplyChainContract
```

And that the Solidity file is inside:

```text
contracts/SupplyChainContract.sol
```

## Setup Commands

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers
npx hardhat compile
```

## Local Deployment Workflow

Terminal 1:

```bash
npx hardhat node
```

Terminal 2:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

The deploy script will generate:

```text
deployments/deployed-address.json
abi/SupplyChainContract.json
```

## Important Note

If the Hardhat local node is restarted, the local blockchain resets.

That means:

- redeploy the contract
- use the newly generated address
- keep the ABI unless the Solidity contract changed


# Honest Harvest – Local Development Setup
2) Start Local Blockchain (Hardhat)

Open a new terminal:

cd blockchain/honest_harvest_hardhat_files
npx hardhat node

Expected output:

Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Leave this terminal running.

3) Deploy Smart Contract

Open a third terminal:

cd blockchain/honest_harvest_hardhat_files
npx hardhat run scripts/deploy.js --network localhost

Expected output:

SupplyChainContract deployed to: 0x...
Saved deployed address to deployments/deployed-address.json
Saved ABI to abi/SupplyChainContract.json
4) Restart Backend

After deployment, restart the backend so it picks up the new contract address:

docker-compose restart backend

5) Verify Setup
Frontend

Open:

http://localhost:3000

Test:

- Register / login
- Any action that triggers backend requests
- Backend (quick check)
- curl http://localhost:8080
- Contract (Hardhat console)
- npx hardhat console --network localhost

Then (inside Hardhat console):

- const addressInfo = require("./deployments/deployed-address.json");
- const contract = await ethers.getContractAt("SupplyChainContract", addressInfo.address);
- await contract.currentID();

Important Notes

If you restart the Hardhat node

You must redeploy the contract and restart the backend:

- npx hardhat run scripts/deploy.js --network localhost
- docker-compose restart backend

Backend Blockchain Connection

Inside Docker, the backend must connect using:

http://host.docker.internal:8545

Do not use localhost inside the container.

Common Issues

Backend: Cannot find module 'express'

- cd backend
- npm install
- docker-compose up --build

Hardhat not found

- npm install

Run inside the Hardhat folder.

Contract not found

Ensure:

contracts/SupplyChainContract.sol

And the contract name matches:

contract SupplyChainContract

Architecture Overview
Frontend (http://localhost:3000)
        ↓
Backend API (http://localhost:8080)
        ↓
Ethers.js
        ↓
Hardhat Node (http://127.0.0.1:8545)
        ↓
Smart Contract

Quick Start

# Terminal 1
docker-compose up

# Terminal 2
cd blockchain/honest_harvest_hardhat_files
npx hardhat node

# Terminal 3
npx hardhat run scripts/deploy.js --network localhost

# Then
docker-compose restart backend
