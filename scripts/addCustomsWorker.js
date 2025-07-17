// scripts/addCustomsWorker.js
const { ethers } = require("hardhat");

// Update these values as needed
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Deployed SeeChainShipments address
const CUSTOMS_WORKER_ADDRESS = "0xcd3B766CCDd6AE721141F452C550Ca635964ce71";

async function main() {
  // Get signer (assumes first account is owner)
  const [owner] = await ethers.getSigners();
  console.log("Using owner address:", owner.address);

  // Get contract instance
  const contract = await ethers.getContractAt("SeeChainShipments", CONTRACT_ADDRESS, owner);

  // Add customs worker
  const tx = await contract.addCustomsWorker(CUSTOMS_WORKER_ADDRESS);
  console.log("Transaction sent. Hash:", tx.hash);
  await tx.wait();
  console.log(`Customs worker ${CUSTOMS_WORKER_ADDRESS} added successfully!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 