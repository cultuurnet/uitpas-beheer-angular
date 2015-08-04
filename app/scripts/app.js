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
    'ui.bootstrap',
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
        url: '/',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/content-passholder-search.html',
            controller: 'PassholderSearchController',
            controllerAs: 'psc'
          },
          sidebar: {
            templateUrl: 'views/sidebar-passholder-search.html',
            controller: 'PassholderSearchController',
            controllerAs: 'psc'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('counter.main.error', {
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
      .state('counter.main.passholder', {
        url: 'passholder/:identification',
        views: {
          'content@counter': {
            templateUrl: 'views/split-content.html'
          },
          'sidebar@counter': {
            templateUrl: 'views/sidebar-passholder-details.html',
            controller: 'PassholderDetailController',
            controllerAs: 'pdc'
          },
          'top@counter.main.passholder': {
            templateUrl: 'views/content-passholder-activities.html',
            controller: 'PassholderDetailController',
            controllerAs: 'pdc'
          },
          'bottom@counter.main.passholder': {
            templateUrl: 'views/content-passholder-advantages.html',
            controller: 'PassholderAdvantageController',
            controllerAs: 'pac'
          }
        },
        params: {
          'identification': null,
          'passholder': null,
          'advantages': null
        },
        resolve: {
          passholder: ['passholderService', '$stateParams', function(passholderService, $stateParams) {
            if ($stateParams.passholder) {
              return $stateParams.passholder;
            }
            else {
              return passholderService.find($stateParams.identification);
            }
          }],
          advantages: ['advantageService', '$stateParams', function(advantageService, $stateParams) {
            return advantageService.list($stateParams.identification);
          }]
        }
      })
      .state('counter.main.passholder.edit', {
        onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
          $modal.open({
            animation: false,
            templateUrl: 'views/modal-passholder-edit.html',
            params: {
              'identification': null,
              'passholder': null
            },
            resolve: {
              passholder: ['passholderService', '$stateParams', function(passholderService, $stateParams) {
                if ($stateParams.passholder) {
                  return $stateParams.passholder;
                }
                else {
                  return passholderService.find($stateParams.identification);
                }
              }],
              identification: ['$stateParams', function($stateParams) {
                return $stateParams.identification;
              }]
            },
            controller: 'PassholderEditController',
            controllerAs: 'pec'
          }).result.then(['passholderService', '$stateParams', function(passholderService, $stateParams) {
              $stateParams.passholder = passholderService.find($stateParams.identification);
              $state.go('',
                $stateParams,
                {
                  reload: true
                });
          }], function() {});
        }]
      })
      .state('counter.main.passholder.editContact', {
        onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
          $modal.open({
            animation: false,
            templateUrl: 'views/modal-passholder-edit-contact.html',
            params: {
              'identification': null,
              'passholder': null
            },
            resolve: {
              passholder: ['passholderService', '$stateParams', function(passholderService, $stateParams) {
                if ($stateParams.passholder) {
                  return $stateParams.passholder;
                }
                else {
                  return passholderService.find($stateParams.identification);
                }
              }],
              identification: ['$stateParams', function($stateParams) {
                return $stateParams.identification;
              }]
            },
            controller: 'PassholderEditController',
            controllerAs: 'pec'
          }).result.then(['passholderService', '$stateParams', function(passholderService, $stateParams) {
              $stateParams.passholder = passholderService.find($stateParams.identification);
              $state.go('^');
            }], function() {});
        }]
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
            return counterService.getList().then(
              function (list) {
                return list;
              },
              function () {
                return {};
              }
            );
          }],
          lastActiveId: ['counterService', function(counterService) {
            return counterService.getLastActiveId().then(
              function (activeId) {
                return activeId;
              },
              function () {
                return null;
              }
            );
          }]
        }
      });

    $locationProvider.html5Mode(true);
    $httpProvider.defaults.withCredentials = true;
  });
