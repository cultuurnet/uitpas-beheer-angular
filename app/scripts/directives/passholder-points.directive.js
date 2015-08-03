'use strict';

/**
 * @ngdoc directive
 * @name uitpasbeheerApp.directive:ubrPassholderPoints
 * @description
 * # Passholder points
 */
angular
  .module('uitpasbeheerApp')
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

    $rootScope.$on('advantageExchanged', bouncePoints);
  }
}


