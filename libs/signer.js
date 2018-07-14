const Web3 = require('web3');

var signWithKey = function(privateKey, address){
  const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/metamask'));
  return web3.eth.accounts.sign(web3.utils.soliditySha3({t:'bytes20',v:address}),"0x"+privateKey);
}

module.exports = {
  signWithKey: signWithKey
}
