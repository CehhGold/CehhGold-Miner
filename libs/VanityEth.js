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
  const _addressA = parseInt(address.slice(-9),16).toString(2);
  const _addressB = parseInt(address.slice(-19,-10),16).toString(2);
  const _address  = _addressB.concat(_addressA);

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
var getVanityWallet = function(difficulty) {
  let _wallet   = getRandomWallet();
  let hashes    = 0;
  const t0      = Date.now();

  while (isValidVanityWallet(_wallet) < difficulty) {
    _wallet = getRandomWallet();
    hashes++;
    if(Date.now() > t0 + 1000 && hashes > 1000)
      return { topic: "HASHES", data: { hashes: hashes, time : Date.now() - t0 } }
  }
  
  return { topic: "WALLET", data: { wallet : _wallet, bits : countBits(_wallet.address), hashes: hashes } }
}

module.exports = {
  getVanityWallet : getVanityWallet,
  isValidHex      : isValidHex,
}
