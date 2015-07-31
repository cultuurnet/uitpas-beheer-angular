'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderDetailController
 * @description
 * # PassholderController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderDetailController', PassholderDetailController);

/* @ngInject */
function PassholderDetailController (passholder, $rootScope) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = passholder;

  function updatePoints(event, exchangedAdvantage) {
    var newPointCount = controller.passholder.points - exchangedAdvantage.points;

    if (newPointCount < 0) {
      newPointCount = 0;
    }
    controller.passholder.points = newPointCount;
  }

  $rootScope.$on('advantageExchanged', updatePoints);
}
