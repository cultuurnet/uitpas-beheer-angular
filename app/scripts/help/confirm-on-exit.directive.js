'use strict';

/**
 * @ngdoc directive
 * @name ubr.utilites.directive:ubrDatepicker
 * @description
 * # ubrDatepicker
 */
angular
  .module('ubr.utilities')
  .directive('confirmOnExit', confirmOnExit);

/* @ngInject */
function confirmOnExit() {
  return {
    scope: {
      confirmOnExit: '&',
      confirmMessageWindow: '@',
      confirmMessageRoute: '@',
      confirmMessage: '@'
    },
    link: function($scope) {
      window.onbeforeunload = function(){
        if ($scope.confirmOnExit()) {
          return $scope.confirmMessageWindow || $scope.confirmMessage;
        }
      };

      var $stateChangeStartUnbind = $scope.$on('$stateChangeStart', function(event) {
        if ($scope.confirmOnExit()) {
          if(! confirm($scope.confirmMessageRoute || $scope.confirmMessage)) {
            event.preventDefault();
          }
        }
      });

      var $locationChangeStartUnbind = $scope.$on('$locationChangeStart', function(event) {
        if ($scope.confirmOnExit()) {
          if(! confirm($scope.confirmMessageRoute || $scope.confirmMessage)) {
            event.preventDefault();
          }
        }
      });

      $scope.$on('$destroy', function() {
        window.onbeforeunload = null;
        $stateChangeStartUnbind();
        $locationChangeStartUnbind();
      });
    }
  };
}
