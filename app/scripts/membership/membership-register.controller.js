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

  function getErrorMessage(error) {
    switch (error.code) {
      case 'PASSHOLDER_NOT_MEMBER_OF_CARD_SYSTEM':
        return 'Deze passhouder is geen lid van een kaartsysteem van deze vereniging';
      default:
        return error.message;
    }
  }

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
          if (Array.isArray(data.errors)) {
            angular.forEach(data.errors, function (error) {
              $scope.errors.push(getErrorMessage(error));
            });
          } else {
            $scope.errors.push(getErrorMessage(data.errors));
          }
        }
      )
      .finally(function () {
        $scope.waiting = false;
      });
  };
}
