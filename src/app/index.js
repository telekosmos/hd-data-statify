const Controller = require('./controller');

module.exports = {
  dependsOn: ['config', 'app'],
  start(config, app, next) {
    const controller = Controller();
    require('./routes')(app, controller);
    next();
  },
};