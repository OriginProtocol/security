# 2021-1 Saddle Finance Arbitrage

_Domen Grabec 2021-1-21._

## What happened.

Saddle Finance launched their fork of the Curve protocol. Blog post on [Rekt](https://www.rekt.news/saddle-finance-rekt/) suggests that they did so with minimal code changes. Curve was designed to more effectively provide liquidity pools for stable coins doing swaps with more depth and less slippage.

Upon contract creation Saddle Finance hasn't supplied balanced initial liquidity to the pools. Then users provided their own liquidity and pools were exposed to highly profitable arbitrage. Here is an example of swap transactions that greatly benefited the swapping user at the cost of funds lost to liquidity providers: 
- [Arb Tx 1](https://etherscan.io/tx/0x3c351cea655b8a50348e6ffa1bfff5b4ce68f99366cfad3d8a02ffb01f63138a)
- [Arb Tx 2](https://etherscan.io/tx/0x299ff1ac7fcec4624ec63bd0192f3df1fc8ca48211e898ac9d6caa828a33de46)
- [Arb Tx 3](https://etherscan.io/tx/0x40d860b536effc7f0f8814d3bc2db88a8d9c80f0b701a224b660578b049a0283)

## Reproduction

Not much technical description is needed since this wasn't so much a bug in the contract code, rather a pretty sloppy release strategy. There is still reproduction code available under `reproductions` folder. Simulating a transaction where user swapped 0.34 sBtc for 4.3 WBTC. 

