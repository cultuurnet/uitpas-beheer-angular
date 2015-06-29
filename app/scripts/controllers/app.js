'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('AppCtrl', appCtrl);

/* @ngInject */
function appCtrl($rootScope, $location, uitid, counterService) {
  $rootScope.appBusy = true;

  $rootScope.$on('$routeChangeStart', function() {
    $rootScope.appBusy = true;
  });
  $rootScope.$on('$routeChangeSuccess', function() {
    $rootScope.appBusy = false;
  });
  $rootScope.$on('$routeChangeError', function() {
    $rootScope.appBusy = false;
  });

  /*jshint validthis: true */
  var app = this;

  app.user = undefined;
  app.counter = undefined;

  uitid.getUser().then(
    function(user) {
      app.user = user;
    },
    function() {
      $rootScope.appBusy = false;
    }
  );

  counterService.getActive().then(function(activeCounter) {
    app.counter = activeCounter;
  });

  $rootScope.$on('activeCounterChanged', function(event, activeCounter) {
    app.counter = activeCounter;
  });

  app.login = function() {
    var destination = $location.absUrl();
    uitid.login(destination);
  };

  app.logout = function() {
    uitid.logout().finally(function() {
      app.user = undefined;
      app.redirectToLogin();
    });
  };

  app.redirectToLogin = function() {
    $location.path('/login');
  };

  app.redirectToCounters = function() {
    $location.path('/counters');
  };
}
