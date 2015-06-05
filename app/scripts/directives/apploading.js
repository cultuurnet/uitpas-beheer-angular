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
      link: function postLink(scope, element, attrs) {
        scope.loading = !$rootScope.appReady;

        $rootScope.$watch('appReady', function() {
          scope.loading = !$rootScope.appReady;
        });
      }
    };
  });
