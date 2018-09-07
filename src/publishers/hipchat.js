const Hipchatter = require('hipchatter');
const logger = require('module-tsl-logger');

const hipchat = (config) => {
  const hipchatApiToken = config.apiToken || process.env.HIPCHAT_TOKEN;
  const hipchatApiAddress = 'https://tesglobal.hipchat.com/v2/';
  const chatter = new Hipchatter(hipchatApiToken, hipchatApiAddress);

  const sendAsync = (message, color, notify, callback) => new Promise((resolve, reject) => {
    const roomId = config.roomId;
    const defaultCallback = (error) => {
      if (error == null) {
        logger.info(`Successfully notified the room`);
        resolve(message);
      } else {
        logger.logError(error, 'error sending message');
        reject(error);
      }
    };

    chatter.notify(roomId,
      {
        from: '',
        message,
        color,
        notify,
      }, callback || defaultCallback);
  });

  return {
    send: sendAsync,
  };
};


module.exports = () => ({
  dependsOn: ['config'],
  start: (config, callback) => {
    return callback(null, hipchat(config.hipchat));
  },
});
