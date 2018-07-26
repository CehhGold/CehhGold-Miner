#! /usr/bin/env node

var chalk     = require('chalk');
var argv = require('yargs')
  .describe('CEHH+ Miner')
  .command(require('./miner'))
  .command(require('./libs/inspect'))
  .epilog('copyright 2018')
  .demandCommand(1, 'You need to provide a command. Use ' + chalk.yellow('cehhgold-miner run -a YOUR_ADDRESS') + ' for the miner or ' + chalk.yellow('cehhgold-miner inspect') + ' to open the log reader.')
  .help('help')
  .argv;
