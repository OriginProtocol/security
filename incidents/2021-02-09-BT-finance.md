# BT.finance Exploit

_Shahul Hameed, Feb 09, 2021._

## Summary

BT.finance is a DeFi product that focuses on yield generation on Ethereum blockchain. Most of their code is borrowed from Yearn.Finance and Uniswap. 

An attack was targeted at some of their vault contracts and this has led to an loss of at least $1.7m of user funds. This attack is similar to the attack on Yearn a few days ago.

## Technical description

At a high level, the exploiter was able to profit through the following steps:

1. Debalance the exchange rate between ETH/sETH in Curve's sETH pool.
2. Make the BT's ETH vault deposit into the pool at an unfavorable exchange rate.
3. Reverse the imbalance caused in step 1.


_Using the [transactions](https://etherscan.io/tx/0xc71cea6fa00d11e98f6733ee8740f239cb37b11dec29e7cf85d7a4077977fa65) as an example._

- Borrow 100k ETH from dYdX

- Repay 100k ETH to dYdX

1. Borrow 100k ETH from dYdX to the attacker contract
2. Create a new contract 
   - Deposit 62k ETH to the new contract
   - Add 57.659k ETH liquidity to StableSwapSETH Pool to cause price imbalance for ETH/sETH pair
   - Deposit 4.43k ETH to BT.finance's ETH vault which in turns add that as liquidity to StableSwapSETH Pool using the imbalanced price
   - Withdraw 57.659k ETH liquidity from StableSwapSETH Pool, also burns any lpToken to get more ETH than deposited.
   - Deploy another contract and withdraw from the vault to the new contract and in turn transfer to the first contract (Not sure why this is being done)
   - Self-destruct both contracts after depositing remaing ETH to the attacker contract
3. Repeat Step 5 times, earning 2k ETH each time. 
4. Repay borrowed ETH from dYdX

At the end of the transaction, the attacker ended up with 10k ETH. With $1700/ETH price, it's about $1.7m in value.

## Timeline

- Attack started at Feb-08-2021 08:10:01 PM +UTC with a series transactions adding and removing liquidity from this [contract] (https://etherscan.io/address/0x54b5ae5ebe86d2d86134f3bb7e36e7c83295cbcb)


## Conclusion
???
