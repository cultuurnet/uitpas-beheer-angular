'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name ubr.passholder.PassholderAPIError
 * @description
 * # APIError
 * Possible API Errors that can happen searching for passholders.
 */
angular
  .module('ubr.passholder')
  .constant('PassholderAPIError',
  /**
   * Enum for passholder API errors
   * @readonly
   * @enum {object}
   */
  {
    PARSE_INVALID_DATE: {
      message: 'De opgegeven datum is niet correct.'
    },
    PARSE_INVALID_UITPASNUMBER: {
      message: 'Alle opgegeven UiTPAS nummers zijn foutief.'
    },
    PARSE_INVALID_INSZ: {
      message: 'Het opgegeven rijksregisternummer is foutief.'
    },
    PARSE_INVALID_BOOLEAN: {
      message: 'Er is een verkeerde boolean waarde meegegeven.'
    },
    UNKNOWN_ASSOCIATION_ID: {
      message: 'De opgegeven vereniging is niet gekend.'
    },
    UNKNOWN_BALIE_NAME: {
      message: 'De gebruikte balie is niet gekend.'
    },
    UITPAS_NUMBER_INVALID: {
      message: 'Enkele UitPas nummers hebben een foutief checknummer.'
    }
  });
