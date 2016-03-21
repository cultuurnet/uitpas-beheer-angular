'use strict';

/**
 * @ngdoc overview
 * @name ubr.passholder.bulkActions
 * @description
 * # ubr.bulkActions
 *
 * bulkActions module UiTPAS Beheer
 */
angular
  .module('ubr.passholder.bulkActions', [
    'ui.router',
    'uitpasbeheerApp'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider
      .state('counter.main.advancedSearch.bulkAddress', {
        params: {
          bulkSelection: null,
          action: null
        },
        resolve: {
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }],
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }]
        },
        /* @ngInject */
        onEnter: function(bulkSelection, action, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-bulk-address.html',
              size: 'sm',
              resolve: {
                bulkSelection: function() {
                  return bulkSelection;
                },
                action: function() {
                  return action;
                }
              },
              controller: 'BulkActionsController',
              controllerAs: 'bac'
            })
            .result
            .catch(function (message) {
              if (message !== 'bulkResultsClosed') {
                $state.go('^');
              }
            });
        }
      })
      .state('counter.main.advancedSearch.bulkKansenstatuut', {
        params: {
          bulkSelection: null,
          action: null
        },
        resolve: {
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }],
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }]
        },
        /* @ngInject */
        onEnter: function(bulkSelection, action, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-bulk-kansenstatuut.html',
              size: 'sm',
              resolve: {
                bulkSelection: function() {
                  return bulkSelection;
                },
                action: function() {
                  return action;
                }
              },
              controller: 'BulkActionsController',
              controllerAs: 'bac'
            })
            .result
            .catch(function (message) {
              if (message !== 'bulkResultsClosed') {
                $state.go('^');
              }
            });
        }
      })
      .state('counter.main.advancedSearch.showBulkResults', {
        params: {
          passholders: null,
          bulkForm: null,
          bulkSelection: null,
          action: null,
          activity: null,
          tariff: null,
          ticketCount: null
        },
        resolve: {
          passholders: ['$stateParams', function($stateParams) {
            return $stateParams.passholders;
          }],
          bulkForm: ['$stateParams', function($stateParams) {
            return $stateParams.bulkForm;
          }],
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }],
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }],
          activity: ['$stateParams', function($stateParams) {
            return $stateParams.activity;
          }],
          tariff: ['$stateParams', function($stateParams) {
            return $stateParams.tariff;
          }],
          ticketCount: ['$stateParams', function($stateParams) {
            return $stateParams.ticketCount;
          }]
        },
        /* @ngInject */
        onEnter: function(passholders, bulkForm, bulkSelection, action, activity, tariff, ticketCount, $state, $uibModal, counterService) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-show-bulk-results.html',
              size: 'sm',
              resolve: {
                passholders: function() {
                  return passholders;
                },
                bulkForm: function() {
                  return bulkForm;
                },
                action: function() {
                  return action;
                },
                bulkSelection: function() {
                  return bulkSelection;
                },
                activeCounter: function () {
                  return counterService.getActive();
                },
                activity: function() {
                  return activity;
                },
                tariff: function() {
                  return tariff;
                },
                ticketCount: function() {
                  return ticketCount;
                }
              },
              controller: 'ShowBulkResultsController',
              controllerAs: 'sbrc'
            })
            .result
            .finally(function() {
              $state.go('counter.main.advancedSearch', bulkSelection.searchParameters.toParams(), { reload: true });
            });
        }
      })
      .state('counter.main.advancedSearch.bulkPoints', {
        url: '/bulkactions/points?selection&totalItems&mode',
        requiresCounter: true,
        reloadOnSearch: false,
        params: {
          selection: {
            array: true
          },
          bulkSelection: null,
          action: null,
          $uibModalInstance: null,
          passholder: null,
          activityMode: null
        },
        resolve: {
          /* @ngInject */
          bulkSelection: function($stateParams, SearchParameters, BulkSelection) {
            if (!$stateParams.bulkSelection) {
              var searchParams = new SearchParameters();
              searchParams.fromParams($stateParams);
              var bulkSelection = new BulkSelection(null, searchParams, $stateParams.selection);
              if (!$stateParams.selection) {
                bulkSelection.searchResults.totalItems = $stateParams.totalItems;
                bulkSelection.selectAll = true;
              }
              return bulkSelection;
            }
            return $stateParams.bulkSelection;
          },
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }],
          $uibModalInstance: ['$stateParams', function($stateParams) {
            return $stateParams.$uibModalInstance;
          }],
          passholder: function () {
            return null;
          },
          activityMode: function() {
            return 'counter';
          }
        },
        views: {
          'content@counter': {
            templateUrl: 'views/activity/content-activities.html',
            controller: 'ActivityController',
            controllerAs: 'ac'
          },
          'sidebar@counter': {
            templateUrl: 'views/passholder/bulk-actions/sidebar-selected-passholders.html',
            controller: 'BulkActionsController',
            controllerAs: 'bac'
          }
        }
      });
  });
