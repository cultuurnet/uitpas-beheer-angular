'use strict';

/**
 * @ngdoc overview
 * @name ubr.passholder
 * @description
 * # ubr.passholder
 *
 * passholder module UiTPAS Beheer
 */
angular
  .module('ubr.passholder', [
    'ubr.passholder.search',
    'ubr.passholder.bulkActions',
    'ubr.passholder.cardUpgrade',
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    /* @ngInject */
    function getPassholderFromStateParams(passholderService, $stateParams) {
      return passholderService.findPassholder($stateParams.identification);
    }

    /* @ngInject */
    var getPassFromStateParams = function(passholderService, $stateParams) {
      return passholderService.findPass($stateParams.identification);
    };

    /* @ngInject */
    var getCouponsFromStateParams = function($stateParams) {
      return $stateParams.coupon;
    };

    $stateProvider
      .state('counter.main.passholder', {
        url: 'passholder/:identification',
        requiresCounter: true,
        redirectOnScan: true,
        views: {
          'content@counter': {
            templateProvider: function ($templateFactory, pass) {
              var templatePath = 'views/split-content.html';
              if (pass.isBlocked()) {
                templatePath = 'views/passholder/content-passholder-blocked.html';
              }
              else if (pass.kansenstatuutExpired(pass.passholder)) {
                templatePath = 'views/passholder/content-passholder-kansenstatuut-expired.html';
              }
              return $templateFactory.fromUrl(templatePath);
            },
            controller: 'PassholderDetailController',
            controllerAs: 'pdc'
          },
          'sidebar@counter': {
            templateUrl: 'views/passholder/sidebar-passholder-details.html',
            controller: 'PassholderDetailController',
            controllerAs: 'pdc'
          },
          'top@counter.main.passholder': {
            templateUrl: 'views/activity/content-activities.html',
            controller: 'ActivityController',
            controllerAs: 'ac'
          },
          'bottom@counter.main.passholder': {
            templateUrl: 'views/advantage/content-passholder-advantages.html',
            controller: 'PassholderAdvantageController',
            controllerAs: 'pac'
          }
        },
        params: {
          'identification': null,
          'pass': null,
          'passholder': null,
          'passholders': null,
          'advantages': null,
          'activeCounter': null,
          'activityMode': null,
          'bulkSelection': null
        },
        resolve: {
          pass: getPassFromStateParams,
          passholder: getPassholderFromStateParams,
          /* @ngInject */
          advantages: function(advantageService, $stateParams, passholder) {
            return advantageService.list(passholder.passNumber);
          },
          /* @ngInject */
          activeCounter: function (counterService) {
            return counterService.getActive();
          },
          activityMode: function() {
            return 'passholders';
          },
          passholders: function() {
            return null;
          },
          bulkSelection: function() {
            return null;
          }
        }
      })
      .state('counter.main.passholder.edit', {
        resolve: {
          passholder: getPassholderFromStateParams,
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }]
        },
        /* @ngInject */
        onEnter: function(passholder, identification, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/modal-passholder-edit.html',
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
        }
      })
      .state('counter.main.passholder.editContact', {
        resolve: {
          passholder: getPassholderFromStateParams,
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }]
        },
        /* @ngInject */
        onEnter: function(passholder, identification, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/modal-passholder-edit-contact.html',
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
        }
      })
      .state('counter.main.passholder.pointHistory', {
        params: {
          pass: null,
          passholder: null
        },
        resolve: {
          pass: getPassFromStateParams,
          passholder: getPassholderFromStateParams
        },
        /* @ngInject */
        onEnter: function(pass, passholder, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/modal-passholder-checkins.html',
              size: 'sm',
              resolve: {
                pass: function() {
                  return pass;
                },
                passholder: function() {
                  return passholder;
                }
              },
              controller: 'PointHistoryController',
              controllerAs: 'phc'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
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
        onEnter: function(passholder, pass, $state, $uibModal, $stateParams) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/modal-passholder-replace-card.html',
              size: 'sm',
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
        /* @ngInject */
        onEnter: function(pass, passholder, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/modal-passholder-block-pass.html',
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
        }
      })
      .state('counter.main.passholder.coupon', {
        params: {
          coupon: null
        },
        resolve: {
          coupon: getCouponsFromStateParams
        },
        /* @ngInject */
        onEnter: function(coupon, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/modal-passholder-coupon.html',
              size: 'sm',
              resolve: {
                coupon: function() {
                  return coupon;
                }
              },
              controller: 'CouponDetailController',
              controllerAs: 'cdc'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
      })
      .state('counter.main.passholder.ticketSales', {
        params: {
          pass: null,
          passholder: null
        },
        resolve: {
          pass: getPassFromStateParams,
          passholder: getPassholderFromStateParams
        },
        /* @ngInject */
        onEnter: function(pass, passholder, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/modal-passholder-ticket-sales.html',
              size: 'sm',
              resolve: {
                pass: function() {
                  return pass;
                },
                passholder: function() {
                  return passholder;
                }
              },
              controller: 'TicketSalesController',
              controllerAs: 'tsc'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
      }
    });
  });
