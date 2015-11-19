'use strict';

/**
 * @ngdoc function
 * @name ubr.membership.controller:PassholderMembershipRenewController
 * @description
 * # PassholderMembershipRenewController
 * Controller of the ubr.membership module.
 */
angular
  .module('ubr.membership')
  .controller('PassholderMembershipRenewController', PassholderMembershipRenewController);

/* @ngInject */
function PassholderMembershipRenewController ($scope, $uibModalInstance, moment, membership, membershipService, association, passholder) {
  $scope.association = association;

  $scope.endDate = {
    date: moment.unix(membership.newEndDate).toDate(),
    fixed: $scope.association.enddateCalculation !== 'FREE'
  };

  $scope.errors = [];

  $scope.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };

  $scope.waiting = false;

  $scope.register = function (endDate) {
    $scope.waiting = true;

    var deferredRenew = membershipService.register(passholder.passNumber, association.id, endDate);

    deferredRenew
      .then(
        function(data) {
          $uibModalInstance.close(data);
        },
        function (data) {
          $scope.errors = [];
          angular.forEach(data.errors, function (error) {
            $scope.errors.push(error.message);
          });
        }
      )
      .finally(
        function () {
          $scope.waiting = false;
        }
      );
  };
}
