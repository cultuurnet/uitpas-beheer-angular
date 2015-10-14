'use strict';

/**
 * @ngdoc directive
 * @name ubr.passholder.directive:ubrPassholderPoints
 * @description
 * # Passholder points directive.
 */
angular
  .module('ubr.passholder')
  .directive('ubrPassholderPoints', ubrPassholderPoints);

/* @ngInject */
function ubrPassholderPoints ($rootScope, $animate) {
  var directive = {
    restrict: 'EA',
    link: link
  };
  return directive;

  function link(scope, element) {
    function bouncePoints() {
      $animate.removeClass(element, 'animated pulse');
      $animate.addClass(element, 'animated pulse').then(function(){
        $animate.removeClass(element, 'animated pulse');
      });
    }

    function handleExchange(event, exchangedAdvantage){
      if (exchangedAdvantage.points > 0) {
        bouncePoints();
      }
    }

    function handleCheckin() {
      bouncePoints();
    }

    $rootScope.$on('advantageExchanged', handleExchange);
    $rootScope.$on('activityCheckedIn', handleCheckin);
  }
}


