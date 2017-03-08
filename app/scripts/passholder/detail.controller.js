'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.controller:PassholderDetailController
 * @description
 * # PassholderDetailController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .controller('PassholderDetailController', PassholderDetailController);

/* @ngInject */
function PassholderDetailController (
  pass,
  membershipService,
  $rootScope,
  moment,
  $scope,
  passholderService,
  activeCounter,
  $window,
  $state
) {
  /*jshint validthis: true */
  var controller = this;

  controller.passholder = angular.copy(pass.passholder);
  controller.pass = pass;
  controller.activeCounter = activeCounter;

  controller.membershipsLoading = false;
  controller.couponsLoading = false;
  controller.showAllCoupons = false;

  var listRetrieved = function(data) {
    controller.memberships = data.passholder.memberships;
  };

  var loadMemberships = function() {
    controller.membershipsLoading = true;
    membershipService.list(controller.pass.number)
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

  var displayCoupons = function(coupons) {
    controller.coupons = coupons;
  };

  var loadCoupons = function() {
    controller.couponsLoading = true;

    function removeLoadingState() {
      controller.couponsLoading = false;
    }

    passholderService
      .getCoupons(pass.number, -1)
      .then(displayCoupons)
      .finally(removeLoadingState);
  };

  loadCoupons();

  controller.goBack = function () {
    $window.history.back();
  };

  controller.showModalForCardSystem = function(cardSystem) {
    // Determine the first step by counter permissions.
    if (controller.activeCounter.isAuthorisedRegistrationCounter(cardSystem.id)) {
      $state.go('counter.main.passholder.upgrade.kansenStatuut', {cardSystem: cardSystem});
    }
    else {
      $state.go('counter.main.passholder.upgrade.newCard', {cardSystem: cardSystem});
    }
  };

  /**
   * Toggle all coupons.
   */
  controller.toggleCoupons = function() {
    controller.showAllCoupons = !controller.showAllCoupons;
  };

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

  function refreshPassholder () {
    passholderService.findPassholder(pass.number).then(
      function (passholder) {
        controller.passholder = passholder;
      }
    );
  }

  var cleanupMembershipModifiedListener = $rootScope.$on('membershipModified', loadMemberships);
  var cleanupAdvantageExchangedListener = $rootScope.$on('advantageExchanged', subtractAdvantagePoints);
  var cleanupActivityCheckedInListener = $rootScope.$on('activityCheckedIn', addCheckinPoint);
  var cleanupPassholderUpdatedListener = $rootScope.$on('passholderUpdated', setPassholderForSidebar);
  var cleanupKansenStatuutRenewalListener = $rootScope.$on('kansenStatuutRenewed', refreshPassholder);
  var cleanupSchoolUpdatedListener = $rootScope.$on('schoolUpdated', refreshPassholder);
  var cleanupTicketRemovedListener = $rootScope.$on('ticketRemoved', loadCoupons);
  var cleanupActivityTariffClaimedListener = $rootScope.$on('activityTariffClaimed', loadCoupons);

  $scope.$on('$destroy', cleanupMembershipModifiedListener);
  $scope.$on('$destroy', cleanupAdvantageExchangedListener);
  $scope.$on('$destroy', cleanupActivityCheckedInListener);
  $scope.$on('$destroy', cleanupPassholderUpdatedListener);
  $scope.$on('$destroy', cleanupKansenStatuutRenewalListener);
  $scope.$on('$destroy', cleanupSchoolUpdatedListener);
  $scope.$on('$destroy', cleanupTicketRemovedListener);
  $scope.$on('$destroy', cleanupActivityTariffClaimedListener);
}
