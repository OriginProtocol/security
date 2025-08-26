Repo for public materials related to [Origin](https://www.originprotocol.com) security.

# Table of Contents
 1. [Defi incident reports](#defi-incident-reports)
 1. [Security materials](#security-materials)
 1. [Checklists](#checklists)
 1. [Tools](#tools)
 1. [External audits](#external-audits)

# Defi incident reports
  - [Reports](/incidents)

# Security materials
 - [Solidity security considerations](https://docs.soliditylang.org/en/v0.7.5/security-considerations.html)
 - [Trail of Bits curated list](https://github.com/crytic/awesome-ethereum-security)
 - [Caveats about ecrecover](https://docs.kaleido.io/faqs/why-ecrecover-fails/)
 - [2020 paradigm CTF writeup](https://github.com/DanielVF/2020_paradigm_ctf_writeup)
 - [How to do a Proper Code Review](https://medium.com/@danielvf/how-to-do-a-proper-code-review-901bd037905c)

# Checklists
 - [ERC20 token integration checklist](https://github.com/crytic/building-secure-contracts/blob/master/development-guidelines/token_integration.md)
 - [Contract PR checklist](https://github.com/OriginProtocol/origin-dollar/blob/master/pull_request_template.md)
 - [Verbose Contract PR Checklist](https://github.com/OriginProtocol/security/blob/master/templates/Contract-Code-Review.md)
 - [Deployment Plan template on notion](https://www.notion.so/originprotocol/Deployment-Plan-d5aa7d033cc54d78914e00bf040344d2)

# Tools

## Testing
### Slither
[Slither](https://github.com/crytic/slither) is a static analysis tool for Solidity contracts.

#### How to run it
```
pip3 install slither-analyzer
cd origin-dollar/contracts
yarn install
yarn run slither
```

#### Updating Slither DB
```
yarn run slither --triage
```
Running this command will open an interactive console where you can select the errors/warning that you want to be excluded. Once done, commit and push the updated Slither DB file. Note: make sure you are running the latest version of slither on your local.

### Echidna
[Echidna](https://github.com/crytic/echidna) is a test fuzzer for Solidity contracts.

The Echnida tests for the OUSD contracts are under [contracts/contract/crytic](https://github.com/OriginProtocol/origin-dollar/tree/master/contracts/contracts/crytic).

#### How to run it
On MacOS and Linux, download the latest pre-compiled binaries from [here](https://github.com/crytic/echidna/releases).
Untar the files in a directory and add the path where the echidna-test binary was extracted to your shell's PATH.

To run the tests:
```
cd origin-dollar/contracts
yarn run echidna
```

Note that the tests take about ~30min to run.

## Transaction viewers
  - https://openchain.xyz/trace
  - https://tx.eth.samczsun.com
  - https://ethtx.info

## Bytecode decompilers
  - https://library.dedaub.com/decompile

## 4byte signature databases
  - https://openchain.xyz/signatures
  - https://www.4byte.directory

# External audits
  See [this directory](https://github.com/OriginProtocol/security/tree/master/audits)
  
# Bug bounty program
  - Refer to https://docs.ousd.com/security-and-risks/bug-bounties
  - [Example of a well written bug report](https://gist.github.com/DanielVF/66f459da88804d1fd917c47576c68523)


