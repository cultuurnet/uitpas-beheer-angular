'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.controller:CountersController
 * @description
 * # CountersController
 * Controller of the ubr.counter module.
 */
angular
  .module('ubr.counter')
  .controller('CountersController', countersController);

/* @ngInject */
function countersController($state, counterService, list, lastActiveId, appConfig, GoogleAnalyticsService) {

  /*jshint validthis: true */
  var controller = this;

  controller.list = [];
  controller.lastActive = undefined;
  controller.lastActiveId = lastActiveId;
  controller.total = 0;

  var counterKey;
  for (counterKey in list) {
    if (list.hasOwnProperty(counterKey)) {
      if (counterKey && lastActiveId === counterKey) {
        controller.lastActive = list[counterKey];
      } else {
        controller.list.push(list[counterKey]);
      }
      controller.total++;
    }
  }

  controller.setActiveCounter = function(activeCounter) {
    counterService.setActive(activeCounter).then(function() {

      // If analytics is enabled, set the selected counter as dimension.
      if (GoogleAnalyticsService.isEnabled()) {
        var trackers = GoogleAnalyticsService.getTrackers();
        for (var i = 0; i < trackers.length; i++) {
          var trackerName = trackers[i].get('name');
          GoogleAnalyticsService.setVariable(trackerName, 'dimension1', activeCounter.id);
          GoogleAnalyticsService.setVariable(trackerName, 'dimension2', activeCounter.name);
          GoogleAnalyticsService.sendEvent(trackerName, 'pageview');
        }
      }

      $state.go('counter.main');
    });
  };

  controller.contacts = appConfig.contacts || [];
}
