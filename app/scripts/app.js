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
    'jkuri.touchspin',
    'ubr.registration',
    'ubr.kansenstatuut',
    'ubr.group',
    'ubr.checkindevices'
  ])
  .constant('moment', moment) // jshint ignore:line
  /* @ngInject */
  .config(function ($stateProvider, $locationProvider, $httpProvider, ngTouchSpinProvider) {

    ngTouchSpinProvider.arrowControlsEnabled(false);

    /* @ngInject */
    function getPassholderFromStateParams(passholderService, $stateParams) {
      return passholderService.findPassholder($stateParams.identification);
    }

    /* @ngInject */
    var getPassFromStateParams = function(passholderService, $stateParams) {
      return passholderService.findPass($stateParams.identification);
    };

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
      .state('counter.main.passholder', {
        url: 'passholder/:identification',
        requiresCounter: true,
        redirectOnScan: true,
        views: {
          'content@counter': {
            templateProvider: function ($templateFactory, pass) {
              var templatePath = 'views/split-content.html';
              if (pass.isBlocked()) {
                templatePath = 'views/content-passholder-blocked.html';
              }
              return $templateFactory.fromUrl(templatePath);
            },
            controller: 'PassholderDetailController',
            controllerAs: 'pdc'
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
          'pass': null,
          'passholder': null,
          'advantages': null,
          'activeCounter': null
        },
        resolve: {
          pass: getPassFromStateParams,
          passholder: getPassholderFromStateParams,
          advantages: ['advantageService', '$stateParams', function(advantageService, $stateParams) {
            return advantageService.list($stateParams.identification);
          }],
          activeCounter: ['counterService', function (counterService) {
            return counterService.getActive();
          }]
        }
      })
      .state('counter.main.passholder.edit', {
        resolve: {
          passholder: getPassholderFromStateParams,
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
          passholder: getPassholderFromStateParams,
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
          passholder: getPassholderFromStateParams
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
          passholder: getPassholderFromStateParams,
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
      .state('counter.main.passholder.replacePass', {
        resolve: {
          passholder: getPassholderFromStateParams,
          pass: getPassFromStateParams
        },
        params: {
          'justBlocked': false
        },
        url: '/replace-pass',
        /* @ngInject */
        onEnter: function(passholder, pass, $state, $modal, $stateParams) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/modal-passholder-replace-card.html',
              size: 'lg',
              resolve: {
                passholder: function() {
                  return passholder;
                },
                pass: function() {
                  return pass;
                }
              },
              controller: 'PassholderReplacePassController',
              controllerAs: 'rpc'
            })
            .result
            .then(function (newPassNumber) {
              console.log(newPassNumber);
              $state.go('counter.main.passholder', {identification: newPassNumber}, {reload: true});
            }, function () {
              if ($stateParams.justBlocked) {
                $state.go('^', {}, {reload: true});
              } else {
                $state.go('^');
              }
            });
        }
      })
      .state('counter.main.passholder.blockPass', {
        params: {
          pass: null,
          passholder: null
        },
        resolve: {
          pass: getPassFromStateParams,
          passholder: getPassholderFromStateParams
        },
        onEnter: ['pass', 'passholder', '$state', '$modal', function(pass, passholder, $state, $modal) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/modal-passholder-block-pass.html',
              params: {
                identification: null,
                passholder: null
              },
              size: 'sm',
              resolve: {
                pass: function() {
                  return pass;
                },
                passholder: function() {
                  return passholder;
                }
              },
              controller: 'PassholderBlockPassController',
              controllerAs: 'pbp'
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
  .run(function(nfcService, eIDService) {
    nfcService.init();
    eIDService.init();
  })
  .constant('isJavaFXBrowser', navigator.userAgent.indexOf('JavaFX') > -1);
