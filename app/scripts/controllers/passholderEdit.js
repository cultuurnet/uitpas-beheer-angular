'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderEditController
 * @description
 * # PassholdereditController
 * Controller of the uitpasbeheerApp
 */
angular.module('uitpasbeheerApp')
  .controller('PassholderEditController', PassholderEditController);

/* @ngInject */
function PassholderEditController (passholder, identification, $modalInstance, passholderService, eIDService, isJavaFXBrowser, $rootScope, $scope) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.disableInszNumber = (passholder.inszNumber) ? true : false;
  controller.formSubmitBusy = false;
  controller.formAlert = undefined;
  controller.eIDData = {};
  controller.eIDError = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;

  controller.submitForm = function(passholder, editForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if(editForm.$valid) {
        // Remove the email value if the no email checkbox is checked.
        if (((editForm || {}).allowNoEmail || {}).$viewValue) {
          editForm.email.$setViewValue('');
        }

        var updateOk = function() {
          $modalInstance.close();
        };
        var updateFailed = function(e) {
          if (e.apiError.code === 'INSZ_ALREADY_USED') {
            editForm.inszNumber.$error.inUse = true;
            editForm.inszNumber.$invalid = true;
          }
          if (e.apiError.code === 'EMAIL_ALREADY_USED') {
            editForm.email.$error.inUse = true;
            editForm.email.$invalid = true;
          }
          if (e.apiError.code === 'ACTION_NOT_ALLOWED') {
            controller.formAlert = {
              message: 'Actie niet toegestaan.',
              type: 'danger'
            };
          } else {
            controller.formAlert = undefined;
          }
          controller.formSubmitBusy = false;
        };

        passholderService
          .update(passholder, identification)
          .then(updateOk, updateFailed);
      }
    } else {
      controller.formSubmitBusy = false;
    }
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
      controller.eIDError = 'Het rijksregisternummer van de e-id verschilt van het rijksregisternummer dat beschikbaar is in de UiTPAS databank.';
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
