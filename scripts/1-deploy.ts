import { ethers, hardhatArguments, upgrades } from "hardhat";
import { VotePollV1 } from "../typechain-types";
import * as Config from "./config";

async function main() {
  await Config.initConfig();
  const network = hardhatArguments.network ? hardhatArguments.network : "dev";

  const [deployer] = await ethers.getSigners();
  console.log("deploy from address: ", deployer.address);

  const VotePollV1SMC = await ethers.getContractFactory("VotePollV1");
  const deployVotePollV1 = await upgrades.deployProxy(VotePollV1SMC);
  const votePollV1 = await (deployVotePollV1 as VotePollV1).deployed();

  Config.setConfig(network + ".VotePollV1", votePollV1.address);

  await Config.updateConfig();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
