'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.controller:PassholderSearchController
 * @description
 * # PassholderSearchController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
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
