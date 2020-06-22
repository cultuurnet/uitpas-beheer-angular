'use strict';

/**
 * @ngdoc function
 * @name ubr.registration.controller:RegistrationModalController
 * @description
 * # RegistrationModalController
 * UiTPASBeheer registration controller
 */
angular
  .module('ubr.registration')
  .controller('RegistrationModalController', RegistrationModalController);

/* @ngInject */
function RegistrationModalController (
  pass,
  $state,
  Passholder,
  passholderService,
  $uibModalInstance,
  counterService,
  $stateParams,
  RegistrationAPIError,
  $rootScope,
  $scope,
  $q,
  eIDService,
  isJavaFXBrowser,
  activeCounter,
  dataValidation
) {
  /*jshint validthis: true */
  var controller = this;
  var kansenstatuutInfo = $stateParams.kansenstatuut;
  var schoolInfo = $stateParams.school;
  var registerForeign = $stateParams.registerForeign;

  controller.registerForeign = registerForeign;
  controller.pass = pass;
  controller.existingPass = undefined;
  controller.formSubmitBusy = false;
  // Price is set to minus one to indicate it has not yet been initialized
  controller.price = -1;
  controller.unreducedPrice = -1;
  controller.priceModelOptions = {
    debounce: {
      'default': 500,
      'blur': 0
    }
  };
  controller.voucherNumber = '';
  controller.asyncError = undefined;
  controller.furthestStep = 0;

  controller.passholder = new Passholder();
  controller.isMemberOfCurrentBalie = false;
  controller.excludeEmail = false;
  controller.eIDData = {};
  controller.eIDError = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;
  controller.activeCounter = activeCounter;

  controller.noTermsSelected = false;
  controller.legalTermsDigital = false;
  controller.legalTermsPaper = false;
  controller.optInEmail = false;
  controller.parentalConsent = false;

  // Indicates if the current email address has already been validated
  controller.emailValidated = false;
  // Keep track of the (email) validation status (for spinner and "next" button).
  $scope.validating = false;

  controller.showFieldError = function (form, field) {
    var hasErrors = false;

    function steppedTo() {
      return controller.getStepNumber() <= controller.furthestStep;
    }

    if (form[field]) {
      hasErrors = (form.$submitted || form[field].$touched || form[field].$dirty || steppedTo()) && form[field].$invalid;
    }

    return hasErrors;
  };

  controller.submitPersonalDataForm = function() {
    if (controller.registerForeign) {
      controller.personalDataForm.city.$setViewValue('Buitenland');
    }
    function validatePersonalData() {
      controller.updateFurthestStep();
      if (controller.personalDataForm.$valid) {
        controller.asyncError = undefined;
        var continueRegisterProcess = function () {
          controller
              .refreshUnreducedPriceInfo()
              .then(function () {
                controller.formSubmitBusy = false;

                if (!controller.asyncError) {
                  $state.go('counter.main.register.form.contactData');
                }
              });
        };

        passholderService
            .findPass(controller.personalDataForm.inszNumber.$viewValue)
            .then(controller.setExistingInszNumberError, continueRegisterProcess);

      } else {
        controller.formSubmitBusy = false;
      }
    }

    controller
      .startSubmit(controller.personalDataForm)
      .then(validatePersonalData);
  };

  controller.getStepNumber = function () {
    return $state.current.stepNumber;
  };

  controller.updateFurthestStep = function (event, toState, toParams, fromState) {
    var stepNumber = fromState ? fromState.stepNumber : null;

    if (stepNumber && stepNumber > controller.furthestStep) {
      controller.furthestStep = stepNumber;
    }
  };

  controller.startSubmit = function (form) {
    var deferredStart = $q.defer();

    if (!controller.formSubmitBusy) {
      form.$setSubmitted();
      controller.formSubmitBusy = true;
      deferredStart.resolve();
    } else {
      deferredStart.reject('another form submit is already in progress');
    }

    return deferredStart.promise;
  };

  controller.submitContactDataForm = function(contactDataForm) {
    // Remove the email value if the no email checkbox is checked.
    if (controller.excludeEmail) {
      contactDataForm.email.$setViewValue('');
    }

    controller
      .startSubmit(contactDataForm)
      .then(function () {
        if (contactDataForm.$valid) {
          
          // Set certain opt-in options according to info received in contact step.
          controller.legalTermsDigital = controller.passholder.contact.email && !controller.passholder.isUnderAge() ? true : false;
          controller.passholder.optInPreferences.sms = controller.passholder.contact.sms ? true : false;

          if (!controller.passholder.contact.email) {
            controller.optInEmail = false;
          }

          // Email already validated or not required, go to the opt-in form
          if (controller.emailValidated || controller.excludeEmail) {
            controller.goToOptInForm();
          } else {
            // Validate email against the real-time email validation service
            $scope.validating = true;

            dataValidation.validateEmail(contactDataForm.email.$viewValue).then(function(validationResult) {
              switch (validationResult.grade) {
                case 'A+':
                case 'A':
                case 'B':
                  // Email grade is fine, continue to the next step
                  controller.goToOptInForm();
                  break;
                case 'D':
                  // Email has a bad grade, show the warning
                  // and set the flag that the address has already been validated
                  controller.emailValidated = true;
                  break;
                default:
                  // Stop and show error, block continue
                  contactDataForm.email.$setValidity('failedValidation', false);
                  contactDataForm.email.$error.failedValidation = true;
                  break;
              }

              $scope.validating = false;
              controller.formSubmitBusy = false;
            }, function(reason) {
              if (reason.status === 400) {
                // 400 response means the email parameter was not present
                // or the email address was malformed
                contactDataForm.email.$setValidity('failedValidation', false);
                contactDataForm.email.$error.failedValidation = true;
              } else {
                // Server error -> continue to next step
                controller.goToOptInForm();
              }

              $scope.validating = false;
              controller.formSubmitBusy = false;
            });
          }
        } else {
          controller.formSubmitBusy = false;
        }
      });
  };

  controller.goToOptInForm = function() {
    controller.updateFurthestStep(3);

    $scope.validating = false;
    controller.formSubmitBusy = false;

    $state.go('counter.main.register.form.optIns');
  };

  controller.submitOptInDataForm = function(optInDataForm) {
    function validateOptInData() {
      if (optInDataForm.$valid) {
        if (!controller.legalTermsPaper && !controller.legalTermsDigital) {
          controller.noTermsSelected = true;
          controller.formSubmitBusy = false;
        } else {
          // Convert the optInEmail field value to 3 separate opt-in email passholder properties.
          if (controller.optInEmail) {
            controller.passholder.optInPreferences.serviceMails = true;
            controller.passholder.optInPreferences.milestoneMails = true;
            controller.passholder.optInPreferences.infoMails = true;
          }

          controller.goToPriceForm();
        }
      } else {
        controller.formSubmitBusy = false;
      }
    }

    controller
      .startSubmit(optInDataForm)
      .then(validateOptInData);
  };

  controller.goToPriceForm = function() {
      controller.updateFurthestStep(4);
      $state.go('counter.main.register.form.price');
      controller.formSubmitBusy = false;
  };

  controller.submitPriceForm = function(priceDataForm) {
    controller
      .startSubmit(priceDataForm)
      .then(function () {
        controller.updateFurthestStep();
        if (priceDataForm.$valid) {
          controller.submitRegistration();
          controller.formSubmitBusy = false;
        } else {
          controller.formSubmitBusy = false;
        }
      });
  };

  controller.refreshUnreducedPriceInfo = function () {
    var deferredRefresh = $q.defer();
    var updateUnreducedPriceInfo = function (priceInfo) {
      var unreducedPrice = priceInfo.price;

      controller.unreducedPrice = unreducedPrice;

      if (controller.price === -1) {
        controller.price = unreducedPrice;
      }
    };

    counterService
      .getRegistrationPriceInfo(pass, controller.passholder, undefined, undefined, controller.registerForeign)
      .then(updateUnreducedPriceInfo, controller.handleAsyncError)
      .finally(deferredRefresh.resolve);

    return deferredRefresh.promise;
  };

  controller.handleAsyncError = function (error) {
    var knownAPIError = RegistrationAPIError[error.code];
    var step = 'personalData';

    if (knownAPIError) {
      error.cleanMessage = knownAPIError.message;
      step = knownAPIError.step;
    } else {
      error.cleanMessage = error.message.split('URL CALLED')[0];
    }

    controller.asyncError = error;
    $state.go('counter.main.register.form.' + step);
  };

  controller.unlockForm = function () {
    controller.formSubmitBusy = false;
  };

  controller.submitRegistration = function () {
    var showRegisteredPassholder = function (passholder) {
      $uibModalInstance.close(passholder);
    };

    var passholderData = angular.copy(controller.passholder);

    if (controller.excludeEmail) {
      passholderData.contact.email = '';
    }

    var termsInfo = {
      termsDigital: controller.legalTermsDigital,
      termsPaper: controller.legalTermsPaper,
      parentalConsent: controller.parentalConsent,
    };

    controller.formSubmitBusy = true;
    passholderService
      .register(pass, passholderData, controller.voucherNumber, kansenstatuutInfo, schoolInfo, termsInfo)
      .then(showRegisteredPassholder, controller.handleAsyncError)
      .finally(controller.unlockForm);
  };

  controller.clearAsyncError = function (errorCode) {
    if (controller.asyncError && controller.asyncError.code === errorCode) {
      controller.asyncError = undefined;
    }
  };

  controller.emailChanged = function (contactDataForm) {
    controller.clearAsyncError('EMAIL_ALREADY_USED');
    controller.clearAsyncError('EMAIL_ADDRESS_INVALID');

    // Empty the email field if it's excluded
    if (controller.excludeEmail) {
      controller.passholder.contact.email = '';
    }

    // Reset the email validation
    contactDataForm.email.$setValidity('failedValidation', true);
    contactDataForm.email.$error.failedValidation = false;

    // Reset the email validation flag
    controller.emailValidated = false;
  };

  controller.postalCodeChanged = function () {
    controller.clearAsyncError('PARSE_INVALID_POSTAL_CODE');
  };

  controller.postalCodePattern = controller.registerForeign ? '' : /^\d{4}$/;

  controller.getDataFromEID = function() {
    eIDService.getDataFromEID();
  };

  /**
   * Cancel the current registration.
   */
  controller.cancelRegistration = function () {
      $uibModalInstance.dismiss('registration modal cancelled');
      $state.go('counter.main.register');
  };

  /**
   * View the profile of given uitpasnumber.
   */
  controller.viewProfile = function ($uitpasNumber) {
      $uibModalInstance.dismiss('registration modal closed');
      $state.go('counter.main.passholder', {identification: $uitpasNumber});
  };

  /**
   * Start the upgrade for given uitpasnumber.
   */
  controller.upgradeCard = function ($uitpasNumber, $cardSystem) {
    $uibModalInstance.dismiss('registration modal closed');

    $state.go('counter.main.passholder.upgrade.newCard', {
      'pass': controller.existingPass,
      'identification' : $uitpasNumber,
      'cardSystem': $cardSystem }
    );
  };

  /**
   * Mark the current insz number as in use.
   * @param pass
   */
  controller.setExistingInszNumberError = function (pass) {
    controller.personalDataForm.inszNumber.$setValidity('inUse', false);
    controller.existingPass = pass;
    controller.isMemberOfCurrentBalie = false;

    angular.forEach(controller.activeCounter.cardSystems, function (cardSystem) {
      if (pass.passholder.isRegisteredInCardSystem(cardSystem)) {
        controller.isMemberOfCurrentBalie = true;
      }
    });

    controller.formSubmitBusy = false;
  };

  /**
   * Get the passholders picture, or return the default one.
   */
  controller.getPassholderPicture = function() {

    if (controller.existingPass.passholder.picture) {
      return controller.existingPass.passholder.getPictureSrc();
    }

    return 'images/default-picture.png';
  };

  /**
   * Get the list of balies where current user is connected with.
   */
  controller.currentMembershipList = function() {

    var names = [];
    for (var id in controller.existingPass.passholder.cardSystems) {
      names.push(controller.existingPass.passholder.cardSystems[id].name);
    }

    return names.join(', ');
  };

  var stateChangeStartListener = $rootScope.$on('$stateChangeStart', controller.updateFurthestStep);

  /**
   * Listener on the EID scanned event: Copy all data on the passholder.
   */
  var cleanupEIDDataReceivedListener = $rootScope.$on('eIDDataReceived', function(event, eIDData) {
    angular.merge(controller.eIDData, eIDData);
    angular.merge(controller.passholder, eIDData);
    controller.eIDError = false;
    $scope.$apply();
    passholderService
        .findPass(eIDData.inszNumber)
        .then(controller.setExistingInszNumberError);
  });

  var cleanupEIDPhotoReceivedListener = $rootScope.$on('eIDPhotoReceived', function(event, base64Picture) {
    controller.eIDData.picture = base64Picture;
    controller.passholder.picture = base64Picture;
    $scope.$apply();
  });

  var cleanupEIDErrorReceivedListener = $rootScope.$on('eIDErrorReceived', function() {
    controller.eIDError = 'De e-id kon niet gelezen worden. Controleer of de kaart goed in de lezer zit, of de lezer correct aangesloten is aan de pc.';
    $scope.$apply();
  });

  $scope.$on('$destroy', cleanupEIDDataReceivedListener);
  $scope.$on('$destroy', cleanupEIDPhotoReceivedListener);
  $scope.$on('$destroy', cleanupEIDErrorReceivedListener);
  $scope.$on('$destroy', stateChangeStartListener);
}
