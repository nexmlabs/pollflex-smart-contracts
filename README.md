# Nexm Blockchain Vote 

Developing a decentralized application (DApp) on the blockchain that allows users to create and fill forms, as well as vote in various events or polls. The application will leverage the transparency, immutability, and security features provided by the blockchain technology.

The project aims to develop a Dapp on the Ethereum blockchain utilizing the Ethereum Virtual Machine (EVM). The initial focus will be on creating forms and conducting votes, leveraging the transparency and security features provided by the EVM.

The project may later expand to include market prediction capabilities, utilizing smart contracts and the EVM's functionality for decentralized trading and settlement.

## Install dependences

```bash
pnpm install
```

## Test

```bash
pnpm run test
REPORT_GAS=true pnpm run test
```

## Deploy

```bash
pnpm run:gnosis <path to file>
pnpm run:avax <path to file>
pnpm run:bnb <path to file>
```

## MVP1

- Create vote poll, form;
- Submit vote, form; Can only submit 1 time, can not edit;
- Can get vote poll format;
- Can get vote data detail;
