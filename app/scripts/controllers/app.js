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
function appController($rootScope, $location, uitid) {
  /*jshint validthis: true */
  var app = this;

  app.user = undefined;
  $rootScope.appReady = false;

  uitid.getUser().then(
    angular.bind(app, function(user) {
      app.user = user;
      $rootScope.appReady = true;
    }),
    function() {
      $rootScope.appReady = true;
    }
  );

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

  // check for any unauthenticated requests and redirect to login
  $rootScope.$on('event:auth-loginRequired', app.login);
  // TODO: The API currently sends a 403 (authorization) when not authenticated
  // also try to login on any unauthorized requests.
  $rootScope.$on('event:auth-forbidden', app.login);

  // make sure the user is still authenticated when navigating to a new route
  $rootScope.$on('$stateChangeStart', function(event) {
    var getLoginStatus = uitid.getLoginStatus();
    var checkUserStatus = function (loggedIn) {
      if (!loggedIn) {
        event.preventDefault();
        uitid.login($location.absUrl());
      }
    };
    getLoginStatus.then(checkUserStatus);
  });
}
