const crypto = require('crypto');
var ethUtils = require('ethereumjs-util');

var getRandomWallet = function() {
  var randbytes     = crypto.randomBytes(32);
  var address       = '0x' + ethUtils.privateToAddress(randbytes).toString('hex');

  return { address: address, privKey: randbytes.toString('hex') }
}
var isValidHex = function(hex) {
  var re = /^0x[a-fA-F0-9]{40}$/g;
  
  return re.test(hex);
}
var countBits = function(address) {
  const _address = parseInt(address.substr(-20),16).toString(2);
  let c = 0;
  for(let i = _address.length-1; i >= 0; i--){
    if(_address[i] === '1'){
      c++;
    } else {
      return c;
    }
  }
}
var isValidVanityWallet = function(wallet) {
  var _addr = wallet.address;

  return countBits(_addr);
}
var getVanityWallet = function() {
  var _wallet   = getRandomWallet();

  while (isValidVanityWallet(_wallet) < 8*4) {
    _wallet = getRandomWallet();
  }
  
  return { wallet : _wallet, bits : countBits(_wallet.address) }
}

module.exports = {
  getVanityWallet : getVanityWallet,
  isValidHex      : isValidHex,
}
