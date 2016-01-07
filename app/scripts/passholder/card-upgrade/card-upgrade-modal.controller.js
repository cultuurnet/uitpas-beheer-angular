'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.controller:UpgradeModalController
 * @description
 * # UpgradeModalController
 * UiTPASBeheer passholder controller
 */
angular
  .module('ubr.passholder.cardUpgrade')
  .controller('UpgradeModalController', UpgradeModalController);

/* @ngInject */
function UpgradeModalController (
  pass,
  $state,
  passholderService,
  $uibModalInstance,
  counterService,
  $stateParams,
  RegistrationAPIError,
  $rootScope,
  $scope,
  $q,
  activeCounter,
  moment,
  cardSystem
) {
  /*jshint validthis: true */
  var controller = this;
  var kansenstatuutInfo = $stateParams.kansenstatuut;

  controller.pass = pass;
  controller.passholder = pass.passholder;
  controller.cardSystem = cardSystem;
  console.log(cardSystem);

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

  controller.activeCounter = activeCounter;
  controller.upgradeData = {
    withKansenstatuut: 'NO_KANSENSTATUUT',
    kansenstatuutEndDate: moment().endOf('year').toDate(),
    includeKansenStatuutRemarks: false,
    kansenstatuutRemarks: '',
    withNewCard: 'NO_NEW_CARD'
  };

  controller.showModalFlowForCardSystem = function(cardSystem) {
    // Determine the first step by counter permissions.
    if (controller.activeCounter.isAuthorisedRegistrationCounter(cardSystem.id)) {
      controller.modalFlow = 'AUTHORIZED_COUNTER';
    }
    else {
      controller.modalFlow = 'UNAUTHORIZED_COUNTER';
    }
  };

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

  controller.submitKansenstatuutForm = function(kansenstatuutForm) {

    function validateKansenstatuut() {
      controller.updateFurthestStep();
      if (kansenstatuutForm.$valid) {
        var continueUpgradeProcess = function () {
          /*
          controller
            .refreshUnreducedPriceInfo()
            .then(function () {//*/
              controller.formSubmitBusy = false;

              if (!controller.asyncError) {
                $state.go('counter.main.passholder.upgrade.newCard');
              }
            //});
        };

        /*
        passholderService
          .findPassholder(kansenstatuutForm.inszNumber.$viewValue)
          .then(setInszNumberError, continueUpgradeProcess);//*/
        continueUpgradeProcess();
      } else {
        controller.formSubmitBusy = false;
      }
    }

    controller
      .startSubmit(kansenstatuutForm)
      .then(validateKansenstatuut);
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
          controller.updateFurthestStep(3);
          $state.go('counter.main.register.form.price');
          controller.formSubmitBusy = false;
        } else {
          controller.formSubmitBusy = false;
        }
      });
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
      .getRegistrationPriceInfo(pass, controller.passholder, '', 'CARD_UPGRADE')
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

    controller.formSubmitBusy = true;
    passholderService
      .register(pass, passholderData, controller.voucherNumber, kansenstatuutInfo)
      .then(showRegisteredPassholder, controller.handleAsyncError)
      .finally(controller.unlockForm);
  };

  controller.clearAsyncError = function (errorCode) {
    if (controller.asyncError && controller.asyncError.code === errorCode) {
      controller.asyncError = undefined;
    }
  };

  controller.emailChanged = function () {
    controller.clearAsyncError('EMAIL_ALREADY_USED');
    controller.clearAsyncError('EMAIL_ADDRESS_INVALID');
  };

  controller.postalCodeChanged = function () {
    controller.clearAsyncError('PARSE_INVALID_CITY_IDENTIFIER');
  };

  controller.close = function () {
    $uibModalInstance.dismiss('registration modal closed');
  };

  var stateChangeStartListener = $rootScope.$on('$stateChangeStart', controller.updateFurthestStep);

  $scope.$on('$destroy', stateChangeStartListener);
}
