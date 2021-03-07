# Meerkat Finance

Meerkat Finance was a Yearn clone running on Binance Smart Chain (BSC), a semi-centralized Ethereum fork.


## Technical Description

An attacker/internal team member upgraded a proxy implementation and drained 13 million BUSD and 73,000 BNB with a total value of approximately $31m. The new proxy implementation had a function with signature 0x70fcb0a7 which had the singular purpose of draining vaults and sending the proceeds to the contract owner.

upgradeTo call - https://bscscan.com/tx/0x063970f8625f250101a7da8abf914748cf8eaaaa9458041f1928501accfe5d6c
upgradeTo call - https://bscscan.com/tx/0xf19fa4bcff4adaebeddd28c851458ba0f01ffedd52b62df56ace94e7c8842553
0x70fcb0a7 call - https://bscscan.com/tx/0x1332fadcc5378b1cc90159e603b99e0b73ad992b1e6389e012af3872c8cae27d
0x70fcb0a7 call - https://bscscan.com/tx/0xd8145dfe255a671428b9c082a006a145fe58d82175671e8bfbe02f4040ae8cd0

## Commentary

Although relatively uninteresting from a security perspective, this is interesting for other reasons. At the time of writing this was the largest loss of funds on BSC. To some extend, it may be possible for Binance to either rollback the transactions or prevent an egress of funds to other chains. Doing so could lead to harsh criticism from the crypto community who are generally strongly in favour of decentralization and the "code is law" narrative.

Immediately following the incident, the Meerkat Finance team disappeared. Several days later, they reappeared claiming that the incident was some kind of [commentary](https://www.abmedia.io/bsc-meerkat-finance-rugpull-is-just-a-test) around the danger of greed and the risks of smart contracts. They further claim that the hacker was invited to exploit the contracts. The "hack" was really only an abuse of access control, so this demonstration is ridiculous. A real world analogy would be if I wanted to show how unsafe storing money in a bank is, and I then handed over the vault combination to a thief to prove my point. More likely, the Meerkat Finance team realised they couldn't profit from the incident due the funds being trapped on BSC, and are attempting to resurrect the product.
