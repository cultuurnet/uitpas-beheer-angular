'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.bulk-actions.controller:AddressBulkController
 * @description
 * # AddressBulkController
 * Controller of the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .controller('AddressBulkController', AddressBulkController);

/* @ngInject */
function AddressBulkController (bulkSelection, passholderService, $uibModalInstance, $state) {
  var controller = this;
  controller.submitBusy = false;
  controller.isSubmitted = false;
  controller.bulkSelection = bulkSelection;
  var passholders = Array();
  var searchParameters = bulkSelection.searchParameters;
  var totalItems = bulkSelection.searchResults.totalItems;

  if (controller.bulkSelection.selectAll) {
    searchParameters.limit = totalItems;
    findPassHoldersAgain(searchParameters);
  }
  else {
    for (var i = 0, len = bulkSelection.uitpasNumberSelection.length; i < len; i++) {
      findPassHolderByNumber(controller.bulkSelection.uitpasNumberSelection[i], i);
    }
    controller.passholders = passholders;
  }

  function findPassHoldersAgain(searchParameters) {
    passholderService
      .findPassholders(searchParameters)
      .then(
        function(PassholderSearchResults) {
          passholders = PassholderSearchResults.passen;
          for (i = 0, len = passholders.length; i < len; i++) {
            passholders[i] = passholders[i].passholder;
          }
          controller.passholders = passholders;
        }
      );
  }

  function findPassHolderByNumber(passnumber, i) {
    passholderService.findPassholder(passnumber).then(
      function (passholder) {
        passholders[i] = passholder;
      }
    );
  }

  controller.submitForm = function(passholders, bulkAddressForm) {
    controller.isSubmitted = true;
    if(bulkAddressForm.$valid) {
      if (!controller.submitBusy) {
        controller.submitBusy = true;
        $state.go('counter.main.advancedSearch.bulkAddress.results', { passholders: passholders, bulkAddressForm: bulkAddressForm });
        controller.submitBusy = false;
      }
    }
  };

  this.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}