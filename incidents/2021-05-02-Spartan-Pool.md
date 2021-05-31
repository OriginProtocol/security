# 2021-5-2 Spartan Hack

_Daniel Von Fange_

## What happened

An attacker stole approximately $30 million of funds from Spartan Protocol liquidity pools due to a bug in calculating how much assets to send when liquidity was withdrawn.

### Background: Swap Pool

Uniswap-style swap pools work by holding a large number of two different tokens that can be traded for each other using the pool. The ratio between the quantities of the tokens becomes the price to trade one for the other.

Because this requires a lot of tokens to be sitting around to work, pools need to reward people who deposit place their tokens into the pool to be using for swapping. The usual way is that someone places an amount of both tokens into the pool, and in return receives some number of pool tokens to hold. As swaps take place, the fees charged increase the amount of swappable tokens in the pool. When a liquidity provider cash out their pool tokens, they get back out their percentage of all the swappable tokens, which will have grown from trading fees.

Swap pools often do not control the transfer of funds into them, either for swapping, nor for adding liquidity. Instead they keep track of the amount of each token they expect to have, and then compare these numbers to the actual balances to see how much has been transferred in. Money that the pool doesn't know about yet is credited to whoever wants to do something with it. The Spartan Protocol follows this style.


## How it works

The actual attack has over 700 events emitted during the transaction. For simplification, I've narrowed down to just the core attack, and used hypothetical numbers.

We've made a [reproduction of this simplified attack](https://github.com/OriginProtocol/security/blob/master/reproductions/2021-05-02-spartan/tests/test_hack.py) available, using the actual spartan pool code.

### 1. AddLiquidity

Lets say the Spartan pool starts with 10 million SPARTA

The attacker adds 10 more million SPARTA as liquidity. After adding, the pool now has 20 million SPARTA, and the pool's accounting now correctly thinks it has 20 million SPARTA.

### 2. Add extra funds

The attacker then directly transfers to the pool an additional 10 million SPARTA, without calling any code on the pool. The now pool has 30 million SPARTA, but thinks it has 20 million SPARTA.


### 3. Remove Liquidity

The attacker removes his liquidity. Because the attacker has 50% of the pool tokens, the the pool calculates that 50% of the 30 million actual balance is 15 million SPARTA, and sends that to the attacker.  The pool then updates its internal balances by subtracting the 15 million that it sends from the 20 million dollars that holds. The pool now has 15 million actual SPARTA, but thinks that it has 5 Million Sparta.

This was the critical bug. The remove liquidity function should have either synced the actual balances to its internal balances during the transaction, as Uniswap does, or purely worked from its own accounting, as Curve does.


### 4. Collect Extra Funds

At this point the pool has 10 million SPARTA less than it thinks that it does. These extra tokens will appear to the fund to have been deposited by the person that makes the next transaction. From here the attacker can run a swap on the pool and collect the remaining tokens.

At the end of this hypothetical attack, the attacker has 5 million more SPARTA than they started with, and the pool has 5 million less.

By doing other swaps before and after the core of the attack, the attacker can move the bonding curve to make the attack more efficient.

## What allowed this to happen?

The Spartan pool sometimes used actual balances and sometimes used internal accounting balances, without syncing them in a critical place. This is an easy opening for an exploite if the attacker has a way to get back his funds after the math is done, as is the case with this style of pool.

While the Spartan pool is not a direct copy of Uniswap v2, it is very inspired by the Uniswap design. The sync operation in the uniswap remove liquidity function is not explicit in the top level function, but rather in a called function with a different stated purpose. It would be extremely easy to miss if you were just reading through the code. 

## Are we vulnerable?

Yes, in a very small way.

OUSD checked its balance on 3pool by looking at 3pool's actual balances, whereas 3pool uses internal accounting values for computing balances. An attacker could send funds to 3pool, which 3pool would not account for, but OUSD would, and inflate the apparent value of OUSD's backing assets. However, the money sent by the attacker to 3pool would be locked in 3pool, making this attack massively unprofitable, unless those funds were later withdrawn to the attacker by 3pool governance vote. This makes an attack unlikely.

Also, OUSD has several design features which reduced this attack's efficiency. Profits from this attack would be a tiny fraction of a percent of total OUSD holdings, but that is before OUSD's redeem fee, which which could make the attack completely unprofitable, even were the attackers able to recover the funds sent to 3pool.

The OUSD 3pool strategy has been updated to fix this issue. We now calculate 3pool's balances using 3pools internal accounting balances.

## Links

Attack transaction: 
https://bscscan.com/tx/0xb64ae25b0d836c25d115a9368319902c972a0215bd108ae17b1b9617dfb93af8

Attack contract:
https://bscscan.com/address/0x288315639c1145f523af6d7a5e4ccf8238cd6a51