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

function ShowBulkResultsController(
  passholders,
  bulkForm,
  action,
  passholderService,
  activityService,
  $uibModalStack,
  activeCounter,
  activity,
  tariff,
  ticketCount,
  moment,
  $q,
  Queue
) {
  var controller = this;
  var errorCode;
  var queue = new Queue(4);
  var queuedPassholders = Array();

  controller.submitBusy = true;
  controller.passholders = passholders;
  controller.activeCounter = activeCounter;
  controller.action = action;
  controller.tariff = tariff;
  controller.totalAmount = 0;

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

  controller.passholderClaimTariff = function(passholder, activity, tariff, ticketCount) {
    passholder.isChecked = true;
    return activityService.claimTariff(passholder, activity, tariff, ticketCount);
  };

  controller.passholderBlock = function(passholder) {
    passholder.isChecked = true;
    return passholderService.blockPass(passholder.passNumber);
  };

  controller.getTotalAmount = function() {
    return controller.totalAmount;
  };

  controller.updateOK = function (passholder) {
    var defaultSuccessMessage = 'OK';

    // Set message and do extra logic, depending on bulk action.
    switch (action) {
      case 'address':
        passholder.successMessage = 'Adreswijziging gelukt';
        break;
      case 'kansenstatuut':
        passholder.successMessage = 'Verlenging kansenstatuut gelukt';
        break;
      case 'points':
        passholder.successMessage = 'Punten sparen gelukt';
        break;
      case 'tariffs':
        controller.totalAmount = controller.totalAmount + tariff.price;
        passholder.successMessage = 'Tarief registreren gelukt';
        break;
      case 'block':
        passholder.successMessage = 'Blokkeren gelukt';
        break;
      default:
        passholder.successMessage = defaultSuccessMessage;
        break;
    }

    return function() {
      passholder.updated = true;
      passholder.beingProcessed = false;
    };
  };

  controller.getTotalAmount = function() {
    return controller.totalAmount;
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
      else if (action == 'tariffs') {
        errorCode = errorResponse.code;
        defaultMessage = 'Tarief registreren niet gelukt.'
      }
      else if (action == 'block') {
        errorCode = errorResponse;
        defaultMessage = 'Kaart blokkeren niet gelukt.'
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
          if (action == 'points') {
            passholder.asyncError = {
              message: 'Punt sparen mislukt, kaart geblokkeerd.',
              type: 'danger'
            };
          }
          else if (action == 'tariffs') {
            passholder.asyncError = {
              message: 'Tarief registreren mislukt, kaart geblokkeerd.',
              type: 'danger'
            };
          }
          else if (action == 'block') {
            passholder.asyncError = {
              message: 'Kaart is reeds geblokkeerd.',
              type: 'danger'
            };
          }
          break;

        case 'KANSENSTATUUT_EXPIRED':
          passholder.asyncError = {
            message: 'Punt sparen niet gelukt kansenstatuut vervallen.',
            type: 'danger'
          };
          break;

        case 'MAXIMUM_REACHED':
          if (action == 'points') {
            passholder.asyncError = {
              message: 'Punt al gespaard.',
              type: 'danger'
            };
          }
          else if (action == 'tariffs') {
            passholder.asyncError = {
              message: 'Tarief reeds geregistreerd.',
              type: 'danger'
            };
          }
          break;

        case 'MISSING_PROPERTY':
          passholder.asyncError = {
            message: 'Prijsklasse ontbreekt.',
            type: 'error'
          };
          break;

        case 'INVALID_CARD': {
          passholder.asyncError = {
            message: 'Pashouder heeft geen kansenstatuut.',
            type: 'error'
          };
          break;
        }

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
      var kansenstatuut = passholder.getKansenstatuutByCardSystemID(activeCounter.getFirstCardSystem().id);

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
          passholder.beingProcessed = true;
          controller.passholderClaimTariff(passholder, activity, tariff, ticketCount)
            .then(callbackSuccess, callbackFail);
          break;
        case 'block':
          passholder.beingProcessed = true;
          controller.passholderBlock(passholder)
              .then(callbackSuccess, callbackFail);
          break;
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
