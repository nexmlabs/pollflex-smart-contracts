import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import "@openzeppelin/test-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { VotePollV1 } from "../typechain-types";
import { bytes32toIpfs, ipfsToBytes32 } from "../utils/bytes32";

const emptyBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
// https://cloudflare-ipfs.com/ipfs/Qma4wwQ3faiCdLSGD3T49gaR6fEbxycmdrRC9mKcV3Z9cg
const ipfsHash = "Qma4wwQ3faiCdLSGD3T49gaR6fEbxycmdrRC9mKcV3Z9cg";

describe("VotePollV1", function () {
  async function deploy() {
    const VotePollV1SMC = await ethers.getContractFactory("VotePollV1");
    const deployVotePollV1 = await upgrades.deployProxy(VotePollV1SMC);
    const votePollV1 = await (deployVotePollV1 as VotePollV1).deployed();

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    return { votePollV1, owner, addr1, addr2, addr3 };
  }

  describe("pause/unpause", async () => {
    let votePollV1: Contract, owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;

    before(async () => {
      const data = await loadFixture(deploy);

      votePollV1 = data.votePollV1;
      owner = data.owner;
      addr1 = data.addr1;
      addr2 = data.addr2;
    });

    it("can not unpause by user", async () => {
      await expect(votePollV1.connect(addr2).unpause()).to.be.revertedWith(
        "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
      );
    });

    it("can not create vote when paused", async () => {
      await expect(votePollV1.connect(addr2).createVotePoll(ipfsToBytes32(ipfsHash))).to.revertedWith("Pausable: paused");
    });

    it("can unpause by admin", async () => {
      await expect(votePollV1.connect(owner).unpause()).to.not.reverted;
    });

    it("can create vote when unpaused", async () => {
      await expect(votePollV1.connect(addr2).createVotePoll(ipfsToBytes32(ipfsHash))).to.not.reverted;
    });

    it("can pause by admin", async () => {
      await expect(votePollV1.connect(owner).pause()).to.not.reverted;
    });

    it("can not create vote when paused again", async () => {
      await expect(votePollV1.connect(addr2).createVotePoll(ipfsToBytes32(ipfsHash))).to.revertedWith("Pausable: paused");
    });
  });

  describe("signer", async () => {
    it("admin can add signer", async () => {
      const { votePollV1, owner, addr1 } = await loadFixture(deploy);

      await expect(votePollV1.connect(owner).addSigner(addr1.address)).to.not.reverted;
    });

    it("user can not add signer", async () => {
      const { votePollV1, addr1, addr2 } = await loadFixture(deploy);

      await expect(votePollV1.connect(addr1).addSigner(addr2.address)).to.reverted;
    });

    it("admin can remove signer", async () => {
      const { votePollV1, owner, addr1 } = await loadFixture(deploy);

      await expect(votePollV1.connect(owner).removeSigner(addr1.address)).to.not.reverted;
    });

    it("user can not remove signer", async () => {
      const { votePollV1, addr1, addr2 } = await loadFixture(deploy);

      await expect(votePollV1.connect(addr1).removeSigner(addr2.address)).to.revertedWith(
        "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
      );
    });
  });

  describe("poll id", async () => {
    it("everyone can get next vote poll id", async () => {
      const { votePollV1, owner, addr1, addr2 } = await loadFixture(deploy);

      expect(await votePollV1.connect(owner).nextId()).to.equal(0);
      expect(await votePollV1.connect(addr1).nextId()).to.equal(0);
      expect(await votePollV1.connect(addr2).nextId()).to.equal(0);
    });
  });

  describe("vote poll", async () => {
    it("can create vote poll when unpaused", async () => {
      const { votePollV1, owner, addr1, addr2 } = await loadFixture(deploy);

      expect(await votePollV1.connect(owner).unpause()).to.not.reverted;
      expect(await votePollV1.connect(addr2).nextId()).to.equal(0);

      const ipfsHash1 = "Qma4wwQ3faiCdLSGD3T49gaR6fEbxycmdrRC9mKcV3Z9cg";
      // https://cloudflare-ipfs.com/ipfs/Qma4wwQ3faiCdLSGD3T49gaR6fEbxycmdrRC9mKcV3Z9cg
      const bytes1 = ipfsToBytes32(ipfsHash1);
      await votePollV1.connect(addr1).createVotePoll(bytes1);
      expect(await votePollV1.connect(addr2).nextId()).to.equal(1);
      const voteForm1 = await votePollV1.connect(addr2).getVotePoll(0);
      expect(bytes32toIpfs(voteForm1.ipfsHash)).to.equal(ipfsHash1);

      const ipfsHash2 = "QmVfGXz6oqTPB5K6m31Qe1oHB3ap7aJWLRw6B6c8WmrYix";
      // https://cloudflare-ipfs.com/ipfs/QmVfGXz6oqTPB5K6m31Qe1oHB3ap7aJWLRw6B6c8WmrYix
      const bytes2 = ipfsToBytes32(ipfsHash2);
      await votePollV1.connect(addr1).createVotePoll(bytes2);
      expect(await votePollV1.connect(addr2).nextId()).to.equal(2);
      const voteForm2 = await votePollV1.connect(addr2).getVotePoll(1);
      expect(bytes32toIpfs(voteForm2.ipfsHash)).to.equal(ipfsHash2);

      const ipfsHash3 = "QmRHo5GZrmDmMEs4ffMvqtfd1rRfUJ9TKUrFDmbjbv7sLK";
      // https://cloudflare-ipfs.com/ipfs/QmRHo5GZrmDmMEs4ffMvqtfd1rRfUJ9TKUrFDmbjbv7sLK
      const bytes3 = ipfsToBytes32(ipfsHash3);
      await votePollV1.connect(addr1).createVotePoll(bytes3);
      expect(await votePollV1.connect(addr2).nextId()).to.equal(3);
      const voteForm3 = await votePollV1.connect(addr2).getVotePoll(2);
      expect(bytes32toIpfs(voteForm3.ipfsHash)).to.equal(ipfsHash3);
    });
  });

  describe("vote", async () => {
    let votePollV1: Contract, owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress;

    beforeEach(async () => {
      const data = await loadFixture(deploy);

      votePollV1 = data.votePollV1;
      owner = data.owner;
      addr1 = data.addr1;
      addr2 = data.addr2;
      addr3 = data.addr3;

      expect(votePollV1.connect(owner).unpause()).to.not.reverted;
      expect(await votePollV1.connect(addr2).nextId()).to.equal(0);

      const ipfsHash1 = "Qma4wwQ3faiCdLSGD3T49gaR6fEbxycmdrRC9mKcV3Z9cg";
      // https://cloudflare-ipfs.com/ipfs/Qma4wwQ3faiCdLSGD3T49gaR6fEbxycmdrRC9mKcV3Z9cg
      const bytes1 = ipfsToBytes32(ipfsHash1);
      await votePollV1.connect(addr1).createVotePoll(bytes1);
      expect(await votePollV1.connect(addr2).nextId()).to.equal(1);
      const voteForm1 = await votePollV1.connect(addr2).getVotePoll(0);
      expect(bytes32toIpfs(voteForm1.ipfsHash)).to.equal(ipfsHash1);

      await expect(votePollV1.connect(owner).addSigner(addr1.address)).to.not.reverted;
    });

    it("can make vote", async () => {
      const bytes1 = ipfsToBytes32(ipfsHash);
      const encoded = ethers.utils.solidityPack(["uint256", "address", "bytes32"], [0, addr2.address, bytes1]);
      const digest = ethers.utils.keccak256(encoded);

      const sign1 = await addr1.signMessage(ethers.utils.arrayify(digest));
      const sign2 = await addr2.signMessage(ethers.utils.arrayify(digest));

      await expect(votePollV1.connect(addr2).submitVote(0, bytes1, [sign1, sign2])).to.not.reverted;

      const voteData1 = await votePollV1.connect(addr2).getVote(0, addr2.address);
      const voteData2 = await votePollV1.connect(addr2).getVote(0, addr1.address);

      expect(bytes32toIpfs(voteData1)).to.equal(ipfsHash);
      expect(voteData2).to.equal(emptyBytes32);
    });

    it("can not make vote wrong signer", async () => {
      const bytes1 = ipfsToBytes32(ipfsHash);
      const encoded = ethers.utils.solidityPack(["uint256", "address", "bytes32"], [0, addr2.address, bytes1]);
      const digest = ethers.utils.keccak256(encoded);

      const sign1 = await addr3.signMessage(ethers.utils.arrayify(digest));
      const sign2 = await addr2.signMessage(ethers.utils.arrayify(digest));

      await expect(votePollV1.connect(addr2).submitVote(0, bytes1, [sign1, sign2])).to.revertedWith("invalid signer");

      const voteData1 = await votePollV1.connect(addr2).getVote(0, addr2.address);
      const voteData2 = await votePollV1.connect(addr2).getVote(0, addr1.address);

      expect(voteData1).to.equal(emptyBytes32);
      expect(voteData2).to.equal(emptyBytes32);
    });

    it("can not make vote 2 time", async () => {
      const bytes1 = ipfsToBytes32(ipfsHash);
      const encoded = ethers.utils.solidityPack(["uint256", "address", "bytes32"], [0, addr2.address, bytes1]);
      const digest = ethers.utils.keccak256(encoded);

      const sign1 = await addr1.signMessage(ethers.utils.arrayify(digest));
      const sign2 = await addr2.signMessage(ethers.utils.arrayify(digest));

      await expect(votePollV1.connect(addr2).submitVote(0, bytes1, [sign1, sign2])).to.not.reverted;

      const voteData1 = await votePollV1.connect(addr2).getVote(0, addr2.address);
      const voteData2 = await votePollV1.connect(addr2).getVote(0, addr1.address);

      expect(bytes32toIpfs(voteData1)).to.equal(ipfsHash);
      expect(voteData2).to.equal(emptyBytes32);

      await expect(votePollV1.connect(addr2).submitVote(0, bytes1, [sign1, sign2])).to.revertedWith("Voted already");
    });

    it("can not make vote when paused", async () => {
      expect(votePollV1.connect(owner).pause()).to.not.reverted;

      const bytes1 = ipfsToBytes32(ipfsHash);
      const encoded = ethers.utils.solidityPack(["uint256", "address", "bytes32"], [0, addr2.address, bytes1]);
      const digest = ethers.utils.keccak256(encoded);

      const sign1 = await addr1.signMessage(ethers.utils.arrayify(digest));
      const sign2 = await addr2.signMessage(ethers.utils.arrayify(digest));

      await expect(votePollV1.connect(addr2).submitVote(100, bytes1, [sign1, sign2])).to.revertedWith("Pausable: paused");
    });

    it("can not make vote if vote id do not exist", async () => {
      const bytes1 = ipfsToBytes32(ipfsHash);
      const encoded = ethers.utils.solidityPack(["uint256", "address", "bytes32"], [0, addr2.address, bytes1]);
      const digest = ethers.utils.keccak256(encoded);

      const sign1 = await addr1.signMessage(ethers.utils.arrayify(digest));
      const sign2 = await addr2.signMessage(ethers.utils.arrayify(digest));

      await expect(votePollV1.connect(addr2).submitVote(100, bytes1, [sign1, sign2])).to.revertedWith("Vote poll do not exist");
    });
  });
});
