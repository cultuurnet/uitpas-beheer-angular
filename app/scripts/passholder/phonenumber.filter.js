/**
 * Created by stijnswaanen on 28/10/15.
 */
'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.filter:phoneNumber
 * @description
 * # phoneNumberFilter
 * Filter to format a phone number.
 */
angular
  .module('ubr.passholder')
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