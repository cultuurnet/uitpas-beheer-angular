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
function RegistrationModalController (pass, $state, Passholder, passholderService, $modalInstance, counterService) {
  /*jshint validthis: true */
  var controller = this;

  controller.pass = pass;
  controller.formSubmitBusy = false;
  controller.price = 0;
  controller.priceModelOptions = {
    debounce: {
      'default': 500,
      'blur': 0
    }
  };
  controller.voucherNumber = '';

  var placeholder = {
    'name': {
      'first': 'Victor',
      'last': 'D\'Hooghe'
    },
    'address': {
      'street': 'Baanweg 60',
      'postalCode': '3000',
      'city': 'Aalst'
    },
    inszNumber: '99090900128',
    'birth': {
      'date': '1999-09-09',
      'place': 'Aalst'
    },
    'gender': 'MALE',
    'nationality': 'belg',
    'privacy': {
      'email': false,
      'sms': false
    },
    'contact': {
      'email': 'email@email.com'
    },
    'points': 309,
    'picture': 'picture-in-base64-format'
  };

  controller.passholder = new Passholder(placeholder);

  console.log(controller.passholder);

  controller.submitPersonalDataForm = function(personalDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (personalDataForm.$valid) {
        var setInszNumberError = function () {
          personalDataForm.inszNumber.$setValidity('inUse', false);
          controller.formSubmitBusy = false;
        };

        var continueRegisterProcess = function () {
          controller.passholder.name.first = personalDataForm.firstName.$viewValue;
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

  controller.submitContactDataForm = function(contactDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (contactDataForm.$valid) {
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
      if (priceFormData.$valid) {
        controller.submitRegistration();
        controller.formSubmitBusy = false;
      } else {
        controller.formSubmitBusy = false;

      }
    }
  };

  controller.refreshPriceInfo = function (voucherNumberFormState) {

    var updatePriceInfo = function (priceInfo) {
      controller.price = priceInfo.price;
      voucherNumberFormState.$setValidity('validVoucher', true);
    };

    var showError = function () {
      voucherNumberFormState.$setValidity('validVoucher', false);
      console.log(voucherNumberFormState);
    };

    counterService
      .getRegistrationPriceInfo(pass, controller.passholder, controller.voucherNumber)
      .then(updatePriceInfo, showError);
  };

  controller.submitRegistration = function () {

    var handleRegistrationErrors = function (error) {
      throw error;
    };

    var showRegisteredPassholder = function (passholder) {
      console.log(passholder);
    };

    passholderService
      .register(pass, controller.passholder, controller.voucherNumber)
      .then(showRegisteredPassholder, handleRegistrationErrors);
  };

  controller.contactDataFormPrevious = function () {
    $state.go('counter.main.register.form.personalData');
  };

  this.close = function () {
    $modalInstance.close('registration modal closed');
  };
}
