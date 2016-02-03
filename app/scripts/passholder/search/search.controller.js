'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.search.controller:PassholderSearchController
 * @description
 * # SearchController
 * Controller of the ubr.passholder.search module.
 */
angular
  .module('ubr.passholder.search')
  .controller('PassholderSearchController', PassholderSearchController);

/* @ngInject */
function PassholderSearchController (UiTPASRouter) {
  /*jshint validthis: true */
  var controller = this;

  controller.clearPassholderIdentification = function() {
    controller.passholderIdentification = '';
  };
  controller.clearPassholderIdentification();

  controller.findPassholder = function () {
    if (controller.passholderIdentification) {
      UiTPASRouter.go(controller.passholderIdentification);
    }
  };
}
