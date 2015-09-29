'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderSearchController
 * @description
 * # PassholderSearchController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderSearchController', PassholderSearchController);

/* @ngInject */
function PassholderSearchController (UiTPASRouter) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholderIdentification = UiTPASRouter.getLastIdentification() || '';

  controller.findPassholder = function () {
    if (controller.passholderIdentification) {
      UiTPASRouter.go(controller.passholderIdentification);
    }
  };
}
