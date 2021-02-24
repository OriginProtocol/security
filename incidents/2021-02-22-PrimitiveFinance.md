# Primitive Finance Exploit

_Mike Shultz 2021-02-22._

## Background

[Primitive Finance](https://primitive.finance/) is a DeFi project that is tokenizing options trading built upon the Uniswap interface.  Currently they offer options trading on WETH and SUSHI using DAI as the strike asset.

On Feb 20th, a vulnerability was discovered by [Dedaub](https://www.dedaub.com/) and reported through Immunefi.  Together with the Primitive team, they decided to prepare a whitehat attack to save user funds.  The contracts were immutable and unpausable, leaving no other options for remediation.

The attack uses Uniswap flash-swaps to call one of their core contracts (a "connector") with specially crafted attack contracts that mimic the expected Primitive options contracts.  The connector uses information from these contracts to make decisions on how to transfer tokens that were previously approved by users.

## Audits

Primitive contracts [have previously been through an audit by OpenZeppelin](https://blog.openzeppelin.com/primitive-audit/) that covered the `Primitives`, `Option`, `Redeem`, and `Trader` contracts.  The referenced repository and [commit in this audit](https://github.com/primitivefinance/primitive-contracts/tree/98060324ac6588b1d05748911325a4d39869e4ae) appear to have been renamed and undergone a restructuring since the audit.  

The audit did not uncover the vulnerability that was exploited.

## Details

- Attack transactions
    1) https://etherscan.io/tx/0xa903a3b8e098e1e10f73070ef370b347950ef2a6c9037ce76e6a9944b8a05d39
    2) https://etherscan.io/tx/0x9c511b8063780104895c68d08e7dbb1f1557c59e3e96bd14ef190d9329e33113
    3) https://etherscan.io/tx/0xac9771a1dd347bf880b7db8c842ad2481cb69a7fae671e78267dc9e1e045d010
- [Primitive's Attack Post-Mortem](https://primitivefinance.medium.com/postmortem-on-the-primitive-finance-whitehack-of-february-21st-2021-17446c0f3122)

## Attack

The attack requires some reconnaissance ahead of time.  You must know ahead of time what tokens the connector has been approved for.  With that information, you will know how much you can siphon from the victim accounts.

1) Create a fake token ("FAKE")
2) Create a malicious Option contract that uses the real token ("REAL") and FAKE as strike
3) Create a Uniswap pair for REAL-FAKE swaps
4) Start a [flash swap](https://uniswap.org/docs/v2/smart-contract-integration/using-flash-swaps/) for the amount of REAL that the connector has been approved for that calls `flashMintShortOptionsThenSwap()` with the malicious Uniswap pair and options addresses.
5) Pass the REAL tokens of the flash swap to the Option contract, minting malicious option tokens("MOPT"). The malicious Option contract then transfers REAL tokens to attacker
7) Transfer MOPT to victim
8) Settle flash swap by paying the malicious pair with the victim's funds
9) Remove liquidity from REAL-FAKE Uniswap pair

The result is that the attacker now have the victim's REAL, and they have worthless MOPT that cannot be redeemed for FAKE, which has no value.

## Fix

As of this writing, there appears to be no fix in place.  Their published future plans include:

1) Strict approvals (no more infinite approvals)
2) Use `permit()` for all tokens that support it
3) Add pausability to contracts
4) "Update the frontend with new tools for users to interact with the option markets, until a new Connector contract is deployed."

No further mention of how they might fix the connector, or if they will.

## Timeline

This timeline is a direct copy from [Primtive's own post-mortem](https://primitivefinance.medium.com/postmortem-on-the-primitive-finance-whitehack-of-february-21st-2021-17446c0f3122):

- 15:30 UTC Feb 20: Dedaub team confirms critical vulnerability by exploiting a contract in a test environment.
- 16:30 UTC Feb 20: Yannis Smaragdakis at Dedaub discloses the critical vulnerability to Mitchell Amador at Immunefi.
- 17:00 UTC Feb 20: Immunefi team confirms the vulnerability.
- 17:40 UTC Feb 20: Primitive Finance confirms receipt of vulnerability from Immunefi.
- 17:45 UTC Feb 20: Primitive Finance engages Emiliano (ReviewsDAO).
- 17:50 UTC Feb 20: Primitive Finance war room created with Primitive Finance, Dedaub, ReviewsDAO, and Immunefi teams.
- 17:53 UTC Feb 20: War room assembles, begins preparing whitehat hack and operations.
- 18:15 UTC Feb 20: Primitive Frontend updated with all buttons calibrated to reset approvals to 0 wei, to prevent new wallets becoming vulnerable.
- 20:45 UTC Feb 20: Scope of the vulnerable wallets and funds at risk confirmed, with the help of Jon Itzler’s Dune Analytics queries.
- 17:17 UTC Feb 21: Whitehack contracts prepared, code review begins.
- 19:45 UTC Feb 21: Alice Henshaw from Open Zeppelin joins war room to offer additional support.
- 22:18 UTC Feb 21: War room re-assembles to initiate whitehack.
- 00:19 UTC Feb 22: Staging complete, attack is ready.
- 00:41 UTC Feb 22: Pre-emptive reach out to known address holders to reset allowances, exposed funds reduce by 35%.
- 01:06 UTC Feb 22: Primitive Team executes first whitehat attack, rescuing first wallet.
- 01:12 UTC Feb 22: Primitive Team executes second whitehat attack, rescuing second wallet.
- 01:14 UTC Feb 22: Primitive Frontend updated with emergency reset page. Announcement made in discord.
- 01:16 UTC Feb 22: Primitive Team executes third whitehat attack, rescuing third wallet.
- 03:14 UTC Feb 22: Primitive Team safely returns all rescued funds to their owners.
- 04:00 UTC Feb 22: Confirmed 98% of originally exposed funds have been saved.

## Conclusion

At this time, there is no reason to believe that OUSD would be impacted by the attack. It would require users to be able to feed malicious contract addresses to ours which we have recently reviewed against.  For good measure, I've also done an additional source review of our token, vault, and strategies contracts for `address` arguments and how they are used.  I found that all of our `address` arguments that are allowed publicly are properly validated or aren't used in a way that could call arbitrary code. With the only exception being `Governor`/`Timelock`, which are inherently used to execute arbitrary transactions.

One interesting angle to this attack is Uniswap's "flash swap" capabilities which were new to me as of this writing.  They allow a user to essentially "take" token A and "give" token B later on in the transaction.  While still atomic (executed in a single transaction), it allows the user to perform other actions before settling.

While I don't think there are any current vulnerabilities in OUSD relating to flash swaps, I think it's worth everyone to give it consideration.  It should especially be kept in mind if we consider a Uniswap LP strategy in the future.
