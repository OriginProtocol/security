# 2020-12 Warp Finace

_Daniel Von Fange 2020-12-21._

## What happened.

Attacker chained together six flashloans to bend the ETH-DAI uniswap pool, used as a colateral pricing oracle by warp finace. 

About $7.7 million was taken from Warp finance. The attacker ended up with slightly less than $1 million, (uniswap/sushiswap) LP's gained slightly more than $1 million, and the attacker left behind 5.5 million in collateral. (All numbers is are approximate.)


## How it works.

https://etherscan.io/tx/0x8bb8dc5c7c830bac85fa48acad2505e9300a91c3ff239c9517d0cae33b595090

The core vunerabilty was using uniswap as an oracle. The rest of the attack followed the usual pattern. Tornado, flashloans, bend-oracle and attack, convert and unwind.

Vulnerable uniswap oracle code:
https://github.com/warpfinance/Warp-Contracts/blob/b25a6db4b430fb162d3b0bce1f3529c9f2761321/contracts/UniswapLPOracleFactory.sol#L114-L167


A notable feature of the attack was the use of many AMMs. Five stacked flashloans (three from Uniswap, two from dydx) for the initial captial, then converting back to coins on the wind-down via a third AMM, Sushi.


## What allowed this to happen?

1. Using a naked uniswap/amm to price collateral is simply going to result in a loss of funds.

## Are we vulnerable?

We should not be vulnerable to this attack. We don't use any AMM based oracles.

In addtion, the Vault protects the OUSD's funds against mispriced oracles, with a design goal of making a mispriced oracle work againt the user doing the transacting.

We do use an Open Price Feed oracle that uses a TWAP uniswap price as a circut breaker to stop malicious coinbase oracle updates. This oracle is also used by Compound. In thoery this should be resistant to flash loans.

Aave uses Chainlink oracles, not AMM oracles, falling back to their own prices that they upload to a fallback oracle.

## What went right.

1. Fast communication to community from Warp
2. Attacker left 5.5 million of colateral locked in Warp's contracts. Warp was able to upgrade their contract with a backdoor to "steal" these funds back, to be returned to the community. This reduced the size of the losses.