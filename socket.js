const PubNub = require('pubnub');

const eventBus = require('./event-bus');

const pubnub = new PubNub({
  publishKey: "pub-c-24ea5a54-422d-4861-809d-f8d4593a6d9b",
  subscribeKey: "sub-c-e63291cc-7ce6-11e7-9c85-0619f8945a4f",
  uuid: 'raspberry'
});

pubnub.addListener({
  message: msg => {
    eventBus.emit('socket:message-received', msg);
  },
  presence: function (presenceEvent) {
    eventBus.emit('socket:presence', presenceEvent);
  }
});

module.exports = {
  connect: function () {
    pubnub.subscribe({
      channels: ['ap-channel'],
      withPresence: true
    });
  },
  disconnect: function () {
    pubnub.unsubscribe({ channels: ['ap-channel'], withPresence: true });
  },
  send: function (channel, data) {
    pubnub.publish({
      channel: channel,
      message: data
    }, (status, response) => {
      eventBus.emit('socket:message-sent', { status: status, response: response });
    });
  }
};
