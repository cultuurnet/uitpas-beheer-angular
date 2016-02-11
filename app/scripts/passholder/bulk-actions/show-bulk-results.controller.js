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

function ShowBulkResultsController(passholders, bulkForm, action, passholderService, $uibModalStack, activeCounter, moment) {
  var controller = this;
  var errorCode;
  controller.submitBusy = true;
  controller.passholders = passholders;
  controller.activeCounter = activeCounter;

  controller.updatePassHolderAddress = function(passholder) {
    passholder.address.city = bulkForm.city.$viewValue;
    passholder.address.postalCode = bulkForm.zip.$viewValue;
    passholder.address.street = bulkForm.street.$viewValue;

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
            message: 'Pashouder werd niet geupdate op de server.',
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

  controller.renewPassholderKansenstatuut = function(passholder) {

    var updateOk = function() {
      passholder.updated = true;
      passholder.isChecked = true;
      passholder.failed = false;
    };

    var updateFailed = function(errorResponse) {
      passholder.updated = false;
      passholder.isChecked = true;
      passholder.failed = true;

      console.log(errorResponse);
      errorCode = errorResponse.data.code;

      switch (errorCode) {
        case 'KANSENSTATUUT_END_DATE_INVALID':
          passholder.asyncError = {
            message: 'Geen geldige einddatum voor kansenstatuut',
            type: 'danger'
          };
          break;

        default:
          passholder.asyncError = {
            message: 'Kansenstatuut werd niet geupdate op de server.',
            type: 'danger'
          };
      }
    };
    var kansenstatuut = passholder.getKansenstatuutByCardSystemID(activeCounter.cardSystems[1].id);
    var endDate = moment(bulkForm.endDate.$viewValue, 'DD-MM-YYYY').toDate();

    // Check if passholder has a kansenstatuut.
    if (kansenstatuut) {
      passholderService.renewKansenstatuut(passholder, kansenstatuut, endDate)
        .then(updateOk, updateFailed);
    }

    // Error handling if passholder has no kansenstatuut.
    else {
      passholder.updated = false;
      passholder.isChecked = true;
      passholder.failed = true;
      passholder.asyncError = {
        message: 'Pashouder heeft geen kansenstatuut.',
        type: 'danger'
      }
    }
  };

  angular.forEach(controller.passholders, function(passholder) {
    passholder.isChecked = false;
    passholder.updated = false;
    passholder.failed = false;
    switch (action) {
      case 'address':
        controller.updatePassHolderAddress(passholder);
        break;
      case 'kansenstatuut':
        controller.renewPassholderKansenstatuut(passholder);
        break;
    }
  });

  controller.cancel = function() {
    $uibModalStack.dismissAll();
  }
}
