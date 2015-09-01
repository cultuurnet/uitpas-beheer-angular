'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderMembershipStopController
 * @description
 * # PassholderMembershipStopController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderMembershipStopController', PassholderMembershipStopController);

/* @ngInject */
function PassholderMembershipStopController ($scope, $modalInstance, membership, membershipService, passholder) {
  $scope.membership = membership;

  $scope.errors = [];

  $scope.cancel = function () {
    $modalInstance.dismiss('canceled');
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
          $modalInstance.close(data);
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
