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
function PassholderMembershipStopController ($scope, $modalInstance, $http, $filter, membership, passholder, appConfig) {
  $scope.membership = membership;

  $scope.errors = [];

  $scope.cancel = function () {
    $modalInstance.dismiss('canceled');
  };

  $scope.waiting = false;

  $scope.stop = function () {
    $scope.waiting = true;

    // 'delete' is a JavaScript keyword and IE8 parses it as such, even when
    // called as a method, so we can not use $http.delete() here and instead
    // need to use its full form.
    var request = $http({
      method: 'DELETE',
      url: appConfig.apiUrl + 'uitpas/' + passholder.passNumber + '/profile/memberships/' + membership.association.id
    });

    request
      .success(function (data) {
        // @todo parse response, check content type
        $modalInstance.close(data);
      })
      .error(function (data) {
        $scope.errors = [];
        angular.forEach(data.errors, function (error) {
          $scope.errors.push(error.message);
        });

        $scope.waiting = false;
      });
  };
}
