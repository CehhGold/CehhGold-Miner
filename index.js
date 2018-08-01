#! /usr/bin/env node

var chalk = require('chalk');
const title = chalk.underline(chalk.bgBlack.white("CEHH+ Miner"));

console.clear();
var argv = require('yargs')
  .command(require('./miner'))
  .demandCommand(1, title + '\nYou need to provide a command!\n\n' + chalk.yellow('cehhgold-miner run -a YOUR_ADDRESS') + '\n\tfor the miner or \n' + chalk.yellow('cehhgold-miner inspect') + '\n\tto open the log reader.\n\n')
  .argv;
