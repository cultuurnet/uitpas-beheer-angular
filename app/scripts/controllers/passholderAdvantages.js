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
    advantage.exchanging = true;

    function unlockAdvantage() {
      advantage.exchanging = false;
      advantage.confirmingExchange = false;
    }

    advantageService
      .exchange(advantage.id, passholder.passNumber)
      .then(updateAdvantages, unlockAdvantage);
  };

  controller.initiateExchange = function (advantage) {
    advantage.confirmingExchange = true;
  };

  controller.cancelExchange = function (advantage) {
    advantage.confirmingExchange = false;
  };

  function updateAdvantages(exchangedAdvantage) {
    controller.passholder.points = controller.passholder.points - exchangedAdvantage.points;
    controller.advantages = controller.advantages.map(function (advantage) {

      if (advantage.id === exchangedAdvantage.id) {
        advantage = exchangedAdvantage;
        if (advantage.exchangeable) {
          advantage.exchanging = false;
        }
      }

     if (advantage.points > controller.passholder.points) {
       advantage.insufficientPoints = true;
     } else {
       advantage.insufficientPoints = false;
     }

      return advantage;
    });
  }
}
