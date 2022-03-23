//https://eth-ropsten.alchemyapi.io/v2/dJPYVrp5-e1fwmwgM9IcJ-RGl7dfbFTm

//hardhat-waffle is a plugin to build smart contract tests using Waffle in hardhat.
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/dJPYVrp5-e1fwmwgM9IcJ-RGl7dfbFTm',
      accounts: ['e2fdfeb32c6f0ae847bfe42169b3acc5b033ecefbf1658b3223f717f4d7b607d']
    }
  }
}
