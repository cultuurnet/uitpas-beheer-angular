'use strict';

/**
 * @ngdoc function
 * @name ubr.search.controller:PassholderSearchController
 * @description
 * # SearchController
 * Controller of the ubr.search module.
 */
angular
  .module('ubr.search')
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
