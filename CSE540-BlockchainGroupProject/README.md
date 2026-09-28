# The Honest Harvest | CSE540 - Blockchain Project


**The Honest Harvest** is a blockchain-based solution that tracks the entire lifecycle of food products from farm to table to increase its traceability. By using a shared, decentralized ledger, all stakeholders in the food supply chain can record transactions securely and transparently.

Each product batch is assigned a unique digital ID, creating a unique, tamper-proof record. Furthermore, blockchain technology's automated digital rules allows for the replacement of slow, error-prone paper trails.

With the **Honest Harvest**, consumers can simply scan a code on a product in the store to view its complete path to get there. This eliminates the uncertainty of food supply and increases the mutual trust between consumers and suppliers.

## Table of Contents

- [About Us](#aboutus)
- [Technology](#technology)
- [Dependencies](#dependencies)
- [Getting Started](#gettingstarted)

## About Us 

**The Honest Harvest** is a project created by Alan Zygutis, Joshua Burgess, Donavan Doan, Manasi Patil, and Sejal Patil for the CSE540 Blockchain course. 

## Technology 

![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0A6B9F?style=flat&logo=solidity&logoColor=white)
![Remix IDE](https://img.shields.io/badge/Remix_IDE-121212?style=flat&logo=remix&logoColor=white)
![MetaMask](https://img.shields.io/badge/MetaMask-F6851B?style=flat&logo=metamask&logoColor=white)

## Dependencies

This project uses the following major dependencies and tools:

- Docker and Docker Compose for containerized setup
- Go modules for backend dependency management
- Node.js and npm for frontend dependency management
- React / Next.js for the frontend
- MetaMask for blockchain wallet interaction
- Solidity smart contracts developed in Remix IDE
- ethers.js or web3.js for frontend blockchain communication, if applicable

Most dependencies are installed automatically through Docker during setup. If running components outside Docker, users may need to install Node.js, npm, Go, and MetaMask manually.

### Docker
When using Docker, simply running the `docker-compose up` or `docker build` command will automatically pull and install the necessary dependencies for the project.


## Getting Started 
 
### Prerequisites
- Docker: for containerizing the application

### Setting Up the Project
1. Clone the repo
    ```sh 
    git clone https://github.com/Jman001188/CSE540-BlockchainGroupProject.git
    ```
2. Start the Docker Application
    ```sh
    docker-compose up --build
    ```
3. Access the Application
    - **Backend**: Your Go backend should now be running on http://localhost:8080
    - **Frontend**: Your React (Next.js) frontend should now be running on http://localhost:3000
```
```
4. Compile the contract(s)
    - Using the Remix IDE, click on the "Compile" button which selecting the contract file.
    - Repeat this step for each contract you wish to deploy. Do this again after any changes to a contract.
```
```
5. Deploy the contract(s)
    - For each new or modified contract, edit the line in the deploy_with_ether.ts file where <ContractName> is the name of the conpiled contract:
        ```TypeScript
            const result = await deploy('<ContractName>', [])
        ```