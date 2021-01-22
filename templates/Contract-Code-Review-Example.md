
This template is a starting point for you customize as you review a code change. If a section is not relevant, feel free to just replace its contents with some italized text with the reason it's not used.


#### Requirements

_What is the PR trying to do? Is this the right thing? Are there bugs in the requirements?_


#### Internal State

- What can be always said about relationships between stored state
- What must hold true about state before a function can run correctly (preconditions)
- What must hold true about the return or any changes to state after a function has run.

Does this code do that?

#### Attack

_What conditions could cause this code to fail if they were not true_


#### Logic

_Are there bugs in the logic?_


#### Tests

  - [ ] Each logical branch has a test
  - [ ] Edge conditions are tested

#### Flavor

_Could this code be simpiler?_

_Could this code be less vulnerable to other code behaving weirdly?_

#### Overflow

- [ ] Never use "+" or "-", always use safe math
- [ ] Check that all for loops use uint256

#### Black magic

- [ ] Does not contain `selfdestruct`

- [ ] Does not use `delegatecall` outside of proxying

(If an implimentation contract were to call delegatecall under attacker control, it could call selfdestruct the implimentation contract, leading to calls through the proxy silently succeding, even though they were failing.)

- [ ] Address.isContract should be treated as if could return anything at any time, because that's reality.


#### Authentication

- [ ] Never use tx.origin
- [ ] Check that every external/public function should actualy be external
- [ ] Check that every external/public function has the correct authentication

#### Cryptographic code

- [ ] Contracts that roll their own crypto are terrfying
- [ ] Note that a failed signature check will result in a 0x00 result. Make sure that the result throws if it returns this.
- [ ] Beware of signed data being used in a replay attack to other contracts.

#### Gas problems

- [ ] Contracts with for loops must have either:
    - [ ] a way to remove items
    - [ ] can be upgraded to get unstuck
- [ ] Contracts with for loops must not allow end users to add unlimited items to a loop that is used by others or admins.

#### External calls

- [ ] Contract addresses passed in are validated
- [ ] Unsafe external calls
- [ ] Rentrancy gaurds on all state changing functions
    - [ ] Still doesn't protect against external contracts changing the state of the world if they are called.
- [ ] Malicious behaviors
- [ ] Could fail from stack depth problems (low level calls much require success)
- [ ] No slippage attacks (we need to validate expected tokens recevied)
- [ ] Oracles?

#### Ethereum

- [ ] Contract does not send or receive Ethereum.
- [ ] Contract has no payable methods.
