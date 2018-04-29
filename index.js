#! /usr/bin/env node

console.time('RunTime');

var VanityEth = require('./libs/VanityEth');
const ora = require('ora');
var cluster = require('cluster')
var numCPUs = require('os').cpus().length
var argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .example('$0 -d 10 -r 15', 'search with 10 bit difficulty for a tier 1 rarity Pokemon')
  .example('$0 -n 1000', 'get 1000 random wallets')
  .alias('r', 'input')
  .string('r')
  .describe('r', 'rarity')
  .alias('d', 'diff')
  .string('d')
  .describe('d', 'diff mask')
  .alias('n', 'count')
  .number('n')
  .describe('n', 'number of wallets')
  .alias('l', 'log')
  .boolean('l')
  .describe('l', 'log output to file')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2018 (jk do whatever you want)')
  .argv;
if (cluster.isMaster) {
  const args = {
    input: argv.input ? argv.input : 10,
    diffMask: argv.diff ? argv.diff : 3,
    numWallets: argv.count ? argv.count : 1,
    log: argv.log ? true : false,
    logFname: argv.log ? 'PKTH-log-' + Date.now() + '.txt' : ''
  }
  if (!VanityEth.isValidHex(args.input)) {
    console.error(args.input + ' is not valid hexadecimal');
    process.exit(1);
  }
  if (args.log) {
    var fs = require('fs');
    console.log('logging into' + args.logFname);
    var logStream = fs.createWriteStream(args.logFname, { 'flags': 'a' });
  }
  var walletsFound = 0;
  console.log("PKTH Miner","\n+ + + + + + + + + + + + + + + + + +", "\nDifficulty: " + args.diffMask, "\nRarity objective: " + args.input, "\n+ + + + + + + + + + + + + + + + + +");
  const spinner = ora('walking in the tall grass').start();
  for (var i = 0; i < numCPUs; i++) {
    const worker_env = {
      input: args.input,
      diffMask: args.diffMask
    }
    proc = cluster.fork(worker_env);
    proc.on('message', function(message) {
      spinner.succeed(JSON.stringify(message));
      if (args.log) logStream.write(JSON.stringify(message) + "\n");
      walletsFound++;
      if (walletsFound >= args.numWallets) {
        cleanup();
      }
      spinner.text ='walking in the tall grass';
      spinner.start();
    });
  }

} else {
  const worker_env = process.env;
  while (true) {
    process.send(VanityEth.getVanityWallet(worker_env.input, worker_env.diffMask))
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
