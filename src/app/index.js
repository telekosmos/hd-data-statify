module.exports = {
  dependsOn: ['config', 'app'],
  start(config, app, next) {
    require('./routes')(app);
    next();
  },
};