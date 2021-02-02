'use strict';

/**
 * @ngdoc directive
 * @name ubr.utilites.directive:tooltip
 * @description
 * # tooltip
 */
angular
  .module('ubr.utilities')
  .directive('tooltip', tooltip);

/* @ngInject */
function tooltip() {
  return {
    restrict: 'A',
    link: function(scope, element){
      element.hover(function(){
        // on mouseenter
        element.tooltip('show');
      }, function(){
        // on mouseleave
        element.tooltip('hide');
      });
    }
  };
}
