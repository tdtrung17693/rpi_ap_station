const hostapd = require('wireless-tools/hostapd');
const eventBus = require('./event-bus');

module.exports = {};

module.exports.start = function (cb) {
  eventBus.emit('hotspot:start');
  const hp_opts = {
    interface: 'uap0',
    channel: 2,
    hw_mode: 'g',
    macaddr_acl: 0,
    auth_algs: 1,
    ignore_broadcast_ssid: 0,
    ssid: 'testPiAP',
    wpa: 2,
    wpa_passphrase: 'badpassword',
    wpa_key_mgmt: 'WPA-PSK',
    wpa_pairwise: 'CCMP',
    rsn_pairwise: 'CCMP'
  };

  hostapd.enable(hp_opts, err => {
    cb(err);  
  });

};

module.exports.stop = function (cb) {
  eventBus.emit('hotspot.stop');
  hostapd.disable('uap0', err => {
    cb(err);
  });
};
