'use strict';

/**
 * @ngdoc overview
 * @name ubr.membership
 * @description
 * # ubr.membership
 *
 * membership module UiTPAS Beheer
 */
angular
  .module('ubr.membership', [
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

    $stateProvider.state('counter.main.passholder.memberships', {
      resolve: {
        passholder: getPassholderFromStateParams
      },
      onEnter: ['passholder', '$state', '$modal', function(passholder, $state, $modal) {
        $modal
          .open({
            animation: true,
            templateUrl: 'views/modal-passholder-memberships.html',
            size: 'sm',
            resolve: {
              passholder: function() {
                return passholder;
              }
            },
            controller: 'PassholderMembershipController',
            controllerAs: 'pec'
          })
          .result
          .finally(function() {
            $state.go('^');
          });
      }]
    });
  });
