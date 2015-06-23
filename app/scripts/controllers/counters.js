'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:CountersCtrl
 * @description
 * # CountersCtrl
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('CountersCtrl', countersCtrl);

/* @ngInject */
function countersCtrl($location, counter, list, lastActive) {
  /*jshint validthis: true */
  var controller = this;

  controller.list = [];
  controller.lastActive = lastActive;
  controller.total = 0;

  var counterKey;
  for (counterKey in list) {
    if (lastActive === undefined || lastActive.id !== counterKey) {
      controller.list.push(list[counterKey]);
    }
    controller.total++;
  }

  controller.setActiveCounter = function(activeCounter) {
    counter.setActive(activeCounter);
    $location.path('/');
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
