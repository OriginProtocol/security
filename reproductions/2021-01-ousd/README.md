# Reproduction of OUSD Address.isContract exploit

This exploit was made possible by the use of the Address.isContract function which relies on checking the code size of an address to determine whether it is a contract or not. Using CREATE2 it is possible to...

The exploit is implemented as a Hardhat task in `hardhat.config.js`.

To run use:

`PROVIDER_URL=https://eth-mainnet.alchemyapi.io/v2/<key> yarn run exploit`
