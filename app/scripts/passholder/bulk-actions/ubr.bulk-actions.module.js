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
          bulkSelection: null
        },
        resolve: {
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }]
        },
        /* @ngInject */
        onEnter: function(bulkSelection, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-bulk-address.html',
              size: 'sm',
              resolve: {
                bulkSelection: function() {
                  return bulkSelection;
                }
              },
              controller: 'AddressBulkController',
              controllerAs: 'abc'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
      })
  });
