'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:AppController
 * @description
 * # AppController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('AppController', appController);

/* @ngInject */
function appController($rootScope, $location, uitid, counterService) {
  $rootScope.appBusy = true;

  $rootScope.$on('$stateChangeStart', function () {
    $rootScope.appBusy = true;
  });
  $rootScope.$on('$stateChangeSuccess', function () {
    $rootScope.appBusy = false;
  });
  $rootScope.$on('$stateChangeError', function () {
    $rootScope.appBusy = false;
  });

  /*jshint validthis: true */
  var app = this;

  app.user = undefined;
  app.counter = undefined;

  uitid.getUser().then(
    function (user) {
      app.user = user;
    },
    function () {
      $rootScope.appBusy = false;
    }
  );

  app.activeCounter = function (counter) {
    app.counter = counter;
  };

  counterService.getActive().then(app.activeCounter, app.redirectToCounters);

  $rootScope.$on('activeCounterChanged', function (event, activeCounter) {
    app.counter = activeCounter;
  });

  app.login = function () {
    var destination = $location.absUrl();
    uitid.login(destination);
  };

  app.logout = function () {
    uitid.logout().finally(function () {
      app.user = undefined;
      app.redirectToLogin();
    });
  };

  // This function has to be declared before $rootScope.$on('$stateChangeStart', app.authenticateStateChange).
  app.authenticateStateChange = function (event) {
    var getLoginStatus = uitid.getLoginStatus();
    var checkUserStatus = function (loggedIn) {
      if (!loggedIn) {
        uitid.login($location.absUrl());
        event.preventDefault();
      }
    };
    getLoginStatus.then(checkUserStatus);
  };
  
  app.redirectToLogin = function () {
    $location.path('/login');
  };

  app.redirectToCounters = function () {
    $location.path('/counters');
  };

  // check for any unauthenticated requests and redirect to login
  $rootScope.$on('event:auth-loginRequired', app.login);
  // TODO: The API currently sends a 403 (authorization) when not authenticated
  // also try to login on any unauthorized requests.
  $rootScope.$on('event:auth-forbidden', app.login);

  // make sure the user is still authenticated when navigating to a new route
  $rootScope.$on('$stateChangeStart', app.authenticateStateChange);
}
