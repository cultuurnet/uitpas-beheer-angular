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
function PassholderEditController (passholder, identification, $modalInstance, passholderService, eIDService, isJavaFXBrowser, $rootScope, $scope) {
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

  controller.submitForm = function(editForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      editForm.$setSubmitted();
      if(editForm.$valid) {
        var passholder = angular.copy(controller.passholder);

        var updateOk = function(updatedPassholder) {
          $rootScope.$emit('passholderUpdated', updatedPassholder);
          $modalInstance.close();
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
            editForm.email.$error.formatAsync = true;
            editForm.email.$invalid = true;
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

  controller.emailChanged = function (form) {
    form.email.$setValidity('formatAsync', true);
  };

  controller.getDataFromEID = function() {
    eIDService.getDataFromEID();
  };

  controller.cancelModal = function() {
    $modalInstance.dismiss();
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
