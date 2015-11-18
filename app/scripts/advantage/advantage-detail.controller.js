'use strict';

/**
 * @ngdoc function
 * @name ubr.advantage.controller:PassholderAdvantageDetailController
 * @description
 * # PassholderAdvantageDetailController
 * Controller of the ubr.advantage module.
 */
angular.module('ubr.advantage')
  .controller('PassholderAdvantageDetailController', passholderAdvantageDetailController);

/* @ngInject */
function passholderAdvantageDetailController(passholder, advantage) {
  /*jshint validthis: true */
  var controller = this;

  controller.advantage = advantage;
  controller.passholder = passholder;

}
