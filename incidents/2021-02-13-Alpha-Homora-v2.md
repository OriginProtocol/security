# DRAFT - Alpha Hormora v2 Exploit

_Josh Fraser 2021-2-13._

*This is a sophisticated hack involving complex interactions between multiple DeFi protocols. Many details of this hack are still not yet clear. We'll be updating this post as we know more.*

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

As if often the case, this attack involved a flash loan and multiple DeFi players, including the newly launched IronBank from Cream. At first glance, it looks like the money came from Cream Finance, but judging by the communication from the Cream & Alpha teams, the root cause and target of the attack appears to have been Alpha Finance.

Within the last few days, Alpha Homora had deployed an upgrade aimed at preventing flash loans. As a result of this code change, this attack required 9 seperate transactions instead of 1. However, while this flash-loan prevention slowed down the attack, it still didn't prevent $37.5M worth of ETH and stablecoins from being taken. 

It's possible that Alpha finance is left with a debt that they need to pay back to the Iron Bank. Whether or not this is a collateralized loan or not is still unclear. Alpha Homora's [treasury](https://etherscan.io/address/0x580ce7b92f185d94511c9636869d28130702f68e) currently holds $1.6B worth of ALPHA tokens. It is unclear whether this treasury will be used to pay off the debt. Some people are saying on [Twitter](https://twitter.com/FUTURE_FUND_/status/1360573833271341056) that Alpha Finance had collateral deposited in the Iron Bank (Cream) that was waiting to be used & this is the [actual reserve](](https://etherscan.io/address/0x67b66c99d3eb37fa76aa3ed1ff33e8e39f0b9c7a)) that is holding significantly less collateral. I expect this will be clearer once we hear from the affected teams.

After the attack, the hacker sent 1k ETH back to Alpha's deployer address, 1k ETH to CREAM Finance’s deployer address. 100 ETH to Tornado Cash, and 100 ETH to the Gitcoin grant for Tornado.

## Details

 - [Alpha Homora UI](https://homora-v2.alphafinance.io/earn)
 - [Alpha Homora v2 code & details](https://github.com/AlphaFinanceLab/homora-v2)

 - Attackers wallet: [0x905315602ed9a854e325f692ff82f58799beab57](https://etherscan.io/address/0x905315602ed9a854e325f692ff82f58799beab57)
 - Attack contract: [0x560a8e3b79d23b0a525e15c6f3486c6a293ddad2](https://etherscan.io/address/0x560a8e3b79d23b0a525e15c6f3486c6a293ddad2)

## Audits

Alpha Homora was previously audited by [Quantstamp](https://github.com/AlphaFinanceLab/homora-v2/blob/master/audits/Alpha-Homora-v2-Quantstamp-audit-report.pdf) and [Peckshield](https://github.com/AlphaFinanceLab/homora-v2/blob/master/audits/Alpha-Homora-v2-Peckshield-audit-report.pdf). Quantstamp found 4 high-severity issues which were all subsequently fixed. Peckshield did not report any high-severity issues.

## Notable Transactions:

 - The attacker was able to duplicate sUSD after calling `resolveAddress(address token)` on [0x98f623af655f1e27e1c04ffe0bc8c9bbdb35d39999913bedfe712d4058c67c0e](https://etherscan.io/tx/0x98f623af655f1e27e1c04ffe0bc8c9bbdb35d39999913bedfe712d4058c67c0e)

 - One of the weirdest transactions I've ever seen and possibly the crux of the attack: [0x2e387620bb31c067efc878346742637d650843210596e770d4e2d601de5409e3](https://etherscan.io/tx/0x2e387620bb31c067efc878346742637d650843210596e770d4e2d601de5409e3). This is the same `execute()` function that was later updated by the Alpha team to limit the addresses that can issue spells.

# Attack

**To-do: document each of the 39 steps of the attack:**

- [https://etherscan.io/txs?a=0x905315602ed9a854e325f692ff82f58799beab57](https://etherscan.io/txs?a=0x905315602ed9a854e325f692ff82f58799beab57)

 - The attacker converted sUSD to cyUSD. then deposited the cyUSD to withdraw other assets from Cream, hence the $30+ Million worth of ETH and other assets.

 - A quick summary: https://twitter.com/FrankResearcher/status/1360513422689984512

 - Not sure what this means yet: https://twitter.com/FrankResearcher/status/1360540369084153857

## Fix


Alpha's newly deployed Bank contract includes a whitelist of 5 spells that is missing in the [published version of this contract in Github](https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/HomoraBank.sol#L382). This initially lead me to believe that this missing validation check was the issue, but Banteg & Samczsun both said this isn't the root cause. I'll update this report after Alpha publish their post-mortem or we have more clarity on the root cause.

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

## Alpha's response

Alpha Finance deployed two new contracts following the attack to upgrade the HomoraBank.

 - Alpha [deployed](https://etherscan.io/tx/0x00939297e202222924a764044807ce4eee1fe81c6fdb67e73f675ecd1f01952e0) this contract: https://etherscan.io/address/0x6f80c10eafa1d3f7d8cc9f36bf39d301c7a7ad86#code (unverified)

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
- Jose Baredes sounded the alarm on [Twitter](https://twitter.com/josebaredes/status/1360476183373242370?s=20) at 2021-02-13 6:29 AM +UTC
- This first draft of this report was published at 2021-02-13 6:18 PM +UTC

## Conclusion

At this time, while the root cause is still unclear, there is no reason to believe that OUSD would be impacted by the attack. It's clear that the attack is specific to Alpha and possibly the Iron Bank / Cream.