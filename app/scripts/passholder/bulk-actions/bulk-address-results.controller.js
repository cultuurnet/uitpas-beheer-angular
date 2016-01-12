'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.bulk-actions.controller:AddressBulkResultController
 * @description
 * # AddressBulkController
 * Controller of the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .controller('AddressBulkResultsController', AddressBulkResultsController);

function AddressBulkResultsController(passholders, bulkAddressForm, AddressBulkController, passholderService, $uibModalInstance) {
  var controller = this;
  controller.submitBusy = true;
  controller.passholders = passholders;

  for (var i = 0, len = controller.passholders.length; i < len; i++) {
    controller.passholders[i].updated = false;
    updatePassHolder(controller.passholders[i]);
    controller.passholders[i].updated = true;
  }

  function updatePassHolder(passholder){
    passholder.address.city = bulkAddressForm.city.$viewValue;
    passholder.address.postalCode = bulkAddressForm.zip.$viewValue;
    passholder.address.street = bulkAddressForm.street.$viewValue;
    passholderService.update(passholder, passholder.passNumber);
  }

  this.cancel = function() {
    $uibModalInstance.dismiss('canceled');
  }
}