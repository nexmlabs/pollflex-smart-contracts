import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner: ", owner.address);

  const VotePollV1SMC = await ethers.getContractFactory("VotePollV1");
  const votePollV1 = VotePollV1SMC.attach("0x4fc823663Ea711fC0d1297305adB50D438d75BDA");

  await votePollV1.connect(owner).addSigner("0x9fD72bCC463Ed3e17a602Ea79c0Db9B77fFDaB72");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
