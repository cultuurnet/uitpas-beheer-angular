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
    passholder.isChecked = true;

    return passholderService.update(passholder, passholder.passNumber);
  };

  controller.renewPassholderKansenstatuut = function(passholder, kansenstatuut) {
    passholder.isChecked = true;
    var endDate = moment(bulkForm.endDate.$viewValue, 'DD-MM-YYYY').toDate();

    return passholderService.renewKansenstatuut(passholder, kansenstatuut, endDate);
  };

  controller.updateOK = function (passholder) {
    return function(promise) {
      passholder.updated = true;
    }
  };

  controller.updateFailed = function(passholder, action) {
    return function(errorResponse) {
      passholder.failed = true;
      if (action == 'address') {
        errorCode = errorResponse.code;
        var defaultMessage = 'Pashouder werd niet geupdate op de server.'
      }
      else if (action == 'kansenstatuut') {
        errorCode = errorResponse.data.code;
        var defaultMessage = 'Kansenstatuut werd niet geupdate op de server.'
      }

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

        case 'KANSENSTATUUT_END_DATE_INVALID':
          passholder.asyncError = {
            message: 'Geen geldige einddatum voor kansenstatuut',
            type: 'danger'
          };
          break;

        case 'INVALID_DATE_CONSTRAINTS':
          passholder.asyncError = {
            message: 'Geen geldige datum voor kansenstatuut',
            type: 'danger'
          };
          break;

        default:
          passholder.asyncError = {
            message: defaultMessage,
            type: 'danger'
          };
      }
    }
  };

  angular.forEach(controller.passholders, function(passholder) {
    passholder.isChecked = false;
    passholder.updated = false;
    passholder.failed = false;
    var callbackSuccess = controller.updateOK(passholder);
    var callbackFail = controller.updateFailed(passholder, action);
    switch (action) {
      case 'address':
        controller.updatePassHolderAddress(passholder).then(callbackSuccess, callbackFail);
        break;
      case 'kansenstatuut':
        var kansenstatuut = passholder.getKansenstatuutByCardSystemID(activeCounter.cardSystems[1].id);

        // Check if passholder has a kansenstatuut.
        if (kansenstatuut) {
          controller.renewPassholderKansenstatuut(passholder, kansenstatuut).then(callbackSuccess, callbackFail);
        }
        // Error handling if passholder has no kansenstatuut.
        else {
          passholder.isChecked = true;
          passholder.updated = false;
          passholder.failed = true;
          passholder.asyncError = {
            message: 'Pashouder heeft geen kansenstatuut.',
            type: 'danger'
          }
        }
        break;
    }
  });

  controller.cancel = function() {
    $uibModalStack.dismissAll();
  }
}
