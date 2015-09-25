'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name uitpasbeheerApp.TicketSaleAPIError
 * @description
 * # APIError
 * Possible API Errors that can happen when buying tickets.
 */
angular
  .module('uitpasbeheerApp')
  .constant('TicketSaleAPIError',
  /**
   * Enum for ticket sale API errors
   * @readonly
   * @enum {object}
   */
  {
    MAXIMUM_REACHED: {
      message: 'Er zijn onvoldoende tickets.'
    },
    UNKNOWN_EVENT_CDBID: {
      message: 'De activiteit waar je tickets voor wil kopen is niet geldig.'
    },
    UNKNOWN_PRICE_CLASS: {
      message: 'Het geselecteerde tarief is niet beschikbaar.'
    }
  });
