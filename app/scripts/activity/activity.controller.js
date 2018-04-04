'use strict';

/**
 * @ngdoc function
 * @name ubr.activity.controller:ActivityController
 * @description
 * # ActivityController
 * Controller of the ubr.activity module.
 */
angular
  .module('ubr.activity')
  .controller('ActivityController', ActivityController);

/* @ngInject */
function ActivityController (passholder, passholders, bulkSelection, activityService, DateRange, $rootScope, $scope, activityMode, $state, activeCounter) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.query = '';
  controller.page = 1;
  controller.limit = 5;
  controller.activities = [];
  controller.currentClaimedActivities = [];
  controller.dateRanges = angular.copy(DateRange);
  controller.dateRange = controller.dateRanges.TODAY;
  controller.chooseDateStart = null;
  controller.chooseDateEnd = null;
  controller.totalActivities = 0;
  controller.activitiesLoading = 0;
  controller.hideDateRange = false;
  controller.activityMode = activityMode;
  controller.bulkSelection = bulkSelection;
  controller.passholders = passholders;

  function getSearchParameters () {
    var searchParameters = {
      query: controller.query,
      dateRange: controller.dateRange,
      page: controller.page,
      limit: controller.limit,
      startDate: '',
      endDate: ''
    };

    if (controller.dateRange === controller.dateRanges.CHOOSE_DATE) {
      if (controller.chooseDateStart !== null) {
        searchParameters.startDate = Math.floor(controller.chooseDateStart.getTime() / 1000);
      }

      if (controller.chooseDateEnd !== null) {
        searchParameters.endDate = Math.floor(controller.chooseDateEnd.getTime() / 1000);
      }
    }

    return searchParameters;
  }

  // Keep track of the last used search parameters to check if the active page should be reset.
  var lastSearchParameters = getSearchParameters();

  /**
   * Update the active date range and trigger a search parameter change if a new range is selected.
   *
   * @param {DateRange} dateRange
   */
  controller.updateDateRange = function (dateRange) {
    if (!angular.equals(controller.dateRange, dateRange)) {
      controller.dateRange = dateRange;

      // Do not refresh search results when "choose date" option is selected.
      if (!angular.equals(controller.dateRanges.CHOOSE_DATE, dateRange)) {
        controller.searchParametersChanged();
      }
    }
  };

  controller.searchParametersChanged = function () {
    var newSearchParameters = getSearchParameters();

    function queryChanged() {
      return lastSearchParameters.query !== newSearchParameters.query;
    }

    function dateRangeChanged() {
      return lastSearchParameters.dateRange !== newSearchParameters.dateRange;
    }

    function resetActivePage() {
      newSearchParameters.page = 1;
      controller.page = 1;
    }

    if (queryChanged() || dateRangeChanged()) {
      resetActivePage();
    }

    if (queryChanged() && newSearchParameters.query !== '') {
      newSearchParameters.dateRange = DateRange.NEXT_12_MONTHS;
      controller.hideDateRange = true;
    }
    else {
      controller.hideDateRange = false;
    }

    lastSearchParameters = newSearchParameters;
    controller.search();
  };

  controller.resetSearchQuery = function () {
    controller.query = '';
    controller.dateRange = DateRange.TODAY;

    controller.searchParametersChanged();
  };

  controller.search = function () {
    var searchParameters = getSearchParameters();

    var showSearchResults = function (pagedActivities) {
      controller.activities = pagedActivities.activities;
      controller.totalActivities = pagedActivities.totalActivities;
      --controller.activitiesLoading;
    };

    var searchingFailed = function () {
      --controller.activitiesLoading;
    };
    ++controller.activitiesLoading;
    if (activityMode === 'counter') {
      var keepGoing = true;
      var kansenstatuut;
      var passholderNoKansenstatuut = [];

      if (activeCounter.cardSystems && activeCounter.getFirstCardSystem()) {
        angular.forEach(controller.passholders, function(passholder) {
          if(keepGoing) {
            kansenstatuut = passholder.getKansenstatuutByCardSystemID(activeCounter.getFirstCardSystem().id);
            if(kansenstatuut !== null) {
              if (kansenstatuut.status !== 'EXPIRED') {
                controller.passholder = passholder;
                keepGoing = false;
              }
            }
            // if passholder has no kansenstatuut push them into a seperate array for the next condition.
            else {
              passholderNoKansenstatuut.push(passholder);
            }
          }
        });

        // Check if there is already a passholder in the controller property
        if (!controller.hasOwnProperty('passholder') && passholderNoKansenstatuut.length > 0) {
          var keepGoing2 = true;
          angular.forEach(passholderNoKansenstatuut, function(passholder) {
            if(keepGoing2) {
              if(passholder.getUitpasStatusInCardSystemID(activeCounter.getFirstCardSystem().id) === 'ACTIVE') {
                controller.passholder = passholder;
                keepGoing2 = false;
              }
            }
          });
        }

        // If still no passholder is in the controller property, pick the first with an active UiTPAS.
        if (!controller.hasOwnProperty('passholder')) {
          var keepGoing3 = true;
          angular.forEach(controller.passholders, function(passholder) {
            if(keepGoing3) {
              if(passholder.getUitpasStatusInCardSystemID(activeCounter.getFirstCardSystem().id) === 'ACTIVE') {
                controller.passholder = passholder;
                keepGoing3 = false;
              }
            }
          });
        }
      }

    }
    else {
      controller.passholder = passholder;
    }

    if (controller.passholder) {
      activityService
        .search(controller.passholder, searchParameters)
        .then(showSearchResults, searchingFailed);
    }
    else {
      --controller.activitiesLoading;
    }

  };

  // Do an initial search to populate the activity list.
  controller.search();

  /**
   * Instantly claim a tariff without choosing a price class.
   *  This is useful for activities that only have one tariff with a single price class.
   *  An extra pending state property is added to activities to track async communication.
   *  If there are multiple tariff or price options you should allow the user to pick the one he likes best.
   *
   *  This just picks the first price class for the given tariff!
   *
   * @param {object} tariff
   * @param {Activity} activity
   */
  controller.claimTariff = function (tariff, activity) {
    activity.tariffClaimInProgress = true;

    var priceInfo = tariff.prices[0];

    var tariffClaimedSuccessfully = function () {
      controller.currentClaimedActivities.push(activity.id);
      controller.search();
    };

    var tariffNotClaimed = function (error) {
      activity.tariffClaimError = error;
    };

    var clearPendingState = function () {
      activity.tariffClaimInProgress = false;
    };

    activityService
      .claimTariff(passholder, activity, priceInfo)
      .then(tariffClaimedSuccessfully, tariffNotClaimed)
      .finally(clearPendingState);
  };

  controller.checkin = function (activity) {
    activity.checkinBusy = true;

    function updateActivity(newActivity) {
      controller.activities = controller.activities.map(function (activity) {
        if (activity.id === newActivity.id) {
          activity.checkinConstraint.reason = 'MAXIMUM_REACHED';
          activity.checkinBusy = false;
        }
        return activity;
      });
    }

    function checkinError() {
      controller.activities = controller.activities.map(function (existingActivity) {
        if (existingActivity.id === activity.id) {
          existingActivity.checkinBusy = false;
          existingActivity.checkinFailed = true;
        }
        return existingActivity;
      });
    }

    activityService
      .checkin(activity, passholder)
      .then(updateActivity, checkinError);
  };

  controller.bulkCheckin = function (activity) {
    activity.checkinBusy = true;
    $state.go('counter.main.advancedSearch.showBulkResults', {
      passholders: controller.passholders,
      bulkForm: null,
      bulkSelection: controller.bulkSelection,
      action: 'points',
      activity: activity
    });
  };

  /**
   * Handle the update of a claimed activity.
   * @param event
   * @param activity
   */
  controller.updateClaimedTariffActivity = function (event, activity) {
    controller.currentClaimedActivities.push(activity.id);
    controller.search();
  };

  /**
   * Check if the activity has been claimed in current session.
   */
  controller.isActivityClaimed = function (activity) {
    return controller.currentClaimedActivities.indexOf(activity.id) !== -1;
  };

  var activityTariffClaimedListener = $rootScope.$on('activityTariffClaimed', controller.updateClaimedTariffActivity);
  var activityTicketRemovedListener = $rootScope.$on('ticketRemoved', controller.updateClaimedTariffActivity);

  $scope.$on('$destroy', activityTariffClaimedListener);
  $scope.$on('$destroy', activityTicketRemovedListener);
}
