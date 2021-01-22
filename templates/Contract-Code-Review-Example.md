This is an example from the code review for PR https://github.com/OriginProtocol/origin-dollar/pull/511#pullrequestreview-574518930

### Requirements
Compound no longer automatically gives you a rewards token balance automatically, instead you must claim COMP to see your balance increase.

This change will make every large allocate claim COMP, transfer COMP, and sell COMP. That's certainly better than not automatically claiming COMP at all, but does increase the gas cost quite bit.

### Internal State
Does not alter any internal state. Uses stored addresses.

### Attack
Baring an address being set wrongly, or malicious behavior from a trusted contract, I don't think this is attackable.

### Logic
Yay! No if statements, executes straight on through.

### Tests
No tests for verifying this code actuals functionality. Guess this code is entirely dependent on external contracts, and there's not much we could actually test here.

### Flavor
Could this code be simpler? Nope.

### Overflow
No math!

### Black magic
No black magic.

### Authentication
No authentication.

### Cryptographic code
No cryptographic code.

### Gas problems
See notes above in "Requirements".

### External calls
All calls are to trusted contracts.

### Ethereum
Contract does not send or receive Ethereum.
