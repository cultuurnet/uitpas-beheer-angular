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
  $rootScope,
  $scope,
  $q,
  activeCounter,
  moment,
  cardSystem
) {
  /*jshint validthis: true */
  var controller = this;

  controller.pass = pass;
  controller.passholder = pass.passholder;
  controller.cardSystem = cardSystem;

  controller.formSubmitBusy = false;
  controller.unreducedPrice = -1;
  controller.priceModelOptions = {
    debounce: {
      'default': 500,
      'blur': 0
    }
  };
  controller.asyncError = undefined;
  controller.furthestStep = 0;

  controller.activeCounter = activeCounter;
  controller.upgradeData = {
    passToCheck: angular.copy(pass),
    withKansenstatuut: 'NO_KANSENSTATUUT',
    kansenstatuutEndDate: moment('30/04/' + (moment().year() + 1), 'DD/MM/YYYY'),
    withNewCard: 'NO_NEW_CARD',
    uitpasNewNumber: '',
    upgradeReason: 'CARD_UPGRADE',
    // Price is set to minus one to indicate it has not yet been initialized
    price: -1,
    unreducedPrice: -1,
    voucherNumber: ''
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

  controller.showModalFlowForCardSystem(controller.cardSystem);

  // Helper functions.
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

  controller.getStepNumber = function () {
    return $state.current.stepNumber;
  };

  controller.updateFurthestStep = function (event, toState, toParams, fromState) {
    var stepNumber = fromState ? fromState.stepNumber : null;

    if (stepNumber && stepNumber > controller.furthestStep) {
      controller.furthestStep = stepNumber;
    }
  };

  controller.handleAsyncError = function (error) {
    error.cleanMessage = error.message.split('URL CALLED')[0];

    controller.asyncError = error;
  };

  controller.unlockForm = function () {
    controller.formSubmitBusy = false;
  };

  controller.clearAsyncError = function (errorCode) {
    if (controller.asyncError && controller.asyncError.code === errorCode) {
      controller.asyncError = undefined;
    }
  };

  controller.refreshUnreducedPriceInfo = function () {
    var deferredRefresh = $q.defer();
    var updateUnreducedPriceInfo = function (priceInfo) {
      var unreducedPrice = priceInfo.price;

      controller.upgradeData.unreducedPrice = unreducedPrice;

      if (controller.upgradeData.price === -1) {
        controller.upgradeData.price = unreducedPrice;
      }
    };

    if (controller.upgradeData.upgradeReason === 'CARD_UPGRADE') {
      counterService
        .getUpgradePriceInfo(controller.cardSystem.id, controller.passholder, '')
        .then(updateUnreducedPriceInfo, controller.handleAsyncError);
    }
    else {
      counterService
        .getRegistrationPriceInfo(controller.upgradeData.passToCheck, controller.passholder, '', 'EXTRA_CARD')
        .then(updateUnreducedPriceInfo, controller.handleAsyncError);
    }
    deferredRefresh.resolve();

    return deferredRefresh.promise;
  };

  controller.close = function () {
    $uibModalInstance.dismiss('card upgrade modal closed');
  };

  controller.passScanned = function (event, identification) {
    var useScannedPassNumber = function (newPass) {
      controller.formAlert = null;
      // Only set the number when a new card number is needed.
      if (controller.upgradeData.withNewCard === 'NEW_CARD') {
        controller.upgradeData.uitpasNewNumber = newPass.number;
        controller.newCardForm.uitpasNewNumber.$setDirty();
      }
    };

    var warnUserNoPassFound = function () {
      controller.formAlert = {
        message: 'De gescande UiTPAS kan niet gevonden worden.',
        type: 'danger'
      };
    };

    passholderService
      .findPass(identification)
      .then(useScannedPassNumber, warnUserNoPassFound);
  };

  // Submit functions.
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

  controller.submitKansenstatuutForm = function(kansenstatuutForm) {

    function validateKansenstatuut() {
      if (kansenstatuutForm.$valid) {
        controller
          .refreshUnreducedPriceInfo()
          .then(function () {
            if (controller.upgradeData.withKansenstatuut === 'KANSENSTATUUT') {
              controller.upgradeData.withNewCard = 'NEW_CARD';
            }
            controller.formSubmitBusy = false;

            if (!controller.asyncError) {
              $state.go('counter.main.passholder.upgrade.newCard');
            }
          });

      } else {
        controller.formSubmitBusy = false;
      }
    }

    controller
      .startSubmit(kansenstatuutForm)
      .then(validateKansenstatuut);
  };

  controller.submitNewCardForm = function(newCardForm) {
    controller
      .startSubmit(newCardForm)
      .then(function () {
        if (newCardForm.$valid) {
          controller
            .refreshUnreducedPriceInfo()
            .then(function () {
              // Use the new pass number to check on the API if there is a new card.
              if (controller.upgradeData.withNewCard === 'NEW_CARD') {
                controller.upgradeData.passToCheck = {
                  number: controller.upgradeData.uitpasNewNumber
                };
                // Set the correct reason for the check.
                controller.upgradeData.upgradeReason = 'EXTRA_CARD';
              }
              $state.go('counter.main.passholder.upgrade.price');

              controller.formSubmitBusy = false;
            });
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
          controller.submitUpgrade();
          controller.formSubmitBusy = false;
        } else {
          controller.formSubmitBusy = false;
        }
      });
  };

  controller.submitUpgrade = function () {
    var showUpgradedPassholder = function () {
      $uibModalInstance.close();

      $rootScope.$emit('membershipModified');
      $rootScope.$emit('selectedPass',
        controller.upgradeData.withNewCard === 'NEW_CARD' ? controller.upgradeData.uitpasNewNumber : controller.passholder.passNumber
      );
    };

    controller.formSubmitBusy = true;
    passholderService
      .addCardSystem(
        controller.passholder.passNumber,
        cardSystem.id,
        controller.upgradeData.voucherNumber,
        (controller.upgradeData.withKansenstatuut === 'KANSENSTATUUT') ? controller.upgradeData.kansenstatuutEndDate : null,
        (controller.upgradeData.withNewCard === 'NEW_CARD') ? controller.upgradeData.uitpasNewNumber : null
      )
      .then(showUpgradedPassholder, controller.handleAsyncError)
      .finally(controller.unlockForm);
  };

  // Listeners and functions.
  var nfcScanListener = $rootScope.$on('nfcNumberReceived', controller.passScanned);
  var stateChangeStartListener = $rootScope.$on('$stateChangeStart', controller.updateFurthestStep);

  $scope.$on('$destroy', nfcScanListener);
  $scope.$on('$destroy', stateChangeStartListener);
}
