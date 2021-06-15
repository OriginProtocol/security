# 2021-5-22 Bogged Finance Attack

_Daniel Von Fange_

## What happened

An attacker stole approximately 3.6 million dollars of funds from the BSC Bogged Finance liquidity pools due to a bug that created additional BOG when BOG was transferred between accounts.

## How it works

BOG was advertised as a deflationary currency. Its stated goal is that every time someone transferred BOG from one account to the other, the sender would lose 5%, and 1% would be burnt, and 4% would be distributed to those staking BOG and BNB.

The part of the code that handles transaction fees looks correct at first glance. It correctly calculates that 95% should transfer from the sender to the destination, 1% should be burnt, and 4% should be distributed to the stakers.
    
    /**
     * Burns transaction amount as per burn rate & returns remaining transfer amount. 
     */
    function _txBurn(address account, uint256 txAmount) internal returns (uint256) {
        uint256 toBurn = txAmount.mul(_burnRate).div(1000); // calculate amount to burn
        
        _distribute(account, toBurn.mul(_distributeRatio-1).div(_distributeRatio));
        _burn(account, toBurn.div(_distributeRatio));
        
        return txAmount.sub(toBurn); // return amount left after burn
    }

However, while the distribute function does indeed distribute the correct amount to the stakers, it does not actually remove any funds from the sender when doing so. The net effect then is to create BOG. When the sender sends 100 BOG:

|Change | Reason                    |
|-------|---------------------------|
| +4 | sent to stakers.             |
| -1 | burned from senders's account|
| -95| removed from sender's account|
| +95| added to recipient account.  |

This results in a 3% net increase in BOG over the transferred amount on each transfer.

A second effect of this missing code is that transfers will leave money in the senders account. When we narrow down to just looking at the changes to sender's account on a transfer of 100 BOG:

|Change | Reason                    |
|-------|---------------------------|
| -1 | burned from senders's account|
| -95| removed from sender's account|

After a transfer of 100 BOG, only 96 BOG would be taken, and 4  extra BOG would remain with the account.

The attacker exploited this flaw in the logic by staking a lot of BOG and then transferring money to himself over and over again. The net result was that the attacker gained more from being in the staking pool and recieving the distributions than was lost to the burns on the transfers.

## What allowed this to happen?

This was a simple logic/math bug. Because of the way the contract was split up into functions, and the ambiguity behind the name of the distribute function, each function looked correct in isolation.

This could have been caught by a basic unit test that checked that after 100 BOG was sent, the sender had 100 BOG less they started with. 

## Are we vulnerable?

No. Our transfers are [unit tested](https://github.com/OriginProtocol/origin-dollar/blob/2f8bb0cf30c839a6285eb48cb8bf067701335c4e/contracts/test/token.js#L44-L51). In addition, a design decision behind OUSD was to separate the OUSD ERC20 token itself from all the vault/strategy logic. This makes the code much simpler on each sides, and the OUSD token contract doesn't have any extra logic in it beyond rebasing for yield increases.

## Links

An attack transaction: 
https://bscscan.com/tx/0x215713e60d5058a9f0f925fc25b08823ba603341167ea0f9011d1369c37a7e06

BOG contract:
https://bscscan.com/address/0xd7b729ef857aa773f47d37088a1181bb3fbf0099#code