'use strict';

angular.module('initSentry', ['config'])
  /* @ngInject */
  .config(function(appConfig) {
    if (Raven && Raven.Plugins && Raven.Plugins.Angular && appConfig.sentry && appConfig.sentry.env && appConfig.sentry.dsn) {
      Raven.config(appConfig.sentry.dsn)
        .setEnvironment(appConfig.sentry.env)
        .addPlugin(Raven.Plugins.Angular)
        .install();
    } else {
      angular.module('ngRaven', []);
    }
  });
