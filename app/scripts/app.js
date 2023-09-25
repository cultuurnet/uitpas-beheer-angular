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
    'initSentry',
    'ngRaven',
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
    'ubr.coupon',
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
  .config(function ($stateProvider, $locationProvider, $httpProvider, ngTouchSpinProvider, $urlRouterProvider, moment) {

    moment.locale('nl-be');

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
        },
        params: {
          forceAngularNavigation: false
        },
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
        params: {
          redirectTo: null
        },
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

    // IE11 caches all requests. Disable it, as this breaks the switching of balies.
    $httpProvider.defaults.headers.get = {};
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
  })
  .run(function($rootScope, $state, $window, $location, nfcService, eIDService, counterService, appConfig) {
    nfcService.init();
    eIDService.init();

    var runningInIframe = window !== window.parent;

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      // Don't block any state changes if not running inside an iframe
      if (!runningInIframe && appConfig.features && appConfig.features.balieV2 && appConfig.features.redirectToV2) {
        window.location.href = appConfig.features.balieV2 + toState.url;
        return;
      }

      // Allow the first state change, because the initial page rendering is also a "state change".
      if (fromState.name === '') {
        return;
      }

      // Generate to and from paths with actual param values
      var to = $state.href(toState.name, toParams, {absolute: false});
      var from = $state.href(fromState.name, fromState, {absolute: false});

      // Don't block any reloading of the same state.
      // For example, after deleting an organizer from the overview list of organizers and the list reloads.
      if (to === from) {
        return;
      }

      if (runningInIframe && !toParams.forceAngularNavigation) {
        // Block the state change and emit the new path to the parent window for further handling.
        event.preventDefault();
        window.parent.postMessage({
          source: 'BALIE',
          type: 'URL_CHANGED',
          payload: {
            path: to
          }
        }, '*');
      }
    });

    function activeCounterListener() {
      window.addEventListener('message', function(event) {
        if (event.data.source === 'BALIE' && event.data.type === 'SET_COUNTER') {
          var counterId = event.data.payload.counter.id;

          counterService.getActive().then(function (activeCounter){
            if (!activeCounter || activeCounter.actorId !== counterId) {
              throw new Error('No counter selected');
            }
          }).catch(function () {
            counterService.setActiveByActorId(counterId).then(function() {
              $state.go('counter.main', {
                forceAngularNavigation: true
              });
            });
          });
        }
      });

      window.parent.postMessage({
        source: 'BALIE',
        type: 'GET_COUNTER'
      }, '*');
    }

    if (runningInIframe) {
      activeCounterListener();
    }
  })
  .constant('isJavaFXBrowser', navigator.userAgent.indexOf('JavaFX') > -1);
