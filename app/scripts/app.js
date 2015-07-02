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
    'ngSanitize',
    'ngTouch',
    'config',
    'angular-spinkit',
    'ui.router'
  ])
  /* @ngInject */
  .config(function ($stateProvider, $locationProvider, $httpProvider) {
    $stateProvider
      // Default parent state.
      .state('counter', {
        templateUrl: 'views/split-view.html'
      })
      .state('counter.main', {
        url: '/',
        views: {
          content: {
            templateUrl: 'views/main.html'
          },
          sidebar: {
            templateUrl: 'views/sidebar-main.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        controllerAs: 'lc'
      })
      .state('counters', {
        url: '/counters',
        templateUrl:'views/counters.html',
        controller: 'CountersController',
        controllerAs: 'counters',
        resolve: {
          list: ['counterService', function(counterService) {
            return counterService.getList();
          }],
          lastActiveId: ['counterService', 'resolveService', function(counterService, resolveService) {
            return resolveService.resolveRejectedAs(
              counterService.getLastActiveId(),
              undefined
            );
          }]
        }
      });

    $locationProvider.html5Mode(true);
    $httpProvider.defaults.withCredentials = true;
  });
