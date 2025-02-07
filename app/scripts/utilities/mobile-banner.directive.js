'use strict';

angular
  .module('ubr.utilities')
  .directive('mobileBanner', mobileBannerDirective);

/* @ngInject */
function mobileBannerDirective(appConfig) {
  return {
    restrict: 'E',
    template:
      '<div class="mobile-banner" ng-if="redirectUrl && isMobile">' +
      '<a ng-href="{{redirectUrl}}">Open de nieuwe mobiele balie ></a>' +
      '</div>',
    link: function (scope) {
      scope.redirectUrl = appConfig.features.balieV2;
      scope.isMobile = window.innerWidth <= 1024;

      angular.element(window).on('resize', function () {
        scope.isMobile = window.innerWidth <= 1024;
        scope.$apply();
      });

      scope.$on('$destroy', function () {
        angular.element(window).off('resize');
      });
    },
  };
}
