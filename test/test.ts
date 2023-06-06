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

  it("should return the correct ipfsHash when create vote", async () => {
    const { hardhatMarketPrediction, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    const ipfsHash = "Qmc45UMvYXRLhGiNchg2DH68eYg4aG2h9FSVJwb1yGhgbH";

    const bytes = ethers.utils.toUtf8Bytes(ipfsHash);
    await hardhatMarketPrediction.createVote(bytes);

    const bytes1 = ethers.utils.toUtf8Bytes(ipfsHash);
    await hardhatMarketPrediction.createVote(bytes1);

    const ipfsHashReceive = await hardhatMarketPrediction.getCreateVoted(2);
    const bytesRevert = ethers.utils.toUtf8String(ipfsHashReceive);

    expect(ipfsHash).to.equal(bytesRevert);
  });

  it("should return the correct ipfsHash when submit vote", async () => {
    const { hardhatMarketPrediction, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    /**Create */
    const ipfsHashCreate = "Qmc45UMvYXRLhGiNchg2DH68eYg4aG2h9FSVJwb1yGhgbH";
    const bytesCreate = ethers.utils.toUtf8Bytes(ipfsHashCreate);
    await hardhatMarketPrediction.createVote(bytesCreate);


    /**submit */
    await hardhatMarketPrediction.addAdmin(addr1.address);
    const blockNumber = await ethers.provider.getBlockNumber();
    const nonce = await ethers.provider.getTransactionCount(owner.address, blockNumber);

    const ipfsHash = "Qmc45UMvYXRLhGiNchg2DH68eYg4aG2h9FSVJwb1yGhgbH";
    const bytes = ethers.utils.toUtf8Bytes(ipfsHash);
    const encodedWithNonce = ethers.utils.solidityPack(["bytes", "uint256"], [bytes, nonce]);
    const digest = ethers.utils.keccak256(encodedWithNonce);

    const sign = await owner.signMessage(ethers.utils.arrayify(digest));
    const sign1 = await addr1.signMessage(ethers.utils.arrayify(digest));

    await hardhatMarketPrediction.submitVote(1, bytes, nonce, [sign, sign1]);
    const ipfsHashReceive = await hardhatMarketPrediction.getsubmitVoted(1, owner.address);
    const bytesRevert = ethers.utils.toUtf8String(ipfsHashReceive);
    expect(ipfsHash).to.equal(bytesRevert);
  });
});
