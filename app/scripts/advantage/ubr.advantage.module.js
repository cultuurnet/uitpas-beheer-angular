'use strict';

/**
 * @ngdoc overview
 * @name ubr.advantage
 * @description
 * # ubr.advantage
 *
 * advantage module UiTPAS Beheer
 */
angular
  .module('ubr.advantage', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])/* @ngInject */
  .config(function ($stateProvider) {
    $stateProvider.state(
      'counter.main.passholder.advantageDetail', {
        params: {
          advantage: null
        },
        resolve: {
          /* @ngInject */
          advantage: function($stateParams) {
            return $stateParams.advantage;
          }
        },
        /* @ngInject */
        onEnter: function(advantage, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/advantage/modal-passholder-advantage-detail.html',
              size: 'lg',
              resolve: {
                advantage: function () {
                  return advantage;
                }
              },
              controller: 'PassholderAdvantageDetailController',
              controllerAs: 'padc'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
      });
  });
