import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import abi from "ethereumjs-abi";

describe("WordBreak", function () {
  let WordBreak;
  let wordBreak: any;

  beforeEach(async function () {
    WordBreak = await ethers.getContractFactory(
      "WordBreak"
    );

    wordBreak = await WordBreak.deploy();
    await wordBreak.deployed();
  });

  it("should return true when validate", async function () {
    const targetString = "codeguyduy";
    const wordList = ["codeguyduy"];
    const result = await wordBreak.verify(targetString, wordList);
    expect(result).to.equal(true);
  });

});




function parseEther(amount: Number) {
  return ethers.utils.parseUnits(amount.toString(), 18);
}
describe.skip("SignatureVerification", function () {
  let SignatureVerification;
  let signatureVerification: any;
  let owner: any;

  beforeEach(async function () {
    SignatureVerification = await ethers.getContractFactory(
      "SignatureVerification"
    );
    [owner] = await ethers.getSigners();

    signatureVerification = await SignatureVerification.deploy();
    await signatureVerification.deployed();
  });

  it("should return the correct signer", async function () {
    const message = "XXug25sDjb";
    const signature = await owner.signMessage(message);
    const result = await signatureVerification.verifySignature(
      message,
      signature
    );
    expect(result).to.equal(true);
  });

  it("should return the correct signer with bytes message", async function () {
    const message = "XXug25sDjb";

    const hash = abi.soliditySHA3(["string"], [message]);

    const signature = await owner.signMessage(hash);

    const result = await signatureVerification.verifyBytesMessageSignature(
      ethers.utils.hexlify(hash),
      signature
    );

    expect(result).to.equal(true);
  });
});

describe.skip("MyNFT", function () {
  const nativeTokenPriceInit = ethers.utils.parseEther("0.1");
  const erc20TokenPriceInit = ethers.utils.parseEther("1");

  async function deployTokenFixture() {
    const UIT = await ethers.getContractFactory("UIT");
    const MyNFT = await ethers.getContractFactory("MyNFT");

    const hardhatUIT = await (await UIT.deploy()).deployed();

    const MyNFTDeploy = await MyNFT.deploy(
      "MyNFT",
      "NFT",
      nativeTokenPriceInit,
      hardhatUIT.address,
      erc20TokenPriceInit,
      "localhost:3000"
    );
    const hardhatMyNFT = await MyNFTDeploy.deployed();

    const [owner, addr1, addr2] = await ethers.getSigners();
    return { hardhatUIT, hardhatMyNFT, owner, addr1, addr2 };
  }

  it("should check all of NFTs", async () => {
    const { hardhatUIT, hardhatMyNFT, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    const nativeTokenPrice = await hardhatMyNFT.nativeTokenPrice();
    const erc20TokenPrice = await hardhatMyNFT.erc20TokenPrice();

    /**verify metadata url */
    const metadataBaseUrl = await hardhatMyNFT.getMetadataBaseUrl();
    expect(metadataBaseUrl).to.equal("localhost:3000");

    /**count nft in address */
    const currentCountOwner = await hardhatMyNFT.balanceOf(owner.address);
    const currentCountAddr1 = await hardhatMyNFT.balanceOf(addr1.address);
    const currentCountAddr2 = await hardhatMyNFT.balanceOf(addr2.address);
    expect(currentCountOwner).to.equal(0);
    expect(currentCountAddr1).to.equal(0);
    expect(currentCountAddr2).to.equal(0);

    /**count token in address */
    let tokenCountOwner = await hardhatUIT.balanceOf(owner.address);
    const tokenCountUser1 = await hardhatUIT.balanceOf(addr1.address);
    let tokenCountUser2 = await hardhatUIT.balanceOf(addr2.address);

    expect(tokenCountOwner).to.equal(parseEther(50_000_000_000));
    expect(tokenCountUser1).to.equal(0);
    expect(tokenCountUser2).to.equal(0);

    await hardhatUIT.transfer(addr2.address, parseEther(100));
    const tokenCountOwnerAfter = await hardhatUIT.balanceOf(owner.address);
    tokenCountUser2 = await hardhatUIT.balanceOf(addr2.address);
    expect(tokenCountOwnerAfter).to.equal(tokenCountOwner.sub(tokenCountUser2));
    expect(tokenCountUser2).to.equal(parseEther(100));
    tokenCountOwner = tokenCountOwnerAfter;

    /**mint nft */
    await hardhatMyNFT.mint1({ value: nativeTokenPrice });

    await hardhatMyNFT.connect(addr1).mint1({ value: nativeTokenPrice });
    await hardhatMyNFT.connect(addr1).mint1({ value: nativeTokenPrice });

    await hardhatUIT
      .connect(addr2)
      .approve(hardhatMyNFT.address, erc20TokenPrice);
    await hardhatMyNFT.connect(addr2).mint2(erc20TokenPrice);
    await hardhatUIT
      .connect(addr2)
      .approve(hardhatMyNFT.address, erc20TokenPrice);
    await hardhatMyNFT.connect(addr2).mint2(erc20TokenPrice);
    await hardhatUIT
      .connect(addr2)
      .approve(hardhatMyNFT.address, erc20TokenPrice);
    await hardhatMyNFT.connect(addr2).mint2(erc20TokenPrice);

    /**check money deducted */
    const tokenCountUser2Current = await hardhatUIT.balanceOf(addr2.address);
    const erc20TokenPriceTotal = erc20TokenPrice.mul(3);
    expect(tokenCountUser2Current).to.equal(
      tokenCountUser2.sub(erc20TokenPriceTotal)
    );

    /**check the amount of nft mint */
    const currentCountOwnerAfter = await hardhatMyNFT.balanceOf(owner.address);
    const currentCountAddr1After = await hardhatMyNFT.balanceOf(addr1.address);
    const currentCountAddr2After = await hardhatMyNFT.balanceOf(addr2.address);

    expect(1).to.equal(currentCountOwnerAfter.sub(currentCountOwner));
    expect(2).to.equal(currentCountAddr1After.sub(currentCountAddr1));
    expect(3).to.equal(currentCountAddr2After.sub(currentCountAddr2));
  });

});
