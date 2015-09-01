'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderMembershipRegisterController
 * @description
 * # PassholderMembershipRegisterController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderMembershipRegisterController', PassholderMembershipRegisterController);

/* @ngInject */
function PassholderMembershipRegisterController ($scope, $modalInstance, $http, $filter, association, passholder, recentlyExpired, MembershipEndDateCalculator, appConfig) {
  $scope.association = association;

  var membershipEndDateCalculator = new MembershipEndDateCalculator(association);

  $scope.endDate = membershipEndDateCalculator.membershipEndDate(passholder);

  $scope.recentlyExpired = recentlyExpired;

  $scope.waiting = false;

  $scope.errors = [];

  $scope.cancel = function () {
    $modalInstance.dismiss('canceled');
  };

  $scope.register = function (endDate) {
    $scope.waiting = true;

    var requestData = {
      associationId: $scope.association.id
    };

    if (!endDate.fixed) {
      requestData.endDate = $filter('date')(endDate.date, 'yyyy-MM-dd');
    }

    var request = $http.post(appConfig.apiUrl + 'uitpas/' + passholder.passNumber + '/profile/memberships', requestData);

    request
      .success(function (data) {
        // @todo parse response, check content type, and data, refresh list.
        $modalInstance.close(data);
      })
      .error(
      function (data, status, headers, config) {
        $scope.errors = [];
        angular.forEach(data.errors, function (error) {
          $scope.errors.push(error.message);
        });

        $scope.waiting = false;
      }
    );
  };
}
