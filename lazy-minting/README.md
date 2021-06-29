# 🛌 🌿 Lazy minting example

> An example Solidity contract for "buyer pays" minting at the time of first sale.

This directory contains example code written for the [Lazy Minting guide on NFT School](https://nftschool.dev/how-to/lazy-minting/). See the full article for context and details on how everything works!

The basic gist is that the gas cost to mint an NFT is pushed onto the buyer as part of the first sale transaction. This works by having the NFT creator sign a "voucher" containing the data that will be recorded into the blockchain when the NFT is minted.

## About the code

The Solidity contract is in [contracts/LazyNFT.sol](./contracts/LazyNFT.sol). It defines an [ERC721](https://eips.ethereum.org/EIPS/eip-721) smart contract that allows an NFT buyer to `redeem` a signed data structure called an `NFTVoucher` that represents an NFT.

In JavaScript, we have a `LazyMinter` class, defined in [lib/LazyMinter.js](./lib/LazyMinter.js). The `LazyMinter` is initialized with the address of the deployed contract and an [ethers.js](https://docs.ethers.io/v5/) [`Signer`](https://docs.ethers.io/v5/api/signer/) that holds the NFT creator's private signing key. You can use the `LazyMinter`'s `createVoucher` method to get an `NFTVoucher` object and signature that can be given to a buyer. The buyer can then present those to the `redeem` function to mint and purchase the NFT.

### Signatures

To turn an `NFTVoucher` into a real NFT, the buyer needs to present a valid signature that was produced by an account authorized to mint NFTs.

Signatures are produced according to [EIP-712](https://eips.ethereum.org/EIPS/eip-712), the draft standard for creating signatures of typed, structured data. This allows wallets like MetaMask to present a "human readable" view of the data being signed, and it prevents some nasty classes of replay attack by "tying" signatures to a specific instance of a specific smart contract.

See the `createVoucher` method and its helpers in [lib/LazyMinter.js](./lib/LazyMinter.js) to see how signature creation works. The validation in Solidity is done in the `_hash` and `_verify` private functions of the `LazyNFT` contract.

## Usage

There is currently no "user interface", but you can run the [unit tests](./test/lazy-test.js):

```bash
npm install

npm run test
```

```text
> lazy-mint-example@1.0.0 test
> npx hardhat test

Compiling 15 files with 0.8.4
Compilation finished successfully


  LazyNFT
    ✓ Should deploy (747ms)
    ✓ Should redeem an NFT from a signed voucher (163ms)
    ✓ Should fail to redeem an NFT that's already been claimed (138ms)
    ✓ Should fail to redeem an NFT voucher that's signed by an unauthorized account (90ms)
    ✓ Should fail to redeem an NFT voucher that's been modified (82ms)
    ✓ Should redeem if payment is >= minPrice (116ms)
    ✓ Should fail to redeem if payment is < minPrice (75ms)
    ✓ Should make payments available to minter for withdrawal (110ms)


  8 passing (2s)
```
