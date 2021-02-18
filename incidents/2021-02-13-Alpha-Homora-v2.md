# Alpha Hormora v2 Exploit

_Josh Fraser 2021-2-13._

## Background

Alpha Finance Lab is an ecosystem of DeFi products w/ a focus on innovation.

This attack was on Alpha Homora v2, which is a protocol for leveraging your position in yield farming pools. ETH lenders can earn high interest on ETH, and yield farmers can get even higher farming APY from taking on leveraged positions on yield farming.

The [Iron Bank](https://creamdotfinance.medium.com/introducing-the-iron-bank-bab9417c9a) is a new project from Andre Cronje that allows trusted protocols to borrow funds from Cream v2  w/o posting any collateral. Borrowers have a credit limit and must be whitelisted. Yearn and [Alpha Finance](https://alphafinance.io/) were two of the initial whitelisted partners.

To get a credit line from the Iron Bank, a user must have one of the following three backstops to ensure the debt is paid back:

 - A treasury large enough to cover credit
 - Cover Protocol insurance large enough to cover credit
 - Nexus Mutual insurance large enough to cover credit

It appears this attacker pretended to be Alpha and used Alpha's privledged access in order to take out a huge loan from the Iron Bank which was sent to the attacker instead of being used for the intended purpose of generating yield for the protocol.

Alpha Homora is a borrower from Iron Bank, but it's also a lending platform itself with it's own borrowers and lenders. Currently ibETHv2 collateral is at 100% utilization on [Alpha Homora](https://homora-v2.alphafinance.io/earn) and lenders are locked from withdrawing their capital. Their other pools have unusally high utilization factors.

As if often the case, this attack involved a flash loan and multiple DeFi players, including the newly launched IronBank from Cream. At first glance, it looked like the money came from Cream Finance, but communication from both the Cream & Alpha teams quickly identified the root cause and victim of the attack as Alpha Finance.

Within the last few days, Alpha Homora had deployed an upgrade aimed at preventing flash loans by adding an `onlyEOA()` modifier. As a result of this code change, this attack required 9 seperate transactions instead of 1. However, while this flash-loan prevention slowed down the attack, it still didn't prevent $37.5M worth of ETH and stablecoins from being taken. 

As  result of this attack, Alpha finance is left with a debt that they need to pay back to the Iron Bank. Alpha Homora's [treasury](https://etherscan.io/address/0x580ce7b92f185d94511c9636869d28130702f68e) currently holds $1.6B worth of ALPHA tokens. It is unclear whether this treasury will be used to pay off the debt or they will resolve this debt in some other way.

After the attack, the hacker sent 1k ETH back to Alpha's deployer address, 1k ETH to CREAM Finance’s deployer address. 100 ETH to Tornado Cash, and 100 ETH to the Gitcoin grant for Tornado.

## Details

 - [Alpha Homora UI](https://homora-v2.alphafinance.io/earn)
 - [Alpha Homora v2 code & details](https://github.com/AlphaFinanceLab/homora-v2)

 - Attackers wallet: [0x905315602ed9a854e325f692ff82f58799beab57](https://etherscan.io/address/0x905315602ed9a854e325f692ff82f58799beab57)
 - Attack contract: [0x560a8e3b79d23b0a525e15c6f3486c6a293ddad2](https://etherscan.io/address/0x560a8e3b79d23b0a525e15c6f3486c6a293ddad2)

## Audits

Alpha Homora was previously audited by [Quantstamp](https://github.com/AlphaFinanceLab/homora-v2/blob/master/audits/Alpha-Homora-v2-Quantstamp-audit-report.pdf) and [Peckshield](https://github.com/AlphaFinanceLab/homora-v2/blob/master/audits/Alpha-Homora-v2-Peckshield-audit-report.pdf). Quantstamp found 4 high-severity issues which were all subsequently fixed. Peckshield did not report any high-severity issues.

## Attack

Here are the steps of the attack, copied verbatim from the [Alpha's post-mortem](https://blog.alphafinance.io/alpha-homora-v2-post-mortem/) published on their blog.

1. The attacker created an evil spell (can think of this as equivalent to Yearn’s strategy). https://etherscan.io/tx/0x2b419173c1f116e94e43afed15a46e3b3a109e118aba166fcca0ba583f686d23

2. Attacker swaps ETH -> UNI, and supply ETH + UNI to Uniswap pool (obtaining ETH/UNI LP token). In the same tx, swap ETH -> sUSD on Uniswap and deposit sUSD to Cream’s Iron Bank (getting cysUSD)
https://etherscan.io/tx/0x4441eefe434fbef9d9b3acb169e35eb7b3958763b74c5617b39034decd4dd3ad

3. Call execute to HomoraBankV2 using the evil spell (creating position 883), performing:

 - Borrow 1000e18 sUSD
 - Deposit UNI-WETH LP to WERC20, and use as collateral (to bypass the collateral > borrow check)
 - In the process, the attacker has 1000e18 sUSD debt shares (because the attacker is the first borrower)
https://etherscan.io/tx/0xcc57ac77dc3953de7832162ea4cd925970e064ead3f6861ee40076aca8e7e571

4. Call execute to HomoraBankV2 using the evil spell again (to position 883), performing:

  - Repay 1000000098548938710983 sUSD (actual debt with interest accrued is 1000000098548938710984 sUSD), resulting in a repay share of 1 less than the total share.
 - As a result, the attacker now has 1 minisUSD debt and 1 debt share. 
https://etherscan.io/tx/0xf31ee9d9e83db3592601b854fe4f8b872cecd0ea2a3247c475eea8062a20dd41

5. Call resolveReserve on sUSD bank, accruing 19709787742196 debt, while totalShare remains 1.
Current state: totalDebt = 19709787742197, while totalShare = 1

    https://etherscan.io/tx/0x98f623af655f1e27e1c04ffe0bc8c9bbdb35d39999913bedfe712d4058c67c0e

6. Call execute to HomoraBankV2 using the evil spell again, performing (repeat 16 times, each time doubling the borrowed amount):

 - Borrow 19709787742196 minisUSD and transfer to the attacker (doubling each time, since totalDebt doubles each time the borrow is successful). Each borrow is 1 less than the totalDebt value, causing the corresponding borrow share = 0, so the protocol treats this as no debt borrowing.

    At the end of tx, the attacker deposits 19.54 sUSD to Cream’s Iron Bank.
https://etherscan.io/tx/0x2e387620bb31c067efc878346742637d650843210596e770d4e2d601de5409e3

7. Continue the process: call execute to HomoraBankV2 using the evil spell again, performing (repeat 10 times, each time doubling the borrowed amount). At the end of tx, the attacker deposits 1321 sUSD to Cream’s Iron Bank.
https://etherscan.io/tx/0x64de824a7aa339ff41b1487194ca634a9ce35a32c65f4e78eb3893cc183532a4

8. 

 - Flashloan from aave (borrowing 1,800,000 USDC)
 - Swap 1,800,000 USDC to 1,770,757.56254472419047906 sUSD, and deposit to Cream to have enough liquidity for the attacker to borrow using the custom spell
- Continued doubling the sUSD borrow from 1,322.70 sUSD to 677,223.15 sUSD (total of 10 times).
- Swap 1,353,123.59 sUSD to 1,374,960.72 USDC on Curve
- Borrow 426,659.27 USDC from Cream (since the attacker deposited sUSD already in step b.)

    https://etherscan.io/tx/0x7eb2436eedd39c8865fcc1e51ae4a245e89765f4c64a13200c623f676b3912f9

9. Repeat step 8, but with ~10M USDC (no USDC borrowing at the end)
    https://etherscan.io/tx/0xd7a91172c3fd09acb75a9447189e1178ae70517698f249b84062681f43f0e26e

10. Repeat with 10M USDC (no USDC borrowing at the end)

    https://etherscan.io/tx/0xacec6ddb7db4baa66c0fb6289c25a833d93d2d9eb4fbe9a8d8495e5bfa24ba57

11.

 - Borrow 13,244.63 WETH + 3.6M USDC + 5.6M USDT + 4.26M DAI
 - Supply the stablecoins to Aave (to get aTokens, so USDC & USDT can’t be frozen)
 - Supply aDAI, aUSDT, aUSDC to Curve a3Crv pool
    https://etherscan.io/tx/0x745ddedf268f60ea4a038991d46b33b7a1d4e5a9ff2767cdba2d3af69f43eb1b

12. Add a3Crv LP token to Curve’s liquidity gauge

    https://etherscan.io/tx/0xc60bc6ab561af2a19ebc9e57b44b21774e489bb07f75cb367d69841b372fe896

13. The rest of txs are supplying to Tornade Cash, GitCoin Grants. 1k ETH is sent to each of Cream’s and Alpha’s deployer addresses.

## Fix

Alpha's newly deployed Bank contract includes a whitelist of 5 spells that was missing in the [published version of this contract in Github](https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/HomoraBank.sol#L382). This initially lead me to believe that this missing validation check was the issue, but Banteg & Samczsun let me know that spells were open to anyone by design. It's clear from Alpha's post-mortem that this was the sledgehammer approach to fixing the issue quickly and not the actual vulnerability. 

    function execute(
        uint positionId,
        address spell,
        bytes memory data
    ) external payable lock onlyEOA returns (uint) {
        require(
            spell == 0x17c0b6568F5d72b796269e0F43dDd881AC13110b ||
            spell == 0xc671B7251a789de0835a2fa33c83c8D4afB39092 ||
            spell == 0x42C750024E02816eE32EB2eB4DA79ff5BF343D30 ||
            spell == 0x15B79c184A6a8E19a4CA1F637081270343E4D15D ||
            spell == 0x21Fa95485f4571A3a0d0c396561cF4D8D13D445d
        );
        if (positionId == 0) {
        positionId = nextPositionId++;
        positions[positionId].owner = msg.sender;
        } else {
        require(positionId < nextPositionId, 'position id not exists');
        require(msg.sender == positions[positionId].owner, 'not position owner');
        }
        POSITION_ID = positionId;
        SPELL = spell;
        HomoraCaster(caster).cast{value: msg.value}(spell, data);
        uint collateralValue = getCollateralETHValue(positionId);
        uint borrowValue = getBorrowETHValue(positionId);
        require(collateralValue >= borrowValue, 'insufficient collateral');
        POSITION_ID = _NO_ID;
        SPELL = _NO_ADDRESS;
        return positionId;
    }

In addition to the spell whitelist, Alpha deployed two other changes:

 - `resolveReserve()` function can now only be called by governor
 - Can only borrow & repay 4 tokens (ETH, DAI, USDC, USDT)

## Alpha's response

Alpha Finance deployed two new contracts following the attack to upgrade the HomoraBank.

 - Alpha [deployed](https://etherscan.io/tx/0x00939297e202222924a764044807ce4eee1fe81c6fdb67e73f675ecd1f01952e0) this contract: https://etherscan.io/address/0x6f80c10eafa1d3f7d8cc9f36bf39d301c7a7ad86#code 

 - And [initalized it](https://etherscan.io/tx/0x6c66f2bf66645427082024a2d1bedbdc1dd4fc93b9028769be88d2d590df9887) 

 - Then [updated](https://etherscan.io/tx/0xe35cb6f36881ddcda63dca85427f695e8dc065ee5718a7fcb002f04ecb3c2fdc) their [proxy](https://etherscan.io/address/0x090ece252cec5998db765073d07fac77b8e60cb2) to point to this newly deployed contact 

 - They then [deployed](https://etherscan.io/tx/0x3e6a4a3c61af2e44624cca79c53b535844012b34a239f761f25e413d3c5dd28c) a new version of HomoraBank: https://etherscan.io/address/0x525d911b9459966ed6e90f3d44613bc17dfc8be6#code

 - And [initialized it](https://etherscan.io/tx/0xf97b1137c72e6f7b00557cfd4db8015ef8932f9905586ee3a86ff9fc0a63286f)

 - Finally, they [updated](https://etherscan.io/tx/0x3fa58a4ccd57f4467a7019f69261a16a78b77c1cd89bab56c61c1e5789eabdb2) their [proxy](https://etherscan.io/address/0x090ece252cec5998db765073d07fac77b8e60cb2) to point to this newly deployed contact 

## Timeline

- Attacker funded their wallet using Tornado Cash at 2021-02-12 8:55 AM +UTC
- Attacker deployed the contract at 2021-02-13 5:37 AM +UTC
- Attackers first attempt ran out of gas at 2021-02-13 5:40 AM +UTC
- Attacker started the first of many success transactions at 2021-02-13 5:59 AM +UTC
- Attacker returns funds to Alpha, CREAM, Tornado Cash, and Gitcoin starting at 2021-02-13 6:21 AM +UTC
- Jose Baredes sounded the alarm on [Twitter](https://twitter.com/josebaredes/status/1360476183373242370?s=20) at 2021-02-13 6:29 +UTC
- Alpha deployed a fixed contract at 2021-02-13 08:44:30 +UTC
- This first draft of this report was published at 2021-02-13 18:18 +UTC
- Alpha published their [post-mortem](https://blog.alphafinance.io/alpha-homora-v2-post-mortem/) at 2021-02-13 19:33 +UTC

## Conclusion

At this time, there is no reason to believe that OUSD would be impacted by the attack. It's clear that the attack is specific to Alpha and possibly the Iron Bank / Cream.

As usual, the key takeaway is that securing smart contracts is really hard. This was clearly a highly sophisticated hack involving complex interactions between multiple DeFi protocols. It's hard to guarantee the security of a system this complex. The jury is still out on whether it's a good idea to offer uncollateralized loans to trusted smart contracts or not.
