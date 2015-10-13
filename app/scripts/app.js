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
    'angular-spinkit',
    'config',
    'http-auth-interceptor',
    'jkuri.touchspin',
    'mp.autoFocus',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ubr.activity',
    'ubr.advantage',
    'ubr.checkindevices',
    'ubr.counter',
    'ubr.expense-report',
    'ubr.group',
    'ubr.kansenstatuut',
    'ubr.membership',
    'ubr.passholder',
    'ubr.registration',
    'ui.router',
    'ui.bootstrap'
  ])
  .constant('moment', moment) // jshint ignore:line
  /* @ngInject */
  .config(function ($stateProvider, $locationProvider, $httpProvider, ngTouchSpinProvider) {

    ngTouchSpinProvider.arrowControlsEnabled(false);

    redirectOnScan.$inject = ['UiTPASRouter'];
    function redirectOnScan(UiTPASRouter) {
      UiTPASRouter.redirectOnScanEnabled(true);
    }

    $stateProvider
      // Default parent state.
      .state('counter', {
        templateUrl: 'views/split-view.html',
        requiresCounter: true,
        onEnter: redirectOnScan
      })
      .state('counter.main', {
        url: '/',
        requiresCounter: true,
        redirectOnScan: true,
        views: {
          content: {
            templateUrl: 'views/content-search.html',
            controller: 'PassholderSearchController',
            controllerAs: 'psc'
          },
          sidebar: {
            templateUrl: 'views/sidebar-search.html',
            controller: 'PassholderSearchController',
            controllerAs: 'psc'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('counter.main.error', {
        redirectOnScan: true,
        views: {
          'content@counter': {
            templateUrl: 'views/error.html',
            controller: 'ErrorController',
            controllerAs: 'error'
          }
        },
        params: {
          'title': null,
          'description': null
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.defaults.withCredentials = true;
  })
  .run(function(nfcService, eIDService) {
    nfcService.init();
    eIDService.init();
  })
  .constant('isJavaFXBrowser', navigator.userAgent.indexOf('JavaFX') > -1);
