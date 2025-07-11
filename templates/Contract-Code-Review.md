
This template is a starting point for you customize as you review a code change. If a section is not relevant, feel free to just replace its contents with some italicized text with the reason it's not used.

```
## Requirements

_What is the PR trying to do? Is this the right thing? Are there bugs in the requirements?_

## Easy Checks

#### Authentication

- [ ] Never use tx.origin
- [ ] Every external/public function is supposed to be externally accessible
- [ ] Every external/public function has the correct authentication
- [ ] All initializers have onlyGovernor
- [ ] Each method that changes access control has the correct access control

#### Ethereum

- [ ] Contract does not send or receive Ethereum.
- [ ] Contract has no payable methods.
- [ ] Contract is not vulnerable to being sent self destruct ETH

#### Cryptographic code

- [ ] This contract code does not roll it's own crypto.
- [ ] No signature checks without reverting on a 0x00 result.
- [ ] No signed data could be used in a replay attack, on our contract or others.

#### Gas problems

- [ ] Contracts with for loops must have either:
    - [ ] A way to remove items
    - [ ] Can be upgraded to get unstuck
    - [ ] Size can only controlled by admins
- [ ] Contracts with for loops must not allow end users to add unlimited items to a loop that is used by others or admins.

#### Black magic

- [ ] Does not contain `selfdestruct`
- [ ] Does not use `delegatecall` outside of proxying. _If an implementation contract were to call delegatecall under attacker control, it could call selfdestruct the implementation contract, leading to calls through the proxy silently succeeding, even though they were failing._
- [ ] Address.isContract should be treated as if could return anything at any time, because that's reality.

#### Overflow

- [ ] Code is solidity version >= 0.8.0
- [ ] All for loops use uint256

#### License
- [ ] The contract uses the appropriate limited BUSL-1.1 (Business) or the open MIT license
- [ ] If the contract license changes from MIT to BUSL-1.1 any contracts importing it need to also have their license set to BUSL-1.1

#### Proxy

- [ ] No storage variable initialized at definition when contract used as a proxy implementation.

#### Events
- [ ] All state changing functions emit events

## Medium Checks

#### Rounding and casts
- [ ] Contract rounds in the protocols favor
- [ ] Contract does not have bugs from loosing rounding precision
- [ ] Code correctly multiplies before division
- [ ] Contract does not have bugs from zero or near zero amounts
- [ ] Safecast is aways used when casting

#### Dependencies
- [ ] Review any new contract dependencies thoroughly (e.g. OpenZeppelin imports) when new dependencies are added or version of dependencies changes.
- [ ] If OpenZeppelin ACL roles are use review & enumerate all of them.
- [ ] Check OpenZeppelin [security vulnerabilities](https://github.com/OpenZeppelin/openzeppelin-contracts/security/advisories) and see if any apply to current PR considering the version of OpenZeppelin contract used.

#### External calls

- [ ] Contract addresses passed in are validated
- [ ] No unsafe external calls
- [ ] Reentrancy guards on all state changing functions
    - [ ] Still doesn't protect against external contracts changing the state of the world if they are called.
- [ ] No malicious behaviors
- [ ] Low level call() must require success.
- [ ] No slippage attacks (we need to validate expected tokens received)
- [ ] Oracles, one of:
  - [ ] No oracles
  - [ ] Oracles can't be bent
  - [ ] If oracle can be bent, it won't hurt us.
- [ ] Do not call balanceOf for external contracts to determine what they will do when they use internal accounting

#### Tests

  - [ ] Each publicly callable method has a test
  - [ ] Each logical branch has a test
  - [ ] Each require() has a test
  - [ ] Edge conditions are tested
  - [ ] If tests interact with AMM make sure enough edge cases (pool tilts) are tested. Ideally with fuzzing.

#### Deploy

- [ ] Deployer permissions are removed after deploy

## Strategy Specific

_Remove this section if the code being reviewed is not a strategy._

#### Strategy checks

- [ ] Check balance cannot be manipulated up AND down by an attacker
- [ ] No read only reentrancy on downstream protocols during checkBalance
- [ ] All reward tokens are collected
- [ ] The harvester can sell all reward tokens
- [ ] No funds are left in the contract that should not be as a result of depositing or withdrawing
- [ ] All funds can be recovered from the strategy by some combination of depositAll, withdraw, or withdrawAll()
- [ ] WithdrawAll() can always withdraw an amount equal to or larger than checkBalances report, even in spite of attacker manipulation.
- [ ] WithdrawAll() cannot be MEV'd
- [ ] WithdrawAll() does not revert when strategy has 0 assets
- [ ] Strategist cannot steal funds

#### Downstream

- [ ] We have monitoring on all backend protocol's governances
- [ ] We have monitoring on a pauses in all downstream systems

## Thinking

#### Logic

  _Are there bugs in the logic?_

  - [ ] Correct usage of global & local variables. -> they might differentiate only by an underscore that can be overlooked (e.g. address vs _address).

#### Deployment Considerations

_Are there things that must be done on deploy, or in the wider ecosystem for this code to work. Are they done?_

#### Internal State

- What can be always said about relationships between stored state
- What must hold true about state before a function can run correctly (preconditions)
- What must hold true about the return or any changes to state after a function has run.

Does this code do that?

#### Attack

_What could the impacts of code failure in this code be._

_What conditions could cause this code to fail if they were not true._

_Does this code successfully block all attacks._

#### Flavor

_Could this code be simpler?_

_Could this code be less vulnerable to other code behaving weirdly?_

```
