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

function ShowBulkResultsController(passholders, bulkAddressForm, passholderService, $uibModalStack, $scope) {
  var controller = this;
  var updatePassholderFailed = false;
  var errorCode;
  controller.submitBusy = true;
  controller.passholders = passholders;

  angular.forEach(controller.passholders, function(passholder, i) {
    controller.passholders[i].isChecked = false;
    controller.passholders[i].updated = false;
    updatePassHolder(controller.passholders[i]);

    if (updatePassholderFailed) {
      controller.passholders[i].failed = true;
      controller.passholders[i].isChecked = true;
      if (errorCode === 'ACTION_NOT_ALLOWED') {
        controller.passholders[i].asyncError = {
          message: 'Actie niet toegestaan.',
          type: 'danger'
        };
      }

      if (errorCode === 'PASSHOLDER_NOT_UPDATED_ON_SERVER') {
        controller.passholders[i].asyncError = {
          message: 'Pashouder niet werd niet geupdate op de server.',
          type: 'danger'
        };
      }
    }
    else {
      controller.passholders[i].updated = true;
      controller.passholders[i].isChecked = true;
    }
  });

  function updatePassHolder(passholder){
    passholder.address.city = bulkAddressForm.city.$viewValue;
    passholder.address.postalCode = bulkAddressForm.zip.$viewValue;
    passholder.address.street = bulkAddressForm.street.$viewValue;

    var updateOk = function() {
      updatePassholderFailed = false;
    };

    var updateFailed = function(errorResponse) {
      updatePassholderFailed = true;
      errorCode = errorResponse.apiError.code;
    };

    passholderService.update(passholder, passholder.passNumber)
      .then(updateOk, updateFailed);
  }

  this.cancel = function() {
    $uibModalStack.dismissAll();
  }
}