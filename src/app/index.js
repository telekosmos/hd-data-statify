const Controller = require('./controller');
const Hipchat = require('../publishers/hipchat');

module.exports = {
  dependsOn: ['app', 'queries', 'hipchat'],
  start(app, queries, hipchat, next) {
    const controller = Controller(hipchat, queries);
    require('./routes')(app, controller);
    next();
  },
};
