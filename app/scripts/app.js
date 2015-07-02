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
            templateUrl: 'views/sidebar-passholder-search.html',
            controller: 'MainController',
            controllerAs: 'mc'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('main.passholder', {
        url: 'passholder/:identification',
        views: {
          'sidebar@': {
            templateUrl: 'views/sidebar-passholder-details.html',
            controller: 'PassholderController',
            controllerAs: 'pc'
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
