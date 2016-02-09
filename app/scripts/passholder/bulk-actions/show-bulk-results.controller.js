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
  var errorCode;
  controller.submitBusy = true;
  controller.passholders = passholders;

  controller.updatePassHolder = function(passholder) {
    passholder.address.city = bulkAddressForm.city.$viewValue;
    passholder.address.postalCode = bulkAddressForm.zip.$viewValue;
    passholder.address.street = bulkAddressForm.street.$viewValue;

    var updateOk = function() {
      passholder.updated = true;
      passholder.isChecked = true;
      passholder.failed = false;
    };

    var updateFailed = function(errorResponse) {
      passholder.updated = false;
      passholder.isChecked = true;
      passholder.failed = true;

      errorCode = errorResponse.code;

      switch (errorCode) {
        case 'ACTION_NOT_ALLOWED':
          passholder.asyncError = {
            message: 'Actie niet toegestaan.',
            type: 'danger'
          };
          break;

        case 'PASSHOLDER_NOT_UPDATED_ON_SERVER':
          passholder.asyncError = {
            message: 'Pashouder niet werd niet geupdate op de server.',
            type: 'danger'
          };
          break;

        default:
          passholder.asyncError = {
            message: 'Pashouder werd niet geupdate op de server.',
            type: 'danger'
          };
      }
    };

    passholderService.update(passholder, passholder.passNumber)
      .then(updateOk, updateFailed);
  };

  angular.forEach(controller.passholders, function(passholder) {
    passholder.isChecked = false;
    passholder.updated = false;
    passholder.failed = false;
    controller.updatePassHolder(passholder);
  });

  controller.cancel = function() {
    $uibModalStack.dismissAll();
  }
}
