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
      $state.go('counter.main');
    });
  };

  controller.contacts = appConfig.contacts || [];
}
