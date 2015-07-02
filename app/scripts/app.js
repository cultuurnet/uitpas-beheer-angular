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
  .config(function ($stateProvider, $locationProvider) {
    $stateProvider
      // Default parent state.
      .state('main', {
        url: '/',
        views: {
          content: {
            templateUrl: 'views/main.html',
            controller: 'MainController',
            controllerAs: 'mc'
          },
          sidebar: {
            templateUrl: 'views/sidebar-main.html',
            controller: 'MainController',
            controllerAs: 'mc'
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
        views: {
          content: {
            templateUrl:'views/counters.html',
            controller: 'CountersCtrl',
            controllerAs: 'counters'
          }
        },
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
  });
