'use strict';

const Hapi = require('hapi');
const Glue = require("glue");
const fs = require('fs');
const wpa_cli = require('wireless-tools/wpa_cli');
const chalk = require('chalk');

const routes = require('./lib/routes');
const manifest = require('./manifest.js');
const wifi = require('./connect');
const hotspot = require('./hotspot');
const opts = {
  relativeTo: __dirname
};
const eventBus = require('./event-bus');

let socket;

// Process's Stuffs
//so the program will not close instantly
process.stdin.resume();

function exitHandler(options, err) {
    hotspot.stop(err => {
      console.error(err);
    });

    if (socket) socket.disconnect();
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();

}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

// Server's stuffs
Glue.compose(manifest, opts, (err, server) => {
  if (err) {
    throw err;
  }
  
  server.views({
    engines: { pug: require('pug') },
    path: __dirname + '/views'
  });
  
  for (let route of routes) {
    server.route(route);
  }

  // Event handling goes here
  eventBus.on('handler:error', error => {
    server.log(['error', error.type], error.error);
  });

  eventBus.on('wifi:state', data => {
    server.log(['other','wifi'], data.msg);
  });

  eventBus.on('socket:presence', event => {
    server.log(['other','socket'], event);
  });

  eventBus.on('socket:message-received', event => {
    server.log(['other','socket'], event);
  });

  eventBus.on('socket:message-sent', event => {
    server.log(['other','socket'], event);
  });

  eventBus.on('hotspot:start', () => {
    server.log(['hotspot'], chalk.magenta('Starting hotspot'));
  });

  eventBus.on('hotspot:stop', () => {
    server.log(['hotspot'], chalk.magenta('Stopping hotspot'));
  });

  server.start(() => {
    let server_info = `${server.info.uri}`;
    server.log(['hapi'], `Server running at ${chalk.blue(server_info)}`);

    if (fs.existsSync('ap.json')) {
      let ap_cre = require('./ap.json');

      wifi.connectToAP(ap_cre['ssid-name'], ap_cre['ssid-pass'])
          .then(() => {
            socket = require('./socket');
            socket.connect();
          })
          .catch(err => {
            fs.unlink('./ap.json', function (err) {;
              hotspot.start(err => {
                server.log(['error','hotspot'], err);
              })
            });
          })
          .catch(err => {
            server.log(['error','hotspot'], JSON.stringify(err, null, 4));
          });
    } else {
      hotspot.start(err => {
        if (err) {
          return server.log(['error','hotspot'], err);
        }

        server.log(['hotspot'], chalk.green(`Hotspot started. SSID: ${chalk.bold('testPiAP')}. Connect and navigate to the IP Address ${chalk.bold('192.168.50.1')} to continue`));
      });
    }
  });
});

