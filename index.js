#! /usr/bin/env node

console.time('RunTime');

var VanityEth = require('./libs/VanityEth');
var signer    = require('./libs/signer');
const ora     = require('ora');
var cluster   = require('cluster')
var numCPUs   = require('os').cpus().length
var chalk     = require('chalk');
var argv      = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .example('$0 -d 10 -r 15', 'search with 10 bit difficulty for a tier 1 rarity Pokemon')
  .alias('a', 'address')
  .string('a')
  .describe('a', 'address')
  .option('a', {demand: true, demand: 'address is required'})
  .alias('t', 'threads')
  .string('t')
  .describe('t', 'threads')
  .alias('d', 'diff')
  .string('d')
  .describe('d', 'diff mask')
  .alias('l', 'log')
  .boolean('l')
  .describe('l', 'log output to file')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2018 (jk do whatever you want)')
  .argv;

if (cluster.isMaster) {
  const args = {
      address    : argv.address,
      threads    : argv.threads < numCPUs ? argv.input          : numCPUs,
      diffMask   : argv.diff ? argv.diff                        : 3,
      log        : argv.log ? true                              : false,
      logFname   : argv.log ? 'PKTH-log-' + Date.now() + '.txt' : ''
  }
  if (!VanityEth.isValidHex(args.address)) {
    console.error(args.address+ ' is not valid address');
    process.exit(1);
  }
  if (args.log) {
    var fs = require('fs');
    console.log('logging into' + args.logFname);
    var logStream = fs.createWriteStream(args.logFname, { 'flags': 'a' });
  }
  var walletsFound = 0;

  console.clear();
  console.log(chalk.underline(chalk.red("Pok") + chalk.bgBlack.white("ETH")));
  console.log(chalk.yellow("Difficulty: ") + chalk.red(args.diffMask));
  console.log("\n");

  const spinner = ora({ text: chalk.green('Walking in the tall grass...'), color : 'yellow', stream : process.stdout }).start();

  for (var i = 0; i < args.threads; i++) {
    const worker_env = {
      diffMask : args.diffMask
    }
    proc = cluster.fork(worker_env);
    
    proc.on('message', function(message) {
      const signature      = signer.signWithKey(message.privKey, args.address).signature;
      const printWallet    = (chalk.underline("Found a valid wallet!") + 
                              chalk.blue("\nAddress:     " + chalk.yellow(message.wallet.address) +
                                         "\nPrivate Key: " + chalk.yellow("0x" + message.wallet.privKey)));
      const printSignature = (chalk.underline("Signature Information:") + 
                              chalk.blue("\nSignature:      " + chalk.yellow(signature) +
                                         "\nItem Bit Class: " + chalk.yellow(message.bits)));
      
      spinner.succeed(printWallet);
      spinner.info(printSignature);
      console.log(chalk.white("----------------------------------------------------------------------------------"));

      if (args.log) logStream.write(JSON.stringify(message.wallet) + "\nSigned Message: " + signer.signWithKey(message.privKey, args.address).signature + "\n");
      
      spinner.text = chalk.green('Walking in the tall grass');
      spinner.start();
    });
  }

} else {
  const worker_env = process.env;
  while (true) {
    process.send(VanityEth.getVanityWallet(worker_env.diffMask))
  }
}
process.stdin.resume();
var cleanup = function(options, err) {
  if (err) console.log(err.stack);
  for (var id in cluster.workers) cluster.workers[id].process.kill();
  console.timeEnd('RunTime')
  process.exit();

}
process.on('exit', cleanup.bind(null, {}));
process.on('SIGINT', cleanup.bind(null, {}));
process.on('uncaughtException', cleanup.bind(null, {}));
