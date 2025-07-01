const { ethers, network, run } = require('hardhat');
const { default: bs58 } = require('bs58');
const config = require('../config');
const { deployerAirdrop } = require('./utils');
const fs = require('fs');
const path = require('path');

async function main() {
  await run('compile');

  console.log('\nNetwork name: ' + network.name);

  if (!process.env.DEPLOYER_KEY) {
    throw new Error('\nMissing private key: DEPLOYER_KEY');
  }

  const deployer = (await ethers.getSigners())[0];
  await deployerAirdrop(deployer, 10000);

  const mintAuthority = deployer.address; // Set deployer as mint authority

  // Collect deployed token info
  const tokensV1 = [];
  tokensV1.push(await deployERC20ForSPLMintable(
    'good_token',
    'Goodness Token',
    'GOOD',
    9,
    mintAuthority
  ));
  tokensV1.push(await deployERC20ForSPLMintable(
    'web3_power',
    'Web3 Power',
    'WEB3',
    9,
    mintAuthority
  ));
  tokensV1.push(await deployERC20ForSPLMintable(
    'gift_token',
    'Gift Token',
    'GIFT',
    6,
    mintAuthority
  ));

  // If you have v2 tokens, collect them similarly:
  const tokensV2 = [];

  // Write to deployed-tokens.json
  const outputPath = path.resolve(__dirname, '../deployed-tokens.json');
  try {
    await fs.promises.writeFile(outputPath, JSON.stringify({ tokensV1, tokensV2 }, null, 2));
    console.log('Deployed token info written to deployed-tokens.json');
    console.log('Wrote deployed-tokens.json to:', outputPath);
  } catch (error) {
    console.error('Error writing deployed-tokens.json:', error);
    throw error;
  }

  console.log('\n');
}

async function deployERC20ForSPLMintable(
  tokenKey,
  name,
  symbol,
  decimals,
  mintAuthority,
  contract = 'contracts/erc20-for-spl/ERC20ForSPL.sol:ERC20ForSplMintable'
) {
  const ERC20ForSPLMintableContractFactory = await ethers.getContractFactory(contract);
  let token;
  if (!config[tokenKey][network.name]) {
    console.log(`\nDeploying ERC20ForSPLMintable contract to ${network.name}...`);
    token = await ERC20ForSPLMintableContractFactory.deploy(
      name,
      symbol,
      decimals,
      mintAuthority
    );
    await token.waitForDeployment();
    console.log(`ERC20ForSPLMintable contract deployed to: ${token.target}`);
  } else {
    console.log(`\nERC20ForSPLMintable contract already deployed to: ${config[tokenKey][network.name]}`);
    token = ERC20ForSPLMintableContractFactory.attach(config[tokenKey][network.name]);
  }

  const tokenAddress = token.target;
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const tokenDecimals = await token.decimals();
  const tokenMint = await token.tokenMint();
  const address_spl = bs58.encode(ethers.getBytes(tokenMint));

  console.log(`\nToken address: ${tokenAddress}`);
  console.log(`Token spl address: ${address_spl}`);
  console.log(`Token name: ${tokenName}`);
  console.log(`Token symbol: ${tokenSymbol}`);
  console.log(`Token decimals: ${tokenDecimals}`);
  console.log(`Token mint authority: ${mintAuthority}`);

  return {
    address: tokenAddress,
    address_spl: address_spl,
    name: tokenName,
    symbol: tokenSymbol,
    decimals: Number(tokenDecimals)
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = {
  deployERC20ForSPLMintable
};
