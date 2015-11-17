'use strict';

/**
 * @ngdoc overview
 * @name ubr.kansenstatuut
 * @description
 * # ubr.kansenstatuut
 *
 * kansenstatuut module UiTPAS Beheer
 */
angular
  .module('ubr.kansenstatuut', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    var getPassholderFromStateParams = function(passholderService, $stateParams) {
        return passholderService.findPassholder($stateParams.identification);
    };

    editRemarksModal.$inject = ['passholder', '$state', '$uibModal'];
    function editRemarksModal (passholder, $state, $uibModal) {
      $uibModal
        .open({
          animation: true,
          templateUrl: 'views/kansenstatuut/edit-remarks-modal.html',
          size: 'sm',
          resolve: {
            passholder: function () {
              return passholder;
            }
          },
          controller: 'EditRemarksModalController',
          controllerAs: 'ermc'
        })
        .result
        .finally(function () {
          $state.go('^');
        });
    }

    editKansenstatuutModal.inject = ['passholder', 'activeCounter', 'cardSystemId', '$state', '$uibModal'];
    function editKansenstatuutModal(passholder, activeCounter, cardSystemId, $state, $uibModal) {
      $uibModal
        .open({
          animation: true,
          templateUrl: 'views/kansenstatuut/edit-kansenstatuut-modal.html',
          size: 'sm',
          resolve: {
            passholder: function () {
              return passholder;
            },
            activeCounter: function () {
              return activeCounter;
            },
            cardSystemId: function () {
              return cardSystemId;
            }
          },
          controller: 'EditKansenstatuutModalController',
          controllerAs: 'ekmc'
        })
        .result
        .finally(function () {
          $state.go('^');
        });
    }

    $stateProvider
      .state('counter.main.passholder.kansenStatuut', {
        url: '/kansenstatuut',
        resolve: {
          passholder: ['passholderService', '$stateParams', getPassholderFromStateParams],
          identification: ['$stateParams', function ($stateParams) {
            return $stateParams.identification;
          }],
          activeCounter: ['counterService', function (counterService) {
            return counterService.getActive();
          }]
        },
        onEnter: ['passholder', 'activeCounter', '$state', '$uibModal', function (passholder, activeCounter, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/kansenstatuut/kansenstatuten-modal.html',
              size: 'sm',
              resolve: {
                passholder: function () {
                  return passholder;
                },
                activeCounter: function () {
                  return activeCounter;
                },
                cardSystemId: null
              },
              controller: 'KansenstatutenModalController',
              controllerAs: 'pksc'
            })
            .result
            .finally(function () {
              $state.go('^');
            });
        }]
      })
      .state('counter.main.passholder.kansenStatuut.editRemarks', {
        url: '/remarks',
        onEnter: editRemarksModal
      })
      .state('counter.main.passholder.kansenStatuut.edit', {
        url: '/:cardSystemId',
        resolve: {
          passholder: ['passholderService', '$stateParams', getPassholderFromStateParams],
          identification: ['$stateParams', function ($stateParams) {
            return $stateParams.identification;
          }],
          activeCounter: ['counterService', function (counterService) {
            return counterService.getActive();
          }],
          cardSystemId: ['$stateParams', function ($stateParams) {
            return $stateParams.cardSystemId;
          }]
        },
        onEnter: editKansenstatuutModal
      });
  });
