'use strict';

/**
 * @ngdoc directive
 * @name uitpasbeheerApp.directive:appLoading
 * @description
 * # appLoading
 */
angular
  .module('uitpasbeheerApp')
  .directive('appLoading', function ($rootScope) {
    return {
      templateUrl: 'views/loading.html',
      restrict: 'E',
      link: function postLink(scope) {
        scope.loading = $rootScope.appBusy;

        $rootScope.$watch('appBusy', function() {
          scope.loading = $rootScope.appBusy;
        });
      }
    };
  });
