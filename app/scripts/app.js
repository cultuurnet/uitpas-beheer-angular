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
    'angular-spinkit',
    'ui.router'
  ])
  /* @ngInject */
  .config(function ($stateProvider, $locationProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainController',
        controllerAs: 'mc'
      })
      .state('routeA', {
        url: '/route-a',
        views: {
          content: {
            templateUrl: 'views/main.html',
            controller: 'MainController',
            controllerAs: 'mc'
          },
          sidebar: {
            templateUrl: 'views/sidebar-a.html',
            controller: 'MainController',
            controllerAs: 'mc'
          }
        }
      })
      .state('routeB', {
        url: '/route-b',
        views: {
          content: {
            templateUrl: 'views/main.html',
            controller: 'MainController',
            controllerAs: 'mc'
          },
          sidebar: {
            templateUrl: 'views/sidebar-b.html',
            controller: 'MainController',
            controllerAs: 'mc'
          }
        }
      })
      .state('login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        controllerAs: 'lc'
      });

    $locationProvider.html5Mode(true);
  });
