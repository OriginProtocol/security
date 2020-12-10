Repo for organizing materials related to security.

# Table of Contents
 1. [References](#references)
 1. [Checklists](#checklists)
 1. [Tools](#tools)
 1. [External audits](#externalaudits)
 1. [Defi postmortems](#defipost-mortems)

# References
 - [Solidity security considerations](https://docs.soliditylang.org/en/v0.7.5/security-considerations.html)
 - [Trail of Bits curated list](https://github.com/crytic/awesome-ethereum-security)
 - [Caveats about ecrecover](https://docs.kaleido.io/faqs/why-ecrecover-fails/)

# Checklists
 - [ERC20 token integration checklist](https://github.com/crytic/building-secure-contracts/blob/master/development-guidelines/token_integration.md)
 - [OUSD PR checklist](https://github.com/OriginProtocol/origin-dollar/blob/master/pull_request_template.md)
 - [OUSD deployment checklist](https://docs.google.com/spreadsheets/d/1phyzOJMmTBPIqTTa0v7HY6XJkjRmbrcdULRZPo_JEoY/edit?usp=sharing)
 - Origin Protocol New employee checklist: search for "New employee" on google drive.

# Tools

## Slither
[Slither](https://github.com/crytic/slither) is static analysis tool for Solidity contracts.

### How to run it
```
pip3 install slither-analyzer
cd origin-dollar/contracts
yarn install
yarn run slither
```

## Echidna
[Echidna](https://github.com/crytic/echidna) is a test fuzzer for Solidity contracts.

### How to run it
TODO: add instructions

# External audits
  - OGN
    - [Sept 2019 - Trail of Bits](https://drive.google.com/file/d/1VaK8hZrKpkeKNe9dL4NlfgcsfTKLh9cv/view?usp=sharing)
  - OUSD
    - [Nov 2020 - Trail of Bits](https://drive.google.com/file/d/1wW7QsoHdB9u5b_jc6oTfU1LT3YwJZ0P_/view?usp=sharing)
    - Dec 2020 Solidified
  - Single Asset Staking
    - [Dec 2020 - Solidified](https://drive.google.com/file/d/1U-pv_wcijwvVHynb1-6ddy4S49_JNKQe/view?usp=sharing)

# Defi post-mortems
  - [Opyn - Aug 2020](https://medium.com/opyn/opyn-eth-put-exploit-post-mortem-1a009e3347a8)
