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
    'mp.autoFocus',
    'ubr.registration'
  ])
  .constant('moment', moment) // jshint ignore:line
  /* @ngInject */
  .config(function ($stateProvider, $locationProvider, $httpProvider) {
    var getPassholderFromStateParams = function(passholderService, $stateParams) {
      if ($stateParams.passholder) {
        return $stateParams.passholder;
      }
      else {
        return passholderService.findPassholder($stateParams.identification);
      }
    };

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
        requiresCounter: true,
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
            controller: 'ActivityController',
            controllerAs: 'ac'
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
          passholder: ['passholderService', '$stateParams', getPassholderFromStateParams],
          advantages: ['advantageService', '$stateParams', function(advantageService, $stateParams) {
            return advantageService.list($stateParams.identification);
          }]
        }
      })
      .state('counter.main.passholder.edit', {
        resolve: {
          passholder: ['passholderService', '$stateParams', getPassholderFromStateParams],
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }]
        },
        onEnter: ['passholder', 'identification', '$state', '$modal', function(passholder, identification, $state, $modal) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/modal-passholder-edit.html',
              params: {
                'identification': null,
                'passholder': null,
                'activity': null
              },
              size: 'lg',
              resolve: {
                passholder: function() {
                  return passholder;
                },
                identification: function() {
                  return identification;
                }
              },
              controller: 'PassholderEditController',
              controllerAs: 'pec'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }]
      })
      .state('counter.main.passholder.editContact', {
        resolve: {
          passholder: ['passholderService', '$stateParams', getPassholderFromStateParams],
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }]
        },
        onEnter: ['passholder', 'identification', '$state', '$modal', function(passholder, identification, $state, $modal) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/modal-passholder-edit-contact.html',
              params: {
                'identification': null,
                'passholder': null
              },
              size: 'sm',
              resolve: {
                passholder: function() {
                  return passholder;
                },
                identification: function() {
                  return identification;
                }
              },
              controller: 'PassholderEditController',
              controllerAs: 'pec'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }]
      })
      .state('counter.main.passholder.memberships', {
        resolve: {
          passholder: ['passholderService', '$stateParams', function (passholderService, $stateParams) {
            if ($stateParams.passholder) {
              return $stateParams.passholder;
            }
            else {
              return passholderService.find($stateParams.identification);
            }
          }]
        },
        onEnter: ['passholder', '$state', '$modal', function(passholder, $state, $modal) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/modal-passholder-memberships.html',
              params: {
                'passholder': null
              },
              size: 'sm',
              resolve: {
                passholder: function() {
                  return passholder;
                }
              },
              controller: 'PassholderMembershipController',
              controllerAs: 'pec'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }]
      })
      .state('counter.main.passholder.activityTariffs', {
        params: {
          identification: null,
          passholder: null,
          activity: null
        },
        resolve: {
          passholder: ['passholderService', '$stateParams', getPassholderFromStateParams],
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          activity: ['$stateParams', function($stateParams) {
            return $stateParams.activity;
          }]
        },
        onEnter: ['passholder', 'identification', 'activity', '$state', '$modal', function(passholder, identification, activity, $state, $modal) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/modal-passholder-activity-tariffs.html',
              params: {
                identification: null,
                passholder: null,
                activity: null
              },
              size: 'sm',
              resolve: {
                passholder: function () {
                  return passholder;
                },
                identification: function () {
                  return identification;
                },
                activity: function () {
                  return activity;
                }
              },
              controller: 'PassholderActivityTariffsController',
              controllerAs: 'pat'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
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
  })
  .run(function(nfcService, eIdService) {
    nfcService.init();
    eIdService.init();
  });
