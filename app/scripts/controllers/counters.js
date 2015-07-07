'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:CountersController
 * @description
 * # CountersController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('CountersController', countersController);

/* @ngInject */
function countersController($location, counterService, list, lastActiveId) {
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
      $location.path('/');
    });
  };

  controller.contacts = [
    {
      name: 'UiTPAS Oostende',
      telephone: '059 12 34 56',
      email: 'uit@oostende.be'
    },
    {
      name: 'UiTPAS Gent',
      telephone: '059 12 34 56',
      email: 'uit@gent.be'
    },
    {
      name: 'Andere regio\'s',
      telephone: '059 12 34 56',
      email: 'vragen@uitpas.be'
    }
  ];
}
