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
          action: null
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
          }]
        },
        /* @ngInject */
        onEnter: function(passholders, bulkForm, bulkSelection, action, $state, $uibModal, counterService) {
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
  });
