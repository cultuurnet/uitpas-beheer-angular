'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.search.controller:PassholderAdvancedSearchController
 * @description
 * # PassholderAdvancedSearchController
 * Controller of the ubr.passholder.search module.
 */
angular
  .module('ubr.passholder.search')
  .controller('PassholderAdvancedSearchController', PassholderAdvancedSearchController);

/* @ngInject */
function PassholderAdvancedSearchController (passholderService, SearchParameters) {
  /*jshint validthis: true */
  var controller = this;
  controller.invalidNumbers = [];
  controller.unfoundNumbers = [];
  controller.formSubmitBusy = false;
  controller.passNumbers = '0987654321012 0987654321013 0987654321014 0987654321015';
  controller.informedAboutUnfoundUitpasNumbers = false;

  function resemblesUitpasNumber(value) {
    /**
     * Matches strings containing exactly 13 digits.
     * @type {RegExp}
     */
    var resembleUitpasNumberRegex = /^\d{13}$/;
    return (resembleUitpasNumberRegex.exec(value));
  }

  controller.validateUitpasNumbers = function (givenUitpasNumbers) {
    var invalidNumbers = [];
    if (givenUitpasNumbers) {
      var givenNumbers = givenUitpasNumbers.split(' ');
      angular.forEach(givenNumbers, function (number) {
        if (!resemblesUitpasNumber(number)) {
          invalidNumbers.push(number);
        }
      });
    }

    controller.invalidNumbers = invalidNumbers;
    return (controller.invalidNumbers.length === 0);
  };

  controller.submitPassholderNumbersForm = function (form) {
    controller.formSubmitBusy = true;
    // Check if all provided numbers are in valid format.
    if (!controller.validateUitpasNumbers(controller.passNumbers)) {
      controller.formSubmitBusy = false;
      return;
    }

    var jsonSearchParameters = {};
    if (controller.passNumbers) {
      jsonSearchParameters.uitpasNumber = controller.passNumbers.split(' ');
    }

    var searchParameters = new SearchParameters(jsonSearchParameters);
    console.log(searchParameters);

    var doSomethingWithTheResults = function (resultResponse) {
      console.log(resultResponse);

      // Show the unknown uitpas numbers and ask to procede.

      // Show the result set.

    };

    var handleTheErrors = function (apiErrors) {
      console.log(apiErrors);
    };

    passholderService
      .searchPassholders(searchParameters)
      .then(doSomethingWithTheResults, handleTheErrors);

    console.log(form);
  };
}
