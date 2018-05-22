'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.controller:PassholderEditController
 * @description
 * # PassholdereditController
 * Controller of the ubr.passholder module.
 */
angular.module('ubr.passholder')
  .controller('PassholderEditController', PassholderEditController);

/* @ngInject */
function PassholderEditController (passholder, identification, $uibModalInstance, passholderService, eIDService, isJavaFXBrowser, $rootScope, $scope) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.disableInszNumber = (passholder.inszNumber) ? true : false;
  controller.formSubmitBusy = false;
  controller.asyncError = null;
  controller.eIDData = {};
  controller.eIDError = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;
  controller.excludeEmail = passholder.contact.email ? false : true;

  // Create a masked InszNumber to show in form instead of the existing value.
  controller.maskedInsz = (passholder.inszNumber) ? passholder.inszNumber.substring(0, 2) + ' ... ' + passholder.inszNumber.substring(passholder.inszNumber.length - 2) : '';

  controller.submitForm = function(editForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      editForm.$setSubmitted();
      if(editForm.$valid) {
        var passholder = angular.copy(controller.passholder);

        var updateOk = function(updatedPassholder) {
          $rootScope.$emit('passholderUpdated', updatedPassholder);
          $uibModalInstance.close();
        };

        var updateFailed = function(errorResponse) {
          var errorCode = errorResponse.apiError.code;
          // clear any previous async errors
          controller.asyncError = null;

          if (errorCode === 'INSZ_ALREADY_USED') {
            editForm.inszNumber.$error.inUse = true;
            editForm.inszNumber.$invalid = true;
          }
          if (errorCode === 'EMAIL_ALREADY_USED') {
            editForm.email.$error.inUse = true;
            editForm.email.$invalid = true;
          }
          if (errorCode === 'ACTION_NOT_ALLOWED') {
            controller.asyncError = {
              message: 'Actie niet toegestaan.',
              type: 'danger'
            };
          }
          if (errorCode === 'EMAIL_ADDRESS_INVALID') {
            editForm.email.$setValidity('formatAsync', false);
          }
          if (errorCode === 'PASSHOLDER_NOT_UPDATED_ON_SERVER') {
            controller.asyncError = {
              message: errorResponse.apiError.message,
              type: 'danger'
            };
          }
          if (errorCode === 'PARSE_INVALID_POSTAL_CODE') {
            editForm.postalCode.$setValidity('formatAsync', false);
          }

          controller.formSubmitBusy = false;
        };

        if (controller.excludeEmail) {
          passholder.contact.email = '';
        }

        passholderService
          .update(passholder, identification)
          .then(updateOk, updateFailed);
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.removeAsyncError = function (form, field) {
    form[field].$setValidity('formatAsync', true);
  };

  controller.getDataFromEID = function() {
    eIDService.getDataFromEID();
  };

  controller.cancelModal = function() {
    $uibModalInstance.dismiss();
  };

  /**
   * Uncheck mail opt-in's when "exclude email" is checked.
   */
  controller.excludeMailToggle = function() {
    if (controller.excludeEmail) {
      controller.passholder.contact.email = '';
      controller.passholder.optInPreferences.serviceMails = false;
      controller.passholder.optInPreferences.milestoneMails = false;
      controller.passholder.optInPreferences.infoMails = false;
    }
  };

  /**
   * Uncheck mail opt-in's when "exclude email" is checked.
   */
  controller.mailChange = function() {
    if (!controller.passholder.contact.email) {
      controller.passholder.optInPreferences.serviceMails = false;
      controller.passholder.optInPreferences.milestoneMails = false;
      controller.passholder.optInPreferences.infoMails = false;
    }
  };

  var cleanupEIDDataReceivedListener = $rootScope.$on('eIDDataReceived', function(event, eIDData) {
    angular.merge(controller.eIDData, eIDData);

    if (controller.disableInszNumber && controller.passholder.inszNumber !== eIDData.inszNumber) {
      controller.eIDError = 'Het rijksregisternummer van de eID verschilt van het rijksregisternummer dat beschikbaar is in de UiTPAS databank.';
    } else {
      angular.merge(controller.passholder, eIDData);
      controller.eIDError = false;
    }
    $scope.$apply();
  });
  var cleanupEIDPhotoReceivedListener = $rootScope.$on('eIDPhotoReceived', function(event, base64Picture) {
    controller.eIDData.picture = base64Picture;
    controller.passholder.picture = base64Picture;
    $scope.$apply();
  });
  var cleanupEIDErrorReceivedListener = $rootScope.$on('eIDErrorReceived', function() {
    controller.eIDError = 'De eID kon niet gelezen worden. Controleer of de kaart goed in de lezer zit, of de lezer correct aangesloten is aan de pc.';
    $scope.$apply();
  });

  $scope.$on('$destroy', cleanupEIDDataReceivedListener);
  $scope.$on('$destroy', cleanupEIDPhotoReceivedListener);
  $scope.$on('$destroy', cleanupEIDErrorReceivedListener);
}
