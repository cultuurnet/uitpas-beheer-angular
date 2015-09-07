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
  $modalInstance,
  counterService,
  $stateParams,
  RegistrationAPIError,
  $rootScope,
  $scope
) {
  /*jshint validthis: true */
  var controller = this;
  var kansenstatuutInfo = $stateParams.kansenstatuut;

  controller.pass = pass;
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

  controller.showFieldError = function (form, field) {
    var hasErrors = false;

    function steppedTo() {
      return controller.getStepNumber() <= controller.furthestStep;
    }

    if (form[field]) {
      hasErrors = (form.$submitted || form[field].$touched || steppedTo()) && form[field].$invalid;
    }

    return hasErrors;
  };

  controller.submitPersonalDataForm = function(personalDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      controller.updateFurthestStep();
      if (personalDataForm.$valid) {
        var setInszNumberError = function () {
          personalDataForm.inszNumber.$setValidity('inUse', false);
          controller.formSubmitBusy = false;
        };

        var continueRegisterProcess = function () {
          controller.refreshUnreducedPriceInfo();
          $state.go('counter.main.register.form.contactData');
          controller.formSubmitBusy = false;
        };

        passholderService
          .findPassholder(personalDataForm.inszNumber.$viewValue)
          .then(setInszNumberError, continueRegisterProcess);
      } else {
        controller.formSubmitBusy = false;
      }
    }
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

  controller.submitContactDataForm = function(contactDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (contactDataForm.$valid) {
        controller.updateFurthestStep(3);
        $state.go('counter.main.register.form.price');
        controller.formSubmitBusy = false;
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.submitPriceForm = function(priceFormData) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      controller.updateFurthestStep();
      if (priceFormData.$valid) {
        controller.submitRegistration();
        controller.formSubmitBusy = false;
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.refreshUnreducedPriceInfo = function () {
    var updateUnreducedPriceInfo = function (priceInfo) {
      var unreducedPrice = priceInfo.price;

      controller.unreducedPrice = unreducedPrice;

      if (controller.price === -1) {
        controller.price = unreducedPrice;
      }
    };

    counterService
      .getRegistrationPriceInfo(pass, controller.passholder)
      .then(updateUnreducedPriceInfo);
  };

  controller.submitRegistration = function () {

    var handleRegistrationErrors = function (error) {
      var knownAPIError = RegistrationAPIError[error.code];
      var step = 'personalData';

      if (knownAPIError) {
        error.cleanMessage = knownAPIError.message;
        step = knownAPIError.step;
      } else {
        error.cleanMessage = error.message.split('URL CALLED')[0];
      }

      controller.asyncError = error;
      controller.formSubmitBusy = false;
      $state.go('counter.main.register.form.' + step);
    };

    var showRegisteredPassholder = function (passholder) {
      $modalInstance.close(passholder);
    };

    controller.formSubmitBusy = true;
    passholderService
      .register(pass, controller.passholder, controller.voucherNumber, kansenstatuutInfo)
      .then(showRegisteredPassholder, handleRegistrationErrors);
  };

  controller.emailChanged = function () {
    if (controller.asyncError && controller.asyncError.code === 'EMAIL_ALREADY_USED') {
      controller.asyncError = undefined;
    }
  };

  controller.close = function () {
    $modalInstance.dismiss('registration modal closed');
  };

  var stateChangeStartListener = $rootScope.$on('$stateChangeStart', controller.updateFurthestStep);

  $scope.$on('$destroy', stateChangeStartListener);
}
