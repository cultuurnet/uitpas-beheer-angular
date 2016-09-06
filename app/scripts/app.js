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
    'angular.chosen',
    'angular-spinkit',
    'config',
    'http-auth-interceptor',
    'jkuri.touchspin',
    'mp.autoFocus',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ubr.activity',
    'ubr.advantage',
    'ubr.counter',
    'ubr.group',
    'ubr.feedback',
    'ubr.help',
    'ubr.kansenstatuut',
    'ubr.membership',
    'ubr.passholder',
    'ubr.registration',
    'ubr.utilities',
    'ui.router',
    'ui.bootstrap',
    'cultuurnet.ga-tag-manager'
  ])
  .constant('moment', moment) // jshint ignore:line
  /* @ngInject */
  .config(function ($stateProvider, $locationProvider, $httpProvider, ngTouchSpinProvider, $urlRouterProvider) {

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
            templateUrl: 'views/passholder/search/content-search.html',
            controller: 'PassholderSearchController',
            controllerAs: 'psc'
          },
          sidebar: {
            templateUrl: 'views/passholder/search/sidebar-search.html',
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
        onEnter: redirectOnScan,
        views: {
          'content@counter': {
            templateUrl: 'views/error.html',
            controller: 'ErrorController',
            controllerAs: 'error'
          }
        },
        params: {
          'title': null,
          'description': null,
          'code': null
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html'
      })
      .state('login.moreInfo', {
        /* @ngInject */
        onEnter: function($state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/modal-more-info.html',
              size: 'sm'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
      });

    /* @ngInject */
    $urlRouterProvider.otherwise(function ($injector) {
      var state = $injector.get('$state');
      state.go('counter.main.error', {
        'title': 'Pagina niet gevonden',
        'description': 'De gevraagde pagina kan niet worden gevonden.',
        'code': 'PAGE_NOT_FOUND'
      },
        {
          location: false
        });
      return false;
    });

    $locationProvider.html5Mode(true);
    $httpProvider.defaults.withCredentials = true;
  })
  .run(function(nfcService, eIDService) {
    nfcService.init();
    eIDService.init();
  })
  .constant('isJavaFXBrowser', navigator.userAgent.indexOf('JavaFX') > -1);
