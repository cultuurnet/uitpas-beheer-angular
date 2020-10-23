'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.activities.controller:ActivitiesController
 * @description
 * # ActivitiesController
 * Controller of the ubr counter activities module.
 */
angular
  .module('ubr.counter.activities')
  .controller('ActivitiesController', ActivitiesController);

/* @ngInject */
function ActivitiesController($http, activitiesService, counterService, DateRange) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.query = '';
  controller.page = 1;
  controller.limit = 5;
  controller.sort = 'permanent desc';
  controller.activities = [];
  controller.dateRanges = angular.copy(DateRange);
  controller.dateRange = controller.dateRanges.ALL;
  controller.chooseDateStart = null;
  controller.chooseDateEnd = null;
  controller.totalActivities = 0;
  controller.activitiesLoading = false;
  controller.hideDateRange = false;

  var setActiveCounter = function (counter) {
    controller.activeCounter = counter;
  };

  counterService.getActive().then(setActiveCounter);

  function getSearchParameters() {
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

  controller.getActivities = function () {
    var searchParameters = getSearchParameters();

    // Add specific sorting for past date ranges.
    if (controller.dateRange.value === 'past') {
      searchParameters.sort = 'permanent desc,availableto desc';
    } else if (!controller.dateRange.value || controller.dateRange.value === 'choose_date') {
      searchParameters.sort = 'permanent desc,availableto asc';
    }

    var showResult = function (pagedActivities) {
      controller.activities = pagedActivities.activities;
      controller.totalActivities = pagedActivities.totalActivities;
      controller.activitiesLoading = false;
    };

    var fetchFailed = function () {
      controller.activitiesLoading = false;
    };
    controller.activitiesLoading = true;
    activitiesService.getActivities(searchParameters).then(showResult, fetchFailed);
  };

  function truncateString(str, n, useWordBoundary) {
    if (str.length <= n) {
      return str;
    }
    const subString = str.substr(0, n - 1); // the original check
    return (useWordBoundary ? subString.substr(0, subString.lastIndexOf(' ')) : subString) + '...';
  }

  controller.downloadQRCode = function (activity) {
    fetch('/images/png/logo_black.png')
      .then(function (response) {
        return response.blob();
      })
      .then(function (blob) {
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
          /* Remove next 2 lines when adding validity period for qr code */
          var date = new Date();
          date.setDate(date.getDate() + 1);

          var docDefinition = {
            content: [
              {
                image: reader.result,
                width: 350,
                alignment: 'center'
              },
              {
                fontSize: 42,
                text: 'Spaar een punt',
                bold: true,
                margin: [16, 16],
                alignment: 'center'
              },
              {
                fontSize: 18,
                ul: [
                  {
                    text: 'Ga naar uitpas.be/sparen',
                    margin: [0, 8]
                  },
                  {
                    text: 'Log in met je UiTPAS',
                    margin: [0, 8]
                  },
                  {
                    text: 'Scan deze code',
                    margin: [0, 8, 0, 24]
                  }
                ],
                margin: [115, 0],
                width: 300,
              },
              {
                image: document.getElementById(activity.id).firstChild.toDataURL(),
                width: 300,
                alignment: 'center'
              },
              {
                fontSize: 12,
                text: 'code geldig tot: ' + date.toLocaleDateString() /* Replace with actual validity date */,
                margin: [0, 8, 0, 0],
                alignment: 'center'
              },
              {
                fontSize: 20,
                text: truncateString(activity.title, 40, true),
                bold: true,
                margin: [0, 32, 0, 28],
                alignment: 'center'
              },
              {
                fontSize: 20,
                text: controller.activeCounter.name,
                alignment: 'center'
              }
            ],
            defaultStyle: {
              font: 'Roboto'
            }
          };
          pdfMake.createPdf(docDefinition).download(controller.activeCounter.name + '_' + activity.title + '_QRcode.pdf');
        };
      });
  };

  controller.getQRCodeForActivity = function (activity) {
    // TODO: get code for QR from BE here
    return 'vwx2b1db';
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
    controller.getActivities();
  };

  controller.updateDateRange = function (dateRange) {
    if (!angular.equals(controller.dateRange, dateRange)) {
      controller.dateRange = dateRange;

      // Do not refresh search results when "choose date" option is selected.
      if (!angular.equals(controller.dateRanges.CHOOSE_DATE, dateRange)) {
        controller.searchParametersChanged();
      }
    }
  };

  controller.resetSearchQuery = function () {
    controller.query = '';
    controller.searchParametersChanged();
  };

  // initial fetch
  controller.getActivities();
}
