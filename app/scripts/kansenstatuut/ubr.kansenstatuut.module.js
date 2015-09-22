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
      if ($stateParams.passholder) {
        return $stateParams.passholder;
      }
      else {
        return passholderService.findPassholder($stateParams.identification);
      }
    };

    editRemarksModal.$inject = ['passholder', '$state', '$modal'];
    function editRemarksModal (passholder, $state, $modal) {
      $modal
        .open({
          animation: true,
          templateUrl: 'views/kansenstatuut/edit-remarks-modal.html',
          params: {
            'passholder': null
          },
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

    editKansenstatuutModal.inject = ['passholder', 'activeCounter', 'cardSystemId', '$state', '$modal'];
    function editKansenstatuutModal(passholder, activeCounter, cardSystemId, $state, $modal) {
      $modal
        .open({
          animation: true,
          templateUrl: 'views/kansenstatuut/edit-kansenstatuut-modal.html',
          params: {
            'passholder': null,
            'activeCounter': null,
            'cardSystemId': null
          },
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
        onEnter: ['passholder', 'activeCounter', '$state', '$modal', function (passholder, activeCounter, $state, $modal) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/kansenstatuut/kansenstatuten-modal.html',
              params: {
                'passholder': null,
                'activeCounter': null,
                'cardSystemId': null
              },
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
            console.log($stateParams);
            return $stateParams.cardSystemId;
          }]
        },
        onEnter: editKansenstatuutModal
      });
  });
