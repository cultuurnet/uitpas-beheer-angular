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
function PassholderDetailController (passholder, membershipService, $rootScope) {
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

  $rootScope.$on('membershipModified', loadMemberships);
  $rootScope.$on('advantageExchanged', subtractAdvantagePoints);
  $rootScope.$on('activityCheckedIn', addCheckinPoint);
}
