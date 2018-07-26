#! /usr/bin/env node

var fs             = require('fs');
var numCPUs        = require('os').cpus().length
var chalk          = require('chalk');
var inquirer       = require('inquirer');


const getLogs = async (argv) => {
  const args = {
    log        : !argv.log ? require('os').homedir() : argv.log,
    logFname   : 'cehhgold-miner-' + Date.now() + '.log'
  }

  const dir    = args.log + '/CehhGold/';

  const buffer = await readFiles(dir);
  const data   = buffer.join();

  let logs     = ('[' + data.replace(/,+/g,',').slice(0,-1) + ']' );
  let ordered  = (JSON.parse(logs).sort((a,b) => {
    return parseInt(Object.keys(b)[0]) - parseInt(Object.keys(a)[0])
  }));

  const count  = {};
  ordered.forEach((v) => {
    count[Object.keys(v)[0]] = (count[Object.keys(v)[0]] || 0) + 1;
  });

  const countFormat = Object.entries(count).reduce((a,v) => {
    return a + chalk.red("\n *" + " ".repeat(10 - v[0].length) + v[0] + " " + chalk.blue("  =>  ") + chalk.yellow(v[1]));
  }, chalk.underline('Bit Difficulty =>  Wallets Found'));




  console.clear();
  console.log(chalk.underline(chalk.bgBlack.white("CEHH+ Miner Inspector")) + chalk.green('\n -> Reading from ' + dir + '\n'));
  console.log((countFormat));
  console.log("");

  const questions = [
    {
      type: 'input',
      name: 'difficulty',
      message: 'Which bit difficulty tier do you want to print out?',
      validate: (value) => {
        return value.match(/^[0-9]{0,4}$/) && count[value] ? true : 'Please type a number.\n(Bit difficulties range from 0 to 1360)';
      }
    },
  ];

  inquirer
    .prompt(questions)
    .then((answers) => {
      const diff    = answers.difficulty;
      const result  = ordered.filter((v) => Object.keys(v)[0] === diff);

      if(result.length === 0) {
        console.log('Something went wrong!'); 
      } else {
        result.forEach((v) => {
          const wallet      = v[diff][0];
          const signature   = v[diff][1];

          const printSignature  = "Signature:   " + chalk.yellow(signature);
          const printWallet     = "Address:     " + chalk.yellow(wallet.address);
          const printPrivateKey = "Private Key: " + chalk.yellow(wallet.privKey);

          const printOut        = [printSignature,printWallet,printPrivateKey].join("\n");
          console.log(printOut);
          console.log(chalk.white("----------------------------------------------------------------------------------"));

        });
      }
    })

}

const readFiles = (dir) => {
  let buffer = new Array();
  let fc;

  return new Promise(function(resolve,reject){
    if (!fs.existsSync(dir)){
      reject('no such directory');
    } else {
      fs.readdir(dir, function(e,f){
        if(e) {
          reject(e);
        } else {
          fc = f.length;
          f.forEach(function(file){
            buffer.push(fs.readFileSync(dir + file, 'utf-8'));
            if(--fc === 0){
              resolve((buffer));
            }
          });
        }
      });
    }
  });
}

module.exports = {
  handler: getLogs,
  command: 'inspect',
  usage: 'Usage: $0 <command> [options]',
  builder: {
    l:{
      alias: 'log',
      type: 'string',
      describe: chalk.green('Directory of output log files'),
    },
  },
}
