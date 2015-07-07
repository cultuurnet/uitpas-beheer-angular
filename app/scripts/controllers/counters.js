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
function countersController($rootScope, $location, counterService, list, lastActiveId, passholderService, sharedDataService, $state) {
  /*jshint validthis: true */
  var controller = this;

  controller.list = [];
  controller.lastActive = undefined;
  controller.lastActiveId = lastActiveId;
  controller.total = 0;

  controller.shared = sharedDataService;
  controller.shared.data.passholderIdentification = '';

  controller.searchPassholder = function() {
    $rootScope.appBusy = true;

    passholderService.find(controller.shared.data.passholderIdentification).then(
      angular.bind(controller, function(passholder) {
        $state.go('counter.passholder', {identification: controller.shared.data.passholderIdentification});
        controller.shared.data.passholder = passholder;
        controller.shared.data.passholderNotFound = false;
        $rootScope.appReady = true;
      }),
      angular.bind(controller, function() {
        controller.shared.data.passholder = undefined;
        controller.shared.data.passholderNotFound = true;
        $rootScope.appBusy = false;
      })
    );
  };

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
