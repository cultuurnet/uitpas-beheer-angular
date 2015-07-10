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
    'http-auth-interceptor',
    'ngSanitize',
    'ngTouch',
    'config',
    'angular-spinkit',
    'ui.router',
    'mp.autoFocus'
  ])
  /* @ngInject */
  .config(function ($stateProvider, $locationProvider, $httpProvider) {
    $stateProvider
      // Default parent state.
      .state('counter', {
        templateUrl: 'views/split-view.html',
        requiresCounter: true
      })
      .state('counter.main', {
        url: '/?passholdernotfound&identification',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/content-passholder-search.html',
            controller: 'PassholderController',
            controllerAs: 'pc'
          },
          sidebar: {
            templateUrl: 'views/sidebar-passholder-search.html',
            controller: 'PassholderController',
            controllerAs: 'pc'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('counter.passholder', {
        url: '/passholder/:identification',
        views: {
          content: {
            templateUrl: 'views/sidebar-passholder-details.html'
          },
          sidebar: {
            templateUrl: 'views/sidebar-passholder-details.html',
            controller: 'PassholderController',
            controllerAs: 'pc'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html'
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
          lastActiveId: ['counterService', function(counterService) {
            return counterService.getLastActiveId();
          }]
        }
      })
      .state('error', {
        templateUrl: 'views/error.html',
        controller: 'ErrorController',
        controllerAs: 'error',
        params: {
          'title': null,
          'description': null
        }
      });

    $locationProvider.html5Mode(true);
    $httpProvider.defaults.withCredentials = true;
  });
