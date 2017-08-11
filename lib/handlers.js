const WifiScanner = require('wifiscanner');
const hostapd = require('wireless-tools/hostapd');
const wpa_cli = require('wireless-tools/wpa_cli');
const fs = require('fs');

const scanner = WifiScanner();
const wifi = require('../connect');
const hotspot = require('../hotspot');
const eventBus = require('../event-bus');

module.exports = {
  get_home: function (req, reply) {
    if (fs.existsSync('../ap.json')) {
      return reply('Hi! There\'s nothing you can do here!'); 
    }

    wpa_cli.scan('wlan0', err => {
      if (err) {
        return console.error(err);
      }

      wpa_cli.scan_results('wlan0', (err, data) => {
        if (err) {
          return console.error(err);
        }

        reply.view('index', {
          title: 'PUG Engine',
          networks: data
        });
      });
    });
  },
  post_home: function (req, reply) {
    if (fs.existsSync('../ap.json')) {
      return reply().redirect('/'); 
    }

    let ssidName = req.payload['ssid-name'];
    let ssidPass = req.payload['ssid-pass'];
    
    hotspot.stop(err => {
      if (err) {
        return eventBus.emit('handler:error', {type: 'hotspot', error: JSON.stringify(err, null, 4)});
      }

      wifi.connectToAP(ssidName, ssidPass)
          .then(() => {
            var fs = require('fs');
            
            fs.writeFile(__dirname + '/../ap.json', JSON.stringify({"ssid-name": ssidName, "ssid-pass": ssidPass}, null, 2), err => { console.log(err) });
            wpa_cli.save_config('wlan0', (err, data) => {
              if (err) return console.log(err);

              console.log(data);
            });
            socket = require('../socket');
            socket.connect();
          })
          .catch(err => {
            eventBus.emit('handler:error', {type: 'wifi', error: JSON.stringify(err, null, 4)});

            hotspot.start(err => {
              throw err;
            })
          })
          .catch(err => {
            eventBus.emit('handler:error', {type: 'hotspot', error: JSON.stringify(err, null, 4)});
          });
    });
  },
  static_js: {
    directory: {
      path: [
        __dirname + '/../node_modules/bootstrap/dist/js',
        __dirname + '/../node_modules/jquery/dist',
      ]
    }
  },
  static_css: {
    directory: {
      path: [
        __dirname + '/../node_modules/bootstrap/dist/css'
      ]
    }
  }
}

