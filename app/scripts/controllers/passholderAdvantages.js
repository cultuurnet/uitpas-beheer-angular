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
function passholderAdvantageController(passholder, advantages, advantageService) {
  /*jshint validthis: true */
  var controller = this;

  controller.advantages = advantages;
  controller.passholder = passholder;

  /**
   * Exchange an advantage for the active passholder
   *
   * @param {object} advantage
   */
  controller.exchangeAdvantage = function(advantage) {
    advantage.locked = true;

    function unlockAdvantage() {
      advantage.locked = false;
    }

    advantageService
      .exchange(advantage.id, passholder.passNumber)
      .then(updateExchangedAdvantage, unlockAdvantage);
  };

  function updateExchangedAdvantage(exchangedAdvantage) {
    controller.advantages = controller.advantages.map(function (advantage) {
      if (advantage.id === exchangedAdvantage.id) {
        advantage = exchangedAdvantage;
        if (advantage.exchangeable) {
          advantage.locked = false;
        }
      }
      return advantage;
    });
  }
}
