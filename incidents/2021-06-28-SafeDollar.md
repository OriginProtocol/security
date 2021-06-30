# 2021-06-28 SafeDollar

## What happend

An attacker minted an essentially infinite amount of SafeDollar, an algo-stable, through a bug in the coin's reward program. Approximately $250K was taken from liquidly pools.


### Background SafeDollar

The SafeDollar project had several pools that would reward depositors with steady flow of new SafeDollars. Each pool would get a set rate of new SafeDollars per second, split among all holders.

For example, if the pool reward was set to one dollar per second, then after ten minutes there would be six hundred dollars of rewards waiting to be split among holders by the percentage of the pool that they held.

Skipping all the complication around tracking reward amounts over time, different rates, and balance changes, the formula is:

```javascript
userReward = (seconds * rewardsPerSecond) / (userBalance / totalPoolSize)
```


### The vulnerability

The core vulnerability was a mismatch that happened between internal accounting numbers and actual balances, in the case  when a coin that charged a transaction fee was deposited and withdrawn from the pool.

The total pool size was calculated using a live call to `pool.lpToken.balanceOf(this)` and was accurate. However the user's internal pool balance was calculated based off adding and subtracting how much money the user had requested to be added or removed from the pool, not the actual amount received by the pool.

When the coin has no fee, this accounting method works. If a user has $10 in the contract, requests that $5 be added, and that request processes successfully, then both the external balance, and the internal accounting will say $15.

This goes wrong in the case of a coin with a fee. If the user requests a deposit of $100, the actual balance change to the contract may be $90, while the internal accounting would show that the user had $100 in their account. Now if the user requests to withdraw $100, the contract will transfer $100 to the user, which would end up with an internal balance of $0 on the user in the contract, and $90 of the fee coin reaching the user after the fee. The contract itself has lost money in this deposit/withdraw. Let's say the contract started with $100. If it received $90 from the deposit, after the fee, and sent $100 back to the user before the fee, the contract now has $90 in actual coins, and $100 in internally recorded deposits to other users.

In such a case, the rewards given out per second will actually be higher than the rewardsPerSecond setting in the contract! 

If the normal case of healthy accounting, a user with $10, and a pool size of $100, then `userBalance / totalPoolSize` is `10/100 = 0.10`, giving the user ten percent of the rewards. But what if the user has an internal balance of $100, but the actual funds in the pool was lower at $90? Then `100/90 = 1.1111`, and the rewards to a single user are actually higher than the total of all rewards that are supposed to be given out!

### The attack

The attacker made a small initial deposit into a SafeDollar pool, then took the accounting vulnerability to extremes by repeatedly depositing and withdrawing huge amounts until they almost completely drained the funds held by the contract down to almost-zero. 

And when you divide a number by almost-zero, you get almost-infinity. A user balance of $1 divided by a holdings of $0.0000000000000000000001 would multiply the rewards by 1,000,000,000,000,000,000,000.

The attacker collected his bazillions of new SafeDollars as a reward on his tiny deposit, and traded them for all the liquidity available on the pools.

## Preventing this attack

Supporting coins with fees requires different code around transfers. Balances must be checked before and after each transfer. If this before/after code is not present, a protocol must ensure that it is only using trusted coins without transfer fees.

Unit tests will catch this as long as a project intentionally includes a transfer fee coin in its tests.

## Are we vulnerable

None of the current stablecoins that OUSD supports are using a fee, which means that we do not have this vulnerability.

However, USDC is upgradable at any time by Coinbase, and USDT is both upgradable by Tether and contains unused, years old  transfer fee code since its launch. We've deliberately chosen to code for all coins remaining non-fee, since that gives a reduction in code in complexity and gas fees. 

## Links

- Main attack TX: https://polygonscan.com/tx/0x4dda5f3338457dfb6648e8b959e70ca1513e434299eebfebeb9dc862db3722f3
- Attack contract create TX: https://polygonscan.com/tx/0xe83abdc9b0d7e1e9ed1f95db7641a47d6034330c2fadbcbf8a4f2c1ff1b9ce0c
