const Accounts = require('web3-eth-accounts');
const utils    = require('web3-utils');

var signWithKey = function(privateKey, address){
  const accounts = new Accounts(); 
  return accounts.sign(utils.soliditySha3({t:'bytes20',v:address}),"0x"+privateKey);
}

module.exports = {
  signWithKey: signWithKey
}
