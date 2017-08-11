const PubNub = require('pubnub');

const pubnub = new PubNub({
  publishKey: "pub-c-24ea5a54-422d-4861-809d-f8d4593a6d9b",
  subscribeKey: "sub-c-e63291cc-7ce6-11e7-9c85-0619f8945a4f",
  uuid: 'raspberry'
});

pubnub.addListener({
  message: msg => {
    console.log(msg);
  },
  presence: function (presenceEvent) {
    console.log(presenceEvent);
  }
});
console.log('unsubscribe');
    pubnub.unsubscribe({
      channels: ['ap-channel'],
      withPresence: true
    });
console.log('finished');
