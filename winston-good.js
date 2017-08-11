const GoodWinston = require('good-winston');
const winston = require('winston');

var logger = new winston.Logger({
    level: 'info',
    transports: [
      winston.transports.Console({
        name: 'debug-console',
        prettyPrint: obj => { console.log(123);return JSON.stringify(obj) },
        handleExceptions: true,
        json: false,
        colorize: true
      })
    ]
  });

module.exports = function () {
  return new GoodWinston({ winston });
};
