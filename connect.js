const chalk = require('chalk');
const wpa_cli = require('wireless-tools/wpa_cli');
const eventBus = require('./event-bus.js');
const iface = "wlan0";

module.exports = {};
module.exports.connectToAP = function (ssid, pass) {

return new Promise((res, rej) => {
  console.log('remove_network');
  wpa_cli.remove_network(iface, 'all', (err) => {
    if (err) {
      rej(err);
      return;
    }
    
    console.log('add_network');
    wpa_cli.add_network(iface, (err, id) => {
      if (err) {
        rej(err);
        return;
      }

      id = parseInt(id.result);
      
      console.log('set_network ssid');
      wpa_cli.set_network(iface, id, '"ssid"', `'"${ssid}"'`, (err) => {
        if (err) {
          rej(err);
          return;
        }

        console.log('set_network psk');
        wpa_cli.set_network(iface, id, "psk", `'"${pass}"'`, (err) => {
          if (err) {
            rej(err);
            return;
          }
          
          console.log('set_network key_mgmt');
          wpa_cli.set_network(iface, id, "key_mgmt", "WPA-PSK", (err) => {
            if (err) {
              rej(err);
              return;
            }
            
            console.log('enable_network');
            wpa_cli.enable_network(iface, id, (err,data) => {
              if (err) {
                rej(err);
                return;
              }
              
              let connected = false;
              let dns = require('dns');
              let try_count = 0;
              
              
              let connectTimer = setInterval(function () {
                dns.lookup('www.google.com', function (err) {
                  if (err) {
                    // server.log(['other','wifi'], chalk.red('No Connection'));
                    eventBus.emit('wifi:state', { msg: chalk.red('No Connection') });
                    try_count += 1;
                  } else {
                    clearInterval(connectTimer);
                    // server.log(['other','wifi'], chalk.green('Connected');
                    connectTimer = setInterval(function () {
                      wpa_cli.status('wlan0', (err, status) => {
                        if (err) {
                          rej(err);
                          return;
                        }
                        
                        if (status.ip) {
                          clearInterval(connectTimer);
                          eventBus.emit('wifi:state', { msg: chalk.green(`Connected. IP: ${status.ip}`) });
                          res('connected');
                        }
                      });
                    }, 2000);
                  }

                  if (try_count >= 5) {
                    rej('no connection');
                    clearInterval(connectTimer);
                  }

                });
              }, 2000);
            });
          });
        });
      });
    });
  });
});

}
