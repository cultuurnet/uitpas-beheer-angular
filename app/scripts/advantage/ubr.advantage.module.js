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
    /* @ngInject */
    function getPassholderFromStateParams(passholderService, $stateParams) {
      return passholderService.findPassholder($stateParams.identification);
    }

    $stateProvider.state(
      'counter.main.passholder.advantageDetail', {
        params: {
          identification: null,
          passholder: null,
          advantage: null
        },
        resolve: {
          passholder: getPassholderFromStateParams,
          /* @ngInject */
          advantage: function($stateParams) {
            return $stateParams.advantage;
          }
        },
        /* @ngInject */
        onEnter: function(passholder, advantage, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/advantage/modal-passholder-advantage-detail.html',
              size: 'sm',
              resolve: {
                passholder: function () {
                  return passholder;
                },
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
