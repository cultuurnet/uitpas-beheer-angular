'use strict';

/**
 * @ngdoc overview
 * @name ubr.activity
 * @description
 * # ubr.activity
 *
 * activity module UiTPAS Beheer.
 */
angular
  .module('ubr.activity', [
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

    $stateProvider.state(
      'counter.main.passholder.activityTariffs', {
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
        /* @ngInject */
        onEnter: function(passholder, identification, activity, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/activity/modal-passholder-activity-tariffs.html',
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
        }
      })
      .state('counter.main.passholder.activity', {
        params: {
          activity: null
        },
        resolve: {
          activity: ['$stateParams', function($stateParams) {
            return $stateParams.activity;
          }]
        },
        /* @ngInject */
        onEnter: function(activity, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/activity/modal-passholder-activity-details.html',
              size: 'sm',
              resolve: {
                coupon: function() {
                  return activity;
                }
              },
              controller: 'ActivityDetailController',
              controllerAs: 'adc'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
      })
  });
