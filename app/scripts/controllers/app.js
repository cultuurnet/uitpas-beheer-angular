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
function appCtrl($rootScope, $location, uitid, counter) {
  $rootScope.appBusy = true;

  /*jshint validthis: true */
  var app = this;

  app.user = undefined;
  app.counter = undefined;

  uitid.getUser().then(
    angular.bind(app, function(user) {
      app.user = user;
    }),
    function() {
      $rootScope.appBusy = false;
    }
  );

  $rootScope.$on('$routeChangeStart', function() {
    $rootScope.appBusy = true;
  });
  $rootScope.$on('$routeChangeSuccess', function() {
    $rootScope.appBusy = false;
  });
  $rootScope.$on('$routeChangeError', function() {
    $rootScope.appBusy = false;
  });

  $rootScope.$on('activeCounterChanged', function(event, activeCounter) {
    app.counter = activeCounter;
  });

  app.login = function() {
    var destination = $location.absUrl();
    uitid.login(destination);
  };

  app.logout = function() {
    uitid.logout().then(app.redirectToLogin, app.redirectToLogin);
  };

  app.redirectToLogin = angular.bind(app, function() {
    $location.path('/login');
    app.user = undefined;
  });

  app.switchCounter = function() {
    counter.setNoActive();
    $location.path('/counters');
  };
}
