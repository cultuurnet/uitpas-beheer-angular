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
function appCtrl($rootScope, $location, uitid) {
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

  $rootScope.$on('$locationChangeStart', function() {
    var userLoggedIn = uitid.getLoginStatus();
    var checkUserStatus = function (userStatus) {
      if (!userStatus) {
        uitid.login($location.absUrl());
      }
    };
    userLoggedIn.then(checkUserStatus);
  });
}
