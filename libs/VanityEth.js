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
  return parseInt(address.substr(-13), 16).toString(2).replace(/0/gi,'').length;
}
var isValidVanityWallet = function(wallet, diffPow) {
  var _addr = wallet.address;

  const diffMask = Math.pow(2,diffPow)-1;
  const x        = countBits(_addr);
 
  const diff = Math.floor(parseInt(_addr.substr(2,6), 16));
  const done = (diff & diffMask) === 0;

  return x <= 15 && done;
}
var getVanityWallet = function(diffMask = 3) {
  var _wallet   = getRandomWallet();
  var g         = 0;

  while (!isValidVanityWallet(_wallet, diffMask)) { g++;  _wallet = getRandomWallet(); }
  
  return { wallet : _wallet, bits : countBits(_wallet.address) }
}

module.exports = {
  getVanityWallet : getVanityWallet,
  isValidHex      : isValidHex,
}
