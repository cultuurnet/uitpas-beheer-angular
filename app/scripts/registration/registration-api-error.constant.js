'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name ubr.registration.RegistrationAPIError
 * @description
 * # RegistrationAPIError
 * API Error that can happen when registering a passholder.
 */
angular
  .module('ubr.registration')
  .constant('RegistrationAPIError',
  /**
   * Enum for registration API errors
   * @readonly
   * @enum {object}
   */
  {
    ACTION_FAILED: {
      message: 'Er heeft zich een fout voorgedaan. Probeer het later opnieuw.',
      step: 'personalData'
    },
    EMAIL_ALREADY_USED: {
      message: 'Het opgegeven e-mail adres is reeds in gebruik.',
      step: 'contactData'
    },
    EMAIL_ADDRESS_INVALID: {
      message: 'Het opgegeven e-mail adres is niet geldig.',
      step: 'contactData'
    },
    UNKNOWN_VOUCHER: {
      message: 'De opgegeven voucher bestaat niet.',
      step: 'price'
    },
    INVALID_VOUCHER_STATUS: {
      message: 'De opgegeven voucher is reeds gebruikt of is nog niet geldig.',
      step: 'price'
    },
    PARSE_INVALID_CITY_NAME: {
      message: 'De opgegeven stad is niet geldig.',
      step: 'personalData'
    },
    PARSE_INVALID_CITY_IDENTIFIER: {
      message: 'De opgegeven postcode is niet geldig',
      step: 'personalData'
    },
    PARSE_INVALID_VOUCHERNUMBER: {
      message: 'Het opgegeven voucher nummer is niet geldig.',
      step: 'price'
    },
    // TODO: Not sure about this one, possibly an error related to the kansenstatuut end date.
    PARSE_INVALID_DATE: {
      message: 'Een opgegeven datum is niet geldig',
      step: 'personalData'
    }
  });
