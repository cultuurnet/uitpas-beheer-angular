'use strict';

/**
 * @ngdoc function
 * @name ubr.membership.controller:PassholderMembershipRegisterController
 * @description
 * # PassholderMembershipRegisterController
 * Controller of the ubr.membership module.
 */
angular
  .module('ubr.membership')
  .controller('PassholderMembershipRegisterController', PassholderMembershipRegisterController);

/* @ngInject */
function PassholderMembershipRegisterController ($scope, $uibModalInstance, association, passholder, recentlyExpired, membershipService, MembershipEndDateCalculator) {
  $scope.association = association;

  var membershipEndDateCalculator = new MembershipEndDateCalculator(association);

  $scope.endDate = membershipEndDateCalculator.membershipEndDate(passholder);

  $scope.recentlyExpired = recentlyExpired;

  $scope.waiting = false;

  $scope.errors = [];

  $scope.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };

  $scope.register = function (endDate) {
    $scope.waiting = true;

    var deferredMembershipRegistration = membershipService.register(
      passholder.passNumber,
      $scope.association.id,
      endDate
    );

    deferredMembershipRegistration
      .then(
        function (data) {
          $uibModalInstance.close(data);
        },
        function (data) {
          $scope.errors = [];
          angular.forEach(data.errors, function (error) {
            $scope.errors.push(error.message);
          });
        }
      )
      .finally(function () {
        $scope.waiting = false;
      });
  };
}
