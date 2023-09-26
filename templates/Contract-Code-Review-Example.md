
This template is a starting point for you customize as you review a code change. If a section is not relevant, feel free to just replace its contents with some italicized text with the reason it's not used.


#### Requirements

_What is the PR trying to do? Is this the right thing? Are there bugs in the requirements?_


### Deployment Considerations

#### Internal State

- What can be always said about relationships between stored state
- What must hold true about state before a function can run correctly (preconditions)
- What must hold true about the return or any changes to state after a function has run.

Does this code do that?

#### Attack

_What conditions could cause this code to fail if they were not true_


#### Logic

  - [ ] _Are there bugs in the logic?_
  - [ ] Correct usage of global & local variables. -> they might differentiate only by an underscore that can be overlooked (e.g. address vs _address).


#### Tests

  - [ ] Each publicly callable method has a test
  - [ ] Each logical branch has a test
  - [ ] Each require() has a test
  - [ ] Edge conditions are tested
  - [ ] If tests interact with AMM make sure enough edge cases (pool tilts) are tested. Ideally with fuzzing.

#### Flavor

_Could this code be simpler?_

_Could this code be less vulnerable to other code behaving weirdly?_

#### Overflow

- [ ] Never use "+" or "-", always use safe math or have contract compile in solidity version > 0.8
- [ ] Check that all for loops use uint256

#### Proxy
- [ ] Make sure proxy implementation contracts don't initialize variable state on variable declaration and do it rather in initialize function.

#### Black magic

- [ ] Does not contain `selfdestruct`
- [ ] Does not use `delegatecall` outside of proxying
- [ ] (If an implementation contract were to call delegatecall under attacker control, it could call selfdestruct the implementation contract, leading to calls through the proxy silently succeeding, even though they were failing.)
- [ ] Address.isContract should be treated as if could return anything at any time, because that's reality.

#### Dependencies
- [ ] Review any new contract dependencies thoroughly (e.g. OpenZeppelin imports) when new dependencies are added or version of dependencies changes.
- [ ] If OpenZeppelin ACL roles are use review & enumerate all of them.
- [ ] Check OpenZeppelin [security vulnerabilities](https://github.com/OpenZeppelin/openzeppelin-contracts/security/advisories) and see if any apply to current PR considering the version of OpenZeppelin contract used.

#### Deploy
- [ ] Check that any deployer permissions are removed after deploy

#### Authentication

- [ ] Never use tx.origin
- [ ] Check that every external/public function should actually be external
- [ ] Check that every external/public function has the correct authentication

#### Cryptographic code

- [ ] Contracts that roll their own crypto are terrifying
- [ ] Note that a failed signature check will result in a 0x00 result. Make sure that the result throws if it returns this.
- [ ] Beware of signed data being used in a replay attack to other contracts.

#### Gas problems

- [ ] Contracts with for loops must have either:
    - [ ] A way to remove items
    - [ ] Can be upgraded to get unstuck
    - [ ] Size can only controlled by admins
- [ ] Contracts with for loops must not allow end users to add unlimited items to a loop that is used by others or admins.

#### External calls

- [ ] Contract addresses passed in are validated
- [ ] Unsafe external calls
- [ ] Reentrancy guards on all state changing functions
    - [ ] Still doesn't protect against external contracts changing the state of the world if they are called.
- [ ] Malicious behaviors
- [ ] Could fail from stack depth problems (low level calls must require success)
- [ ] No slippage attacks (we need to validate expected tokens received)
- [ ] Oracles, one of:
  - [ ] No oracles
  - [ ] Oracles can't be bent
  - [ ] If oracle can be bent, it won't hurt us.
- [ ] Don't call balanceOf for external contracts to determine what they will do, when they instead use internal accounting?


#### Ethereum

- [ ] Contract does not send or receive Ethereum.
- [ ] Contract has no payable methods.
