const crypto = require('crypto');
var ethUtils = require('ethereumjs-util');

var getRandomWallet = function() {
  var randbytes = crypto.randomBytes(32);
  var address = '0x' + ethUtils.privateToAddress(randbytes).toString('hex');
  return { address: address, privKey: randbytes.toString('hex') }
}
var isValidHex = function(hex) {
  if (!hex.length) return true;
  hex = hex.toUpperCase();
  var re = /^[0-9A-F]+$/g;
  return re.test(hex);
}
var countBits = function(bin) {
  return bin.toString(2).replace(/0/gi,'').length;
}
var isValidVanityWallet = function(wallet, input, diffPow) {
  var _add = wallet.address;

  const diffMask = Math.pow(2,diffPow)-1;
  const h = parseInt(_add.substr(-13), 16)
  const x = countBits(h);
 
  const diff = Math.floor(parseInt(_add.substr(2,6), 16));
  const done = (diff & diffMask) === 0;

  return x === parseInt(input,10) && done;
}
var getVanityWallet = function(input = '', diffMask = 3) {
  if (!isValidHex(input)) throw new Error(ERRORS.invalidHex);
  input = input.toLowerCase();
  var _wallet = getRandomWallet();
  var g = 0;
  while (!isValidVanityWallet(_wallet, input, diffMask)) { g++;  _wallet = getRandomWallet(); }
  console.log("\n Generated " + g + " wallets.");
  return _wallet;
}
module.exports = {
  getVanityWallet: getVanityWallet,
  isValidHex: isValidHex,
}
