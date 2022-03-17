const destination = '0x2e765468e8CCe070117608FBa390dF61Cd293C50';
const authorAddress = '0x16ea840cfA174FdAC738905C4E5dB59Fd86912a1';

async function main() {
  const factory = await ethers.getContractFactory("BookNFT");
  const contract = await factory.deploy("vitalik", authorAddress);
  console.log("NFT Deployed to:", contract.address);
  const tx = await contract.inStock(1, 1);
  await tx.wait();
  const tx1 = await contract.sellBook(destination, 1, 1);
  await tx1.wait();
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
