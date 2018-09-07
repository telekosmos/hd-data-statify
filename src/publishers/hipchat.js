const Hipchatter = require('hipchatter');

const hipchat = (config) => {
  const hipchatApiToken = config.apiToken;
  const hipchatApiAddress = 'https://tesglobal.hipchat.com/v2/';
  const chatter = new Hipchatter(hipchatApiToken, hipchatApiAddress);

  const send = (message, color, notify, callback) => {
    const roomId = config.roomId;
    const defaultCallback = (error) => {
      if (error == null) {
        console.log(`Successfully notified the room`);
      } else {
        console.error(error, 'error sending message');
      }
    };

    chatter.notify(roomId,
      {
        from: 'HD-Data-Statify',
        message,
        color,
        notify,
      }, callback || defaultCallback);
  };

  return {
    send,
  };
};

module.exports = () => ({
  dependsOn: ['config'],
  start: (config, callback) => {
    return callback(null, hipchat(config.hipchat));
  },
});
