const Controller = require('./controller');

module.exports = {
  dependsOn: ['config', 'app', 'queries'],
  start(config, app, queries, next) {
    const controller = Controller(queries);
    require('./routes')(app, controller);
    next();
  },
};