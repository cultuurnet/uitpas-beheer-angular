'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.bulk-actions.controller:ShowBulkResultsController
 * @description
 * # ShowBulkResultsController
 * Controller of the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .controller('ShowBulkResultsController', ShowBulkResultsController);

function ShowBulkResultsController(passholders, bulkAddressForm, passholderService, $uibModalStack) {
  var controller = this;
  var updatePassholderFailed = false;
  controller.submitBusy = true;
  controller.passholders = passholders;
  controller.asyncError = null;


  for (var i = 0, len = controller.passholders.length; i < len; i++) {
    controller.passholders[i].updated = false;
    updatePassHolder(controller.passholders[i]);
    if (updatePassholderFailed) {
      controller.passholder[i].failed = true;
    }
  }

  function updatePassHolder(passholder){
    passholder.address.city = bulkAddressForm.city.$viewValue;
    passholder.address.postalCode = bulkAddressForm.zip.$viewValue;
    passholder.address.street = bulkAddressForm.street.$viewValue;

    var updateOk = function(updatedPassholder) {
      updatedPassholder.updated = true;
    };

    var updateFailed = function(errorResponse) {
      updatePassholderFailed = true;
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
      .then(updateOk(passholder), updateFailed);
  }

  this.cancel = function() {
    $uibModalStack.dismissAll();
  }
}