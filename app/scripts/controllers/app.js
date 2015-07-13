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
function appController($rootScope, $location, uitid, counterService, $state) {
  $rootScope.appBusy = true;

  $rootScope.$on('$stateChangeStart', function () {
    $rootScope.appBusy = true;
  });
  $rootScope.$on('$stateChangeSuccess', function () {
    $rootScope.appBusy = false;
  });
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    $state.go(
      'counter.main.error',
      {
        title: error.title,
        description: error.message
      }
    );
    $rootScope.appBusy = false;
  });

  /*jshint validthis: true */
  var app = this;

  app.user = undefined;
  app.counter = undefined;

  app.requireActiveCounter = function (event, toState, toParams) {
    if (toState.requiresCounter && !app.counter) {
      event.preventDefault();
    } else {
      return;
    }

    var chooseCounter = function () {
      app.redirectToCounters();
    };

    var activateCounter = function (activeCounter) {
      app.counter = activeCounter;
      $state.go(toState, toParams);
    };

    counterService.getActive().then(activateCounter, chooseCounter);
  };

  $rootScope.$on('activeCounterChanged', function (event, activeCounter) {
    app.counter = activeCounter;
  });

  app.login = function () {
    var destination = $location.absUrl();

    // send the user to somewhere that makes sense when navigating from the login page
    if ($state.current.name === 'login') {
      destination = $state.href('counter.main', {}, {absolute: true});
    }

    uitid.login(destination);
  };

  app.logout = function () {
    uitid.logout().finally(function () {
      app.user = undefined;
      app.redirectToLogin();
    });
  };

  app.authenticateStateChange = function (event, toState) {
    var navigatingToLoginPage = (toState.name === 'login');
    var checkUserStatus = function (loggedIn) {
      if (!loggedIn && !navigatingToLoginPage) {
        app.login();
        event.preventDefault();
      }

      if (loggedIn) {
        uitid.getUser().then(app.setUser);
      }
    };

    uitid.getLoginStatus().then(checkUserStatus);
  };

  app.setUser = function (user) {
    app.user = user;
  };

  app.redirectToLogin = function () {
    $state.go('login');
  };

  app.redirectToCounters = function () {
    $state.go('counters');
  };

  // check for any unauthenticated requests and redirect to login
  $rootScope.$on('event:auth-loginRequired', app.login);
  // TODO: The API currently sends a 403 (authorization) when not authenticated
  // also try to login on any unauthorized requests.
  $rootScope.$on('event:auth-forbidden', app.login);

  // make sure the user is still authenticated when navigating to a new route
  $rootScope.$on('$stateChangeStart', app.authenticateStateChange);

  $rootScope.$on('$stateChangeStart', app.requireActiveCounter);
}
