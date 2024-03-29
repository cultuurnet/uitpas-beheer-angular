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
  destination,
  $window,
  $state
) {
  /*jshint validthis: true */
  var controller = this;

  controller.passholder = angular.copy(pass.passholder);
  controller.pass = pass;
  controller.activeCounter = activeCounter;
  controller.destination = destination;
  controller.hasMultiplePasses = !!(pass.passholder && pass.passholder.uitPassen && pass.passholder.uitPassen.length > 1);
  if (controller.hasMultiplePasses) {
    var selectedPass = pass.passholder.uitPassen.find(
      function(p) {
        return p.number === $state.params.identification;
      }
    );
    $scope.selectedPass = angular.copy(selectedPass || pass.passholder.uitPassen[0]);
  }
  controller.cardSystemIds = pass.passholder.cardSystems ? pass.passholder.cardSystems.map(function(cardSystem) {return cardSystem.id;}) : [];

  controller.membershipsLoading = false;
  controller.couponsLoading = false;
  controller.showAllCoupons = false;

  controller.cardSystemSpecific = null;

  var listRetrieved = function(data) {
    controller.memberships = data.passholder.memberships;
    controller.cardSystemSpecific = data.passholder.cardSystemSpecific;
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

  controller.membershipWillExpire = membershipWillExpire;

  function membershipWillExpire(membership) {
    var endDate = moment.unix(membership.endDate);
    return moment().add(1, 'M').isAfter(endDate) && !moment().isAfter(endDate);
  }

  controller.canEditKansenstatuut = canEditKansenstatuut;

  function canEditKansenstatuut() {
    if (selectedPass && selectedPass.kansenStatuut === false) {
      return false;
    }
    var selectedCardSystemId = selectedPass ? selectedPass.cardSystem.id : controller.pass.cardSystem.id;
    return controller.activeCounter.isAuthorisedRegistrationCounter(selectedCardSystemId);
  }

  controller.getKansenStatuutSuspended = getKansenStatuutSuspended;

  function getKansenStatuutSuspended(cardSystemID) {
    var suspendedUntil = controller.cardSystemSpecific && controller.cardSystemSpecific[cardSystemID] && controller.cardSystemSpecific[cardSystemID].kansenStatuutSuspendedUntil;
    return suspendedUntil ? suspendedUntil * 1000 : suspendedUntil;
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
    if (controller.destination) {
      $state.go(controller.destination.route, controller.destination.params || {});
    } else {
      $window.history.back();
    }
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

  controller.selectPass = function() {
    $state.go('counter.main.passholder', {identification: $scope.selectedPass.number});
  };

  var selectPassByNumber = function (event, number) {
    $state.go('counter.main.passholder', {identification: number}, { reload: true });
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
  var cleanupSelectedPassListener = $rootScope.$on('selectedPass', selectPassByNumber);

  $scope.$on('$destroy', cleanupMembershipModifiedListener);
  $scope.$on('$destroy', cleanupAdvantageExchangedListener);
  $scope.$on('$destroy', cleanupActivityCheckedInListener);
  $scope.$on('$destroy', cleanupPassholderUpdatedListener);
  $scope.$on('$destroy', cleanupKansenStatuutRenewalListener);
  $scope.$on('$destroy', cleanupSchoolUpdatedListener);
  $scope.$on('$destroy', cleanupTicketRemovedListener);
  $scope.$on('$destroy', cleanupActivityTariffClaimedListener);
  $scope.$on('$destroy', cleanupSelectedPassListener);
}
