#! /usr/bin/env node


var fs        = require('fs');
var VanityEth = require('./libs/VanityEth');
var signer    = require('./libs/signer');
var cluster   = require('cluster')
var numCPUs   = require('os').cpus().length
var chalk     = require('chalk');

const run = (argv) => {
  if (cluster.isMaster) {
    const args = {
      address    : argv.address,
      difficulty : argv.difficulty || 28,
      threads    : argv.threads < numCPUs ? argv.threads : numCPUs,
    }
    if (!VanityEth.isValidHex(args.address)) {
      console.error(args.address + ' is not valid address');
      process.exit(1);
    }

    var walletsFound = 0;

    console.clear();

    for (var i = 0; i < args.threads; i++) {
      const worker_env = {
        difficulty: args.difficulty
      }
      proc = cluster.fork(worker_env);

      proc.on('message', function(message) {
        printFind(message, args);
      });
    }

  } else {
    const worker_env = process.env;
    while (true) {
      process.send(VanityEth.getVanityWallet(worker_env.difficulty))
    }
  }

  async function printFind(message, args) {
    const signature      = signer.signWithKey(message.wallet.privKey, args.address).signature;
    const printWallet    = (chalk.underline(  "Found a valid wallet!  " ) +
      chalk.blue(" \nAddress:             " + chalk.yellow(message.wallet.address) +
        " \nPrivate Key:         " + chalk.yellow("0x" + message.wallet.privKey)));
    const printSignature = (chalk.underline( " Signature Information: " ) +
      chalk.blue(" \nSignature:           " + chalk.yellow(signature) +
        " \nDifficulty:          " + chalk.yellow(message.bits) +
        " \nReward:              " + chalk.white(-1) +" CehhGold" ));

    const logObject = {};
    logObject[message.bits] = [message.wallet,signature];

    console.log(logObject)
  }

  process.stdin.resume();
  var cleanup = function(options, err) {
    if (err) console.log(err.stack);
    for (var id in cluster.workers) cluster.workers[id].process.kill();
    process.exit();

  }
  process.on('exit', cleanup.bind(null, {}));
  process.on('SIGINT', cleanup.bind(null, {}));
  process.on('uncaughtException', cleanup.bind(null, {}));
}

module.exports = {
  handler: run,
  command: 'run',
  usage: 'Usage: $0 <command> [options]',
  example: chalk.yellow('$0 -a 0xF7Dc813B5c746F777DD29c94b7558ADE7577064e')
  + chalk.green('Mine for CehhGold and get a signature authorizing address 0xF7Dc813B5c746F777DD29c94b7558ADE7577064e.'),
  builder: {
    a: {
      alias:'address',
      describe: chalk.green('User address'),
      type: 'string',
      demand: true,
      demand: 'address is required for signing',
    },
    t: {
      alias:'threads',
      type: 'number',
      describe: chalk.green('Threads to use. Default to 1 per core.'),
    },
    d: {
      alias:'difficulty',
      type: 'number',
      describe: chalk.green('Minimum difficulty to mine and save signatures.'),
    },
    l: {
      alias:'log',
      type: 'string',
      describe: chalk.green('Path to directory for output logs.'),
    },
  },
}
