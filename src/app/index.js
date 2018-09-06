const Controller = require('./controller');

module.exports = {
  dependsOn: ['config', 'app', 'queries', 'mysql'],
  start(config, app, queries, mysql, next) {
    const controller = Controller(queries, mysql);
    require('./routes')(app, controller);
    next();
  },
};