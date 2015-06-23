'use strict';

/**
 * @ngdoc overview
 * @name uitpasbeheerApp
 * @description
 * # uitpasbeheerApp
 *
 * Main module of the application.
 */
angular
  .module('uitpasbeheerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'config',
    'angular-spinkit'
  ])
  /* @ngInject */
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          redirectIfAnonymous: ['redirect', function(redirect) {
            return redirect.ifAnonymous('/login');
          }],
          redirectIfNoActiveCounter: ['redirect', function(redirect) {
            return redirect.ifNoActiveCounter('/counters');
          }]
        }
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        resolve: {
          redirectIfLoggedIn: ['redirect', function(redirect) {
            return redirect.ifLoggedIn('/');
          }]
        }
      })
      .when('/counters', {
        templateUrl: 'views/counters.html',
        controller: 'CountersCtrl',
        controllerAs: 'counters',
        resolve: {
          redirectIfAnonymous: ['redirect', function(redirect) {
            return redirect.ifAnonymous('/login');
          }],
          redirectIfActiveCounter: ['redirect', function(redirect) {
            return redirect.ifActiveCounter('/');
          }],
          list: ['counter', function(counter) {
            return counter.getList();
          }],
          lastActive: ['counter', function(counter) {
            return counter.getLastActive();
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
