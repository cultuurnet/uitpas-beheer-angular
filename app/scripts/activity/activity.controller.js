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
  controller.sort = 'permanent desc,periods desc,availableto asc';
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
      sort: controller.sort,
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

    lastSearchParameters = newSearchParameters;
    controller.search();
  };

  controller.resetSearchQuery = function () {
    controller.query = '';
    controller.searchParametersChanged();
  };

  controller.search = function () {
    var searchParameters = getSearchParameters();

    // Add specific sorting for past date ranges.
    if (controller.dateRange.value === 'past') {
      searchParameters.sort = 'permanent desc,availableto desc';
    } else if (!controller.dateRange.value || controller.dateRange.value === 'choose_date') {
      searchParameters.sort = 'permanent desc,availableto asc';
    }

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
              angular.forEach(activeCounter.cardSystems, function (cardSystem) {
                if (keepGoing2) {
                  if(passholder.getUitpasStatusInCardSystemID(cardSystem.id) === 'ACTIVE') {
                    controller.passholder = passholder;
                    keepGoing2 = false;
                  }
                }
              });
            }
          });
        }

        // If still no passholder is in the controller property, pick the first with an active UiTPAS and within the active counter card systems.
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

        // If still no passholder is in the controller property, pick the first with an active UiTPAS
        if (!controller.hasOwnProperty('passholder')) {
          var keepGoing4 = true;
          angular.forEach(controller.passholders, function(passholder) {
            if (keepGoing4) {
              angular.forEach(passholder.uitPassen, function(uitPas) {
                if (uitPas.status === 'ACTIVE') {
                  controller.passholder = passholder;
                  keepGoing4 = false;
                }
              });
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

  controller.bulkClaimTariff = function(tariff, activity) {
    activity.tariffClaimInProgress = true;
    var priceInfo = tariff.prices[0];

    $state.go('counter.main.advancedSearch.showBulkResults', {
      passholders: controller.passholders,
      bulkSelection: controller.bulkSelection,
      activity: activity,
      tariff: priceInfo,
      ticketCount: null,
      action: 'tariffs'
    });
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

    function checkinError(error) {
      controller.activities = controller.activities.map(function (existingActivity) {
        if (existingActivity.id === activity.id) {
          existingActivity.checkinBusy = false;
          existingActivity.checkinFailed = true;
          existingActivity.checkinFailedMessage = error.user_friendly_message; // jshint ignore:line
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
