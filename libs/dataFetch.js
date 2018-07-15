const Web3 = require('web3');
const abi  = require('./ERC891.json');

var getPokethItem = function(address){
  const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/metamask'));
  const PKTH = new web3.eth.Contract(abi,'0xBCdfDbE2bd6A48C5C0cC8e05b5bB9882e4B34447');

  return PKTH.methods.checkFind(address).call();
}

module.exports = {
  getPokethItem : getPokethItem 
}
