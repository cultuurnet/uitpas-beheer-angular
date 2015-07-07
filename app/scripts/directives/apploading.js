'use strict';

/**
 * @ngdoc directive
 * @name uitpasbeheerApp.directive:appLoading
 * @description
 * # appLoading
 */
angular
  .module('uitpasbeheerApp')
  .directive('appLoading', appLoadingDirective);

/* @ngInject */
function appLoadingDirective ($rootScope) {
  return {
    templateUrl: 'views/loading.html',
    restrict: 'E',
    link: function postLink(scope) {

      if(typeof $rootScope.appBusy === 'undefined') {
        scope.loading = true;
      } else {
        scope.loading = $rootScope.appBusy;
      }

      $rootScope.$watch('appBusy', function() {
        scope.loading = $rootScope.appBusy;
      });
    }
  };
}
