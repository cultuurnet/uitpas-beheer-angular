'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.filter:phoneNumber
 * @description
 * # phoneNumberFilter
 * Filter to format a phone number.
 */
angular
  .module('ubr.utilities')
  .filter('phoneNumber', phoneNumberFilter);

function phoneNumberFilter() {
  return function(input) {
    if (PhoneFormat.isValidNumber(input, 'BE')) {
      return PhoneFormat.formatLocal('BE', input);
    }
    else {
      return input;
    }
  };
}
