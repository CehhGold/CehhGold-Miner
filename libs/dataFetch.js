const Web3 = require('web3');
const abi  = require('./CEHH+.json');

var getReward = function(address){
  const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/metamask'));
  const CehhGold = new web3.eth.Contract(abi,'0xAb8ea41e0D433E89fC4aa564ef46667c08587A2E');

  return CehhGold.methods.checkFind(address).call();
}

module.exports = {
  getReward : getReward 
}
