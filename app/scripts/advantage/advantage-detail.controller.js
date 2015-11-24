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
function passholderAdvantageDetailController(advantage, $uibModalInstance, Advantage) {
  /*jshint validthis: true */
  var controller = this;

  controller.advantage = new Advantage(advantage);

  controller.cancelModal = function() {
    $uibModalInstance.dismiss();
  };
}
