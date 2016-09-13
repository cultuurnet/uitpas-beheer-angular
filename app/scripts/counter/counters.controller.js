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
function countersController($state, counterService, list, lastActiveId, appConfig, GoogleTagmanagerService) {

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
      if (GoogleTagmanagerService.isEnabled()) {
        var trackers = GoogleTagmanagerService.getTrackers();
        for (var i = 0; i < trackers.length; i++) {
          var trackerName = trackers[i].get('name');
          GoogleTagmanagerService.setVariable(trackerName, 'dimension1', activeCounter.id);
          GoogleTagmanagerService.setVariable(trackerName, 'dimension2', activeCounter.name);
          GoogleTagmanagerService.sendEvent(trackerName, 'pageview');
        }
      }

      $state.go('counter.main');
    });
  };

  controller.contacts = appConfig.contacts || [];
}
