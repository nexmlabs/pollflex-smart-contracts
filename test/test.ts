import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MarketPrediction", function () {

  async function deployTokenFixture() {
    const MarketPrediction = await ethers.getContractFactory("MarketPrediction");

    const hardhatMarketPrediction = await MarketPrediction.deploy();

    const [owner, addr1, addr2] = await ethers.getSigners();
    return { hardhatMarketPrediction, owner, addr1, addr2 };
  }

  it("should return the correct ipfsHash", async () => {
    const { hardhatMarketPrediction, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    const ipfsHash = "Qmc45UMvYXRLhGiNchg2DH68eYg4aG2h9FSVJwb1yGhgbH";

    const bytes = ethers.utils.toUtf8Bytes(ipfsHash);
    await hardhatMarketPrediction.createVote(bytes);

    const ipfsHashReceive = await hardhatMarketPrediction.getIpfsHash(1);
    const bytesRevert = ethers.utils.toUtf8String(ipfsHashReceive);

    expect(ipfsHash).to.equal(bytesRevert);
  });
});
