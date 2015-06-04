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
function appCtrl($location, uitid) {
  this.login = function() {
    var destination = $location.absUrl();
    uitid.login(destination);
  };

  this.logout = function() {
    uitid.logout().then(this.redirectToLogin, this.redirectToLogin);
  };

  this.redirectToLogin = function() {
    $location.path('/');
  };

  uitid.getUser().then(angular.bind(this, function(user) {
    this.user = user;
  }));
}
