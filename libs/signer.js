const Web3 = require('web3');

var signWithKey = function(privateKey){
  const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/metamask'));
  return web3.eth.accounts.sign(web3.utils.soliditySha3({t:'bytes20',v:'0xF7Dc813B5c746F777DD29c94b7558ADE7577064e'}),privateKey);
}

module.exports = {
  signWithKey: signWithKey
}
