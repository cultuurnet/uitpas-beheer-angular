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

function ShowBulkResultsController(passholders, bulkForm, action, passholderService, activityService, $uibModalStack, activeCounter, activity, moment, $q, Queue) {
  var controller = this;
  var errorCode;
  var queue = new Queue(4);
  var queuedPassholders = Array();

  controller.submitBusy = true;
  controller.passholders = passholders;
  controller.activeCounter = activeCounter;
  controller.action = action;

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

  controller.passholderCheckin = function(activity, passholder) {
    passholder.isChecked = true;
    return activityService.checkin(activity, passholder);
  };

  controller.passholderClaimTariff = function(tariff, activity, passholder) {
    passholder.isChecked = true;
    return activityService.claimTariff(passholder, activity, tariff.prices[0]);
  };

  controller.updateOK = function (passholder) {
    return function() {
      passholder.updated = true;
      passholder.beingProcessed = false;
    };
  };

  controller.updateFailed = function(passholder, action) {
    return function(errorResponse) {
      passholder.failed = true;
      passholder.beingProcessed = false;
      var defaultMessage;
      if (action === 'address') {
        errorCode = errorResponse.code;
        defaultMessage = 'Pashouder werd niet geüpdatet op de server.';
      }
      else if (action === 'kansenstatuut') {
        errorCode = errorResponse.data.code;
        defaultMessage = 'Kansenstatuut werd niet geüpdatet op de server.';
      }
      else if (action == 'points') {
        errorCode = errorResponse.code;
        defaultMessage = 'Punt sparen niet gelukt.'
      }

      switch (errorCode) {
        case 'ACTION_NOT_ALLOWED':
          passholder.asyncError = {
            message: 'Actie niet toegestaan.',
            type: 'danger'
          };
          break;

        case 'PASSHOLDER_NOT_UPDATED_ON_SERVER':
          if (errorResponse.apiError && errorResponse.apiError.code === 'PARSE_INVALID_POSTAL_CODE') {
            passholder.asyncError = {
              message: 'Geen geldige postcode voor het adres.',
              type: 'danger'
            };
          }
          else {
            passholder.asyncError = {
              message: 'Pashouder werd niet geüpdatet op de server.',
              type: 'danger'
            };
          }
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

        case 'INVALID_CARD_STATUS':
          passholder.asyncError = {
            message: 'Punt sparen niet gelukt kaart geblokkeerd.',
            type: 'danger'
          };
          break;

        case 'KANSENSTATUUT_EXPIRED':
          passholder.asyncError = {
            message: 'Punt sparen niet gelukt kansenstatuut vervallen.',
            type: 'danger'
          };
          break;

        case 'MAXIMUM_REACHED':
          passholder.asyncError = {
            message: 'Punt al gespaard.',
            type: 'danger'
          };
          break;

        default:
          passholder.asyncError = {
            message: defaultMessage,
            type: 'danger'
          };
      }
    };
  };

  /**
   *
   * Helper function to filter out the passholders without a kansenstatuut.
   * Otherwise the queue doesn't work anymore because it doesn't always return
   * a promise.
   *
   */
  controller.prepareKansenstatuutPassholdersForQueue = function() {
    var passholdersWithKansenStatuut = Array();

    angular.forEach(controller.passholders, function(passholder, key) {
      var kansenstatuut = passholder.getKansenstatuutByCardSystemID(activeCounter.cardSystems[1].id);

      if (kansenstatuut) {
        passholder.kansenstatuut = kansenstatuut;
        passholdersWithKansenStatuut.push(passholder);
      }
      else {
        controller.passholders[key].isChecked = true;
        controller.passholders[key].beingProcessed = false;
        controller.passholders[key].updated = false;
        controller.passholders[key].failed = true;
        controller.passholders[key].asyncError = {
          message: 'Pashouder heeft geen kansenstatuut.',
          type: 'danger'
        };
      }
    });
    return passholdersWithKansenStatuut;
  };

  if (action == 'kansenstatuut') {
    queuedPassholders = controller.prepareKansenstatuutPassholdersForQueue();
  }
  else {
    queuedPassholders = controller.passholders;
  }

  angular.forEach(queuedPassholders, function(passholder) {
    var job = function() {
      var deferred = $q.defer();
      passholder.isChecked = false;
      passholder.updated = false;
      passholder.failed = false;
      passholder.beingProcessed = false;
      var callbackSuccess = function() {
        deferred.resolve(passholder);
        controller.updateOK(passholder).apply(this, arguments);
      };
      var callbackFail = function() {
        deferred.reject(passholder, action);
        controller.updateFailed(passholder, action).apply(this, arguments);
      };
      switch (action) {
        case 'address':
          passholder.beingProcessed = true;
          controller.updatePassHolderAddress(passholder).then(callbackSuccess, callbackFail);
          break;
        case 'kansenstatuut':
          passholder.beingProcessed = true;
          controller.renewPassholderKansenstatuut(passholder, passholder.kansenstatuut).then(callbackSuccess, callbackFail);
          break;
        case 'points':
          passholder.beingProcessed = true;
          controller.passholderCheckin(activity, passholder)
            .then(callbackSuccess, callbackFail);
          break;
        case 'tariffs':
          controller.passholderClaimTariff(tariff, activity, passholder)
            .then(callbackSuccess, callbackFail);
      }
      return deferred.promise;
    };
    queue.enqueue(job);
  });
  queue.startProcessingQueue();

  controller.cancel = function() {
    $uibModalStack.dismissAll('bulkResultsClosed');
  };
}
