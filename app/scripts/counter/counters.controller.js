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
function countersController($state, counterService, list, lastActiveId, appConfig) {
  /*jshint validthis: true */
  var controller = this,
    analyticsEnabled = (typeof ga === 'function');

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
      if (analyticsEnabled) {
        ga('set', 'dimension1', activeCounter.id);
        ga('set', 'dimension2', activeCounter.name);
      }

      $state.go('counter.main');
    });
  };

  controller.contacts = appConfig.contacts || [];
}
