'use strict';

/**
 * @ngdoc overview
 * @name ubr.group
 * @description
 * # ubr.group
 *
 * group module UiTPAS Beheer
 */
angular
  .module('ubr.group', [
    'ui.router',
    'uitpasbeheerApp'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    getGroup.$inject = ['$stateParams', 'passholderService', '$q'];
    function getGroup($stateParams, passholderService, $q) {
      var groupId = $stateParams.identification;
      var deferredGroup = $q.defer();

      function pluckGroupFromPass(pass) {
        deferredGroup.resolve(pass.group);
      }
      passholderService
        .findPass(groupId)
        .then(pluckGroupFromPass);

      return deferredGroup.promise;
    }

    /* @ngInject */
    var getCouponsFromStateParams = function($stateParams) {
      return $stateParams.coupon;
    };

    $stateProvider
      .state('counter.main.group', {
        url: 'group/:identification',
        requiresCounter: true,
        redirectOnScan: true,
        params: {
          pass: null,
          passholders: null,
          identification: null,
          activityMode: null,
          bulkSelection: null,
          activeCounter: null
        },
        resolve: {
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          group: getGroup,
          passholder: getGroup,
          passholders: function() {
            return null;
          },
          activityMode: function() {
            return 'group';
          },
          bulkSelection: function() {
            return null;
          },
          activeCounter: function (counterService) {
            return counterService.getActive();
          }
        },
        views: {
          'sidebar@counter': {
            templateUrl: 'views/group/sidebar-group-details.html',
            controller: 'GroupDetailController',
            controllerAs: 'gdc'
          },
          'content@counter': {
            templateUrl: 'views/group/activities.html',
            controller: 'ActivityController',
            controllerAs: 'ac'
          }
        }
      })
      .state('counter.main.group.coupon', {
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
              templateUrl: 'views/coupon/modal-coupon.html',
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
      .state('counter.main.group.activityTariffs', {
        params: {
          identification: null,
          passholder: null,
          activity: null
        },
        resolve: {
          passholder: getGroup,
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          activity: ['$stateParams', function($stateParams) {
            return $stateParams.activity;
          }]
        },
        onEnter: ['passholder', 'identification', 'activity', '$state', '$uibModal', function(passholder, identification, activity, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/activity/modal-activity-tariffs.html',
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
      });
  });
