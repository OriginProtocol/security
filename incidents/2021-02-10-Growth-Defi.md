# GrowthDeFi Exploit

_Franck, Feb 10, 2021._

## Summary

[Growth DeFi](https://growthdefi.com/) Is a DeFi protocol centered around the GRO and stkGRO (staked) tokens.

On Feb 8, one of the [rAAVE](https://raave.io/) staking pool(rAAVE/stkGRO) pool was attacked and the attacker stole ~800 ETH ($1.3M).


## Technical description

A very detailed analysis by the GrowthDeFi team can be found [here](https://growthdefi.medium.com/raave-farming-contract-exploit-explained-f3b6f0b3c1b3) and summary in this (article)[https://rekt.eth.link/the-big-combo/].

The vulnerability was caused by a missing input validation on the contract method for staking pool contract.
- It allowed the attacker to created a fake token called AXZ and to supply rAXZZ/GRO liquidity into a Uniswap pool they created.
- They then staked the LP tokens from that pool into the stkGRO/rAAVE pool (due to the missing validation).
- Finally, they were able to then withdrew from the pool to gain rAAVE and GRO token that they liquidated for ETH.

Here is the [fix](https://github.com/GrowthDeFi/raave-v1-core/commit/d33dafd82d38c693fba8e23966c81830ca4a4168).

## Timeline

- Attack started at Feb-08-2021 06:17:19 PM +UTC
- Attack ended on Feb-08-2021 06:23:29 PM +UTC with 

## Conclusion

The root cause of the exploit was a missing check in a core method of a staking pool contract.
 - This was [custom](https://github.com/GrowthDeFi/raave-v1-core/blob/master/contracts/modules/UniswapV2LiquidityPoolAbstraction.sol) contract code, not forked.
 - While some contracts from GrowthDefi were [audited](https://consensys.net/diligence/audits/2020/12/growth-defi-v1/#potentially-dangerous-use-of-a-cached-exchange-rate-from-compound), it does not seem the audit included the exploited contract.
 - The amount of [unit tests](https://github.com/GrowthDeFi/raave-v1-core/tree/master/test) for those contracts is minimal.

Overall, there is no reason to believe OUSD is currently at risk of a similar attack.
But this is a good reminder that defensive code and thorough unit testing of edge cases are critical tools to ensure the security of a protocol.  
