'use strict';

/**
 * @ngdoc overview
 * @name ubr.passholder.cardUpgrade
 * @description
 * # ubr.cardUpgrade
 *
 * counter module UiTPAS Beheer
 */
angular
  .module('ubr.passholder.cardUpgrade', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {
    var upgradeModalInstance;
    var getPassFromStateParams = function(passholderService, $stateParams) {
      if ($stateParams.pass) {
        return $stateParams.pass;
      }
      else {
        return passholderService.findPass($stateParams.identification);
      }
    };

    $stateProvider
      .state('counter.main.passholder.upgrade', {
        resolve: {
          pass: ['passholderService', '$stateParams', getPassFromStateParams],
          activeCounter: ['counterService', function (counterService) {
            return counterService.getActive();
          }]
        },
        onEnter : ['pass', 'activeCounter', '$state', '$uibModal', function(pass, activeCounter, $state, $uibModal) {
          upgradeModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/passholder/card-upgrade/multi-step-form.html',
            size: 'lg',
            resolve: {
              pass: function() {
                return pass;
              },
              activeCounter: function() {
                return activeCounter;
              }
            },
            controller: 'UpgradeModalController',
            controllerAs: 'umc'
          });

          function upgradeCanceled() {
            $state.go('^');
          }

          function cardUpgraded() {
            $state.go('counter.main.passholder', {
              identification: pass.number
            });
          }

          upgradeModalInstance
            .result
            .then(cardUpgraded, upgradeCanceled);
      }]
    })
      .state('counter.main.passholder.upgrade.kansenStatuut', {
        views: {
          'upgradeStep@': {
            templateUrl: 'views/passholder/card-upgrade/kansenstatuut.html'
          }
        },
        params: {
          'pass': null,
          'kansenstatuut': null
        },
        stepNumber: 1
      });
  });
