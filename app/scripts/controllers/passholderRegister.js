'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderRegisterController
 * @description
 * # PassholderRegisterController
 * Controller of the uitpasbeheerApp
 */
angular.module('uitpasbeheerApp')
  .controller('PassholderRegisterController', PassholderRegisterController);

/* @ngInject */
function PassholderRegisterController (pass, $state, Passholder, passholderService) {
  /*jshint validthis: true */
  var controller = this;
  controller.pass = pass;
  controller.formSubmitBusy = false;

  controller.startPassholderRegistration = function() {
    pass.passholder = new Passholder({
      name: {
        first: '',
        last: ''
      },
      address: '',
      birth: {
        date: '',
        place: ''
      },
      inszNumber: '',
      picture: '',
      gender: '',
      nationality: '',
      privacy: '',
      contact: '',
      points: ''
    });
    $state.go(
      'counter.main.register.personalData',
      {
        pass: pass
      }
    );
  };

  controller.submitPersonalDataForm = function(personalDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (personalDataForm.$valid) {
        var setInszNumberError = function () {
          console.log('insz in use');
          personalDataForm.inszNumber.$setValidity('inUse', false);
          controller.formSubmitBusy = false;
        };

        var continueRegisterProcess = function () {
          pass.passholder.name.first = personalDataForm.firstName.$viewValue;
          $state.go(
            'counter.main.register.contactData',
            {
              pass: pass
            }
          );
        };

        passholderService.findPassholder(personalDataForm.inszNumber.$viewValue).then(
          setInszNumberError,
          continueRegisterProcess
        );
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.submitContactDataForm = function(contactDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (contactDataForm.$valid) {
        // Check if the email value is already in use.
        console.log(pass.passholder);
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.contactDataFormPrevious = function () {
    $state.go(
      'counter.main.register.personalData',
      {
        pass: pass
      }
    );
  };
}
