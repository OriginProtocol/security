# 2020-12 AAVE Proxy/Delegatecall Issue

_Daniel Von Fange 2020-12-15._

## What happened.

A whitehat security researcher found a fairly obscure bug in the Aave which would allow anyone to destroy some of their contracts, which would breaking AAVE until new contracts could be destroyed, or steal newly deposited funds, or perhaps more.

Full details in the [AAVE blog post](http://medium.com/aave/aave-security-newsletter-546bf964689d).


## How it works.

Aave uses upgradable smart contracts. These contracts can be initialized by anyone. The pool manager contract when initialized, takes the address of an external contract. The pool manager then has a method that delegatecalls to an address chosen by the external contract.

AAVE has initialized the proxies versions of their contracts. However the implementation code was not initialized. An attacker could call the initialization code on the implementation contract, passing in their own malicious contract address. They could then call the vulnerable method on the implementation contract, which would delegatecall and run the code of the attacker’s choosing as if it were the implementation contract. The attacker would not be able to override any storage slots used by the production system (since those are set on the proxy), but they could make the delegated code call “self destruct” which would be run in the context of the implementation contract. This would cause the implementation contract to be destroyed, making all future AAVE calls from the proxy to the implementation fail.

Except the Aave proxy code, rather than reverting if there was no backing implementation contract, would return something like a success. This could cause the overall AAVE system to continue executing, thinking it was doing things when when calls were actually going nowhere.

## What allowed this to happen?

1. Delegatecall used for something other than a proxy is super super dangerous. Most obviously you now have multiple contracts that need to care about not destroying your storage layout. It also makes it extremely hard to reason about what logic will actually be executed. Take every downside of upgradable contracts and square it when using delegatecall for a single method.
2. The proxy failing to revert on missing code makes this a much bigger problem than just a DOS opportunity.

## Are we vulnerable?

We have three delegatecall’s in our code. Two in our proxy implementation and one in vaultCore calling down to the admin functions.

1. **OK** - We don’t use delegatecall outside of proxy contract calls.
2. **OK** - We explicitly revert in each place we use delegatecall.

Notes: Our vaultCore acts as a proxy. It does both a delegatecall, and does admin/upgrade functionality. It might be worth a second check that this is all correct.

## What went right.

1. Whitehat researcher notified them.
2. Good bug bounty. Fast payout announcement.
3. Clear blog post allowing others to learn from it. 

