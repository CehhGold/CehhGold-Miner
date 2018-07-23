const Web3 = require('web3');
const abi  = require('./DCD.json');

var getReward = function(address){
  const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/metamask'));
  const DCD = new web3.eth.Contract(abi,'0xf4E770Dd0E82E636062c05863Cb0d25902bff334');

  return DCD.methods.checkFind(address).call();
}

module.exports = {
  getReward : getReward 
}
