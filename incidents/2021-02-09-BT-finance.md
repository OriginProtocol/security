# BT.finance Exploit

_Shahul Hameed, Feb 09, 2021._

## Summary

BT.finance is a DeFi product that focuses on yield generation on Ethereum blockchain. Most of their code is borrowed from Yearn.Finance and Uniswap. 

An attack was targeted at some of their vault contracts and this has led to an loss of at least $1.7m of user funds. This attack is similar to the attack on Yearn a few days ago.

## Technical description

A detailed analysis [is over here](https://ethtx.info/mainnet/0xc71cea6fa00d11e98f6733ee8740f239cb37b11dec29e7cf85d7a4077977fa65)

_Using the [transactions](https://etherscan.io/tx/0xc71cea6fa00d11e98f6733ee8740f239cb37b11dec29e7cf85d7a4077977fa65) as an example._

1. Borrow 100k ETH from dYdX to the controller contract
2. Create a new contract 
   1. Add 57.659k ETH liquidity to StableSwapSETH Pool to cause price imbalance for ETH/sETH pair
   2. Deposit 4.43k ETH to BT.finance's ETH vault which in turns add that as liquidity to StableSwapSETH Pool
   3. Withdraw 57.659k ETH liquidity from StableSwapSETH Pool, also burns any lpToken (eCRV) to get more ETH than deposited.
   4. Transfer from the vault to the address (where another exploit contract would be created)
   5. Create the second exploit contract with create2
   6. Call `suicide` on both exploit contracts after transferring balance to the controller contract
3. Repeat Step 2, 5 times, earning 2k ETH each time. 
4. Repay borrowed ETH from dYdX

At the end of the transaction, the attacker ended up with 10k ETH. With $1700/ETH price, it's about $1.7m in value.

## Timeline

- Attack started at Feb-08-2021 08:10:01 PM +UTC with a series transactions adding and removing liquidity from this [contract] (https://etherscan.io/address/0x54b5ae5ebe86d2d86134f3bb7e36e7c83295cbcb)

## Conclusion

The root cause of the exploit seem to be causing price imbalance in the Curve's sETH pool and benefitting from it. The same exploit should not work on OUSD, since we are not using any of Curve's pools right now. But we should definitely consider a way to detect and prevent flash loan attacks at contract-level.
