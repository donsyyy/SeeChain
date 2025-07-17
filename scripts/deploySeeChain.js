// scripts/deploySeeChain.js
async function main() {
  const SeeChainShipments = await ethers.getContractFactory("SeeChainShipments");
  const seeChain = await SeeChainShipments.deploy();
  await seeChain.waitForDeployment();
  console.log("SeeChainShipments deployed to:", seeChain.target); // .target is the address in ethers v6
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
