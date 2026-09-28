const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

/*
  Honest Harvest - Deployment Script

  What this does:
  1. Compiles/deploys SupplyChainContract
  2. Saves the deployed contract address to deployed-address.json
  3. Copies the ABI to abi/SupplyChainContract.json

  Usage:
  1. Start local blockchain:
     npx hardhat node

  2. In a second terminal, deploy:
     npx hardhat run scripts/deploy.js --network localhost

  Note:
  - If the local Hardhat node is restarted, redeploy the contract.
  - The ABI usually stays the same unless the Solidity contract changes.
  - The deployed address changes each time the local chain resets.
*/

async function main() {
  const ContractFactory = await hre.ethers.getContractFactory("SupplyChainContract");
  const contract = await ContractFactory.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("SupplyChainContract deployed to:", contractAddress);

  const outputDir = path.join(__dirname, "..", "deployments");
  const abiDir = path.join(__dirname, "..", "abi");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(abiDir, { recursive: true });

  const addressOutput = {
    contractName: "SupplyChainContract",
    network: hre.network.name,
    address: contractAddress
  };

  fs.writeFileSync(
    path.join(outputDir, "deployed-address.json"),
    JSON.stringify(addressOutput, null, 2)
  );

  const artifact = await hre.artifacts.readArtifact("SupplyChainContract");

  fs.writeFileSync(
    path.join(abiDir, "SupplyChainContract.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("Saved deployed address to deployments/deployed-address.json");
  console.log("Saved ABI to abi/SupplyChainContract.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
