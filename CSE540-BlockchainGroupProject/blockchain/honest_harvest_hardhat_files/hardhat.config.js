require("@nomicfoundation/hardhat-toolbox");

/*
  Honest Harvest - Hardhat Configuration

  Purpose:
  - Provides a local Hardhat development network
  - Allows the team to compile and deploy the Solidity contract
  - Keeps the setup simple for a course project

  Common commands:
  - npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
  - npx hardhat compile
  - npx hardhat node
  - npx hardhat run scripts/deploy.js --network localhost
*/

module.exports = {
  solidity: "0.8.20",

  networks: {
    hardhat: {
      chainId: 31337
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  }
};
