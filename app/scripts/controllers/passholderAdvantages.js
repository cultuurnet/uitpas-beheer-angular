'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderAdvantageController
 * @description
 * # PassholderAdvantageController
 * Controller of the uitpasbeheerApp
 */
angular.module('uitpasbeheerApp')
  .controller('PassholderAdvantageController', passholderAdvantageController);

/* @ngInject */
function passholderAdvantageController(passholder, advantages) {
  /*jshint validthis: true */
  var controller = this;

  controller.advantages = advantages;
  controller.passholder = passholder;

  controller.exchangeAdvantage = function(advantageId) {
    console.log(advantageId, passholder);
  };
}
