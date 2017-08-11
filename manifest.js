const GoodWinston = require('good-winston');

module.exports = {
  "server": {
    "app": {
     "slogan": "RPi IOT"
    }
  },
  "connections": [
    {
      "host": "0.0.0.0",
      "port": 3000,
      "labels": ["web"]
    }
  ],
  "registrations": [
    {
      "plugin": "inert"
    },
    {
      "plugin": "vision"
    },
    {
      "plugin": {
        "register": "good",
        "options": {
          "reporters":{
            winston: [{
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{ log: '*', response: '*' }]
            },{
              module: 'good-winston',
              args: [{ 
                winston: require('winston'),
                level: {
                  ops: undefined
                }  
              }]
            }]
          }
        }
      }
    },
    {
      "plugin": {
        "register": "hapi-bodyparser",
        "options": {
          "merge": false
        }
      }
    }
  ]
}
