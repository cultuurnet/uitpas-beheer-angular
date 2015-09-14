'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderDetailController
 * @description
 * # PassholderDetailController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderDetailController', PassholderDetailController);

/* @ngInject */
function PassholderDetailController (passholder, membershipService, $rootScope, moment, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.passholder = angular.copy(passholder);

  controller.membershipsLoading = false;

  var listRetrieved = function(data) {
    controller.memberships = data.passholder.memberships;
  };

  var loadMemberships = function() {
    controller.membershipsLoading = true;
    membershipService.list(passholder.passNumber)
      .then(listRetrieved)
      .finally(function() {
        controller.membershipsLoading = false;
      });
  };

  loadMemberships();

  controller.membershipHasExpired = membershipHasExpired;

  function membershipHasExpired(membership) {
    var endDate = moment.unix(membership.endDate);
    return moment().isAfter(endDate);
  }

  function subtractAdvantagePoints(event, exchangedAdvantage) {
    var newPointCount = controller.passholder.points - exchangedAdvantage.points;

    if (newPointCount < 0) {
      newPointCount = 0;
    }
    controller.passholder.points = newPointCount;
  }

  function addCheckinPoint(event, checkedInActivity) {
    var newPointCount = controller.passholder.points + checkedInActivity.points;

    controller.passholder.points = newPointCount;
  }

  function setPassholderForSidebar(event, updatedPassholder) {
    controller.passholder = angular.copy(updatedPassholder);
  }

  var cleanupMembershipModifiedListener = $rootScope.$on('membershipModified', loadMemberships);
  var cleanupAdvantageExchangedListener = $rootScope.$on('advantageExchanged', subtractAdvantagePoints);
  var cleanupActivityCheckedInListener = $rootScope.$on('activityCheckedIn', addCheckinPoint);
  var cleanupPassholderUpdatedListener = $rootScope.$on('passholderUpdated', setPassholderForSidebar);

  $scope.$on('$destroy', cleanupMembershipModifiedListener);
  $scope.$on('$destroy', cleanupAdvantageExchangedListener);
  $scope.$on('$destroy', cleanupActivityCheckedInListener);
  $scope.$on('$destroy', cleanupPassholderUpdatedListener);
}
