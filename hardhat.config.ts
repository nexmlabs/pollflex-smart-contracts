import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";
import "hardhat-abi-exporter";
import { HardhatUserConfig } from "hardhat/types";

dotenv.config({ path: __dirname + "/.env" });

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    gnosis: {
      url: `https://rpc.gnosischain.com`,
      chainId: 100,
      accounts: [process.env.PRIV_KEY!],
      timeout: 2_147_483_647,
    },
    // https://docs.gnosischain.com/developers/smart-contracts/hardhat
    chiado: {
      url: `https://rpc.chiadochain.net`,
      chainId: 10200,
      accounts: [process.env.PRIV_KEY!],
      timeout: 2_147_483_647,
      gas: 500000,
      gasPrice: 1000000000,
    },
    avax: {
      url: `https://avalanche-c-chain.publicnode.com`,
      chainId: 43114,
      accounts: [process.env.PRIV_KEY!],
      timeout: 2_147_483_647,
    },
    bnbchain: {
      chainId: 56,
      url: `https://bsc-dataseed1.binance.org/`,
      accounts: [process.env.PRIV_KEY!],
      timeout: 2_147_483_647,
    },
    bnbchainTestnet: {
      chainId: 97,
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [process.env.PRIV_KEY!],
      timeout: 2_147_483_647,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
  abiExporter: {
    path: "abi",
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
  },
};

export default config;
