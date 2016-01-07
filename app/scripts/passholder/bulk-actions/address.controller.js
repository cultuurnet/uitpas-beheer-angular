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
function AddressBulkController (bulkSelection, advancedSearchService, passholderService, $uibModalInstance) {
  var controller = this;
  controller.submitBusy = false;
  controller.bulkSelection = bulkSelection;
  var searchParameters = bulkSelection.searchParameters;
  var totalItems = bulkSelection.searchResults.totalItems;

  if (bulkSelection.selectAll) {
    searchParameters.limit = totalItems;
    findPassHoldersAgain(searchParameters);
  }
  else {
    var passnumbers = bulkSelection.uitpasNumberSelection;
  }


  controller.showSearchResults = function (searchResults) {
    controller.reloadedResults = searchResults;
  };

  function findPassHoldersAgain(searchParameters) {
    advancedSearchService
      .findPassholders(searchParameters)
      .finally(controller.showSearchResults);
  }

  function updatePassHolder(bulkAddressForm, passnumber){
    passholderService.findPassholder(passnumber).then(
      function (passholder) {
        passholder.address.city = bulkAddressForm.city.$viewValue;
        passholder.address.postalCode = bulkAddressForm.zip.$viewValue;
        passholder.address.street = bulkAddressForm.street.$viewValue;
        passholderService.update(passholder, passnumber);
      }
    );
  }

  controller.submitForm = function(bulkAddressForm) {
    if (!controller.submitBusy) {

      /*var street =;
      var zip =;
      var city = ;*/

      controller.submitBusy = true;
      for (var i = 0, len = passnumbers.length; i < len; i++) {
        updatePassHolder(bulkAddressForm, passnumbers[i]);
      }
    }
  };

  this.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}