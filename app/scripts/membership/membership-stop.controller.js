'use strict';

/**
 * @ngdoc function
 * @name ubr.membership.controller:PassholderMembershipStopController
 * @description
 * # PassholderMembershipStopController
 * Controller of the ubr.membership module.
 */
angular
  .module('ubr.membership')
  .controller('PassholderMembershipStopController', PassholderMembershipStopController);

/* @ngInject */
function PassholderMembershipStopController ($scope, $uibModalInstance, membership, membershipService, passholder) {
  $scope.membership = membership;

  $scope.errors = [];

  $scope.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };

  $scope.waiting = false;

  $scope.stop = function () {
    $scope.waiting = true;

    var deferredStop = membershipService.stop(
      passholder.passNumber,
      membership.association.id
    );

    deferredStop
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
        function() {
          $scope.waiting = false;
        }
      );
  };
}
