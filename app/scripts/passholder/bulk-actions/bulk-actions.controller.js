'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.bulk-actions.controller:BulkActionsController
 * @description
 * # BulkActionsController
 * Controller of the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .controller('BulkActionsController', BulkActionsController);

/* @ngInject */
function BulkActionsController (bulkSelection, passholderService, $uibModalInstance, $state) {
  var controller = this;
  controller.submitBusy = false;
  controller.isSubmitted = false;
  controller.bulkSelection = bulkSelection;
  var passholders = Array();
  var searchParameters = bulkSelection.searchParameters;
  var totalItems = bulkSelection.searchResults.totalItems;

  controller.findPassHoldersAgain = function(searchParameters) {
    passholderService
      .findPassholders(searchParameters)
      .then(
      function(PassholderSearchResults) {
        passholders = PassholderSearchResults.passen;
        for (var i = 0; i < passholders.length; i++) {
          passholders[i] = passholders[i].passholder;
        }
        controller.passholders = passholders;
      }
    );
  };

  controller.findPassHolderByNumber = function(passnumber, i) {
    passholderService.findPassholder(passnumber).then(
      function (passholder) {
        passholders[i] = passholder;
      }
    );
  };

  controller.checkSelectAll = function() {
    if (controller.bulkSelection.selectAll) {
      searchParameters.limit = totalItems;
      controller.findPassHoldersAgain(searchParameters);
    }
    else {
      for (var i = 0, len = bulkSelection.uitpasNumberSelection.length; i < len; i++) {
        controller.findPassHolderByNumber(controller.bulkSelection.uitpasNumberSelection[i], i);
      }
      controller.passholders = passholders;
    }
  };

  controller.checkSelectAll();

  controller.submitForm = function(passholders, bulkAddressForm, bulkSelection) {
    controller.isSubmitted = true;
    if(bulkAddressForm.$valid) {
      if (!controller.submitBusy) {
        controller.submitBusy = true;
        $state.go('counter.main.advancedSearch.showBulkResults', { passholders: passholders, bulkAddressForm: bulkAddressForm, bulkSelection: bulkSelection });
        controller.submitBusy = false;
      }
    }
  };

  controller.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}
