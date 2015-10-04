'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.Pass
 * @description
 * # Pass factory
 * Factory in the passbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .factory('Pass', passFactory);

/* @ngInject */
function passFactory(Passholder, $http, appConfig) {
  /**
   * @class Pass
   * @constructor
   * @param {object}  jsonPass
   */
  var Pass = function (jsonPass) {
    this.parseJson(jsonPass);
  };

  Pass.prototype = {
    parseJson: function (jsonPass) {
      this.number = jsonPass.uitPas.number;
      this.kansenStatuut = jsonPass.uitPas.kansenStatuut;
      this.status = jsonPass.uitPas.status;
      this.type = jsonPass.uitPas.type;

      if (jsonPass.passHolder) {
        this.passholder = new Passholder(jsonPass.passHolder);
        this.passholder.passNumber = this.number;
      }

      if(jsonPass.group) {
        this.group = {
          passNumber: this.number,
          name: jsonPass.group.name,
          availableTickets: jsonPass.group.availableTickets
        };
      }

      if (jsonPass.uitPas.cardSystem) {
        this.cardSystem = {
          id: jsonPass.uitPas.cardSystem.id,
          name: jsonPass.uitPas.cardSystem.name || 'kaart-systeem'
        };
      }
    },
    isKansenstatuut: function () {
      return this.kansenStatuut ? true : false;
    },
    isBlocked: function() {
      return this.status === 'BLOCKED';
    },
    isLocalStock: function() {
      return this.status === 'LOCAL_STOCK';
    },
    getPrice: function(reason, passholder, voucher) {
      var params = {
        reason: reason,
        date_of_birth: moment(passholder.birth.date).format('YYYY-MM-DD')
      };

      if (voucher) params['voucher_number'] = voucher;

      return $http.get(appConfig.apiUrl + 'uitpas/' + this.number + '/price', {
        params: params
      });
    }
  };

  return (Pass);
}
