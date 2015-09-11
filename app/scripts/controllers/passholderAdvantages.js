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
function passholderAdvantageController(passholder, advantages, advantageService, $rootScope, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.advantages = advantages;
  controller.passholder = passholder;
  controller.availablePoints = passholder.points;

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

    var updatedPointCount = controller.availablePoints - exchangedAdvantage.points;
    controller.availablePoints = updatedPointCount;

    controller.advantages = controller.advantages.map(function (advantage) {
      if (advantage.id === exchangedAdvantage.id) {
        advantage = exchangedAdvantage;
        if (advantage.exchangeable) {
          advantage.exchanging = false;
        }
      }

      return advantage;
    });
    
    controller.updateExchangeability(updatedPointCount);
  }

  controller.updateExchangeability = function (pointCount) {
    controller.advantages = controller.advantages.map(function (advantage) {

      if (advantage.points > pointCount) {
        advantage.insufficientPoints = true;
      } else {
        advantage.insufficientPoints = false;
      }
      
      return advantage;
    });
  };

  function activityCheckedIn(event, activity) {
    var updatedPointCount = controller.availablePoints + activity.points;
    controller.availablePoints = updatedPointCount;
    
    controller.updateExchangeability(updatedPointCount);
  }

  var activityCheckinListener = $rootScope.$on('activityCheckedIn', activityCheckedIn);

  $scope.$on('$destroy', activityCheckinListener);

}
