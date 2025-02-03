"use strict";

angular.module("ubr.utilities").directive("mobileBanner", function () {
  return {
    restrict: "E",
    template:
      '<div class="mobile-banner" ng-show="isMobile">' +
      '<a href="https://balie.uitpas.be/app/mobile">Open de nieuwe mobiele balie ></a>' +
      "</div>",
    link: function (scope) {
      scope.isMobile = window.innerWidth <= 1024;

      angular.element(window).on("resize", function () {
        scope.isMobile = window.innerWidth <= 1024;
        scope.$apply();
      });

      scope.$on("$destroy", function () {
        angular.element(window).off("resize");
      });
    },
  };
});
