const { ethers } = require('ethers');

// Configure this in .env file
// Configure this in .env file
// Configure this in .env file

async function sendEthToAddress(provider, faucetPrivateKey, toAddress, amountWei) {
    const value = amountWei ?? ethers.parseEther('10');
    const faucet = new ethers.Wallet(faucetPrivateKey.trim(), provider);
    const tx = await faucet.sendTransaction({ to: toAddress, value });
    const receipt = await tx.wait();
    return {
        transactionHash: receipt.hash,
        from: faucet.address,
        to: toAddress,
        valueWei: value.toString(),
    };
}

function shouldAutoFundNewCompanyWallets() {
    return (
        process.env.AUTO_FUND_NEW_COMPANY_WALLETS === 'true' &&
        !!process.env.FAUCET_PRIVATE_KEY?.trim() &&
        !!process.env.RPC_URL?.trim()
    );
}

function getFaucetAmountWei() {
    const raw = process.env.FAUCET_AMOUNT_ETH?.trim();
    if (!raw) {
        return ethers.parseEther('10');
    }
    return ethers.parseEther(raw);
}

module.exports = {
    sendEthToAddress,
    shouldAutoFundNewCompanyWallets,
    getFaucetAmountWei,
};
