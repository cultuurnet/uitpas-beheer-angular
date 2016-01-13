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

function AddressBulkResultsController(passholders, bulkAddressForm, passholderService, $uibModalInstance, $rootScope) {
  var controller = this;
  controller.submitBusy = true;
  controller.passholders = passholders;
  controller.asyncError = null;

  for (var i = 0, len = controller.passholders.length; i < len; i++) {
    controller.passholders[i].updated = false;
    updatePassHolder(controller.passholders[i]);
    //controller.passholders[i].updated = true;
  }

  function updatePassHolder(passholder){
    passholder.address.city = bulkAddressForm.city.$viewValue;
    passholder.address.postalCode = bulkAddressForm.zip.$viewValue;
    passholder.address.street = bulkAddressForm.street.$viewValue;

    var updateOk = function(updatedPassholder) {
      updatedPassholder.updated = true;
      //$uibModalInstance.close();
    };

    var updateFailed = function(errorResponse) {
      var errorCode = errorResponse.apiError.code;
      // clear any previous async errors
      controller.asyncError = null;


      if (errorCode === 'ACTION_NOT_ALLOWED') {
        controller.asyncError = {
          message: 'Actie niet toegestaan.',
          type: 'danger'
        };
      }
      
      if (errorCode === 'PASSHOLDER_NOT_UPDATED_ON_SERVER') {
        controller.asyncError = {
          message: errorResponse.apiError.message,
          type: 'danger'
        };
      }
    };

    passholderService.update(passholder, passholder.passNumber)
      .then(updateOk, updateFailed);
  }

  this.cancel = function() {
    $uibModalInstance.dismiss('canceled');
  }
}