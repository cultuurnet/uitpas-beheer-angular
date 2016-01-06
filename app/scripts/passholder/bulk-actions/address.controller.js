'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.bulk-actions.controller:AddressBulkController
 * @description
 * # AddressBulkController
 * Controller of the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .controller('AddressBulkController', AddressBulkController);

/* @ngInject */
function AddressBulkController (bulkSelection, $uibModalInstance) {
  var controller = this;
  controller.submitBusy = false;

  controller.submitForm = function() {
    controller.submitBusy = true;
    console.log(controller);
  };

  this.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}