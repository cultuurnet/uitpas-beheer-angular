'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderMembershipRenewController
 * @description
 * # PassholderMembershipRenewController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderMembershipRenewController', PassholderMembershipRenewController);

/* @ngInject */
function PassholderMembershipRenewController ($scope, $modalInstance, $http, $filter, moment, membership, association, passholder, appConfig) {
  $scope.association = association;

  $scope.endDate = {
    date: moment.unix(membership.newEndDate).toDate(),
    fixed: $scope.association.enddateCalculation !== 'FREE'
  };

  $scope.errors = [];

  $scope.cancel = function () {
    $modalInstance.dismiss('canceled');
  };

  $scope.waiting = false;

  $scope.register = function (endDate) {
    $scope.waiting = true;

    var requestData = {
      associationId: $scope.association.id,
      endDate: $filter('date')(endDate.date, 'yyyy-MM-dd')
    };

    var request = $http.post(appConfig.apiUrl + 'uitpas/' + passholder.passNumber + '/profile/memberships', requestData);

    request
      .success(function (data) {
        // @todo parse response, check content type
        $modalInstance.close(data);
      })
      .error(function (data, status, headers, config) {
        $scope.waiting = false;
        $scope.errors = [];
        angular.forEach(data.errors, function (error) {
          $scope.errors.push(error.message);
        })
      }
    );
  };
}
